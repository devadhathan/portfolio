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
        // Keep the desktop OS snappy — replay is the costly part
        disable_session_recording: true,
        persistence: 'localStorage+cookie',
        advanced_disable_feature_flags: true,
      });
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(init, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(init, 800);
    return () => window.clearTimeout(t);
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
