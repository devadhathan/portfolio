'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { AgentOrb } from '@/components/agent-orb';
import { GEN_UI_PROMPT_HINTS } from '@/lib/gen-ui-prompt-placeholders';
import { cn } from '@/lib/utils';

const INPUT_SHELL_CLASS =
  'rounded-full border border-white/[0.10] bg-[#1e1e1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';

type GenUISearchBarProps = {
  variant: 'center' | 'bottom';
  onSubmit: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function GenUISearchBar({
  variant,
  onSubmit,
  isLoading = false,
  disabled = false,
  className,
}: GenUISearchBarProps) {
  const [value, setValue] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % GEN_UI_PROMPT_HINTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    setValue('');
    await onSubmit(trimmed);
  };

  const hint = GEN_UI_PROMPT_HINTS[hintIndex];
  const isCenter = variant === 'center';

  if (isCenter) {
    return (
      <div className={cn('flex w-full max-w-2xl flex-col items-center gap-7', className)}>
        <AgentOrb size="lg" />

        <p className="text-center text-lg md:text-xl font-light text-foreground/90 tracking-tight max-w-md animate-fade-in-blur">
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
              placeholder="Ask anything"
              disabled={isLoading || disabled}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-[15px] md:text-base text-foreground placeholder:text-muted-foreground/55 min-h-[28px] max-h-[120px] py-0.5"
            />

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || disabled || !value.trim()}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black disabled:opacity-25 hover:opacity-90 transition-opacity"
              aria-label="Send prompt"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p
          key={hintIndex}
          className="text-sm text-muted-foreground/60 text-center max-w-lg animate-fade-in-blur"
        >
          {hint}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col items-center', className)}>
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
          placeholder="Ask anything"
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/55 min-h-[24px] max-h-[120px] py-1.5"
        />

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isLoading || disabled || !value.trim()}
          className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-25 hover:opacity-90 transition-opacity"
          aria-label="Send prompt"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
