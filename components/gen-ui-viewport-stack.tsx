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
  hideMobileNav?: boolean;
  /** Size to parent panel/window instead of the browser viewport. */
  embedded?: boolean;
  onActiveChange?: (id: string) => void;
  onCaseStudySelect?: (projectSlug: string) => void;
};

function scrollToViewport(id: string) {
  document.getElementById(`gen-ui-viewport-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function GenUIViewportStack({
  viewports,
  activeId,
  isBuilding,
  scrollToId,
  hideMobileNav = false,
  embedded = false,
  onActiveChange,
  onCaseStudySelect,
}: GenUIViewportStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledIdRef = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, viewports.length - 1));

  useEffect(() => {
    if (!scrollToId || scrollToId === lastScrolledIdRef.current) return;
    lastScrolledIdRef.current = scrollToId;
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

  const viewportHeightClass = embedded
    ? 'h-full min-h-0'
    : hideMobileNav
      ? 'h-[calc(100vh-3.5rem-env(safe-area-inset-bottom,0px)-4.5rem)] lg:h-[calc(100vh-5.5rem)]'
      : 'h-[calc(100vh-3.5rem-3.5rem-env(safe-area-inset-bottom,0px)-4.5rem)] lg:h-[calc(100vh-5.5rem)]';

  return (
    <div
      className={cn(
        'relative',
        embedded
          ? 'flex h-full min-h-0 flex-col'
          : hideMobileNav
            ? 'pb-6 lg:pb-24'
            : 'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+1.5rem)] lg:pb-24',
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          viewportHeightClass,
          'overflow-y-auto overscroll-y-contain scroll-pt-6',
          // Clear the floating bottom prompt bar inside OS windows.
          embedded && 'pb-36',
        )}
      >
        {viewports.map((vp) => (
          <GenUIViewportSection key={vp.id} viewport={vp} onCaseStudySelect={onCaseStudySelect} />
        ))}
      </div>
    </div>
  );
}
