'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUICardGrid } from '@/components/gen-ui-canvas';
import { GenUIAssistantReply } from '@/components/gen-ui-assistant-reply';
import { GenUIUserMessage } from '@/components/gen-ui-user-message';
import { GenUIWaveLoader } from '@/components/gen-ui-wave-loader';
import { GenUIThinkingRow } from '@/components/gen-ui-thinking-row';
import { cn } from '@/lib/utils';

type ViewPhase = 'awaiting' | 'story' | 'building' | 'content';

const STORY_TO_BUILDING_MS = 1400;
const BUILDING_MS = 2000;

type GenUIViewportSectionProps = {
  viewport: GenUIViewport;
  onCaseStudySelect?: (projectSlug: string) => void;
};

export function GenUIViewportSection({ viewport: vp, onCaseStudySelect }: GenUIViewportSectionProps) {
  const playedRef = useRef(false);
  const willBuildUI = vp.items.length > 0;
  const textOnlyReply = !willBuildUI && Boolean(vp.summary?.trim());
  const skipStory = willBuildUI && !vp.summary?.trim();
  const [phase, setPhase] = useState<ViewPhase>(() => {
    if (vp.status === 'loading') return 'awaiting';
    if (skipStory) return 'content';
    // Fresh text-only replies animate; hydrated history stays static.
    if (textOnlyReply) return 'content';
    return vp.status === 'ready' ? 'story' : 'content';
  });

  useEffect(() => {
    if (vp.status === 'loading') {
      playedRef.current = true;
      setPhase('awaiting');
      return;
    }

    if (vp.status === 'ready') {
      if (textOnlyReply) {
        if (playedRef.current) {
          playedRef.current = false;
          setPhase('story');
        } else {
          setPhase('content');
        }
        return;
      }

      const directToContent = vp.items.length > 0 && !vp.summary?.trim();
      if (directToContent) {
        playedRef.current = false;
        setPhase('content');
        return;
      }
      if (playedRef.current) {
        playedRef.current = false;
        setPhase('story');
      } else {
        setPhase('content');
      }
    }
  }, [vp.status, vp.id, vp.items.length, vp.summary, textOnlyReply]);

  const handleStoryComplete = useCallback(() => {
    if (!willBuildUI) {
      setPhase('content');
      return;
    }
    window.setTimeout(() => setPhase('building'), STORY_TO_BUILDING_MS);
  }, [willBuildUI]);

  useEffect(() => {
    if (phase !== 'building') return;
    const timer = window.setTimeout(() => setPhase('content'), BUILDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const showOrb = !skipStory && (phase === 'awaiting' || (phase === 'story' && willBuildUI));
  const showReply = !skipStory && (phase === 'story' || phase === 'building' || phase === 'content');
  const showTitleOnly = skipStory && phase === 'content';
  const showWaveLoader = phase === 'building' && willBuildUI;
  const showCards = phase === 'content' && willBuildUI;

  return (
    <section
      id={`gen-ui-viewport-${vp.id}`}
      className={cn(
        'flex flex-col border-b border-border/10 last:border-b-0',
        textOnlyReply
          ? 'min-h-0'
          : 'min-h-[min(100%,calc(100vh-5.5rem))]',
      )}
    >
      <div
        className={cn(
          'w-full',
          textOnlyReply
            ? 'px-0 py-5 md:py-6'
            : 'flex-1 pt-20 md:pt-24 pb-12',
        )}
      >
        <div
          className={cn(
            'mx-auto max-w-3xl px-4 md:px-6 flex flex-col',
            textOnlyReply ? 'gap-3 md:gap-4' : 'gap-7 md:gap-8',
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
              mode={textOnlyReply ? 'letter' : 'word'}
              onAnimationComplete={handleStoryComplete}
            />
          )}

          {showOrb && (
            <GenUIThinkingRow showLabel={phase === 'awaiting'} />
          )}
        </div>

        {showWaveLoader && (
          <div className="mt-12 md:mt-14 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[90px] animate-fade-in-blur">
            <GenUIWaveLoader className="min-h-[280px] md:min-h-[380px] rounded-2xl" label="Building view" />
          </div>
        )}

        {showCards && (
          <div className="mt-12 md:mt-14 w-full px-4 md:px-6 animate-fade-in-blur">
            <div className="mx-auto w-full max-w-[1200px]">
              <GenUICardGrid prompt={vp.prompt} items={vp.items} onCaseStudySelect={onCaseStudySelect} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
