'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import type { Project } from '@/lib/types/project';
import { getProjectId, normalizeProjectSlug } from '@/lib/types/project';

const ProjectDetailView = dynamic(
  () => import('@/components/project-detail-view').then(mod => ({ default: mod.ProjectDetailView })),
  {
    ssr: false,
    loading: () => <ProjectDetailLoading />,
  }
);

function ProjectDetailLoading() {
  const t = useTranslations('work');
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-muted-foreground">{t('loadingProject')}</div>
    </div>
  );
}

const getProjectThumbnail = (project: Project): string => {
  const title = project.title.toLowerCase();

  if (title.includes('finshots')) return '/finshots/image.png';
  if (title.includes('nesoi')) return '/svg/Group 29.png';
  if (title.includes('falcon')) return '/falcon design system/image.png';
  if (title.includes('onboarding')) return '/ditto insurance/image.png';
  if (title.includes('crm')) return '/CRM/image.png';

  return '/photos/image.png';
};

function WorkPageContent({ projects }: { projects: Project[] }) {
  const t = useTranslations('work');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const getProjectSummary = (project: Project): string => {
    if (project.cardSubtext) return project.cardSubtext;

    const base = project.description || project.problem || '';
    const words = base.split(/\s+/).filter(Boolean).slice(0, 3);

    return words.length === 0 ? t('viewCaseStudy') : words.join(' ');
  };

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  useRegisterNavActions({
    onHomeClick: handleHomeClick,
    onProjectSelect: setSelectedProject,
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
        setExpandedProjects(new Set([id]));
        router.replace('/work', { scroll: false });
      }
    }
  }, [searchParams, router, projects]);

  // Keep the open accordion in sync with the selected case study.
  useEffect(() => {
    if (!selectedProject) {
      setExpandedProjects(new Set());
      return;
    }
    setExpandedProjects(new Set([selectedProject]));
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="flex pt-14 relative z-10">
        <div className="flex-1 py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8 overflow-x-hidden">
          {selectedProject ? (
            <div className="px-4 md:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto relative">
            <div className="lg:fixed lg:left-8 lg:top-0 lg:w-64 lg:pr-4 w-full pr-0 h-auto z-40 hidden lg:block">
              <div className="pt-20">
                <div className="sticky top-20 z-50 p-4 pt-6">
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
                  <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {projects.map((project) => {
                      const projectId = getProjectId(project.title);
                      const normalizedSelected = selectedProject ? normalizeProjectSlug(selectedProject) : null;
                      const isSelected = normalizedSelected === projectId;
                      const isExpanded = expandedProjects.has(projectId);

                      const sections: { id: string; name: string }[] = [];
                      if (
                        project.designGallery?.length ||
                        project.title.toLowerCase().includes('nesoi') ||
                        project.title.toLowerCase().includes('falcon')
                      ) {
                        sections.push({ id: 'design', name: t('sections.designGallery') });
                      }
                      if (project.problem) sections.push({ id: 'problem', name: t('sections.problem') });
                      if (project.targetAudience) sections.push({ id: 'targetAudience', name: t('sections.targetAudience') });
                      project.detailSections?.forEach((section) => {
                        sections.push({ id: section.id, name: section.title });
                      });
                      if (project.research) sections.push({ id: 'research', name: t('sections.research') });
                      if (project.explorations?.length) sections.push({ id: 'exploring', name: t('sections.exploring') });
                      if (project.prototype) sections.push({ id: 'prototype', name: t('sections.prototype') });
                      if (project.hmw) sections.push({ id: 'hmw', name: t('sections.hmw') });
                      if (project.title.toLowerCase().includes('finshots')) {
                        sections.push({ id: 'possible-solutions', name: t('sections.possibleSolutions') });
                        if (project.results?.length) sections.push({ id: 'stats', name: t('sections.result') });
                      } else if (project.results?.length) {
                        sections.push({ id: 'stats', name: t('sections.stats') });
                      }
                      if (project.keyFeatures?.length) sections.push({ id: 'key-features', name: t('sections.keyFeatures') });
                      if (project.businessOpportunity?.length) sections.push({ id: 'business', name: t('sections.business') });
                      if (project.learnings) sections.push({ id: 'learnings', name: t('sections.learnings') });
                      if (project.impact?.length) sections.push({ id: 'impact', name: t('sections.impact') });

                      const handleSectionClick = (sectionId: string) => {
                        const element = document.getElementById(`${projectId}-${sectionId}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      };

                      return (
                        <div key={projectId} className="space-y-1">
                          <button
                            data-cuelume-hover="tick"
                            data-cuelume-press
                            data-cuelume-release
                            onClick={() => {
                              if (isSelected) {
                                setExpandedProjects((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(projectId)) next.delete(projectId);
                                  else next.add(projectId);
                                  return next;
                                });
                                return;
                              }
                              setSelectedProject(projectId);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'hover:bg-card/80 text-foreground'
                            }`}
                          >
                            <span className="text-sm">{project.title}</span>
                            {sections.length > 0 && (
                              <span className="ml-2 shrink-0">
                                {isSelected && isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </button>
                          {isExpanded && isSelected && sections.length > 0 && (
                            <div className="ml-4 space-y-1 border-l border-border/50 pl-3">
                              {sections.map((section) => (
                                <button
                                  key={section.id}
                                  data-cuelume-hover="tick"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSectionClick(section.id);
                                  }}
                                  className="w-full text-left p-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
                                >
                                  {section.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 lg:ml-72 ml-0">
              <div className="lg:hidden mb-4">
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
              <ProjectDetailView
                projectId={selectedProject}
                projects={projects}
                onBack={() => setSelectedProject(null)}
                hideBackButton={true}
              />
            </div>
          </div>
            </div>
        ) : (
          <div className="max-w-[1500px] mx-auto">
            <div className="mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]">
            <div className="mb-8 md:mb-10 text-left pt-8 md:pt-10 lg:pt-14">
              <h1 className="max-w-4xl whitespace-pre-line text-balance text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-light text-foreground tracking-tight leading-[1.1] mb-8 md:mb-10 lg:mb-12">
                {t('heroLine')}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-5 auto-rows-[minmax(260px,auto)] w-full pb-4 md:pb-0">
              {(() => {
                const finshotsProject = projects.find((p) => p.title.toLowerCase().includes('finshots'));
                const otherProjects = projects.filter((p) => !p.title.toLowerCase().includes('finshots'));

                return (
                  <>
                    {otherProjects.slice(0, 4).map((project, index) => {
                      const projectId = getProjectId(project.title);
                      return (
                        <Card
                          key={`other-${index}`}
                          data-cuelume-hover="tick"
                          data-cuelume-press
                          data-cuelume-release
                          className="col-span-1 rounded-2xl border border-border/55 bg-card text-foreground cursor-pointer hover:border-border/80 transition-all group overflow-hidden h-full flex flex-col dark:border-border/40"
                          onClick={() => setSelectedProject(projectId)}
                        >
                          <div className="flex flex-col h-full">
                            <div className="relative w-full h-64 md:h-72 lg:h-80 bg-secondary/30 border-b border-border/40 overflow-hidden flex-shrink-0">
                              <Image
                                src={getProjectThumbnail(project)}
                                alt={project.title}
                                fill
                                loading="lazy"
                                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
                              <CardTitle className="text-[16px] md:text-[17px]">
                                <span className="line-clamp-1">{project.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 px-4 pb-4 pt-0 flex-1 justify-between">
                              <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-[12px] text-muted-foreground">
                                {project.type && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] md:text-[12px]">
                                    {project.type}
                                  </span>
                                )}
                                {(project.company || project.institution) && (
                                  <span className="truncate text-[11px] md:text-[12px]">
                                    {project.company || project.institution}
                                  </span>
                                )}
                              </div>
                              <p className="text-[13px] md:text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                                {getProjectSummary(project)}
                              </p>
                            </CardContent>
                          </div>
                        </Card>
                      );
                    })}

                    {finshotsProject && (
                      <Card
                        key="finshots"
                        data-cuelume-hover="tick"
                        data-cuelume-press
                        data-cuelume-release
                        className="col-span-1 lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-2 rounded-2xl border border-border/55 bg-card text-foreground cursor-pointer hover:border-border/80 transition-all group overflow-hidden h-full flex flex-col dark:border-border/40"
                        onClick={() => setSelectedProject(getProjectId(finshotsProject.title))}
                      >
                        <div className="flex flex-col h-full">
                          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[700px] bg-secondary/30 border-b border-border/40 overflow-hidden flex-shrink-0">
                            <Image
                              src={getProjectThumbnail(finshotsProject)}
                              alt={finshotsProject.title}
                              fill
                              loading="lazy"
                              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
                            <CardTitle className="text-[16px] md:text-[17px]">
                              <span className="line-clamp-1">{finshotsProject.title}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-2 px-4 pb-4 pt-0 flex-1 justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-[12px] text-muted-foreground">
                              {finshotsProject.type && (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] md:text-[12px]">
                                  {finshotsProject.type}
                                </span>
                              )}
                              {(finshotsProject.company || finshotsProject.institution) && (
                                <span className="truncate text-[11px] md:text-[12px]">
                                  {finshotsProject.company || finshotsProject.institution}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] md:text-[14px] text-muted-foreground leading-relaxed line-clamp-3">
                              {getProjectSummary(finshotsProject)}
                            </p>
                          </CardContent>
                        </div>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function WorkPageFallback() {
  const t = useTranslations('work');
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
