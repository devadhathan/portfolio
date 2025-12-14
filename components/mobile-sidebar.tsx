'use client';

import { useState, useEffect } from 'react';
import { WeatherWidget } from './widgets/weather-widget';
import { NotesWidget } from './widgets/notes-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Menu, ChevronRight, X, FolderKanban } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface MobileSidebarProps {
  onProjectSelect?: (projectSlug: string) => void;
}

export function MobileSidebar({ onProjectSelect }: MobileSidebarProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    
    // Update every 50ms for smooth second hand movement
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

  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="lg:hidden h-10 w-10 rounded-full shadow-lg bg-card backdrop-blur-xl border-2 border-border/50 hover:bg-card hover:border-primary/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b border-border/30">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          {/* Clock Widget - Analog */}
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md dark:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Time</span>
              </div>
              {mounted && time instanceof Date ? (
                <div className="space-y-3">
                  {/* Analog Clock */}
                  <div className="relative w-full aspect-square max-w-[180px] mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Clock face circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="95"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="2"
                        className="opacity-30"
                      />
                      {/* Hour markers */}
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
                      {/* Hour hand */}
                      <line
                        x1="100"
                        y1="100"
                        x2={String(100 + 50 * Math.cos(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * (Math.PI / 180)))}
                        y2={String(100 + 50 * Math.sin(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * (Math.PI / 180)))}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Minute hand */}
                      <line
                        x1="100"
                        y1="100"
                        x2={String(100 + 70 * Math.cos((time.getMinutes() * 6 - 90) * (Math.PI / 180)))}
                        y2={String(100 + 70 * Math.sin((time.getMinutes() * 6 - 90) * (Math.PI / 180)))}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Second hand - smooth automatic movement */}
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
                      {/* Center dot */}
                      <circle
                        cx="100"
                        cy="100"
                        r="6"
                        fill="hsl(var(--foreground))"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="3"
                        fill="hsl(var(--background))"
                      />
                    </svg>
                  </div>
                  {/* Digital time below */}
                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold">
                      {formatTime(time)}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(time)}
                      </span>
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

          {/* Weather Widget */}
          <WeatherWidget />

          {/* Projects List */}
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md dark:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-0.5 pr-4">
                  {resumeData.projects
                    .filter(project => project.title !== 'Sustainable Kiosk')
                    .map((project, index) => {
                      const projectSlug = project.title.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <div
                          key={index}
                          className="group relative"
                        >
                          <SheetClose asChild>
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
                          </SheetClose>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Notes Widget */}
          <NotesWidget />
        </div>
      </SheetContent>
    </Sheet>
  );
}

