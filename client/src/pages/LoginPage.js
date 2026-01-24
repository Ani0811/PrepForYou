import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login - frontend only for now
    setTimeout(() => {
      if (email && password) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Please fill in all fields');
      }
      setLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    toast.info('Google OAuth integration coming soon!');
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Button
          data-testid="back-to-home-btn"
          variant="ghost"
          className="mb-8 hover:bg-primary/10"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-secondary/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              data-testid="login-submit-btn"
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-transform duration-200"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator className="my-6" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>

            <Button
              data-testid="google-login-btn"
              variant="outline"
              className="w-full h-12 mt-6 border-border hover:bg-secondary/50 hover:scale-[1.02] transition-transform duration-200"
              onClick={handleGoogleLogin}
            >
              <Chrome className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
