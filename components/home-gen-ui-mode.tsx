'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AgentState } from '@/lib/agent';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { createLoadingViewport } from '@/lib/gen-ui-viewport';
import { useGenUIPrompt } from '@/hooks/use-gen-ui-prompt';
import { scrollPageToTop } from '@/lib/scroll-page';
import { OsBackButton } from '@/components/os-back-button';
import { blurFadeUp, easeOutExpo } from '@/lib/motion';

const GenUIModeShell = dynamic(
  () => import('@/components/gen-ui-mode-shell').then((mod) => ({ default: mod.GenUIModeShell })),
  { ssr: false },
);
const ProjectDetailView = dynamic(
  () => import('@/components/project-detail-view').then((mod) => ({ default: mod.ProjectDetailView })),
  { ssr: false },
);
const GenUIChatWidget = dynamic(
  () => import('@/components/gen-ui-chat-widget').then((mod) => ({ default: mod.GenUIChatWidget })),
  { ssr: false },
);

const caseStudyEnterTransition = {
  duration: 0.55,
  ease: easeOutExpo,
};

type HomeGenUIModeProps = {
  selectedProject: string | null;
  onSelectProject: (projectId: string) => void;
  onClearProject: () => void;
  onStateChange: (state: AgentState) => void;
};

/**
 * Home Gen UI surface — mounted only after the user enters Gen UI,
 * so the agent/prompt stack stays off the initial Home chunk.
 */
export default function HomeGenUIMode({
  selectedProject,
  onSelectProject,
  onClearProject,
  onStateChange,
}: HomeGenUIModeProps) {
  const reduceMotion = useReducedMotion();
  const [genUIViewports, setGenUIViewports] = useState<GenUIViewport[]>([]);
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [scrollToViewportId, setScrollToViewportId] = useState<string | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);

  const handleAgentWorking = useCallback(
    (working: boolean, hint?: { prompt?: string; pendingId?: string }) => {
      if (working && hint?.prompt) {
        const pending = createLoadingViewport(hint.prompt, hint.pendingId);
        setGenUIViewports((prev) => [...prev, pending]);
        setActiveViewportId(pending.id);
        setScrollToViewportId(pending.id);
      }
      setIsAgentWorking(working);
    },
    [],
  );

  const handleGenUIViewport = useCallback((viewport: GenUIViewport) => {
    setGenUIViewports((prev) => {
      let loadingIdx = prev.findIndex((v) => v.id === viewport.id && v.status === 'loading');
      if (loadingIdx < 0) {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].status === 'loading') {
            loadingIdx = i;
            break;
          }
        }
      }
      if (loadingIdx < 0) {
        loadingIdx = prev.findIndex(
          (v) => v.status === 'loading' && v.prompt.trim() === viewport.prompt.trim(),
        );
      }
      if (loadingIdx >= 0) {
        const preservedId = prev[loadingIdx].id;
        const next = [...prev];
        next[loadingIdx] = { ...viewport, id: preservedId, status: 'ready' };
        setActiveViewportId(preservedId);
        setScrollToViewportId(preservedId);
        return next.filter(
          (v, i) =>
            i === loadingIdx ||
            !(v.status === 'loading' && v.prompt.trim() === viewport.prompt.trim()),
        );
      }
      setActiveViewportId(viewport.id);
      setScrollToViewportId(viewport.id);
      return [...prev, { ...viewport, status: 'ready' as const }];
    });
  }, []);

  const genUIPrompt = useGenUIPrompt({
    onAgentWorking: handleAgentWorking,
    onGenUIViewport: handleGenUIViewport,
    onStateChange,
  });

  const handleBackToAsk = useCallback(() => {
    setGenUIViewports([]);
    setActiveViewportId(null);
    setScrollToViewportId(null);
    setIsAgentWorking(false);
    genUIPrompt.reset();
  }, [genUIPrompt.reset]);

  if (selectedProject) {
    return (
      <motion.div
        key={`genui-case-${selectedProject}`}
        className="relative h-full min-h-0 overflow-hidden"
        initial={reduceMotion ? false : blurFadeUp.initial}
        animate={blurFadeUp.animate}
        transition={caseStudyEnterTransition}
      >
        <div className="h-full overflow-y-auto pb-24 lg:pb-8">
          <div className="os-col--case sticky top-0 z-50 mb-2 px-4 pt-3 sm:px-6 md:pt-4">
            <OsBackButton
              onClick={() => {
                onClearProject();
                scrollPageToTop();
              }}
              aria-label="Back to Ask AI"
            />
          </div>
          <div className="px-4 sm:px-6">
            <ProjectDetailView
              projectId={selectedProject}
              hideBackButton
              onBack={() => {
                onClearProject();
                scrollPageToTop();
              }}
            />
          </div>        </div>
        <GenUIChatWidget
          messages={genUIPrompt.conversationHistory}
          isLoading={genUIPrompt.isLoading || isAgentWorking}
          onBackToChat={() => {
            onClearProject();
            scrollPageToTop();
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className="h-full">
      <GenUIModeShell
        viewports={genUIViewports}
        activeViewportId={activeViewportId}
        scrollToViewportId={scrollToViewportId}
        isAgentWorking={isAgentWorking}
        hasPrompted={genUIPrompt.hasPrompted}
        isLoading={genUIPrompt.isLoading}
        promptCount={genUIPrompt.promptCount}
        promptLimitLoaded={genUIPrompt.promptLimitLoaded}
        hideMobileNav
        showSidebar
        brandLabel="Ask AI"
        subhead="Ask about my work — I'll build a custom view."
        onSubmit={genUIPrompt.submitPrompt}
        onActiveChange={setActiveViewportId}
        onCaseStudySelect={onSelectProject}
        onBack={handleBackToAsk}
      />
    </div>
  );
}
