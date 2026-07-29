'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { setEnabled } from 'cuelume';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'portfolio-sound-enabled';

export function SoundToggle() {
  const [enabled, setEnabledState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next = stored === null ? true : stored === 'true';
    setEnabled(next);
    setEnabledState(next);
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setEnabledState(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
  };

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
      aria-pressed={!enabled}
      title={enabled ? 'Mute sounds' : 'Unmute sounds'}
      className={cn(
        'fixed z-[60] flex h-10 w-10 items-center justify-center rounded-full',
        'border border-border/55 bg-card/90 text-foreground shadow-md backdrop-blur-sm',
        'transition-colors hover:bg-secondary/80 dark:border-border/40 dark:bg-[#1B1917]/90',
        'bottom-20 right-4 lg:bottom-5 lg:right-5',
      )}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <VolumeX className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      )}
    </button>
  );
}
