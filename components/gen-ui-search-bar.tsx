'use client';

import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AgentOrb } from '@/components/agent-orb';
import { GEN_UI_STARTER_CHIPS } from '@/lib/gen-ui-prompt-placeholders';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import { cn } from '@/lib/utils';

const INPUT_SHELL_CLASS =
  'rounded-full border border-border/60 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-white/[0.10] dark:bg-[#1C1A12] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';

const CHIP_CLASS =
  'rounded-full border border-border/55 bg-secondary/80 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40 transition-colors dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-foreground/75 dark:hover:bg-white/[0.08] dark:hover:text-foreground';

const SEND_BUTTON_CLASS =
  'flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-25 hover:opacity-90 transition-opacity';

type GenUISearchBarProps = {
  variant: 'center' | 'bottom';
  onSubmit: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  promptCount?: number;
  className?: string;
  headline?: string;
  subhead?: string;
  /** Place supporting copy under the chips instead of under the headline. */
  subheadPlacement?: 'under-headline' | 'below-chips';
  orbSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  limitLabel?: string;
};

export function GenUISearchBar({
  variant,
  onSubmit,
  isLoading = false,
  disabled = false,
  promptCount,
  className,
  headline = 'What would you like to explore?',
  subhead = "Ask about my work — I'll build a custom view.",
  subheadPlacement = 'under-headline',
  orbSize = 'sm',
  limitLabel,
}: GenUISearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isCenter = variant === 'center';
  const limitReached = disabled || (promptCount !== undefined && promptCount <= 0);
  const placeholder =
    limitReached && promptCount !== undefined && promptCount <= 0
      ? 'Prompt limit reached'
      : 'Ask anything about Dev’s work…';
  const subheadBelow = subheadPlacement === 'below-chips';

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

  const handleChipClick = async (prompt: string) => {
    if (isLoading || limitReached) return;
    setValue('');
    await onSubmit(prompt);
  };

  if (isCenter) {
    return (
      <div className={cn('flex w-full max-w-2xl flex-col items-center gap-4 md:gap-5', className)}>
        <AgentOrb size={orbSize} />

        <div className="space-y-2 text-center max-w-lg">
          <p className="text-[20px] sm:text-[26px] md:text-[30px] font-light text-foreground/90 tracking-tight">
            {headline}
          </p>
          {!subheadBelow && subhead ? (
            <p className="text-[13px] sm:text-sm leading-relaxed text-muted-foreground/80">{subhead}</p>
          ) : null}
        </div>

        <div className={cn('w-full', INPUT_SHELL_CLASS)}>
          <div className="flex items-center gap-3 px-5 py-3.5 md:px-6 md:py-4">
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
              className="flex-1 resize-none bg-transparent outline-none text-[15px] md:text-base text-foreground placeholder:text-muted-foreground/55 min-h-[28px] max-h-[120px] py-0.5"
            />

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || limitReached || !value.trim()}
              className={cn('flex-shrink-0 flex h-9 w-9', SEND_BUTTON_CLASS)}
              aria-label="Send prompt"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl px-1">
          {GEN_UI_STARTER_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => void handleChipClick(chip.prompt)}
              disabled={isLoading || limitReached}
              className={cn(CHIP_CLASS)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {subheadBelow && subhead ? (
          <p className="max-w-md text-center text-[13px] sm:text-sm leading-relaxed text-muted-foreground/70">
            {subhead}
          </p>
        ) : null}

        {limitLabel ? (
          <p className="text-xs text-muted-foreground/50 tabular-nums">{limitLabel}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col items-center gap-1.5', className)}>
      <div className={cn('flex w-full max-w-2xl items-center gap-3 px-4 py-2.5', INPUT_SHELL_CLASS)}>
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
          className="flex-1 resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/55 min-h-[24px] max-h-[120px] py-1.5"
        />

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isLoading || limitReached || !value.trim()}
          className={cn('flex-shrink-0 flex h-8 w-8', SEND_BUTTON_CLASS)}
          aria-label="Send prompt"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
