'use client';

import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { writingsSorted, type Writing } from '@/lib/writings';
import { cn, focusRing } from '@/lib/utils';

type WritingSectionProps = {
  className?: string;
  onWritingSelect?: (writingId: string) => void;
};

function openExternal(writing: Writing) {
  const url = writing.mediumUrl || writing.href;
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function WritingSection({ className, onWritingSelect }: WritingSectionProps) {
  const t = useTranslations('nav');
  const items = useMemo(() => writingsSorted(), []);

  if (items.length === 0) return null;

  const title = t('writing');

  return (
    <section className={cn('os-col w-full', className)} aria-label={title}>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-[16px] font-medium text-muted-foreground">{title}</h2>
      </div>

      <ul className="writing-index flex flex-col">
        {items.map((writing, index) => {
          const prev = items[index - 1];
          const showYear = !prev || prev.year !== writing.year;
          const isExternal = Boolean(writing.externalOnly);

          return (
            <li
              key={writing.id}
              className="border-t border-border/40 last:border-b"
            >
              <button
                type="button"
                onClick={() => {
                  if (isExternal) {
                    openExternal(writing);
                    return;
                  }
                  onWritingSelect?.(writing.id);
                }}
                data-cuelume-hover="tick"
                className={cn(
                  'group grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-4 py-3.5 text-left sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-4',
                  focusRing,
                )}
              >
                <span
                  className="pt-0.5 text-[14px] tabular-nums text-muted-foreground/70 transition-colors group-hover:text-muted-foreground sm:text-[15px]"
                  aria-hidden={!showYear}
                >
                  {showYear ? writing.year : ''}
                </span>
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[15px] font-medium leading-[1.4] tracking-[-0.008em] text-foreground/70 transition-colors group-hover:text-foreground sm:text-[16px]">
                    {writing.title}
                    {isExternal ? (
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  {writing.description ? (
                    <span className="mt-1 block max-w-[42ch] text-[13px] leading-[1.45] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground sm:text-[14px]">
                      {writing.description}
                    </span>
                  ) : null}
                </span>
                <time
                  dateTime={`${writing.year}-${writing.dateShort.split('/').reverse().join('-')}`}
                  className="whitespace-nowrap pt-0.5 text-right text-[13px] tabular-nums text-muted-foreground/70 transition-colors group-hover:text-muted-foreground sm:text-[14px]"
                >
                  {writing.dateShort}
                </time>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
