'use client';

import { cn } from '@/lib/utils';

const SIZE = 3;

function DotMatrix({ className }: { className?: string }) {
  const gap = 3;
  const dot = 3;
  const side = SIZE * dot + (SIZE - 1) * gap;

  return (
    <div
      className={cn('grid shrink-0 grid-cols-3 gap-[3px]', className)}
      style={{ width: side, height: side }}
      aria-hidden
    >
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const col = i % SIZE;
        const row = Math.floor(i / SIZE);
        return (
          <span
            key={i}
            className="block h-[3px] w-[3px] rounded-full bg-foreground/80 animate-thinking-matrix-dot"
            style={{ animationDelay: `${(col + row) * 0.12}s` }}
          />
        );
      })}
    </div>
  );
}

type AgentThinkingIndicatorProps = {
  label?: string;
  className?: string;
};

export function AgentThinkingIndicator({ label = 'Thinking…', className }: AgentThinkingIndicatorProps) {
  return (
    <div
      className={cn('flex items-center gap-2.5', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <DotMatrix />
      <p className="mb-0 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
