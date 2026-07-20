'use client';

import { cn } from '@/lib/utils';
import type { PlaygroundItem } from '@/lib/playground-items';

/** Uniform phone proportions across all playground items. */
export const PLAYGROUND_PHONE_ASPECT = '9 / 19.5';

type PlaygroundPhoneFrameProps = {
  children: React.ReactNode;
  size?: 'preview' | 'detail';
  className?: string;
};

const SIZE_CLASS = {
  preview: 'h-[440px] w-[220px] sm:h-[480px] sm:w-[240px]',
  detail:
    'h-[min(520px,calc(100dvh-13rem))] w-[min(220px,calc((100dvh-13rem)*9/19.5))] sm:h-[min(600px,calc(100dvh-13rem))] sm:w-[min(280px,calc((100dvh-13rem)*9/19.5))]',
} as const;

export function PlaygroundPhoneFrame({
  children,
  size = 'preview',
  className,
}: PlaygroundPhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-[2rem] border-[5px] border-foreground/[0.08] bg-black shadow-[0_16px_48px_rgba(0,0,0,0.18)]',
        size === 'detail' && 'rounded-[2.25rem] shadow-[0_24px_64px_rgba(0,0,0,0.22)]',
        SIZE_CLASS[size],
        className,
      )}
      style={{ aspectRatio: PLAYGROUND_PHONE_ASPECT }}
    >
      {size === 'detail' ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-3.5 text-[11px] font-medium text-white/55">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-white/20" />
            <span className="h-2.5 w-3.5 rounded-sm bg-white/20" />
            <span className="h-3 w-5 rounded-[4px] border border-white/15" />
          </div>
        </div>
      ) : null}
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-black">{children}</div>
    </div>
  );
}

export function PlaygroundMediaContent({
  item,
  accessibilityLabel,
  interactive = false,
}: {
  item: PlaygroundItem;
  accessibilityLabel: string;
  interactive?: boolean;
}) {
  if (item.media.type === 'video') {
    return (
      <video
        className="h-full w-full object-contain"
        src={item.media.src}
        poster={item.media.poster}
        aria-label={accessibilityLabel}
        controls={interactive}
        autoPlay={interactive}
        loop
        playsInline
        muted={!interactive}
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="h-full w-full object-contain"
      src={item.media.src}
      alt={accessibilityLabel}
      loading="lazy"
    />
  );
}
