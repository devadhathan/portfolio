'use client';

import { cn } from '@/lib/utils';
import { PlaygroundItemMedia } from '@/components/playground-phone-frame';
import type { PlaygroundItem } from '@/lib/playground-items';

type PlaygroundCraftCardProps = {
  item: PlaygroundItem;
  title: string;
  accessibilityLabel: string;
  onOpen: () => void;
  className?: string;
};

/** CRAFT-style card: theme-aware shell, centered phone, mono title + stack footer. */
export function PlaygroundCraftCard({
  item,
  title,
  accessibilityLabel,
  onOpen,
  className,
}: PlaygroundCraftCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={title}
      data-cuelume-hover="page"
      data-cuelume-press
      data-cuelume-release
      className={cn(
        'group flex w-[min(280px,78vw)] shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card text-left last:border-r-0 transition-colors hover:bg-secondary/40 sm:w-full sm:min-h-[560px] sm:border-b sm:border-r',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50',
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center bg-card px-4 py-8 sm:px-5 sm:py-10">
        <PlaygroundItemMedia item={item} accessibilityLabel={accessibilityLabel} size="preview" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/30 px-3 py-2.5">
        <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-foreground sm:text-[11px]">
          {title}
        </span>
        <span className="shrink-0 truncate text-right font-mono text-[9px] font-medium uppercase tracking-[0.04em] text-muted-foreground sm:text-[10px]">
          {item.stackLabel}
        </span>
      </div>
    </button>
  );
}
