'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardTag } from '@/components/card-tag';
import { MiniPixelIconCreator } from '@/components/mini-pixel-icon-creator';

type SideProjectCardProps = {
  title: string;
  url: string;
  href: string;
  tagLabel?: string;
  createIconLabel: string;
  startDrawLabel: string;
  retryLabel: string;
  cancelLabel: string;
  downloadLabel: string;
  generatingLabel: string;
  errorEmptyLabel: string;
  apiErrorLabel: string;
  className?: string;
};

export function SideProjectCard({
  title,
  url,
  href,
  tagLabel,
  createIconLabel,
  startDrawLabel,
  retryLabel,
  cancelLabel,
  downloadLabel,
  generatingLabel,
  errorEmptyLabel,
  apiErrorLabel,
  className,
}: SideProjectCardProps) {
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <div
      className={cn('flex flex-col overflow-hidden', className)}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      <div className="px-4 pt-[18px]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex max-w-full flex-wrap items-center gap-2"
        >
          <span className="text-[15px] font-medium tracking-tight text-foreground">{title}</span>
          {tagLabel ? <CardTag>{tagLabel}</CardTag> : null}
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-foreground/55 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-foreground"
            strokeWidth={1.5}
          />
        </a>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">{url}</p>
      </div>

      <div className="p-3 pt-3">
        <div className="relative overflow-hidden rounded-lg border border-border/40 bg-secondary/20 py-3">
          <MiniPixelIconCreator
            cardHovered={cardHovered}
            createLabel={createIconLabel}
            startDrawLabel={startDrawLabel}
            retryLabel={retryLabel}
            cancelLabel={cancelLabel}
            downloadLabel={downloadLabel}
            generatingLabel={generatingLabel}
            errorEmptyLabel={errorEmptyLabel}
            apiErrorLabel={apiErrorLabel}
          />
        </div>
      </div>
    </div>
  );
}
