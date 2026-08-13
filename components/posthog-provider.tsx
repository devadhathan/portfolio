'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!TOKEN || !pathname || !posthog.__loaded) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Light PostHog client: pageviews + leaves, no session replay.
 * Init deferred to idle so it doesn’t compete with first paint / OS chrome.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!TOKEN || typeof window === 'undefined') return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;

    const init = () => {
      posthog.init(TOKEN, {
        api_host: HOST,
        person_profiles: 'identified_only',
        capture_pageview: false, // manual via PostHogPageView (App Router)
        capture_pageleave: true,
        autocapture: false,
        // Keep first load light — pageviews only, no optional PostHog CDN scripts
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
        capture_performance: false,
        capture_dead_clicks: false,
        persistence: 'localStorage+cookie',
        advanced_disable_feature_flags: true,
      });
    };

    if (typeof window === 'undefined') return;

    const schedule =
      typeof (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
        .requestIdleCallback === 'function'
        ? (cb: () => void) => {
            const id = (
              window as Window & { requestIdleCallback: typeof requestIdleCallback }
            ).requestIdleCallback(cb, { timeout: 2500 });
            return () =>
              (
                window as Window & { cancelIdleCallback: typeof cancelIdleCallback }
              ).cancelIdleCallback(id);
          }
        : (cb: () => void) => {
            const t = window.setTimeout(cb, 800);
            return () => window.clearTimeout(t);
          };

    return schedule(init);
  }, []);

  if (!TOKEN) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
