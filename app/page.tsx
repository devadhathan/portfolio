'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SideAgent } from '@/components/side-agent';
import { PortfolioSections } from '@/components/portfolio-sections';
import { TopBar } from '@/components/top-bar';
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { AboutSection } from '@/components/about-section';
import { ProjectDetailView } from '@/components/project-detail-view';
import { ProjectsListView } from '@/components/projects-list-view';
import { BottomNav } from '@/components/bottom-nav';
import { FloatingChatButton } from '@/components/floating-chat-button';
import { AgentState } from '@/lib/agent';

export default function Home() {
  const [agentState, setAgentState] = useState<AgentState | null>(null);
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
  const [chatMode, setChatMode] = useState<'ask' | 'agent'>('agent');
  const [showProjectsList, setShowProjectsList] = useState(false);
  const resetAgentRef = useRef<(() => void) | null>(null);
  const [showInitialLoading, setShowInitialLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const areBothPanelsExpanded = !isChatCollapsed && !isSidebarCollapsed;
  const isAnyPanelExpanded = !isChatCollapsed || !isSidebarCollapsed;
  const contentGutterClass = areBothPanelsExpanded
    ? 'mx-0 px-4 sm:mx-3 sm:px-4 md:mx-3 md:px-4 lg:mx-5 lg:px-6 xl:mx-8 xl:px-10'
    : isAnyPanelExpanded
      ? 'mx-0 px-4 sm:mx-3 sm:px-4 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-8 xl:px-10'
      : 'mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]';

  // Dynamic loading messages that change over time
  const loadingMessages = [
    'Arranging your portfolio sections',
    'Curating the best projects',
    'Organizing content for you',
    'Almost there...'
  ];

  const handleStateChange = (state: AgentState) => {
    setAgentState(state);
  };

  const handleAgentWorking = (working: boolean) => {
    setIsAgentWorking(working);
    if (working) {
      setLoadingStartTime(Date.now());
      setLoadingMessageIndex(0);
    } else {
      setLoadingStartTime(null);
      setLoadingMessageIndex(0);
    }
    // Don't reset explanation state immediately when agent stops
    // Let explanation stay visible until new command starts
  };

  // Update loading message based on duration
  useEffect(() => {
    if (!isAgentWorking || loadingStartTime === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingStartTime;
      // Change message every 2 seconds
      const newIndex = Math.min(
        Math.floor(elapsed / 2000),
        loadingMessages.length - 1
      );
      if (newIndex !== loadingMessageIndex) {
        setLoadingMessageIndex(newIndex);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAgentWorking, loadingStartTime, loadingMessageIndex, loadingMessages.length]);

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
      // Clear any pending animation
      if ((window as any).explanationTimeout) {
        clearTimeout((window as any).explanationTimeout);
        delete (window as any).explanationTimeout;
      }
      return;
    }
    
    // Allow processing explanation even if agent just finished working
    // The explanation should always update when new text comes in
    
    setExplanation(text);
    
    // Show text immediately as it streams, with subtle word-by-word reveal
    const targetWords = text.split(' ');
    const currentWords = displayedExplanation.split(' ').filter(w => w.length > 0);
    
    if (targetWords.length > currentWords.length) {
      // Clear any existing timeout
      if ((window as any).explanationTimeout) {
        clearTimeout((window as any).explanationTimeout);
      }
      
      // Animate new words with very short delay for smooth streaming
      let wordIndex = currentWords.length;
      const animateNextWord = () => {
        if (wordIndex < targetWords.length) {
          const newText = targetWords.slice(0, wordIndex + 1).join(' ');
          setDisplayedExplanation(newText);
          wordIndex++;
          
          if (wordIndex < targetWords.length) {
            // Very short delay (30ms) for smooth streaming effect
            (window as any).explanationTimeout = setTimeout(animateNextWord, 30);
          } else {
            // All words displayed
            setIsExplanationComplete(true);
            delete (window as any).explanationTimeout;
          }
        } else {
          setIsExplanationComplete(true);
          delete (window as any).explanationTimeout;
        }
      };
      
      // Start animation immediately
      animateNextWord();
    } else if (text.trim().length > 0) {
      // Text is complete - ensure it's displayed and marked complete
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
    // Clear explanation state
    setExplanation(null);
    setDisplayedExplanation('');
    setIsExplanationComplete(false);
    setShouldShowCards(false);
    setSelectedProject(null);
  };

  // Show loading screen every time page loads
  useEffect(() => {
    setMounted(true);
    const hasSeenLoading = localStorage.getItem('portfolio-has-loaded');
    const isFirstLoad = !hasSeenLoading;
    
    setShowInitialLoading(true);
    
    // First load: 3 seconds, subsequent visits: 0.8 seconds
    const duration = isFirstLoad ? 3000 : 800;
    
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
      if (isFirstLoad) {
        localStorage.setItem('portfolio-has-loaded', 'true');
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-card relative overflow-x-hidden overflow-y-auto">
      {/* Initial Loading Screen - Only shows first time */}
      {mounted && showInitialLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <video
              autoPlay
              muted
              loop={false}
              playsInline
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
            >
              <source src="/videos/Subtle_Typing_Video_Generation.mp4" type="video/mp4" />
            </video>
            <p className="text-base md:text-lg text-white font-normal font-mono animate-pulse">
              Loading Dev&apos;s Portfolio
            </p>
          </div>
        </div>
      )}
      {!showInitialLoading && (
        <>
          <TopBar onProjectSelect={setSelectedProject} onHomeClick={handleHomeClick} />
          
          <div className="flex pt-14 relative z-10">
        {/* Desktop Sidebar - Fixed */}
        <div className={`hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-80'}`}>
          <DesktopSidebar 
            onProjectSelect={setSelectedProject} 
            isCollapsed={isSidebarCollapsed}
            onCollapseChange={setIsSidebarCollapsed}
          />
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 relative z-10 transition-[margin-left,margin-right,padding-right] duration-500 ease-in-out ${isSidebarCollapsed && isChatCollapsed ? 'lg:ml-0 lg:mr-0' : isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'} ${isChatCollapsed ? 'lg:pr-32' : 'lg:pr-[440px]'} pb-24 md:pb-28 lg:pb-8 overflow-x-hidden`}>
          <div className={`transition-[max-width,margin-left,margin-right] duration-500 ease-in-out ${isSidebarCollapsed && isChatCollapsed ? 'max-w-[1500px] mx-auto' : isChatCollapsed ? 'max-w-7xl mx-auto' : 'max-w-none mx-0'}`}>
            {isAgentWorking ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-lg text-foreground font-semibold mb-2">Agent is working...</p>
              <p className="text-sm text-muted-foreground/70">{loadingMessages[loadingMessageIndex]}</p>
            </div>
          ) : selectedProject ? (
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
          ) : agentState ? (
            <>
              {/* Always show explanation if it exists, even while streaming */}
              {(explanation || displayedExplanation) && (
                <div className="mb-6 p-5 md:p-6 rounded-lg bg-card/60 backdrop-blur-md border-2 border-border/70">
                  {(displayedExplanation || explanation || '').trim().split(' ').length > 3 && (
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Overview</h2>
                  )}
                  <div className="text-base text-muted-foreground leading-relaxed space-y-3">
                    {(() => {
                      const text = displayedExplanation || explanation || '';
                      // Split text into paragraphs by double newlines first
                      let paragraphs = text
                        .split(/\n\n+/)
                        .filter(p => p.trim().length > 0)
                        .map(p => p.trim());
                      
                      // If no double newlines and text is long, split by sentences
                      if (paragraphs.length === 1 && text.length > 150) {
                        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                        // Group 2-3 sentences per paragraph
                        const grouped: string[] = [];
                        for (let i = 0; i < sentences.length; i += 2) {
                          const group = sentences.slice(i, Math.min(i + 2, sentences.length)).join(' ').trim();
                          if (group) grouped.push(group);
                        }
                        paragraphs = grouped.length > 0 ? grouped : paragraphs;
                      }
                      
                      return paragraphs.length > 0 ? paragraphs : [text];
                    })().map((paragraph, index, array) => (
                      <div key={index} className="mb-0">
                        <ReactMarkdown components={{
                          p: ({ node, ...props }) => <p className="mb-0" {...props} />,
                        }}>
                          {paragraph}
                        </ReactMarkdown>
                        {index === array.length - 1 && !isExplanationComplete && explanation && displayedExplanation.length < explanation.length && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/50 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Show cards based on state:
                  1. Default state: show if no explanation and not generating (isAgentWorking false)
                  2. Generated cards: show only after explanation is complete (shouldShowCards true) */}
              {agentState && (
                // Show default cards only when not working and no explanation
                ((!explanation && !displayedExplanation && !isAgentWorking) ||
                // Show generated cards only after explanation is complete
                (shouldShowCards && isExplanationComplete)) && (
                  <div className={`transition-all duration-600 animate-fade-in-blur ${contentGutterClass}`}>
                      <PortfolioSections 
                        agentState={agentState} 
                        hideHeaderText={isAgentWorking || shouldShowCards}
                        onProjectSelect={setSelectedProject}
                        onShowProjectsList={() => setShowProjectsList(true)}
                      />
                      {/* Only show AboutSection (awards/certifications) for default state, not generated cards */}
                      {!agentState.isCustomLayout && (
                        <div className="mt-10">
                          <AboutSection />
                        </div>
                      )}
                  </div>
                )
              )}
            </>
          ) : null}
          </div>
        </div>
      </div>
          
          <SideAgent 
            onStateChange={handleStateChange} 
            onAgentWorking={handleAgentWorking} 
            onCollapseChange={handleCollapseChange} 
            onExplanation={handleExplanation} 
            onExplanationComplete={handleExplanationComplete} 
            resetRef={resetAgentRef}
            externalCollapsed={isChatCollapsed}
            onExpandRequest={() => setIsChatCollapsed(false)}
            initialMode={chatMode}
          />
          <BottomNav />
          <FloatingChatButton 
            onClick={() => {
              setIsChatCollapsed(false);
            }} 
            isCollapsed={isChatCollapsed}
            mode={chatMode}
            onModeChange={setChatMode}
          />
        </>
      )}
    </div>
  );
}
