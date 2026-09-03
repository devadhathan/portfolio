'use client';

import { Calendar, Clock } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';

function formatClockTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatClockDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function handPosition(
  time: Date,
  kind: 'hour' | 'minute' | 'second',
): { x2: number; y2: number } {
  const cx = 100;
  const cy = 100;
  let angleDeg = 0;
  let length = 50;

  if (kind === 'hour') {
    angleDeg = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90;
    length = 50;
  } else if (kind === 'minute') {
    angleDeg = time.getMinutes() * 6 - 90;
    length = 70;
  } else {
    angleDeg = time.getSeconds() * 6 + time.getMilliseconds() * 0.006 - 90;
    length = 75;
  }

  const rad = angleDeg * (Math.PI / 180);
  return {
    x2: cx + length * Math.cos(rad),
    y2: cy + length * Math.sin(rad),
  };
}

type OsAnalogClockProps = {
  active: boolean;
  className: string;
};

/** Analog clock for the widgets panel — ticks via DOM refs, not React state. */
export const OsAnalogClock = memo(function OsAnalogClock({ active, className }: OsAnalogClockProps) {
  const hourRef = useRef<SVGLineElement>(null);
  const minuteRef = useRef<SVGLineElement>(null);
  const secondRef = useRef<SVGLineElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;

    const paint = () => {
      const time = new Date();
      const hour = handPosition(time, 'hour');
      const minute = handPosition(time, 'minute');
      const second = handPosition(time, 'second');

      if (hourRef.current) {
        hourRef.current.setAttribute('x2', String(hour.x2));
        hourRef.current.setAttribute('y2', String(hour.y2));
      }
      if (minuteRef.current) {
        minuteRef.current.setAttribute('x2', String(minute.x2));
        minuteRef.current.setAttribute('y2', String(minute.y2));
      }
      if (secondRef.current) {
        secondRef.current.setAttribute('x2', String(second.x2));
        secondRef.current.setAttribute('y2', String(second.y2));
      }
      if (timeRef.current) timeRef.current.textContent = formatClockTime(time);
      if (dateRef.current) dateRef.current.textContent = formatClockDate(time);
    };

    paint();
    const id = window.setInterval(paint, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-xs font-medium text-foreground/90">Time</span>
      </div>
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
              ref={hourRef}
              x1="100"
              y1="100"
              x2="100"
              y2="50"
              stroke="hsl(var(--foreground))"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              ref={minuteRef}
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              ref={secondRef}
              x1="100"
              y1="100"
              x2="100"
              y2="25"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
            <circle cx="100" cy="100" r="3" fill="hsl(var(--background))" />
          </svg>
        </div>
        <div className="space-y-1 text-center">
          <p ref={timeRef} className="text-lg font-semibold text-foreground/95">
            --:--:--
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span ref={dateRef}>Loading…</span>
          </div>
        </div>
      </div>
    </div>
  );
});
