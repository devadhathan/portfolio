'use client';

import type { CardSkeletonType } from '@/lib/infer-skeleton';
import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted/60 animate-pulse', className)} />;
}

function StatSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-2">
      <Shimmer className="h-10 w-2/3" />
      <Shimmer className="h-4 w-1/2" />
      <Shimmer className="h-3 w-3/4" />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-3">
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <div className="flex gap-1.5 pt-1">
        <Shimmer className="h-5 w-12 rounded-full" />
        <Shimmer className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-2">
      <div className="flex justify-between gap-2">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-3 w-16" />
      </div>
      <Shimmer className="h-3 w-1/2" />
      <Shimmer className="h-3 w-full mt-2" />
      <Shimmer className="h-3 w-4/5" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-3 sm:col-span-2">
      <Shimmer className="h-4 w-1/3 mb-2" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-5 flex-1 rounded-full" />
          <Shimmer className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

function ImageSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 overflow-hidden">
      <Shimmer className="aspect-video w-full rounded-none" />
      <div className="p-3">
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 flex gap-3">
      <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-1/2" />
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-3 w-full" />
      </div>
    </div>
  );
}

function FeatureSectionSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/30">
      <div className="px-6 py-8 border-b border-border/30 space-y-3">
        <Shimmer className="h-7 w-full max-w-2xl" />
        <Shimmer className="h-7 w-2/3 max-w-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-6 space-y-4">
            <Shimmer className="h-24 w-full rounded-lg" />
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-3">
      <Shimmer className="h-24 w-full rounded-lg" />
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-full" />
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 sm:col-span-2 lg:col-span-3 border-l-2 border-l-primary/30">
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6 mt-2" />
    </div>
  );
}

function SkillGridSkeleton() {
  return (
    <div className="border border-border/40 rounded-xl bg-card/30 p-6 space-y-4 sm:col-span-2">
      <Shimmer className="h-3 w-20" />
      <div className="flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Shimmer key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function renderSkeleton(type: CardSkeletonType, key: number) {
  switch (type) {
    case 'stat': return <StatSkeleton key={key} />;
    case 'project': return <ProjectSkeleton key={key} />;
    case 'timeline': return <TimelineSkeleton key={key} />;
    case 'skill_grid': return <SkillGridSkeleton key={key} />;
    case 'chart': return <ChartSkeleton key={key} />;
    case 'image': return <ImageSkeleton key={key} />;
    case 'video': return <ImageSkeleton key={key} />;
    case 'info': return <InfoSkeleton key={key} />;
    case 'feature_section': return <FeatureSectionSkeleton key={key} />;
    case 'feature': return <FeatureSkeleton key={key} />;
    case 'quote': return <QuoteSkeleton key={key} />;
    default: return <ProjectSkeleton key={key} />;
  }
}

const DEFAULT_TYPES: CardSkeletonType[] = ['stat', 'project', 'timeline'];

export function GenUIChatSkeleton({ types }: { types?: CardSkeletonType[] }) {
  const skeletonTypes = (types?.length ? types : DEFAULT_TYPES).slice(0, 3);

  return (
    <div className="mt-2.5 space-y-2 rounded-xl border border-border/40 bg-background/30 p-3">
      <Shimmer className="h-3 w-3/4" />
      <div className={cn('grid gap-2 pt-1', skeletonTypes.length >= 3 ? 'grid-cols-3' : skeletonTypes.length === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
        {skeletonTypes.map((type, i) => {
          if (type === 'stat') return <Shimmer key={i} className="h-14 rounded-lg" />;
          if (type === 'image') return <Shimmer key={i} className="h-16 rounded-lg" />;
          if (type === 'feature_section' || type === 'feature') return <Shimmer key={i} className="h-16 rounded-lg" />;
          return <Shimmer key={i} className="h-14 rounded-lg" />;
        })}
      </div>
    </div>
  );
}

export function GenUICanvasSkeleton({ types }: { types?: CardSkeletonType[] }) {
  const skeletonTypes = types?.length ? types : DEFAULT_TYPES;
  const hasFeatureSection = skeletonTypes.includes('feature_section');
  const gridTypes = skeletonTypes.filter((t) => t !== 'feature_section');

  return (
    <div className="animate-fade-in-blur pb-8 space-y-6 w-full">
      {hasFeatureSection && <FeatureSectionSkeleton />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(gridTypes.length > 0 ? gridTypes : DEFAULT_TYPES).map((type, i) => renderSkeleton(type, i))}
      </div>
      <p className="text-center text-sm text-muted-foreground animate-pulse">Building your UI…</p>
    </div>
  );
}
