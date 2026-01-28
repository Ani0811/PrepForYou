import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface ProfileSetupModalProps {
  open: boolean;
  initialName?: string;
  initialEmail?: string;
  lockEmail?: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, initialName = '', initialEmail = '', lockEmail = false, onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Save profile data to your backend here
      console.log('Profile setup complete', { name, email });
      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e: Event) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display gradient-text">Welcome to PrepForYou!</DialogTitle>
          <DialogDescription className="font-sans">
            Complete your profile to get started with your learning journey.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-display">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="font-sans"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-display">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="font-sans"
              required
              readOnly={lockEmail}
              disabled={lockEmail}
            />
            {lockEmail && <p className="text-xs text-muted-foreground">Email is linked to your account and cannot be changed here.</p>}
          </div>

          <Button
            type="submit"
            className="w-full gradient-bg-primary text-primary-foreground font-display font-semibold shadow-gradient-md hover:shadow-gradient-lg transition-all duration-300 hover:scale-105"
            disabled={!name.trim() || !email.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
