'use client';

import { cn } from '@/lib/utils';
import type { PlaygroundItem } from '@/lib/playground-items';

type PlaygroundPhoneFrameProps = {
  children: React.ReactNode;
  size?: 'preview' | 'detail';
  className?: string;
  /** Show a subtle Dynamic Island cutout (CRAFT-style). */
  showIsland?: boolean;
};

/** Black rounded phone bezel — edges only, optional island. */
export function PlaygroundPhoneFrame({
  children,
  size = 'preview',
  className,
  showIsland = true,
}: PlaygroundPhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-black',
        'rounded-[1.65rem] border-[5px] border-black shadow-[0_12px_36px_rgba(0,0,0,0.22)]',
        size === 'preview' && 'w-[168px] sm:w-[188px]',
        size === 'detail' &&
          'rounded-[1.85rem] border-[6px] shadow-[0_20px_56px_rgba(0,0,0,0.28)] w-[min(280px,calc(100vw-4rem))] sm:w-[300px]',
        className,
      )}
      style={{ aspectRatio: '9 / 19.5' }}
    >
      {showIsland ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-[68px] -translate-x-1/2 rounded-full bg-black sm:top-2.5 sm:h-[22px] sm:w-[74px]"
        />
      ) : null}
      <div className="absolute inset-[3px] overflow-hidden rounded-[1.35rem] bg-black sm:inset-[4px] sm:rounded-[1.45rem]">
        {children}
      </div>
    </div>
  );
}

type PlaygroundFlatFrameProps = {
  children: React.ReactNode;
  aspect: string;
  size?: 'preview' | 'detail';
  className?: string;
};

export function PlaygroundFlatFrame({
  children,
  aspect,
  size = 'preview',
  className,
}: PlaygroundFlatFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-[#1B1917]',
        size === 'preview' && 'w-[168px] sm:w-[188px]',
        size === 'detail' && 'mx-auto w-[min(480px,70vw)] rounded-[1.5rem] shadow-[0_20px_56px_rgba(0,0,0,0.2)]',
        className,
      )}
      style={{ aspectRatio: aspect.replace('/', ' / ') }}
    >
      {children}
    </div>
  );
}

export function PlaygroundMediaContent({
  item,
  accessibilityLabel,
  interactive = false,
  fit = 'cover',
}: {
  item: PlaygroundItem;
  accessibilityLabel: string;
  interactive?: boolean;
  fit?: 'cover' | 'contain';
}) {
  const objectClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  if (item.media.type === 'video') {
    return (
      <video
        className={cn('h-full w-full', objectClass)}
        src={item.media.src}
        poster={item.media.poster}
        aria-label={accessibilityLabel}
        controls={interactive}
        autoPlay
        loop
        playsInline
        muted
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn('h-full w-full', objectClass)}
      src={item.media.src}
      alt={accessibilityLabel}
      loading="lazy"
    />
  );
}

export function PlaygroundItemMedia({
  item,
  accessibilityLabel,
  size = 'preview',
  interactive = false,
}: {
  item: PlaygroundItem;
  accessibilityLabel: string;
  size?: 'preview' | 'detail';
  interactive?: boolean;
}) {
  const media = (
    <PlaygroundMediaContent
      item={item}
      accessibilityLabel={accessibilityLabel}
      interactive={interactive}
      fit={item.frame === 'phone' ? 'cover' : 'contain'}
    />
  );

  if (item.frame === 'phone') {
    return <PlaygroundPhoneFrame size={size}>{media}</PlaygroundPhoneFrame>;
  }

  return (
    <PlaygroundFlatFrame aspect={item.aspect} size={size}>
      {media}
    </PlaygroundFlatFrame>
  );
}
