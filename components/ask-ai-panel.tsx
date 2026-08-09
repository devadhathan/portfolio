'use client';

import type { ReactNode, Ref } from 'react';
import { ArrowUp, ChevronsRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ASK_AI_SUGGESTIONS } from '@/lib/ask-ai-suggestions';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import { cn } from '@/lib/utils';

type AskAIPanelProps = {
  onClose: () => void;
  promptLimitLabel: string;
  input: string;
  inputDisabled: boolean;
  sendDisabled?: boolean;
  suggestionsDisabled?: boolean;
  inputPlaceholder: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: Ref<HTMLTextAreaElement>;
  onSuggestionClick: (prompt: string) => void;
  emptyState: boolean;
  showSuggestionChips: boolean;
  children: ReactNode;
  messagesEndRef: Ref<HTMLDivElement>;
};

export function AskAIPanel({
  onClose,
  promptLimitLabel,
  input,
  inputDisabled,
  sendDisabled,
  suggestionsDisabled,
  inputPlaceholder,
  onInputChange,
  onSubmit,
  onKeyDown,
  inputRef,
  onSuggestionClick,
  emptyState,
  showSuggestionChips,
  children,
  messagesEndRef,
}: AskAIPanelProps) {
  return (
    <div className="fixed z-40 hidden lg:flex top-14 right-0 h-[calc(100vh-3.5rem)] w-[360px] flex-col border-l border-border/60 bg-background shadow-[-12px_0_40px_rgba(0,0,0,0.06)] animate-in slide-in-from-right duration-300 dark:border-border dark:shadow-[-12px_0_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-black/[0.06] shrink-0 dark:border-white/[0.08]">
        <span className="text-sm font-medium text-foreground">Ask AI</span>
        <button
          onClick={onClose}
          data-cuelume-press
          data-cuelume-release
          className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
          title="Close"
          aria-label="Close Ask AI"
        >
          <ChevronsRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {!emptyState && (
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 px-4 py-4 pb-2">
            {children}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {emptyState && <div className="flex-1 min-h-0" />}

      <div
        className={cn(
          'shrink-0 px-4 py-4',
          !emptyState && 'border-t border-black/[0.06] dark:border-white/[0.08]',
        )}
      >
        {showSuggestionChips && (
          <div className="mb-4 flex flex-col gap-0.5">
            {ASK_AI_SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                disabled={suggestionsDisabled ?? inputDisabled}
                onClick={() => onSuggestionClick(label)}
                data-cuelume-hover="tick"
                data-cuelume-press
                data-cuelume-release
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[13px] text-foreground/90 transition-colors hover:bg-black/[0.04] disabled:opacity-40 dark:hover:bg-white/[0.05]"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            ))}
            {emptyState && (
              <p className="mt-2 px-2 text-[11px] leading-relaxed text-muted-foreground/70">
                Tip: open and close chat with{' '}
                <kbd className="rounded border border-black/[0.08] bg-black/[0.03] px-1.5 py-0.5 font-mono text-[10px] dark:border-white/[0.12] dark:bg-white/[0.06]">
                  ⌘
                </kbd>{' '}
                <kbd className="rounded border border-black/[0.08] bg-black/[0.03] px-1.5 py-0.5 font-mono text-[10px] dark:border-white/[0.12] dark:bg-white/[0.06]">
                  I
                </kbd>
              </p>
            )}
          </div>
        )}

        <p className="mb-2.5 text-center text-[10px] text-muted-foreground/65 tabular-nums">{promptLimitLabel}</p>
        <div className="relative rounded-xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-border dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={inputPlaceholder}
            disabled={inputDisabled}
            rows={3}
            maxLength={MAX_GEN_UI_PROMPT_LENGTH}
            className="block w-full resize-none bg-transparent px-3.5 pt-3.5 pb-12 text-sm text-foreground placeholder:text-muted-foreground/55 outline-none min-h-[88px] max-h-[160px]"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={(sendDisabled ?? inputDisabled) || !input.trim()}
            data-cuelume-press
            data-cuelume-release
            className={cn(
              'absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg',
              'border border-black/[0.08] bg-black/[0.04] text-foreground/80',
              'hover:bg-black/[0.07] disabled:opacity-30 disabled:pointer-events-none',
              'dark:border-white/[0.12] dark:bg-white/[0.08] dark:text-foreground/90 dark:hover:bg-white/[0.12]',
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
