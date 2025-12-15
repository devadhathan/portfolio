'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentState, SectionPriority, SectionType } from '@/lib/agent';
import { User, Briefcase, Mail, Linkedin, FileText, Sparkles, Heart, Lightbulb, Target, Rocket, Code2, Calendar, Award, Globe, Github, Zap, FolderKanban, Image as ImageIcon, ChevronLeft, ChevronRight, ExternalLink, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { PreferenceGraph } from './preference-graph';
import { resumeData } from '@/lib/resume-data';
import { useTheme } from '@/contexts/theme-context';

interface PortfolioSectionsProps {
  agentState: AgentState;
  hideHeaderText?: boolean;
  onProjectSelect?: (projectId: string) => void;
  onShowProjectsList?: () => void;
}

export function PortfolioSections({ agentState, hideHeaderText = false, onProjectSelect, onShowProjectsList }: PortfolioSectionsProps) {
  const { theme } = useTheme();
  // Track image errors for photo sections
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());
  // Track carousel state for photo sections
  const [carouselIndex, setCarouselIndex] = React.useState<{ [key: string]: number }>({});
  // Track dialog state for section details
  const [selectedSection, setSelectedSection] = useState<any>(null);
  // Track mouse position for cursor-following spotlight effect
  const [mousePositions, setMousePositions] = React.useState<{ [key: string]: { x: number; y: number } | null }>({});
  // Track video elements for hover play/pause
  const videoRefs = React.useRef<{ [key: string]: HTMLVideoElement | null }>({});
  // Track if this is the first load for animations
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  
  // Reset first load flag after animations complete
  React.useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        setIsFirstLoad(false);
      }, 4000); // After all animations complete (extended by +1s)
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  // Mouse tracking handlers - must be defined before early returns
  // Track mouse position with larger detection radius for nearby cards
  const handleMouseMove = React.useCallback((sectionId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update current card
    if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
      setMousePositions(prev => ({ ...prev, [sectionId]: { x, y } }));
    }
    
    // Check nearby cards (within 250px radius) - using requestAnimationFrame for performance
    requestAnimationFrame(() => {
      const allCards = document.querySelectorAll('[data-card-id]');
      allCards.forEach((card) => {
        if (card instanceof HTMLElement) {
          const cardRect = card.getBoundingClientRect();
          const cardId = card.getAttribute('data-card-id');
          if (!cardId || cardId === sectionId) return; // Skip current card (already updated)
          
          // Calculate distance from mouse to card center
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          const distanceX = e.clientX - cardCenterX;
          const distanceY = e.clientY - cardCenterY;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          // If cursor is within 250px of card, activate border effect
          if (distance < 250) {
            const relativeX = e.clientX - cardRect.left;
            const relativeY = e.clientY - cardRect.top;
            if (typeof relativeX === 'number' && typeof relativeY === 'number' && !isNaN(relativeX) && !isNaN(relativeY)) {
              setMousePositions(prev => ({ ...prev, [cardId]: { x: relativeX, y: relativeY } }));
            }
          } else {
            // Clear if too far away
            setMousePositions(prev => {
              const current = prev[cardId];
              if (current) {
                return { ...prev, [cardId]: null };
              }
              return prev;
            });
          }
        }
      });
    });
  }, []);

  const handleMouseLeave = React.useCallback((sectionId: string) => {
    // Clear after a short delay to allow smooth transitions
    setTimeout(() => {
      setMousePositions(prev => ({ ...prev, [sectionId]: null }));
    }, 150);
  }, []);

  // Safety check for agentState - after all hooks
  if (!agentState || !agentState.sections) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No portfolio sections available</p>
      </div>
    );
  }

  // Sort by order first, then filter visible sections
  const sortedSections = [...agentState.sections].sort((a, b) => a.order - b.order);
  const visibleSections = sortedSections.filter(s => s.visible);
  
  // Debug: log what sections are being rendered
  console.log('PortfolioSections render:', {
    totalSections: agentState.sections.length,
    visibleSections: visibleSections.length,
    sections: visibleSections.map(s => ({ id: s.id, title: s.title, type: s.type }))
  });

  const getBentoSize = (priority: SectionPriority, sectionId: string, sectionType?: SectionType, order: number = 0) => {
    // Create varied card sizes based on type, priority, and position
    // This creates a more dynamic bento grid layout
    // On mobile, all cards should be single column (col-span-1)
    const sizeMap: { [key: string]: string } = {
      'hero': 'col-span-1 sm:col-span-1 lg:col-span-1',
      'preferences': 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
      'photos': 'col-span-1 sm:col-span-1 lg:col-span-2 row-span-2',
      'video': 'col-span-1 sm:col-span-2 lg:col-span-1 row-span-1',
      'connect': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'contact': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'philosophy': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'experience': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2',
    };

    // Use predefined size if available
    if (sizeMap[sectionId]) {
      return sizeMap[sectionId];
    }

    // Otherwise, create varied sizes based on priority and order
    if (priority === 'high') {
      // High priority cards can be larger
      if (order % 4 === 0) return 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1';
      if (order % 4 === 1) return 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2';
      return 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1';
    } else if (priority === 'medium') {
      // Medium priority - mix of sizes
      if (order % 3 === 0) return 'col-span-1 sm:col-span-2 lg:col-span-1 row-span-1';
      return 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1';
    } else {
      // Low priority - standard size
      return 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1';
    }
  };

  const getPriorityStyles = (priority: SectionPriority, sectionType?: SectionType) => {
    // Gradient backgrounds that change to borders on hover
    const baseStyles = 'rounded-2xl border-2 border-border/70 cursor-pointer transition-all duration-500 ease-out relative overflow-hidden group';
    
    // Card background color - theme responsive
    // Dark mode: #121212 (dark grey), Light mode: hsl(0, 0%, 96%) (light grey)
    const bgStyles = 'bg-card/60 backdrop-blur-md';

    // Border effects - match weather and clock cards: border-2 border-border/70
    const borderStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: '',
      medium: '',
      low: '',
    };

    // No transform effects on hover
    const transformStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: '',
      medium: '',
      low: '',
    };

    // Shadow effects - match weather and clock cards
    const shadowStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: 'dark:shadow-md',
      medium: 'dark:shadow-md',
      low: 'dark:shadow-md',
    };

    // Combine all styles - handle 'hidden' priority by defaulting to 'low'
    const priorityKey: Exclude<SectionPriority, 'hidden'> = (priority === 'hidden' ? 'low' : priority) || 'low';
    return `${baseStyles} ${bgStyles} ${borderStyles[priorityKey]} ${transformStyles[priorityKey]} ${shadowStyles[priorityKey]}`;
  };

  const handleCardClick = (sectionId: string) => {
    // Show details dialog when card is clicked
    const section = visibleSections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
    }
  };

  const nextImage = (sectionId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex(prev => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (sectionId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex(prev => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const renderSection = (section: typeof visibleSections[0], index: number) => {
    const baseStyles = getPriorityStyles(section.priority, section.type);
    const bentoSize = getBentoSize(section.priority, section.id, section.type, section.order);
    const mousePos = mousePositions[section.id];
    const isHovered = mousePos !== null && mousePos !== undefined && typeof mousePos.x === 'number' && typeof mousePos.y === 'number';
    
    // Calculate animation delay for cards
    // Hero card appears at 0.6s, other cards follow with staggered delays
    const heroIndex = visibleSections.findIndex(s => s.id === 'hero');
    const cardDelay = section.id === 'hero' 
      ? 0.6 
      : 0.8 + ((heroIndex >= 0 && index > heroIndex ? index - 1 : index) * 0.1);
    
    // Border reveal that follows cursor - only visible in the spotlight area where cursor is
    // Increased radius to 200px for larger effect area
    const borderReveal = isHovered && mousePos ? (
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl z-[1]"
        style={{
          border: '1px solid hsl(var(--primary) / 0.5)',
          WebkitMaskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 75%)`,
          maskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 75%)`,
          transition: 'none',
        }}
      />
    ) : null;
    
    switch (section.id) {
      case 'hero':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} group flex flex-col relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: '0.6s' } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            
            <CardHeader className="flex flex-col justify-center flex-shrink-0 relative z-10 pb-2 px-4 pt-4">
              <div className="mb-3">
                <CardTitle 
                  className={`text-2xl md:text-3xl font-semibold mb-0.5 ${isFirstLoad ? 'animate-line-reveal' : ''}`}
                  style={isFirstLoad ? { animationDelay: '0s' } : undefined}
                >
                  Dev
                </CardTitle>
                <CardDescription 
                  className={`text-[12px] md:text-[13px] text-foreground/80 ${isFirstLoad ? 'animate-line-reveal' : ''}`}
                  style={isFirstLoad ? { animationDelay: '0.3s' } : undefined}
                >
                  Product Designer
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3 relative z-10">
              <p 
                className={`text-[13px] text-muted-foreground leading-relaxed ${isFirstLoad ? 'animate-line-reveal' : ''}`}
                style={isFirstLoad ? { animationDelay: '0.4s' } : undefined}
              >
                Building meaningful digital experiences through thoughtful design and user-centric solutions.
              </p>
              
              {/* SVG Illustration */}
              <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center p-4">
                <img
                  src="/svg/white.svg"
                  alt="Dev"
                  className={`w-full h-auto max-h-[300px] object-contain svg-hero-${theme}`}
                />
              </div>
              
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>Currently in Edinburgh</span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">Available for work</span>
              </div>
            </CardContent>
          </Card>
        );

      case 'preferences':
        return (
          <Card 
            key={section.id} 
            id="playground"
            data-section="playground"
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <div className="relative z-10 h-full">
              <PreferenceGraph />
            </div>
          </Card>
        );

      case 'philosophy':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full group relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px] mb-2">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                Design Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 relative z-10">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:animate-pulse transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-0.5">User-Centered Design</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    I design with care, always keeping the user at the center of every decision.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:brightness-125 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-0.5">Human Technology</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Technology should feel natural and intuitive, built for humans.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-0.5">Iterative Improvement</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Great design is born from continuous refinement and learning from feedback.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Rocket className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:translate-y-[-2px] transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-0.5">Accessibility First</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Designing inclusively ensures everyone can access and enjoy digital experiences.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:rotate-180 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-0.5">Data-Driven Insights</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Balancing creativity with metrics to create solutions that resonate and perform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'experience':
        // For default experience section, show full content
        if (section.id === 'experience' && !section.description && !section.content) {
          return (
            <Card 
              key={section.id} 
              id="work"
              data-section="work"
              data-card-id={section.id}
              className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
              style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
              onClick={() => handleCardClick(section.id)}
              onMouseMove={(e) => handleMouseMove(section.id, e)}
              onMouseLeave={() => handleMouseLeave(section.id)}
            >
              {borderReveal}
              <CardHeader className="pb-2 flex-shrink-0 relative z-10">
                <CardTitle className="flex items-center gap-2 text-[16px]">
                  <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-300">
                    <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  Experience
                </CardTitle>
                <CardDescription className="text-[14px]">Current Role</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 relative z-10">
                <ScrollArea className="w-full max-h-[400px]">
                  <div className="space-y-4 pr-2">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <div className="mb-3">
                        <h4 className="font-medium text-[14px] mb-1">Product Designer</h4>
                        <p className="text-[14px] text-primary mb-2">Nesoi.ai</p>
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>July 2025 - November 2025</span>
                        </div>
                      </div>
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                        Designing innovative solutions and user-centered experiences for AI-powered products.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Prototyping', 'Design Systems', 'UX Research'].map((tag) => (
                          <span key={tag} className={`px-2 py-0.5 rounded text-[14px] ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <div className="mb-3">
                        <h4 className="font-medium text-[14px] mb-1">Product Designer</h4>
                        <p className="text-[14px] text-primary mb-2">Ditto Insurance</p>
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>November 2021 - December 2022</span>
                        </div>
                      </div>
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                        Led redesign of booking portal achieving 17% conversion increase. Created Falcon Design System and redesigned internal CRM improving team efficiency by 20%.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Design Systems', 'UX Research', 'Prototyping'].map((tag) => (
                          <span key={tag} className={`px-2 py-0.5 rounded text-[14px] ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <div className="mb-3">
                        <h4 className="font-medium text-[14px] mb-1">UI/UX Designer</h4>
                        <p className="text-[14px] text-primary mb-2">Finshots</p>
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>August 2019 - October 2021</span>
                        </div>
                      </div>
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                        Designed award-winning mobile app, contributed to Google Play &quot;Best App of 2020&quot; award, helped achieve 100k+ downloads and 500k+ subscribers.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Mobile Design', 'UX Research', 'Prototyping'].map((tag) => (
                          <span key={tag} className={`px-2 py-0.5 rounded text-[14px] ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        }
        
        // For generated experience sections, show dynamic content
        const expContent = section.content || section.description || '';
        const expTitle = section.title || 'Experience';
        
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-300">
                  <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                {expTitle}
              </CardTitle>
              {section.description && section.description.includes('|') && (
                <CardDescription className="text-[14px]">{section.description.split('|')[0].trim()}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Experience section ready</p>
                  <p className="text-[14px]">Add your experience details here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expContent && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {expContent}
                      </p>
                    </div>
                  )}
                  {section.description && !expContent && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  )}
                  {!expContent && !section.description && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No experience details available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card 
            key={section.id} 
            id="work"
            data-section="work"
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => {
              // Navigate to projects list instead of showing dialog
              if (onShowProjectsList) {
                onShowProjectsList();
              } else {
                handleCardClick(section.id);
              }
            }}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Code2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                {section.title || 'Projects'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Projects section ready</p>
                  <p className="text-[14px]">Add your project links and details here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <div className="mb-3">
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                        {section.description}
                      </p>
                    </div>
                  )}
                  {section.content && (
                    <div className="mb-3">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.links && section.links.length > 0 && (
                    <div className="space-y-2">
                      {section.links.map((link, index) => {
                        // Extract project ID from label - try to match with actual project titles
                        const getProjectId = (label: string): string => {
                          const normalizedLabel = label.toLowerCase().trim();
                          
                          // Try to find matching project from resume data
                          const project = resumeData.projects.find(p => {
                            const normalizedTitle = p.title.toLowerCase().trim();
                            return normalizedLabel === normalizedTitle || 
                                   normalizedLabel.includes(normalizedTitle) ||
                                   normalizedTitle.includes(normalizedLabel);
                          });
                          
                          if (project) {
                            // Return slugified version of the project title
                            return project.title.toLowerCase().replace(/\s+/g, '-');
                          }
                          
                          // Fallback: convert label to slug format
                          return normalizedLabel.replace(/\s+/g, '-');
                        };
                        
                        const projectId = getProjectId(link.label);
                        
                        return (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onProjectSelect) {
                                onProjectSelect(projectId);
                              } else {
                                // Fallback to opening in new tab if no handler
                                window.open(link.url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 group/link border border-border/20 text-left"
                          >
                            <Rocket className="h-4 w-4 text-primary group-hover/link:scale-125 group-hover/link:-translate-y-1 transition-all duration-300 flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                              <span className="text-[14px] font-medium">{link.label}</span>
                              <span className="text-[14px] text-muted-foreground text-xs">{link.url}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all duration-300" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {!section.description && !section.content && (!section.links || section.links.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No project details available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'skills':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-4 w-4 group-hover:scale-125 group-hover:brightness-125 transition-all duration-300" />
                </div>
                {section.title || 'Skills'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Skills section ready</p>
                  <p className="text-[14px]">Add your skills and technologies here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                      {section.description}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {!section.description && !section.content && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No skills information available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'education':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Award className="h-4 w-4 group-hover:scale-110 transition-all duration-300" />
                </div>
                {section.title || 'Education'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Education section ready</p>
                  <p className="text-[14px]">Add your education details here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <div className="mb-2">
                      <p className="text-[14px] font-medium text-foreground mb-1">
                        {section.description.split('|')[0] || section.description}
                      </p>
                      {section.description.includes('|') && (
                        <p className="text-[14px] text-muted-foreground">
                          {section.description.split('|').slice(1).join('|').trim()}
                        </p>
                      )}
                    </div>
                  )}
                  {section.content && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {!section.description && !section.content && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No education information available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'photos':
        // Default photos for camera roll - use available photos from public/photos
        const defaultPhotos = [
          '/photos/O6bInc2LhAgXBkQ6yLobk41OLss.jpg',
          '/photos/ZZXFdA0RZyD5h20wZdhoCxLhy0.jpg',
          '/photos/Le5RRVetScFh9EG3aEJYsrCsM.jpg.avif'
        ];
        // Always use default photos if section doesn't have images
        const photos = (section.images && section.images.length > 0) 
          ? section.images 
          : (section.image ? [section.image] : defaultPhotos);
        const currentIndex = carouselIndex[section.id] || 0;
        const hasImageError = imageErrors.has(section.id);
        const shouldShowPlaceholder = photos.length === 0 || hasImageError;
        
        // Debug logging
        console.log('Photo section:', {
          id: section.id,
          title: section.title,
          photosCount: photos.length,
          photos: photos,
          hasError: hasImageError,
          visible: section.visible
        });
        
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full overflow-hidden group ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            {!shouldShowPlaceholder && photos.length > 0 ? (
              <div className="relative w-full h-full min-h-[300px] group z-10">
                {/* Carousel Container */}
                <div className="relative w-full h-full overflow-hidden">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        idx === currentIndex
                          ? 'opacity-100 translate-x-0'
                          : idx < currentIndex
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`${section.title || 'Photo'} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={photo.endsWith('.avif')}
                        onError={(e) => {
                          console.error('Image load error:', photo, e);
                          setImageErrors(prev => new Set(prev).add(section.id));
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => prevImage(section.id, photos.length, e)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => nextImage(section.id, photos.length, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndex(prev => ({ ...prev, [section.id]: idx }));
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Title & Description */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                  <CardTitle className="text-white text-[16px] font-semibold mb-1">
                    {section.title || 'Photo'}
                  </CardTitle>
                  {section.description && (
                    <CardDescription className="text-white/80 text-[14px]">
                      {section.description}
                    </CardDescription>
                  )}
                  {photos.length > 1 && (
                    <p className="text-white/60 text-xs mt-1">
                      {currentIndex + 1} / {photos.length}
                    </p>
                  )}
                </div>

                {/* Image Icon Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                  <div className="p-2 bg-black/50 rounded-lg backdrop-blur-sm">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10 border-2 border-dashed border-border/50 group hover:border-border transition-colors">
                <CardHeader className="pb-2 flex-shrink-0 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/20 rounded-full animate-pulse">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-[16px] mb-1">
                    {section.title || 'Photo'}
                  </CardTitle>
                  {section.description && (
                    <CardDescription className="text-[14px] mb-3">
                      {section.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-center px-4">
                  <p className="text-[12px] text-muted-foreground mb-2">
                    {photos.length === 0 ? 'No images set' : 'Images not found'}
                  </p>
                </CardContent>
              </div>
            )}
          </Card>
        );

      case 'video':
        const videoSrc = section.content || '/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4';
        const videoLink = section.links?.[0]?.url || 'https://medium.com/@devadhathanmd18/why-ai-needs-a-face-building-dew-my-duolingo-inspired-ai-character-2d4e56f94772';
        const videoTitle = section.title || 'Video';
        
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full overflow-hidden group relative ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => {
              handleMouseLeave(section.id);
              // Pause video on mouse leave
              const video = videoRefs.current[section.id];
              if (video) {
                video.pause();
              }
            }}
            onMouseEnter={() => {
              // Play video on mouse enter
              const video = videoRefs.current[section.id];
              if (video) {
                video.play().catch(err => console.error('Video play error:', err));
              }
            }}
          >
            {borderReveal}
            <div className="relative w-full h-full flex items-center justify-center p-6 z-10">
              {/* Phone Frame */}
              <div className="relative w-full max-w-[280px] aspect-[9/19.5] bg-black rounded-[2.5rem] p-2 shadow-2xl">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                {/* Screen */}
                <div className="relative w-full h-full bg-black rounded-[2rem] overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[section.id] = el;
                    }}
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Title and Link */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-white text-[14px] font-semibold mb-2">
                      {videoTitle}
                    </h3>
                    <a
                      href={videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-[12px] font-medium transition-all duration-200 group/link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Read on Medium</span>
                      <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'custom':
      default:
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto group relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
                {section.title || 'Custom Section'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">{section.title} section ready</p>
                  <p className="text-[14px]">Add your content here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  {section.links && section.links.length > 0 && (
                    <div className="space-y-2">
                      {section.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group border border-border/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-4 w-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium">{link.label}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'connect':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full group relative overflow-hidden ${isFirstLoad ? 'animate-card-reveal' : ''}`}
            style={isFirstLoad ? { animationDelay: `${cardDelay}s` } : undefined}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="flex items-center gap-2 text-[16px] mb-2">
                <div className="p-1.5 bg-primary/20 rounded-full group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                Connect
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10 flex-1">
              <div className="flex flex-col gap-3">
                <a
                  href={`mailto:${resumeData.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group/item border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">Email</span>
                    <span className="text-[12px] text-muted-foreground">{resumeData.email}</span>
                  </div>
                </a>
                <a
                  href={`https://linkedin.com/${resumeData.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group/item border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">LinkedIn</span>
                    <span className="text-[12px] text-muted-foreground">Connect with me</span>
                  </div>
                </a>
                <a
                  href={`https://${resumeData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group/item border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">Website</span>
                    <span className="text-[12px] text-muted-foreground">{resumeData.website}</span>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      {!hideHeaderText && (
        <div className="mb-8 text-left pt-8 md:pt-12">
          <p className="text-sm md:text-base text-muted-foreground mb-4 font-regular animate-fade-in-blur">
            Dev&apos;s digital home
          </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-12 md:mb-16 text-foreground leading-loose animate-fade-in-blur" style={{ animationDelay: '0.1s' }}>
              Designer bringing interaction, <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-medium block mt-0 md:mt-2 text-foreground leading-loose animate-fade-in-blur" style={{ animationDelay: '0.1s' }}>technology, and people together.</span>
            </h1>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 lg:gap-8 auto-rows-[minmax(200px,auto)] pb-4 md:pb-0 w-full">
        {visibleSections.map((section, index) => renderSection(section, index))}
      </div>
      
      {/* Detail Dialog - Exclude projects section */}
      <Dialog open={!!selectedSection && selectedSection.id !== 'projects'} onOpenChange={(open) => !open && setSelectedSection(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSection && selectedSection.id !== 'projects' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {selectedSection.id === 'hero' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'preferences' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'about' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'philosophy' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'experience' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'contact' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.title || selectedSection.id}
                </DialogTitle>
                {selectedSection.description && (
                  <DialogDescription className="text-sm mt-2">
                    {selectedSection.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Hero Section Details */}
                {selectedSection.id === 'hero' && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2 text-base">About</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Building meaningful digital experiences through thoughtful design and user-centric solutions.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Currently in Edinburgh</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>Available for opportunities</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Preferences Section Details */}
                {selectedSection.id === 'preferences' && (
                  <>
                    <div>
                      <h4 className="font-medium mb-3 text-base">Design Preferences</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Prototyping</span>
                            <span className="text-sm text-muted-foreground">90%</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Visual Design</span>
                            <span className="text-sm text-muted-foreground">80%</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Interaction Design</span>
                            <span className="text-sm text-muted-foreground">75%</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">User Research</span>
                            <span className="text-sm text-muted-foreground">40%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        I prefer prototyping and bringing ideas to life quickly, with less emphasis on extensive user research.
                      </p>
                    </div>
                  </>
                )}

                {/* About Section Details */}
                {selectedSection.id === 'about' && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2 text-base">About Me</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        I design with care, always keeping the user at the center. Good design begins with understanding people and their needs.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-base">Core Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Product Design', 'UI/UX', 'Prototyping', 'Design Systems', 'User Research', 'Interaction Design'].map((skill, idx) => {
                          const colors = ['bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300', 'bg-purple-500/15 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300', 'bg-pink-500/15 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300', 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', 'bg-green-500/15 dark:bg-green-500/15 text-green-700 dark:text-green-300', 'bg-orange-500/15 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300', 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'];
                          return (
                            <span
                              key={skill}
                              className={`px-2.5 py-1.5 ${colors[idx % colors.length]} rounded-md text-sm`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2 text-base">Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Sketch', 'Principle', 'After Effects', 'Webflow'].map((tool, idx) => {
                          const colors = ['bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', 'bg-teal-500/15 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300', 'bg-violet-500/15 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300', 'bg-rose-500/15 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300', 'bg-amber-500/15 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'];
                          return (
                            <span
                              key={tool}
                              className={`px-2.5 py-1.5 ${colors[idx % colors.length]} rounded-md text-sm`}
                            >
                              {tool}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Philosophy Section Details */}
                {selectedSection.id === 'philosophy' && (
                  <>
                    <div>
                      <h4 className="font-medium mb-3 text-base">Design Philosophy</h4>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium mb-1">User-Centered Design</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                I design with care, always keeping the user at the center of every decision.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium mb-1">Empathy First</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Good design begins with understanding people and their needs deeply.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium mb-1">Human Technology</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Technology should feel natural and intuitive, built for humans.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                          <div className="flex items-start gap-3">
                            <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium mb-1">Purposeful Solutions</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Every solution is thoughtful, purposeful, and made to last.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Experience Section Details */}
                {selectedSection.id === 'experience' && (
                  <>
                    {selectedSection.content ? (
                      <div>
                        <h4 className="font-medium mb-2 text-base">Experience Details</h4>
                        <div className="text-sm text-muted-foreground leading-relaxed prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{selectedSection.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ScrollArea className="w-full max-h-[400px]">
                          <div className="space-y-4 pr-2">
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                              <div className="mb-3">
                                <h4 className="font-medium text-sm mb-1">Product Designer</h4>
                                <p className="text-sm text-primary mb-2">Nesoi.ai</p>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>July 2025 - November 2025</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Designing innovative solutions and user-centered experiences for AI-powered products.
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Prototyping', 'Design Systems', 'UX Research'].map((tag) => (
                                  <span key={tag} className={`px-2 py-0.5 rounded text-xs ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                              <div className="mb-3">
                                <h4 className="font-medium text-sm mb-1">Product Designer</h4>
                                <p className="text-sm text-primary mb-2">Ditto Insurance</p>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>November 2021 - December 2022</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Led redesign of booking portal achieving 17% conversion increase. Created Falcon Design System and redesigned internal CRM improving team efficiency by 20%.
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Design Systems', 'UX Research', 'Prototyping'].map((tag) => (
                                  <span key={tag} className={`px-2 py-0.5 rounded text-xs ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                              <div className="mb-3">
                                <h4 className="font-medium text-sm mb-1">UI/UX Designer</h4>
                                <p className="text-sm text-primary mb-2">Finshots</p>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>August 2019 - October 2021</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Designed award-winning mobile app, contributed to Google Play &quot;Best App of 2020&quot; award, helped achieve 100k+ downloads and 500k+ subscribers.
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Mobile Design', 'UX Research', 'Prototyping'].map((tag) => (
                                  <span key={tag} className={`px-2 py-0.5 rounded text-xs ${tag.includes('Design') ? 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </>
                )}

                {/* Contact Section Details */}
                {selectedSection.id === 'contact' && (
                  <>
                    <div>
                      <h4 className="font-medium mb-3 text-base">Get in Touch</h4>
                      <div className="space-y-2">
                        <a 
                          href="https://www.linkedin.com/in/devadhathan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/20"
                        >
                          <Linkedin className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">LinkedIn</span>
                            <span className="text-xs text-muted-foreground">Connect with me</span>
                          </div>
                        </a>
                        <a 
                          href="#" 
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/20"
                        >
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Resume</span>
                            <span className="text-xs text-muted-foreground">Download PDF</span>
                          </div>
                        </a>
                        <a 
                          href="https://github.com/devadhathan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/20"
                        >
                          <Github className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">GitHub</span>
                            <span className="text-xs text-muted-foreground">View my work</span>
                          </div>
                        </a>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/20">
                          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Email</span>
                            <span className="text-xs text-muted-foreground">Available for opportunities</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Generic content for other sections */}
                {!['hero', 'preferences', 'about', 'philosophy', 'experience', 'contact'].includes(selectedSection.id) && selectedSection.content && (
                  <div>
                    <h4 className="font-medium mb-2 text-base">Details</h4>
                    <div className="text-sm text-muted-foreground leading-relaxed prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{selectedSection.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Links section for all cards */}
                {selectedSection.links && selectedSection.links.length > 0 && (
                  <div className="pt-4 border-t border-border/30">
                    <h4 className="font-medium mb-2 text-base">Links</h4>
                    <div className="space-y-2">
                      {selectedSection.links.map((link: { label: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/20"
                        >
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span className="text-sm">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
