'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
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
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const lockUntilRef = useRef(0);

  const effectiveActiveId =
    activeId && sections.some((section) => section.id === activeId)
      ? activeId
      : (sections[0]?.id ?? null);

  const updateTrackBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track || sections.length === 0) return;

    const first = tocLinkRefs.current[sections[0].id];
    const last = tocLinkRefs.current[sections[sections.length - 1].id];
    if (!first || !last) return;

    const top = first.offsetTop;
    const height = last.offsetTop + last.offsetHeight - top;
    track.style.top = `${top}px`;
    track.style.height = `${Math.max(height, 0)}px`;
    track.style.bottom = 'auto';
  }, [sections]);

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
      if (
        projectId.includes('crm') &&
        (sectionId === 'other-features' ||
          sectionId === 'adding-notes' ||
          sectionId === 'my-tasks-lead-owner-change' ||
          sectionId === 'tags-for-leads')
      ) {
        trackEvent('crm_toc_clicked', { section: sectionId, slug: projectId });
      }
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
    updateTrackBounds();
    placeIndicator(effectiveActiveId);
  }, [effectiveActiveId, sectionKey, placeIndicator, updateTrackBounds]);

  useEffect(() => {
    const nav = tocNavRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => updateTrackBounds());
    observer.observe(nav);
    return () => observer.disconnect();
  }, [sectionKey, updateTrackBounds]);

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
    let scrollRoot: HTMLElement | null = null;
    let onScroll: (() => void) | null = null;

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

      scrollRoot = findScrollRoot(entries[0].el);
      const visible = new Map<string, number>();

      onScroll = () => {
        if (performance.now() < lockUntilRef.current) return;
        const atEnd = scrollRoot
          ? scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 24
          : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24;
        if (!atEnd) return;
        const lastId = ids[ids.length - 1];
        setActiveId((prev) => {
          if (prev === lastId) return prev;
          placeIndicator(lastId);
          return lastId;
        });
      };

      if (scrollRoot) {
        scrollRoot.addEventListener('scroll', onScroll, { passive: true });
      } else {
        window.addEventListener('scroll', onScroll, { passive: true });
      }

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
      updateTrackBounds();
      onScroll?.();
    };

    bind();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      observer?.disconnect();
      if (onScroll) {
        if (scrollRoot) scrollRoot.removeEventListener('scroll', onScroll);
        else window.removeEventListener('scroll', onScroll);
      }
    };
  }, [findScrollRoot, placeIndicator, projectId, sectionKey, updateTrackBounds]);

  return (
    <div className="os-work-case-toc-inner px-4 pb-4 pt-8 sm:px-5">
      <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {sections.length > 0 ? (
        <nav ref={tocNavRef} className="os-work-toc-nav relative" aria-label={label}>
          <span ref={trackRef} className="os-work-toc-track" aria-hidden />
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
