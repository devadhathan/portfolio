'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type Theme = 'dark' | 'light' | 'blue' | 'green' | 'red';

export const availableThemes = [
  { id: 'dark' as Theme, name: 'Dark', icon: Moon, color: null },
  { id: 'light' as Theme, name: 'Light', icon: Sun, color: null },
];

export const rgbThemes = [
  { id: 'red' as Theme, name: 'Red', icon: null, color: '#FC553B' },
  { id: 'green' as Theme, name: 'Green', icon: null, color: '#94D28B' },
  { id: 'blue' as Theme, name: 'Blue', icon: null, color: '#466BFD' },
];

export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const theme = (nextTheme as Theme) || 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure theme class is applied correctly after mount
  useEffect(() => {
    if (mounted && theme && typeof document !== 'undefined') {
      // next-themes handles this, but we ensure it's set correctly
      document.documentElement.className = theme;
      
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  return {
    theme: mounted ? theme : 'dark', // Return default on server
    setTheme,
    themes: availableThemes,
  };
}
