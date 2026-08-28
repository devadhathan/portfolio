'use client';

import { useState, useEffect, useCallback, Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import type { Project } from '@/lib/types/project';
import { getProjectId, normalizeProjectSlug } from '@/lib/types/project';
import { blurFadeUp, defaultTransition, easeOutExpo, fadeSlideUp, overlayFade } from '@/lib/motion';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { LinedPageFrame } from '@/components/lined-page-frame';
import { useOsWindowAutoExpand, useOsWindowClose } from '@/components/desktop-os/os-window-scope';
import { useCaseStudyTracking } from '@/hooks/use-case-study-tracking';
import { useCaseStudyDocumentTitle } from '@/hooks/use-case-study-document-title';
import { buildCaseStudySections } from '@/lib/case-study-sections';
import { CaseStudyOnPageNav } from '@/components/case-study-on-page-nav';
import { useCardHoverGlow } from '@/components/card-hover-glow';

/** Work grid card — dim resting border, cursor spotlight highlights only the hovered edge. */
function WorkProjectCard({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  const { glow, glowHandlers } = useCardHoverGlow();

  return (
    <Card
      data-cuelume-hover="tick"
      data-cuelume-press
      data-cuelume-release
      {...glowHandlers}
      className="relative rounded-xl border border-border/35 bg-transparent text-foreground cursor-pointer group overflow-hidden h-full flex flex-col dark:border-white/[0.18]"
      onClick={onClick}
    >
      {glow}
      {children}
    </Card>
  );
}

const ProjectDetailView = dynamic(
  () => import('@/components/project-detail-view').then(mod => ({ default: mod.ProjectDetailView })),
  { ssr: false },
);

const getProjectThumbnail = (project: Project): string => {
  const title = project.title.toLowerCase();

  if (title.includes('finshots')) return '/finshots/image.webp';
  if (title.includes('nesoi')) return '/svg/Group 29.webp';
  if (title.includes('falcon')) return '/falcon design system/image.webp';
  if (title.includes('onboarding')) return '/ditto insurance/image.webp';
  if (title.includes('crm')) return '/CRM/image.webp';

  return '/photos/image.webp';
};

function WorkPageContent({ projects }: { projects: Project[] }) {
  const t = useTranslations('work');
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const desktopOs = useDesktopOsOptional();
  const embedded = Boolean(desktopOs?.enabled);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getProjectSummary = (project: Project): string => {
    if (project.cardSubtext) return project.cardSubtext;

    const base = project.description || project.problem || '';
    const words = base.split(/\s+/).filter(Boolean).slice(0, 3);

    return words.length === 0 ? t('viewCaseStudy') : words.join(' ');
  };

  const handleHomeClick = useCallback(() => {
    if (desktopOs?.enabled) {
      desktopOs.openWindow('home');
      return;
    }
    router.push('/');
  }, [router, desktopOs]);

  useRegisterNavActions({
    onHomeClick: handleHomeClick,
    onProjectSelect: setSelectedProject,
    selectedProjectId: selectedProject,
  });

  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam) {
      const normalizedParam = normalizeProjectSlug(projectParam);
      const matchingProject = projects.find(
        (project) => getProjectId(project.title) === normalizedParam,
      );

      if (matchingProject) {
        const id = getProjectId(matchingProject.title);
        setSelectedProject(id);
        router.replace('/work', { scroll: false });
      }
    }
  }, [searchParams, router, projects]);

  const activeProject = selectedProject
    ? projects.find((project) => getProjectId(project.title) === normalizeProjectSlug(selectedProject))
    : undefined;
  const activeSections = activeProject
    ? buildCaseStudySections(activeProject, {
        designGallery: t('sections.designGallery'),
        problem: t('sections.problem'),
        targetAudience: t('sections.targetAudience'),
        research: t('sections.research'),
        exploring: t('sections.exploring'),
        prototype: t('sections.prototype'),
        hmw: t('sections.hmw'),
        possibleSolutions: t('sections.possibleSolutions'),
        result: t('sections.result'),
        stats: t('sections.stats'),
        keyFeatures: t('sections.keyFeatures'),
        business: t('sections.business'),
        learnings: t('sections.learnings'),
        impact: t('sections.impact'),
      })
    : [];

  // Case studies want the full desktop — cover while one is open, restore on back.
  useOsWindowAutoExpand(Boolean(selectedProject));

  // Case studies have no URL, so pageviews cannot see them.
  useCaseStudyTracking(selectedProject, 'work');
  useCaseStudyDocumentTitle(selectedProject, projects);

  // Closing the window drops the case study, so reopening Work lands on the grid.
  useOsWindowClose(useCallback(() => setSelectedProject(null), []));

  return (
    <div
      className={
        embedded
          ? selectedProject
            ? 'os-work-shell flex h-full min-h-0 flex-col overflow-hidden bg-transparent'
            : 'os-work-shell min-h-0 bg-transparent'
          : 'min-h-screen overflow-x-hidden bg-background lg:min-h-0 lg:bg-transparent'
      }
    >
      <div
        className={
          embedded
            ? 'relative z-10 flex min-h-0 flex-1 flex-col pt-0'
            : 'relative z-10 flex pt-14 lg:pt-0'
        }
      >
        <div
          className={`flex-1 min-w-0 min-h-0 ${
            embedded
              ? selectedProject
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden pt-3 pb-3'
                : 'flex flex-col pt-6 pb-6'
              : 'overflow-x-hidden pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-10 lg:pb-8'
          }`}
        >
          <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key={`work-case-${selectedProject}`}
              className={
                embedded
                  ? 'flex h-full min-h-0 w-full max-w-none flex-col px-0'
                  : 'w-full max-w-none px-0'
              }
              initial={
                reduceMotion ? false : embedded ? overlayFade.initial : fadeSlideUp.initial
              }
              animate={embedded ? overlayFade.animate : fadeSlideUp.animate}
              exit={
                reduceMotion ? undefined : embedded ? overlayFade.exit : fadeSlideUp.exit
              }
              transition={defaultTransition}
              data-os-work-case={embedded ? 'true' : undefined}
            >
              <div
                className={
                  embedded
                    ? 'os-work-case-row relative h-full min-h-0 w-full'
                    : 'work-case-row relative w-full max-w-none'
                }
              >
            <aside
              className={
                embedded
                  ? 'os-work-sidebar z-40 min-h-0 shrink-0'
                  : 'work-case-sidebar z-40 hidden shrink-0 lg:block'
              }
            >
              <div className="os-work-sidebar-inner pl-1 pr-2 pb-4 pt-8 sm:pl-1.5">
                  <Button
                    onClick={() => setSelectedProject(null)}
                    variant="ghost"
                    size="sm"
                    className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                  </Button>
                  <h2 className="text-sm font-bold mb-4 text-foreground">{t('projects')}</h2>
                  <nav className="space-y-0.5" aria-label={t('projects')}>
                    {projects.map((project) => {
                      const projectId = getProjectId(project.title);
                      const normalizedSelected = selectedProject ? normalizeProjectSlug(selectedProject) : null;
                      const isSelected = normalizedSelected === projectId;

                      return (
                        <button
                          key={projectId}
                          type="button"
                          data-cuelume-hover="tick"
                          data-cuelume-press
                          onClick={() => setSelectedProject(projectId)}
                          className={`w-full text-left rounded-md px-2.5 py-2 text-sm transition-colors ${
                            isSelected
                              ? 'bg-secondary/80 font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                          }`}
                        >
                          {project.title}
                        </button>
                      );
                    })}
                  </nav>
              </div>
            </aside>

            <div
              className={
                embedded
                  ? 'os-work-case-main flex min-h-0 min-w-0 flex-col'
                  : 'work-case-main min-w-0'
              }
            >
              <div
                className={
                  embedded
                    ? 'os-work-case-inner flex h-full min-h-0 w-full min-w-0 flex-col'
                    : 'work-case-inner w-full min-w-0'
                }
              >
              <div
                className={
                  embedded
                    ? 'os-case-back os-work-mobile-back z-50 mb-4 shrink-0 px-3 py-2.5 sm:px-0'
                    : 'lg:hidden mb-4'
                }
              >
                <Button
                  onClick={() => setSelectedProject(null)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
              </div>
              <div
                className={
                  embedded
                    ? 'os-case-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain'
                    : undefined
                }
              >
                <ProjectDetailView
                  projectId={selectedProject}
                  projects={projects}
                  onBack={() => setSelectedProject(null)}
                  hideBackButton={true}
                  layout="work-rail"
                />
              </div>
              </div>
            </div>

            <aside
              className={
                embedded
                  ? 'os-work-case-toc z-30 min-h-0 shrink-0'
                  : 'work-case-toc z-30 hidden shrink-0 lg:block'
              }
              aria-label={t('onThisPage')}
            >
              <CaseStudyOnPageNav
                label={t('onThisPage')}
                projectId={selectedProject}
                sections={activeSections}
              />
            </aside>
            </div>
            </motion.div>
        ) : (
          <motion.div
            key="work-grid"
            className={
              embedded
                ? 'flex min-h-0 flex-1 flex-col'
                : 'max-w-[1500px] mx-auto'
            }
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={defaultTransition}
          >
            <div
              className={
                embedded
                  ? 'os-work-grid home-col mx-auto flex w-full min-h-0 min-w-0 flex-1 flex-col'
                  : 'mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]'
              }
            >
            <LinedPageFrame
              title={t('heroLine')}
              className={embedded ? 'mb-0 w-full' : undefined}
            >
            <div
              className={
                embedded
                  ? 'os-work-grid__cards min-h-0 w-full pb-1'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-5 auto-rows-[minmax(220px,auto)] w-full pb-4 md:pb-0'
              }
            >
              {(() => {
                const finshotsProject = projects.find((p) => p.title.toLowerCase().includes('finshots'));
                const otherProjects = projects.filter((p) => !p.title.toLowerCase().includes('finshots'));

                return (
                  <>
                    {otherProjects.slice(0, 4).map((project, index) => {
                      const projectId = getProjectId(project.title);
                      return (
                        <motion.div
                          key={`other-${index}`}
                          className="col-span-1 h-full min-h-0"
                          initial={reduceMotion ? false : blurFadeUp.initial}
                          animate={blurFadeUp.animate}
                          transition={{
                            duration: 0.55,
                            delay: Math.min(index, 10) * 0.06,
                            ease: easeOutExpo,
                          }}
                        >
                          <WorkProjectCard onClick={() => setSelectedProject(projectId)}>
                            <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
                              <div
                                className={
                                  embedded
                                    ? 'os-work-card__media relative min-h-0 w-full flex-1 overflow-hidden border-b border-border/35 bg-transparent dark:border-white/[0.18]'
                                    : 'relative w-full h-52 md:h-60 lg:h-64 bg-transparent border-b border-border/35 dark:border-white/[0.18] overflow-hidden flex-shrink-0'
                                }
                              >
                                <Image
                                  src={getProjectThumbnail(project)}
                                  alt={project.title}
                                  fill
                                  loading="lazy"
                                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                              <CardHeader className="shrink-0 space-y-0 px-3 pb-1.5 pt-2.5">
                                <CardTitle className="text-[14px] md:text-[15px]">
                                  <span className="line-clamp-1">{project.title}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="flex flex-none flex-col gap-1.5 px-3 pb-3 pt-0">
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-[11px] text-muted-foreground">
                                  {project.type && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-[11px]">
                                      {project.type}
                                    </span>
                                  )}
                                  {(project.company || project.institution) && (
                                    <span className="truncate text-[10px] md:text-[11px]">
                                      {project.company || project.institution}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                                  {getProjectSummary(project)}
                                </p>
                              </CardContent>
                            </div>
                          </WorkProjectCard>
                        </motion.div>
                      );
                    })}

                    {finshotsProject && (
                      <motion.div
                        key="finshots"
                        className={
                          embedded
                            ? 'os-work-card--tall h-full min-h-0'
                            : 'col-span-1 h-full min-h-0 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1'
                        }
                        initial={reduceMotion ? false : blurFadeUp.initial}
                        animate={blurFadeUp.animate}
                        transition={{
                          duration: 0.55,
                          delay: 0.06,
                          ease: easeOutExpo,
                        }}
                      >
                        <WorkProjectCard
                          onClick={() => setSelectedProject(getProjectId(finshotsProject.title))}
                        >
                          <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
                            <div
                              className={
                                embedded
                                  ? 'os-work-card__media os-work-card__media--tall relative min-h-0 w-full flex-1 overflow-hidden border-b border-border/35 bg-transparent dark:border-white/[0.18]'
                                  : 'relative w-full h-52 sm:h-64 md:h-80 lg:h-[28rem] bg-transparent border-b border-border/35 dark:border-white/[0.18] overflow-hidden flex-shrink-0'
                              }
                            >
                              <Image
                                src={getProjectThumbnail(finshotsProject)}
                                alt={finshotsProject.title}
                                fill
                                loading="lazy"
                                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <CardHeader className="relative z-[1] shrink-0 space-y-0 bg-transparent px-3 pb-1.5 pt-2.5">
                              <CardTitle className="text-[14px] md:text-[15px]">
                                <span className="line-clamp-1">{finshotsProject.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-[1] flex flex-none flex-col gap-1.5 bg-transparent px-3 pb-3 pt-0">
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-[11px] text-muted-foreground">
                                {finshotsProject.type && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-[11px]">
                                    {finshotsProject.type}
                                  </span>
                                )}
                                {(finshotsProject.company || finshotsProject.institution) && (
                                  <span className="truncate text-[10px] md:text-[11px]">
                                    {finshotsProject.company || finshotsProject.institution}
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                                {getProjectSummary(finshotsProject)}
                              </p>
                            </CardContent>
                          </div>
                        </WorkProjectCard>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </div>
            </LinedPageFrame>
            </div>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function WorkPageFallback() {
  const t = useTranslations('work');
  return (
    <div className="flex min-h-screen items-center justify-center bg-background lg:min-h-[50vh] lg:bg-transparent">
      <div className="animate-pulse text-muted-foreground">{t('loading')}</div>
    </div>
  );
}

export default function WorkPageClient({ projects }: { projects: Project[] }) {
  return (
    <Suspense fallback={<WorkPageFallback />}>
      <WorkPageContent projects={projects} />
    </Suspense>
  );
}
