"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Mail, Target, Calendar, TrendingUp, BookOpen, Clock, Pencil, Camera, Check, X } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserByFirebaseUid, updateUserProfile, upsertUserOnSignIn } from '../../lib/userApi';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [applyToFirebase, setApplyToFirebase] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userData = await getUserByFirebaseUid(u.uid);
          setUsername(userData.username || u.displayName || 'No name');
          // Show custom avatar if set, otherwise show Google provider photo
          const providerGooglePhoto = u.providerData?.find((p: any) => p.providerId === 'google.com')?.photoURL;
          const displayAvatar = userData.avatarProvider === 'custom' && userData.avatarUrl
            ? userData.avatarUrl
            : (providerGooglePhoto || u.photoURL || '');
          setAvatarPreview(displayAvatar);
          // Default behavior: if the account is using Google provider, do not overwrite provider photo
          const providerGoogle = u.providerData?.some((p: any) => p.providerId === 'google.com');
          setApplyToFirebase(!providerGoogle);
        } catch (error: any) {
          const msg = error?.message ?? String(error);
          // If user not found on backend, create it (upsert) using Firebase info
          if (msg.includes('404') || msg.toLowerCase().includes('user not found')) {
            try {
              const payload = {
                firebaseUid: u.uid,
                email: u.email ?? '',
                displayName: u.displayName ?? '',
                avatarUrl: u.photoURL ?? '',
              };
              const created = await upsertUserOnSignIn(payload);
              setUsername(created.username || created.displayName || u.displayName || 'No name');
              const providerGooglePhoto = u.providerData?.find((p: any) => p.providerId === 'google.com')?.photoURL;
              setAvatarPreview(providerGooglePhoto || u.photoURL || '');
              const providerGoogle = u.providerData?.some((p: any) => p.providerId === 'google.com');
              setApplyToFirebase(!providerGoogle);
            } catch (createErr) {
              console.warn('Failed to create user on sign-in:', createErr);
              setUsername(u.displayName || 'No name');
              setAvatarPreview(u.photoURL || '');
            }
          } else {
            console.warn('Error fetching user data:', error);
            setUsername(u.displayName || 'No name');
            setAvatarPreview(u.photoURL || '');
          }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUsernameEdit = () => {
    setTempUsername(username);
    setIsEditingUsername(true);
  };

  const handleUsernameSave = async () => {
    if (!user || !tempUsername.trim()) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, { username: tempUsername.trim() });
      await updateProfile(user, { displayName: tempUsername.trim() });
      setUsername(tempUsername.trim());
      setIsEditingUsername(false);
      toast.success('Username updated successfully!');
      // notify other components (Header) that profile changed
      try { window.dispatchEvent(new CustomEvent('pfy:user-updated', { detail: { uid: user.uid } })); } catch (e) { /* ignore */ }
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error(error.message || 'Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsernameCancel = () => {
    setTempUsername('');
    setIsEditingUsername(false);
  };

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (!user || !selectedAvatarFile) return;
    
    setIsSaving(true);
    try {
      // Upload avatar to Firebase Storage
      const { uploadAvatar } = await import('../../lib/userApi');
      const uploadResult = await uploadAvatar(selectedAvatarFile, user.uid);
      
      // Update user profile with new avatar URL and storage path
      await updateUserProfile(user.uid, {
        avatarUrl: uploadResult.avatarUrl,
        avatarStoragePath: uploadResult.avatarStoragePath,
        avatarProvider: 'custom'
      });
      
      // Only update Firebase `photoURL` if user opted in (prevents overwriting Google avatar by default)
      if (applyToFirebase) {
        try { 
          await updateProfile(user, { photoURL: uploadResult.avatarUrl }); 
        } catch (e) { 
          console.warn('Failed to update Firebase profile photo:', e); 
        }
      }
      
      // Update local preview with the uploaded avatar URL
      setAvatarPreview(uploadResult.avatarUrl);
      
      toast.success('Avatar updated successfully!');
      setIsAvatarDialogOpen(false);
      setSelectedAvatarFile(null);
      
      // notify other components (Header) that profile/avatar changed
      try { 
        window.dispatchEvent(new CustomEvent('pfy:user-updated', { detail: { uid: user.uid } })); 
      } catch (e) { 
        /* ignore */ 
      }
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarCancel = () => {
    setIsAvatarDialogOpen(false);
    setSelectedAvatarFile(null);
    setAvatarPreview(user?.photoURL || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Please sign in to view your profile.</p>
      </div>
    );
  }

  const userProfile = {
    id: user.uid,
    name: username,
    email: user.email ?? '',
    avatarUrl: avatarPreview,
    learningGoals: 'Not set yet'
  };

  const initials = username
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const stats = {
    totalCourses: 0,
    completedCourses: 0,
    learningStreak: 0,
    totalTimeSpent: 0
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text transition-all duration-300">Profile</h1>
        <p className="text-muted-foreground text-lg font-sans">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="font-display">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar 
                  className="h-24 w-24 mb-4 ring-2 ring-gradient-start transition-all duration-300 hover:scale-110 cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl font-display gradient-bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-4 right-0 p-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-transform duration-200"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className="h-8 text-center font-display"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUsernameSave();
                        if (e.key === 'Escape') handleUsernameCancel();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUsernameSave}
                      disabled={isSaving}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUsernameCancel}
                      disabled={isSaving}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold">{userProfile.name}</h2>
                    <button
                      onClick={handleUsernameEdit}
                      className="p-1 rounded hover:bg-accent transition-colors"
                      aria-label="Edit username"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-4 right-0 p-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                      aria-label="Change avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

            <div className="space-y-4 pt-4 border-t">
              {userProfile.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-display">Email</p>
                    <p className="text-sm text-muted-foreground break-all font-sans">{userProfile.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-display">Member Since</p>
                  <p className="text-sm text-muted-foreground font-sans">January 2025</p>
                </div>
              </div>

              {userProfile.learningGoals && (
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-display">Learning Goals</p>
                    <p className="text-sm text-muted-foreground font-sans">{userProfile.learningGoals}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Card className="lg:col-span-2 gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="font-display">Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Total Courses</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.totalCourses) : 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Completed</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.completedCourses) : 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Learning Streak</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.learningStreak) : 0} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Time Spent</p>
                    <p className="text-2xl font-display font-bold">
                      {stats ? Math.floor(Number(stats.totalTimeSpent) / 60) : 0}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Edit Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
          <DialogHeader>
            <DialogTitle className="font-display">Change Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 ring-2 ring-gradient-start">
                <AvatarImage src={avatarPreview} alt="Preview" />
                <AvatarFallback className="text-4xl font-display gradient-bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Select an image (max 5MB)
              </p>
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={applyToFirebase}
                  onChange={(e) => setApplyToFirebase(e.target.checked)}
                />
                <span className="text-sm">Apply as account photo (replace provider avatar)</span>
              </label>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleAvatarCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAvatarSave}
                disabled={!selectedAvatarFile || isSaving}
                className="gradient-bg-primary"
              >
                {isSaving ? 'Saving...' : 'Save Avatar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferences Card */}
      <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="font-display">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Email Notifications</p>
                <p className="text-sm text-muted-foreground font-sans">Receive updates about your progress</p>
              </div>
              <Badge variant="outline" className="gradient-bg-secondary">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Daily Reminders</p>
                <p className="text-sm text-muted-foreground font-sans">Get reminded to complete your daily tasks</p>
              </div>
              <Badge variant="outline" className="gradient-bg-secondary">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Public Profile</p>
                <p className="text-sm text-muted-foreground font-sans">Allow others to view your achievements</p>
              </div>
              <Badge variant="secondary" className="gradient-bg-secondary">Private</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

