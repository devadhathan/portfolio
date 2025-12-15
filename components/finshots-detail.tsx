'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users, Wrench, ExternalLink, X, ZoomIn, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const project = resumeData.projects.find(
    p => p.title.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase().replace(/\s+/g, '-')
  );
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
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Button onClick={onBack} variant="ghost">
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
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
              Shipped
            </span>
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
          <p className="text-lg leading-relaxed text-muted-foreground">
            As Finshots continued to establish itself as a trusted platform for financial news, primarily via email newsletters and the website, we noticed a significant challenge. While readers appreciated the high-quality content, navigating and revisiting older stories through emails or web searches became a cumbersome task.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Feedback from social media and user surveys emphasized a growing demand for a more streamlined and engaging way to access financial insights. This created an opportunity to rethink how we delivered value to our audience and improve the accessibility of our content.
          </p>
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

      {/* Bento Grid - Images Section */}
      <div className="mb-64">
        <h2 className="text-2xl font-normal text-foreground mb-4">Design Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {finshotsImages.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: [0.42, 0, 1, 1] // ease-in cubic bezier
              }}
            >
            <Card 
              className="col-span-1 border-2 border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => handleImageClick(image.src)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
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
            </motion.div>
          ))}
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
        <div id={`${projectId}-research`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Research</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {project.research}
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

      {/* Possible Solutions */}
      <div id={`${projectId}-possible-solutions`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Possible solutions</h2>
        <div className="lg:col-span-3">
          <p className="text-lg leading-relaxed text-muted-foreground">
            After validating the problem and exploring potential solutions, we have determined that developing a mobile app is the best approach to address these challenges. The mobile app will offer a dedicated, user-friendly environment for accessing and rediscovering our financial insights on the go.
          </p>
        </div>
      </div>

      {/* Key Features Section */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <div id={`${projectId}-key-features`} className="mb-64">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <h2 className="text-2xl font-normal text-foreground lg:col-span-2">Key features shipped</h2>
            <div className="lg:col-span-3"></div>
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
                    <h3 className="text-2xl font-medium text-foreground mb-2">{featureName}</h3>
                    {featureDesc && (
                      <p className="text-lg leading-relaxed text-muted-foreground">
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
        <div id={`${projectId}-stats`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">What was the result</h2>
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              The app received highly positive user feedback upon release. During the testing period and after launch, it became clear our reimagined interfaces and streamlined workflows better met customers&apos; needs.
            </p>
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

      {/* Learnings Section */}
      {project.learnings && (
        <div id={`${projectId}-learnings`} className="mb-64 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <h2 className="text-2xl font-normal text-foreground lg:col-span-2">What did I learn?</h2>
          <div className="lg:col-span-3">
            {Array.isArray(project.learnings) ? (
              <div className="space-y-4">
                {project.learnings.map((learning, idx) => (
                  <p key={idx} className="text-lg leading-relaxed text-muted-foreground">
                    {learning}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground">
                {project.learnings}
              </p>
            )}
          </div>
        </div>
      )}


      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={closeZoom}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
