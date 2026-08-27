'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { useAskAI } from '@/components/ask-ai-provider';
import { AgentState, PortfolioAgent } from '@/lib/agent';
import { scrollPageToTop } from '@/lib/scroll-page';
import { PortfolioSections } from '@/components/portfolio-sections';
import { OsBackButton } from '@/components/os-back-button';
import { useOsWindowAutoExpand, useOsWindowClose } from '@/components/desktop-os/os-window-scope';
import { useCaseStudyTracking } from '@/hooks/use-case-study-tracking';
import { useCaseStudyDocumentTitle } from '@/hooks/use-case-study-document-title';
import { buildCaseStudySections } from '@/lib/case-study-sections';
import { CaseStudyOnPageNav } from '@/components/case-study-on-page-nav';
import { useSiteContent } from '@/components/site-content-provider';
import { getProjectId, normalizeProjectSlug } from '@/lib/types/project';
import { blurFadeUp, easeOutExpo } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  { ssr: false },
);
const ProjectsListView = dynamic(
  () => import('@/components/projects-list-view').then((mod) => ({ default: mod.ProjectsListView })),
  { ssr: false },
);
/** Loaded only after the user enters Gen UI — keeps agent/prompt JS off first paint. */
const HomeGenUIMode = dynamic(() => import('@/components/home-gen-ui-mode'), {
  ssr: false,
});

function createDefaultAgentState(): AgentState {
  return new PortfolioAgent().getState();
}

export default function HomePage({ embedded = false }: { embedded?: boolean }) {
  const { close: closeAskAI, resetAgent, registerStateChange } = useAskAI();
  const reduceMotion = useReducedMotion();
  const { projects } = useSiteContent();
  const tWork = useTranslations('work');

  const [agentState, setAgentState] = useState<AgentState>(() => createDefaultAgentState());
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [genUIMode, setGenUIMode] = useState(false);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const contentGutterClass = embedded
    ? 'mx-auto w-full max-w-none px-6 sm:px-8 md:px-10'
    : isSidebarCollapsed
      ? 'mx-auto w-full max-w-[72rem] px-4 sm:px-6 md:px-8 lg:px-10'
      : 'mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8';
  /** Home feed sits narrower than the window — `.home-col` owns the max width. */
  const homeFeedGutterClass = embedded
    ? 'home-col mx-auto w-full'
    : contentGutterClass;

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
    selectedProjectId: genUIMode ? null : selectedProject,
    onHomeClick: handleHomeClick,
    hideMobileNav: genUIMode,
    showWidgetsToggle: !genUIMode && !embedded,
    widgetsCollapsed: embedded ? true : isSidebarCollapsed,
    onOpenWidgets: () => setIsSidebarCollapsed(false),
  });

  const showHomeFeed = !selectedProject && !genUIMode && !showProjectsList;

  // Case studies want the full desktop — cover while one is open, restore on back.
  useOsWindowAutoExpand(Boolean(selectedProject) && !genUIMode);

  // Case studies have no URL, so pageviews cannot see them.
  useCaseStudyTracking(genUIMode ? null : selectedProject, 'home');
  useCaseStudyDocumentTitle(genUIMode ? null : selectedProject, projects);

  const activeProject = selectedProject
    ? projects.find(
        (project) => getProjectId(project.title) === normalizeProjectSlug(selectedProject),
      )
    : undefined;
  const activeSections = activeProject
    ? buildCaseStudySections(activeProject, {
        designGallery: tWork('sections.designGallery'),
        problem: tWork('sections.problem'),
        targetAudience: tWork('sections.targetAudience'),
        research: tWork('sections.research'),
        exploring: tWork('sections.exploring'),
        prototype: tWork('sections.prototype'),
        hmw: tWork('sections.hmw'),
        possibleSolutions: tWork('sections.possibleSolutions'),
        result: tWork('sections.result'),
        stats: tWork('sections.stats'),
        keyFeatures: tWork('sections.keyFeatures'),
        business: tWork('sections.business'),
        learnings: tWork('sections.learnings'),
        impact: tWork('sections.impact'),
      })
    : [];

  // Closing the window drops the case study, so reopening Home lands on Home.
  useOsWindowClose(
    useCallback(() => {
      setSelectedProject(null);
      setShowProjectsList(false);
    }, []),
  );

  const embeddedCaseOpen = Boolean(embedded && selectedProject && !genUIMode);

  return (
    <div
      className={cn(
        'relative antialiased',
        embedded
          ? embeddedCaseOpen
            ? 'flex h-full min-h-0 flex-col overflow-hidden bg-transparent'
            : 'min-h-0 overflow-x-clip bg-transparent'
          : 'min-h-screen overflow-x-hidden bg-background lg:min-h-0 lg:bg-transparent',
      )}
    >
      <div
        className={cn(
          'relative z-10 flex',
          embedded ? 'min-h-0 pt-0' : 'pt-14 lg:pt-0',
          embeddedCaseOpen && 'h-full min-h-0 flex-1 flex-col',
        )}
      >
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
          className={`flex-1 w-full relative z-10 transition-[margin-left] duration-500 ease-in-out ${
            embedded ? 'overflow-x-clip' : 'overflow-x-hidden'
          } ${
            embedded || isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-80'
          } ${
            genUIMode
              ? embedded
                ? 'h-full min-h-0 overflow-hidden p-0'
                : 'h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden p-0'
              : embeddedCaseOpen
                ? 'flex min-h-0 flex-col overflow-hidden py-3 px-0'
                : embedded
                  ? 'py-4 px-0 pb-8'
                  : 'py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8'
          }`}
        >
          <div
            className={cn(
              'transition-[max-width,margin] duration-500 ease-in-out',
              embeddedCaseOpen
                ? 'flex h-full min-h-0 w-full max-w-none flex-col'
                : genUIMode
                  ? 'mx-auto h-full max-w-7xl'
                  : isSidebarCollapsed
                    ? 'mx-auto max-w-[1500px]'
                    : 'mx-auto max-w-7xl',
            )}
          >
            <div
              className={cn(homeFeedGutterClass, !showHomeFeed && 'hidden')}
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

            {selectedProject && !genUIMode ? (
                <div
                  key={`case-${selectedProject}`}
                  className={
                    embedded
                      ? 'flex h-full min-h-0 w-full max-w-none flex-col px-0'
                      : 'w-full max-w-none px-0'
                  }
                  data-os-home-case={embedded ? 'true' : undefined}
                >
                  <div
                    className={
                      embedded
                        ? 'os-home-case-row relative h-full min-h-0 w-full'
                        : 'home-case-row relative mx-auto w-full max-w-[1500px]'
                    }
                  >
                    <div
                      className={
                        embedded
                          ? 'os-home-case-main flex min-h-0 min-w-0 flex-col'
                          : 'os-home-case-main min-w-0'
                      }
                    >
                      <div
                        className={
                          embedded
                            ? 'os-home-case-inner flex h-full min-h-0 w-full min-w-0 flex-col'
                            : 'os-home-case-inner w-full min-w-0'
                        }
                      >
                        {/* Pinned above the case scroller — not sticky (avoids zoom+sticky jitter). */}
                        <div className="os-case-back z-50 mb-4 shrink-0 px-3 py-2.5 sm:px-0">
                          <OsBackButton
                            onClick={backFromCaseStudy}
                            aria-label="Back to Home"
                          />
                        </div>
                        <div
                          className={
                            embedded
                              ? 'os-case-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain'
                              : undefined
                          }
                        >
                          <motion.div
                            initial={reduceMotion ? false : blurFadeUp.initial}
                            animate={blurFadeUp.animate}
                            transition={caseStudyEnterTransition}
                          >
                            <ProjectDetailView
                              projectId={selectedProject}
                              projects={projects}
                              hideBackButton
                              onBack={backFromCaseStudy}
                              layout="work-rail"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <aside
                      className={
                        embedded
                          ? 'os-home-case-toc z-30 min-h-0 shrink-0'
                          : 'home-case-toc z-30 hidden shrink-0 lg:block'
                      }
                      aria-label={tWork('onThisPage')}
                    >
                      <CaseStudyOnPageNav
                        label={tWork('onThisPage')}
                        projectId={selectedProject}
                        sections={activeSections}
                      />
                    </aside>
                  </div>
                </div>
              ) : null}

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
