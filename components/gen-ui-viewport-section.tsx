'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUICardGrid } from '@/components/gen-ui-canvas';
import { GenUIAssistantReply } from '@/components/gen-ui-assistant-reply';
import { GenUIUserMessage } from '@/components/gen-ui-user-message';
import { GenUIThinkingRow } from '@/components/gen-ui-thinking-row';
import { GenUIFollowUps } from '@/components/gen-ui-follow-ups';
import { cn } from '@/lib/utils';

type ViewPhase = 'awaiting' | 'story' | 'content';

type GenUIViewportSectionProps = {
  viewport: GenUIViewport;
  onCaseStudySelect?: (projectSlug: string) => void;
  /** Every prompt in the conversation, so follow-ups skip covered ground. */
  askedPrompts?: string[];
  onFollowUpSelect?: (prompt: string) => void;
  followUpsDisabled?: boolean;
};

export function GenUIViewportSection({
  viewport: vp,
  onCaseStudySelect,
  askedPrompts,
  onFollowUpSelect,
  followUpsDisabled = false,
}: GenUIViewportSectionProps) {
  const reduceMotion = useReducedMotion();
  const playedRef = useRef(false);
  const willBuildUI = vp.items.length > 0;
  const textOnlyReply = !willBuildUI && Boolean(vp.summary?.trim());
  const skipStory = willBuildUI && !vp.summary?.trim();
  const [phase, setPhase] = useState<ViewPhase>(() =>
    vp.status === 'loading' ? 'awaiting' : 'content',
  );
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    if (vp.status === 'loading') {
      playedRef.current = true;
      setPhase('awaiting');
      setAnimateCards(false);
      return;
    }

    if (vp.status !== 'ready') return;

    const fresh = playedRef.current;
    playedRef.current = false;

    if (reduceMotion) {
      setPhase('content');
      setAnimateCards(false);
      return;
    }

    if (skipStory) {
      setPhase('content');
      setAnimateCards(fresh);
      return;
    }

    if (textOnlyReply) {
      setPhase(fresh ? 'story' : 'content');
      setAnimateCards(false);
      return;
    }

    if (fresh) {
      setPhase('story');
      setAnimateCards(false);
    } else {
      setPhase('content');
      setAnimateCards(false);
    }
  }, [vp.status, vp.id, skipStory, textOnlyReply, reduceMotion]);

  const handleStoryComplete = useCallback(() => {
    setPhase('content');
    setAnimateCards(willBuildUI);
  }, [willBuildUI]);

  const showOrb = phase === 'awaiting';
  const showReply = !skipStory && (phase === 'story' || phase === 'content');
  const showTitleOnly = skipStory && phase === 'content';
  const showCards = phase === 'content' && willBuildUI;
  const showFollowUps = phase === 'content' && vp.status === 'ready' && Boolean(onFollowUpSelect);

  return (
    <section
      id={`gen-ui-viewport-${vp.id}`}
      className={cn(
        'flex flex-col border-b border-border/10 last:border-b-0',
        textOnlyReply || vp.status === 'loading'
          ? 'min-h-0'
          : 'min-h-[min(100%,calc(100vh-5.5rem))]',
      )}
    >
      <div
        className={cn(
          'w-full',
          textOnlyReply || vp.status === 'loading'
            ? 'px-0 py-5 md:py-6'
            : 'flex-1 pt-20 md:pt-24 pb-12',
        )}
      >
        <div
          className={cn(
            'mx-auto w-full min-w-0 max-w-3xl px-4 md:px-6 flex flex-col',
            textOnlyReply || vp.status === 'loading' ? 'gap-8 md:gap-10' : 'gap-7 md:gap-8',
          )}
        >
          <GenUIUserMessage prompt={vp.prompt} />

          {showTitleOnly && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-tight leading-[1.15] max-w-3xl">
              {vp.title}
            </h2>
          )}

          {showReply && (
            <GenUIAssistantReply
              title={vp.title}
              summary={vp.summary}
              animate={phase === 'story'}
              mode="word"
              onAnimationComplete={handleStoryComplete}
            />
          )}

          {showOrb && <GenUIThinkingRow showLabel />}
        </div>

        {showCards && (
          <div className="mt-12 md:mt-14 w-full px-4 md:px-6">
            <div className="mx-auto w-full max-w-[1200px]">
              <GenUICardGrid
                prompt={vp.prompt}
                items={vp.items}
                onCaseStudySelect={onCaseStudySelect}
                animate={animateCards}
              />
            </div>
          </div>
        )}

        {showFollowUps && (
          <div className={cn('w-full', showCards ? 'mt-16 md:mt-20' : 'mt-14 md:mt-16')}>
            <div className="mx-auto w-full min-w-0 max-w-3xl px-4 md:px-6">
              <GenUIFollowUps
                prompt={vp.prompt}
                askedPrompts={askedPrompts}
                seed={vp.id}
                onSelect={(p) => onFollowUpSelect?.(p)}
                disabled={followUpsDisabled}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
