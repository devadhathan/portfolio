'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users, Wrench, ExternalLink } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailView({ projectId, onBack }: ProjectDetailViewProps) {
  const project = resumeData.projects.find(
    p => p.title.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase().replace(/\s+/g, '-')
  );

  if (!project) {
    return (
      <div className="text-center py-12 text-foreground">
        <p className="text-muted-foreground mb-4">Project not found: {projectId}</p>
        <p className="text-sm text-muted-foreground mb-4">Available projects:</p>
        <ul className="text-sm text-left max-w-md mx-auto space-y-1">
          {resumeData.projects.map((p, i) => (
            <li key={i}>{p.title} → {p.title.toLowerCase().replace(/\s+/g, '-')}</li>
          ))}
        </ul>
        <Button onClick={onBack} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full text-foreground pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Button onClick={onBack} variant="ghost" size="sm" className="mb-5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <h1 className="text-3xl font-bold mb-3 text-foreground">{project.title}</h1>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            {(project.company || project.institution) && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {project.company || project.institution}
              </span>
            )}
            {project.period && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {project.period}
              </span>
            )}
            {project.type && (
              <span className="px-2 py-1 bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium">
                {project.type}
              </span>
            )}
          </div>
        </div>
        {project.url && (
          <Button asChild variant="outline" size="sm">
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Project
            </a>
          </Button>
        )}
      </div>

      {/* Description or Details */}
      {(project.description || project.details) && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardContent className="p-8">
            {project.description ? (
              <p className="text-base leading-relaxed text-foreground">{project.description}</p>
            ) : project.details ? (
              Array.isArray(project.details) ? (
                <ul className="space-y-4">
                  {project.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3 text-base leading-relaxed text-foreground">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base leading-relaxed text-foreground">{project.details}</p>
              )
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Problem */}
      {project.problem && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Problem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed">{project.problem}</p>
          </CardContent>
        </Card>
      )}

      {/* Research / Approach */}
      {(project.research || project.approach) && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{project.research ? 'Research' : 'Approach'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed">{project.research || project.approach}</p>
          </CardContent>
        </Card>
      )}

      {/* HMW */}
      {project.hmw && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">How Might We</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed font-medium">{project.hmw}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Features */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {project.keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-primary mt-1.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {project.results && project.results.length > 0 && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {project.results.map((result, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-primary mt-1.5">✓</span>
                  <span className="font-medium">{result}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Impact */}
      {project.impact && project.impact.length > 0 && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Impact</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-4">
              {project.impact.map((impact, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-primary mt-1">→</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Learnings */}
      {project.learnings && (
        <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Learnings</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {Array.isArray(project.learnings) ? (
              <ul className="space-y-3">
                {project.learnings.map((learning, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-primary mt-1.5">•</span>
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed">{project.learnings}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.role && (
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Role</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{project.role}</p>
            </CardContent>
          </Card>
        )}

        {project.tools && project.tools.length > 0 && (
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2.5">
                {project.tools.map((tool, index) => {
                  const colors = ['bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300', 'bg-purple-500/15 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300', 'bg-pink-500/15 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300', 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', 'bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', 'bg-orange-500/15 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300', 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'];
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 ${colors[index % colors.length]} rounded-md text-xs`}
                    >
                      {tool}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {project.team && (
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{project.team}</p>
            </CardContent>
          </Card>
        )}

        {project.targetAudience && (
          <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{project.targetAudience}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

