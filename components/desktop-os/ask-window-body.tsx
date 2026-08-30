'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useNavActions } from '@/contexts/nav-actions-context';
import { openCaseStudyInHomeWindow } from '@/lib/open-case-study';
import type { GenUIChat, GenUIViewport } from '@/lib/gen-ui-viewport';
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
  const [chats, setChats] = useState<GenUIChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [scrollToViewportId, setScrollToViewportId] = useState<string | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);

  // Read inside callbacks without making them depend on render state.
  const activeChatIdRef = useRef<string | null>(null);

  const genUIViewports = useMemo(
    () => chats.find((c) => c.id === activeChatId)?.viewports ?? [],
    [chats, activeChatId],
  );

  /** Replace the viewports of whichever chat is currently open. */
  const updateActiveChat = useCallback(
    (update: (viewports: GenUIViewport[]) => GenUIViewport[]) => {
      const chatId = activeChatIdRef.current;
      if (!chatId) return;
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, viewports: update(c.viewports) } : c)),
      );
    },
    [],
  );

  const handleAgentWorking = useCallback(
    (working: boolean, hint?: { prompt?: string; pendingId?: string }) => {
      if (working && hint?.prompt) {
        const pending = createLoadingViewport(hint.prompt, hint.pendingId);
        // First prompt of a session starts a new chat; later ones append to it,
        // so history lists conversations rather than every message.
        if (!activeChatIdRef.current) {
          const chatId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          activeChatIdRef.current = chatId;
          setChats((prev) => [
            ...prev,
            { id: chatId, title: hint.prompt!.trim(), viewports: [pending] },
          ]);
          setActiveChatId(chatId);
        } else {
          updateActiveChat((viewports) => [...viewports, pending]);
        }
        setActiveViewportId(pending.id);
        setScrollToViewportId(pending.id);
      }
      setIsAgentWorking(working);
    },
    [updateActiveChat],
  );

  const handleGenUIViewport = useCallback((viewport: GenUIViewport) => {
    updateActiveChat((prev) => {
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
  }, [updateActiveChat]);

  const genUIPrompt = useGenUIPrompt({
    onAgentWorking: handleAgentWorking,
    onGenUIViewport: handleGenUIViewport,
  });

  /** New Chat — keeps past conversations in history, just starts a fresh one. */
  const handleBack = useCallback(() => {
    activeChatIdRef.current = null;
    setActiveChatId(null);
    setActiveViewportId(null);
    setScrollToViewportId(null);
    setIsAgentWorking(false);
    genUIPrompt.reset();
  }, [genUIPrompt.reset]);

  const handleSelectChat = useCallback(
    (id: string) => {
      const chat = chats.find((c) => c.id === id);
      if (!chat) return;
      activeChatIdRef.current = id;
      setActiveChatId(id);
      const last = chat.viewports[chat.viewports.length - 1];
      setActiveViewportId(last?.id ?? null);
      setScrollToViewportId(last?.id ?? null);
      setIsAgentWorking(false);
      // Each chat carries its own thread, so drop the previous conversation context.
      genUIPrompt.reset();
    },
    [chats, genUIPrompt.reset],
  );

  return (
    <div className="os-window-content flex h-full min-h-0 flex-col overflow-hidden" data-os-embedded="true">
      <GenUIModeShell
        embedded
        orbSize="lg"
        subheadPlacement="below-chips"
        viewports={genUIViewports}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        activeViewportId={activeViewportId}
        scrollToViewportId={scrollToViewportId}
        isAgentWorking={isAgentWorking}
        hasPrompted={genUIPrompt.hasPrompted}
        isLoading={genUIPrompt.isLoading}
        promptCount={genUIPrompt.promptCount}
        promptLimitLoaded={genUIPrompt.promptLimitLoaded}
        hideMobileNav
        brandLabel="Ask AI"
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
