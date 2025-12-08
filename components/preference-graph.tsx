'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export function PreferenceGraph() {
  const maxValue = 100;
  const graphWidth = 300;
  const graphHeight = 120;
  const padding = 20;

  // Actual preference data - moved inside useMemo to avoid dependency issues
  const chartData = useMemo(() => {
    const preferences = [
      { name: 'Prototyping', value: 90 },
      { name: 'Visual Design', value: 80 },
      { name: 'Interaction Design', value: 75 },
      { name: 'User Research', value: 40 },
    ];

    const points: Array<{ x: number; y: number; value: number; name: string }> = [];
    const dataPoints = preferences.length;
    const spacing = (graphWidth - padding * 2) / (dataPoints - 1);
    
    preferences.forEach((pref, index) => {
      const x = padding + (index * spacing);
      const y = graphHeight - padding - ((pref.value / maxValue) * (graphHeight - padding * 2));
      points.push({ x, y, value: pref.value, name: pref.name });
    });

    return { points, preferences };
  }, []);

  // Create smooth curve path using quadratic bezier curves
  const pathString = useMemo(() => {
    if (chartData.points.length === 0) return '';
    
    let path = `M ${chartData.points[0].x} ${chartData.points[0].y}`;
    
    for (let i = 0; i < chartData.points.length - 1; i++) {
      const current = chartData.points[i];
      const next = chartData.points[i + 1];
      
      // Control point for smooth curve
      const cpX = (current.x + next.x) / 2;
      const cpY1 = current.y;
      const cpY2 = next.y;
      
      path += ` Q ${cpX} ${cpY1}, ${cpX} ${(cpY1 + cpY2) / 2}`;
      path += ` T ${next.x} ${next.y}`;
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
              
              {/* Data points */}
              {chartData.points.map((point, index) => (
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
                    {point.value}%
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
