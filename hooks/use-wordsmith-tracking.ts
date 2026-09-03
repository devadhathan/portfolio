'use client';

import { useEffect, useRef } from 'react';
import { startSessionReplay, trackEvent } from '@/lib/analytics';

type WordsmithSurface =
  | 'desktop_window'
  | 'home_selected_work'
  | 'home_bento'
  | 'dock'
  | 'finder';

/**
 * Wordsmith has no URL change, so pageviews miss it. Starts session replay on
 * open and emits open / close with dwell time — same pattern as case studies.
 */
export function useWordsmithTracking(active: boolean, surface: WordsmithSurface) {
  const closedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    const startedAt = performance.now();
    closedRef.current = false;

    trackEvent('wordsmith_opened', { surface });
    startSessionReplay();

    const close = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      trackEvent('wordsmith_closed', {
        surface,
        seconds: Math.round((performance.now() - startedAt) / 1000),
      });
    };

    window.addEventListener('pagehide', close);

    return () => {
      window.removeEventListener('pagehide', close);
      close();
    };
  }, [active, surface]);
}
