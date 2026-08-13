'use client';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type OsBackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  'aria-label'?: string;
};

/** Shared frosted back control used in Ask AI + case studies. */
export function OsBackButton({
  onClick,
  label = 'Back',
  className,
  'aria-label': ariaLabel,
}: OsBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-sm text-foreground/80 shadow-sm backdrop-blur-md transition-colors hover:bg-background/90 hover:text-foreground',
        className,
      )}
      aria-label={ariaLabel ?? label}
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}
