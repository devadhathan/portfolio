'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCaseStudyBackground } from '@/lib/case-study-backgrounds';

type CaseStudyScreenStageProps = {
  /** Stable seed for painting assignment (e.g. projectId + media path). */
  seed: string;
  /** Optional explicit painting; otherwise derived from seed. */
  backgroundSrc?: string;
  alt: string;
  /** How the UI sits on the painting. */
  frame?: 'phone' | 'landscape';
  media:
    | { type: 'image'; src: string }
    | { type: 'video'; src: string; poster?: string; autoPlay?: boolean; controls?: boolean };
  onClick?: () => void;
  className?: string;
};

/**
 * Painting stage with an inset interface screen.
 * Height follows the media — not locked to 16:9 — so screens keep their natural aspect.
 * Used inside case-study detail pages only — not Work grid thumbnails.
 */
export function CaseStudyScreenStage({
  seed,
  backgroundSrc,
  alt,
  frame = 'landscape',
  media,
  onClick,
  className,
}: CaseStudyScreenStageProps) {
  const painting = backgroundSrc ?? getCaseStudyBackground(seed);
  const isPhone = frame === 'phone';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-cuelume-hover={onClick ? 'tick' : undefined}
      data-cuelume-press={onClick ? true : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'relative w-full overflow-hidden shadow-lg',
        onClick && 'cursor-pointer group',
        className,
      )}
      data-case-bleed
    >
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
        {isPhone ? (
          <div className="relative w-[min(280px,72%)] aspect-[9/16] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.02]">
            {media.type === 'image' ? (
              <Image
                src={media.src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 45vw, 280px"
              />
            ) : (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                poster={media.poster}
                autoPlay={media.autoPlay ?? true}
                muted
                loop
                playsInline
                controls={media.controls}
                aria-label={alt}
              >
                <source src={media.src} type="video/mp4" />
              </video>
            )}
          </div>
        ) : (
          <div className="relative w-full max-w-5xl overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-[1.01]">
            {media.type === 'image' ? (
              <Image
                src={media.src}
                alt={alt}
                width={1920}
                height={1080}
                className="h-auto w-full"
                sizes="(max-width: 768px) 90vw, 70vw"
              />
            ) : (
              <video
                className="h-auto w-full"
                poster={media.poster}
                autoPlay={media.autoPlay ?? false}
                muted={media.autoPlay ?? false}
                loop={media.autoPlay ?? false}
                playsInline
                controls={media.controls ?? true}
                aria-label={alt}
              >
                <source src={media.src} type="video/mp4" />
              </video>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
