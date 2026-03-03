// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Shield, AlertCircle } from 'lucide-react';
// import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
// import { auth } from '@/lib/firebase';
// import { doc, setDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';

// export default function SetupPage() {
//   const [email, setEmail] = useState('super.admin@edumanage.pro');
//   const [password, setPassword] = useState('SuperAdmin123!@#');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const router = useRouter();
  
//   const [
//     signInWithEmailAndPassword,
//     user,
//     loading,
//     error: firebaseError
//   ] = useSignInWithEmailAndPassword(auth);

//   const handleSetup = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const result = await signInWithEmailAndPassword(email, password);
      
//       if (result?.user) {
//         // Create user profile in Firestore
//         await setDoc(doc(db, 'users', result.user.uid), {
//           uid: result.user.uid,
//           email: result.user.email,
//           displayName: 'Super Administrator',
//           globalRole: 'SUPER_ADMIN',
//           isActive: true,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });

//         setSuccess(true);
//         setTimeout(() => {
//           router.push('/super-admin/login');
//         }, 2000);
//       }
//     } catch (err: any) {
//       console.error('Setup error:', err);
//       setError(firebaseError?.message || 'Setup failed. Please try again');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-6">
//         <div className="text-center">
//           <div className="flex justify-center items-center space-x-2">
//             <Shield className="h-8 w-8 text-blue-600" />
//             <h1 className="text-2xl font-bold text-gray-900">Initial Setup</h1>
//           </div>
//           <p className="mt-2 text-sm text-gray-600">
//             Create the Super Administrator account
//           </p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-center">Create Super Admin</CardTitle>
//             <CardDescription className="text-center">
//               This will create the initial administrator account
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {error && (
//               <Alert className="border-red-200 bg-red-50 text-red-800">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert className="border-green-200 bg-green-50 text-green-800">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>
//                   Super admin account created successfully! Redirecting to login...
//                 </AlertDescription>
//               </Alert>
//             )}

//             <form onSubmit={handleSetup} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   required
//                   className="bg-white"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   required
//                   className="bg-white"
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading || success}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center space-x-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span>Creating Account...</span>
//                   </div>
//                 ) : (
//                   'Create Super Admin Account'
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
