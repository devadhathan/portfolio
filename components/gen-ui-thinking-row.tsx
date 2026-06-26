'use client';

import { AgentOrb } from '@/components/agent-orb';
import { cn } from '@/lib/utils';

type GenUIThinkingRowProps = {
  label?: string;
  showLabel?: boolean;
  className?: string;
};

export function GenUIThinkingRow({
  label = 'Thinking',
  showLabel = true,
  className,
}: GenUIThinkingRowProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AgentOrb size="sm" creating />
      {showLabel && (
        <span className="text-sm font-medium animate-text-shimmer">{label}</span>
      )}
    </div>
  );
}
