'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimatedWordsProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delayMs?: number;
  onComplete?: () => void;
};

export function AnimatedWords({
  text,
  className,
  wordClassName,
  delayMs = 42,
  onComplete,
}: AnimatedWordsProps) {
  const tokens = useMemo(() => text.match(/\S+\s*/g) ?? (text ? [text] : []), [text]);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    setVisibleCount(0);
    completedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (tokens.length === 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    if (visibleCount >= tokens.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delayMs);
    return () => clearTimeout(timer);
  }, [visibleCount, tokens.length, delayMs, onComplete]);

  if (tokens.length === 0) return null;

  return (
    <span className={className}>
      {tokens.map((token, i) => (
        <span
          key={`${i}-${token}`}
          className={cn(
            'inline transition-all duration-300 ease-out',
            i < visibleCount ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-1 blur-[2px]',
            wordClassName,
          )}
        >
          {token}
        </span>
      ))}
    </span>
  );
}
