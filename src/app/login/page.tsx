'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, School, ArrowLeft } from 'lucide-react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { setUser, setLoading, setAuthToken } = useAuthStore();
  
  const [
    signInWithEmailAndPassword,
    user,
    loading,
    firebaseError
  ] = useSignInWithEmailAndPassword(auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(email, password);
      
      if (result?.user) {
        // Get user data from Firestore to determine role and school
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: result.user.uid }),
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Set authenticated user and create JWT token
          await setAuthToken(userData);
          
          // Check onboarding status for non-super admin users
          if (userData.globalRole !== 'SUPER_ADMIN') {
            const onboardingResponse = await fetch('/api/user/onboarding-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uid: result.user.uid }),
            });

            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json();
              
              // Redirect to onboarding if needed
              if (onboardingData.mustChangePassword || !onboardingData.onboardingCompleted) {
                const role = userData.globalRole === 'SCHOOL_ADMIN' ? 'school_admin' : 'teacher';
                const step = onboardingData.onboardingStep || 1;
                window.location.href = `/onboarding?role=${role}&step=${step}`;
                return;
              }
            } else {
              const errorData = await onboardingResponse.json();
              console.error('Onboarding status check failed:', errorData);
              // Continue to dashboard if onboarding check fails (fallback)
            }
          }
          
          // Redirect based on user role
          if (userData.globalRole === 'SUPER_ADMIN') {
            window.location.href = '/superadmin';
          } else if (userData.globalRole === 'SCHOOL_ADMIN') {
            window.location.href = '/dashboard';
          } else if (userData.globalRole === 'TEACHER') {
            window.location.href = '/dashboard';
          } else {
            setError('Unauthorized access');
          }
        } else {
          setError('Failed to load user profile');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(firebaseError?.message || 'Login failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <School className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EduManage</h1>
            </div>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your school management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                <AlertDescription className="text-xs">
                  <strong>School Admin Login:</strong><br />
                  Use the credentials provided by the Super Admin to access your school dashboard.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Don't have an account?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
              Contact us to get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
