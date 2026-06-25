'use client';

import { CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HighlightedText } from './highlighted-text';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const PREFERENCE_VALUES = [90, 80, 75, 70, 60, 40] as const;

export function PreferenceGraph() {
  const t = useTranslations('home');

  const data = [
    { subject: t('preferences.prototyping'), value: PREFERENCE_VALUES[0] },
    { subject: t('preferences.visualDesign'), value: PREFERENCE_VALUES[1] },
    { subject: t('preferences.interaction'), value: PREFERENCE_VALUES[2] },
    { subject: t('preferences.uiDesign'), value: PREFERENCE_VALUES[3] },
    { subject: t('preferences.wireframing'), value: PREFERENCE_VALUES[4] },
    { subject: t('preferences.userResearch'), value: PREFERENCE_VALUES[5] },
  ];

  return (
    <div className="h-full flex flex-col p-4 relative">
      <div className="pb-2 flex-shrink-0 relative z-10">
        <CardTitle className="text-[15px] font-medium tracking-tight text-foreground flex items-center gap-2.5">
          <PenTool className="h-4 w-4 text-foreground/80 flex-shrink-0" />
          <span className="text-[15px] font-medium tracking-tight text-foreground">
            {t('designPreferences')}
          </span>
        </CardTitle>
      </div>

      <HighlightedText text={t('preferenceIntro')} className="text-[13px] text-muted-foreground/70 leading-relaxed pb-2 flex-shrink-0 relative z-10" as="p" />

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
