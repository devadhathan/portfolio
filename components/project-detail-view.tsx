'use client';

import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, ExternalLink, Smartphone, X } from 'lucide-react';
import type { Project } from '@/lib/types/project';
import { findProjectBySlug, getProjectId, normalizeProjectSlug } from '@/lib/types/project';
import { useSiteContent } from '@/components/site-content-provider';
import { FinshotsDetail } from './finshots-detail';
import { CaseStudyScreenStage } from '@/components/case-study-screen-stage';
import { ImageComparison } from '@/components/image-comparison';
import { shouldStageCaseStudyMedia } from '@/lib/case-study-backgrounds';
import { OsBackButton } from '@/components/os-back-button';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { scrollPageToTop } from '@/lib/scroll-page';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  hideBackButton?: boolean;
  projects?: Project[];
  /** Use OS-window container measure (work rail) instead of centered page column. */
  layout?: 'page' | 'work-rail';
}

const NESOI_COMPARISON = {
  beforeSrc: '/CRM/initial image.webp',
  afterSrc: '/photos/case-study-bg/nesoi.webp',
  beforeLabel: 'Before',
  afterLabel: 'After',
  beforeAlt: 'Early framing of the Nesoi creation challenge',
  afterAlt: 'Nesoi AI chat-first creation experience',
  /** Two paintings — the divider cuts the stage, not just the screenshot. */
  beforeBackgroundSrc: '/photos/case-study-bg/castle-golden-hour.webp',
  afterBackgroundSrc: '/photos/case-study-bg/mountain-sunset.webp',
} as const;

const NESOI_TITLE_IMAGE = {
  src: '/photos/case-study-bg/Nesoi title pic.webp',
  alt: 'Nesoi.ai',
} as const;

const NESOI_FRAMING = {
  imageSrc: '/photos/case-study-bg/nesoi framing.webp',
  imageAlt: 'Old Nesoi interface beside an indirect competitor',
  gifSrc: '/photos/case-study-bg/Screen Recording 2026-01-28 at 22.31.37-2.gif',
  gifAlt: 'Nesoi AI chat-first creation experience',
  gifLabel: 'Our new AI chat composer',
  /** Distinct from other Nesoi stages (coastal-fjord / mountain / etc.). */
  backgroundSrc: '/photos/case-study-bg/riverside-town.webp',
} as const;

const NESOI_GALLERY_SECTIONS = [
  {
    title: 'Read the upload, then ask one question',
    description:
      'The AI opens with what it found and what it thinks you are making, then asks the single question that changes the output. Confirm or redirect. Two moves instead of ten.',
  },
  {
    title: 'Show the thinking',
    description:
      'What it read, what it inferred, what it intends to build, while it builds. People correct early instead of discarding the output.',
  },
  {
    title: 'Templates and freeform on one surface',
    description:
      'People pick a template, then talk their way out of it. Structured actions and freeform prompts share one input, so switching mid task costs nothing.',
  },
] as const;

/** Section video — plays itself while in view, muted and looping, square corners. */
function SectionVideo({
  src,
  poster,
  label,
  controls = true,
}: {
  src: string;
  poster?: string;
  label: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      controls={controls}
      playsInline
      preload="metadata"
      poster={poster}
      data-case-bleed
      className="w-full shadow-lg object-cover"
      src={src}
      aria-label={label}
    >
      Your browser does not support the video tag.
    </video>
  );
}

// Images for Falcon Design System project
const falconImages = [
  { src: '/falcon design system/image.webp', title: 'Falcon Design System', description: 'Comprehensive design system interface' },
];

export function ProjectDetailView({
  projectId,
  onBack,
  hideBackButton = false,
  projects,
  layout = 'page',
}: ProjectDetailViewProps) {
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
      const element = (
        <FinshotsDetail
          projectId={projectId}
          onBack={onBack}
          hideBackButton={hideBackButton}
          layout={layout}
        />
      );
      return element;
    } catch (error) {
      throw error;
    }
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-foreground">
        <p className="text-muted-foreground mb-4">{t('projectNotFound')}: {projectId}</p>
        <p className="cs-body text-muted-foreground mb-4">Available projects:</p>
        <ul className="cs-body text-left max-w-md mx-auto space-y-1">
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
    <div
      className={`${layout === 'work-rail' ? 'os-col--work-case' : 'os-col--case'} mt-4 pb-20 text-foreground sm:mt-5 md:mt-6 lg:pb-0`}
    >      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${
          isNesoi ? 'mb-6 lg:mb-8' : 'mb-12 lg:mb-16'
        }`}
      >
        <div className="w-full">
          {!hideBackButton && (
            <div className="mb-5">
              <OsBackButton onClick={onBack} aria-label="Back to Home" />
            </div>
          )}
          {isNesoi ? (
            <div
              data-cuelume-hover="tick"
              data-cuelume-press
              data-case-bleed
              className="relative w-full cursor-pointer overflow-hidden"
              onClick={() => handleImageClick(NESOI_TITLE_IMAGE.src)}
            >
              <Image
                src={NESOI_TITLE_IMAGE.src}
                alt={NESOI_TITLE_IMAGE.alt}
                width={1600}
                height={994}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1
                  className="cs-display text-foreground"
                  style={{ fontWeight: 600 }}
                >
                  {project.title}
                </h1>
              </div>
              {(project.company || project.institution || project.period || project.type) ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground md:text-sm">
                {(project.company || project.institution) ? (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {project.company || project.institution}
                  </span>
                ) : null}
                {project.period ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {project.period}
                  </span>
                ) : null}
                {project.type ? (
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium leading-none text-primary md:text-[12px]">
                    {project.type}
                  </span>
                ) : null}
              </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-24 lg:mb-32 ${
          isNesoi ? 'mt-0' : ''
        }`}
      >
        {/* Left Content - Description */}
        <div className={`lg:col-span-2 ${isNesoi ? 'space-y-5' : 'space-y-8'}`}>
          {project.description && (
            <>
              {project.description.split('\n\n').map((paragraph, idx) => {
                if (isNesoi) {
                  return (
                    <p key={idx} className="cs-body text-muted-foreground">
                      {paragraph}
                    </p>
                  );
                }
                const labeled = paragraph.match(/^(Problem|Goal):\s*([\s\S]*)$/)
                return (
                  <p key={idx} className="cs-body text-muted-foreground">
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
                  <p key={idx} className="cs-body text-muted-foreground">
                    {detail}
                  </p>
                ))
              ) : (
                <p className="cs-body text-muted-foreground">{project.details}</p>
              )}
            </>
          )}
          {'notes' in project && Array.isArray(project.notes) && project.notes.length > 0 && (
            <div id={`${projectId}-notes`} className="mb-8">
              <h2 className="cs-heading text-foreground">{t('notes')}</h2>
              <div className="mt-4 space-y-8">
                {project.notes.map((note, idx) => (
                  <p key={idx} className="cs-body text-muted-foreground">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}
          {'activityHistory' in project && Array.isArray(project.activityHistory) && project.activityHistory.length > 0 && (
            <div id={`${projectId}-activity-history`} className="mb-8">
              <h2 className="cs-heading text-foreground">{t('activityHistory')}</h2>
              <div className="mt-4 space-y-8">
                {project.activityHistory.map((entry, idx) => (
                  <p key={idx} className="cs-body text-muted-foreground">
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
                <span className="cs-body font-medium">{t('viewProject')}</span>
                <Smartphone className="h-4 w-4" />
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        
        {/* Right Content - Structured Project Details */}
        <div className="lg:col-span-1 space-y-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-8 lg:pt-0 lg:pl-8">
          {!isNesoi && project.type ? (
            <div className="pb-6 border-b border-border/50">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('product')}</h3>
              <p className="cs-meta text-foreground">{project.type}</p>
            </div>
          ) : null}
          
          {project.tools && project.tools.length > 0 && (
            <div className={`${isNesoi ? 'pb-6' : 'py-6'} border-b border-border/50`}>
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('skills')}</h3>
              <div className="space-y-2">
                {project.tools.map((tool, idx) => (
                  <p key={idx} className="cs-meta text-foreground">{tool}</p>
                ))}
              </div>
            </div>
          )}
          
          {project.role && (
            <div className="py-6 border-b border-border/50">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('myRole')}</h3>
              <p className="cs-meta text-foreground">{project.role}</p>
            </div>
          )}
          
          {project.period && (
            <div className="py-6 border-b border-border/50">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('timeline')}</h3>
              <p className="cs-meta text-foreground">{project.period}</p>
            </div>
          )}
          
          {project.team && (
            <div className="pt-6">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('team')}</h3>
              <p className="cs-meta text-foreground">{project.team}</p>
            </div>
          )}
        </div>
      </div>

      {/* Design Gallery - For Falcon Design System project */}
      {project && (project.title.toLowerCase().includes('falcon') || projectId.toLowerCase().includes('falcon')) && falconImages.length > 0 && (
        <div id={`${projectId}-design`} className="mb-24 lg:mb-32 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-8 px-4 md:px-6 lg:px-8">
            <h2 className="cs-heading text-foreground lg:col-span-2">{t('designGallery')}</h2>
          </div>
          <div className="w-full">
            {falconImages.map((image, idx) => (
              <div key={idx} className="mb-8 last:mb-0 w-full">
                <div
                  data-cuelume-hover="tick"
                            data-cuelume-press
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
            <h2 className="cs-heading text-foreground">{t('designGalleryLower')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {project.designGallery.map((entry, idx) => (
              <div key={idx} className="overflow-hidden shadow-lg" data-case-bleed>
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
                  <p className="cs-label uppercase text-muted-foreground">{entry.title}</p>
                  {entry.description && <p className="cs-body text-muted-foreground">{entry.description}</p>}
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
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('problem')}</h2>
          <div className="lg:col-span-3 space-y-6">
            {project.problem.split('\n\n').map((paragraph, idx) => (
              <p
                key={idx}
                className={
                  idx === 0 && isNesoi
                    ? 'cs-body font-medium text-foreground'
                    : 'cs-body text-muted-foreground'
                }
              >
                {paragraph}
              </p>
            ))}
            {project.approach && !isNesoi && (
              <p className="cs-body text-muted-foreground mt-8">
                {project.approach}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Nesoi Goal + before/after - same content rhythm as Problem */}
      {isNesoi && (
        <div id={`${projectId}-goal`} className="mb-24 lg:mb-32 space-y-10 lg:space-y-12">
          {project.hmw ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-12">
              <h2 className="cs-heading text-foreground lg:col-span-2">Goal</h2>
              <div className="space-y-6 lg:col-span-3">
                <p className="cs-body font-medium text-foreground">{project.hmw}</p>
                {project.approach ? (
                  <p className="cs-body text-muted-foreground">{project.approach}</p>
                ) : null}
              </div>
            </div>
          ) : null}
          <ImageComparison
            beforeSrc={NESOI_COMPARISON.beforeSrc}
            afterSrc={NESOI_COMPARISON.afterSrc}
            beforeAlt={NESOI_COMPARISON.beforeAlt}
            afterAlt={NESOI_COMPARISON.afterAlt}
            beforeLabel={NESOI_COMPARISON.beforeLabel}
            afterLabel={NESOI_COMPARISON.afterLabel}
            backgroundSrc={NESOI_COMPARISON.afterBackgroundSrc}
            beforeBackgroundSrc={NESOI_COMPARISON.beforeBackgroundSrc}
            autoSweep
            initialPosition={48}
          />
        </div>
      )}

      {isNesoi ? (
        <div id={`${projectId}-problem-image`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="cs-heading text-foreground">Framing</h2>
          <div data-case-bleed className="relative w-full overflow-hidden shadow-lg">
            <div className="absolute inset-0" aria-hidden>
              <Image
                src={NESOI_FRAMING.backgroundSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-black/15" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-8 p-4 sm:p-6 md:flex-row md:items-center md:justify-center md:gap-6 md:p-8 lg:gap-8 lg:p-10">
              <div
                data-cuelume-hover="tick"
                data-cuelume-press
                className="relative mx-auto w-full max-w-[720px] flex-[1.35] cursor-pointer overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                onClick={() => handleImageClick(NESOI_FRAMING.imageSrc)}
              >
                <Image
                  src={NESOI_FRAMING.imageSrc}
                  alt={NESOI_FRAMING.imageAlt}
                  width={1600}
                  height={1000}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 768px) 100vw, 65vw"
                  priority
                />
              </div>
              <div className="flex w-full max-w-[280px] shrink-0 flex-col items-center gap-3">
                <div
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  className="relative w-full overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                  onClick={() => handleImageClick(NESOI_FRAMING.gifSrc)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
                  <img
                    src={NESOI_FRAMING.gifSrc}
                    alt={NESOI_FRAMING.gifAlt}
                    className="block h-auto w-full object-cover"
                    decoding="async"
                  />
                </div>
                <p className="text-center text-sm font-medium tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
                  {NESOI_FRAMING.gifLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 lg:mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {NESOI_GALLERY_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="cs-body font-medium text-foreground">
                  {section.title}
                </h3>
                <p className="cs-body text-muted-foreground">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : project.problemImage ? (
        <div id={`${projectId}-problem-image`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="cs-heading text-foreground">
            {t('problemSnapshot')}
          </h2>
          {shouldStageCaseStudyMedia({ projectId, kind: 'problem-image' }) ? (
            <CaseStudyScreenStage
              seed={`${projectId}-problem-image`}
              alt={project.problemImage.alt || 'Problem snapshot'}
              frame="landscape"
              media={{ type: 'image', src: project.problemImage.src }}
              onClick={() => handleImageClick(project.problemImage!.src)}
            />
          ) : (
            <div className="relative w-full aspect-[16/9] overflow-hidden shadow-xl" data-case-bleed>
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
            <p className="cs-body text-muted-foreground">{project.problemImage.caption}</p>
          )}
        </div>
      ) : null}

      {project.takeStepBack && (
        <div className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('takeStepBack')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground">
              {project.takeStepBack}
            </p>
          </div>
        </div>
      )}

      {project.painPoints && project.painPoints.length > 0 && (
        <div id={`${projectId}-painpoints`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('painpoints')}</h2>
          <div className="lg:col-span-3">
            {project.painPointsIntro && (
              <p className="cs-body text-muted-foreground mb-8">{project.painPointsIntro}</p>
            )}
            <div className="space-y-4">
              {project.painPoints.map((pain, idx) => (
                <div key={idx} className="space-y-4 border border-border/50 rounded-xl bg-card/40 p-6">
                  <p className="cs-body font-medium text-foreground">{pain.title}</p>
                  <p className="cs-body text-muted-foreground">{pain.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HMW Section */}
      {project.hmw && !isNesoi && (
        <div id={`${projectId}-hmw`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('hmw')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body font-medium text-muted-foreground">
              {project.hmw}
            </p>
          </div>
        </div>
      )}

      {project.businessOpportunity && project.businessOpportunity.length > 0 && (
        <div id={`${projectId}-business`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('businessOpportunity')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.businessOpportunity.map((opportunity, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="cs-body text-muted-foreground">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.explorations && project.explorations.length > 0 && (
        <div id={`${projectId}-exploring`} className="mb-24 lg:mb-32">
          <h2 className="cs-heading text-foreground mb-8">{t('exploring')}</h2>
          <div className="space-y-12">
            {project.explorations.map((exploration, idx) => (
              <div key={idx} className="space-y-8">
                <p className="cs-label uppercase text-muted-foreground">{exploration.tag}</p>
                <h3 className="cs-body font-medium text-foreground">{exploration.title}</h3>
                <p className="cs-body text-muted-foreground">{exploration.problem}</p>
                <p className="cs-body font-semibold text-foreground">{t('solution')}</p>
                <p className="cs-body text-muted-foreground">{exploration.solution}</p>
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
                    <div className="w-full overflow-hidden shadow-xl" data-case-bleed>
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
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('targetAudience')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground">{project.targetAudience}</p>
          </div>
        </div>
      )}

      {project.targetAudienceImage && (
        <div id={`${projectId}-target-snapshot`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="cs-heading text-foreground">{t('targetSnapshot')}</h2>
          <div className="relative w-full aspect-[16/9] overflow-hidden shadow-xl" data-case-bleed>
            <Image
              src={project.targetAudienceImage.src}
              alt={project.targetAudienceImage.alt || 'Target audience snapshot'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </div>
          {project.targetAudienceImage.caption && (
            <p className="cs-body text-muted-foreground">{project.targetAudienceImage.caption}</p>
          )}
        </div>
      )}

      {/* Research Section */}
      {project.research && (
        <div id={`${projectId}-research`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('research')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground">
              {project.research}
            </p>
          </div>
        </div>
      )}

      {(() => {
        const projectWithPersonas = project as any;
        return projectWithPersonas.personas && Array.isArray(projectWithPersonas.personas) && projectWithPersonas.personas.length > 0 && (
          <div id={`${projectId}-personas`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            <h2 className="cs-heading text-foreground lg:col-span-2">{t('personas')}</h2>
            <div className="lg:col-span-3">
              <div className="grid gap-4 md:grid-cols-2">
                {projectWithPersonas.personas.map((persona: any, idx: number) => (
                  <div key={idx} className="space-y-4 border border-border/50 rounded-xl bg-card/40 p-6">
                    <div className="space-y-1">
                      <p className="cs-body font-medium text-foreground">{persona.name}</p>
                      <p className="cs-body text-muted-foreground">{persona.occupation}</p>
                    </div>
                    <p className="cs-body text-muted-foreground">{persona.goal}</p>
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
            const blocks = section.description.split('\n\n').filter(Boolean);

            if (isNesoi && section.id === 'decisions') {
              return (
                <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-12">
                    <h2 className="cs-heading text-foreground lg:col-span-2">
                      {section.title}
                    </h2>
                    <div className="space-y-8 lg:col-span-3">
                      {blocks.map((block, idx) => {
                        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
                        const decision = lines[0] ?? '';
                        const whyLine = lines.find((line) => /^why:/i.test(line));
                        const costLine = lines.find((line) => /^cost:/i.test(line));
                        const why = whyLine?.replace(/^why:\s*/i, '') ?? '';
                        const cost = costLine?.replace(/^cost:\s*/i, '') ?? '';
                        return (
                          <div key={idx} className="space-y-2 border-b border-border/40 pb-8 last:border-b-0 last:pb-0">
                            <p className="cs-body font-medium text-foreground">
                              {decision}
                            </p>
                            {why ? (
                              <p className="cs-body text-muted-foreground">
                                <span className="font-medium text-foreground/80">Why:</span> {why}
                              </p>
                            ) : null}
                            {cost ? (
                              <p className="cs-body text-muted-foreground">
                                <span className="font-medium text-foreground/80">Cost:</span> {cost}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            if (isNesoi && section.id === 'system-video' && section.video) {
              return (
                <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                  <SectionVideo
                    src={section.video}
                    poster={section.videoPoster}
                    label="System walkthrough video"
                    controls={section.videoControls !== false}
                  />
                </div>
              );
            }

            if (isNesoi && section.id === 'not-built') {
              return (
                <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-12">
                    <h2 className="cs-heading text-foreground lg:col-span-2">
                      {section.title}
                    </h2>
                    <ul className="space-y-5 lg:col-span-3">
                      {blocks.map((block, idx) => {
                        const [title, ...rest] = block.split('. ');
                        const body = rest.join('. ').trim();
                        return (
                          <li key={idx} className="cs-body text-muted-foreground">
                            <span className="font-medium text-foreground">{title}.</span>
                            {body ? ` ${body}` : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            }

            if (isNesoi && section.id === 'constraints') {
              return (
                <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                  <aside className="rounded-2xl border border-border/50 bg-secondary/35 px-5 py-6 sm:px-6 sm:py-7">
                    <h2 className="mb-5 cs-label uppercase text-muted-foreground">
                      {section.title}
                    </h2>
                    <ul className="space-y-4">
                      {blocks.map((block, idx) => (
                        <li key={idx} className="cs-body text-muted-foreground">
                          {block}
                        </li>
                      ))}
                    </ul>
                  </aside>
                </div>
              );
            }

            return (
              <div key={section.id} id={`${projectId}-${section.id}`} className="mb-24 lg:mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                  <h2 className="cs-heading text-foreground lg:col-span-2">
                    {section.title}
                  </h2>
                  <div className="lg:col-span-3 space-y-6">
                    {blocks.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className={
                          isNesoi && section.id === 'validation' && idx === 0
                            ? 'cs-body font-medium text-foreground'
                            : isNesoi && section.id === 'system' && idx === 0
                              ? 'cs-body font-medium text-foreground'
                              : 'cs-body text-muted-foreground'
                        }
                      >
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
                            data-cuelume-hover="tick"
                            data-cuelume-press
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
                                className="object-contain group-hover:opacity-90 transition-transform duration-300 shadow-lg"
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
                          controls: section.videoControls !== false,
                          autoPlay: isNesoi && section.id === 'prototype',
                        }}
                      />
                    ) : (
                      <SectionVideo
                        src={section.video}
                        poster={section.videoPoster}
                        label={`${section.title} walkthrough video`}
                        controls={section.videoControls !== false}
                      />
                    )}
                    <p className="cs-label uppercase text-muted-foreground">
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
                        data-cuelume-hover="tick"
                            data-cuelume-press
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
                            className="object-contain group-hover:opacity-90 transition-transform duration-300 shadow-lg"
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
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('someStats')}</h2>
          <div className="lg:col-span-3">
            {(() => {
              const projectWithImpact = project as any;
              return projectWithImpact.impactOverview && (
                <p className="cs-body text-muted-foreground mb-8">{projectWithImpact.impactOverview}</p>
              );
            })()}
            <div className="space-y-8">
              {project.results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="cs-body text-muted-foreground">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Features */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('keyFeatures')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <p className="cs-body text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.keyFeatureImage && (
        <div id={`${projectId}-feature-image`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="cs-heading text-foreground">{t('featureSnapshot')}</h2>
          <div className="relative w-full aspect-[16/9] overflow-hidden shadow-xl" data-case-bleed>
            <Image
              src={project.keyFeatureImage.src}
              alt={project.keyFeatureImage.alt || 'Key feature illustration'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </div>
          {project.keyFeatureImage.caption && (
            <p className="cs-body text-muted-foreground">{project.keyFeatureImage.caption}</p>
          )}
        </div>
      )}

      {/* Learnings */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="mt-24 lg:mt-32 mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('learnings')}</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-8">
                {project.learnings.map((learning, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <p className="cs-body text-muted-foreground">{learning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cs-body text-muted-foreground">{project.learnings}</p>
            )}
          </div>
        </div>
      )}

      {project.prototype && (
        <div id={`${projectId}-prototype`} className="mb-24 lg:mb-32 space-y-6">
          <h2 className="cs-heading text-foreground">{t('prototype')}</h2>
          <p className="cs-body text-muted-foreground">{project.prototype}</p>
          {project.prototypeFrame && (
            <div className="overflow-hidden shadow-xl bg-card/70" data-case-bleed>
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
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('impact')}</h2>
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {project.impact.map((impact, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <p className="cs-body text-muted-foreground">{impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
