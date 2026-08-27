'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatedWords } from '@/components/animated-words';
import { formatStoryParagraphs } from '@/lib/enrich-gen-ui';
import { cn } from '@/lib/utils';

type GenUIAssistantReplyProps = {
  title: string;
  summary?: string;
  animate?: boolean;
  mode?: 'word' | 'letter';
  onAnimationComplete?: () => void;
  className?: string;
};

function parseBlock(text: string): { type: 'p' | 'ul'; content: string | string[] } {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-•*]\s/.test(l));
  if (bullets.length >= 2 && bullets.length >= lines.length * 0.5) {
    return {
      type: 'ul',
      content: bullets.map((l) => l.replace(/^[-•*]\s+/, '')),
    };
  }
  return { type: 'p', content: text };
}

export function GenUIAssistantReply({
  title,
  summary,
  animate = false,
  mode = 'word',
  onAnimationComplete,
  className,
}: GenUIAssistantReplyProps) {
  const paragraphs = useMemo(
    () => (summary ? formatStoryParagraphs(summary) : []),
    [summary],
  );
  const hasTitle = Boolean(title.trim());
  const segments = useMemo(
    () => (hasTitle ? [title, ...paragraphs] : paragraphs),
    [hasTitle, title, paragraphs],
  );
  const [segmentIndex, setSegmentIndex] = useState(animate ? 0 : segments.length);

  useEffect(() => {
    setSegmentIndex(animate ? 0 : segments.length);
  }, [animate, title, summary, segments.length]);

  const advance = useCallback(() => {
    setSegmentIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    if (animate && segmentIndex >= segments.length) {
      onAnimationComplete?.();
    }
  }, [animate, segmentIndex, segments.length, onAnimationComplete]);

  const renderBlock = (text: string, key: string) => {
    const block = parseBlock(text);
    if (block.type === 'ul' && Array.isArray(block.content)) {
      return (
        <ul key={key} className="list-disc space-y-2 pl-5 text-base md:text-lg text-muted-foreground leading-[1.75]">
          {block.content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={key} className="text-base md:text-lg text-muted-foreground leading-[1.75]">
        {text}
      </p>
    );
  };

  const titleClass =
    'text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15]';

  if (!animate) {
    return (
      <article className={cn('max-w-3xl space-y-5 scroll-mt-24', className)}>
        {hasTitle ? <h2 className={titleClass}>{title}</h2> : null}
        {paragraphs.length > 0 && (
          <div className="space-y-4">{paragraphs.map((p, i) => renderBlock(p, `block-${i}`))}</div>
        )}
      </article>
    );
  }

  const allDone = segmentIndex >= segments.length;
  const titleOffset = hasTitle ? 1 : 0;
  const doneParagraphs = paragraphs.slice(0, Math.max(0, segmentIndex - titleOffset));

  return (
    <article className={cn('max-w-3xl space-y-5 scroll-mt-24', className)}>
      {hasTitle && segmentIndex > 0 ? <h2 className={titleClass}>{title}</h2> : null}

      {doneParagraphs.length > 0 && (
        <div className="space-y-4">{doneParagraphs.map((p, i) => renderBlock(p, `done-${i}`))}</div>
      )}

      {!allDone && hasTitle && segmentIndex === 0 && (
        <h2 className={titleClass}>
          <AnimatedWords text={segments[0]} onComplete={advance} delayMs={mode === 'letter' ? 16 : 38} mode={mode} />
        </h2>
      )}

      {!allDone && segmentIndex >= titleOffset && (
        <div className="text-base md:text-lg text-muted-foreground leading-[1.75]">
          <AnimatedWords
            text={segments[segmentIndex]}
            onComplete={advance}
            delayMs={mode === 'letter' ? 12 : 32}
            mode={mode}
          />
        </div>
      )}
    </article>
  );
}
