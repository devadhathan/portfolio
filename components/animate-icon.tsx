'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimateIconProps {
  children: ReactNode;
  animation?: 'pointing' | 'bounce' | 'pulse' | 'shake' | 'rotate';
  className?: string;
  animateOnHover?: boolean;
}

const animationClass: Record<NonNullable<AnimateIconProps['animation']>, string> = {
  pointing: 'transition-transform duration-200 ease-out group-hover/icon:translate-x-1',
  bounce: 'transition-transform duration-200 ease-out group-hover/icon:-translate-y-1',
  pulse: 'transition-transform duration-200 ease-out group-hover/icon:scale-110',
  shake: 'group-hover/icon:animate-[shake_0.3s_ease-in-out]',
  rotate: 'transition-transform duration-200 ease-out group-hover/icon:rotate-[15deg]',
};

export function AnimateIcon({
  children,
  animation = 'pointing',
  className = '',
  animateOnHover = true,
}: AnimateIconProps) {
  return (
    <span
      className={cn(
        'group/icon inline-flex items-center justify-center',
        animateOnHover && animationClass[animation],
        className,
      )}
    >
      {children}
    </span>
  );
}
