'use client';

import { useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CardTag } from '@/components/card-tag';
import { PlaygroundMediaContent, PlaygroundPhoneFrame } from '@/components/playground-phone-frame';
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
  escLabel?: string;
};

export function PlaygroundDetailOverlay({
  selection,
  onClose,
  onPrevious,
  onNext,
  escLabel = 'Esc',
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f3f3f3] text-neutral-900 dark:bg-[#151110] dark:text-foreground">
      <header className="shrink-0 flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/15 text-[11px]">
            ◆
          </span>
          <span className="truncate text-sm font-medium tracking-tight sm:text-[15px]">{selection.title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2.5 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-neutral-900 dark:text-muted-foreground dark:hover:bg-white/[0.06]"
        >
          {escLabel}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
          <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8 lg:gap-12">
          <div className="order-1 w-full max-w-sm justify-self-center space-y-3 text-center md:order-none md:max-w-[240px] md:justify-self-start md:self-center md:text-left lg:max-w-[260px]">
            <p className="text-[13px] leading-relaxed text-neutral-600 sm:text-sm dark:text-muted-foreground">
              {selection.question}
            </p>
            {selection.tags.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5 md:justify-start">
                {selection.tags.map((tag) => (
                  <CardTag key={tag}>{tag}</CardTag>
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-2 justify-self-center md:order-none">
            <PlaygroundPhoneFrame size="detail">
              <PlaygroundMediaContent
                item={selection.item}
                accessibilityLabel={selection.accessibilityLabel}
                interactive
              />
            </PlaygroundPhoneFrame>
          </div>

          <div className="hidden md:block" aria-hidden />
          </div>
        </div>
      </div>

      <footer className="shrink-0 flex items-center justify-center gap-8 border-t border-black/[0.06] bg-inherit pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 text-neutral-400 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous"
          className="rounded-full p-2 transition-colors hover:bg-black/[0.05] hover:text-neutral-700 dark:hover:bg-white/[0.06] dark:hover:text-foreground"
        >
          <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next"
          className="rounded-full p-2 transition-colors hover:bg-black/[0.05] hover:text-neutral-700 dark:hover:bg-white/[0.06] dark:hover:text-foreground"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </footer>
    </div>
  );
}

type PlaygroundClipCardProps = {
  title: string;
  icon?: React.ReactNode;
  onOpen?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function PlaygroundClipCard({ title, icon, onOpen, children, className }: PlaygroundClipCardProps) {
  const shellClass = cn(
    'w-full overflow-hidden rounded-[1.25rem] border border-black/[0.08] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#1B1917]',
    onOpen && 'transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
    className,
  );

  const header = (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/15 text-[10px] text-violet-700 dark:text-violet-300">
            {icon}
          </span>
        ) : null}
        <span className="truncate text-[14px] font-medium tracking-tight text-neutral-900 sm:text-[15px] dark:text-foreground">
          {title}
        </span>
      </div>
      {onOpen ? (
        <span className="text-lg leading-none text-neutral-400 transition-transform group-hover:translate-x-0.5 dark:text-muted-foreground">
          ›
        </span>
      ) : null}
    </>
  );

  const body = (
    <div className="flex min-h-[480px] items-center justify-center overflow-hidden bg-neutral-100 px-3 py-6 sm:min-h-[520px] sm:px-6 sm:py-8 dark:bg-[#151110]">
      {children}
    </div>
  );

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={cn('group', shellClass)}>
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3.5 sm:px-5 dark:border-white/[0.06]">
          {header}
        </div>
        {body}
      </button>
    );
  }

  return (
    <article className={shellClass}>
      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3.5 sm:px-5 dark:border-white/[0.06]">
        {header}
      </div>
      {body}
    </article>
  );
}
