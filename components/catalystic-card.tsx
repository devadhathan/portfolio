'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { play } from 'cuelume';
import { CardTag } from '@/components/card-tag';
import { cn } from '@/lib/utils';

export const CATALYSTIC_URL = 'https://catalysticui.space/landing.html';

type CatalysticCardProps = {
  sectionLabel?: string;
  title: string;
  description: string;
  statusLabel: string;
  href?: string;
  className?: string;
};

const REVEAL_DELAY_MS = 900;

export function CatalysticCard({
  sectionLabel,
  title,
  description,
  statusLabel,
  href = CATALYSTIC_URL,
  className,
}: CatalysticCardProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const didPlayReveal = useRef(false);

  const reveal = () => {
    setRevealed((prev) => {
      if (!prev && !didPlayReveal.current) {
        didPlayReveal.current = true;
        play('bloom', { volume: 0.35 });
      }
      return true;
    });
  };

  const hide = () => {
    didPlayReveal.current = false;
    setRevealed(false);
  };

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setHoverCapable(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (hoverCapable) return;

    const node = rootRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => reveal(), REVEAL_DELAY_MS);
        } else {
          if (timer) clearTimeout(timer);
          timer = null;
          hide();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [hoverCapable]);

  return (
    <a
      ref={rootRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cuelume-press
      data-cuelume-release
      className={cn(
        'group/cat flex h-full min-h-[360px] flex-col overflow-hidden outline-none sm:min-h-[300px]',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => {
        if (hoverCapable) reveal();
      }}
      onMouseLeave={() => {
        if (hoverCapable) hide();
      }}
      onFocus={() => {
        if (hoverCapable) reveal();
      }}
      onBlur={() => {
        if (hoverCapable) hide();
      }}
    >
      <div className="relative z-10 shrink-0 px-4 pt-4 pb-2">
        {sectionLabel ? (
          <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.22em] text-muted-foreground/55">
            {sectionLabel}
          </p>
        ) : null}
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <span className="card-title-type">{title}</span>
          <CardTag>{statusLabel}</CardTag>
          <ArrowUpRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-all duration-300',
              revealed ? 'translate-x-0.5 opacity-100' : 'opacity-0',
            )}
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="card-body-type mt-4 line-clamp-2">{description}</p>
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            'absolute inset-x-3 bottom-[-18%] top-[8%] origin-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-4',
            revealed ? 'rotate-[-7deg]' : 'rotate-[-2deg]',
          )}
        >
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-shadow duration-500',
              revealed && 'shadow-[0_10px_24px_rgba(0,0,0,0.24)]',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/catalystic-preview.png"
              alt="Catalystic UI"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
