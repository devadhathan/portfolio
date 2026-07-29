'use client';

import { useEffect, useRef, useState } from 'react';
import { play } from 'cuelume';
import { AgentThinkingIndicator } from '@/components/agent-thinking-indicator';
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

const fieldClass =
  'w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-[10px] text-foreground outline-none placeholder:text-muted-foreground/60';

const PROMPT =
  'A screen to book a salon appointment: pick a service, choose date and time, enter name and phone, confirm.';

const REVEAL_DELAY_MS = 1000;

function BookingForm() {
  const [service, setService] = useState('Haircut');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <div className="rounded-lg border border-border/50 bg-card p-2.5">
      <p className="text-[11px] font-semibold tracking-tight text-foreground">Book appointment</p>

      <label className="mt-2 block space-y-1">
        <span className="text-[9px] text-muted-foreground">Service</span>
        <select
          value={service}
          onChange={(event) => setService(event.target.value)}
          className={fieldClass}
        >
          <option>Haircut</option>
          <option>Color</option>
          <option>Blowout</option>
        </select>
      </label>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <label className="space-y-1">
          <span className="text-[9px] text-muted-foreground">Date</span>
          <input readOnly value="28/07/2026" className={fieldClass} />
        </label>
        <label className="space-y-1">
          <span className="text-[9px] text-muted-foreground">Time</span>
          <select className={fieldClass}>
            <option>09:00 AM</option>
            <option>11:30 AM</option>
            <option>02:00 PM</option>
          </select>
        </label>
      </div>

      <label className="mt-1.5 block space-y-1">
        <span className="text-[9px] text-muted-foreground">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className={fieldClass}
        />
      </label>

      <label className="mt-1.5 block space-y-1">
        <span className="text-[9px] text-muted-foreground">Phone</span>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone number"
          className={fieldClass}
        />
      </label>

      <button
        type="button"
        className="mt-2 w-full rounded-md bg-foreground py-1.5 text-[10px] font-medium text-background"
      >
        Confirm
      </button>
    </div>
  );
}

function CatalysticMiniPlayground({ revealed }: { revealed: boolean }) {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-secondary/15"
      onClick={(event) => event.preventDefault()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-2.5 py-1.5">
        <span className="text-[10px] font-medium text-foreground/80">Catalystic UI</span>
        <span className="text-[9px] text-muted-foreground">Chat</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto overscroll-contain px-2.5 pb-3 [scrollbar-width:thin]',
            'transition-[padding-top] duration-700 ease-in',
            revealed ? 'pt-2' : 'pt-[32%] sm:pt-[28%]',
          )}
        >
          <div className="w-full space-y-2">
            <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-sm bg-foreground p-3 text-[10px] leading-snug text-background sm:max-w-[70%]">
              {PROMPT}
            </div>

            <div
              className={cn(
                'overflow-hidden transition-all duration-500 ease-in',
                revealed
                  ? 'pointer-events-none max-h-0 -translate-y-1 opacity-0'
                  : 'max-h-10 translate-y-0 opacity-100',
              )}
            >
              <div className="px-0.5 py-1">
                <AgentThinkingIndicator label="Thinking…" />
              </div>
            </div>

            <div
              className={cn(
                'space-y-2 transition-all duration-700 ease-in',
                revealed
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: revealed ? '220ms' : '0ms' }}
            >
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-secondary/50 px-2.5 py-1.5 text-[10px] leading-snug text-muted-foreground">
                Here&apos;s a booking form for your salon appointment.
              </div>
              <div
                className={cn(
                  'transition-all duration-500 ease-in',
                  revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                )}
                style={{ transitionDelay: revealed ? '320ms' : '0ms' }}
              >
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        play('bloom', { volume: 0.45 });
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

  // Mobile / touch: reveal 1s after the card scrolls into view
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
        'flex h-full min-h-[400px] flex-col overflow-hidden outline-none sm:min-h-[280px]',
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

      <div className="mx-4 mb-4 mt-3 min-h-0 flex-1">
        <CatalysticMiniPlayground revealed={revealed} />
      </div>
    </a>
  );
}
