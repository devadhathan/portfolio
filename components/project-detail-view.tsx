'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users, Wrench, ExternalLink, Smartphone } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import { FinshotsDetail } from './finshots-detail';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:8',message:'Import check',data:{finshotsDetailType:typeof FinshotsDetail,finshotsDetailIsUndefined:FinshotsDetail===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  hideBackButton?: boolean;
}

export function ProjectDetailView({ projectId, onBack, hideBackButton = false }: ProjectDetailViewProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:18',message:'ProjectDetailView entry',data:{projectId,hideBackButton},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const project = resumeData.projects.find(
    p => p.title.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase().replace(/\s+/g, '-')
  );

  // Use custom Finshots detail page
  const normalizedProjectId = projectId.toLowerCase().replace(/\s+/g, '-');
  const normalizedTitle = project?.title.toLowerCase().replace(/\s+/g, '-') || '';
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:25',message:'Before Finshots check',data:{normalizedProjectId,normalizedTitle,isFinshots:normalizedProjectId.includes('finshots')||normalizedTitle.includes('finshots'),finshotsDetailAvailable:typeof FinshotsDetail!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (normalizedProjectId.includes('finshots') || normalizedTitle.includes('finshots') || 
      projectId.toLowerCase() === 'finshots-news-app' || normalizedTitle === 'finshots-news-app') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:28',message:'Rendering FinshotsDetail',data:{finshotsDetailType:typeof FinshotsDetail,finshotsDetailIsFunction:typeof FinshotsDetail==='function',finshotsDetailIsUndefined:FinshotsDetail===undefined,finshotsDetailIsNull:FinshotsDetail===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      if (!FinshotsDetail) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:32',message:'FinshotsDetail is falsy before render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error('FinshotsDetail is undefined');
      }
      const element = <FinshotsDetail projectId={projectId} onBack={onBack} hideBackButton={hideBackButton} />;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:37',message:'FinshotsDetail element created',data:{elementType:typeof element,elementIsUndefined:element===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return element;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b7b4a418-253f-4161-b689-f7e23a180f47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'project-detail-view.tsx:41',message:'Error rendering FinshotsDetail',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

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
    <div className="animate-in fade-in duration-300 w-full text-foreground pb-20 lg:pb-0 max-w-6xl mx-auto mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          {!hideBackButton && (
            <Button onClick={onBack} variant="ghost" size="sm" className="mb-5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          )}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
          </div>
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
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-medium">
                {project.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        {/* Left Content - Description */}
        <div className="lg:col-span-2 space-y-6">
          {project.description && (
            <>
              {project.description.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </>
          )}
          {!project.description && project.details && (
            <>
              {Array.isArray(project.details) ? (
                project.details.map((detail, idx) => (
                  <p key={idx} className="text-lg leading-relaxed text-muted-foreground">
                    {detail}
                  </p>
                ))
              ) : (
                <p className="text-lg leading-relaxed text-muted-foreground">{project.details}</p>
              )}
            </>
          )}
          {project.url && (
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <span className="text-base font-medium">VIEW PROJECT</span>
                <Smartphone className="h-4 w-4" />
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        
        {/* Right Content - Structured Project Details */}
        <div className="lg:col-span-1 space-y-0 border-l border-border/50 pl-8">
          {project.type && (
            <div className="pb-6 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product</h3>
              <p className="text-base text-foreground">{project.type}</p>
            </div>
          )}
          
          {project.tools && project.tools.length > 0 && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
              <div className="space-y-2">
                {project.tools.map((tool, idx) => (
                  <p key={idx} className="text-base text-foreground">{tool}</p>
                ))}
              </div>
            </div>
          )}
          
          {project.role && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">My role</h3>
              <p className="text-base text-foreground">{project.role}</p>
            </div>
          )}
          
          {project.period && (
            <div className="py-6 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Timeline</h3>
              <p className="text-base text-foreground">{project.period}</p>
            </div>
          )}
          
          {project.team && (
            <div className="pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Team</h3>
              <p className="text-base text-foreground">{project.team}</p>
            </div>
          )}
        </div>
      </div>

      {/* Problem Section */}
      {project.problem && (
        <div id={`${projectId}-problem`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Problem</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {project.problem}
            </p>
          </div>
        </div>
      )}

      {/* Research Section */}
      {project.research && (
        <div id={`${projectId}-research`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Research</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {project.research}
            </p>
          </div>
        </div>
      )}

      {/* Approach Section */}
      {project.approach && (
        <div id={`${projectId}-approach`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Approach</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {project.approach}
            </p>
          </div>
        </div>
      )}

      {/* HMW Section */}
      {project.hmw && (
        <div id={`${projectId}-hmw`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">How Might We</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground font-medium">
              {project.hmw}
            </p>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {project.results && project.results.length > 0 && (
        <div id={`${projectId}-stats`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Some stats</h2>
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {project.results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-lg text-muted-foreground">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Features */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Key Features</h2>
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {project.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <p className="text-lg text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Impact */}
      {project.impact && project.impact.length > 0 && (
        <div id={`${projectId}-impact`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Impact</h2>
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {project.impact.map((impact, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-lg text-muted-foreground">{impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learnings */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Learnings</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-4">
                {project.learnings.map((learning, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <p className="text-lg text-muted-foreground">{learning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground">{project.learnings}</p>
            )}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {project.targetAudience && (
        <div id={`${projectId}-target-audience`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Target Audience</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">{project.targetAudience}</p>
          </div>
        </div>
      )}
    </div>
  );
}

