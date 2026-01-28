"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { validateEmail, validatePassword } from '../lib/validation';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextErrors: { [k: string]: string } = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required';

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) nextErrors.email = emailCheck.error || 'Invalid email';

    const passCheck = validatePassword(formData.password);
    if (!passCheck.valid) nextErrors.password = passCheck.error || 'Invalid password';

    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
      
      console.log('Signup successful:', userCredential.user);
      router.push('/profile');
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak'
        : err.message || 'Failed to create account';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign up successful:', result.user);
      router.push('/profile');
    } catch (err: any) {
      console.error('Google sign up error:', err);
      const errorMessage = err.code === 'auth/popup-closed-by-user'
        ? 'Sign up cancelled'
        : err.message || 'Failed to sign up with Google';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error for this field as user types
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-4 p-4">
      <Card className="w-full max-w-md gradient-card border-gradient backdrop-blur-sm shadow-gradient-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-display font-bold gradient-text">
            Get Started
          </CardTitle>
          <CardDescription className="text-sm font-sans">
            Create your account to begin your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.form && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="font-display text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 py-2 font-sans"
                  required
                />
              </div>
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="font-display text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 py-2 font-sans"
                  required
                />
              </div>
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="font-display text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 py-2 font-sans"
                  required
                />
              </div>
              {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password}</p> : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="font-display text-sm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 py-2 font-sans"
                  required
                />
              </div>
              {errors.confirmPassword ? <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p> : null}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full gradient-bg-primary text-primary-foreground font-display font-semibold shadow-gradient-md hover:shadow-gradient-lg transition-all duration-300 hover:scale-105"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 text-center text-sm font-sans">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold gradient-text hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-sans">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full mt-4 font-sans gradient-bg-secondary border-gradient hover:shadow-gradient-sm transition-all duration-300 hover:scale-105 hover:opacity-90"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
