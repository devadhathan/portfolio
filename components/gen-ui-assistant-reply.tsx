'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedWords } from '@/components/animated-words';
import { formatStoryParagraphs } from '@/lib/enrich-gen-ui';
import { defaultTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

type GenUIAssistantReplyProps = {
  title: string;
  summary?: string;
  animate?: boolean;
  mode?: 'word' | 'letter';
  onAnimationComplete?: () => void;
  className?: string;
};

const PARAGRAPH_STAGGER_MS = 420;

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
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animate && !reduceMotion;
  const paragraphs = useMemo(
    () => (summary ? formatStoryParagraphs(summary) : []),
    [summary],
  );
  const hasTitle = Boolean(title.trim());
  const [titleDone, setTitleDone] = useState(!shouldAnimate);
  const [paraCount, setParaCount] = useState(shouldAnimate ? 0 : paragraphs.length);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setTitleDone(!shouldAnimate || !hasTitle);
    setParaCount(shouldAnimate ? 0 : paragraphs.length);
  }, [shouldAnimate, title, summary, paragraphs.length, hasTitle]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  useEffect(() => {
    // History / static renders never notify — the parent is already on content.
    // Reduced-motion still needs the signal so cards can enter immediately.
    if (!animate) return;
    if (!shouldAnimate) {
      finish();
      return;
    }
    if (!titleDone) return;
    if (paraCount >= paragraphs.length) {
      finish();
      return;
    }
    const timer = window.setTimeout(() => setParaCount((n) => n + 1), PARAGRAPH_STAGGER_MS);
    return () => window.clearTimeout(timer);
  }, [animate, shouldAnimate, titleDone, paraCount, paragraphs.length, finish]);

  const renderBlock = (text: string, key: string, motionIn = false) => {
    const block = parseBlock(text);
    const body =
      block.type === 'ul' && Array.isArray(block.content) ? (
        <ul className="list-disc space-y-2 pl-5 text-base md:text-lg text-muted-foreground leading-[1.75]">
          {block.content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-base md:text-lg text-muted-foreground leading-[1.75] break-words">{text}</p>
      );

    if (!motionIn) {
      return (
        <div key={key}>{body}</div>
      );
    }

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={defaultTransition}
      >
        {body}
      </motion.div>
    );
  };

  const titleClass =
    'text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15]';

  const visibleParagraphs = paragraphs.slice(0, paraCount);

  return (
    <article className={cn('w-full min-w-0 max-w-3xl space-y-5 scroll-mt-24', className)}>
      {hasTitle ? (
        <h2 className={titleClass}>
          {shouldAnimate && !titleDone ? (
            <AnimatedWords
              text={title}
              onComplete={() => setTitleDone(true)}
              delayMs={mode === 'letter' ? 16 : 38}
              mode={mode}
            />
          ) : (
            title
          )}
        </h2>
      ) : null}

      {visibleParagraphs.length > 0 && (
        <div className="space-y-4">
          {visibleParagraphs.map((p, i) =>
            renderBlock(p, `block-${i}`, shouldAnimate),
          )}
        </div>
      )}
    </article>
  );
}
