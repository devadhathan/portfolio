'use client';

import {
  useCallback,
  useState,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/** Matches Misc home cards — thin border that brightens on hover. */
export const HOME_CARD_BORDER =
  'rounded-lg border border-border/55 transition-[border-color] duration-500 ease-out hover:border-border/80 dark:border-border/40 dark:hover:border-border/70';

type CardHoverGlowOverlayProps = {
  x: number;
  y: number;
  className?: string;
  /** Spotlight radius in px. */
  radius?: number;
};

export function CardHoverGlowOverlay({
  x,
  y,
  className,
  radius = 200,
}: CardHoverGlowOverlayProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-[1] rounded-[inherit]', className)}
      style={{
        border: '1px solid hsl(var(--primary) / 0.5)',
        WebkitMaskImage: `radial-gradient(circle ${radius}px at ${x}px ${y}px, black 30%, transparent 75%)`,
        maskImage: `radial-gradient(circle ${radius}px at ${x}px ${y}px, black 30%, transparent 75%)`,
      }}
      aria-hidden
    />
  );
}

export function useCardHoverGlow() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const onMouseLeave = useCallback(() => {
    setPos(null);
  }, []);

  const glow: ReactNode = pos ? <CardHoverGlowOverlay x={pos.x} y={pos.y} /> : null;

  return {
    pos,
    glow,
    glowHandlers: {
      onMouseMove,
      onMouseLeave,
    },
  };
}

type CardHoverGlowProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>;

/** Card shell with Misc-matching border + cursor spotlight glow. */
export function CardHoverGlow({
  as: Comp = 'div',
  children,
  className,
  ...rest
}: CardHoverGlowProps) {
  const { glow, glowHandlers } = useCardHoverGlow();

  return (
    <Comp
      data-cuelume-card-hover
      className={cn('relative overflow-hidden', HOME_CARD_BORDER, className)}
      {...glowHandlers}
      {...rest}
    >
      {glow}
      {children}
    </Comp>
  );
}
