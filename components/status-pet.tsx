'use client';

import { cn } from '@/lib/utils';

/** Tiny ASCII critter — blinks beside availability status. */
export function StatusPet({ className }: { className?: string }) {
  return (
    <span className={cn('status-pet', className)} aria-hidden>
      <span className="status-pet__ears">{'(\\(\\ '}</span>
      <span className="status-pet__face">
        <span className="status-pet__eyes status-pet__eyes--open">( · ·)</span>
        <span className="status-pet__eyes status-pet__eyes--blink">(- -)</span>
      </span>
    </span>
  );
}
