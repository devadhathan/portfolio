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
  { id: 'red' as Theme, name: 'Red', icon: null, color: '#FC553B', letter: 'R' },
  { id: 'green' as Theme, name: 'Green', icon: null, color: '#94D28B', letter: 'G' },
  { id: 'blue' as Theme, name: 'Blue', icon: null, color: '#466BFD', letter: 'B' },
];

export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const theme = (nextTheme as Theme) || 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  return {
    theme: mounted ? theme : 'dark', // Return default on server
    setTheme,
    themes: availableThemes,
  };
}
