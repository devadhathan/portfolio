'use client';

import { ArrowUpRight } from 'lucide-react';
import { CardTag } from '@/components/card-tag';
import { cn } from '@/lib/utils';

export const WORDSMITH_BLUEPRINTS_URL = 'https://www.wordsmith.ai/products/blueprints';

type WordsmithCardProps = {
  title: string;
  tagLabel?: string;
  yearLabel?: string;
  description: string;
  href?: string;
  className?: string;
};

export function WordsmithCard({
  title,
  tagLabel,
  yearLabel,
  description,
  href = WORDSMITH_BLUEPRINTS_URL,
  className,
}: WordsmithCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cuelume-card-hover
      data-cuelume-press
      data-cuelume-release
      className={cn(
        'group/ws flex h-full min-h-[360px] flex-col overflow-hidden outline-none sm:min-h-[520px]',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative z-10 shrink-0 px-4 pt-4 pb-2">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <span className="card-title-type">{title}</span>
          {tagLabel ? <CardTag>{tagLabel}</CardTag> : null}
          {yearLabel ? <CardTag>{yearLabel}</CardTag> : null}
          <ArrowUpRight
            className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-300 group-hover/ws:translate-x-0.5 group-hover/ws:opacity-100"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="card-body-type mt-4 line-clamp-4">
          {description}
        </p>
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-3 top-[8%] w-[122%] origin-left scale-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/ws:scale-[1.04] sm:left-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/40 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-shadow duration-500 group-hover/ws:shadow-[0_10px_24px_rgba(0,0,0,0.24)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/wordsmith-preview.png"
              alt="Wordsmith AI Blueprints"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
