'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { useAskAI } from '@/components/ask-ai-provider';
import { AgentState, PortfolioAgent } from '@/lib/agent';
import { scrollPageToTop } from '@/lib/scroll-page';
import { PortfolioSections } from '@/components/portfolio-sections';
import { CaseStudyLoading } from '@/components/case-study-loading';
import { OsBackButton } from '@/components/os-back-button';
import { blurFadeUp, easeOutExpo } from '@/lib/motion';
import { cn } from '@/lib/utils';

const caseStudyEnterTransition = {
  duration: 0.55,
  ease: easeOutExpo,
};

const DesktopSidebar = dynamic(
  () => import('@/components/desktop-sidebar').then((mod) => ({ default: mod.DesktopSidebar })),
  { ssr: false },
);
const ProjectDetailView = dynamic(
  () => import('@/components/project-detail-view').then((mod) => ({ default: mod.ProjectDetailView })),
  {
    ssr: false,
    loading: () => <CaseStudyLoading />,
  },
);
const ProjectsListView = dynamic(
  () => import('@/components/projects-list-view').then((mod) => ({ default: mod.ProjectsListView })),
  { ssr: false },
);
/** Loaded only after the user enters Gen UI — keeps agent/prompt JS off first paint. */
const HomeGenUIMode = dynamic(() => import('@/components/home-gen-ui-mode'), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-[240px] items-center justify-center" aria-hidden />,
});

function createDefaultAgentState(): AgentState {
  return new PortfolioAgent().getState();
}

export default function HomePage({ embedded = false }: { embedded?: boolean }) {
  const { close: closeAskAI, resetAgent, registerStateChange } = useAskAI();
  const reduceMotion = useReducedMotion();

  const [agentState, setAgentState] = useState<AgentState>(() => createDefaultAgentState());
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [genUIMode, setGenUIMode] = useState(false);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const contentGutterClass = embedded
    ? 'mx-auto w-full max-w-none px-3 sm:px-4 md:px-5'
    : isSidebarCollapsed
      ? 'mx-auto w-full max-w-[72rem] px-4 sm:px-6 md:px-8 lg:px-10'
      : 'mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8';

  const handleStateChange = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  useEffect(() => {
    registerStateChange(handleStateChange);
  }, [handleStateChange, registerStateChange]);

  // Warm the case-study chunk so the first open isn’t a blank wait.
  useEffect(() => {
    const warm = () => {
      void import('@/components/project-detail-view');
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(warm, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 600);
    return () => window.clearTimeout(t);
  }, []);

  const handleHomeClick = useCallback(() => {
    resetAgent();
    closeAskAI();
    setGenUIMode(false);
    setSelectedProject(null);
    scrollPageToTop();
  }, [resetAgent, closeAskAI]);

  const feedScrollRef = useRef(0);

  const readWindowScrollTop = () => {
    const body = document.querySelector('.os-window-body');
    if (body instanceof HTMLElement) return body.scrollTop;
    return window.scrollY || document.documentElement.scrollTop || 0;
  };

  const restoreFeedScroll = useCallback(() => {
    const top = feedScrollRef.current;
    requestAnimationFrame(() => {
      const body = document.querySelector('.os-window-body');
      if (body instanceof HTMLElement) {
        body.scrollTop = top;
        return;
      }
      window.scrollTo({ top, left: 0, behavior: 'instant' });
    });
  }, []);

  const handleEnterGenUI = () => {
    scrollPageToTop();
    setGenUIMode(true);
    // Prefetch the Gen UI chunk as soon as the user commits to entering.
    void import('@/components/home-gen-ui-mode');
  };

  const selectProject = useCallback((projectId: string) => {
    feedScrollRef.current = readWindowScrollTop();
    setSelectedProject(projectId);
    scrollPageToTop();
  }, []);

  const backFromCaseStudy = useCallback(() => {
    setSelectedProject(null);
    setShowProjectsList(false);
    restoreFeedScroll();
  }, [restoreFeedScroll]);

  useRegisterNavActions({
    onProjectSelect: selectProject,
    onHomeClick: handleHomeClick,
    hideMobileNav: genUIMode,
    showWidgetsToggle: !genUIMode && !embedded,
    widgetsCollapsed: embedded ? true : isSidebarCollapsed,
    onOpenWidgets: () => setIsSidebarCollapsed(false),
  });

  const showHomeFeed = !selectedProject && !genUIMode && !showProjectsList;

  return (
    <div
      className={`relative overflow-x-hidden bg-background antialiased ${
        embedded ? 'min-h-0 bg-transparent' : 'min-h-screen lg:min-h-0 lg:bg-transparent'
      }`}
    >
      <div className={`relative z-10 flex ${embedded ? 'pt-0' : 'pt-14 lg:pt-0'}`}>
        {!embedded && (
          <div
            className={`fixed left-0 top-14 z-20 hidden h-[calc(100vh-3.5rem)] transition-all duration-300 lg:block ${
              isSidebarCollapsed ? 'pointer-events-none w-0' : 'w-80'
            }`}
          >
            <ErrorBoundary>
              <DesktopSidebar
                onProjectSelect={selectProject}
                isCollapsed={isSidebarCollapsed}
                onCollapseChange={setIsSidebarCollapsed}
              />
            </ErrorBoundary>
          </div>
        )}

        <div
          className={`flex-1 w-full relative z-10 transition-[margin-left] duration-500 ease-in-out overflow-x-hidden ${
            embedded || isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-80'
          } ${
            genUIMode
              ? embedded
                ? 'h-full min-h-0 overflow-hidden p-0'
                : 'h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden p-0'
              : embedded
                ? 'py-4 px-1 pb-8'
                : 'py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8'
          }`}
        >
          <div
            className={`transition-[max-width,margin] duration-500 ease-in-out ${isSidebarCollapsed ? 'max-w-[1500px] mx-auto' : 'max-w-7xl mx-auto'}${genUIMode ? ' h-full' : ''}`}
          >
            <div
              className={cn(contentGutterClass, !showHomeFeed && 'hidden')}
              aria-hidden={!showHomeFeed}
            >
              <ErrorBoundary>
                <PortfolioSections
                  agentState={agentState}
                  hideHeaderText={false}
                  onProjectSelect={selectProject}
                  onShowProjectsList={() => setShowProjectsList(true)}
                  onEnterGenUI={handleEnterGenUI}
                  selectedProjectId={selectedProject}
                />
              </ErrorBoundary>
            </div>

            <AnimatePresence mode="sync">
              {selectedProject && !genUIMode ? (
                <motion.div
                  key={`case-${selectedProject}`}
                  className={cn('w-full', contentGutterClass)}
                  initial={reduceMotion ? false : blurFadeUp.initial}
                  animate={blurFadeUp.animate}
                  exit={reduceMotion ? undefined : blurFadeUp.exit}
                  transition={caseStudyEnterTransition}
                >
                  <div className="os-col--case sticky top-0 z-50 mb-2 pt-3 md:pt-4">
                    <OsBackButton onClick={backFromCaseStudy} aria-label="Back to Home" />
                  </div>
                  <ProjectDetailView
                    projectId={selectedProject}
                    hideBackButton
                    onBack={backFromCaseStudy}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {showProjectsList && !selectedProject && !genUIMode ? (
              <div key="projects-list" className="w-full h-full">
                <ProjectsListView
                  onBack={() => {
                    setShowProjectsList(false);
                    setSelectedProject(null);
                  }}
                  onProjectSelect={(projectId) => {
                    selectProject(projectId);
                  }}
                  selectedProjectId={selectedProject}
                />
              </div>
            ) : null}

            {genUIMode ? (
              <HomeGenUIMode
                selectedProject={selectedProject}
                onSelectProject={selectProject}
                onClearProject={() => setSelectedProject(null)}
                onStateChange={handleStateChange}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
