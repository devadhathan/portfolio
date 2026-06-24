'use client';

import { CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { subject: 'Prototyping', value: 90 },
  { subject: 'Visual Design', value: 80 },
  { subject: 'Interaction', value: 75 },
  { subject: 'UI Design', value: 70 },
  { subject: 'Wireframing', value: 60 },
  { subject: 'User Research', value: 40 },
];

export function PreferenceGraph() {
  return (
    <div className="h-full flex flex-col p-4 relative">
      <div className="pb-2 flex-shrink-0 relative z-10">
        <CardTitle className="text-[15px] font-medium tracking-tight text-foreground flex items-center gap-2.5">
          <PenTool className="h-4 w-4 text-foreground/80 flex-shrink-0" />
          <span className="text-[15px] font-medium tracking-tight text-foreground">
            Design Preferences
          </span>
        </CardTitle>
      </div>

      <p className="text-[13px] text-muted-foreground/70 leading-relaxed pb-2 flex-shrink-0 relative z-10">
        I like prototyping and{' '}
        <span className="text-foreground">bringing ideas to life quickly.</span>
      </p>

      <div className="flex-1 flex items-center justify-center relative z-10" style={{ minHeight: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="hsl(var(--foreground))" strokeOpacity={0.08} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.6, fontSize: 10 }}
            />
            <Radar
              dataKey="value"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              strokeWidth={1}
              fill="hsl(var(--foreground))"
              fillOpacity={0.05}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
