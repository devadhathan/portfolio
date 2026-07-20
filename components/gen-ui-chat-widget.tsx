'use client';

import { ChevronLeft } from 'lucide-react';
import { AgentOrb } from '@/components/agent-orb';
import { cn } from '@/lib/utils';

type GenUIChatWidgetProps = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading?: boolean;
  onBackToChat: () => void;
  className?: string;
};

/** Minimized pill — tap to return to the Gen UI chat view. */
export function GenUIChatWidget({
  messages,
  isLoading = false,
  onBackToChat,
  className,
}: GenUIChatWidgetProps) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  if (messages.length === 0 && !isLoading) return null;

  return (
    <button
      type="button"
      onClick={onBackToChat}
      className={cn(
        'fixed right-3 top-[calc(3.5rem+0.75rem)] z-40 flex max-w-[min(220px,calc(100vw-1.5rem))] items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-md transition-colors hover:bg-secondary/40 dark:border-white/10 dark:bg-[#1B1917]/95 sm:right-4',
        className,
      )}
      aria-label="Back to Gen UI chat"
    >
      <AgentOrb size="xs" creating={isLoading} />
      <span className="min-w-0 flex-1 truncate text-left text-[11px] text-muted-foreground">
        {lastUser?.content ?? 'Back to chat'}
      </span>
      <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}
