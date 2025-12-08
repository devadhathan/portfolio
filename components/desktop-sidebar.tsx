'use client';

import { WeatherWidget } from './widgets/weather-widget';
import { NotesWidget } from './widgets/notes-widget';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DesktopSidebar() {
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
    <div className="h-full overflow-hidden flex flex-col bg-background/50 border-r border-border/30">
      <div className="p-4 space-y-4 flex-shrink-0">
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
      </div>

      {/* Notes Widget - Takes remaining space and fills it */}
      <div className="px-4 pb-4 flex-1 min-h-0 flex flex-col overflow-hidden">
        <NotesWidget />
      </div>
    </div>
  );
}