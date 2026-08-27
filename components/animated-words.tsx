'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimatedWordsProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delayMs?: number;
  /** Reveal by word (default) or by letter. */
  mode?: 'word' | 'letter';
  onComplete?: () => void;
};

export function AnimatedWords({
  text,
  className,
  wordClassName,
  delayMs,
  mode = 'word',
  onComplete,
}: AnimatedWordsProps) {
  const tokens = useMemo(() => {
    if (mode === 'letter') {
      return Array.from(text);
    }
    return text.match(/\S+\s*/g) ?? (text ? [text] : []);
  }, [text, mode]);

  const tickMs = delayMs ?? (mode === 'letter' ? 14 : 42);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    setVisibleCount(0);
    completedRef.current = false;
  }, [text, mode]);

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
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), tickMs);
    return () => clearTimeout(timer);
  }, [visibleCount, tokens.length, tickMs, onComplete]);

  if (tokens.length === 0) return null;

  return (
    <span className={cn(mode === 'letter' && 'whitespace-pre-wrap', className)}>
      {tokens.map((token, i) => (
        <span
          key={`${i}-${token === '\n' ? 'nl' : token === ' ' ? 'sp' : token}`}
          className={cn(
            'inline transition-all duration-200 ease-out',
            i < visibleCount ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-0.5 blur-[1px]',
            wordClassName,
          )}
        >
          {token === ' ' ? '\u00A0' : token}
        </span>
      ))}
    </span>
  );
}
