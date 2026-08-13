'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCaseStudyBackground } from '@/lib/case-study-backgrounds';

type ImageComparisonProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  /** Initial slider position 0–100. */
  initialPosition?: number;
  /** Painting stage behind the comparison (seed or explicit path). */
  backgroundSeed?: string;
  backgroundSrc?: string;
  /** Compact preview for home bento cards. */
  compact?: boolean;
  /** Hide Before/After chips. */
  hideLabels?: boolean;
};

/**
 * Before/after image comparison slider.
 * Images keep their natural aspect; handle is glass with a solid separator line.
 */
export function ImageComparison({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
  initialPosition = 50,
  backgroundSeed,
  backgroundSrc,
  compact = false,
  hideLabels = false,
}: ImageComparisonProps) {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(initialPosition);
  const dragging = useRef(false);
  const painting =
    backgroundSrc ?? (backgroundSeed ? getCaseStudyBackground(backgroundSeed) : null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [updateFromClientX]);

  const slider = (
    <div
      ref={containerRef}
      role="group"
      aria-labelledby={labelId}
      className={cn(
        'relative w-full select-none overflow-hidden bg-secondary/25',
        compact
          ? 'h-full rounded-xl border border-border/45'
          : painting
            ? 'rounded-xl border border-white/30 shadow-[0_18px_50px_rgba(0,0,0,0.35)]'
            : 'rounded-2xl border border-border/50 shadow-lg',
        className,
      )}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span id={labelId} className="sr-only">
        Image comparison slider. Drag to compare {beforeLabel} and {afterLabel}.
      </span>

      {/* After image sets natural height (non-compact) or fills compact card */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        width={1024}
        height={661}
        className={cn(
          'pointer-events-none block w-full',
          compact ? 'h-full object-contain object-center' : 'h-auto object-contain',
        )}
        sizes={compact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 90vw'}
        draggable={false}
        priority={false}
      />

      {/* Before — same box, clipped; object-contain keeps original ratio */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          className="object-contain object-center"
          sizes={compact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 90vw'}
          draggable={false}
          priority={false}
        />
      </div>

      {/* Solid glass separator + sonar handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{ left: `${position}%` }}
      >
        {/* Full-height filled separator — softer black */}
        <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full border border-white/30 bg-black/40 shadow-[0_0_10px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-md" />

        {/* Sonar rings — small core, wide spread */}
        <div
          className={cn(
            'comparison-sonar-ring absolute left-1/2 top-1/2 rounded-full border border-black/50 bg-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.45)]',
            compact ? 'h-4 w-4' : 'h-5 w-5',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'comparison-sonar-ring comparison-sonar-ring-delay absolute left-1/2 top-1/2 rounded-full border border-black/25 bg-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.25)]',
            compact ? 'h-4 w-4' : 'h-5 w-5',
          )}
          aria-hidden
        />

        {/* Glass drag handle — softer black */}
        <div
          className={cn(
            'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white',
            'border border-white/30 bg-black/45 shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.3)]',
            'backdrop-blur-xl backdrop-saturate-150',
            compact ? 'h-7 w-7' : 'h-9 w-9',
          )}
        >
          <svg
            width={compact ? 14 : 16}
            height={compact ? 14 : 16}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="opacity-90"
          >
            <path
              d="M8 12H3M3 12L6 9M3 12L6 15M16 12H21M21 12L18 9M21 12L18 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {!hideLabels && (
        <>
          <span
            className={cn(
              'pointer-events-none absolute left-2 top-2 z-10 rounded-full border border-white/20 bg-black/50 font-medium uppercase tracking-wide text-white backdrop-blur-md',
              compact ? 'left-1.5 top-1.5 px-1.5 py-0.5 text-[9px] tracking-wider' : 'left-3 top-3 px-2 py-1 text-[12px]',
            )}
          >
            {beforeLabel}
          </span>
          <span
            className={cn(
              'pointer-events-none absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-black/50 font-medium uppercase tracking-wide text-white backdrop-blur-md',
              compact ? 'right-1.5 top-1.5 px-1.5 py-0.5 text-[9px] tracking-wider' : 'right-3 top-3 px-2 py-1 text-[12px]',
            )}
          >
            {afterLabel}
          </span>
        </>
      )}

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        aria-label="Comparison position"
        className="absolute inset-0 z-20 cursor-ew-resize opacity-0"
        onChange={(e) => setPosition(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  if (!painting) return slider;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 shadow-lg">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={painting}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 90vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/15" />
      </div>
      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl">{slider}</div>
      </div>
    </div>
  );
}
