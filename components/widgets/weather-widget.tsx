'use client';

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
    <div data-cuelume-card-hover className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm font-medium text-foreground/90">Weather</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">{weather.temp}°F</p>
            <p className="text-xs text-muted-foreground">{weather.condition}</p>
          </div>
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
        <div className="flex items-center gap-4 border-t border-foreground/10 pt-2">
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
      </div>
    </div>
  );
}
