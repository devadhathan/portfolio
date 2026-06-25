'use client';

import { useEffect, useRef, useState } from 'react';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import type { CardSkeletonType } from '@/lib/infer-skeleton';
import { GenUILandingPage } from '@/components/gen-ui-canvas';
import { GenUICanvasSkeleton } from '@/components/gen-ui-skeleton';
import { Button } from '@/components/ui/button';
import { whiteButtonClass } from '@/components/gen-ui-action-button';
import { cn } from '@/lib/utils';

const viewportButtonClass = cn(
  'h-7 w-auto rounded-full px-3 text-[11px] font-medium',
  whiteButtonClass,
);

type GenUIViewportStackProps = {
  viewports: GenUIViewport[];
  isBuilding: boolean;
  skeletonTypes?: CardSkeletonType[];
  scrollToId?: string | null;
};

function scrollToViewport(id: string) {
  document.getElementById(`gen-ui-viewport-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function GenUIViewportStack({ viewports, isBuilding, skeletonTypes, scrollToId }: GenUIViewportStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, viewports.length - 1));

  useEffect(() => {
    if (!scrollToId) return;
    scrollToViewport(scrollToId);
    const idx = viewports.findIndex((v) => v.id === scrollToId);
    if (idx >= 0) setActiveIndex(idx);
  }, [scrollToId, viewports]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || viewports.length === 0) return;

    const sections = viewports.map((v) => document.getElementById(`gen-ui-viewport-${v.id}`)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const idx = viewports.findIndex((v) => `gen-ui-viewport-${v.id}` === visible.target.id);
        if (idx >= 0) setActiveIndex(idx);
      },
      { root, threshold: [0.35, 0.55, 0.75] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [viewports]);

  const totalViews = viewports.length + (isBuilding ? 1 : 0);
  const showNav = viewports.length > 1 || isBuilding;

  return (
    <div className="relative pb-24">
      {showNav && (
        <div className="sticky top-14 z-20 -mx-1 mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/40 bg-background/90 px-3 py-2.5 backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1 shrink-0">Views</span>
          {viewports.map((vp, i) => (
            <Button
              key={vp.id}
              type="button"
              variant="outline"
              size="sm"
              className={cn(viewportButtonClass, activeIndex === i && 'ring-1 ring-white/60')}
              onClick={() => scrollToViewport(vp.id)}
            >
              View {i + 1}
            </Button>
          ))}
          {isBuilding && (
            <Button variant="outline" size="sm" disabled className={cn(viewportButtonClass, 'opacity-60')}>
              Creating…
            </Button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="max-h-[calc(100vh-5.5rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {viewports.map((vp, idx) => (
          <section
            key={vp.id}
            id={`gen-ui-viewport-${vp.id}`}
            className="min-h-[min(92vh,960px)] snap-start snap-always py-8 md:py-12 border-b border-border/20"
          >
            <div className="mb-8 md:mb-10 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(viewportButtonClass, 'text-[10px] uppercase tracking-[0.15em]')}
                onClick={() => scrollToViewport(vp.id)}
              >
                View {idx + 1} of {totalViews}
              </Button>
              <span className="h-px flex-1 bg-border/30" aria-hidden />
            </div>
            <GenUILandingPage
              prompt={vp.prompt}
              title={vp.title}
              summary={vp.summary}
              items={vp.items}
            />
          </section>
        ))}

        {isBuilding && (
          <section className="min-h-[min(80vh,840px)] snap-start snap-always py-8 md:py-12">
            <div className="mb-8 flex items-center gap-3">
              <Button variant="outline" size="sm" disabled className={cn(viewportButtonClass, 'text-[10px] uppercase tracking-[0.15em] animate-pulse')}>
                View {viewports.length + 1} of {totalViews} · Creating…
              </Button>
              <span className="h-px flex-1 bg-border/30" aria-hidden />
            </div>
            <GenUICanvasSkeleton types={skeletonTypes} />
          </section>
        )}
      </div>

      {showNav && (
        <div className="hidden md:flex fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-1.5 z-30">
          {viewports.map((vp, i) => (
            <Button
              key={vp.id}
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Scroll to view ${i + 1}`}
              onClick={() => scrollToViewport(vp.id)}
              className={cn(
                'h-8 w-auto min-w-[2rem] rounded-full px-2.5 text-[11px] font-medium',
                whiteButtonClass,
                activeIndex === i && 'ring-1 ring-white/60 shadow-sm',
              )}
            >
              {i + 1}
            </Button>
          ))}
          {isBuilding && (
            <Button variant="outline" size="sm" disabled className={cn('h-8 w-auto min-w-[2rem] rounded-full px-2.5 text-[11px] animate-pulse', whiteButtonClass)}>
              …
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
