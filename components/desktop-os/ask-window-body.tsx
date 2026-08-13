'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useNavActions } from '@/contexts/nav-actions-context';
import { openCaseStudyInHomeWindow } from '@/lib/open-case-study';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { createLoadingViewport } from '@/lib/gen-ui-viewport';
import { useGenUIPrompt } from '@/hooks/use-gen-ui-prompt';

const GenUIModeShell = dynamic(
  () => import('@/components/gen-ui-mode-shell').then((m) => ({ default: m.GenUIModeShell })),
  { ssr: false },
);

/** Ask AI OS window — Gen UI orb experience (lazy-loaded off the critical path). */
export function AskWindowBody() {
  const { openWindow } = useDesktopOs();
  const { onProjectSelectRef } = useNavActions();
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
  });

  const handleBack = useCallback(() => {
    setGenUIViewports([]);
    setActiveViewportId(null);
    setScrollToViewportId(null);
    setIsAgentWorking(false);
    genUIPrompt.reset();
  }, [genUIPrompt.reset]);

  return (
    <div className="os-window-content flex h-full min-h-0 flex-col overflow-hidden" data-os-embedded="true">
      <GenUIModeShell
        embedded
        orbSize="lg"
        subheadPlacement="below-chips"
        viewports={genUIViewports}
        activeViewportId={activeViewportId}
        scrollToViewportId={scrollToViewportId}
        isAgentWorking={isAgentWorking}
        hasPrompted={genUIPrompt.hasPrompted}
        isLoading={genUIPrompt.isLoading}
        promptCount={genUIPrompt.promptCount}
        promptLimitLoaded={genUIPrompt.promptLimitLoaded}
        hideMobileNav
        headline="What would you like to explore?"
        subhead=""
        onSubmit={genUIPrompt.submitPrompt}
        onActiveChange={setActiveViewportId}
        onBack={handleBack}
        onCaseStudySelect={(slug) => {
          openCaseStudyInHomeWindow({
            openWindow,
            selectProject: (id) => onProjectSelectRef.current?.(id),
            slug,
          });
        }}
      />
    </div>
  );
}

export function prefetchAskWindowBody() {
  void import('@/components/desktop-os/ask-window-body');
  void import('@/components/gen-ui-mode-shell');
}
