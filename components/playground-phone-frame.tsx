'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AgentOrb } from '@/components/agent-orb';
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
        'rounded-[1.65rem] shadow-[0_12px_36px_rgba(0,0,0,0.22)]',
        size === 'preview' && 'w-[168px] sm:w-[188px]',
        size === 'detail' &&
          'rounded-[1.85rem] shadow-[0_20px_56px_rgba(0,0,0,0.28)] w-[min(280px,calc(100vw-4rem))] sm:w-[300px]',
        className,
      )}
      style={{ aspectRatio: '9 / 19.5' }}
    >
      {showIsland ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1.5 z-20 h-[15px] w-[51px] -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-[16.5px] sm:w-[55.5px]"
        />
      ) : null}
      <div
        className={cn(
          'absolute inset-0 overflow-hidden bg-black',
          size === 'preview' && 'rounded-[1.65rem]',
          size === 'detail' && 'rounded-[1.85rem]',
        )}
      >
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
        'relative overflow-hidden rounded-[1.65rem] bg-neutral-100 shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:bg-[#1C1A12]',
        size === 'preview' && 'w-[168px] sm:w-[188px]',
        size === 'detail' &&
          'mx-auto w-[min(280px,calc(100vw-4rem))] rounded-[1.85rem] shadow-[0_20px_56px_rgba(0,0,0,0.22)] sm:w-[300px]',
        className,
      )}
      style={{ aspectRatio: aspect.replace('/', ' / ') }}
    >
      {children}
    </div>
  );
}

function PlaygroundLazyVideo({
  src,
  poster,
  accessibilityLabel,
  objectClass,
  interactive,
  eager,
}: {
  src: string;
  poster?: string;
  accessibilityLabel: string;
  objectClass: string;
  interactive: boolean;
  /** Detail overlay: play immediately while open. */
  eager?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (eager || interactive) {
      void video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.35, 0.6], rootMargin: '40px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [eager, interactive, src]);

  return (
    <video
      ref={videoRef}
      className={cn('h-full w-full', objectClass)}
      src={src}
      poster={poster}
      aria-label={accessibilityLabel}
      controls={interactive}
      loop
      playsInline
      muted
      preload={eager || interactive ? 'auto' : 'none'}
    />
  );
}

function PlaygroundOrbScreen({
  accessibilityLabel,
  size = 'preview',
}: {
  accessibilityLabel: string;
  size?: 'preview' | 'detail';
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [lookAt, setLookAt] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const max = size === 'detail' ? 8 : 5;
      setLookAt({
        x: Math.max(-max, Math.min(max, (event.clientX - cx) * 0.12)),
        y: Math.max(-max, Math.min(max, (event.clientY - cy) * 0.12)),
      });
    },
    [size],
  );

  return (
    <div
      ref={stageRef}
      className="relative flex h-full w-full items-center justify-center bg-black"
      aria-label={accessibilityLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setLookAt(null)}
    >
      <AgentOrb size={size === 'detail' ? 'xl' : 'lg'} lookAt={lookAt} hoverScale={false} />
    </div>
  );
}

export function PlaygroundMediaContent({
  item,
  accessibilityLabel,
  interactive = false,
  fit = 'cover',
  eager = false,
  size = 'preview',
}: {
  item: PlaygroundItem;
  accessibilityLabel: string;
  interactive?: boolean;
  fit?: 'cover' | 'contain';
  eager?: boolean;
  size?: 'preview' | 'detail';
}) {
  const objectClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  if (item.media.type === 'orb') {
    return <PlaygroundOrbScreen accessibilityLabel={accessibilityLabel} size={size} />;
  }

  if (item.media.type === 'video') {
    return (
      <PlaygroundLazyVideo
        src={item.media.src}
        poster={item.media.poster}
        accessibilityLabel={accessibilityLabel}
        objectClass={objectClass}
        interactive={interactive}
        eager={eager}
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
      eager={size === 'detail'}
      size={size}
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
