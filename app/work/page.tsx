'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { ProjectDetailView } from '@/components/project-detail-view';
import { useRouter } from 'next/navigation';

type Project = (typeof resumeData.projects)[number];

const getProjectThumbnail = (project: Project): string => {
  const title = project.title.toLowerCase();

  if (title.includes('finshots')) {
    return '/finshots/image.png';
  }

  if (title.includes('nesoi')) {
    return '/svg/Group 29.png';
  }

  if (title.includes('falcon')) {
    return '/falcon design system/image.png';
  }

  if (title.includes('onboarding')) {
    return '/ditto insurance/image.png';
  }

  if (title.includes('crm')) {
    return '/CRM/image.png';
  }

  return '/photos/image.png';
};

const getProjectSummary = (project: Project): string => {
  if (project.cardSubtext) {
    return project.cardSubtext;
  }

  const base = project.description || project.problem || '';
  const words = base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);

  if (words.length === 0) {
    return 'View case study';
  }

  return words.join(' ');
};

export default function WorkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const projects = resumeData.projects.filter(project => project.title !== 'Sustainable Kiosk' && project.title !== 'Booking Portal Redesign');

  const getProjectId = (title: string): string => {
    return title.toLowerCase().trim().replace(/\s+/g, '-');
  };
  
  const normalizeProjectId = (id: string): string => {
    return id.toLowerCase().trim().replace(/\s+/g, '-');
  };

  // Handle URL parameter to open specific project
  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam) {
      const normalizedParam = normalizeProjectId(projectParam);
      const matchingProject = projects.find(project => {
        const projectId = getProjectId(project.title);
        return normalizeProjectId(projectId) === normalizedParam;
      });
      
      if (matchingProject) {
        const projectId = getProjectId(matchingProject.title);
        setSelectedProject(projectId);
        router.replace('/work', { scroll: false });
      }
    }
  }, [searchParams, router, projects]);

  return (
    <div className="min-h-screen bg-card">
      <TopBar onHomeClick={() => router.push('/')} onProjectSelect={setSelectedProject} />
      <div className="pt-14 pb-24 px-4 md:px-6 lg:px-8 overflow-visible">
        {selectedProject ? (
          <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto relative">
            {/* Sidebar - Projects List (Fixed) - Hidden on mobile */}
            <div
              className={`lg:fixed lg:left-8 lg:top-0 lg:w-64 lg:pr-4 w-full pr-0 bg-card h-auto z-40 hidden lg:block`}
            >
              <div className="pt-20">
                <div className="sticky top-20 z-50 bg-card border border-border/50 rounded-lg p-4 pt-6">
                    <Button 
                      onClick={() => {
                        setSelectedProject(null);
                      }} 
                    variant="ghost" 
                    size="sm" 
                    className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h2 className="text-sm font-bold mb-4 text-foreground">Projects</h2>
                  <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {projects.map((project) => {
                        const projectId = getProjectId(project.title);
                        const normalizedSelected = selectedProject ? normalizeProjectId(selectedProject) : null;
                        const isSelected = normalizedSelected === projectId;
                        const isExpanded = expandedProjects.has(projectId);
                        
                        // Get available sections for this project
                        const sections = [];
                        if (project.designGallery && project.designGallery.length > 0) sections.push({ id: 'design', name: 'Design gallery' });
                        if (project.problem) sections.push({ id: 'problem', name: 'Problem' });
                        if (project.targetAudience) sections.push({ id: 'target-audience', name: 'Target Audience' });
                        if (project.detailSections && project.detailSections.length > 0) {
                          project.detailSections.forEach((section) => {
                            sections.push({ id: section.id, name: section.title });
                          });
                        }
                        if (project.research) sections.push({ id: 'research', name: 'Research' });
                        if (project.explorations && project.explorations.length > 0) sections.push({ id: 'exploring', name: 'Exploring possibilities' });
                        if (project.prototype) sections.push({ id: 'prototype', name: 'Prototype' });
                        if (project.hmw) sections.push({ id: 'hmw', name: 'How Might We' });
                        if (project.title.toLowerCase().includes('finshots')) {
                          sections.push({ id: 'possible-solutions', name: 'Possible solutions' });
                          if (project.results && project.results.length > 0) sections.push({ id: 'stats', name: 'What was the result' });
                        } else {
                          if (project.results && project.results.length > 0) sections.push({ id: 'stats', name: 'Some stats' });
                        }
                        if (project.keyFeatures && project.keyFeatures.length > 0) sections.push({ id: 'key-features', name: 'Key Features' });
                        if (project.businessOpportunity && project.businessOpportunity.length > 0) sections.push({ id: 'business', name: 'Business opportunity' });
                        if (project.learnings) sections.push({ id: 'learnings', name: 'Learnings' });
                        if (project.impact && project.impact.length > 0) sections.push({ id: 'impact', name: 'Impact' });
                        
                        const handleSectionClick = (sectionId: string) => {
                          const element = document.getElementById(`${projectId}-${sectionId}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        };
                        
                        return (
                          <div key={projectId} className="space-y-1">
                            <button
                              onClick={() => {
                                setSelectedProject(projectId);
                                if (sections.length > 0) {
                                  setExpandedProjects(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(projectId)) {
                                      newSet.delete(projectId);
                                    } else {
                                      newSet.add(projectId);
                                    }
                                    return newSet;
                                  });
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'hover:bg-card/80 text-foreground'
                              }`}
                            >
                              <span className="text-sm">{project.title}</span>
                              {sections.length > 0 && (
                                <span className="ml-2">
                                  {isExpanded ? (
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

            {/* Main Content - Project Details */}
            <div className="flex-1 min-w-0 lg:ml-72 ml-0">
              <ProjectDetailView 
                projectId={selectedProject} 
                onBack={() => setSelectedProject(null)}
                hideBackButton={true}
              />
            </div>
          </div>
        ) : (
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Work</h1>
            <p className="text-muted-foreground">My projects</p>
          </div>
          
          {/* Grid for project cards - 3 columns layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 auto-rows-[minmax(260px,auto)] w-full">
            {/* Separate Finshots from other projects */}
            {(() => {
              const finshotsProject = projects.find(p => p.title.toLowerCase().includes('finshots'));
              const otherProjects = projects.filter(p => !p.title.toLowerCase().includes('finshots'));
              
              return (
                <>
                  {/* Column 1 & 2: Other projects (first 2 in col 1, next 2 in col 2) */}
                  {otherProjects.slice(0, 4).map((project, index) => {
                    const projectId = getProjectId(project.title);
                    return (
                      <Card 
                        key={`other-${index}`}
                        className="col-span-1 rounded-2xl border-2 border-border/70 bg-[#171717] text-white cursor-pointer hover:border-primary/60 transition-all group overflow-hidden h-full flex flex-col"
                        onClick={() => setSelectedProject(projectId)}
                      >
                        <div className="flex flex-col h-full">
                          {/* Thumbnail - reduced size */}
                          <div className="relative w-full h-64 md:h-72 lg:h-80 bg-secondary/30 border-b border-border/40 overflow-hidden flex-shrink-0">
                            <Image
                              src={getProjectThumbnail(project)}
                              alt={project.title}
                              fill
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
                  
                  {/* Column 3: Finshots (spans 2 rows) */}
                  {finshotsProject && (() => {
                    const projectId = getProjectId(finshotsProject.title);
                    return (
                      <Card 
                        key="finshots"
                        className="col-span-1 lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-2 rounded-2xl border-2 border-border/70 bg-[#171717] text-white cursor-pointer hover:border-primary/60 transition-all group overflow-hidden h-full flex flex-col"
                        onClick={() => setSelectedProject(projectId)}
                      >
                        <div className="flex flex-col h-full">
                          {/* Thumbnail - larger for 2-row span */}
                          <div className="relative w-full h-96 md:h-112 lg:h-[700px] bg-secondary/30 border-b border-border/40 overflow-hidden flex-shrink-0">
                            <Image
                              src={getProjectThumbnail(finshotsProject)}
                              alt={finshotsProject.title}
                              fill
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
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
