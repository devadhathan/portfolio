'use client';

import { CardTag } from '@/components/card-tag';
import { AgentOrb } from '@/components/agent-orb';
import { cn } from '@/lib/utils';
import type { PlaygroundItem } from '@/lib/playground-items';

export type PlaygroundItemCopy = {
  title: string;
  question: string;
  tags: string[];
  accessibilityLabel: string;
};

type PlaygroundItemRowProps = {
  index: number;
  item: PlaygroundItem;
  title: string;
  question: string;
  tags: string[];
  accessibilityLabel: string;
  reverse?: boolean;
  compact?: boolean;
};

export function PlaygroundItemRow({
  index,
  item,
  title,
  question,
  tags,
  accessibilityLabel,
  reverse = false,
  compact = false,
}: PlaygroundItemRowProps) {
  const mediaHeight = compact
    ? 'clamp(140px, 38vw, 220px)'
    : 'clamp(160px, 42vw, 260px)';

  const media = (
    <div
      className="relative mx-auto w-full max-w-[min(100%,180px)] shrink-0 overflow-hidden rounded-[1.15rem] bg-black/90 md:mx-0 md:max-w-[200px]"
      style={{
        aspectRatio: item.aspect.replace('/', ' / '),
        height: mediaHeight,
      }}
    >
      {item.media.type === 'video' ? (
        <video
          className="h-full w-full object-contain"
          src={item.media.src}
          poster={item.media.poster}
          aria-label={accessibilityLabel}
          controls
          loop
          playsInline
          muted
          preload="metadata"
        />
      ) : item.media.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full object-contain"
          src={item.media.src}
          alt={accessibilityLabel}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#12100e]">
          <AgentOrb size="md" hoverScale={false} alwaysAwake />
        </div>
      )}
    </div>
  );

  const copy = (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 text-center md:text-left sm:gap-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h2
        className={cn(
          'font-medium leading-snug tracking-tight text-foreground',
          compact ? 'text-[14px] sm:text-[15px]' : 'text-[15px] sm:text-[17px]',
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          'leading-relaxed text-muted-foreground',
          compact ? 'text-[12px]' : 'mx-auto max-w-sm text-[13px] md:mx-0',
        )}
      >
        {question}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 pt-0.5 md:justify-start">
        {tags.map((tag) => (
          <CardTag key={tag}>{tag}</CardTag>
        ))}
      </div>
    </div>
  );

  return (
    <article
      className={cn(
        'flex flex-col items-stretch gap-4 sm:gap-5 md:flex-row md:items-center md:gap-8',
        reverse && 'md:flex-row-reverse',
      )}
    >
      {media}
      {copy}
    </article>
  );
}

type PlaygroundBrandGroupProps = {
  title: string;
  question: string;
  tags: string[];
  items: PlaygroundItem[];
  startIndex: number;
  getCopy: (id: string) => PlaygroundItemCopy;
};

export function PlaygroundBrandGroup({
  title,
  question,
  tags,
  items,
  startIndex,
  getCopy,
}: PlaygroundBrandGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {String(startIndex + 1).padStart(2, '0')} - {String(startIndex + items.length).padStart(2, '0')}
        </p>
        <h2 className="text-[15px] font-medium leading-snug tracking-tight text-foreground sm:text-[17px]">
          {title}
        </h2>
        <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted-foreground md:mx-0">{question}</p>
        <div className="flex flex-wrap justify-center gap-1.5 pt-0.5 md:justify-start">
          {tags.map((tag) => (
            <CardTag key={tag}>{tag}</CardTag>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {items.map((item) => {
          const copy = getCopy(item.id);
          return (
            <div
              key={item.id}
              className="relative mx-auto w-full max-w-[140px] min-w-0 overflow-hidden rounded-[1rem] bg-black/90 sm:max-w-[160px]"
              style={{
                aspectRatio: item.aspect.replace('/', ' / '),
              }}
            >
              {item.media.type === 'video' ? (
                <video
                  className="h-full w-full object-contain"
                  src={item.media.src}
                  poster={item.media.poster}
                  aria-label={copy.accessibilityLabel}
                  controls
                  loop
                  playsInline
                  muted
                  preload="metadata"
                />
              ) : item.media.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-full w-full object-contain"
                  src={item.media.src}
                  alt={copy.accessibilityLabel}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#12100e]">
                  <AgentOrb size="sm" hoverScale={false} alwaysAwake />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
