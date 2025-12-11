'use client';

import { useState, useEffect } from 'react';
import { SideAgent } from '@/components/side-agent';
import { PortfolioSections } from '@/components/portfolio-sections';
import { TopBar } from '@/components/top-bar';
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { AboutSection } from '@/components/about-section';
import { ProjectDetailView } from '@/components/project-detail-view';
import { AgentState } from '@/lib/agent';

export default function Home() {
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [displayedExplanation, setDisplayedExplanation] = useState<string>('');
  const [isExplanationComplete, setIsExplanationComplete] = useState(false);
  const [shouldShowCards, setShouldShowCards] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

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
      // Delay showing cards to match when cards are actually set in state (800ms after explanation completes)
      setTimeout(() => {
        setShouldShowCards(true);
      }, 900); // Slightly after cards are set in state
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden [html.glass_&]:bg-transparent [html.glass_&]:bg-none">
      <TopBar onProjectSelect={setSelectedProject} />
      <div className="absolute inset-0 bg-gradient-grid pointer-events-none opacity-30 z-0 [html.glass_&]:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none z-0 [html.glass_&]:hidden"></div>
      
      <div className="flex pt-14 relative z-10">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:block fixed left-0 top-14 w-80 h-[calc(100vh-3.5rem)] z-20">
          <DesktopSidebar onProjectSelect={setSelectedProject} />
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 container mx-auto p-4 md:p-6 lg:p-8 relative z-10 lg:ml-80 transition-all duration-300 ${isChatCollapsed ? 'lg:pr-4' : 'lg:pr-[440px]'} pb-20 md:pb-24 lg:pb-8`}>
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
                onBack={() => setSelectedProject(null)} 
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
                      <p key={index} className="mb-0">
                        {paragraph}
                        {index === array.length - 1 && !isExplanationComplete && explanation && displayedExplanation.length < explanation.length && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/50 animate-pulse" />
                        )}
                      </p>
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
                  <div className={`transition-all duration-600 animate-fade-in-blur`}>
                    <PortfolioSections agentState={agentState} />
                    {/* Only show AboutSection (awards/certifications) for default state, not generated cards */}
                    {!agentState.isCustomLayout && <AboutSection />}
                  </div>
                )
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading portfolio agent...</p>
            </div>
          )}
        </div>
      </div>
      
      <SideAgent onStateChange={handleStateChange} onAgentWorking={handleAgentWorking} onCollapseChange={handleCollapseChange} onExplanation={handleExplanation} onExplanationComplete={handleExplanationComplete} />
    </div>
  );
}

