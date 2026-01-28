"use client";

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-gradient-sm">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-gradient-sm"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-chart-1/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
