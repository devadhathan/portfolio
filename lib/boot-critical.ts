/** Critical-path helpers for the brand boot splash. */

const URL_IN_CSS = /url\(\s*['"]?([^'")]+)['"]?\s*\)/i;

export const BOOT_READY_EVENT = 'portfolio:boot-ready';

/** Splash has started fading — safe to run visible enter animations. */
export const BOOT_REVEAL_EVENT = 'portfolio:boot-reveal';

let bootReady = false;
let bootRevealed = false;

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

export function isBootReady() {
  return bootReady;
}

export function isBootRevealed() {
  return bootRevealed;
}

/** First paint of the active window body — safe to reveal the desktop. */
export function signalBootReady() {
  if (typeof window === 'undefined') return;
  bootReady = true;
  window.dispatchEvent(new CustomEvent(BOOT_READY_EVENT));
}

/** Splash fade begins — start line-by-line / enter motions. */
export function signalBootReveal() {
  if (typeof window === 'undefined') return;
  if (bootRevealed) return;
  bootRevealed = true;
  window.dispatchEvent(new CustomEvent(BOOT_REVEAL_EVENT));
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
