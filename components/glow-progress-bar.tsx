'use client';

import { cn } from '@/lib/utils';

type GlowProgressBarProps = {
  className?: string;
  /** Accessible label for the busy state. */
  label?: string;
};

/**
 * Thin track with an orange fill and glowing leading tip —
 * used for short chunk/load delays.
 */
export function GlowProgressBar({
  className,
  label = 'Loading',
}: GlowProgressBarProps) {
  return (
    <div
      className={cn('glow-progress', className)}
      role="progressbar"
      aria-busy="true"
      aria-label={label}
    >
      <div className="glow-progress__track" aria-hidden>
        <div className="glow-progress__fill">
          <span className="glow-progress__tip" />
        </div>
      </div>
    </div>
  );
}
