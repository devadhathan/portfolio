'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type Theme = 'clear' | 'dark' | 'light' | 'blue' | 'green' | 'red';

export const availableThemes = [
  { id: 'dark' as Theme, name: 'Dark', icon: Moon, color: null },
  { id: 'light' as Theme, name: 'Light', icon: Sun, color: null },
];

/** Clear sits beside the RGB swatches — circle chip, same shape as R/G/B. */
export const clearTheme = {
  id: 'clear' as Theme,
  name: 'Clear',
  icon: null,
  color: 'rgba(255, 255, 255, 0.55)',
};

export const rgbThemes = [
  { id: 'red' as Theme, name: 'Red', icon: null, color: '#FC553B', letter: 'R' },
  { id: 'green' as Theme, name: 'Green', icon: null, color: '#94D28B', letter: 'G' },
  { id: 'blue' as Theme, name: 'Blue', icon: null, color: '#466BFD', letter: 'B' },
];

export const allThemes = [...availableThemes, clearTheme, ...rgbThemes];

export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const theme = (nextTheme as Theme) || 'clear';

  useEffect(() => {
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  return {
    theme: mounted ? theme : 'clear',
    setTheme,
    themes: availableThemes,
  };
}
