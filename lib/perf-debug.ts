'use client';

/**
 * Opt-in performance probe: add `?perf=1` to any URL.
 *
 * Logs long tasks (>50ms of blocked main thread) and INP-style interaction
 * latency to the console, so a lag can be attributed rather than guessed at.
 * Nothing is registered unless the flag is present, so it costs nothing in
 * normal use.
 */
export function installPerfDebug(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!new URLSearchParams(window.location.search).has('perf')) return () => {};

  const observers: PerformanceObserver[] = [];
  const log = (label: string, ms: number, detail?: string) => {
    const colour = ms > 200 ? '#ff5c5c' : ms > 100 ? '#ffb02e' : '#7bd88f';
    // eslint-disable-next-line no-console
    console.log(
      `%c${label} %c${ms.toFixed(0)}ms%c${detail ? ` · ${detail}` : ''}`,
      'color:#888',
      `color:${colour};font-weight:600`,
      'color:#888',
    );
  };

  try {
    const longTasks = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) log('long task', entry.duration);
    });
    longTasks.observe({ type: 'longtask', buffered: true });
    observers.push(longTasks);
  } catch {
    /* longtask unsupported */
  }

  try {
    const events = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { duration: number; name: string };
        if (e.duration >= 100) log('interaction', e.duration, e.name);
      }
    });
    // durationThreshold surfaces slow interactions only.
    events.observe({ type: 'event', buffered: true, durationThreshold: 100 } as PerformanceObserverInit);
    observers.push(events);
  } catch {
    /* event timing unsupported */
  }

  // eslint-disable-next-line no-console
  console.log(
    '%cperf probe on%c — long tasks and slow interactions will print here.',
    'color:#7bd88f;font-weight:600',
    'color:#888',
  );

  return () => observers.forEach((o) => o.disconnect());
}
