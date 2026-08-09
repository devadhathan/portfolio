'use client';

import { WeatherWidget } from './widgets/weather-widget';
import { NotesWidget } from './widgets/notes-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  FolderKanban,
  ChevronRight,
  ChevronsLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteContent } from '@/components/site-content-provider';
import { getProjectId } from '@/lib/types/project';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DesktopSidebarProps {
  onProjectSelect?: (projectSlug: string) => void;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function DesktopSidebar({ onProjectSelect, isCollapsed = false, onCollapseChange }: DesktopSidebarProps) {
  const { projects } = useSiteContent();
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    // Smooth second hand only while the expanded clock is visible.
    if (isCollapsed) return;

    const timer = setInterval(() => {
      setTime(new Date());
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [isCollapsed]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isCollapsed) {
    return null;
  }

  const clockCard = (
    <Card className="border border-border/55 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:border-2 dark:border-border/70 dark:bg-[#1C1A12] dark:shadow-md">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-xs font-medium">Time</span>
        </div>
        {mounted && time instanceof Date ? (
          <div className="space-y-3">
            <div className="relative mx-auto aspect-square w-full max-w-[180px]">
              <svg className="h-full w-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  className="opacity-30"
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x1 = String(100 + 85 * Math.cos(angle));
                  const y1 = String(100 + 85 * Math.sin(angle));
                  const x2 = String(100 + 95 * Math.cos(angle));
                  const y2 = String(100 + 95 * Math.sin(angle));
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--foreground))"
                      strokeWidth={i % 3 === 0 ? 2 : 1}
                      strokeOpacity={0.4}
                    />
                  );
                })}
                <line
                  x1="100"
                  y1="100"
                  x2={String(100 + 50 * Math.cos(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * (Math.PI / 180)))}
                  y2={String(100 + 50 * Math.sin(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * (Math.PI / 180)))}
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
                  x2={String(100 + 75 * Math.cos((time.getSeconds() * 6 + time.getMilliseconds() * 0.006 - 90) * (Math.PI / 180)))}
                  y2={String(100 + 75 * Math.sin((time.getSeconds() * 6 + time.getMilliseconds() * 0.006 - 90) * (Math.PI / 180)))}
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ transition: 'none' }}
                />
                <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
                <circle cx="100" cy="100" r="3" fill="hsl(var(--background))" />
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold">{formatTime(time)}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(time)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-semibold">--:--:--</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Loading...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="relative flex h-full w-80 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-foreground">Widgets</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close widgets"
          title="Close widgets"
          data-cuelume-press
          data-cuelume-hover="tick"
          className="h-8 w-8 rounded-full border border-border/55 bg-secondary/50 shadow-sm backdrop-blur-md transition-colors hover:bg-secondary/70 dark:border-border/40 dark:bg-white/[0.06]"
          onClick={() => onCollapseChange?.(true)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-2">
        <Card className="flex h-full flex-col border border-border/55 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:border-2 dark:border-border/70 dark:bg-[#1C1A12] dark:shadow-md">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-hidden p-0 pt-0">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-0.5">
                {projects.map((project, index) => {
                  const projectSlug = getProjectId(project.title);
                  return (
                    <div key={index} className="group relative">
                      <div
                        data-cuelume-hover="tick"
                        data-cuelume-press
                        className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 transition-colors hover:bg-accent/50"
                        onClick={() => onProjectSelect?.(projectSlug)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/60 transition-colors group-hover:bg-primary" />
                            <p className="truncate text-sm font-medium">{project.title}</p>
                          </div>
                          <p className="ml-3 truncate text-xs text-muted-foreground">
                            {project.company || project.institution} • {project.period}
                          </p>
                        </div>
                        <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <div className="flex-shrink-0 px-4 pb-2">
        <NotesWidget />
      </div>

      {/* Weather + Time */}
      <div className="flex-shrink-0 space-y-4 px-4 pb-4">
        <WeatherWidget />
        {clockCard}
      </div>
    </div>
  );
}
