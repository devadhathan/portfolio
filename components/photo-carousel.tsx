'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { play } from 'cuelume';
import { cn } from '@/lib/utils';
import { ProgressiveImage } from '@/components/progressive-image';

const CAROUSEL_INTERVAL_MS = 7500;
const TRANSITION_MS = 1200;
const TRANSITION_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
const KEN_BURNS_SCALE = 1.1;
const ENTER_BLUR_MS = 1000;

type PhotoCarouselProps = {
  photos: string[];
  title?: string;
  paused?: boolean;
  compact?: boolean;
  onAllPhotosFailed?: () => void;
};

export function PhotoCarousel({
  photos,
  title = 'Photo',
  paused = false,
  compact = false,
  onAllPhotosFailed,
}: PhotoCarouselProps) {
  const photosKey = photos.join('\0');
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());
  const notifiedAllFailedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const countRef = useRef(0);

  const validPhotos = useMemo(
    () => photos.filter((photo) => !failedPhotos.has(photo)),
    [photos, failedPhotos],
  );

  const count = validPhotos.length;
  countRef.current = count;
  const loop = count > 1;
  const slides = loop ? [validPhotos[count - 1], ...validPhotos, validPhotos[0]] : validPhotos;

  const [trackIndex, setTrackIndex] = useState(() => (photos.length > 1 ? 1 : 0));
  const [animate, setAnimate] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heldIndex, setHeldIndex] = useState<number | null>(null);
  const [enterBlur, setEnterBlur] = useState(false);
  const trackIndexRef = useRef(trackIndex);
  const prevTrackIndexRef = useRef(trackIndex);
  const activeImgRef = useRef<HTMLImageElement | null>(null);
  const skipTransitionFxRef = useRef(true);
  useEffect(() => {
    trackIndexRef.current = trackIndex;

    if (skipTransitionFxRef.current) {
      skipTransitionFxRef.current = false;
      prevTrackIndexRef.current = trackIndex;
      return;
    }

    setHeldIndex(prevTrackIndexRef.current);
    setEnterBlur(true);
    const blurTimer = window.setTimeout(() => setEnterBlur(false), ENTER_BLUR_MS);
    prevTrackIndexRef.current = trackIndex;

    return () => window.clearTimeout(blurTimer);
  }, [trackIndex]);

  useEffect(() => {
    const el = activeImgRef.current;
    if (!el || reduceMotion) return;

    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.removeProperty('animation');
  }, [trackIndex, reduceMotion]);

  const logicalIndex = loop ? ((trackIndex - 1 + count) % count) : 0;

  const resetClonePosition = useCallback((index: number) => {
    const slideCount = countRef.current;
    if (index === 0) {
      skipTransitionFxRef.current = true;
      setAnimate(false);
      setTrackIndex(slideCount);
      return true;
    }
    if (index === slideCount + 1) {
      skipTransitionFxRef.current = true;
      setAnimate(false);
      setTrackIndex(1);
      return true;
    }
    return false;
  }, []);

  const go = useCallback(
    (delta: number, options?: { withSound?: boolean }) => {
      if (!loop) return;

      const current = trackIndexRef.current;
      const slideCount = countRef.current;

      // Stuck on a clone slide — snap back before advancing again.
      if (current === 0 || current === slideCount + 1) {
        resetClonePosition(current);
        return;
      }

      if (isAnimatingRef.current) return;

      const next = current + delta;
      if (next < 0 || next > slideCount + 1) return;

      isAnimatingRef.current = true;
      setAnimate(true);
      setTrackIndex(next);
      if (options?.withSound) {
        play('page', { volume: 0.35 });
      }
    },
    [loop, resetClonePosition],
  );

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
      if (!loop) return;

      isAnimatingRef.current = false;
      setHeldIndex(null);
      resetClonePosition(trackIndexRef.current);
    },
    [loop, resetClonePosition],
  );

  const handleImageError = useCallback(
    (photo: string, event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const retries = Number(img.dataset.retries ?? '0');

      // Retry once — dev HMR or brief network blips can fire spurious errors.
      if (retries < 1) {
        img.dataset.retries = '1';
        window.setTimeout(() => {
          const separator = photo.includes('?') ? '&' : '?';
          img.src = `${photo}${separator}retry=1`;
        }, 400);
        return;
      }

      setFailedPhotos((prev) => {
        if (prev.has(photo)) return prev;
        const next = new Set(prev);
        next.add(photo);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    notifiedAllFailedRef.current = false;
    setFailedPhotos(new Set());
    isAnimatingRef.current = false;
    skipTransitionFxRef.current = true;
    setHeldIndex(null);
    setEnterBlur(false);
    setTrackIndex(photos.length > 1 ? 1 : 0);
    setAnimate(true);
  }, [photosKey, photos.length]);

  useEffect(() => {
    photos.forEach((photo) => {
      const img = new window.Image();
      img.src = photo;
    });
  }, [photosKey, photos]);

  useEffect(() => {
    if (animate) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [animate]);

  // Fallback when transitionend doesn't fire (background tab, throttling, etc.).
  useEffect(() => {
    if (!loop) return;
    if (trackIndex !== 0 && trackIndex !== count + 1) return;

    const timer = window.setTimeout(() => {
      const index = trackIndexRef.current;
      if (index === 0 || index === countRef.current + 1) {
        isAnimatingRef.current = false;
        setHeldIndex(null);
        resetClonePosition(index);
      }
    }, TRANSITION_MS + 100);

    return () => window.clearTimeout(timer);
  }, [trackIndex, count, loop, resetClonePosition]);

  // Recover from out-of-bounds index drift (blank slide).
  useEffect(() => {
    if (!loop || count === 0) return;

    const index = trackIndexRef.current;
    if (index >= 0 && index <= count + 1) return;

    isAnimatingRef.current = false;
    setAnimate(false);
    setTrackIndex(((index - 1 + count) % count) + 1);
  }, [trackIndex, count, loop]);

  useEffect(() => {
    if (count === 0) {
      if (!notifiedAllFailedRef.current) {
        notifiedAllFailedRef.current = true;
        onAllPhotosFailed?.();
      }
      return;
    }

    notifiedAllFailedRef.current = false;
    setTrackIndex((index) => {
      if (!loop) return Math.min(index, count - 1);
      if (index < 1 || index > count + 1) {
        return ((index - 1 + count) % count) + 1;
      }
      return index;
    });
  }, [count, loop, onAllPhotosFailed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!loop || paused) return;
    if (reduceMotion) return;

    const timer = window.setInterval(() => go(1), CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loop, paused, go, reduceMotion]);

  const minHeightClass = compact ? 'min-h-[200px]' : 'min-h-[320px]';

  if (count === 0) {
    return (
      <div className={cn('relative z-10 flex h-full w-full items-center justify-center rounded-lg bg-secondary/20', minHeightClass)}>
        <p className="text-sm text-muted-foreground">Photos unavailable</p>
      </div>
    );
  }

  return (
    <div
      className={cn('group/photos relative z-10 h-full w-full overflow-hidden rounded-lg bg-secondary/10', minHeightClass)}
      style={{ ['--carousel-interval' as string]: `${CAROUSEL_INTERVAL_MS}ms` }}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${trackIndex * 100}%)`,
          transition: animate ? `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}` : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((photo, idx) => {
          const isActive = idx === trackIndex;
          const isHeld = heldIndex === idx && !isActive;

          return (
            <div
              key={`${photo}-${idx}`}
              className={cn('relative h-full min-w-full flex-shrink-0 overflow-hidden', minHeightClass)}
            >
              <div
                className={cn(
                  'relative h-full w-full',
                  isActive && enterBlur && !reduceMotion && 'photo-carousel-blur-in',
                )}
              >
                <ProgressiveImage
                  ref={isActive ? activeImgRef : undefined}
                  src={photo}
                  alt={`${title} ${loop ? ((idx - 1 + count) % count) + 1 : idx + 1}`}
                  loading={isActive ? 'eager' : 'lazy'}
                  placeholderSrc={null}
                  className={cn(
                    'photo-carousel-image absolute inset-0 h-full w-full object-cover motion-reduce:scale-100 motion-reduce:animate-none',
                    (isActive || isHeld) && !reduceMotion && 'photo-carousel-image--active',
                    isHeld && 'photo-carousel-image--held',
                    isActive && paused && 'photo-carousel-image--paused',
                  )}
                  style={
                    (isActive || isHeld) && !reduceMotion
                      ? ({ ['--ken-burns-scale' as string]: KEN_BURNS_SCALE } as React.CSSProperties)
                      : undefined
                  }
                  onImageError={(event) => handleImageError(photo, event)}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          );
        })}
      </div>

      {loop ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              go(-1, { withSound: true });
            }}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90 opacity-100 backdrop-blur-sm transition-all duration-200 hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              go(1, { withSound: true });
            }}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90 opacity-100 backdrop-blur-sm transition-all duration-200 hover:bg-black/60 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {validPhotos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to photo ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  isAnimatingRef.current = false;
                  setAnimate(true);
                  setTrackIndex(idx + 1);
                  play('page', { volume: 0.3 });
                }}
                className={`rounded-full transition-all duration-300 ${
                  idx === logicalIndex
                    ? 'h-1.5 w-4 bg-white'
                    : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/65'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
        {logicalIndex + 1} / {count}
      </div>
    </div>
  );
}
