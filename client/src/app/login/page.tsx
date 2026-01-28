"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { validateEmail, validatePassword } from '../lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextErrors: { [k: string]: string } = {};

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) nextErrors.email = emailCheck.error || 'Invalid email';

    const passCheck = validatePassword(formData.password);
    if (!passCheck.valid) nextErrors.password = passCheck.error || 'Invalid password';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('Login successful:', userCredential.user);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.code === 'auth/invalid-credential' 
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : err.message || 'Failed to sign in';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user);
      router.push('/');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const errorMessage = err.code === 'auth/popup-closed-by-user'
        ? 'Sign in cancelled'
        : err.message || 'Failed to sign in with Google';
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
   setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-4 p-4">
      <Card className="w-full max-w-md gradient-card border-gradient backdrop-blur-sm shadow-gradient-xl max-h-[calc(100vh-6rem)] overflow-auto">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-display font-bold gradient-text">
              Sign In
          </CardTitle>
          <CardDescription className="text-base font-sans">
              Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.form && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-display">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 font-sans"
                  required
                />
              </div>
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-display">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-sans gradient-text hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 font-sans"
                  required
                />
              </div>
              {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password}</p> : null}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full gradient-bg-primary text-primary-foreground font-display font-semibold shadow-gradient-md hover:shadow-gradient-lg transition-all duration-300 hover:scale-105"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm font-sans">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold gradient-text hover:underline"
              >
                Get Started
              </Link>
            </p>
          </div>

          <div className="mt-6 relative">
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
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mt-6 font-sans gradient-bg-secondary border-gradient hover:shadow-gradient-sm transition-all duration-300 hover:scale-105 hover:opacity-90"
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
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
