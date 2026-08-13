'use client';

import { WeatherWidget } from '@/components/widgets/weather-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, FolderKanban, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteContent } from '@/components/site-content-provider';
import { getProjectId } from '@/lib/types/project';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { cn } from '@/lib/utils';

type WidgetsPanelProps = {
  onProjectSelect?: (projectSlug: string) => void;
};

const widgetCardClass =
  'rounded-2xl border border-white/10 bg-black/45 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-black/55';

export function WidgetsPanel({ onProjectSelect }: WidgetsPanelProps) {
  const { widgetsOpen, setWidgetsOpen } = useDesktopOs();
  const { projects } = useSiteContent();
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
          className={cn(
            'h-8 w-8 rounded-full text-white/80 shadow-none transition-colors hover:bg-white/10 hover:text-white',
            widgetCardClass,
          )}
          onClick={() => setWidgetsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 1. Weather */}
      <WeatherWidget className={cn('text-white shadow-none', widgetCardClass)} />

      {/* 2. Clock */}
      <Card className={cn('border-0 text-white shadow-none', widgetCardClass)}>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-xs font-medium text-white/90">Time</span>
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
                <p className="text-lg font-semibold text-white/95">{formatTime(time)}</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-white/60">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(time)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-white/90">--:--:--</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Case studies / Projects — hug content height */}
      <Card className={cn('shrink-0 border-0 text-white shadow-none', widgetCardClass)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-white/95">
            <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0.5">
            {projects.map((project, index) => {
              const projectSlug = getProjectId(project.title);
              return (
                <div key={index} className="group relative">
                  <div
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/10"
                    onClick={() => {
                      onProjectSelect?.(projectSlug);
                      setWidgetsOpen(false);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/60 transition-colors group-hover:bg-primary" />
                        <p className="truncate text-sm font-medium text-white/95">
                          {project.title}
                        </p>
                      </div>
                      <p className="ml-3 truncate text-xs text-white/55">
                        {project.company || project.institution} • {project.period}
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-white/50 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
