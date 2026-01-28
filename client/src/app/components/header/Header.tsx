"use client";

import Link from 'next/link';
import { Button } from '../ui/button';
import { Home, BookOpen, TrendingUp, User, LogIn, UserPlus } from 'lucide-react';
import ThemeSwitcher from '../theme/ThemeSwitcher';

export default function Header() {
  // TODO: Add authentication state management
  const isSignedIn = false;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="absolute inset-0 gradient-bg-secondary pointer-events-none" />
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
            
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

