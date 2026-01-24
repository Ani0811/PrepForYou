import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

export const LandingNav = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' }
  ];

  const scrollToSection = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-border">
      <div className="px-6 md:px-12 lg:px-24 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
          data-testid="landing-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            PrepForYou
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {navItems.map((item, index) => (
            <button
              key={index}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              onClick={() => scrollToSection(item.href)}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Desktop CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-3"
        >
          <Button
            data-testid="nav-login-btn"
            variant="ghost"
            onClick={() => navigate('/login')}
            className="hover:bg-primary/10"
          >
            Sign In
          </Button>
          <Button
            data-testid="nav-signup-btn"
            onClick={() => navigate('/signup')}
            className="bg-primary hover:bg-primary/90 rounded-full px-6"
          >
            Get Started
          </Button>
        </motion.div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                data-testid="mobile-menu-trigger"
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] bg-[#030712]/95 backdrop-blur-xl border-border"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 mb-8 pt-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    PrepForYou
                  </span>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2 flex-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={index}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => scrollToSection(item.href)}
                      className="text-left px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </nav>

                {/* Mobile CTA Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t border-border">
                  <Button
                    data-testid="mobile-nav-login-btn"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full h-12 border-primary/20 hover:bg-primary/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    data-testid="mobile-nav-signup-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="w-full h-12 bg-primary hover:bg-primary/90 rounded-full"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
