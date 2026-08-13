'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Users, ExternalLink, Smartphone, X } from 'lucide-react';
import type { Project } from '@/lib/types/project';
import { findProjectBySlug, getProjectId, normalizeProjectSlug } from '@/lib/types/project';
import { useSiteContent } from '@/components/site-content-provider';
import { FinshotsDetail } from './finshots-detail';
import { CaseStudyScreenStage } from '@/components/case-study-screen-stage';
import { ImageComparison } from '@/components/image-comparison';
import { shouldStageCaseStudyMedia } from '@/lib/case-study-backgrounds';
import { OsBackButton } from '@/components/os-back-button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { scrollPageToTop } from '@/lib/scroll-page';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  hideBackButton?: boolean;
  projects?: Project[];
}

const NESOI_COMPARISON = {
  beforeSrc: '/CRM/initial image.png',
  afterSrc: '/CRM/nesoi-solution.png',
  beforeLabel: 'Before',
  afterLabel: 'After',
  beforeAlt: 'Early framing of the Nesoi creation challenge',
  afterAlt: 'Nesoi AI chat-first creation experience',
} as const;

const NESOI_GALLERY_SECTIONS = [
  {
    title: 'Partner, not a chat box',
    description:
      'The brief was not “add a chat box.” Raw asset to finished video had to take fewer decisions than doing it by hand. A partner that reads the upload, proposes a plan, and shows its work.',
  },
  {
    title: 'Show the thinking',
    description:
      'Progress labels alone hide whether the AI understood the material. Surfacing what it read, inferred, and intends to build lets creators correct early instead of discarding the output.',
  },
  {
    title: 'Motivation over blank prompts',
    description:
      'The AI opens with what it found and what it thinks you are making, then asks the one question that changes the output. Confirm or redirect. Two moves instead of ten.',
  },
] as const;

// Images for Falcon Design System project
const falconImages = [
  { src: '/falcon design system/image.png', title: 'Falcon Design System', description: 'Comprehensive design system interface' },
];

export function ProjectDetailView({ projectId, onBack, hideBackButton = false, projects }: ProjectDetailViewProps) {
  const t = useTranslations('caseStudy');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { projects: cmsProjects } = useSiteContent();
  
  const handleImageClick = (src: string) => {
    setZoomedImage(src);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const allProjects = projects ?? cmsProjects;

  const project = projectId ? findProjectBySlug(allProjects, projectId) ?? null : null;

  const isNesoi = project ? (project.title.toLowerCase().includes('nesoi') || projectId.toLowerCase().includes('nesoi')) : false;

  useEffect(() => {
    scrollPageToTop();
    // Close zoom modal when project changes to prevent cleanup errors
    setZoomedImage(null);
  }, [projectId]);

  // Use custom Finshots detail page
  const normalizedProjectId = projectId ? normalizeProjectSlug(projectId) : '';
  const normalizedTitle = project ? getProjectId(project.title) : '';
  
  if (normalizedProjectId.includes('finshots') || normalizedTitle.includes('finshots') || 
      projectId.toLowerCase() === 'finshots-news-app' || normalizedTitle === 'finshots-news-app') {
    try {
      if (!FinshotsDetail) {
        throw new Error('FinshotsDetail is undefined');
      }
      const element = <FinshotsDetail projectId={projectId} onBack={onBack} hideBackButton={hideBackButton} />;
      return element;
    } catch (error) {
      throw error;
    }
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-foreground">
        <p className="text-muted-foreground mb-4">{t('projectNotFound')}: {projectId}</p>
        <p className="text-sm text-muted-foreground mb-4">Available projects:</p>
        <ul className="text-sm text-left max-w-md mx-auto space-y-1">
          {allProjects.map((p, i) => (
            <li key={i}>{p.title} → {getProjectId(p.title)}</li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center">
          <OsBackButton onClick={onBack} aria-label="Back to Home" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-3 w-full max-w-4xl px-4 pb-20 text-foreground sm:px-6 md:mt-4 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12 lg:mb-16">
        <div className="w-full">
          {!hideBackButton && (
            <div className="mb-5">
              <OsBackButton onClick={onBack} aria-label="Back to Home" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{project.title}</h1>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] md:text-[13px] text-muted-foreground">
            {(project.company || project.institution) && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 md:h-4 md:w-4" />
                {project.company || project.institution}
              </span>
            )}
            {project.period && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 md:h-4 md:w-4" />
                {project.period}
              </span>
            )}
            {project.type && (
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-[12px] font-medium">
                {project.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-24 lg:mb-32">
        {/* Left Content - Description */}
        <div className="lg:col-span-2 space-y-8">
          {project.description && (
            <>
              {project.description.split('\n\n').map((paragraph, idx) => {
                const labeled = paragraph.match(/^(Problem|Goal):\s*([\s\S]*)$/)
                return (
                  <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                    {labeled ? (
                      <>
                        <span className="font-semibold text-foreground">{labeled[1]}:</span>{' '}
                        {labeled[2]}
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                )
              })}
            </>
          )}
          {!project.description && project.details && (
            <>
              {Array.isArray(project.details) ? (
                project.details.map((detail, idx) => (
                  <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                    {detail}
                  </p>
                ))
              ) : (
                <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.details}</p>
              )}
            </>
          )}
          {'notes' in project && Array.isArray(project.notes) && project.notes.length > 0 && (
            <div id={`${projectId}-notes`} className="mb-8">
              <h2 className="text-2xl font-normal text-foreground">{t('notes')}</h2>
              <div className="mt-4 space-y-8">
                {project.notes.map((note, idx) => (
                  <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}
          {'activityHistory' in project && Array.isArray(project.activityHistory) && project.activityHistory.length > 0 && (
            <div id={`${projectId}-activity-history`} className="mb-8">
              <h2 className="text-2xl font-normal text-foreground">{t('activityHistory')}</h2>
              <div className="mt-4 space-y-8">
                {project.activityHistory.map((entry, idx) => (
                  <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}
          {project.url && (
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <span className="text-[13px] font-medium">{t('viewProject')}</span>
                <Smartphone className="h-4 w-4" />
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        
        {/* Right Content - Structured Project Details */}
        <div className="lg:col-span-1 space-y-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-8 lg:pt-0 lg:pl-8">
          {project.type && (
            <div className="pb-6 border-b border-border/50">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('product')}</h3>
              <p className="text-[13px] leading-5 text-foreground">{project.type}</p>
            </div>
          )}
          
          {project.tools && project.tools.length > 0 && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('skills')}</h3>
              <div className="space-y-2">
                {project.tools.map((tool, idx) => (
                  <p key={idx} className="text-[13px] leading-5 text-foreground">{tool}</p>
                ))}
              </div>
            </div>
          )}
          
          {project.role && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('myRole')}</h3>
              <p className="text-[13px] leading-5 text-foreground">{project.role}</p>
            </div>
          )}
          
          {project.period && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('timeline')}</h3>
              <p className="text-[13px] leading-5 text-foreground">{project.period}</p>
            </div>
          )}
          
          {project.team && (
            <div className="pt-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('team')}</h3>
              <p className="text-[13px] leading-5 text-foreground">{project.team}</p>
            </div>
          )}
        </div>
      </div>

      {/* Design Gallery - Nesoi: comparison UI first, copy underneath */}
      {isNesoi && (
        <div id={`${projectId}-design`} className="mb-24 lg:mb-32">
          <h2 className="mb-8 lg:mb-12 text-xl md:text-2xl font-normal text-foreground">
            {t('designGallery')}
          </h2>
          <ImageComparison
            beforeSrc={NESOI_COMPARISON.beforeSrc}
            afterSrc={NESOI_COMPARISON.afterSrc}
            beforeAlt={NESOI_COMPARISON.beforeAlt}
            afterAlt={NESOI_COMPARISON.afterAlt}
            beforeLabel={NESOI_COMPARISON.beforeLabel}
            afterLabel={NESOI_COMPARISON.afterLabel}
            backgroundSeed={`${projectId}-design-gallery`}
            initialPosition={48}
          />
          <div className="mt-8 lg:mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {NESOI_GALLERY_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                  {section.title}
                </h3>
                <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design Gallery - For Falcon Design System project */}
      {project && (project.title.toLowerCase().includes('falcon') || projectId.toLowerCase().includes('falcon')) && falconImages.length > 0 && (
        <div id={`${projectId}-design`} className="mb-24 lg:mb-32 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-8 px-4 md:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('designGallery')}</h2>
          </div>
          <div className="w-full">
            {falconImages.map((image, idx) => (
              <div key={idx} className="mb-8 last:mb-0 w-full">
                <div
                  className="relative w-full cursor-pointer group"
                  onClick={() => handleImageClick(image.src)}
                >
                  <div className="relative w-full" style={{ width: '100%', height: 'auto', aspectRatio: 'auto' }}>
                    <Image
                      src={image.src}
                      alt={image.title}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      priority={false}
                      className="w-full h-auto object-contain group-hover:opacity-90 transition-opacity duration-300"
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.designGallery && project.designGallery.length > 0 && (
        <div id={`${projectId}-design`} className="mb-24 lg:mb-32">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-normal text-foreground">{t('designGalleryLower')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {project.designGallery.map((entry, idx) => (
              <div key={idx} className="rounded-3xl border border-border/40 overflow-hidden">
                <div
                  className="relative w-full aspect-[4/3] md:aspect-[16/9] min-h-[420px] cursor-pointer"
                  onClick={() => handleImageClick(entry.src)}
                >
                  <Image
                    src={entry.src}
                    alt={entry.title || 'Design gallery'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />
                </div>
                <div className="space-y-4 px-4 py-6">
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground">{entry.title}</p>
                  {entry.description && <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{entry.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={closeZoom}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative w-full h-full">
              <Image
                src={zoomedImage}
                alt="Zoomed view"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}

      {/* Problem Section */}
      {project.problem && (
        <div id={`${projectId}-problem`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('problem')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
              {project.problem}
            </p>
            {project.approach && (
              <p className="text-[15px] leading-7 case-study-body text-muted-foreground mt-8">
                {project.approach}
              </p>
            )}
          </div>
        </div>
      )}

      {project.problemImage && (
        <div id={`${projectId}-problem-image`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="text-xl md:text-2xl font-normal text-foreground">{t('problemSnapshot')}</h2>
          {shouldStageCaseStudyMedia({ projectId, kind: 'problem-image' }) ? (
            <CaseStudyScreenStage
              seed={`${projectId}-problem-image`}
              alt={project.problemImage.alt || 'Problem snapshot'}
              frame="landscape"
              media={{ type: 'image', src: project.problemImage.src }}
              onClick={() => handleImageClick(project.problemImage!.src)}
            />
          ) : (
            <div className="relative w-full aspect-[16/9] rounded-3xl border border-border/50 overflow-hidden shadow-xl">
              <Image
                src={project.problemImage.src}
                alt={project.problemImage.alt || 'Problem snapshot'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
            </div>
          )}
          {project.problemImage.caption && (
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.problemImage.caption}</p>
          )}
        </div>
      )}

      {project.takeStepBack && (
        <div className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('takeStepBack')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
              {project.takeStepBack}
            </p>
          </div>
        </div>
      )}

      {project.painPoints && project.painPoints.length > 0 && (
        <div id={`${projectId}-painpoints`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('painpoints')}</h2>
          <div className="lg:col-span-3">
            {project.painPointsIntro && (
              <p className="text-[15px] leading-7 case-study-body text-muted-foreground mb-8">{project.painPointsIntro}</p>
            )}
            <div className="space-y-4">
              {project.painPoints.map((pain, idx) => (
                <div key={idx} className="space-y-4 border border-border/50 rounded-xl bg-card/40 p-6">
                  <p className="text-[15px] font-medium tracking-tight text-foreground">{pain.title}</p>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{pain.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HMW Section */}
      {project.hmw && (
        <div id={`${projectId}-hmw`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('hmw')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground font-medium">
              {project.hmw}
            </p>
          </div>
        </div>
      )}

      {project.businessOpportunity && project.businessOpportunity.length > 0 && (
        <div id={`${projectId}-business`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('businessOpportunity')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.businessOpportunity.map((opportunity, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.explorations && project.explorations.length > 0 && (
        <div id={`${projectId}-exploring`} className="mb-24 lg:mb-32">
          <h2 className="text-xl md:text-2xl font-normal text-foreground mb-8">{t('exploring')}</h2>
          <div className="space-y-12">
            {project.explorations.map((exploration, idx) => (
              <div key={idx} className="space-y-8">
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground">{exploration.tag}</p>
                <h3 className="text-[15px] font-medium tracking-tight text-foreground">{exploration.title}</h3>
                <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{exploration.problem}</p>
                <p className="text-[15px] leading-7 case-study-body text-foreground font-semibold">{t('solution')}</p>
                <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{exploration.solution}</p>
                {exploration.image && (
                  shouldStageCaseStudyMedia({ projectId, kind: 'exploration' }) ? (
                    <CaseStudyScreenStage
                      seed={`${projectId}-exploration-${idx}`}
                      alt={exploration.title}
                      frame="landscape"
                      media={{ type: 'image', src: exploration.image }}
                      onClick={() => handleImageClick(exploration.image!)}
                    />
                  ) : (
                    <div className="w-full overflow-hidden rounded-3xl border border-border/50 shadow-xl">
                      <div className="relative w-full aspect-[4/3] md:aspect-[3/2] min-h-[420px]">
                        <Image
                          src={exploration.image}
                          alt={exploration.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 90vw"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {project.targetAudience && (
        <div id={`${projectId}-target-audience`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('targetAudience')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.targetAudience}</p>
          </div>
        </div>
      )}

      {project.targetAudienceImage && (
        <div id={`${projectId}-target-snapshot`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="text-xl md:text-2xl font-normal text-foreground">{t('targetSnapshot')}</h2>
          <div className="relative w-full aspect-[16/9] rounded-3xl border border-border/50 overflow-hidden shadow-xl">
            <Image
              src={project.targetAudienceImage.src}
              alt={project.targetAudienceImage.alt || 'Target audience snapshot'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </div>
          {project.targetAudienceImage.caption && (
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.targetAudienceImage.caption}</p>
          )}
        </div>
      )}

      {/* Research Section */}
      {project.research && (
        <div id={`${projectId}-research`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('research')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
              {project.research}
            </p>
          </div>
        </div>
      )}

      {(() => {
        const projectWithPersonas = project as any;
        return projectWithPersonas.personas && Array.isArray(projectWithPersonas.personas) && projectWithPersonas.personas.length > 0 && (
          <div id={`${projectId}-personas`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('personas')}</h2>
            <div className="lg:col-span-3">
              <div className="grid gap-4 md:grid-cols-2">
                {projectWithPersonas.personas.map((persona: any, idx: number) => (
                  <div key={idx} className="space-y-4 border border-border/50 rounded-xl bg-card/40 p-6">
                    <div className="space-y-1">
                      <p className="text-[15px] font-medium tracking-tight text-foreground">{persona.name}</p>
                      <p className="text-[12px] text-muted-foreground">{persona.occupation}</p>
                    </div>
                    <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{persona.goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {project.detailSections && project.detailSections.length > 0 && (
        <div id={`${projectId}-detail-sections`}>
          {project.detailSections.map((section) => {
            return (
              <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                  <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">
                    {section.title}
                  </h2>
                  <div className="lg:col-span-3 space-y-6">
                    {section.description.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                {(() => {
                  const sectionImages = [
                    ...('image' in section && section.image ? [section.image] : []),
                    ...('images' in section && Array.isArray(section.images) ? section.images : []),
                  ]
                  if (sectionImages.length === 0) return null
                  return (
                    <div className="space-y-6 mt-8 lg:mt-12">
                      {sectionImages.map((src, imageIdx) => {
                        const staged = shouldStageCaseStudyMedia({
                          projectId,
                          sectionId: section.id,
                          kind: 'detail-image',
                        })
                        return staged ? (
                          <CaseStudyScreenStage
                            key={`${section.id}-image-${imageIdx}`}
                            seed={`${projectId}-${section.id}-image-${imageIdx}`}
                            alt={section.title || 'Section image'}
                            frame="landscape"
                            media={{ type: 'image', src }}
                            onClick={() => handleImageClick(src)}
                          />
                        ) : (
                          <div
                            key={`${section.id}-image-${imageIdx}`}
                            className="relative w-full cursor-pointer group"
                            onClick={() => handleImageClick(src)}
                          >
                            <div className="relative w-full" style={{ width: '100%', height: 'auto', aspectRatio: 'auto' }}>
                              <Image
                                src={src}
                                alt={section.title || 'Section image'}
                                width={1920}
                                height={1080}
                                loading="lazy"
                                priority={false}
                                className="object-contain group-hover:opacity-90 transition-transform duration-300 rounded-3xl border border-border/50 shadow-lg"
                                sizes="(max-width: 768px) 100vw, 80vw"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
                {'video' in section && section.video && (
                  <div className="space-y-6 mt-8 lg:mt-12">
                    {shouldStageCaseStudyMedia({
                      projectId,
                      sectionId: section.id,
                      kind: 'detail-video',
                    }) ? (
                      <CaseStudyScreenStage
                        seed={`${projectId}-${section.id}-video`}
                        alt={`${section.title} walkthrough video`}
                        frame="landscape"
                        media={{
                          type: 'video',
                          src: section.video,
                          poster: section.videoPoster,
                          controls: true,
                          autoPlay: false,
                        }}
                      />
                    ) : (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={section.videoPoster}
                        className="w-full rounded-3xl border border-border/50 shadow-lg object-cover"
                        src={section.video}
                        aria-label={`${section.title} walkthrough video`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                      {section.title} video
                    </p>
                  </div>
                )}
                {'prototypeGif' in section && section.prototypeGif && (
                  <div className="space-y-6 mt-8 lg:mt-12">
                    {shouldStageCaseStudyMedia({
                      projectId,
                      sectionId: section.id,
                      kind: 'detail-gif',
                    }) ? (
                      <CaseStudyScreenStage
                        seed={`${projectId}-${section.id}-gif`}
                        alt={`${section.title} prototype`}
                        frame="landscape"
                        media={{ type: 'image', src: section.prototypeGif }}
                        onClick={() => section.prototypeGif && handleImageClick(section.prototypeGif)}
                      />
                    ) : (
                      <div
                        className="relative w-full cursor-pointer group"
                        onClick={() => section.prototypeGif && handleImageClick(section.prototypeGif)}
                      >
                        <div className="relative w-full" style={{ width: '100%', height: 'auto', aspectRatio: 'auto' }}>
                          <Image
                            src={section.prototypeGif}
                            alt={`${section.title} prototype` || 'Prototype'}
                            width={1920}
                            height={1080}
                            loading="lazy"
                            priority={false}
                            className="object-contain group-hover:opacity-90 transition-transform duration-300 rounded-3xl border border-border/50 shadow-lg"
                            sizes="(max-width: 768px) 100vw, 80vw"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Section */}
      {project.results && project.results.length > 0 && (
        <div id={`${projectId}-stats`} className="mt-24 lg:mt-32 mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('someStats')}</h2>
          <div className="lg:col-span-3">
            {(() => {
              const projectWithImpact = project as any;
              return projectWithImpact.impactOverview && (
                <p className="text-[15px] leading-7 case-study-body text-muted-foreground mb-8">{projectWithImpact.impactOverview}</p>
              );
            })()}
            <div className="space-y-8">
              {project.results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Features */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('keyFeatures')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.keyFeatureImage && (
        <div id={`${projectId}-feature-image`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="text-xl md:text-2xl font-normal text-foreground">{t('featureSnapshot')}</h2>
          <div className="relative w-full aspect-[16/9] rounded-3xl border border-border/50 overflow-hidden shadow-xl">
            <Image
              src={project.keyFeatureImage.src}
              alt={project.keyFeatureImage.alt || 'Key feature illustration'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </div>
          {project.keyFeatureImage.caption && (
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.keyFeatureImage.caption}</p>
          )}
        </div>
      )}

      {/* Learnings */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="mt-24 lg:mt-32 mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('learnings')}</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-8">
                {project.learnings.map((learning, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{learning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.learnings}</p>
            )}
          </div>
        </div>
      )}

      {project.prototype && (
        <div id={`${projectId}-prototype`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="text-xl md:text-2xl font-normal text-foreground">{t('prototype')}</h2>
          <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{project.prototype}</p>
          {project.prototypeFrame && (
            <div className="overflow-hidden rounded-3xl border border-border/50 shadow-xl bg-card/70">
              <div className="relative w-full aspect-[16/9]">
                <iframe
                  title="Onboarding prototype"
                  src={project.prototypeFrame}
                  className="h-full w-full"
                  loading="lazy"
                  allow="fullscreen"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impact */}
      {project.impact && project.impact.length > 0 && (
        <div id={`${projectId}-impact`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('impact')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.impact.map((impact, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
