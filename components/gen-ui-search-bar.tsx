'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUp } from 'lucide-react';
import { GEN_UI_STARTER_CHIPS } from '@/lib/gen-ui-prompt-placeholders';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import { cn } from '@/lib/utils';

const AgentOrbHatMenu = dynamic(
  () => import('@/components/agent-orb-hat-menu').then((m) => ({ default: m.AgentOrbHatMenu })),
  { ssr: false },
);

const INPUT_SHELL_CLASS =
  'rounded-[28px] border border-border/55 bg-secondary/90 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/[0.12] dark:bg-[#1c1c1c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';

const CHIP_CLASS =
  'rounded-full border border-border/55 bg-secondary/80 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40 transition-colors dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-foreground/75 dark:hover:bg-white/[0.08] dark:hover:text-foreground';

const TEXTAREA_MAX_PX = 200;

type GenUISearchBarProps = {
  variant: 'center' | 'bottom';
  onSubmit: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  promptCount?: number;
  className?: string;
  /** Brand wordmark next to the orb (center empty state). */
  brandLabel?: string;
  headline?: string;
  subhead?: string;
  /** Place supporting copy under the chips instead of under the brand. */
  subheadPlacement?: 'under-headline' | 'below-chips';
  orbSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Ask window — orb stays awake while open; chunk loads with this bar only. */
  orbAlwaysAwake?: boolean;
};

export function GenUISearchBar({
  variant,
  onSubmit,
  isLoading = false,
  disabled = false,
  promptCount,
  className,
  brandLabel = 'Ask AI',
  headline,
  subhead = "Ask about my work — I'll build a custom view.",
  subheadPlacement = 'under-headline',
  orbSize = 'sm',
  orbAlwaysAwake = false,
}: GenUISearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isCenter = variant === 'center';
  const limitReached = disabled || (promptCount !== undefined && promptCount <= 0);
  const canSend = Boolean(value.trim()) && !isLoading && !limitReached;
  // The centre state already greets above the field, so don't echo it there.
  const placeholder = isCenter ? 'Ask anything' : 'How can I help you today?';
  const subheadBelow = subheadPlacement === 'below-chips';
  // Greeting-first empty state. `brandLabel` stays the sidebar wordmark.
  const wordmark = headline || 'How can I help you today?';

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_PX)}px`;
  }, [value]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || limitReached) return;
    if (trimmed.length > MAX_GEN_UI_PROMPT_LENGTH) {
      await onSubmit(trimmed);
      return;
    }
    setValue('');
    await onSubmit(trimmed);
  };

  const handleChipClick = (prompt: string) => {
    if (isLoading || limitReached) return;
    setValue(prompt);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const len = prompt.length;
      el.setSelectionRange(len, len);
    });
  };

  const sendButton = (
    <button
      type="button"
      onClick={() => void handleSubmit()}
      disabled={!canSend}
      className={cn(
        'mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center self-end rounded-full transition-opacity',
        canSend
          ? 'bg-foreground text-background hover:opacity-90'
          : 'bg-foreground/15 text-foreground/40 disabled:opacity-100',
      )}
      aria-label="Send prompt"
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );

  const textareaClass = cn(
    'flex-1 resize-none overflow-y-auto bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70',
    isCenter
      ? 'min-h-[28px] py-1 text-[15px] md:text-base'
      : 'min-h-[24px] py-1.5 text-sm',
  );

  const textarea = (
    <textarea
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          void handleSubmit();
        }
      }}
      placeholder={placeholder}
      disabled={isLoading || limitReached}
      rows={1}
      maxLength={MAX_GEN_UI_PROMPT_LENGTH}
      className={textareaClass}
      style={{ maxHeight: TEXTAREA_MAX_PX }}
    />
  );

  if (isCenter) {
    return (
      <div className={cn('flex w-full max-w-2xl flex-col items-center gap-5 md:gap-6', className)}>
        {/* Orb sits above the greeting so it reads as one centred stack */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-3">
            <AgentOrbHatMenu size={orbSize} alwaysAwake={orbAlwaysAwake} />
            <span className="text-center text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
              {wordmark}
            </span>
          </div>
          {!subheadBelow && subhead ? (
            <p className="max-w-md text-center text-[13px] leading-relaxed text-muted-foreground/75 sm:text-sm">
              {subhead}
            </p>
          ) : null}
        </div>

        <div className={cn('w-full max-w-xl', INPUT_SHELL_CLASS)}>
          <div className="flex items-end gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
            {textarea}
            {sendButton}
          </div>
        </div>

        <div className="flex w-full max-w-2xl flex-wrap justify-center gap-2 px-1">
          {GEN_UI_STARTER_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip.prompt)}
              disabled={isLoading || limitReached}
              className={cn(CHIP_CLASS)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {subheadBelow && subhead ? (
          <p className="max-w-md text-center text-[13px] leading-relaxed text-muted-foreground/70 sm:text-sm">
            {subhead}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col items-center gap-1.5', className)}>
      <div className={cn('flex w-full max-w-2xl items-end gap-3 px-4 py-2', INPUT_SHELL_CLASS)}>
        {textarea}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSend}
          className={cn(
            'mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full transition-opacity',
            canSend
              ? 'bg-foreground text-background hover:opacity-90'
              : 'bg-foreground/15 text-foreground/40 disabled:opacity-100',
          )}
          aria-label="Send prompt"
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
