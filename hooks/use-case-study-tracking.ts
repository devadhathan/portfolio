'use client';

import { useEffect, useRef } from 'react';
import { startSessionReplay, trackEvent } from '@/lib/analytics';

/**
 * Case studies never change the URL, so pageviews cannot see them.
 * Emits open / close with dwell time and how far down the reader got.
 *
 * The scroll listener is passive and rAF-throttled, and only exists while a
 * case study is open — it stores a number, it does not emit events.
 */
export function useCaseStudyTracking(slug: string | null, surface: 'home' | 'work') {
  const closedRef = useRef(false);

  useEffect(() => {
    if (!slug) return;

    const startedAt = performance.now();
    const scroller =
      document.querySelector('.os-case-scroll') ?? document.querySelector('.os-window-body');
    let maxScroll = 0;
    let frame = 0;
    closedRef.current = false;

    trackEvent('case_study_opened', { slug, surface });
    // Replay only from here on — the rest of the desktop is not worth the cost.
    startSessionReplay();

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!(scroller instanceof HTMLElement)) return;
        const travel = scroller.scrollHeight - scroller.clientHeight;
        if (travel <= 0) return;
        const percent = Math.round((scroller.scrollTop / travel) * 100);
        maxScroll = Math.min(100, Math.max(maxScroll, percent));
      });
    };

    const close = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      trackEvent('case_study_closed', {
        slug,
        surface,
        seconds: Math.round((performance.now() - startedAt) / 1000),
        scroll_percent: maxScroll,
      });
    };

    scroller?.addEventListener('scroll', onScroll, { passive: true });
    // Tab close / bfcache counts as leaving the case study.
    window.addEventListener('pagehide', close);

    return () => {
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', close);
      if (frame) cancelAnimationFrame(frame);
      close();
    };
  }, [slug, surface]);
}
