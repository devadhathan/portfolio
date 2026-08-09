'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AgentOrb } from '@/components/agent-orb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type GenUIChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type GenUIChatRailProps = {
  messages: GenUIChatMessage[];
  isLoading?: boolean;
  /** Collapse after cards finish generating */
  autoCollapse?: boolean;
};

function ChatMessages({
  messages,
  isLoading,
  endRef,
}: {
  messages: GenUIChatMessage[];
  isLoading: boolean;
  endRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="space-y-3 px-3 py-3">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div
            className={cn(
              'max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
              message.role === 'user'
                ? 'bg-secondary text-foreground'
                : 'bg-muted/80 text-foreground',
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 px-1">
          <AgentOrb size="xs" creating />
          <span className="text-xs text-muted-foreground animate-text-shimmer">Thinking…</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

export function GenUIChatRail({ messages, isLoading = false, autoCollapse = false }: GenUIChatRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const userExpandedRef = useRef(false);

  useEffect(() => {
    if (autoCollapse && !isLoading && messages.length > 0 && !userExpandedRef.current) {
      setCollapsed(true);
    }
  }, [autoCollapse, isLoading, messages.length]);

  useEffect(() => {
    if (!collapsed) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, collapsed, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  const expand = () => {
    userExpandedRef.current = true;
    setCollapsed(false);
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={expand}
        className="fixed right-3 top-[calc(3.5rem+0.75rem)] z-40 flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/95 px-2.5 py-3 shadow-lg backdrop-blur-md transition-colors hover:bg-secondary/40 dark:border-white/10 dark:bg-[#1C1A12]/95"
        aria-label="Expand Gen UI chat"
      >
        <AgentOrb size="xs" creating={isLoading} />
        <span className="max-w-[4.5rem] truncate text-[10px] text-muted-foreground">
          {lastUser?.content ?? 'Chat'}
        </span>
        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        aria-hidden
        onClick={() => setCollapsed(true)}
      />
      <aside className="fixed inset-x-0 bottom-0 z-50 flex h-[min(70vh,520px)] flex-col rounded-t-2xl border border-border/60 bg-background shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-border lg:hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3 dark:border-white/8">
          <div className="flex min-w-0 items-center gap-2">
            <AgentOrb size="xs" creating={isLoading} />
            <span className="truncate text-sm font-medium text-foreground">Gen UI chat</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary/50"
            aria-label="Collapse chat"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <ChatMessages messages={messages} isLoading={isLoading} endRef={endRef} />
        </ScrollArea>
      </aside>

      <aside className="fixed right-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-[300px] flex-col border-l border-border/60 bg-background shadow-[-8px_0_32px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-border lg:flex">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5 dark:border-white/8">
          <div className="flex min-w-0 items-center gap-2">
            <AgentOrb size="xs" creating={isLoading} />
            <span className="truncate text-xs font-medium text-foreground">Gen UI chat</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary/50"
            aria-label="Collapse chat"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <ChatMessages messages={messages} isLoading={isLoading} endRef={endRef} />
        </ScrollArea>
      </aside>
    </>
  );
}
