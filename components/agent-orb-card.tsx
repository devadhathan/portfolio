'use client';

import { useCallback, useRef, useState } from 'react';
import { AgentOrb } from '@/components/agent-orb';
import { cn } from '@/lib/utils';

type AgentOrbCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  className?: string;
};

function pupilOffsetFromCursor(
  clientX: number,
  clientY: number,
  orbRect: DOMRect,
  max = 6,
) {
  const cx = orbRect.left + orbRect.width / 2;
  const cy = orbRect.top + orbRect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  return {
    x: Math.max(-max, Math.min(max, dx * 0.18)),
    y: Math.max(-max, Math.min(max, dy * 0.18)),
  };
}

export function AgentOrbCard({ title, description, buttonLabel, onClick, className }: AgentOrbCardProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [lookAt, setLookAt] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const orbRect = orbRef.current?.getBoundingClientRect();
    if (!orbRect) return;
    setLookAt(pupilOffsetFromCursor(event.clientX, event.clientY, orbRect));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setLookAt(null);
  }, []);

  return (
    <div
      className={cn(
        'group flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-5 pb-6 text-center max-lg:pb-10',
        className,
      )}
      data-cuelume-hover="tick"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={orbRef} className="flex items-center justify-center">
        <AgentOrb size="md" lookAt={lookAt} />
      </div>
      <div className="max-w-[14rem] space-y-1">
        <p className="text-[15px] font-medium tracking-tight text-foreground">{title}</p>
        <p className="text-[11px] leading-snug text-muted-foreground/75">{description}</p>
      </div>
      <button
        type="button"
        data-cuelume-press
        data-cuelume-release
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="relative z-20 inline-flex items-center justify-center rounded-full border border-border/50 bg-primary px-5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground hover:bg-primary/90 max-lg:mb-2"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
