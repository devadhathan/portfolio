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

/** Playground card aligned with home bento rhythm: rounded shell, preview, footer. */
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
        'group flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-2xl border border-border/55 bg-transparent text-left transition-colors hover:border-border/80 sm:min-h-[420px] dark:border-border/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center bg-transparent px-4 py-8 sm:px-5 sm:py-10">
        <PlaygroundItemMedia item={item} accessibilityLabel={accessibilityLabel} size="preview" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-transparent px-4 py-3">
        <span className="truncate text-[13px] font-medium tracking-tight text-foreground">
          {title}
        </span>
        <span className="shrink-0 truncate text-right text-[11px] text-muted-foreground/70">
          {item.stackLabel}
        </span>
      </div>
    </button>
  );
}
