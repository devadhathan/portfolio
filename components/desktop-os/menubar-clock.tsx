'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { cn, focusRing } from '@/lib/utils';

/** Far-right menubar date + time — click toggles widgets. */
export function MenubarClock() {
  const { widgetsOpen, toggleWidgets } = useDesktopOs();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const ms = widgetsOpen ? 1000 : 30_000;
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [widgetsOpen]);

  const timeLabel =
    now?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) ?? '--:--';

  const dateLabel =
    now?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) ?? '';

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
        'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 font-mono text-sm font-medium tabular-nums text-foreground sm:gap-2 sm:px-3.5',
        focusRing,
        widgetsOpen
          ? 'border border-primary/40 bg-primary/10'
          : 'hover:bg-secondary/50',
      )}
    >
      <span className="hidden text-foreground/70 sm:inline">{dateLabel}</span>
      <span>{timeLabel}</span>
    </Button>
  );
}
