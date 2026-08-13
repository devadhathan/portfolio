'use client';

import { CardTag } from '@/components/card-tag';
import { ImageComparison } from '@/components/image-comparison';
import { cn } from '@/lib/utils';

type NesoiHomeCardProps = {
  title: string;
  description: string;
  statusLabel: string;
  onOpen: () => void;
  className?: string;
};

/**
 * Home bento card for Nesoi — comparison fills the remaining card height.
 */
export function NesoiHomeCard({
  title,
  description,
  statusLabel,
  onOpen,
  className,
}: NesoiHomeCardProps) {
  return (
    <div
      className={cn(
        'group/nesoi flex h-full min-h-0 w-full flex-col overflow-hidden text-left',
        className,
      )}
    >
      <button
        type="button"
        data-cuelume-press
        data-cuelume-release
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="relative z-10 w-full shrink-0 px-4 pt-4 pb-2 text-left outline-none"
      >
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <span className="card-title-type">{title}</span>
          <CardTag>{statusLabel}</CardTag>
        </div>
        <p className="card-body-type mt-4 line-clamp-2">
          {description}
        </p>
      </button>

      <div className="relative min-h-0 flex-1 px-4 pb-4 pt-2">
        <div className="h-full origin-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nesoi:scale-[1.015]">
          <ImageComparison
            beforeSrc="/CRM/initial image.png"
            afterSrc="/CRM/nesoi-solution.png"
            beforeAlt="Nesoi challenge framing"
            afterAlt="Nesoi AI creation tool"
            beforeLabel="Before"
            afterLabel="After"
            compact
            initialPosition={46}
            className="h-full shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
          />
        </div>
      </div>
    </div>
  );
}
