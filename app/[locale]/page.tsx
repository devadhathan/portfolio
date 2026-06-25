'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TopBar, MobileBottomNav } from '@/components/top-bar';
import { AboutSection } from '@/components/about-section';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgentState, PortfolioAgent } from '@/lib/agent';
import type { GenUIItem } from '@/components/side-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [genUIItems, setGenUIItems] = useState<GenUIItem[] | null>(null);
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
            {isAgentWorking ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-lg text-foreground font-semibold mb-2">Agent is working...</p>
              <p className="text-sm text-muted-foreground/70">{LOADING_MESSAGES[loadingMessageIndex]}</p>
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
          ) : genUIItems ? (
            /* ── Agent Gen UI canvas ── */
            <div className="animate-fade-in-blur pb-32">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                {genUIItems.map((item, i) => {
                  if (item.type === 'stat') return (
                    <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors">
                      <CardContent className="pt-6">
                        <p className="text-4xl font-bold text-foreground tabular-nums">{item.value}</p>
                        <p className="text-sm font-medium text-foreground/80 mt-1">{item.label}</p>
                        {item.context && <p className="text-xs text-muted-foreground mt-0.5">{item.context}</p>}
                      </CardContent>
                    </Card>
                  );
                  if (item.type === 'project') return (
                    <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors group cursor-pointer" onClick={() => item.link && (window.location.href = item.link)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                          {item.title}
                          {item.link && <span className="text-muted-foreground text-xs group-hover:text-primary transition-colors">View →</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {item.tags.map((t, j) => <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                  if (item.type === 'timeline') return (
                    <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">{item.role}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{item.period}</p>
                        </div>
                        <p className="text-xs text-primary mb-2">{item.company}</p>
                        {item.highlights && (
                          <ul className="space-y-1">
                            {item.highlights.map((h, j) => (
                              <li key={j} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-primary mt-0.5">·</span>{h}</li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                  if (item.type === 'skill_grid') return (
                    <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors sm:col-span-2">
                      <CardContent className="pt-6 space-y-4">
                        {item.categories.map((cat, j) => (
                          <div key={j}>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{cat.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.skills.map((s, k) => <Badge key={k} variant="outline" className="text-[11px] font-normal">{s}</Badge>)}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                  if (item.type === 'quote') return (
                    <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors border-l-2 border-l-primary sm:col-span-2 lg:col-span-3">
                      <CardContent className="pt-6">
                        <p className="text-base text-foreground/90 italic leading-relaxed">{`\u201C${item.text}\u201D`}</p>
                      </CardContent>
                    </Card>
                  );
                  if (item.type === 'chart') {
                    const maxVal = Math.max(...item.bars.map(b => b.value));
                    return (
                      <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors sm:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {item.bars.map((bar, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-20 truncate flex-shrink-0">{bar.label}</span>
                              <div className="flex-1 h-6 bg-secondary/50 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(bar.value / maxVal) * 100}%`, background: bar.color || 'hsl(var(--primary))' }} />
                              </div>
                              <span className="text-xs font-semibold text-foreground w-14 text-right flex-shrink-0">{bar.displayValue}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  }
                  if (item.type === 'image') {
                    const imgCard = (
                      <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors overflow-hidden group cursor-pointer">
                        <div className="aspect-video overflow-hidden">
                          <img src={item.src} alt={item.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </div>
                        {item.caption && (
                          <CardContent className="pt-3 pb-4">
                            <p className="text-xs text-muted-foreground">{item.caption}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                    return item.link ? <a key={i} href={item.link} className="block no-underline">{imgCard}</a> : imgCard;
                  }
                  if (item.type === 'info') {
                    const infoCard = (
                      <Card key={i} className="bg-card/80 border-border/60 backdrop-blur-sm hover:border-border transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            {item.icon && <span className="text-2xl mt-0.5">{item.icon}</span>}
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              {item.subtitle && <p className="text-xs text-primary mt-0.5">{item.subtitle}</p>}
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{item.body}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    return item.link ? <a key={i} href={item.link} className="block no-underline">{infoCard}</a> : infoCard;
                  }
                  return null;
                })}
              </div>
            </div>
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
            onGenUI={(items) => setGenUIItems(items)}
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
