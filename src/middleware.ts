import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/contact', 
    '/superadmin/login',
    '/onboarding'
  ];
  
  // Super Admin routes
  const superAdminRoutes = ['/superadmin'];
  
  // Dashboard routes that require onboarding check
  const dashboardRoutes = ['/dashboard', '/school-admin', '/teacher'];
  
  // Check if the current path is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the current path requires Super Admin access
  if (superAdminRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Redirect to Super Admin login
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }

    try {
      // Verify the JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (!payload || payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/superadmin/login', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }
  }

  // Check dashboard routes for onboarding requirements
  if (dashboardRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check if user needs onboarding
      const response = await fetch(`${request.nextUrl.origin}/api/user/onboarding-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: payload.uid }),
      });

      if (response.ok) {
        const onboardingData = await response.json();
        
        // Redirect to onboarding if needed
        if (onboardingData.mustChangePassword || !onboardingData.onboardingCompleted) {
          const role = onboardingData.globalRole === 'SCHOOL_ADMIN' ? 'school_admin' : 'teacher';
          const onboardingUrl = `/onboarding?role=${role}&step=${onboardingData.onboardingStep || 1}`;
          return NextResponse.redirect(new URL(onboardingUrl, request.url));
        }
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('Onboarding check failed:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
