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

  const tickMs = delayMs ?? 16;
  // Reveal in chunks so long answers finish in about the same time as short
  // ones instead of crawling one token per tick.
  const step = useMemo(() => {
    const maxTicks = mode === 'letter' ? 45 : 30;
    return Math.max(1, Math.ceil(tokens.length / maxTicks));
  }, [tokens.length, mode]);
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
    const timer = setTimeout(() => setVisibleCount((c) => c + step), tickMs);
    return () => clearTimeout(timer);
  }, [visibleCount, tokens.length, tickMs, step, onComplete]);

  if (tokens.length === 0) return null;

  const charClass = (index: number) =>
    cn(
      'inline transition-all duration-150 ease-out',
      index < visibleCount ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-0.5 blur-[1px]',
      wordClassName,
    );

  if (mode === 'letter') {
    // Letters are grouped into words so a line can only break at a space.
    // One span per bare character lets the browser break mid-word instead.
    const segments = text.match(/\s+|\S+/g) ?? [];
    let offset = 0;

    return (
      <span className={cn('whitespace-pre-wrap break-words', className)}>
        {segments.map((segment, segmentIndex) => {
          const start = offset;
          offset += segment.length;

          if (/^\s+$/.test(segment)) {
            return <span key={`ws-${segmentIndex}`}>{segment}</span>;
          }

          return (
            <span key={`w-${segmentIndex}`} className="inline-block">
              {Array.from(segment).map((char, i) => (
                <span key={`${segmentIndex}-${i}`} className={charClass(start + i)}>
                  {char}
                </span>
              ))}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className={cn('break-words', className)}>
      {tokens.map((token, i) => (
        <span key={`${i}-${token}`} className={charClass(i)}>
          {token}
        </span>
      ))}
    </span>
  );
}
