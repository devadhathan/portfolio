'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CaseStudySection } from '@/lib/case-study-sections';

type CaseStudyOnPageNavProps = {
  label: string;
  projectId: string;
  sections: CaseStudySection[];
};

/**
 * Self-contained “On this page” rail.
 * Owns scroll-spy state so siblings (back button) don’t re-render on scroll.
 */
export function CaseStudyOnPageNav({ label, projectId, sections }: CaseStudyOnPageNavProps) {
  const sectionKey = sections.map((s) => s.id).join('|');
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const tocNavRef = useRef<HTMLElement | null>(null);
  const tocLinkRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const lockUntilRef = useRef(0);

  const effectiveActiveId =
    activeId && sections.some((section) => section.id === activeId)
      ? activeId
      : (sections[0]?.id ?? null);

  const placeIndicator = useCallback((sectionId: string | null) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    if (!sectionId) {
      indicator.dataset.visible = '';
      return;
    }
    const link = tocLinkRefs.current[sectionId];
    if (!link) return;
    indicator.style.transform = `translate3d(0, ${link.offsetTop}px, 0)`;
    indicator.style.height = `${Math.max(link.offsetHeight, 16)}px`;
    indicator.dataset.visible = 'true';
  }, []);

  const findScrollRoot = useCallback((from: HTMLElement) => {
    return (
      (from.closest('.os-case-scroll') as HTMLElement | null) ??
      (from.closest('.os-window-body') as HTMLElement | null) ??
      null
    );
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      setActiveId(sectionId);
      placeIndicator(sectionId);
      lockUntilRef.current = performance.now() + 850;
      const target = document.getElementById(`${projectId}-${sectionId}`);
      if (!target) return;
      const root = findScrollRoot(target);
      if (root) {
        const rootRect = root.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        root.scrollTo({
          top: root.scrollTop + (targetRect.top - rootRect.top) - 12,
          behavior: 'smooth',
        });
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [findScrollRoot, placeIndicator, projectId],
  );

  useLayoutEffect(() => {
    placeIndicator(effectiveActiveId);
  }, [effectiveActiveId, sectionKey, placeIndicator]);

  useEffect(() => {
    if (!projectId || !sectionKey) {
      setActiveId(null);
      return;
    }

    const ids = sectionKey.split('|').filter(Boolean);
    setActiveId((prev) => (prev && ids.includes(prev) ? prev : ids[0] ?? null));

    let cancelled = false;
    let retryTimer = 0;
    let observer: IntersectionObserver | null = null;

    const bind = () => {
      if (cancelled) return;

      const entries = ids
        .map((id) => {
          const el = document.getElementById(`${projectId}-${id}`);
          return el ? { id, el } : null;
        })
        .filter((entry): entry is { id: string; el: HTMLElement } => Boolean(entry));

      if (entries.length === 0) {
        retryTimer = window.setTimeout(bind, 120);
        return;
      }

      const scrollRoot = findScrollRoot(entries[0].el);
      const visible = new Map<string, number>();

      observer = new IntersectionObserver(
        (ioEntries) => {
          if (performance.now() < lockUntilRef.current) return;

          for (const entry of ioEntries) {
            const id = entry.target.id.slice(projectId.length + 1);
            if (!ids.includes(id)) continue;
            if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
            else visible.delete(id);
          }

          if (visible.size === 0) return;

          let bestId = ids[0];
          let bestTop = Number.POSITIVE_INFINITY;
          for (const id of ids) {
            if (!visible.has(id)) continue;
            const el = entries.find((e) => e.id === id)?.el;
            if (!el) continue;
            const top = el.getBoundingClientRect().top;
            if (top < bestTop) {
              bestTop = top;
              bestId = id;
            }
          }

          setActiveId((prev) => {
            if (prev === bestId) return prev;
            // Move the bar via DOM first — don’t wait for React paint.
            placeIndicator(bestId);
            return bestId;
          });
        },
        {
          root: scrollRoot,
          rootMargin: '-12% 0px -62% 0px',
          threshold: [0, 0.1, 0.25, 0.5],
        },
      );

      for (const { el } of entries) observer.observe(el);
    };

    bind();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      observer?.disconnect();
    };
  }, [findScrollRoot, placeIndicator, projectId, sectionKey]);

  return (
    <div className="os-work-case-toc-inner pt-8 pr-1">
      <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {sections.length > 0 ? (
        <nav ref={tocNavRef} className="os-work-toc-nav relative" aria-label={label}>
          <span className="os-work-toc-track" aria-hidden />
          <span ref={indicatorRef} className="os-work-toc-indicator" aria-hidden />
          {sections.map((section) => {
            const isActive = effectiveActiveId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                ref={(el) => {
                  tocLinkRefs.current[section.id] = el;
                }}
                data-cuelume-hover="tick"
                data-active={isActive ? 'true' : undefined}
                onClick={() => scrollToSection(section.id)}
                className={`os-work-toc-link relative block w-full truncate py-1.5 pl-3 pr-1 text-left text-xs font-medium leading-snug transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.name}
              </button>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
