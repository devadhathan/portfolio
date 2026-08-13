'use client';

import { cn } from '@/lib/utils';
import { CardTag } from '@/components/card-tag';

type MusicNotchCardProps = {
  title: string;
  comingSoon: string;
  tagline?: string;
  tagLabel?: string;
  previewOnly?: boolean;
  className?: string;
};

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('h-10 w-auto text-foreground/35', className)}
      fill="currentColor"
    >
      <path d="M16.365 1.43c0 1.14-.42 2.08-1.24 2.82-.9.82-1.97 1.22-3.13 1.15-.14-1.09.38-2.14 1.12-2.88.84-.83 2.2-1.36 3.25-1.09ZM20.88 17.13c-.64 1.47-1.42 2.86-2.55 4.34-1.01 1.31-2.2 2.94-3.79 2.96-1.42.02-1.78-.92-3.71-.92-1.93 0-2.33.89-3.8.94-1.53.05-2.69-1.52-3.71-2.82-2.02-2.62-3.56-7.4-1.49-10.64 1.03-1.58 2.87-2.58 4.87-2.6 1.52-.03 2.95 1.02 3.87 1.02.9 0 2.59-1.26 4.37-1.08.74.03 2.82.3 4.15 2.26-.11.07-2.48 1.45-2.46 4.32.03 3.44 3.01 4.59 3.05 4.6-.03.08-.48 1.64-1.6 3.22Z" />
    </svg>
  );
}

function MediaControls({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 text-foreground/90', className)}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
        <path d="M8 1.5v7L3 5z" fill="currentColor" />
        <path d="M2 1.5v7L0 5z" fill="currentColor" />
      </svg>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
        <path d="M2 1.2v7.6L8.5 5z" fill="currentColor" />
      </svg>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
        <path d="M2 1.5v7l5-3.5z" fill="currentColor" />
        <path d="M8 1.5v7l2-1.5z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function MacBookNotchPreview() {
  return (
    <div className="relative h-[236px] w-full">
      <div className="absolute inset-x-0 top-0 bottom-[12px] overflow-hidden rounded-t-[10px] border border-b-0 border-border/40 bg-secondary/20">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <div
            className={cn(
              'relative overflow-hidden bg-muted/55',
              'border-x border-b border-border/55',
              'rounded-b-[9px]',
              'h-[11px] w-[42px]',
              'transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'group-hover/notch:h-[40px] group-hover/notch:w-[140px] group-hover/notch:rounded-b-[11px]',
            )}
          >
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                'opacity-100 group-hover/notch:opacity-0',
              )}
            >
              <div className="h-[3px] w-[3px] rounded-full bg-muted-foreground/50" />
            </div>

            <div
              className={cn(
                'flex h-full items-center gap-2 px-2 opacity-0 transition-opacity duration-300 delay-75',
                'group-hover/notch:opacity-100',
              )}
            >
              <div className="h-[20px] w-[20px] shrink-0 rounded-full bg-foreground/85" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-foreground/12">
                  <div className="notch-progress h-full w-[22%] rounded-full bg-foreground/75" />
                </div>
                <MediaControls className="scale-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 opacity-35 transition-opacity duration-300 group-hover/notch:opacity-20">
          <AppleLogo />
        </div>
      </div>

      <div className="absolute bottom-[7px] left-[3%] right-[3%] h-px bg-border/35" />
      <div className="absolute bottom-0 left-[6%] right-[6%] h-[6px] rounded-b-[3px] border border-t-0 border-border/40 bg-muted/35" />
    </div>
  );
}

export function MusicNotchCard({ title, comingSoon, tagline, tagLabel, previewOnly = false, className }: MusicNotchCardProps) {
  if (previewOnly) {
    return (
      <div
        className={cn('group/notch w-full', className)}
        data-cuelume-hover="chime"
        onClick={(e) => e.stopPropagation()}
      >
        <MacBookNotchPreview />
      </div>
    );
  }

  return (
    <div
      className={cn('group/notch flex h-full min-h-[240px] flex-col overflow-hidden', className)}
      data-cuelume-hover="chime"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <span className="card-title-type">{title}</span>
          {tagLabel ? <CardTag>{tagLabel}</CardTag> : null}
          <CardTag>{comingSoon}</CardTag>
        </div>
        {tagline ? <p className="card-body-type mt-4">{tagline}</p> : null}
      </div>

      <div className="mt-auto px-4 pb-4 pt-2">
        <MacBookNotchPreview />
      </div>
    </div>
  );
}
