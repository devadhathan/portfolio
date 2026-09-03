'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, ExternalLink, Smartphone } from 'lucide-react';
import { findProjectBySlug } from '@/lib/types/project';
import { useSiteContent } from '@/components/site-content-provider';
import { OsBackButton } from '@/components/os-back-button';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface FinshotsDetailProps {
  projectId: string;
  onBack: () => void;
  hideBackButton?: boolean;
  layout?: 'page' | 'work-rail';
}

const infoGraphicsImagePath = encodeURI('/finshots/Info graphics.webp');

const finshotsImages = [
  { src: '/finshots/n3pGQMdpISBs8GNixqX0HtgFg.png.webp', title: 'Highlights', description: 'Article view with engagement features' },
  { src: '/finshots/Bm0PeueVjQrfNc6ZGLBrN2V3wM.png.webp', title: 'Categories', description: 'Category filters and navigation' },
  { src: '/finshots/E4DFBuj0Koz7GYv9xXNlfGQxGtI.png.webp', title: 'Infographics', description: 'Data visualization and charts' },
  { src: '/finshots/0xqsjn29l4LoZolS3dyyR2tY.png.webp', title: 'Best App 2021', description: 'Google Play award recognition' },
  { src: '/finshots/sr6ljGiHCaM0R1fK5YqIBWQa6kI.png.webp', title: 'Custom Notification', description: 'Personalized notification settings' },
  { src: '/finshots/s6XIdXr2BqaE8sFliwZJQA9ZM.png.webp', title: 'Filters & Search', description: 'Advanced search and filtering' },
];

type FeatureMedia =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; alt: string; backgroundImage: string };

const finshotsFeatureMedia: Record<string, FeatureMedia> = {
  Navigation: {
    type: 'image',
    src: '/finshots/navigation.webp',
    alt: 'Navigation flow with categories and search',
  },
  Infographics: {
    type: 'image',
    src: infoGraphicsImagePath,
    alt: 'Illustrated infographics and data visualization',
  },
  Accessibility: {
    type: 'video',
    src: '/finshots/acess.mp4',
    alt: 'Accessibility adjustments showcasing dark mode and font controls',
    backgroundImage: '/finshots/Bg.webp',
  },
  'Custom Notifications': {
    type: 'image',
    src: '/finshots/Notifications.webp',
    alt: 'Custom notification preferences view',
  },
};

export function FinshotsDetail({
  projectId,
  onBack,
  hideBackButton = false,
  layout = 'page',
}: FinshotsDetailProps) {
  const t = useTranslations('caseStudy');
  const { projects } = useSiteContent();
  const project = findProjectBySlug(projects, projectId);

  if (!project) {
    return (
      <div className="text-center py-12 text-foreground">
        <p className="text-muted-foreground mb-4">{t('projectNotFound')}</p>
        <div className="mt-6 flex justify-center">
          <OsBackButton onClick={onBack} aria-label="Back to Home" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${layout === 'work-rail' ? 'os-col--work-case' : 'os-col--case'} mt-2 pb-20 text-foreground sm:mt-3 md:mt-4 lg:pb-0`}
    >      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12 lg:mb-16">
        <div>
          {!hideBackButton && (
            <div className="mb-5">
              <OsBackButton onClick={onBack} aria-label="Back to Home" />
            </div>
          )}
          <h1 className="cs-display text-foreground">{project.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground md:text-sm">
            {(project.company || project.institution) && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                {project.company || project.institution}
              </span>
            )}
            {project.period && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {project.period}
              </span>
            )}
            {project.type && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium leading-none text-primary md:text-[12px]">
                {project.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 cs-section">
        {/* Left Content - Description */}
        <div className="lg:col-span-2 space-y-8">
          <p className="cs-body text-muted-foreground">
            {t('finshotsIntro1')}
          </p>
          <p className="cs-body text-muted-foreground">
            {t('finshotsIntro2')}
          </p>
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
        <div className="lg:col-span-1 space-y-0 border-l border-border/50 pl-8">
          {project.type && (
            <div className="pb-6 border-b border-border/50">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('product')}</h3>
              <p className="cs-meta text-foreground">{project.type}</p>
            </div>
          )}
          
          {project.tools && project.tools.length > 0 && (
            <div className="py-6 border-b border-border/50">
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
          
          {project.team && (
            <div className="pt-6">
              <h3 className="cs-label uppercase text-muted-foreground mb-2">{t('team')}</h3>
              <p className="cs-meta text-foreground">{project.team}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid - Images Section */}
      <div className="cs-section">
        <h2 className="cs-heading text-foreground mb-8 lg:mb-12">{t('designGallery')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finshotsImages.map((image, idx) => (
            <div key={idx}>
            <Card className="col-span-1 overflow-hidden border-2 border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="cs-body font-medium">
                  {image.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-b-lg">
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      {project.problem && (
        <div id={`${projectId}-problem`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('problem')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground">
              {project.problem}
            </p>
            <div className="mt-6">
              <Card className="border-2 border-border/50 bg-transparent shadow-none">
                <CardContent className="p-0">
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[18px] bg-transparent">
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/finshots/Bg.webp"
                      >
                        <source src="/finshots/first.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Research Section */}
      {project.research && (
        <div id={`${projectId}-research`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('research')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground">
              {project.research}
            </p>
          </div>
        </div>
      )}

      {/* HMW Section */}
      {project.hmw && (
        <div id={`${projectId}-hmw`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('hmw')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body font-medium text-muted-foreground">
              {project.hmw}
            </p>
          </div>
        </div>
      )}

      {/* Possible Solutions */}
      <div id={`${projectId}-possible-solutions`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
        <h2 className="cs-heading text-foreground lg:col-span-2">{t('possibleSolutions')}</h2>
        <div className="lg:col-span-3">
          <p className="cs-body text-muted-foreground">
            {t('finshotsPossibleSolutions')}
          </p>
        </div>
      </div>

      {/* Key Features Section */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="cs-section">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-8">
            <h2 className="cs-heading text-foreground lg:col-span-2">{t('keyFeaturesShipped')}</h2>
          </div>
          <div className="space-y-12">
            {project.keyFeatures.map((feature, idx) => {
              const parts = feature.split(':');
              const featureName = parts[0]?.trim() || '';
              const featureDesc = parts.slice(1).join(':').trim();
              const featureMedia = finshotsFeatureMedia[featureName];
              
              return (
                <div key={idx} className="space-y-4">
                  <div>
                    <h3 className="cs-body font-medium text-foreground mb-4">{featureName}</h3>
                    {featureDesc && (
                      <p className="cs-body text-muted-foreground">
                        {featureDesc}
                      </p>
                    )}
                  </div>
                  {featureMedia?.type === 'image' && (
                    <Card className="w-full overflow-hidden border-2 border-border/70 bg-card/60 backdrop-blur-md">
                      <CardContent className="relative p-0">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                          <Image
                            src={featureMedia.src}
                            alt={featureMedia.alt}
                            fill
                            className="object-cover"
                            sizes="100vw"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {featureMedia?.type === 'video' && (
                    <Card
                      className="border-2 border-border/70 bg-card/60 backdrop-blur-md transition-all duration-300 overflow-hidden w-full bg-cover bg-center aspect-[16/9]"
                      style={{ backgroundImage: `url(${featureMedia.backgroundImage})` }}
                    >
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full w-full">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[260px] max-w-[520px] aspect-[9/16] overflow-hidden rounded-[26px] border border-white/30 bg-black/50 shadow-lg">
                              <video
                                className="h-full w-full object-cover"
                                poster={featureMedia.backgroundImage}
                                autoPlay
                                muted
                                loop
                                playsInline
                                aria-label={featureMedia.alt}
                              >
                                <source src={featureMedia.src} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {project.results && project.results.length > 0 && (
        <div id={`${projectId}-stats`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('result')}</h2>
          <div className="lg:col-span-3">
            <p className="cs-body text-muted-foreground mb-8">
              {t('finshotsResultsIntro')}
            </p>
            <div className="space-y-8">
              {project.results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="text-primary mt-1">→</span>
                  <p className="cs-body text-muted-foreground">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learnings Section */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="cs-section grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="cs-heading text-foreground lg:col-span-2">{t('whatDidILearn')}</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-8">
                {project.learnings.map((learning, idx) => (
                  <p key={idx} className="cs-body text-muted-foreground">
                    {learning}
                  </p>
                ))}
              </div>
            ) : (
              <p className="cs-body text-muted-foreground">
                {project.learnings}
              </p>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
