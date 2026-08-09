'use client';

import { useCallback, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { CardTag } from '@/components/card-tag';
import { PlaygroundItemMedia } from '@/components/playground-phone-frame';
import { PlaygroundStackLogos } from '@/components/playground-stack-logos';
import type { PlaygroundItem } from '@/lib/playground-items';
import { cn } from '@/lib/utils';

export type PlaygroundSelection = {
  kind: 'item';
  id: string;
  title: string;
  question: string;
  tags: string[];
  item: PlaygroundItem;
  accessibilityLabel: string;
};

type PlaygroundDetailOverlayProps = {
  selection: PlaygroundSelection | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  builtWithLabel?: string;
};

export function PlaygroundDetailOverlay({
  selection,
  onClose,
  onPrevious,
  onNext,
  builtWithLabel = 'Built with',
}: PlaygroundDetailOverlayProps) {
  const handlePrevious = useCallback(() => {
    onPrevious?.();
  }, [onPrevious]);

  const handleNext = useCallback(() => {
    onNext?.();
  }, [onNext]);

  useEffect(() => {
    if (!selection) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [selection, onClose, handlePrevious, handleNext]);

  if (!selection) return null;

  const category = selection.tags[0] ?? 'Playground';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 text-foreground backdrop-blur-md md:flex-row">
      {/* Left info panel */}
      <aside className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-y-auto border-b border-border/60 bg-card md:max-h-none md:h-full md:w-[min(340px,36vw)] md:border-b-0 md:border-r">
        <div className="flex items-center gap-1 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Previous"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-2 sm:px-6">
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-muted-foreground">{category}</p>
            <h2 className="text-[1.35rem] font-semibold tracking-tight text-foreground sm:text-[1.5rem]">
              {selection.title}
            </h2>
          </div>

          <p className="text-[14px] leading-relaxed text-muted-foreground">
            {selection.question}
          </p>

          {selection.item.stack?.length ? (
            <PlaygroundStackLogos stack={selection.item.stack} label={builtWithLabel} />
          ) : null}

          {selection.tags.length > 0 ? (
            <div className="mt-auto space-y-3 border-t border-border/60 pt-5">
              <div className="flex items-start justify-between gap-4 text-[13px]">
                <span className="shrink-0 text-muted-foreground">Tags</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {selection.tags.map((tag) => (
                    <CardTag key={tag}>{tag}</CardTag>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main preview */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-10"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="relative z-10"
          onClick={(event) => event.stopPropagation()}
          role="presentation"
        >
          <PlaygroundItemMedia
            item={selection.item}
            accessibilityLabel={selection.accessibilityLabel}
            size="detail"
            interactive
          />
        </div>
      </div>
    </div>
  );
}

type PlaygroundMasonryCardProps = {
  title: string;
  onOpen: () => void;
  children: React.ReactNode;
  className?: string;
};

/** @deprecated Prefer PlaygroundCraftCard — kept for any legacy imports. */
export function PlaygroundMasonryCard({ title, onOpen, children, className }: PlaygroundMasonryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={title}
      className={cn(
        'group relative mb-3 w-full break-inside-avoid overflow-hidden rounded-2xl bg-neutral-200/80 text-left transition-transform duration-200 hover:-translate-y-0.5 dark:bg-[#1C1A12] md:mb-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60',
        className,
      )}
    >
      {children}
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-white/15 dark:text-white">
        <ArrowRight className="h-3.5 w-3.5 -rotate-45" strokeWidth={2} />
      </span>
    </button>
  );
}
