'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { useAskAI } from '@/components/ask-ai-provider';
import { AgentState, PortfolioAgent } from '@/lib/agent';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { createLoadingViewport } from '@/lib/gen-ui-viewport';
import { useGenUIPrompt } from '@/hooks/use-gen-ui-prompt';
import { scrollPageToTop } from '@/lib/scroll-page';
import { PortfolioSections } from '@/components/portfolio-sections';

const GenUIModeShell = dynamic(
  () => import('@/components/gen-ui-mode-shell').then((mod) => ({ default: mod.GenUIModeShell })),
  { ssr: false },
);
const DesktopSidebar = dynamic(
  () => import('@/components/desktop-sidebar').then((mod) => ({ default: mod.DesktopSidebar })),
  { ssr: false },
);
const ProjectDetailView = dynamic(
  () => import('@/components/project-detail-view').then((mod) => ({ default: mod.ProjectDetailView })),
  { ssr: false },
);
const ProjectsListView = dynamic(
  () => import('@/components/projects-list-view').then((mod) => ({ default: mod.ProjectsListView })),
  { ssr: false },
);
const GenUIChatWidget = dynamic(
  () => import('@/components/gen-ui-chat-widget').then((mod) => ({ default: mod.GenUIChatWidget })),
  { ssr: false },
);

function createDefaultAgentState(): AgentState {
  return new PortfolioAgent().getState();
}

const LOADING_MESSAGES = [
  'Arranging your portfolio sections',
  'Curating the best projects',
  'Organizing content for you',
  'Almost there...'
];

export default function Home() {
  const { close: closeAskAI, resetAgent, registerStateChange } = useAskAI();

  const [agentState, setAgentState] = useState<AgentState>(() => createDefaultAgentState());
  const [genUIViewports, setGenUIViewports] = useState<GenUIViewport[]>([]);
  const [activeViewportId, setActiveViewportId] = useState<string | null>(null);
  const [scrollToViewportId, setScrollToViewportId] = useState<string | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [genUIMode, setGenUIMode] = useState(false);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const contentGutterClass = isSidebarCollapsed
    ? 'mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]'
    : 'mx-0 px-4 sm:mx-3 sm:px-4 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-8 xl:px-10';

  const handleStateChange = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  useEffect(() => {
    registerStateChange(handleStateChange);
  }, [handleStateChange, registerStateChange]);

  const handleAgentWorking = (working: boolean, hint?: { prompt?: string; pendingId?: string }) => {
    if (working) {
      if (hint?.prompt) {
        const pending = createLoadingViewport(hint.prompt, hint.pendingId);
        setGenUIViewports((prev) => [...prev, pending]);
        setActiveViewportId(pending.id);
        setScrollToViewportId(pending.id);
      }
    }
    setIsAgentWorking(working);
    if (working) {
      setLoadingStartTime(Date.now());
      setLoadingMessageIndex(0);
    } else {
      setLoadingStartTime(null);
      setLoadingMessageIndex(0);
    }
  };

  const handleGenUIViewport = (viewport: GenUIViewport) => {
    setGenUIViewports((prev) => {
      let loadingIdx = prev.findIndex(
        (v) => v.id === viewport.id && v.status === 'loading',
      );
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
  };

  const genUIPrompt = useGenUIPrompt({
    onAgentWorking: handleAgentWorking,
    onGenUIViewport: handleGenUIViewport,
    onStateChange: handleStateChange,
  });

  useEffect(() => {
    if (!isAgentWorking || loadingStartTime === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingStartTime;
      const newIndex = Math.min(
        Math.floor(elapsed / 2000),
        LOADING_MESSAGES.length - 1
      );
      if (newIndex !== loadingMessageIndex) {
        setLoadingMessageIndex(newIndex);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAgentWorking, loadingStartTime, loadingMessageIndex]);

  const handleHomeClick = useCallback(() => {
    resetAgent();
    closeAskAI();
    setGenUIViewports([]);
    setActiveViewportId(null);
    setScrollToViewportId(null);
    setGenUIMode(false);
    genUIPrompt.reset();
    setSelectedProject(null);
  }, [resetAgent, closeAskAI, genUIPrompt.reset]);

  useRegisterNavActions({
    onProjectSelect: setSelectedProject,
    onHomeClick: handleHomeClick,
    hideMobileNav: genUIMode,
    showWidgetsToggle: !genUIMode,
    widgetsCollapsed: isSidebarCollapsed,
    onOpenWidgets: () => setIsSidebarCollapsed(false),
  });

  const handleEnterGenUI = () => {
    scrollPageToTop();
    setGenUIMode(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="flex pt-14 relative z-10">
        <div
          className={`fixed left-0 top-14 z-20 hidden h-[calc(100vh-3.5rem)] transition-all duration-300 lg:block ${
            isSidebarCollapsed ? 'pointer-events-none w-0' : 'w-80'
          }`}
        >
          <ErrorBoundary>
            <DesktopSidebar 
              onProjectSelect={setSelectedProject} 
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={setIsSidebarCollapsed}
            />
          </ErrorBoundary>
        </div>
        
        <div
          className={`flex-1 w-full relative z-10 transition-[margin-left] duration-500 ease-in-out overflow-x-hidden ${
            isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-80'
          } ${
            genUIMode
              ? 'h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden p-0'
              : 'py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8'
          }`}
        >
          <div
            className={`transition-[max-width,margin] duration-500 ease-in-out ${isSidebarCollapsed ? 'max-w-[1500px] mx-auto' : 'max-w-7xl mx-auto'}${genUIMode ? ' h-full' : ''}`}
          >
            {selectedProject && !genUIMode ? (
            <div className="w-full">
              <ProjectDetailView 
                projectId={selectedProject} 
                onBack={() => {
                  setSelectedProject(null);
                  setShowProjectsList(false);
                }} 
              />
            </div>
          ) : genUIMode && selectedProject ? (
            <div className="relative h-full min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pb-24 lg:pb-8">
                <ProjectDetailView
                  projectId={selectedProject}
                  onBack={() => {
                    setSelectedProject(null);
                    scrollPageToTop();
                  }}
                />
              </div>
              <GenUIChatWidget
                messages={genUIPrompt.conversationHistory}
                isLoading={genUIPrompt.isLoading || isAgentWorking}
                onBackToChat={() => {
                  setSelectedProject(null);
                  scrollPageToTop();
                }}
              />
            </div>
          ) : showProjectsList ? (
            <div className="w-full h-full">
              <ProjectsListView
                onBack={() => {
                  setShowProjectsList(false);
                  setSelectedProject(null);
                }}
                onProjectSelect={(projectId) => {
                  setSelectedProject(projectId);
                }}
                selectedProjectId={selectedProject}
              />
            </div>
          ) : genUIMode ? (
            <GenUIModeShell
              viewports={genUIViewports}
              activeViewportId={activeViewportId}
              scrollToViewportId={scrollToViewportId}
              isAgentWorking={isAgentWorking}
              hasPrompted={genUIPrompt.hasPrompted}
              isLoading={genUIPrompt.isLoading}
              promptCount={genUIPrompt.promptCount}
              promptLimitLoaded={genUIPrompt.promptLimitLoaded}
              hideMobileNav={genUIMode}
              headline="What would you like to explore?"
              subhead="Ask about my work — I'll build a custom view."
              onSubmit={genUIPrompt.submitPrompt}
              onActiveChange={setActiveViewportId}
              onCaseStudySelect={(projectSlug) => {
                setSelectedProject(projectSlug);
                scrollPageToTop();
              }}
            />
          ) : (
            <div className={contentGutterClass}>
              <ErrorBoundary>
                <PortfolioSections
                  agentState={agentState}
                  hideHeaderText={false}
                  onProjectSelect={setSelectedProject}
                  onShowProjectsList={() => setShowProjectsList(true)}
                  onEnterGenUI={handleEnterGenUI}
                  selectedProjectId={selectedProject}
                />
              </ErrorBoundary>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
