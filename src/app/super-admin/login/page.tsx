'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { User } from '@/types';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('super.admin@edumanage.pro');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setError] = useState('');
  const router = useRouter();
  const { setUser, setLoading, logout, setAuthToken } = useAuthStore();
  
  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error
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
        // Create default super admin user data for JWT token
        const userData: User = {
          id: 'super-admin',
          email: 'super.admin@edumanage.pro',
          globalRole: 'SUPER_ADMIN',
          displayName: 'Super Administrator',
          emailVerified: true,
          associatedSchoolIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Set authenticated user and create JWT token
        await setAuthToken(userData);
        
        // Redirect to Super Admin dashboard
        router.push('/super-admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(error?.message || 'Login failed. Please try again');
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            School Management System Administration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your Super Administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientError && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{clientError}</AlertDescription>
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
                  <strong>Default Credentials:</strong><br />
                  Email: super.admin@edumanage.pro<br />
                  Password: SuperAdmin123!@#
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            For security reasons, please change the default password after first login.
          </p>
        </div>
      </div>
    </div>
  );
}
