'use client';

import { useState } from 'react';
import { ChevronsLeft, ChevronsRight, MessageSquare, SquarePen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { capitalizePrompt } from '@/lib/enrich-gen-ui';
import type { GenUIChat } from '@/lib/gen-ui-viewport';
import { cn } from '@/lib/utils';

type GenUIAskSidebarProps = {
  brandLabel?: string;
  chats: GenUIChat[];
  activeChatId: string | null;
  isEmpty: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  className?: string;
};

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.06]';

export function GenUIAskSidebar({
  brandLabel = 'Ask AI',
  chats,
  activeChatId,
  isEmpty,
  onNewChat,
  onSelectChat,
  className,
}: GenUIAskSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  // Newest chat first, and a chat only appears once it has a real prompt.
  const history = [...chats].filter((c) => c.title.trim().length > 0).reverse();

  if (collapsed) {
    return (
      <aside
        className={cn(
          'flex h-full w-14 shrink-0 flex-col items-center border-r border-black/[0.06] bg-black/[0.02] py-2 dark:border-white/[0.08] dark:bg-black/25',
          className,
        )}
        aria-label="Ask AI sidebar"
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className={iconBtn}
          aria-label="Expand sidebar"
          title="Expand"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>

        <div className="mt-2 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onNewChat}
            className={cn(
              iconBtn,
              isEmpty && 'bg-black/[0.06] text-foreground dark:bg-white/[0.08]',
            )}
            aria-label="New Chat"
            title="New Chat"
          >
            <SquarePen className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <ScrollArea className="mt-3 min-h-0 w-full flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
          <div className="flex flex-col items-center gap-1 px-2 pb-2">
            {history.map((chat) => {
              const active = chat.id === activeChatId;
              // Fixed to the question that opened the chat, matching the bubble.
              const label = capitalizePrompt(chat.title);
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    iconBtn,
                    active && 'bg-black/[0.06] text-foreground dark:bg-white/[0.08]',
                  )}
                  aria-label={label}
                  title={label}
                >
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex h-full w-[220px] shrink-0 flex-col border-r border-black/[0.06] bg-black/[0.02] dark:border-white/[0.08] dark:bg-black/25',
        className,
      )}
      aria-label="Ask AI sidebar"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {brandLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className={cn(iconBtn, 'h-8 w-8')}
          aria-label="Collapse sidebar"
          title="Collapse"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="shrink-0 px-2 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
            isEmpty
              ? 'bg-black/[0.06] font-medium text-foreground dark:bg-white/[0.08]'
              : 'text-foreground/85 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
          )}
          aria-current={isEmpty ? 'page' : undefined}
        >
          <SquarePen className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="px-4 pb-1.5 pt-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground/70">
          History
        </p>
      </div>

      <ScrollArea className="min-h-0 w-full flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
        <div className="space-y-0.5 px-2 pb-3">
          {history.length === 0 ? (
            <p className="px-2.5 py-2 text-[12px] leading-relaxed text-muted-foreground/55">
              No chats yet
            </p>
          ) : (
            history.map((chat) => {
              const active = chat.id === activeChatId;
              // Fixed to the question that opened the chat, matching the bubble.
              const label = capitalizePrompt(chat.title);
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    'flex w-full items-center overflow-hidden rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    active
                      ? 'bg-black/[0.06] text-foreground dark:bg-white/[0.08]'
                      : 'text-foreground/75 hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]',
                  )}
                  title={label}
                >
                  {/* min-w-0 lets the flex item shrink so `truncate` can ellipsis it */}
                  <span className="min-w-0 flex-1 truncate">
                    {label}
                    {chat.viewports.some((v) => v.status === 'loading') ? '…' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
