/** Critical-path helpers for the brand boot splash. */

const URL_IN_CSS = /url\(\s*['"]?([^'")]+)['"]?\s*\)/i;

/** Sticky flag — child effects can signal before the splash listener attaches. */
let bootReady = false;

/** Pull the first image URL out of a CSS background value (wallpapers). */
export function imageUrlFromBackground(background: string): string | null {
  const match = background.match(URL_IN_CSS);
  return match?.[1] ?? null;
}

/** Decode an image so wallpaper/logo is ready before the splash fades. */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = src;
    if (img.complete) done();
  });
}

export const BOOT_READY_EVENT = 'portfolio:boot-ready';

export function isBootReady() {
  return bootReady;
}

/** First paint of the active window body — safe to reveal the desktop. */
export function signalBootReady() {
  if (typeof window === 'undefined') return;
  bootReady = true;
  window.dispatchEvent(new CustomEvent(BOOT_READY_EVENT));
}

/**
 * Schedule a double-rAF callback with full-chain cancellation
 * (outer + inner frame), for boot paint signaling.
 */
export function afterNextPaint(cb: () => void): () => void {
  let cancelled = false;
  let innerId = 0;
  const outerId = requestAnimationFrame(() => {
    if (cancelled) return;
    innerId = requestAnimationFrame(() => {
      if (!cancelled) cb();
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(outerId);
    if (innerId) cancelAnimationFrame(innerId);
  };
}
