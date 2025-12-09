'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export function PreferenceGraph() {
  const maxValue = 100;
  const graphWidth = 300;
  const graphHeight = 120;
  const padding = 20;

  // Smooth line chart with sensible curve
  const chartData = useMemo(() => {
    const preferences = [
      { name: 'Prototyping', value: 90 },
      { name: 'Visual Design', value: 80 },
      { name: 'Interaction Design', value: 75 },
      { name: 'User Research', value: 40 },
    ];

    // Generate smooth curve points
    const numPoints = 60; // More points for smoother curve
    const points: Array<{ x: number; y: number; value: number; name: string }> = [];
    const labelPoints: Array<{ x: number; y: number; value: number; name: string }> = [];
    
    const startX = padding;
    const endX = graphWidth - padding;
    const width = endX - startX;
    const n = preferences.length - 1;
    
    // Generate smooth curve points using Catmull-Rom spline approach
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = startX + (t * width);
      
      // Find the segment and interpolate
      const pos = t * n;
      let index = Math.floor(pos);
      const fraction = pos - index;
      
      // Clamp index
      index = Math.max(0, Math.min(index, preferences.length - 2));
      
      // Get values with edge handling
      const v0 = index > 0 ? preferences[index - 1].value : preferences[index].value;
      const v1 = preferences[index].value;
      const v2 = preferences[index + 1].value;
      const v3 = index < preferences.length - 2 ? preferences[index + 2].value : preferences[index + 1].value;
      
      // Catmull-Rom spline interpolation for smooth curve
      const t2 = fraction * fraction;
      const t3 = t2 * fraction;
      
      const value = 0.5 * (
        (2 * v1) +
        (-v0 + v2) * fraction +
        (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 +
        (-v0 + 3 * v1 - 3 * v2 + v3) * t3
      );
      
      const y = graphHeight - padding - ((value / maxValue) * (graphHeight - padding * 2));
      points.push({ x, y, value, name: '' });
    }
    
    // Label points for the original preferences
    preferences.forEach((pref, index) => {
      const t = index / n;
      const x = startX + (t * width);
      const y = graphHeight - padding - ((pref.value / maxValue) * (graphHeight - padding * 2));
      labelPoints.push({ x, y, value: pref.value, name: pref.name });
    });

    return { points, labelPoints };
  }, []);

  // Create smooth binomial curve path
  const pathString = useMemo(() => {
    if (chartData.points.length === 0) return '';
    
    // Use cubic bezier for smoother binomial curve
    let path = `M ${chartData.points[0].x} ${chartData.points[0].y}`;
    
    for (let i = 0; i < chartData.points.length - 1; i++) {
      const current = chartData.points[i];
      const next = chartData.points[i + 1];
      
      if (i < chartData.points.length - 2) {
        const afterNext = chartData.points[i + 2];
        
        // Control points for smooth cubic bezier
        const cp1X = current.x + (next.x - current.x) / 3;
        const cp1Y = current.y;
        const cp2X = next.x - (afterNext.x - next.x) / 3;
        const cp2Y = next.y;
        
        path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
      } else {
        // Last segment
        const cpX = (current.x + next.x) / 2;
        path += ` Q ${cpX} ${current.y}, ${next.x} ${next.y}`;
      }
    }
    
    return path;
  }, [chartData]);

  // Area path (for fill)
  const areaPath = useMemo(() => {
    if (chartData.points.length === 0) return '';
    const bottomY = graphHeight - padding;
    return `${pathString} L ${chartData.points[chartData.points.length - 1].x} ${bottomY} L ${chartData.points[0].x} ${bottomY} Z`;
  }, [pathString, chartData]);

  return (
    <Card className="h-full flex flex-col rounded-2xl border-2 border-border/70 bg-card/60 backdrop-blur-md hover:bg-card/70 hover:border-border/90 cursor-pointer transition-all duration-200 dark:shadow-md">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-[16px] flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Design Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {/* Line Chart Graph */}
        <div className="flex-1 flex items-center justify-center pb-4">
          <div className="relative w-full" style={{ height: '120px' }}>
            <svg
              width="100%"
              height="120"
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value) => {
                const y = graphHeight - padding - ((value / maxValue) * (graphHeight - padding * 2));
                return (
                  <line
                    key={value}
                    x1={padding}
                    y1={y}
                    x2={graphWidth - padding}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    strokeOpacity="0.2"
                    strokeDasharray="2,2"
                  />
                );
              })}
              
              {/* Area fill */}
              <path
                d={areaPath}
                fill="url(#chartGradient)"
                className="transition-opacity duration-200 hover:opacity-80"
              />
              
              {/* Line */}
              <path
                d={pathString}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-200"
                style={{
                  filter: 'drop-shadow(0 1px 2px hsl(var(--primary) / 0.3))',
                }}
              />
              
              {/* Data points for labels only */}
              {chartData.labelPoints.map((point, index) => (
                <g key={index}>
                  {/* Hover circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="hsl(var(--primary))"
                    className="transition-all duration-200 hover:r-6 opacity-80 hover:opacity-100 cursor-pointer"
                    style={{
                      filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))',
                    }}
                  />
                  
                  {/* Inner circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill="hsl(var(--background))"
                    className="transition-all duration-200"
                  />
                  
                  {/* Value label */}
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="10"
                    fontWeight="600"
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {Math.round(point.value)}%
                  </text>
                  
                  {/* X-axis labels */}
                  <text
                    x={point.x}
                    y={graphHeight - 5}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="9"
                    className="opacity-70"
                  >
                    {point.name.split(' ')[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
        
        {/* Description */}
        <div className="pt-3 mt-2 border-t border-border/30">
          <p className="text-[14px] text-muted-foreground text-center leading-relaxed">
            I prefer prototyping and bringing ideas to life quickly, with less emphasis on extensive user research.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
