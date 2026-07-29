'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentState, SectionPriority, SectionType } from '@/lib/agent';
import { User, Briefcase, Mail, Linkedin, FileText, Sparkles, Code2, Calendar, Award, Globe, Github, Zap, FolderKanban, Image as ImageIcon, ExternalLink, Rocket, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { HighlightedText } from './highlighted-text';
import { HeroBio } from './hero-bio';
import { useSiteContent } from '@/components/site-content-provider';
import { useTheme } from '@/contexts/theme-context';
import { useTranslations } from 'next-intl';
import { FINSHOTS_APP_SCREEN } from '@/lib/build-case-study-cards';
import { ProjectTreeCard } from '@/components/project-tree-card';
import { SideProjectCard } from '@/components/side-project-card';
import { CatalysticCard } from '@/components/catalystic-card';
import { MusicNotchCard } from '@/components/music-notch-card';
import { PhotoCarousel } from '@/components/photo-carousel';
import { AgentOrbCard } from '@/components/agent-orb-card';
import { DewVideoPhone, resolveDewVideoSrc } from '@/components/dew-video-phone';
import { GrainBrandAnimation } from '@/components/grain-brand-animation';
import { SiteUpdateNote } from '@/components/site-update-note';
import { HeroVideo } from '@/components/hero-video';

const SECTION_ICON_MAP: Record<string, LucideIcon> = {
  hero: User,
  'side-project': Rocket,
  'agent-dog': Sparkles,
  'music-notch': Sparkles,
  'finshots-award': Award,
  about: User,
  experience: Briefcase,
  connect: Mail,
  contact: Mail,
  skills: Code2,
  projects: FolderKanban,
  photos: ImageIcon,
  video: ImageIcon,
  education: FileText,
};

const getSectionIcon = (id: string) => SECTION_ICON_MAP[id] ?? Sparkles;

const SectionLabel = ({ label, icon: Icon }: { label: string; icon: LucideIcon }) => (
  <div className="flex items-center gap-2.5">
    <Icon className="h-4 w-4 text-foreground/80 flex-shrink-0" />
    <span className="text-[15px] font-medium tracking-tight text-foreground">{label}</span>
  </div>
);

const DEFAULT_PHOTO_PATHS = [
  '/photos/Le5RRVetScFh9EG3aEJYsrCsM.jpg.avif',
  '/photos/O6bInc2LhAgXBkQ6yLobk41OLss.jpg',
  '/photos/ZZXFdA0RZyD5h20wZdhoCxLhy0.jpg',
  '/photos/sakura-park.jpg',
  '/photos/Cafe-laptop.png',
  '/photos/daffodils-squirrel.jpg',
  '/photos/edinburgh-street.jpg',
];

const PHOTO_BLOCKLIST = new Set([
  '/brand-mark.png',
  '/photos/Image@4x.png',
  '/photos/.png',
  '/photos/image.png',
  '/photos/MEE.png',
  '/photos/plant.png',
]);

const HERO_LIGHT_SVG = '/svg/me alone and the background.svg';
const HERO_THEME_SVGS: Record<'blue' | 'green' | 'red', string> = {
  blue: '/svg/blue me.svg',
  green: '/svg/green me.svg',
  red: '/svg/red me.svg',
};

interface PortfolioSectionsProps {
  agentState: AgentState;
  hideHeaderText?: boolean;
  onProjectSelect?: (projectId: string) => void;
  onShowProjectsList?: () => void;
  onEnterGenUI?: () => void;
  selectedProjectId?: string | null;
}

export function PortfolioSections({ agentState, hideHeaderText = false, onProjectSelect, onShowProjectsList, onEnterGenUI, selectedProjectId }: PortfolioSectionsProps) {
  const t = useTranslations('home');
  const { theme } = useTheme();
  const { settings, projects } = useSiteContent();
  // Track carousel pause state for photo sections
  const [carouselPaused, setCarouselPaused] = React.useState<Record<string, boolean>>({});
  // Track dialog state for section details
  const [selectedSection, setSelectedSection] = useState<any>(null);
  // Track mouse position for cursor-following spotlight effect
  const [mousePositions, setMousePositions] = React.useState<{ [key: string]: { x: number; y: number } | null }>({});
  // Track video elements for hover play/pause
  const videoRefs = React.useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleMouseMove = React.useCallback((sectionId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!isNaN(x) && !isNaN(y)) {
      setMousePositions(prev => ({ ...prev, [sectionId]: { x, y } }));
    }
  }, []);

  const handleMouseLeave = React.useCallback((sectionId: string) => {
    // Clear after a short delay to allow smooth transitions
    setTimeout(() => {
      setMousePositions(prev => ({ ...prev, [sectionId]: null }));
    }, 150);
  }, []);

  // Sort by order first, then filter visible sections - must be before early return
  const sortedSections = React.useMemo(() => {
    if (!agentState || !agentState.sections) return [];
    return [...agentState.sections].sort((a, b) => a.order - b.order);
  }, [agentState]);
  const visibleSections = React.useMemo(() => sortedSections.filter(s => s.visible), [sortedSections]);
  const displaySections = React.useMemo(() => {
    const list = [...visibleSections];
    const rowOrder = [
      'hero',
      'projects',
      'side-project',
      'photos',
      'agent-dog',
      'gen-ui-orb',
      'music-notch',
      'video',
      'experience',
      'connect',
    ];
    return rowOrder
      .map((id) => {
        if (id === 'agent-dog') {
          return {
            id: 'agent-dog',
            title: 'Catalystic UI',
            priority: 'high' as SectionPriority,
            order: 5,
            visible: true,
            type: 'custom' as SectionType,
          };
        }
        return list.find((section) => section.id === id);
      })
      .filter((section): section is (typeof list)[number] | { id: string; title: string; priority: SectionPriority; order: number; visible: boolean; type: SectionType } => Boolean(section));
  }, [visibleSections]);

  const getPhotoSources = useCallback((section: any) => {
    if (section.id === 'photos') {
      return DEFAULT_PHOTO_PATHS;
    }

    const fromSection = [
      ...(section.images ?? []),
      ...(section.image ? [section.image] : []),
    ].filter((src: string) => src && !PHOTO_BLOCKLIST.has(src));

    if (fromSection.length > 0) {
      return fromSection;
    }

    return DEFAULT_PHOTO_PATHS;
  }, []);

  // Safety check for agentState - after all hooks
  if (!agentState || !agentState.sections) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No portfolio sections available</p>
      </div>
    );
  }

  const getBentoSize = (priority: SectionPriority, sectionId: string, sectionType?: SectionType, order: number = 0) => {
    // Create varied card sizes based on type, priority, and position
    // This creates a more dynamic bento grid layout
    // On mobile, all cards should be single column (col-span-1)
    const sizeMap: { [key: string]: string } = {
      'hero': 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
      'side-project': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 min-h-[300px] sm:min-h-[360px]',
      'agent-dog': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 min-h-[420px] sm:min-h-[360px]',
      'music-notch': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 min-h-[320px]',
      'gen-ui-orb': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'finshots-award': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'projects': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]',
      'photos': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 min-h-[300px] sm:min-h-[360px]',
      'video': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2 min-h-[320px]',
      'connect': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
      'contact': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1 ',
      'experience': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
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
    // Supabase-style cards: thin subtle border, deep near-black surface,
    // border gently brightens on hover.
    const baseStyles = 'rounded-lg border border-border/55 hover:border-border/80 dark:border-border/40 dark:hover:border-border/70 cursor-pointer transition-all duration-500 ease-out relative overflow-hidden group';

    const bgStyles = 'bg-card dark:bg-[#1B1917]';

    const borderStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: '',
      medium: '',
      low: '',
    };

    const transformStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: '',
      medium: '',
      low: '',
    };

    const shadowStyles: Record<Exclude<SectionPriority, 'hidden'>, string> = {
      high: 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] dark:shadow-md',
      medium: 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] dark:shadow-md',
      low: 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] dark:shadow-md',
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

  const renderSection = (section: typeof visibleSections[0], index: number) => {
    const baseStyles = getPriorityStyles(section.priority, section.type);
    const bentoSize = getBentoSize(section.priority, section.id, section.type, section.order);
    const mousePos = mousePositions[section.id];
    const isHovered = mousePos !== null && mousePos !== undefined && typeof mousePos.x === 'number' && typeof mousePos.y === 'number';
    
    // Border reveal that follows cursor
    // Increased radius to 200px for larger effect area
    const borderReveal = isHovered && mousePos ? (
      <div 
        className="absolute inset-0 pointer-events-none rounded-lg z-[1]"
        style={{
          border: '1px solid hsl(var(--primary) / 0.5)',
          WebkitMaskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 75%)`,
          maskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 75%)`,
          transition: 'none',
        }}
      />
    ) : null;
    
    const SectionIcon = getSectionIcon(section.id);
    switch (section.id) {
      case 'hero':
        return (
      <Card 
        key={section.id} 
        data-card-id={section.id}
        data-cuelume-hover="whisper"
        className={`${baseStyles} ${bentoSize} group flex flex-col relative overflow-hidden`}
        onClick={() => handleCardClick(section.id)}
        onMouseMove={(e) => {
          handleMouseMove(section.id, e);
        }}
        onMouseLeave={() => {
          handleMouseLeave(section.id);
        }}
      >
            {borderReveal}
            
            <CardHeader className="flex flex-col justify-center flex-shrink-0 relative z-10 pb-0 px-4 pt-4">
              <div className="mb-3">
                <CardTitle className="text-[15px] font-medium tracking-tight text-foreground">
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className="h-4 w-4 text-foreground/80 flex-shrink-0" />
                    <span>Dev</span>
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start md:px-4 md:pb-4 h-full">
              <div className="flex-1 flex flex-col gap-3 justify-between h-full pb-4 sm:pb-8">
                <div className="w-full max-w-[288px] min-w-0">
                  <HeroBio variant="hero" />
                </div>
                <div className="flex flex-col gap-1 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t('location')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground transition-colors duration-200 group-hover:text-emerald-400">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-200 group-hover:text-emerald-400" />
                    <span className="font-medium">{t('available')}</span>
                  </div>
                </div>
              </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-[560px] rounded-lg overflow-hidden border border-border/40 dark:border-border/60 hero-illustration">
                <div className="relative w-full h-[240px] sm:h-[300px] md:h-[340px] max-h-[340px]">
                  {theme === 'dark' ? (
                    <HeroVideo />
                  ) : theme === 'blue' || theme === 'green' || theme === 'red' ? (
                    <img
                      src={HERO_THEME_SVGS[theme]}
                      alt="Dev"
                      className="relative z-10 mx-auto h-full w-auto max-w-full max-h-[340px] object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  ) : (
                    <img
                      src={HERO_LIGHT_SVG}
                      alt="Dev"
                      className={`relative z-10 mx-auto w-auto max-w-full max-h-[340px] object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100 svg-hero-${theme}`}
                    />
                  )}
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        );

      case 'gen-ui-orb':
        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto cursor-default group relative overflow-hidden`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardContent className="relative z-10 h-full p-0">
              <AgentOrbCard
                title={t('genUiCard.title')}
                description={t('genUiCard.description')}
                buttonLabel={t('genUiCard.button')}
                onClick={() => onEnterGenUI?.()}
              />
            </CardContent>
          </Card>
        );

      case 'agent-dog':
        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full cursor-pointer group relative overflow-hidden`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardContent className="relative z-10 h-full p-0">
              <CatalysticCard
                sectionLabel={t('latestProjects.label')}
                title={t('latestProjects.catalystic.title')}
                description={t('latestProjects.catalystic.description')}
                statusLabel={t('latestProjects.catalystic.status')}
              />
            </CardContent>
          </Card>
        );

      case 'music-notch':
        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full cursor-default group relative overflow-hidden`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardContent className="relative z-10 flex h-full flex-col p-0">
              <MusicNotchCard
                title={t('musicNotch.title')}
                comingSoon={t('musicNotch.comingSoon')}
                tagline={t('musicNotch.tagline')}
                tagLabel={t('sideProject.label')}
              />
            </CardContent>
          </Card>
        );

      case 'side-project':
        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-auto cursor-default group relative overflow-hidden`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardContent className="relative z-10 p-0">
              <SideProjectCard
                title={t('sideProject.title')}
                url={t('sideProject.url')}
                href="https://pixlanimations.vercel.app"
                tagLabel={t('sideProject.label')}
                createIconLabel={t('sideProject.createIcon')}
                startDrawLabel={t('sideProject.startDraw')}
                retryLabel={t('sideProject.retry')}
                cancelLabel={t('sideProject.cancel')}
                downloadLabel={t('sideProject.downloadSvg')}
                generatingLabel={t('sideProject.generating')}
                errorEmptyLabel={t('sideProject.errorEmpty')}
                apiErrorLabel={t('sideProject.apiError')}
              />
            </CardContent>
          </Card>
        );

      case 'finshots-award':
        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full group relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="text-[16px] mb-1">
                <SectionLabel label={t('finshotsAward.title')} icon={SectionIcon} />
              </CardTitle>
              <p className="text-[12px] text-muted-foreground/80 pl-6">{t('finshotsAward.badge')}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 relative z-10 flex-1">
              <HighlightedText
                text={t('finshotsAward.story')}
                className="text-[13px] text-muted-foreground/70 leading-relaxed"
                as="p"
              />
              <div className="relative w-full overflow-hidden rounded-xl border border-border/30 bg-secondary/20 aspect-[4/3]">
                <Image
                  src={FINSHOTS_APP_SCREEN}
                  alt="Finshots mobile app"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/30 bg-secondary/30 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Downloads</p>
                  <p className="text-[14px] font-medium">100k+</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/30 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rating</p>
                  <p className="text-[14px] font-medium">4.9★</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline w-fit"
                onClick={(e) => {
                  e.stopPropagation();
                  onProjectSelect?.('finshots-news-app');
                }}
              >
                {t('finshotsAward.viewCaseStudy')}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </CardContent>
          </Card>
        );

      case 'experience':
        if (section.id === 'experience' && !section.description && !section.content) {
          return (
            <Card
              key={section.id}
              id="work"
              data-section="work"
              data-card-id={section.id}
              data-cuelume-hover="whisper"
              className={`${baseStyles} ${bentoSize} group relative flex flex-col overflow-hidden`}
              onMouseMove={(e) => handleMouseMove(section.id, e)}
              onMouseLeave={() => handleMouseLeave(section.id)}
            >
              {borderReveal}
              <CardContent className="relative z-10 flex min-h-[220px] flex-col items-start justify-between gap-4 px-4 pb-4 pt-[18px]">
                <SiteUpdateNote className="w-full" />
                <div className="flex w-full justify-center pb-1">
                  <GrainBrandAnimation size={88} />
                </div>
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
              <CardTitle className="text-[16px]">
                <SectionLabel label={expTitle} icon={SectionIcon} />
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
            className={`${baseStyles} ${bentoSize} flex flex-col h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] max-h-[420px] cursor-default group relative overflow-hidden`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardContent className="relative z-10 flex h-full min-h-0 flex-col px-4 pb-4 pt-[18px]">
              <ProjectTreeCard
                label={t('projectTreeLabel')}
                icon={FolderKanban}
                selectedProjectId={selectedProjectId}
                onProjectSelect={(projectId) => {
                  onProjectSelect?.(projectId);
                }}
                className="h-full min-h-0"
              />
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
              <CardTitle className="text-[16px]">
                <SectionLabel label={section.title || 'Skills'} icon={SectionIcon} />
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
              <CardTitle className="text-[16px]">
                <SectionLabel label={section.title || 'Education'} icon={SectionIcon} />
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

      case 'photos': {
        const photos = getPhotoSources(section);

        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            data-cuelume-hover="whisper"
            className={`${baseStyles} ${bentoSize} flex flex-col h-full overflow-hidden group p-0`}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseEnter={() => setCarouselPaused((prev) => ({ ...prev, [section.id]: true }))}
            onMouseLeave={() => {
              handleMouseLeave(section.id);
              setCarouselPaused((prev) => ({ ...prev, [section.id]: false }));
            }}
          >
            {borderReveal}
            {photos.length > 0 ? (
              <PhotoCarousel
                photos={photos}
                title={section.title || 'Photo'}
                paused={carouselPaused[section.id] ?? false}
              />
            ) : (
              <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10 border-2 border-dashed border-border/50 group hover:border-border transition-colors">
                <CardHeader className="pb-2 flex-shrink-0 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/20 rounded-full animate-pulse">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-[16px] mb-1">
                    {section.title || 'Photo'}
                  </CardTitle>
                </CardHeader>
              </div>
            )}
          </Card>
        );
      }

      case 'video': {
        const videoSrc = resolveDewVideoSrc(section.content);
        const videoLink = section.links?.[0]?.url || 'https://medium.com/@devadhathanmd18/why-ai-needs-a-face-building-dew-my-duolingo-inspired-ai-character-2d4e56f94772';
        const videoTitle = section.id === 'video' ? t('dewTitle') : (section.title || 'Video');

        return (
          <Card
            key={section.id}
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full overflow-hidden group relative`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => {
              handleMouseLeave(section.id);
              const video = videoRefs.current[section.id];
              video?.pause();
            }}
            onMouseEnter={() => {
              const video = videoRefs.current[section.id];
              if (video) {
                video.muted = true;
                video.volume = 0;
                video.play().catch(() => undefined);
              }
            }}
          >
            {borderReveal}
            <DewVideoPhone
              title={videoTitle}
              linkLabel={t('readOnMedium')}
              linkHref={videoLink}
              videoSrc={videoSrc}
              onVideoRef={(el) => {
                videoRefs.current[section.id] = el;
              }}
            />
          </Card>
        );
      }

      case 'custom':
      default: {
        const isLastPortfolio = section.id === 'last-portfolio-version';
        const customTitle = isLastPortfolio ? t('lastPortfolio') : (section.title || 'Custom Section');
        const customDescription = isLastPortfolio ? t('lastPortfolioDesc') : section.description;
        const customLinks = section.links?.map((link) =>
          isLastPortfolio ? { ...link, label: t('launchLastVersion') } : link
        );

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
              <CardTitle className="text-[16px]">
                <SectionLabel label={customTitle} icon={SectionIcon} />
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
                  {section.image && (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-border/20 bg-muted">
                      <Image
                        src={section.image}
                        alt={`${customTitle} thumbnail`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  {customDescription && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {customDescription}
                    </p>
                  )}
                  {customLinks && customLinks.length > 0 && (
                    <div className="space-y-2">
                      {customLinks.map((link, index) => (
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
      }

      case 'connect':
        return (
          <Card 
            key={section.id} 
            data-card-id={section.id}
            className={`${baseStyles} ${bentoSize} flex flex-col h-full group relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
            onMouseMove={(e) => handleMouseMove(section.id, e)}
            onMouseLeave={() => handleMouseLeave(section.id)}
          >
            {borderReveal}
            <CardHeader className="pb-2 flex-shrink-0 relative z-10">
              <CardTitle className="text-[16px] mb-2">
                <SectionLabel label={t('connect')} icon={SectionIcon} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 relative z-10 flex-1 justify-center">
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group/item border border-border/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium">{t('email')}</span>
                  <span className="text-[11px] text-muted-foreground truncate">{settings.email}</span>
                </div>
              </a>
              <a
                href={`https://linkedin.com/${(settings.linkedin ?? 'in/devadhathan/').replace(/^\/+/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group/item border border-border/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium">LinkedIn</span>
                  <span className="text-[11px] text-muted-foreground">{t('connectWithMe')}</span>
                </div>
              </a>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      {!hideHeaderText && (
        <div className="mb-8 md:mb-10 text-left pt-8 md:pt-10 lg:pt-14">
          <p className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-muted-foreground mb-4 md:mb-5">
            {t('digitalHome')}
          </p>
          <h1
            className="max-w-5xl whitespace-pre-line text-balance text-3xl sm:text-[2.5rem] md:text-5xl lg:text-6xl xl:text-[4.25rem] font-light text-foreground tracking-tight leading-[1.02] mb-10 md:mb-14 lg:mb-16"
          >
            {t('heroLine1')}
          </h1>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-5 auto-rows-[minmax(220px,auto)] pb-4 md:pb-0 w-full">
        {displaySections.map((section, index) => renderSection(section, index))}
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
                  {selectedSection.id === 'finshots-award' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {selectedSection.id === 'about' && (
                    <div className="p-2 bg-primary/20 rounded-full">
                      <User className="h-5 w-5 text-primary" />
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
                      <h4 className="text-[15px] font-medium tracking-tight text-foreground mb-2">About</h4>
                      <HeroBio
                        className="text-sm text-muted-foreground leading-relaxed"
                        as="p"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>{t('location')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>{t('availableOpportunities')}</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedSection.id === 'finshots-award' && (
                  <>
                    <HighlightedText
                      text={t('finshotsAward.story')}
                      className="text-sm text-muted-foreground leading-relaxed"
                      as="p"
                    />
                    <HighlightedText
                      text={t('finshotsAward.detail')}
                      className="text-sm text-muted-foreground leading-relaxed"
                      as="p"
                    />
                    <div className="relative w-full overflow-hidden rounded-xl border border-border/30 bg-secondary/20 aspect-[16/10]">
                      <Image
                        src={FINSHOTS_APP_SCREEN}
                        alt="Finshots mobile app"
                        fill
                        className="object-cover object-top"
                        sizes="672px"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      onClick={() => {
                        setSelectedSection(null);
                        onProjectSelect?.('finshots-news-app');
                      }}
                    >
                      {t('finshotsAward.viewCaseStudy')}
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Experience Section Details */}
                {selectedSection.id === 'experience' && (
                  <>
                    {selectedSection.content ? (
                        <div>
                          <h4 className="text-[15px] font-medium tracking-tight text-foreground mb-2">Experience Details</h4>
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
                                <p className="text-sm text-primary mb-2">Wordsmith AI</p>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>April 2026 - June 2026</span>
                                </div>
                              </div>
                            </div>

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
                                <p className="text-sm text-primary mb-2">Finshots & Ditto</p>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>August 2019 - December 2022</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Joined Finshots in 2019 as a product designer on the financial news platform and designed the award-winning Finshots app (Google Play Best App 2020, 100k+ downloads). Stayed with the company as it founded Ditto Insurance in 2021 and rebranded under Ditto — Finshots remains a product of the parent company. Also led Ditto booking portal (+17% conversion), Falcon Design System, and CRM redesign (+20% efficiency).
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Design Systems', 'Mobile Design', 'UX Research', 'Prototyping'].map((tag) => (
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
                {!['hero', 'finshots-award', 'about', 'experience', 'contact', 'connect'].includes(selectedSection.id) && selectedSection.content && (
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
