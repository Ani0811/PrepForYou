"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Home, BookOpen, TrendingUp, User, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import ThemeSwitcher from '../theme/ThemeSwitcher';
import ProfileSetupModal from '../profilesetup/ProfileSetupModal';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { upsertUserOnSignIn, getUserByFirebaseUid, User as BackendUser } from '../../api/userApi';

export default function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [backendAvatarUrl, setBackendAvatarUrl] = useState<string | null>(null);
  const [backendAvatarProvider, setBackendAvatarProvider] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);

  // Avatar selection logic: if user set custom avatar, use it; otherwise use Google provider photo
  const providerGooglePhoto = currentUser?.providerData?.find((p: any) => p.providerId === 'google.com')?.photoURL;
  const avatarUrl = (backendAvatarProvider === 'custom' && backendAvatarUrl)
    ? backendAvatarUrl
    : (providerGooglePhoto || currentUser?.photoURL || null);

  // Clear previous failure when avatar changes; rely on <img onError> for real failures
  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const providerPhoto = user?.providerData?.find((p: any) => p.providerId === 'google.com')?.photoURL;
      console.log('Auth state changed:', user?.displayName, 'photoURL=', user?.photoURL, 'providerPhoto=', providerPhoto, 'providerData=', user?.providerData);
      setCurrentUser(user);

      // Fetch user from backend to get avatar preferences
      if (user) {
        try {
          const fetchedBackendUser = await getUserByFirebaseUid(user.uid);
          setBackendUser(fetchedBackendUser);
          setBackendAvatarUrl(fetchedBackendUser?.avatarUrl || null);
          setBackendAvatarProvider(fetchedBackendUser?.avatarProvider || 'google');
          console.log('Backend user loaded:', { avatarProvider: fetchedBackendUser?.avatarProvider, hasCustomAvatar: fetchedBackendUser?.avatarProvider === 'custom', role: fetchedBackendUser?.role });
        } catch (error: any) {
          // If user not found (404), create it
          if (error?.message?.includes('404') || error?.message?.toLowerCase().includes('not found')) {
            try {
              const created = await upsertUserOnSignIn({
                firebaseUid: user.uid,
                email: user.email || '',
                displayName: user.displayName || undefined,
                avatarUrl: user.photoURL || undefined,
                avatarProvider: user.photoURL ? 'google' : 'none',
              });
              setBackendUser(created);
              setBackendAvatarUrl(created?.avatarUrl || null);
              setBackendAvatarProvider(created?.avatarProvider || 'google');
              console.log('User created in backend');
            } catch (createErr) {
              console.error('Failed to create user in backend:', createErr);
              setBackendUser(null);
              setBackendAvatarUrl(null);
              setBackendAvatarProvider('google');
            }
          } else {
            console.error('Failed to fetch user from backend:', error);
            setBackendUser(null);
            setBackendAvatarUrl(null);
            setBackendAvatarProvider('google');
          }
        }
      }

      // Detect first-time sign-in: creationTime === lastSignInTime
      try {
        const c = user?.metadata?.creationTime;
        const l = user?.metadata?.lastSignInTime;
        if (user && c && l && c === l) {
          setShowProfileModal(true);
        }
      } catch (e) {
        // ignore
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for profile updates from other parts of the app (ProfilePage)
  useEffect(() => {
    const handler = async (e: any) => {
      try {
        if (!currentUser) return;
        const fetchedBackendUser = await getUserByFirebaseUid(currentUser.uid);
        setBackendUser(fetchedBackendUser);
        setBackendAvatarUrl(fetchedBackendUser?.avatarUrl || null);
        setBackendAvatarProvider(fetchedBackendUser?.avatarProvider || 'google');
        console.log('pfy:user-updated handled: reloaded backend avatar');
      } catch (err) {
        console.warn('pfy:user-updated: failed to reload backend user', err);
      }
    };

    window.addEventListener('pfy:user-updated', handler as EventListener);
    return () => window.removeEventListener('pfy:user-updated', handler as EventListener);
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
  ];

  const getRoleBadge = (role?: string | null) => {
    if (!role) return null;
    const r = String(role).toLowerCase();
    if (r === 'owner') return 'Owner';
    if (r === 'admin') return 'Admin';
    return null;
  };

  const isAdmin = (() => {
    const r = backendUser?.role ? String(backendUser.role).toLowerCase() : '';
    return r === 'owner' || r === 'admin';
  })();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 w-full border-b bg-background backdrop-blur-xl shadow-lg">
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/98 to-background" />
      {showProfileModal && currentUser && (
        <ProfileSetupModal
          open={showProfileModal}
          initialName={currentUser.displayName || ''}
          initialEmail={currentUser.email || ''}
          lockEmail={true}
          onComplete={() => setShowProfileModal(false)}
        />
      )}
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:opacity-90">
              <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-md">
                <span className="text-primary-foreground font-bold text-lg font-display">P</span>
              </div>
              <span className="font-display font-bold text-xl hidden sm:inline gradient-text">
                PrepForYou
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 font-medium text-muted-foreground hover:text-foreground gradient-bg-accent hover:scale-105">
                    <Icon className="h-4 w-4" />
                    <span className="font-display">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex md:hidden items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} title={item.label} className="p-2 rounded-md transition-all duration-300 text-muted-foreground hover:text-foreground gradient-bg-accent hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </nav>

            <ThemeSwitcher />

            {!isLoading && (
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 gap-2 rounded-full pr-3 pl-2 transition-all duration-300 hover:scale-105 hover:shadow-md">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                          {!imageFailed && avatarUrl ? (
                            <AvatarImage
                              className="object-cover"
                              src={avatarUrl}
                              alt={currentUser.displayName || 'User'}
                              onError={(e: any) => { console.error('Avatar image failed to load', { src: avatarUrl, event: e }); setImageFailed(true); }}
                              {...(avatarUrl && !avatarUrl.startsWith?.('data:') ? { crossOrigin: 'anonymous' } : {})}
                            />
                          ) : null}
                          <AvatarFallback className="gradient-bg-primary text-primary-foreground font-display font-semibold text-sm">
                            {getInitials(currentUser.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline font-display font-medium">
                          {currentUser.displayName?.split(' ')[0] || 'Account'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-72 p-3 shadow-2xl border border-border bg-popover/95 backdrop-blur-xl text-popover-foreground rounded-lg z-60"
                      align="end"
                      forceMount
                      sideOffset={8}
                    >
                      <DropdownMenuLabel className="font-normal px-2 py-3 bg-muted/30 rounded-md mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/40 shadow-lg">
                            {!imageFailed && avatarUrl ? (
                              <AvatarImage
                                className="object-cover"
                                src={avatarUrl}
                                alt={currentUser.displayName || 'User'}
                                onError={(e: any) => { console.error('Dropdown avatar image failed to load', { src: avatarUrl, event: e }); setImageFailed(true); }}
                                {...(avatarUrl && !avatarUrl.startsWith?.('data:') ? { crossOrigin: 'anonymous' } : {})}
                              />
                            ) : null}
                            <AvatarFallback className="gradient-bg-primary text-primary-foreground font-display font-bold text-base">
                              {getInitials(currentUser.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-display font-bold leading-none truncate">{currentUser.displayName || 'User'}</p>
                              {backendUser && getRoleBadge(backendUser.role) && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                                  {getRoleBadge(backendUser.role)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-sans leading-none text-muted-foreground truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-2 bg-border" />
                      <DropdownMenuItem asChild className="cursor-pointer py-3 px-3 rounded-md transition-all hover:bg-accent focus:bg-accent">
                        <Link href="/profile" className="flex items-center font-display font-semibold">
                          <User className="mr-3 h-5 w-5" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="cursor-pointer py-3 px-3 rounded-md transition-all hover:bg-accent focus:bg-accent">
                          <Link href="/admin-dashboard" className="flex items-center font-display font-semibold">
                            <Shield className="mr-3 h-5 w-5" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-2 bg-border" />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-3 px-3 rounded-md font-display font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50 transition-all">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link href="/signup" className="hidden sm:inline">
                      <Button variant="default" className="gap-2 font-medium font-display transition-all duration-300 gradient-bg-primary hover:opacity-90 shadow-gradient-md hover:scale-105">
                        <UserPlus className="h-4 w-4" />
                        Get Started
                      </Button>
                    </Link>

                    <Link href="/login" className="hidden sm:inline">
                      <Button variant="outline" className="gap-2 font-medium font-display transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-gradient-sm">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>

                    {/* Small-screen: show single Account icon that links to login/signup */}
                    <div className="flex sm:hidden items-center gap-1">
                      <Link href="/signup" title="Get Started" className="p-2">
                        <UserPlus className="h-5 w-5" />
                      </Link>
                      <Link href="/login" title="Sign In" className="p-2">
                        <LogIn className="h-5 w-5" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

