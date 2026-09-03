'use client';

import { FeedProjectCard, PhoneFrame } from '@/components/feed-project-card';
import { AgentDogIcon } from '@/components/agent-dog-icon';
import { AgentOrb } from '@/components/agent-orb';
import { cn } from '@/lib/utils';
import type { PlaygroundItem } from '@/lib/playground-items';

export type PlaygroundItemCopy = {
  title: string;
  question: string;
  tags: string[];
  accessibilityLabel: string;
};

type PlaygroundFeedCardProps = {
  item: PlaygroundItem;
  title: string;
  question: string;
  tags: string[];
  accessibilityLabel: string;
  statusLabel?: string;
  className?: string;
};

export function PlaygroundFeedCard({
  item,
  title,
  question,
  tags,
  accessibilityLabel,
  statusLabel,
  className,
}: PlaygroundFeedCardProps) {
  return (
    <FeedProjectCard
      title={title}
      subtitle={question}
      statusLabel={statusLabel}
      tags={tags}
      className={className}
    >
      <PhoneFrame aspectRatio={item.aspect.replace('/', ' / ')} maxWidth={156}>
        {item.media.type === 'video' ? (
          <video
            className="h-full w-full object-cover"
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
            className="h-full w-full object-cover"
            src={item.media.src}
            alt={accessibilityLabel}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#12100e]">
            <AgentOrb size="md" hoverScale={false} alwaysAwake />
          </div>
        )}
      </PhoneFrame>
    </FeedProjectCard>
  );
}

type PlaygroundBuildingFeedCardProps = {
  title: string;
  description: string;
  statusLabel: string;
  tags: string[];
  className?: string;
};

export function PlaygroundBuildingFeedCard({
  title,
  description,
  statusLabel,
  tags,
  className,
}: PlaygroundBuildingFeedCardProps) {
  return (
    <FeedProjectCard
      title={title}
      subtitle={description}
      statusLabel={statusLabel}
      tags={tags}
      className={className}
    >
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl border border-border/40 bg-secondary/20 p-4">
        <AgentDogIcon className="h-16 w-16 opacity-90" />
      </div>
    </FeedProjectCard>
  );
}

type PlaygroundGroupFeedCardProps = {
  title: string;
  question: string;
  tags: string[];
  items: PlaygroundItem[];
  getCopy: (id: string) => PlaygroundItemCopy;
  className?: string;
};

export function PlaygroundGroupFeedCard({
  title,
  question,
  tags,
  items,
  getCopy,
  className,
}: PlaygroundGroupFeedCardProps) {
  return (
    <FeedProjectCard title={title} subtitle={question} tags={tags} className={className}>
      <div className={cn('flex flex-wrap items-center justify-center gap-3')}>
        {items.map((item) => {
          const copy = getCopy(item.id);
          return (
            <PhoneFrame key={item.id} aspectRatio={item.aspect.replace('/', ' / ')} maxWidth={132}>
              {item.media.type === 'video' ? (
                <video
                  className="h-full w-full object-cover"
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
                  className="h-full w-full object-cover"
                  src={item.media.src}
                  alt={copy.accessibilityLabel}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#12100e]">
                  <AgentOrb size="sm" hoverScale={false} alwaysAwake />
                </div>
              )}
            </PhoneFrame>
          );
        })}
      </div>
    </FeedProjectCard>
  );
}
