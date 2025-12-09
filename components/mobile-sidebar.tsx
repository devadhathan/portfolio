'use client';

import { useState } from 'react';
import { WeatherWidget } from './widgets/weather-widget';
import { NotesWidget } from './widgets/notes-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, FolderKanban, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';
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
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <FolderKanban className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b border-border/30">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          {/* Clock Widget */}
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md dark:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Time</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">
                  {mounted && time instanceof Date ? formatTime(time) : '--:--:--'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {mounted && time instanceof Date ? formatDate(time) : 'Loading...'}
                  </span>
                </div>
              </div>
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

