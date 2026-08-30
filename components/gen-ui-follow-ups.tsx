'use client';

import { useMemo } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { getFollowUps } from '@/lib/gen-ui-follow-ups';
import { cn } from '@/lib/utils';

type GenUIFollowUpsProps = {
  prompt: string;
  askedPrompts?: string[];
  /** Stable per-message value so the trio varies between answers, not renders. */
  seed?: string;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
};

export function GenUIFollowUps({
  prompt,
  askedPrompts,
  seed,
  onSelect,
  disabled = false,
  className,
}: GenUIFollowUpsProps) {
  const suggestions = useMemo(
    () => getFollowUps(prompt, askedPrompts ?? [], seed ?? ''),
    [prompt, askedPrompts, seed],
  );

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-sm uppercase tracking-[0.08em] text-muted-foreground/60">Ask next</span>
      <div className="flex flex-col divide-y divide-border/40 dark:divide-white/[0.08]">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.prompt)}
            disabled={disabled}
            className="group flex w-full items-center gap-2.5 py-2.5 text-left text-base leading-[1.75] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-50 disabled:hover:text-muted-foreground md:text-lg dark:text-foreground/75 dark:hover:text-foreground"
          >
            <CornerDownLeft
              className="h-4 w-4 shrink-0 -scale-x-100 opacity-40 transition-opacity group-hover:opacity-80"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
