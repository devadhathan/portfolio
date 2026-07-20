'use client';

import { AgentDogIcon } from '@/components/agent-dog-icon';
import { CardTag } from '@/components/card-tag';
import { cn } from '@/lib/utils';

type AgentDogCardProps = {
  sectionLabel?: string;
  title: string;
  description: string;
  statusLabel: string;
  className?: string;
};

export function AgentDogCard({
  sectionLabel,
  title,
  description,
  statusLabel,
  className,
}: AgentDogCardProps) {
  return (
    <div
      className={cn('flex h-full min-h-[280px] flex-col overflow-hidden', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="shrink-0 px-4 pt-[18px]">
        {sectionLabel ? (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/55">
            {sectionLabel}
          </p>
        ) : null}
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <span className="text-[15px] font-medium tracking-tight text-foreground">{title}</span>
          <CardTag className="border-primary/25 bg-primary/10 text-primary">{statusLabel}</CardTag>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">{description}</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-4 pt-3">
        <AgentDogIcon className="w-28 sm:w-32" />
      </div>
    </div>
  );
}
