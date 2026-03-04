import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log('Token found:', !!token);
    console.log('Token length:', token?.length);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log('JWT payload:', payload);
      
      if (!payload || !payload.uid) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      const { userId, currentPassword, newPassword } = await request.json();

      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        );
      }

      // Verify that the authenticated user matches the requested user
      if (payload.uid !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized: User ID mismatch' },
          { status: 403 }
        );
      }

    // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();
      const email = userData.email;

      try {
        // For now, we'll update the Firestore document and return success
        // In production, you would need Firebase Admin SDK to actually change the password
        // or implement a different approach for server-side password changes
        
        // Update user document to mark password change as complete
        await updateDoc(doc(db, 'users', userId), {
          mustChangePassword: false,
          password: newPassword, // Update password field
          loginPassword: newPassword, // Keep loginPassword for compatibility
          updatedAt: new Date(),
        });

        // Also update loginPassword in schools collection if user is associated with a school
        if (userData.schoolId) {
          console.log('Updating school:', userData.schoolId);
          const schoolDocRef = doc(db, 'schools', userData.schoolId);
          const schoolDoc = await getDoc(schoolDocRef);
          
          if (schoolDoc.exists()) {
            const schoolData = schoolDoc.data();
            console.log('School data:', schoolData);
            const currentAdmins = schoolData.admins || [];
            console.log('Current admins:', currentAdmins);
            
            // Only update if admins array exists and user is found in it
            if (currentAdmins.length > 0) {
              const updatedAdmins = currentAdmins.map((admin: any) => 
                admin.id === userId ? { ...admin, loginPassword: newPassword } : admin
              );
              console.log('Updated admins:', updatedAdmins);
              
              await updateDoc(schoolDocRef, {
                admins: updatedAdmins,
              });
            } else {
              console.log('No admins found in school document');
            }
          } else {
            console.log('School document not found');
          }
        }

        return NextResponse.json({
          message: 'Password change process completed. Note: Actual Firebase Auth password change requires Firebase Admin SDK setup.',
        });
      } catch (firebaseError: any) {
        console.error('Firestore error:', firebaseError);
        return NextResponse.json(
          { error: firebaseError.message || 'Failed to update password' },
          { status: 400 }
        );
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
