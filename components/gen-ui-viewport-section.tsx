'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUICardGrid } from '@/components/gen-ui-canvas';
import { GenUIAssistantReply } from '@/components/gen-ui-assistant-reply';
import { GenUIUserMessage } from '@/components/gen-ui-user-message';
import { GenUIWaveLoader } from '@/components/gen-ui-wave-loader';
import { GenUIThinkingRow } from '@/components/gen-ui-thinking-row';

type ViewPhase = 'awaiting' | 'story' | 'building' | 'content';

const STORY_TO_BUILDING_MS = 1400;
const BUILDING_MS = 2000;

type GenUIViewportSectionProps = {
  viewport: GenUIViewport;
};

export function GenUIViewportSection({ viewport: vp }: GenUIViewportSectionProps) {
  const playedRef = useRef(false);
  const willBuildUI = vp.items.length > 0;
  const [phase, setPhase] = useState<ViewPhase>(() =>
    vp.status === 'loading' ? 'awaiting' : 'content',
  );

  useEffect(() => {
    if (vp.status === 'loading') {
      playedRef.current = true;
      setPhase('awaiting');
      return;
    }

    if (vp.status === 'ready' && playedRef.current) {
      playedRef.current = false;
      setPhase('story');
    }
  }, [vp.status, vp.id]);

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

  const showOrb = phase === 'awaiting' || (phase === 'story' && willBuildUI);
  const showReply = phase === 'story' || phase === 'building' || phase === 'content';
  const showWaveLoader = phase === 'building' && willBuildUI;
  const showCards = phase === 'content' && willBuildUI;

  return (
    <section
      id={`gen-ui-viewport-${vp.id}`}
      className="min-h-[min(100%,calc(100vh-5.5rem))] flex flex-col border-b border-border/10"
    >
      <div className="w-full flex-1 pt-20 md:pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6 flex flex-col gap-7 md:gap-8">
          <GenUIUserMessage prompt={vp.prompt} />

          {showReply && (
            <GenUIAssistantReply
              title={vp.title}
              summary={vp.summary}
              animate={phase === 'story'}
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
              <GenUICardGrid prompt={vp.prompt} items={vp.items} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
