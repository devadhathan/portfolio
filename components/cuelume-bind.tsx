'use client';

import { useEffect } from 'react';
import { bind, installSoundUnlock, playAfterActivation } from '@/lib/sound';

const CARD_HOVER_ATTR = 'data-cuelume-card-hover';
const HOVER_GAP_MS = 180;
let lastCardHover = -Infinity;

/**
 * Wire declarative cuelume attrs, unlock Web Audio on first gesture,
 * plus a quieter card-hover cue (replaces the louder default "whisper").
 */
export function CuelumeBind() {
  useEffect(() => {
    bind();
    const teardownUnlock = installSoundUnlock();

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      if (!(event.target instanceof Element)) return;

      const card = event.target.closest(`[${CARD_HOVER_ATTR}]`);
      if (!card) return;

      const related = event.relatedTarget;
      if (related instanceof Node && card.contains(related)) return;

      const now = performance.now();
      if (now - lastCardHover < HOVER_GAP_MS) return;
      lastCardHover = now;

      playAfterActivation('tick', { volume: 0.12 });
    };

    document.addEventListener('pointerenter', onPointerEnter, true);
    return () => {
      teardownUnlock();
      document.removeEventListener('pointerenter', onPointerEnter, true);
    };
  }, []);

  return null;
}
