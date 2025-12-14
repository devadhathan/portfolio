'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, ExternalLink, Rocket, ArrowLeft, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { ProjectDetailView } from '@/components/project-detail-view';
import { useRouter } from 'next/navigation';

export default function WorkPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const projects = resumeData.projects.filter(project => project.title !== 'Sustainable Kiosk');

  const getProjectId = (title: string): string => {
    return title.toLowerCase().trim().replace(/\s+/g, '-');
  };
  
  const normalizeProjectId = (id: string): string => {
    return id.toLowerCase().trim().replace(/\s+/g, '-');
  };

  return (
    <div className="min-h-screen bg-card">
      <TopBar onHomeClick={() => router.push('/')} />
      <div className="pt-14 pb-24 px-24 md:px-6 lg:px-8 overflow-visible">
        {selectedProject ? (
          <div className="flex gap-6 max-w-[1600px] mx-auto relative">
            {/* Sidebar - Projects List (Collapsible on Hover) */}
            <div className="group relative flex-shrink-0 w-32 hover:w-56 transition-all duration-500 ease-in-out">
              {/* Collapsed state - horizontal tab */}
              <div className="fixed left-4 top-20 w-auto min-w-[200px] h-auto min-h-[40px] bg-card border border-border/50 rounded-lg group-hover:opacity-0 group-hover:pointer-events-none transition-all duration-500 ease-in-out flex items-center px-4 py-2 shadow-lg z-50">
                <Button 
                  onClick={() => setSelectedProject(null)} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 mr-2"
                  title="Back to Projects"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  Back
                </span>
              </div>
              
              {/* Expanded content */}
              <div className="fixed left-0 top-0 w-56 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-500 ease-in-out border-r border-border/50 pr-4 bg-card min-h-screen z-40">
                <div className="pt-20">
                  <div className="sticky top-20 z-50 bg-card pb-4 px-4 border-b border-border/50">
                    <Button 
                      onClick={() => setSelectedProject(null)} 
                      variant="ghost" 
                      size="sm" 
                      className="mb-6"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="text-lg font-bold mb-4 text-foreground">Projects</h2>
                  </div>
                  <div className="px-4 pt-4">
                    <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {projects.map((project) => {
                        const projectId = getProjectId(project.title);
                        const normalizedSelected = selectedProject ? normalizeProjectId(selectedProject) : null;
                        const isSelected = normalizedSelected === projectId;
                        const isExpanded = expandedProjects.has(projectId);
                        
                        // Get available sections for this project
                        const sections = [];
                        if (project.problem) sections.push({ id: 'problem', name: 'Problem' });
                        if (project.research) sections.push({ id: 'research', name: 'Research' });
                        if (project.approach) sections.push({ id: 'approach', name: 'Approach' });
                        if (project.hmw) sections.push({ id: 'hmw', name: 'How Might We' });
                        // Check for Finshots-specific sections
                        if (project.title.toLowerCase().includes('finshots')) {
                          sections.push({ id: 'possible-solutions', name: 'Possible solutions' });
                          if (project.results && project.results.length > 0) sections.push({ id: 'stats', name: 'What was the result' });
                        } else {
                          if (project.results && project.results.length > 0) sections.push({ id: 'stats', name: 'Some stats' });
                        }
                        if (project.keyFeatures && project.keyFeatures.length > 0) sections.push({ id: 'key-features', name: 'Key Features' });
                        if (project.impact && project.impact.length > 0) sections.push({ id: 'impact', name: 'Impact' });
                        if (project.learnings) sections.push({ id: 'learnings', name: 'Learnings' });
                        if (project.targetAudience) sections.push({ id: 'target-audience', name: 'Target Audience' });
                        
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
            </div>

            {/* Main Content - Project Details */}
            <div className="flex-1 min-w-0">
              <ProjectDetailView 
                projectId={selectedProject} 
                onBack={() => setSelectedProject(null)}
                hideBackButton={true}
              />
            </div>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Work</h1>
            <p className="text-muted-foreground">My projects</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Project Cards */}
            {projects.map((project, index) => {
                const projectId = getProjectId(project.title);
              return (
                <Card 
                  key={index}
                  className="col-span-1 rounded-2xl border-2 border-border/70 bg-card/60 backdrop-blur-md cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setSelectedProject(projectId)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-[16px]">
                      <div className="p-1.5 bg-primary/20 rounded-full">
                        <Code2 className="h-4 w-4" />
                      </div>
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      {project.type && (
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {project.type}
                        </span>
                      )}
                      {(project.company || project.institution) && (
                        <span>• {project.company || project.institution}</span>
                      )}
                      {project.period && <span>• {project.period}</span>}
                    </div>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {project.description || project.problem || 'Project details'}
                    </p>
                    {(project.links && project.links.length > 0) || project.url ? (
                      <div className="space-y-2">
                        {project.links && project.links.length > 0 ? (
                          project.links.slice(0, 2).map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all border border-border/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Rocket className="h-4 w-4 text-primary flex-shrink-0" />
                              <div className="flex flex-col flex-1">
                                <span className="text-[14px] font-medium">{link.label}</span>
                                <span className="text-[14px] text-muted-foreground text-xs">{link.url}</span>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                          ))
                        ) : project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all border border-border/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Rocket className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                              <span className="text-[14px] font-medium">View Project</span>
                              <span className="text-[14px] text-muted-foreground text-xs">{project.url}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}


