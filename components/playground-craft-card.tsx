'use client';

import { cn } from '@/lib/utils';
import { PlaygroundItemMedia } from '@/components/playground-phone-frame';
import { useCardHoverGlow } from '@/components/card-hover-glow';
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
  const { glow, glowHandlers } = useCardHoverGlow();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={title}
      data-cuelume-hover="page"
      data-cuelume-press
      data-cuelume-release
      {...glowHandlers}
      className={cn(
        'group relative flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-2xl border border-border/35 bg-transparent text-left sm:min-h-[420px] dark:border-[#1f1f1f]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      {glow}
      <div className="relative z-[2] flex flex-1 items-center justify-center bg-transparent px-4 py-8 sm:px-5 sm:py-10">
        <PlaygroundItemMedia item={item} accessibilityLabel={accessibilityLabel} size="preview" />
      </div>

      <div className="relative z-[2] flex items-center justify-between gap-3 border-t border-border/35 bg-transparent px-4 py-3 dark:border-[#1f1f1f]">
        <span className="truncate text-[15px] font-medium leading-[1.4] tracking-[-0.008em] text-foreground">
          {title}
        </span>
        <span className="shrink-0 truncate text-right text-[13px] text-muted-foreground/70">
          {item.stackLabel}
        </span>
      </div>
    </button>
  );
}
