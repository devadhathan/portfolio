'use client';

import { WeatherWidget } from '@/components/widgets/weather-widget';
import { DevOsWelcomeWidget } from '@/components/desktop-os/dev-os-welcome-widget';
import { useOsNotificationGlassClass } from '@/components/desktop-os/os-widget-glass';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { cn } from '@/lib/utils';

export function WidgetsPanel() {
  const { widgetsOpen, setWidgetsOpen, isNarrow } = useDesktopOs();
  const glassClass = useOsNotificationGlassClass({ interactive: false });
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    if (!widgetsOpen) return;

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [widgetsOpen]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <aside
      className={cn(
        'os-widgets-panel pointer-events-auto fixed bottom-3 right-3 top-16 z-[190] flex w-80 max-w-[calc(100vw-1rem)] flex-col gap-3 overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out',
        widgetsOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)] pointer-events-none',
      )}
      aria-hidden={!widgetsOpen}
    >
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close widgets"
          title="Close widgets"
          data-cuelume-press
          data-cuelume-hover="tick"
          className="h-8 w-8 rounded-full text-foreground/80 shadow-none transition-colors hover:bg-foreground/10 hover:text-foreground"
          onClick={() => setWidgetsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isNarrow ? <DevOsWelcomeWidget /> : null}

      {/* 1. Weather */}
      <WeatherWidget className={glassClass} />

      {/* 2. Clock */}
      <div className={glassClass}>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-xs font-medium text-foreground/90">Time</span>
        </div>
        {mounted && time instanceof Date ? (
          <div className="space-y-3">
            <div className="relative mx-auto aspect-square w-full max-w-[180px]">
              <svg className="h-full w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    className="opacity-25"
                  />
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    return (
                      <line
                        key={i}
                        x1={String(100 + 85 * Math.cos(angle))}
                        y1={String(100 + 85 * Math.sin(angle))}
                        x2={String(100 + 95 * Math.cos(angle))}
                        y2={String(100 + 95 * Math.sin(angle))}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={i % 3 === 0 ? 2 : 1}
                        strokeOpacity={0.55}
                      />
                    );
                  })}
                  <line
                    x1="100"
                    y1="100"
                    x2={String(
                      100 +
                        50 *
                          Math.cos(
                            ((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) *
                              (Math.PI / 180),
                          ),
                    )}
                    y2={String(
                      100 +
                        50 *
                          Math.sin(
                            ((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) *
                              (Math.PI / 180),
                          ),
                    )}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2={String(100 + 70 * Math.cos((time.getMinutes() * 6 - 90) * (Math.PI / 180)))}
                    y2={String(100 + 70 * Math.sin((time.getMinutes() * 6 - 90) * (Math.PI / 180)))}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2={String(
                      100 +
                        75 *
                          Math.cos(
                            (time.getSeconds() * 6 + time.getMilliseconds() * 0.006 - 90) *
                              (Math.PI / 180),
                          ),
                    )}
                    y2={String(
                      100 +
                        75 *
                          Math.sin(
                            (time.getSeconds() * 6 + time.getMilliseconds() * 0.006 - 90) *
                              (Math.PI / 180),
                          ),
                    )}
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
                  <circle cx="100" cy="100" r="3" fill="hsl(var(--background))" />
                </svg>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-lg font-semibold text-foreground/95">{formatTime(time)}</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(time)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-foreground/90">--:--:--</p>
          )}
      </div>
    </aside>
  );
}
