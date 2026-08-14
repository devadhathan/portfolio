'use client';

import { useState } from 'react';
import { ChevronsLeft, ChevronsRight, MessageSquare, SquarePen } from 'lucide-react';
import { AgentOrbHatMenu } from '@/components/agent-orb-hat-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { cn } from '@/lib/utils';

type GenUIAskSidebarProps = {
  brandLabel?: string;
  viewports: GenUIViewport[];
  activeViewportId: string | null;
  isEmpty: boolean;
  limitLabel?: string;
  onNewChat: () => void;
  onSelectViewport: (id: string) => void;
  className?: string;
};

function truncateLabel(text: string, max = 36) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.06]';

export function GenUIAskSidebar({
  brandLabel = 'Ask AI',
  viewports,
  activeViewportId,
  isEmpty,
  limitLabel,
  onNewChat,
  onSelectViewport,
  className,
}: GenUIAskSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const history = viewports.filter((v) => v.prompt.trim().length > 0);

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

        <ScrollArea className="mt-3 min-h-0 w-full flex-1">
          <div className="flex flex-col items-center gap-1 px-2 pb-2">
            {history.map((viewport) => {
              const active = viewport.id === activeViewportId;
              const label = viewport.title || viewport.prompt;
              return (
                <button
                  key={viewport.id}
                  type="button"
                  onClick={() => onSelectViewport(viewport.id)}
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
        <div className="flex min-w-0 items-center gap-2">
          <AgentOrbHatMenu size="xs" align="start" />
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

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-0.5 px-2 pb-3">
          {history.length === 0 ? (
            <p className="px-2.5 py-2 text-[12px] leading-relaxed text-muted-foreground/55">
              No chats yet
            </p>
          ) : (
            history.map((viewport) => {
              const active = viewport.id === activeViewportId;
              const label = viewport.title || viewport.prompt;
              return (
                <button
                  key={viewport.id}
                  type="button"
                  onClick={() => onSelectViewport(viewport.id)}
                  className={cn(
                    'flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    active
                      ? 'bg-black/[0.06] text-foreground dark:bg-white/[0.08]'
                      : 'text-foreground/75 hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]',
                  )}
                  title={label}
                >
                  <span className="truncate">
                    {truncateLabel(label)}
                    {viewport.status === 'loading' ? '…' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {limitLabel ? (
        <p className="shrink-0 border-t border-black/[0.05] px-4 py-3 text-[11px] tabular-nums text-muted-foreground/55 dark:border-white/[0.06]">
          {limitLabel}
        </p>
      ) : null}
    </aside>
  );
}
