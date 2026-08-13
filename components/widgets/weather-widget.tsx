'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

type WeatherWidgetProps = {
  className?: string;
};

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const weather = {
    location: 'Edinburgh',
    temp: 52,
    condition: 'Partly Cloudy',
    humidity: 75,
    wind: 12,
    icon: Cloud,
  };

  const Icon = weather.icon;

  return (
    <Card
      data-cuelume-card-hover
      className={cn(
        'border-0 bg-transparent text-white shadow-none [&_.text-muted-foreground]:text-white/55',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">{weather.temp}°F</p>
            <p className="text-xs text-muted-foreground">{weather.condition}</p>
          </div>
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
        <div className="flex items-center gap-4 border-t border-white/15 pt-2">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{weather.wind} mph</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{weather.location}</p>
      </CardContent>
    </Card>
  );
}
