'use client';

import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AgentOrb } from '@/components/agent-orb';
import { GEN_UI_STARTER_CHIPS } from '@/lib/gen-ui-prompt-placeholders';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import { cn } from '@/lib/utils';

const INPUT_SHELL_CLASS =
  'rounded-full border border-white/[0.10] bg-[#1e1e1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';

type GenUISearchBarProps = {
  variant: 'center' | 'bottom';
  onSubmit: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  promptCount?: number;
  className?: string;
};

export function GenUISearchBar({
  variant,
  onSubmit,
  isLoading = false,
  disabled = false,
  promptCount,
  className,
}: GenUISearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isCenter = variant === 'center';
  const limitReached = disabled || (promptCount !== undefined && promptCount <= 0);
  const placeholder =
    limitReached && promptCount !== undefined && promptCount <= 0
      ? 'Prompt limit reached'
      : 'Ask anything';

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
      <div className={cn('flex w-full max-w-2xl flex-col items-center gap-5 md:gap-6', className)}>
        <AgentOrb size="lg" />

        <p className="text-center text-[20px] sm:text-[26px] md:text-[32px] font-light text-foreground/90 tracking-tight max-w-lg">
          What would you like to explore?
        </p>

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
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black disabled:opacity-25 hover:opacity-90 transition-opacity"
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
              className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-foreground/75 hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
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
          className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-25 hover:opacity-90 transition-opacity"
          aria-label="Send prompt"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
