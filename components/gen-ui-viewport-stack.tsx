'use client';

import { useEffect, useRef, useState } from 'react';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUIViewportSection } from '@/components/gen-ui-viewport-section';
import { cn } from '@/lib/utils';

type GenUIViewportStackProps = {
  viewports: GenUIViewport[];
  activeId: string | null;
  isBuilding: boolean;
  scrollToId?: string | null;
  onActiveChange?: (id: string) => void;
};

function scrollToViewport(id: string) {
  document.getElementById(`gen-ui-viewport-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function GenUIViewportStack({
  viewports,
  activeId,
  isBuilding,
  scrollToId,
  onActiveChange,
}: GenUIViewportStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, viewports.length - 1));

  useEffect(() => {
    if (!scrollToId) return;
    scrollToViewport(scrollToId);
    const idx = viewports.findIndex((v) => v.id === scrollToId);
    if (idx >= 0) setActiveIndex(idx);
  }, [scrollToId, viewports]);

  useEffect(() => {
    if (!activeId) {
      setActiveIndex(Math.max(0, viewports.length - 1));
      return;
    }
    const idx = viewports.findIndex((v) => v.id === activeId);
    if (idx >= 0) setActiveIndex(idx);
  }, [activeId, viewports]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || viewports.length === 0) return;

    const sections = viewports
      .map((v) => document.getElementById(`gen-ui-viewport-${v.id}`))
      .filter(Boolean) as HTMLElement[];

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
  }, [viewports, isBuilding]);

  const showRail = viewports.length > 1;

  return (
    <div className="relative pb-24">
      <div
        ref={containerRef}
        className="h-[calc(100vh-5.5rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain scroll-pt-6"
      >
        {viewports.map((vp) => (
          <GenUIViewportSection key={vp.id} viewport={vp} />
        ))}
      </div>

      {showRail && (
        <div
          className="flex fixed right-3 sm:right-4 xl:right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-1.5 z-30"
          aria-label="Scroll between views"
        >
          {viewports.map((vp, i) => (
            <button
              key={vp.id}
              type="button"
              aria-label={`Go to view ${i + 1}`}
              aria-current={activeIndex === i ? 'true' : undefined}
              onClick={() => {
                scrollToViewport(vp.id);
                setActiveIndex(i);
                onActiveChange?.(vp.id);
              }}
              className={cn(
                'w-1 rounded-full transition-all duration-300',
                activeIndex === i
                  ? 'h-10 bg-primary'
                  : vp.status === 'loading'
                    ? 'h-5 bg-primary/35 animate-pulse'
                    : 'h-3 bg-border/80 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
