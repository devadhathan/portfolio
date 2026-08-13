'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { play, setEnabled } from 'cuelume';
import { cn, focusRing } from '@/lib/utils';

const STORAGE_KEY = 'portfolio-sound-enabled';

type SoundToggleProps = {
  /** Inline sits in the top bar; floating is the old corner control. */
  variant?: 'inline' | 'floating';
};

export function SoundToggle({ variant = 'floating' }: SoundToggleProps) {
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
    // Play before muting so unmute/mute still gives feedback.
    if (next) {
      setEnabled(true);
      play('toggle', { volume: 0.45 });
    } else {
      play('toggle', { volume: 0.45 });
      setEnabled(false);
    }
    setEnabledState(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
  };

  if (!ready) return null;

  const buttonClass =
    variant === 'inline'
      ? cn(
          'flex h-9 w-9 items-center justify-center rounded-md text-foreground/85 transition-colors hover:bg-secondary/50 hover:text-foreground',
          focusRing,
        )
      : cn(
          'glass-chrome flex h-10 w-10 items-center justify-center rounded-full text-foreground',
          focusRing,
        );

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
        aria-pressed={!enabled}
        title={enabled ? 'Mute sounds' : 'Unmute sounds'}
        className={buttonClass}
      >
        {enabled ? (
          <Volume2 className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
      aria-pressed={!enabled}
      title={enabled ? 'Mute sounds' : 'Unmute sounds'}
      className={cn(
        'fixed z-[60]',
        buttonClass,
        'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 lg:bottom-5 lg:right-5',
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
