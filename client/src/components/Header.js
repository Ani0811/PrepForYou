import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, Target, BookOpen, FileText, Calendar, 
  Sparkles, User, LogOut, Menu, Settings 
} from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice', path: '/practice', icon: Target },
    { label: 'Blog', path: '/blog', icon: BookOpen },
    { label: 'Notes', path: '/notes', icon: FileText },
    { label: 'Study Planner', path: '/study-planner', icon: Calendar },
    { label: 'Question Gen', path: '/question-generator', icon: Sparkles }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="px-6 md:px-12 lg:px-24 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
          data-testid="logo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            PrepForYou
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              variant="ghost"
              className={`gap-2 ${
                isActive(item.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-secondary/50'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                data-testid="user-menu-trigger"
                variant="ghost" 
                size="icon" 
                className="rounded-full"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                data-testid="profile-menu-item"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                data-testid="logout-menu-item"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                data-testid="mobile-menu-trigger"
                variant="ghost" 
                size="icon"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    variant="ghost"
                    className={`justify-start gap-2 ${
                      isActive(item.path) 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
