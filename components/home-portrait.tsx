'use client';

import { cn } from '@/lib/utils';

const PORTRAIT_ON_DARK = '/photos/case-study-bg/me-with-floor.png';
const PORTRAIT_ON_LIGHT = '/photos/case-study-bg/me-with-floor-white.png';

type HomePortraitProps = {
  className?: string;
};

/** Isometric desk portrait — light strokes on dark themes, dark strokes on light. */
export function HomePortrait({ className }: HomePortraitProps) {
  return (
    <aside className={cn('home-portrait', className)} aria-label="Portrait of Dev">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PORTRAIT_ON_DARK}
        alt=""
        aria-hidden
        className="home-portrait__img home-portrait__img--on-dark"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PORTRAIT_ON_LIGHT}
        alt=""
        aria-hidden
        className="home-portrait__img home-portrait__img--on-light"
        decoding="async"
        loading="lazy"
        draggable={false}
      />
    </aside>
  );
}
