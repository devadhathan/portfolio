'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatedWords } from '@/components/animated-words';
import { formatStoryParagraphs } from '@/lib/enrich-gen-ui';

type GenUIStoryHeaderProps = {
  title: string;
  summary?: string;
  animate?: boolean;
  onAnimationComplete?: () => void;
};

export function GenUIStoryHeader({
  title,
  summary,
  animate = false,
  onAnimationComplete,
}: GenUIStoryHeaderProps) {
  const paragraphs = useMemo(
    () => (summary ? formatStoryParagraphs(summary) : []),
    [summary],
  );
  const segments = useMemo(() => [title, ...paragraphs], [title, paragraphs]);
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

  if (!animate) {
    return (
      <header className="max-w-3xl space-y-5 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15] pt-0.5">
          {title}
        </h2>
        {paragraphs.length > 0 && (
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-[1.75]">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
      </header>
    );
  }

  const allDone = segmentIndex >= segments.length;

  return (
    <header className="max-w-3xl space-y-5 scroll-mt-24">
      {segments.slice(0, segmentIndex).map((segment, i) =>
        i === 0 ? (
          <h2
            key="title-done"
            className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15]"
          >
            {segment}
          </h2>
        ) : (
          <p key={`p-done-${i}`} className="text-base md:text-lg text-muted-foreground leading-[1.75]">
            {segment}
          </p>
        ),
      )}

      {!allDone && segmentIndex === 0 && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15]">
          <AnimatedWords text={segments[0]} onComplete={advance} delayMs={38} />
        </h2>
      )}

      {!allDone && segmentIndex > 0 && (
        <p className="text-base md:text-lg text-muted-foreground leading-[1.75]">
          <AnimatedWords text={segments[segmentIndex]} onComplete={advance} delayMs={32} />
        </p>
      )}
    </header>
  );
}
