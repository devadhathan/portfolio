'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TopBar, MobileBottomNav } from '@/components/top-bar';
import { AboutSection } from '@/components/about-section';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgentState, PortfolioAgent } from '@/lib/agent';
import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import type { CardSkeletonType } from '@/lib/infer-skeleton';
import { GenUIViewportStack } from '@/components/gen-ui-viewport-stack';
import { useTranslations } from 'next-intl';

// Lazy load heavy components to reduce initial bundle size
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const SideAgent = dynamic(() => import('@/components/side-agent').then(mod => ({ default: mod.SideAgent })), { ssr: false });
const PortfolioSections = dynamic(() => import('@/components/portfolio-sections').then(mod => ({ default: mod.PortfolioSections })), { ssr: false });
const DesktopSidebar = dynamic(() => import('@/components/desktop-sidebar').then(mod => ({ default: mod.DesktopSidebar })), { ssr: false });
const ProjectDetailView = dynamic(() => import('@/components/project-detail-view').then(mod => ({ default: mod.ProjectDetailView })), { ssr: false });
const ProjectsListView = dynamic(() => import('@/components/projects-list-view').then(mod => ({ default: mod.ProjectsListView })), { ssr: false });
const FloatingChatButton = dynamic(() => import('@/components/floating-chat-button').then(mod => ({ default: mod.FloatingChatButton })), { ssr: false });

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
  const t = useTranslations('home');
  const [agentState, setAgentState] = useState<AgentState>(() => createDefaultAgentState());
  const [genUIViewports, setGenUIViewports] = useState<GenUIViewport[]>([]);
  const [scrollToViewportId, setScrollToViewportId] = useState<string | null>(null);
  const [skeletonTypes, setSkeletonTypes] = useState<CardSkeletonType[] | undefined>();
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [displayedExplanation, setDisplayedExplanation] = useState<string>('');
  const [isExplanationComplete, setIsExplanationComplete] = useState(false);
  const [shouldShowCards, setShouldShowCards] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [chatMode, setChatMode] = useState<'ask' | 'agent'>('ask');
  const [showProjectsList, setShowProjectsList] = useState(false);
  const resetAgentRef = useRef<(() => void) | null>(null);
  const genUIViewportsRef = useRef<GenUIViewport[]>([]);
  const explanationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showInitialLoading, setShowInitialLoading] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentGutterClass = isSidebarCollapsed
    ? 'mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]'
    : 'mx-0 px-4 sm:mx-3 sm:px-4 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-8 xl:px-10';

  const handleStateChange = (state: AgentState) => {
    setAgentState(state);
  };

  const handleAgentWorking = (working: boolean, hint?: { skeletonTypes?: CardSkeletonType[] }) => {
    setIsAgentWorking(working);
    if (hint?.skeletonTypes) {
      setSkeletonTypes(hint.skeletonTypes);
    }
    if (working) {
      setLoadingStartTime(Date.now());
      setLoadingMessageIndex(0);
      const prev = genUIViewportsRef.current;
      if (prev.length > 0) {
        setScrollToViewportId(prev[prev.length - 1].id);
      }
    } else {
      setLoadingStartTime(null);
      setLoadingMessageIndex(0);
    }
  };

  useEffect(() => {
    genUIViewportsRef.current = genUIViewports;
  }, [genUIViewports]);

  const handleGenUIViewport = (viewport: GenUIViewport) => {
    setGenUIViewports((prev) => [...prev, viewport]);
    setScrollToViewportId(viewport.id);
  };

  const handleGenUIReset = () => {
    setGenUIViewports([]);
    setScrollToViewportId(null);
    setSkeletonTypes(undefined);
  };

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

  const handleExplanationComplete = (complete: boolean) => {
    // Set explanation as complete and trigger card display
    setIsExplanationComplete(complete);
    if (complete) {
      // Delay briefly to let the explanation settle before revealing cards
      setTimeout(() => {
        setShouldShowCards(true);
      }, 350);
    } else {
      setShouldShowCards(false);
    }
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsChatCollapsed(collapsed);
  };

  const handleExplanation = (text: string | null) => {
    if (text === null) {
      setExplanation(null);
      setDisplayedExplanation('');
      setIsExplanationComplete(false);
      setShouldShowCards(false);
      if (explanationTimeoutRef.current) {
        clearTimeout(explanationTimeoutRef.current);
        explanationTimeoutRef.current = null;
      }
      return;
    }
    
    setExplanation(text);
    
    const targetWords = text.split(' ');
    const currentWords = displayedExplanation.split(' ').filter(w => w.length > 0);
    
    if (targetWords.length > currentWords.length) {
      if (explanationTimeoutRef.current) {
        clearTimeout(explanationTimeoutRef.current);
      }
      
      let wordIndex = currentWords.length;
      const animateNextWord = () => {
        if (wordIndex < targetWords.length) {
          const newText = targetWords.slice(0, wordIndex + 1).join(' ');
          setDisplayedExplanation(newText);
          wordIndex++;
          
          if (wordIndex < targetWords.length) {
            explanationTimeoutRef.current = setTimeout(animateNextWord, 30);
          } else {
            setIsExplanationComplete(true);
            explanationTimeoutRef.current = null;
          }
        } else {
          setIsExplanationComplete(true);
          explanationTimeoutRef.current = null;
        }
      };
      
      animateNextWord();
    } else if (text.trim().length > 0) {
      if (displayedExplanation !== text) {
        setDisplayedExplanation(text);
      }
      setIsExplanationComplete(true);
    }
  };

  const handleHomeClick = () => {
    // Reset portfolio state when logo is clicked
    if (resetAgentRef.current) {
      resetAgentRef.current();
    }
    setGenUIViewports([]);
    setScrollToViewportId(null);
    setSkeletonTypes(undefined);
    // Clear explanation state
    setExplanation(null);
    setDisplayedExplanation('');
    setIsExplanationComplete(false);
    setShouldShowCards(false);
    setSelectedProject(null);
  };

  const explanationParagraphs = useMemo(() => {
    const text = displayedExplanation || explanation || '';
    if (!text) return [text];
    let paragraphs = text
      .split(/\n\n+/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
    
    if (paragraphs.length === 1 && text.length > 150) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const grouped: string[] = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const group = sentences.slice(i, Math.min(i + 2, sentences.length)).join(' ').trim();
        if (group) grouped.push(group);
      }
      paragraphs = grouped.length > 0 ? grouped : paragraphs;
    }
    
    return paragraphs.length > 0 ? paragraphs : [text];
  }, [displayedExplanation, explanation]);

  useEffect(() => {
    setMounted(true);

    // Show the intro loader only once per browser session — navigating back to
    // the home view (e.g. pressing "About") should not replay it.
    let alreadyLoaded = false;
    try {
      alreadyLoaded = sessionStorage.getItem('portfolioLoaded') === '1';
    } catch {}

    if (alreadyLoaded) {
      setShowInitialLoading(false);
      return;
    }

    setShowInitialLoading(true);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem('portfolioLoaded', '1');
      } catch {}
      setFadingOut(true);
      setTimeout(() => {
        setShowInitialLoading(false);
        setFadingOut(false);
      }, 700);
    };

    // Keep a short minimum so the intro doesn't flash, then dismiss only once
    // the page's content (videos/images) has fully loaded.
    const minTimer = setTimeout(() => {
      if (document.readyState === 'complete') {
        finish();
      } else {
        window.addEventListener('load', finish, { once: true });
      }
    }, 1200);

    // Safety cap so a slow/stalled asset can never leave the loader stuck.
    const maxTimer = setTimeout(finish, 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('load', finish);
    };
  }, []);

  return (
    <div className="min-h-screen bg-card relative overflow-x-hidden overflow-y-auto">
      {/* Initial Loading Screen - Only shows first time */}
      {mounted && showInitialLoading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col items-center gap-4">
            <video
              autoPlay
              muted
              loop={false}
              playsInline
              preload="auto"
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
            >
              <source src="/videos/Subtle_Typing_Video_Generation.mp4" type="video/mp4" />
            </video>
            <p className="text-base md:text-lg text-white font-normal font-mono animate-pulse">
              {t('loadingPortfolio')}
            </p>
          </div>
        </div>
      )}
      <div className={showInitialLoading ? 'invisible' : 'visible'}>
          <TopBar onProjectSelect={setSelectedProject} onHomeClick={handleHomeClick} />
          
          <div className="flex pt-14 relative z-10">
        {/* Desktop Sidebar - Fixed */}
        <div className={`hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-80'}`}>
          <ErrorBoundary>
            <DesktopSidebar 
              onProjectSelect={setSelectedProject} 
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={setIsSidebarCollapsed}
            />
          </ErrorBoundary>
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 relative z-10 transition-[margin-left] duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'} pb-24 md:pb-28 lg:pb-8 overflow-x-hidden`}>
          <div className={`transition-[max-width,margin] duration-500 ease-in-out ${isSidebarCollapsed ? 'max-w-[1500px] mx-auto' : 'max-w-7xl mx-auto'}`}>
            {selectedProject ? (
            <div className="w-full">
              <ProjectDetailView 
                projectId={selectedProject} 
                onBack={() => {
                  setSelectedProject(null);
                  setShowProjectsList(false);
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
          ) : genUIViewports.length > 0 || isAgentWorking ? (
            <GenUIViewportStack
              viewports={genUIViewports}
              isBuilding={isAgentWorking}
              skeletonTypes={skeletonTypes}
              scrollToId={scrollToViewportId}
            />
          ) : (
            /* ── Default home portfolio ── */
            <div className={`transition-all duration-600 animate-fade-in-blur ${contentGutterClass}`}>
              <ErrorBoundary>
                <PortfolioSections
                  agentState={agentState}
                  hideHeaderText={false}
                  onProjectSelect={setSelectedProject}
                  onShowProjectsList={() => setShowProjectsList(true)}
                />
              </ErrorBoundary>
              <div className="mt-10">
                <AboutSection />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
          
          <SideAgent
            onStateChange={handleStateChange}
            onAgentWorking={handleAgentWorking}
            onCollapseChange={handleCollapseChange}
            onExplanation={handleExplanation}
            onExplanationComplete={handleExplanationComplete}
            onGenUIViewport={handleGenUIViewport}
            onGenUIReset={handleGenUIReset}
            onModeChange={setChatMode}
            resetRef={resetAgentRef}
            externalCollapsed={isChatCollapsed}
            initialMode={chatMode}
          />
          <FloatingChatButton 
            onClick={() => {
              setIsChatCollapsed(false);
            }} 
            isCollapsed={isChatCollapsed}
            mode={chatMode}
            onModeChange={setChatMode}
          />
      </div>
      <MobileBottomNav />
    </div>
  );
}
