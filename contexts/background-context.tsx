'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type BackgroundImage = 'default' | 'flower' | 'gradient' | 'none';

interface BackgroundContextType {
  backgroundImage: BackgroundImage;
  setBackgroundImage: (image: BackgroundImage) => void;
  availableBackgrounds: { id: BackgroundImage; name: string; url: string }[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const availableBackgrounds = [
  { id: 'flower' as BackgroundImage, name: 'Flower', url: '/photos/plant.png' },
  { id: 'gradient' as BackgroundImage, name: 'Gradient', url: '' },
  { id: 'none' as BackgroundImage, name: 'None', url: '' },
];

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundImage, setBackgroundImageState] = useState<BackgroundImage>('flower');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const saved = localStorage.getItem('glass-background') as BackgroundImage;
    if (saved && availableBackgrounds.find(bg => bg.id === saved)) {
      setBackgroundImageState(saved);
    }
  }, []);

  const applyBackground = () => {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    const body = document.body;
    const isGlassTheme = html.classList.contains('glass');
    
    if (isGlassTheme) {
      // Update data attribute for CSS targeting
      body.setAttribute('data-bg', backgroundImage);
      
      // Update CSS custom property on html element for glass theme
      const selectedBg = availableBackgrounds.find(bg => bg.id === backgroundImage);
      
      if (backgroundImage === 'none' || backgroundImage === 'gradient') {
        html.style.setProperty('--glass-bg-image', 'none');
      } else if (selectedBg?.url) {
        html.style.setProperty('--glass-bg-image', `url(${selectedBg.url})`);
      }
      
      localStorage.setItem('glass-background', backgroundImage);
    } else {
      // Clear background when not in glass theme
      body.removeAttribute('data-bg');
    }
  };

  useEffect(() => {
    if (mounted) {
      applyBackground();
    }
  }, [backgroundImage, mounted]);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      // Listen for theme changes
      const handleThemeChange = () => {
        applyBackground();
      };
      
      document.addEventListener('theme-changed', handleThemeChange);
      // Also check periodically in case theme changes outside our event
      const interval = setInterval(() => {
        if (document.documentElement.classList.contains('glass')) {
          applyBackground();
        }
      }, 500);
      
      return () => {
        document.removeEventListener('theme-changed', handleThemeChange);
        clearInterval(interval);
      };
    }
  }, [mounted, backgroundImage]);

  const setBackgroundImage = (image: BackgroundImage) => {
    setBackgroundImageState(image);
  };

  return (
    <BackgroundContext.Provider
      value={{
        backgroundImage,
        setBackgroundImage,
        availableBackgrounds,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
