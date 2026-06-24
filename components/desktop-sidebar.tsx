'use client';

import { WeatherWidget } from './widgets/weather-widget';
import { NotesWidget } from './widgets/notes-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Clock5,
  Calendar,
  FolderKanban,
  ChevronRight,
  ChevronLeft,
  Cloud,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { resumeData } from '@/lib/resume-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimateIcon } from './animate-icon';

interface DesktopSidebarProps {
  onProjectSelect?: (projectSlug: string) => void;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function DesktopSidebar({ onProjectSelect, isCollapsed = false, onCollapseChange }: DesktopSidebarProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, []);

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

  const clockCard = (
    <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717] dark:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium">Time</span>
        </div>
        {mounted && time instanceof Date ? (
          <div className="space-y-3">
            <div className="relative w-full aspect-square max-w-[180px] mx-auto">
              <svg className="w-full h-full" viewBox="0 0 200 200">
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
            <div className="text-center space-y-1">
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
    <div className={`h-full overflow-hidden flex flex-col bg-card border-r border-border/30 relative transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0 border-b border-border/30">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground">Widgets</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 rounded-md bg-background/80 border border-border/70 shadow-sm hover:bg-accent transition-all ${isCollapsed ? 'mx-auto' : ''}`}
          onClick={() => onCollapseChange?.(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-primary" />
          )}
        </Button>
      </div>

      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 py-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg bg-background/80 border border-border/70 shadow-sm hover:bg-accent transition-all"
            title="Projects"
            onClick={() => onCollapseChange?.(false)}
          >
            <AnimateIcon animation="pointing">
              <FolderKanban className="h-5 w-5 text-primary" />
            </AnimateIcon>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg bg-background/80 border border-border/70 shadow-sm hover:bg-accent transition-all"
            title="Notes"
          >
            <AnimateIcon animation="pulse">
              <FileText className="h-5 w-5 text-primary" />
            </AnimateIcon>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg bg-background/80 border border-border/70 shadow-sm hover:bg-accent transition-all"
            title="Weather"
          >
            <AnimateIcon animation="bounce">
              <Cloud className="h-5 w-5 text-primary" />
            </AnimateIcon>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg bg-background/80 border border-border/70 shadow-sm hover:bg-accent transition-all"
            title="Clock"
          >
            <AnimateIcon animation="rotate">
              <Clock5 className="h-5 w-5 text-primary" />
            </AnimateIcon>
          </Button>
        </div>
      ) : (
        <>
          {/* Projects */}
          <div className="px-4 pt-4 pb-2 flex-1 min-h-0 flex flex-col overflow-hidden">
            <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717] dark:shadow-md h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 min-h-0 overflow-hidden p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  <div className="space-y-0.5">
                    {resumeData.projects
                      .filter(project => project.title !== 'Sustainable Kiosk')
                      .map((project, index) => {
                        const projectSlug = project.title.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <div key={index} className="group relative">
                            <div
                              className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-accent/50 transition-colors cursor-pointer"
                              onClick={() => onProjectSelect?.(projectSlug)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-muted-foreground/60 group-hover:bg-primary transition-colors flex-shrink-0 mt-0.5" />
                                  <p className="text-sm font-medium truncate">{project.title}</p>
                                </div>
                                <p className="text-xs text-muted-foreground ml-3 truncate">
                                  {project.company || project.institution} • {project.period}
                                </p>
                              </div>
                              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
          <div className="px-4 pb-2 flex-shrink-0">
            <NotesWidget />
          </div>

          {/* Weather + Time */}
          <div className="px-4 pb-4 space-y-4 flex-shrink-0">
            <WeatherWidget />
            {clockCard}
          </div>
        </>
      )}
    </div>
  );
}
