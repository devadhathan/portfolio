'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ExternalLink, X, ZoomIn, Smartphone } from 'lucide-react';
import { findProjectBySlug } from '@/lib/types/project';
import { useSiteContent } from '@/components/site-content-provider';
import { OsBackButton } from '@/components/os-back-button';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FinshotsDetailProps {
  projectId: string;
  onBack: () => void;
  hideBackButton?: boolean;
}

const infoGraphicsImagePath = encodeURI('/finshots/Info graphics.png');

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
    src: '/finshots/navigation.png',
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
    backgroundImage: '/finshots/Bg.png',
  },
  'Custom Notifications': {
    type: 'image',
    src: '/finshots/Notifications.png',
    alt: 'Custom notification preferences view',
  },
};

export function FinshotsDetail({ projectId, onBack, hideBackButton = false }: FinshotsDetailProps) {
  const t = useTranslations('caseStudy');
  const { projects } = useSiteContent();
  const project = findProjectBySlug(projects, projectId);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleImageClick = (src: string) => {
    setZoomedImage(src);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };


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
    <div className="mx-auto mt-3 w-full max-w-4xl px-4 pb-20 text-foreground sm:px-6 md:mt-4 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12 lg:mb-16">
        <div>
          {!hideBackButton && (
            <div className="mb-5">
              <OsBackButton onClick={onBack} aria-label="Back to Home" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{project.title}</h1>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[12px] font-medium border border-red-500/30">
              {t('shipped')}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] leading-5 text-muted-foreground">
            {(project.company || project.institution) && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {project.company || project.institution}
              </span>
            )}
            {project.period && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
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
          <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
            {t('finshotsIntro1')}
          </p>
          <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
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
                <span className="text-[13px] font-medium">{t('viewProject')}</span>
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

      {/* Bento Grid - Images Section */}
      <div className="mb-24 lg:mb-32">
        <h2 className="text-xl md:text-2xl font-normal text-foreground mb-8 lg:mb-12">{t('designGallery')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finshotsImages.map((image, idx) => (
            <div key={idx}>
            <Card 
              className="col-span-1 border-2 border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => handleImageClick(image.src)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-[15px] font-medium tracking-tight flex items-center gap-2">
                  {image.title}
                  <ZoomIn className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-b-lg">
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
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
        <div id={`${projectId}-problem`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('problem')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
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
                        poster="/finshots/Bg.png"
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
        <div id={`${projectId}-research`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('research')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
              {project.research}
            </p>
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

      {/* Possible Solutions */}
      <div id={`${projectId}-possible-solutions`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
        <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('possibleSolutions')}</h2>
        <div className="lg:col-span-3">
          <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
            {t('finshotsPossibleSolutions')}
          </p>
        </div>
      </div>

      {/* Key Features Section */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="mb-24 lg:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-8">
            <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('keyFeaturesShipped')}</h2>
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
                    <h3 className="text-[15px] font-medium tracking-tight text-foreground mb-4">{featureName}</h3>
                    {featureDesc && (
                      <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
                        {featureDesc}
                      </p>
                    )}
                  </div>
                  {featureMedia?.type === 'image' && (
                    <Card 
                      className="border-2 border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden w-full"
                      onClick={() => handleImageClick(featureMedia.src)}
                    >
                      <CardContent className="p-0 relative">
                        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={featureMedia.src}
                            alt={featureMedia.alt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
        <div id={`${projectId}-stats`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('result')}</h2>
          <div className="lg:col-span-3">
            <p className="text-[15px] leading-7 case-study-body text-muted-foreground mb-8">
              {t('finshotsResultsIntro')}
            </p>
            <div className="space-y-8">
              {project.results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="text-primary mt-1">→</span>
                  <p className="text-[15px] leading-7 case-study-body text-muted-foreground">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learnings Section */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="mb-24 lg:mb-32 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          <h2 className="text-xl md:text-2xl font-normal text-foreground lg:col-span-2">{t('whatDidILearn')}</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-8">
                {project.learnings.map((learning, idx) => (
                  <p key={idx} className="text-[15px] leading-7 case-study-body text-muted-foreground">
                    {learning}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[15px] leading-7 case-study-body text-muted-foreground">
                {project.learnings}
              </p>
            )}
          </div>
        </div>
      )}


      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={closeZoom}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={closeZoom}
            >
              <X className="h-5 w-5" />
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
    </div>
  );
}
