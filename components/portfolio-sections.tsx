'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AgentState, SectionPriority } from '@/lib/agent';
import { User, Briefcase, Mail, Linkedin, FileText, Sparkles, Heart, Lightbulb, Target, Rocket, Code2, Calendar, Award, Globe, Github, Zap, FolderKanban, Image as ImageIcon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { PreferenceGraph } from './preference-graph';

interface PortfolioSectionsProps {
  agentState: AgentState;
}

export function PortfolioSections({ agentState }: PortfolioSectionsProps) {
  // Sort by order first, then filter visible sections
  const sortedSections = [...agentState.sections].sort((a, b) => a.order - b.order);
  const visibleSections = sortedSections.filter(s => s.visible);
  
  // Track image errors for photo sections
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());
  // Track carousel state for photo sections
  const [carouselIndex, setCarouselIndex] = React.useState<{ [key: string]: number }>({});
  // Track dialog state for section details
  const [selectedSection, setSelectedSection] = useState<typeof visibleSections[0] | null>(null);
  
  // Debug: log what sections are being rendered
  console.log('PortfolioSections render:', {
    totalSections: agentState.sections.length,
    visibleSections: visibleSections.length,
    sections: visibleSections.map(s => ({ id: s.id, title: s.title, type: s.type }))
  });

  const getBentoSize = (priority: SectionPriority, sectionId: string) => {
    // All boxes are responsive and take 1 column
    // Grid layout will handle rows automatically based on order
    return 'col-span-1 sm:col-span-1 lg:col-span-1';
  };

  const getPriorityStyles = (priority: SectionPriority) => {
    // Enhanced interactive animations with smoother transitions
    switch (priority) {
      case 'high':
        return 'rounded-2xl border-2 border-border/70 bg-card/60 backdrop-blur-md hover:bg-card/70 hover:border-border/90 hover:border-primary/30 cursor-pointer dark:shadow-md hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]';
      case 'medium':
        return 'rounded-2xl border-2 border-border/70 bg-card/50 backdrop-blur-md hover:bg-card/60 hover:border-border/90 hover:border-primary/20 cursor-pointer dark:shadow-md hover:shadow-lg transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99]';
      case 'low':
        return 'rounded-2xl border-2 border-border/70 opacity-80 bg-card/40 backdrop-blur-sm hover:bg-card/50 hover:border-border/80 hover:opacity-100 cursor-pointer dark:shadow-sm hover:shadow-md transition-all duration-500 ease-out hover:scale-[1.01] active:scale-[0.99]';
      default:
        return 'rounded-2xl border-2 border-border/70 bg-card/30 backdrop-blur-sm hover:bg-card/40 hover:border-border/80 cursor-pointer dark:shadow-sm hover:shadow-md transition-all duration-500 ease-out hover:scale-[1.01] active:scale-[0.99]';
    }
  };

  const handleCardClick = (sectionId: string) => {
    // Show details dialog when card is clicked
    const section = visibleSections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
    }
  };

  const nextImage = (sectionId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex(prev => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (sectionId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex(prev => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const renderSection = (section: typeof visibleSections[0]) => {
    const baseStyles = getPriorityStyles(section.priority);
    const bentoSize = getBentoSize(section.priority, section.id);
    
    switch (section.id) {
      case 'hero':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} group flex flex-col h-full cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />
            
            <CardHeader className="flex flex-col justify-center flex-shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  <div
                    className="relative z-10"
                    style={{
                      width: '24px',
                      height: '27px',
                      display: 'block',
                      overflow: 'visible',
                      aspectRatio: '0.91 / 1',
                      backgroundImage: 'url(/photos/plant.png)',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      position: 'relative',
                      borderRadius: '0px',
                    }}
                  />
                </div>
                <div>
                  <CardTitle className="text-3xl md:text-4xl font-semibold mb-1 group-hover:text-primary transition-colors">
                    Dev
                  </CardTitle>
                  <CardDescription className="text-[14px] md:text-[14px] text-foreground/80">
                    Product Designer
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
              <p className="text-[14px] text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-all duration-500 group-hover:translate-x-1">
                Building meaningful digital experiences through thoughtful design and user-centric solutions.
              </p>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground group-hover:text-foreground/80 transition-all duration-500 group-hover:translate-x-1">
                <Globe className="h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ease-out" />
                <span>Based in India</span>
              </div>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground group-hover:text-foreground/80 transition-all duration-500 group-hover:translate-x-1">
                <Zap className="h-4 w-4 group-hover:scale-125 group-hover:text-primary group-hover:animate-pulse transition-all duration-500 ease-out" />
                <span>Available for opportunities</span>
              </div>
            </CardContent>
          </Card>
        );

      case 'preferences':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.01] transition-all duration-200 flex flex-col h-full`}
            onClick={() => handleCardClick(section.id)}
          >
            <PreferenceGraph />
          </Card>
        );

      case 'about':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                I design with care, always keeping the user at the center. Good design begins with understanding people and their needs.
              </p>
              <div>
                <h4 className="text-[14px] font-medium mb-2">Core Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Product Design', 'UI/UX', 'Prototyping', 'Figma', 'Design Systems', 'User Research', 'Interaction Design'].map((skill, idx) => {
                    const colors = ['bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300', 'bg-purple-500/15 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300', 'bg-pink-500/15 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300', 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', 'bg-green-500/15 dark:bg-green-500/15 text-green-700 dark:text-green-300', 'bg-orange-500/15 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300', 'bg-indigo-500/15 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'];
                    return (
                      <span
                        key={skill}
                        className={`px-2 py-1 ${colors[idx % colors.length]} rounded-md text-[14px] hover:scale-105 transition-all duration-200 cursor-default`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-[14px] font-medium mb-2">Tools</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['Figma', 'Sketch', 'Principle', 'After Effects', 'Webflow'].map((tool, idx) => {
                    const colors = ['bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', 'bg-teal-500/15 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300', 'bg-violet-500/15 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300', 'bg-rose-500/15 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300', 'bg-amber-500/15 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'];
                    return (
                      <span
                        key={tool}
                        className={`px-2 py-1 ${colors[idx % colors.length]} rounded-md text-[14px] hover:scale-105 transition-all duration-200 cursor-default`}
                      >
                        {tool}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'philosophy':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px] mb-2">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                Design Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:animate-pulse transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-1">User-Centered Design</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    I design with care, always keeping the user at the center of every decision.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-1">Empathy First</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Good design begins with understanding people and their needs deeply.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-125 group-hover/item:brightness-125 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-1">Human Technology</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Technology should feel natural and intuitive, built for humans.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/40 hover:scale-[1.02] transition-all duration-200 border border-border/20 group/item cursor-pointer">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-all duration-300" />
                <div>
                  <p className="text-[14px] font-medium mb-1">Purposeful Solutions</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Every solution is thoughtful, purposeful, and made to last.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'experience':
        // For default experience section, show full content
        if (section.id === 'experience' && !section.description && !section.content) {
          return (
            <Card 
              key={section.id} 
              className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
              onClick={() => handleCardClick(section.id)}
            >
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-[16px]">
                  <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-300">
                    <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  Experience
                </CardTitle>
                <CardDescription className="text-[14px]">Current Role</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-[14px] mb-1">Product Designer</h4>
                        <p className="text-[14px] text-primary mb-2">Nesoi.ai</p>
                      </div>
                      <div className="flex items-center gap-1 text-[14px] text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Present</span>
                      </div>
                    </div>
                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                      Designing innovative solutions and user-centered experiences for AI-powered products.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Prototyping', 'Design Systems', 'UX Research'].map((tag) => (
                        <span key={tag} className={`px-2 py-0.5 rounded text-[14px] ${tag.includes('Design') ? 'bg-purple-500/15 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300' : tag.includes('Research') ? 'bg-blue-500/15 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' : tag.includes('UX') ? 'bg-pink-500/15 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300' : 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border/20">
                    <h4 className="font-medium text-[14px] mb-2">Previous Experience</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[14px] font-medium">Senior UI/UX Designer</p>
                        <p className="text-[14px] text-muted-foreground">Freelance • 2022 - 2023</p>
                      </div>
                      <div>
                        <p className="text-[14px] font-medium">Product Design Intern</p>
                        <p className="text-[14px] text-muted-foreground">Startup • 2021 - 2022</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        // For generated experience sections, show dynamic content
        const expContent = section.content || section.description || '';
        const expTitle = section.title || 'Experience';
        
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-300">
                  <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                {expTitle}
              </CardTitle>
              {section.description && section.description.includes('|') && (
                <CardDescription className="text-[14px]">{section.description.split('|')[0].trim()}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Experience section ready</p>
                  <p className="text-[14px]">Add your experience details here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expContent && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {expContent}
                      </p>
                    </div>
                  )}
                  {section.description && !expContent && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/40 transition-colors">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  )}
                  {!expContent && !section.description && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No experience details available</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'contact':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                Connect
              </CardTitle>
              <CardDescription className="text-[14px]">Get in touch</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="space-y-2">
                <a 
                  href="https://www.linkedin.com/in/devadhathan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 group/link border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="h-4 w-4 text-primary group-hover/link:scale-110 transition-all duration-300 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">LinkedIn</span>
                    <span className="text-[14px] text-muted-foreground">Connect with me</span>
                  </div>
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 group/link border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-4 w-4 text-primary group-hover/link:scale-110 transition-all duration-300 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">Resume</span>
                    <span className="text-[14px] text-muted-foreground">Download PDF</span>
                  </div>
                </a>
                <a 
                  href="https://github.com/devadhathan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 group/link border border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-4 w-4 text-primary group-hover/link:scale-110 transition-all duration-300 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">GitHub</span>
                    <span className="text-[14px] text-muted-foreground">View my work</span>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/20">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">Email</span>
                    <span className="text-[14px] text-muted-foreground">Available for opportunities</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Code2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                {section.title || 'Projects'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Projects section ready</p>
                  <p className="text-[14px]">Add your project links and details here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <div className="mb-3">
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                        {section.description}
                      </p>
                    </div>
                  )}
                  {section.content && (
                    <div className="mb-3">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.links && section.links.length > 0 && (
                    <div className="space-y-2">
                      {section.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 group/link border border-border/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Rocket className="h-4 w-4 text-primary group-hover/link:scale-125 group-hover/link:-translate-y-1 transition-all duration-300 flex-shrink-0" />
                          <div className="flex flex-col flex-1">
                            <span className="text-[14px] font-medium">{link.label}</span>
                            <span className="text-[14px] text-muted-foreground text-xs">{link.url}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all duration-300" />
                        </a>
                      ))}
                    </div>
                  )}
                  {!section.description && !section.content && (!section.links || section.links.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No project details available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'skills':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-4 w-4 group-hover:scale-125 group-hover:brightness-125 transition-all duration-300" />
                </div>
                {section.title || 'Skills'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Skills section ready</p>
                  <p className="text-[14px]">Add your skills and technologies here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
                      {section.description}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {!section.description && !section.content && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No skills information available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'education':
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Award className="h-4 w-4 group-hover:scale-110 transition-all duration-300" />
                </div>
                {section.title || 'Education'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">Education section ready</p>
                  <p className="text-[14px]">Add your education details here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <div className="mb-2">
                      <p className="text-[14px] font-medium text-foreground mb-1">
                        {section.description.split('|')[0] || section.description}
                      </p>
                      {section.description.includes('|') && (
                        <p className="text-[14px] text-muted-foreground">
                          {section.description.split('|').slice(1).join('|').trim()}
                        </p>
                      )}
                    </div>
                  )}
                  {section.content && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {!section.description && !section.content && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-[14px]">No education information available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 'photos':
        const photos = section.images || (section.image ? [section.image] : []);
        const currentIndex = carouselIndex[section.id] || 0;
        const hasImageError = imageErrors.has(section.id);
        const shouldShowPlaceholder = photos.length === 0 || hasImageError;
        
        // Debug logging
        console.log('Photo section:', {
          id: section.id,
          title: section.title,
          photosCount: photos.length,
          photos: photos,
          hasError: hasImageError,
          visible: section.visible
        });
        
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.02] transition-all duration-300 flex flex-col h-full overflow-hidden group`}
            onClick={() => handleCardClick(section.id)}
          >
            {!shouldShowPlaceholder && photos.length > 0 ? (
              <div className="relative w-full h-full min-h-[300px] group">
                {/* Carousel Container */}
                <div className="relative w-full h-full overflow-hidden">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        idx === currentIndex
                          ? 'opacity-100 translate-x-0'
                          : idx < currentIndex
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`${section.title || 'Photo'} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={photo.endsWith('.avif')}
                        onError={(e) => {
                          console.error('Image load error:', photo, e);
                          setImageErrors(prev => new Set(prev).add(section.id));
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => prevImage(section.id, photos.length, e)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => nextImage(section.id, photos.length, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndex(prev => ({ ...prev, [section.id]: idx }));
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Title & Description */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                  <CardTitle className="text-white text-[16px] font-semibold mb-1">
                    {section.title || 'Photo'}
                  </CardTitle>
                  {section.description && (
                    <CardDescription className="text-white/80 text-[14px]">
                      {section.description}
                    </CardDescription>
                  )}
                  {photos.length > 1 && (
                    <p className="text-white/60 text-xs mt-1">
                      {currentIndex + 1} / {photos.length}
                    </p>
                  )}
                </div>

                {/* Image Icon Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 animate-pulse">
                  <div className="p-2 bg-black/50 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10 border-2 border-dashed border-border/50 group hover:border-border transition-colors">
                <CardHeader className="pb-2 flex-shrink-0 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/20 rounded-full animate-pulse">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-[16px] mb-1">
                    {section.title || 'Photo'}
                  </CardTitle>
                  {section.description && (
                    <CardDescription className="text-[14px] mb-3">
                      {section.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-center px-4">
                  <p className="text-[12px] text-muted-foreground mb-2">
                    {photos.length === 0 ? 'No images set' : 'Images not found'}
                  </p>
                </CardContent>
              </div>
            )}
          </Card>
        );

      case 'custom':
      default:
        return (
          <Card 
            key={section.id} 
            className={`${baseStyles} ${bentoSize} hover:scale-[1.01] transition-all duration-200 flex flex-col h-full`}
            onClick={() => handleCardClick(section.id)}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                {section.title || 'Custom Section'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.placeholder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[14px] mb-2">{section.title} section ready</p>
                  <p className="text-[14px]">Add your content here</p>
                </div>
              ) : (
                <>
                  {section.description && (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  {section.links && section.links.length > 0 && (
                    <div className="space-y-2">
                      {section.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group border border-border/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-4 w-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium">{link.label}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {visibleSections.map(section => renderSection(section))}
      </div>
      
      {/* Detail Dialog */}
      <Dialog open={!!selectedSection} onOpenChange={(open) => !open && setSelectedSection(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSection && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedSection.title}
                </DialogTitle>
                {selectedSection.description && (
                  <DialogDescription>
                    {selectedSection.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {selectedSection.content && (
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedSection.content}
                    </p>
                  </div>
                )}
                {selectedSection.links && selectedSection.links.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Links</h4>
                    <div className="space-y-2">
                      {selectedSection.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span className="text-sm">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
