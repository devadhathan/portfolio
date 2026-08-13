'use client';

import { bind, play, setEnabled, setVolume, type SoundName } from 'cuelume';

export { bind, play, setEnabled, setVolume };
export type { SoundName };

/**
 * Cuelume no-ops while `navigator.userActivation.hasBeenActive === false`.
 * Sticky activation is often set only after the current gesture handler finishes,
 * so the first click/tap can silently fail. Deferring to a microtask unlocks
 * Web Audio on that first interaction (desktop + iOS Safari).
 */
export function playAfterActivation(
  name: SoundName = 'tick',
  options?: { volume?: number },
) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => play(name, options));
    return;
  }
  window.setTimeout(() => play(name, options), 0);
}

/** Resume/create the shared AudioContext on the first real user gesture. */
export function installSoundUnlock() {
  if (typeof window === 'undefined') return () => {};

  let unlocked = false;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    playAfterActivation('tick', { volume: 0.08 });
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
  };

  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  window.addEventListener('touchstart', unlock, { capture: true, passive: true });

  return () => {
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
  };
}
