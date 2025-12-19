'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PreferenceGraph() {
  const data = [
    { name: 'Prototyping', value: 90 },
    { name: 'Visual Design', value: 80 },
    { name: 'Interaction Design', value: 75 },
    { name: 'User Research', value: 40 },
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
        <div className="text-[16px] font-medium flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Design Preferences
        </div>
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
        <div className="pt-4 border-t border-border/30">
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            I like prototyping and bringing ideas to life quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
