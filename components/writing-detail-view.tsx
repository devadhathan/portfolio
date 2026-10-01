'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getWritingById, type WritingBlock } from '@/lib/writings';
import { cn } from '@/lib/utils';

type WritingDetailViewProps = {
  writingId: string;
  className?: string;
};

function prefersLightVideoLoad() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  try {
    return Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
  } catch {
    return false;
  }
}

/** Full-frame story video — no edge crop; loads only when on-screen. */
function StoryVideo({
  src,
  endAt,
  poster,
  label,
}: {
  src: string;
  endAt?: number;
  poster?: string;
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lightLoad, setLightLoad] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video) return;

    const light = prefersLightVideoLoad();
    setLightLoad(light);
    video.preload = 'none';

    const onTimeUpdate = () => {
      if (endAt != null && video.currentTime >= endAt) {
        video.currentTime = 0;
        if (!light) void video.play().catch(() => {});
        else video.pause();
      }
    };
    const onEnded = () => {
      if (endAt != null) return;
      video.currentTime = 0;
      if (!light) void video.play().catch(() => {});
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        // Low-data / reduced-motion: show poster + controls; user starts playback.
        if (light) {
          if (video.preload === 'none') video.preload = 'metadata';
          return;
        }
        if (video.preload !== 'auto') video.preload = 'auto';
        void video.play().catch(() => {});
      },
      { rootMargin: '120px 0px', threshold: 0.2 },
    );

    io.observe(host);
    return () => {
      io.disconnect();
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.pause();
    };
  }, [src, endAt]);

  return (
    <div
      ref={hostRef}
      className="writing-story-media relative my-2 w-full overflow-hidden rounded-md bg-[#0a0a0a]"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="block h-auto w-full"
        muted
        playsInline
        controls={lightLoad}
        preload="none"
        aria-label={label}
      />
    </div>
  );
}

function StoryMediaFrame({
  kind,
  src,
  endAt,
  poster,
  label,
  alt,
}: {
  kind: 'video' | 'image';
  src: string;
  endAt?: number;
  poster?: string;
  label?: string;
  alt?: string;
}) {
  const empty = !src;

  if (!empty && kind === 'video') {
    return (
      <StoryVideo
        src={src}
        endAt={endAt}
        poster={poster}
        label={label || 'Product demo'}
      />
    );
  }

  return (
    <div
      className={cn(
        'writing-story-media relative my-2 w-full overflow-hidden rounded-md bg-secondary/25',
        empty && 'border border-dashed border-border/50 aspect-[16/10]',
      )}
    >
      {!empty && kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ''}
          className="block h-auto w-full"
          draggable={false}
        />
      ) : null}
      {empty ? (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-muted-foreground/70">
          Add {kind}
        </div>
      ) : null}
    </div>
  );
}

function StoryBody({ blocks }: { blocks: WritingBlock[] }) {
  return (
    <div className="writing-story-body w-full space-y-6 text-[15px] leading-7 text-foreground/85 sm:space-y-7 sm:text-[16px] sm:leading-[1.7]">
      {blocks.map((block, i) => {
        if (block.type === 'h') {
          return (
            <h2
              key={i}
              className="writing-story-h pt-8 text-[17px] font-medium tracking-[-0.01em] text-foreground first:pt-0 sm:pt-10 sm:text-[18px]"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === 'video') {
          return (
            <StoryMediaFrame
              key={i}
              kind="video"
              src={block.src}
              endAt={block.endAt}
              poster={block.poster}
              label={block.label}
            />
          );
        }
        if (block.type === 'image') {
          return (
            <StoryMediaFrame
              key={i}
              kind="image"
              src={block.src}
              alt={block.alt}
            />
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}

const linkClass =
  'inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground';

export function WritingDetailView({ writingId, className }: WritingDetailViewProps) {
  const writing = getWritingById(writingId);

  if (!writing) {
    return (
      <div className={cn('px-4 py-8 text-sm text-muted-foreground', className)}>
        Writing not found.
      </div>
    );
  }

  const hasLinks = Boolean(writing.href || writing.mediumUrl);

  return (
    <article className={cn('writing-detail w-full', className)}>
      <div className="writing-detail__col">
        <h1 className="writing-detail__title tracking-tight text-foreground">{writing.title}</h1>

        <div className="writing-detail__meta">
          <p className="writing-detail__date text-[13px] tabular-nums">
            {writing.dateLabel}
          </p>
          {writing.description ? (
            <p className="writing-detail__lede text-[15px] leading-7 text-foreground/80 sm:text-[16px] sm:leading-[1.65]">
              {writing.description}
            </p>
          ) : null}
        </div>

        <StoryBody blocks={writing.body} />

        {hasLinks ? (
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2">
            {writing.href ? (
              <a
                href={writing.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cuelume-hover="tick"
                className={linkClass}
              >
                Open {writing.title}
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </a>
            ) : null}
            {writing.mediumUrl ? (
              <a
                href={writing.mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cuelume-hover="tick"
                className={linkClass}
              >
                Read on Medium
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
