'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, Droplets, Wind } from 'lucide-react';

export function WeatherWidget() {
  // Mock weather data - in real app, you'd fetch this from an API
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
    <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717] dark:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">{weather.temp}°F</p>
            <p className="text-xs text-muted-foreground">{weather.condition}</p>
          </div>
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
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
