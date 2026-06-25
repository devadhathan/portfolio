'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { useSiteContent } from '@/components/site-content-provider';
import { ProjectDetailView } from './project-detail-view';

interface ProjectsListViewProps {
  onBack: () => void;
  onProjectSelect: (projectId: string) => void;
  selectedProjectId?: string | null;
}

export function ProjectsListView({ onBack, onProjectSelect, selectedProjectId }: ProjectsListViewProps) {
  const { projects } = useSiteContent();

  const getProjectId = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="flex h-full w-full gap-6">
      {/* Sidebar - Projects List */}
      <div className="w-80 flex-shrink-0 border-r border-border/50 pr-6">
        <div className="sticky top-0 pt-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Projects</h2>
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {projects.map((project) => {
              const projectId = getProjectId(project.title);
              const isSelected = selectedProjectId === projectId;
              
              return (
                <button
                  key={projectId}
                  onClick={() => onProjectSelect(projectId)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 hover:bg-primary/15'
                      : 'border-border/50 bg-card/60 hover:border-primary/50 hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 text-foreground truncate">
                        {project.title}
                      </h3>
                      {project.type && (
                        <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium mb-2">
                          {project.type}
                        </span>
                      )}
                      {project.company && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {project.company}
                        </p>
                      )}
                      {project.period && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{project.period}</span>
                        </div>
                      )}
                    </div>
                    {project.url && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area - Project Details */}
      <div className="flex-1 min-w-0">
        {selectedProjectId ? (
          <div className="h-full overflow-y-auto">
            <ProjectDetailView 
              projectId={selectedProjectId} 
              onBack={() => onProjectSelect('')} 
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Select a Project</h3>
              <p className="text-muted-foreground">
                Choose a project from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

