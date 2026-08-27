'use client';

import { useEffect, useState, Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import type { PostHog } from 'posthog-js';
import { registerAnalyticsCapture, registerReplayStarter } from '@/lib/analytics';

const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!TOKEN || !pathname || !posthog) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}

function scheduleIdle(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const ric = (
    window as Window & { requestIdleCallback?: typeof requestIdleCallback }
  ).requestIdleCallback;
  if (typeof ric === 'function') {
    const id = ric(cb, { timeout: 3500 });
    return () =>
      (
        window as Window & { cancelIdleCallback: typeof cancelIdleCallback }
      ).cancelIdleCallback(id);
  }
  const t = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(t);
}

/**
 * Light PostHog client: pageviews + leaves, no session replay at boot.
 * `posthog-js` is loaded on idle so it stays off the first-paint JS graph.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<PostHog | null>(null);

  useEffect(() => {
    if (!TOKEN || typeof window === 'undefined') return;

    return scheduleIdle(() => {
      void import('posthog-js').then(({ default: posthog }) => {
        if ((posthog as unknown as { __loaded?: boolean }).__loaded) {
          setClient(posthog);
          return;
        }
        posthog.init(TOKEN, {
          api_host: HOST,
          person_profiles: 'identified_only',
          capture_pageview: false,
          loaded: (ph) => {
            ph.capture('$pageview', { $current_url: window.location.href });
            registerAnalyticsCapture((name, props) => ph.capture(name, props));
            registerReplayStarter(() => ph.startSessionRecording());
          },
          capture_pageleave: true,
          autocapture: false,
          disable_session_recording: true,
          session_recording: {
            maskAllInputs: true,
          },
          disable_surveys: true,
          capture_performance: false,
          capture_dead_clicks: false,
          persistence: 'localStorage+cookie',
          advanced_disable_feature_flags: true,
        });
        setClient(posthog);
      });
    });
  }, []);

  if (!TOKEN || !client) return <>{children}</>;

  return (
    <PHProvider client={client}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
