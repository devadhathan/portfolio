'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function PreferenceGraph() {
  const data = [
    { name: 'User Research', value: 40 },
    { name: 'Interaction Design', value: 75 },
    { name: 'Visual Design', value: 80 },
    { name: 'Prototyping', value: 90 },
  ];

  return (
    <div className="h-full flex flex-col p-4 relative">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      <div className="pb-4 flex-shrink-0 relative z-10">
        <CardTitle className="text-[11px] font-dm-mono uppercase tracking-[0.4em] text-foreground flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-foreground">
            Design Preferences
          </span>
        </CardTitle>
      </div>
      <div className="flex-1 flex flex-col justify-between gap-4 relative z-10">
        {/* Line Chart Graph */}
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '100px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                stroke="hsl(var(--border))"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                stroke="hsl(var(--border))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}
                animationDuration={0}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ pointerEvents: 'none' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Description */}
        <div className="pt-4">
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            I like prototyping and bringing ideas to life quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
