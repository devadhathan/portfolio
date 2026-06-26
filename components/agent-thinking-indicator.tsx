'use client';

import { cn } from '@/lib/utils';

const COLS = 2;
const ROWS = 3;

function DotMatrix({ className }: { className?: string }) {
  return (
    <div
      className={cn('grid shrink-0 grid-cols-2 gap-[3px]', className)}
      style={{ width: 11, height: 17 }}
      aria-hidden
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return (
          <span
            key={i}
            className="block h-[3px] w-[3px] rounded-full bg-foreground/80 animate-thinking-matrix-dot"
            style={{ animationDelay: `${(col + row) * 0.14}s` }}
          />
        );
      })}
    </div>
  );
}

type AgentThinkingIndicatorProps = {
  label?: string;
};

export function AgentThinkingIndicator({ label = 'Thinking…' }: AgentThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite" aria-label={label}>
      <DotMatrix />
      <p className="mb-0 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
