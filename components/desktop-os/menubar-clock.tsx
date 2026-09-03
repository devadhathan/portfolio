'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { cn, focusRing } from '@/lib/utils';

function formatMenubarTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatMenubarDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** ms until the next minute boundary — menubar only needs minute precision. */
function msUntilNextMinute() {
  const now = new Date();
  return (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
}

/** Far-right menubar date + time — click toggles widgets. */
export function MenubarClock() {
  const { widgetsOpen, toggleWidgets } = useDesktopOs();
  const timeRef = useRef<HTMLSpanElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let timeoutId = 0;

    const paint = () => {
      const now = new Date();
      if (timeRef.current) timeRef.current.textContent = formatMenubarTime(now);
      if (dateRef.current) dateRef.current.textContent = formatMenubarDate(now);
    };

    const schedule = () => {
      paint();
      timeoutId = window.setTimeout(schedule, msUntilNextMinute());
    };

    schedule();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={widgetsOpen}
      aria-label={widgetsOpen ? 'Close widgets' : 'Open widgets'}
      title={widgetsOpen ? 'Close widgets' : 'Widgets'}
      data-cuelume-press
      data-cuelume-hover="tick"
      onClick={toggleWidgets}
      className={cn(
        'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[15px] font-medium tabular-nums text-current sm:gap-2 sm:px-3.5 sm:text-base',
        focusRing,
        widgetsOpen
          ? 'border-primary/40 bg-primary/10'
          : 'border-transparent hover:bg-secondary/50',
      )}
    >
      <span ref={dateRef} className="hidden sm:inline">
        -- ---
      </span>
      <span ref={timeRef}>--:--</span>
    </Button>
  );
}
