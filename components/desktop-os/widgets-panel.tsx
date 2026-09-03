'use client';

import { memo } from 'react';
import { WeatherWidget } from '@/components/widgets/weather-widget';
import { DevOsWelcomeWidget } from '@/components/desktop-os/dev-os-welcome-widget';
import { OsAnalogClock } from '@/components/desktop-os/os-analog-clock';
import { useOsNotificationGlassClass } from '@/components/desktop-os/os-widget-glass';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { cn } from '@/lib/utils';

const MemoWeatherWidget = memo(WeatherWidget);
const MemoDevOsWelcomeWidget = memo(DevOsWelcomeWidget);

export function WidgetsPanel() {
  const { widgetsOpen, setWidgetsOpen, isNarrow } = useDesktopOs();
  const glassClass = useOsNotificationGlassClass({ interactive: false });

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

      {!isNarrow ? <MemoDevOsWelcomeWidget /> : null}

      <MemoWeatherWidget className={glassClass} />

      <OsAnalogClock active={widgetsOpen} className={glassClass} />
    </aside>
  );
}
