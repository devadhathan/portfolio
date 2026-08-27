'use client';

import { track as vercelTrack } from '@vercel/analytics';

/** Vercel only accepts flat primitives; PostHog is happy with the same shape. */
export type EventProps = Record<string, string | number | boolean | null>;

type Capture = (name: string, props?: EventProps) => void;

/**
 * PostHog is injected by the provider rather than imported here.
 *
 * Importing `posthog-js` from this module would pull ~80kB into the graph of
 * every component that tracks anything — it measured as +81kB of First Load JS.
 * The provider already owns that dependency, so it hands the capture function
 * over once it has initialised.
 */
let capture: Capture | null = null;

/** Events fired before PostHog finishes its idle-deferred init. */
const pending: { name: string; props?: EventProps }[] = [];
const MAX_PENDING = 20;

/**
 * Session replay is started on demand, not at load. The provider hands the
 * starter over once PostHog is up; if something asked to record before that,
 * the request is honoured as soon as it arrives.
 */
let replayStarter: (() => void) | null = null;
let replayRunning = false;

export function registerReplayStarter(fn: () => void) {
  replayStarter = fn;
  if (replayRunning) fn();
}

/** Idempotent — safe to call on every case-study open. */
export function startSessionReplay() {
  if (replayRunning) return;
  replayRunning = true;
  try {
    replayStarter?.();
  } catch {
    /* replay is optional — never break the page for it */
  }
}

export function registerAnalyticsCapture(fn: Capture) {
  capture = fn;
  const queued = pending.splice(0, pending.length);
  for (const event of queued) {
    try {
      fn(event.name, event.props);
    } catch {
      /* analytics must never break the UI */
    }
  }
}

/**
 * One call, both destinations.
 *
 * Cost is near zero: PostHog batches captures, Vercel's `track` is a small
 * beacon from a script already on the page, and nothing here loads code.
 * Keep events coarse — no scroll-progress or hover firehoses.
 */
export function trackEvent(name: string, props?: EventProps) {
  try {
    if (capture) capture(name, props);
    else if (pending.length < MAX_PENDING) pending.push({ name, props });
  } catch {
    /* analytics must never break the UI */
  }

  try {
    vercelTrack(name, props);
  } catch {
    /* no-ops in dev and when Web Analytics is off */
  }
}
