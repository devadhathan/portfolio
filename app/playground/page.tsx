'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { PreferenceGraph } from '@/components/preference-graph';
import { useRouter } from 'next/navigation';

export default function PlaygroundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <TopBar onHomeClick={() => router.push('/')} />
      <div className="pt-14 pb-24 px-4 md:px-6 lg:px-8 min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-normal font-mono text-foreground">Coming Soon</h1>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}


