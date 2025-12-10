'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

export type Theme = 'dark' | 'light' | 'blue' | 'green' | 'red' | 'purple' | 'glass';

export const availableThemes = [
  { id: 'dark' as Theme, name: 'Dark', icon: Moon, color: null },
  { id: 'light' as Theme, name: 'Light', icon: Sun, color: null },
  { id: 'glass' as Theme, name: 'Glass', icon: Sparkles, color: null },
];

export const rgbThemes = [
  { id: 'red' as Theme, name: 'Red', icon: null, color: '#ef4444' },
  { id: 'green' as Theme, name: 'Green', icon: null, color: '#22c55e' },
  { id: 'blue' as Theme, name: 'Blue', icon: null, color: '#3b82f6' },
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
      
      // Trigger background update when theme changes to glass
      if (theme === 'glass') {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const event = new Event('theme-changed');
          document.dispatchEvent(event);
        }, 100);
      }
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
