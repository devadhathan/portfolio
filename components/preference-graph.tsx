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
    <div className="h-full flex flex-col p-4">
      <div className="pb-4 flex-shrink-0">
        <div className="text-[16px] font-medium flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Design Preferences
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* Line Chart Graph */}
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '140px' }}>
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
                  fontSize: '12px'
                }}
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
            I prefer prototyping and bringing ideas to life quickly, with less emphasis on extensive user research.
          </p>
        </div>
      </div>
    </div>
  );
}
