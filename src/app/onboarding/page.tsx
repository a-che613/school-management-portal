'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-utils';
import { jwtVerify } from 'jose';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Import step components
import SchoolAdminStep1 from '@/components/onboarding/SchoolAdminStep1';
import SchoolAdminStep2 from '@/components/onboarding/SchoolAdminStep2';
import SchoolAdminStep3 from '@/components/onboarding/SchoolAdminStep3';
import SchoolAdminStep4 from '@/components/onboarding/SchoolAdminStep4';
import TeacherStep1 from '@/components/onboarding/TeacherStep1';
import TeacherStep2 from '@/components/onboarding/TeacherStep2';
import TeacherStep3 from '@/components/onboarding/TeacherStep3';

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const [role, setRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get userId from JWT token
  const getUserIdFromToken = async () => {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      const JWT_SECRET = new TextEncoder().encode('your-secret-key-change-in-production');
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload.uid as string;
    } catch (error) {
      console.error('Failed to verify token:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get full URL and parse search params
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      const stepParam = searchParams.get('step');
      
      if (!roleParam) {
        setError('Role parameter is required');
        setLoading(false);
        return;
      }

      setRole(roleParam);
      setCurrentStep(parseInt(stepParam || '1'));
      
      // Get userId from token
      getUserIdFromToken().then(id => {
        if (id) {
          setUserId(id);
        } else {
          setError('Authentication required');
        }
        setLoading(false);
      });
    }
  }, []);

  // Add effect to handle URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const stepParam = searchParams.get('step');
        setCurrentStep(parseInt(stepParam || '1'));
      }
    };

    // Initial check
    handleRouteChange();
  }, [pathname, refreshKey]);

  // Add polling to detect URL changes more reliably
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const stepParam = searchParams.get('step');
        const newStep = parseInt(stepParam || '1');
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentStep]);

  const handleStepComplete = (nextStep?: number) => {
    if (nextStep) {
      const newUrl = `/onboarding?role=${role}&step=${nextStep}`;
      router.push(newUrl);
      // Force re-render
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleOnboardingComplete = () => {
    // Redirect to appropriate dashboard
    if (role === 'school_admin') {
      router.push('/dashboard');
    } else if (role === 'teacher') {
      router.push('/dashboard');
    }
  };

  // Render appropriate step based on role and current step
  const renderStep = () => {
    if (!userId) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in again.
          </AlertDescription>
        </Alert>
      );
    }

    if (role === 'school_admin') {
      switch (currentStep) {
        case 1:
          return (
            <SchoolAdminStep1 
              onComplete={handleStepComplete}
              userId={userId}
            />
          );
        case 2:
          return (
            <SchoolAdminStep2 
              onComplete={handleStepComplete}
              userId={userId}
            />
          );
        case 3:
          return (
            <SchoolAdminStep3 
              onComplete={handleStepComplete}
              userId={userId}
            />
          );
        case 4:
          return (
            <SchoolAdminStep4 
              onComplete={handleOnboardingComplete}
              userId={userId}
            />
          );
        default:
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid step number for school admin onboarding
              </AlertDescription>
            </Alert>
          );
      }
    } else if (role === 'teacher') {
      switch (currentStep) {
        case 1:
          return (
            <TeacherStep1 
              onComplete={handleStepComplete}
              userId={userId}
            />
          );
        case 2:
          return (
            <TeacherStep2 
              onComplete={handleStepComplete}
              userId={userId}
            />
          );
        case 3:
          return (
            <TeacherStep3 
              onComplete={handleOnboardingComplete}
              userId={userId}
            />
          );
        default:
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid step number for teacher onboarding
              </AlertDescription>
            </Alert>
          );
      }
    }

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid role specified for onboarding
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error</h3>
            </div>
            <AlertDescription className="text-gray-600">
              {error}
            </AlertDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div key={refreshKey} className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
}
