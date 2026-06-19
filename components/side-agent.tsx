'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, RotateCcw, ChevronLeft, ChevronDown, Sparkles, MessageCircle, Smile } from 'lucide-react';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { PortfolioAgent, AgentCommand, AgentState, PortfolioSection } from '@/lib/agent';
import { resumeData } from '@/lib/resume-data';
import ReactMarkdown from 'react-markdown';

// ─── Gen UI types ────────────────────────────────────────────────────────────

export type GenUIStat     = { type: 'stat';       label: string; value: string; context?: string };
export type GenUIProject  = { type: 'project';    title: string; description: string; tags?: string[]; link?: string };
export type GenUITimeline = { type: 'timeline';   role: string; company: string; period: string; highlights?: string[] };
export type GenUISkills   = { type: 'skill_grid'; categories: { name: string; skills: string[] }[] };
export type GenUIQuote    = { type: 'quote';      text: string; author?: string };
export type GenUIChart    = { type: 'chart';      title: string; bars: { label: string; value: number; displayValue: string; color?: string }[] };
export type GenUIImage    = { type: 'image';      src: string; alt: string; caption?: string; link?: string };
export type GenUIInfo     = { type: 'info';       title: string; subtitle?: string; body: string; icon?: string; link?: string };
export type GenUIItem     = GenUIStat | GenUIProject | GenUITimeline | GenUISkills | GenUIQuote | GenUIChart | GenUIImage | GenUIInfo;

function StatCard({ label, value, context }: GenUIStat) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
      <span className="text-xl font-semibold text-foreground tabular-nums">{value}</span>
      <div>
        <span className="text-[12px] text-foreground/80">{label}</span>
        {context && <span className="text-[11px] text-muted-foreground ml-1.5">{context}</span>}
      </div>
    </div>
  );
}

function ProjectCard({ title, description, tags, link }: GenUIProject) {
  const inner = (
    <div className="group flex flex-col gap-1 py-2 border-b border-border/30 last:border-0 cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">{title}</span>
        {link && <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">→</span>}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {tags.map((t, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>)}
        </div>
      )}
    </div>
  );
  return link ? <a href={link} className="block no-underline">{inner}</a> : inner;
}

function TimelineCard({ role, company, period, highlights }: GenUITimeline) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border/30 last:border-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium text-foreground">{role}</span>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{period}</span>
      </div>
      <span className="text-[11px] text-primary/80">{company}</span>
      {highlights && highlights.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {highlights.map((h, i) => <li key={i} className="text-[11px] text-muted-foreground flex gap-1"><span className="text-primary/60">·</span>{h}</li>)}
        </ul>
      )}
    </div>
  );
}

function SkillsCard({ categories }: GenUISkills) {
  return (
    <div className="py-2 border-b border-border/30 last:border-0 space-y-2">
      {categories.map((cat, i) => (
        <div key={i}>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{cat.name}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {cat.skills.map((s, j) => <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground/80 border border-border/40">{s}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuoteCard({ text }: GenUIQuote) {
  return (
    <div className="py-2 pl-3 border-l border-primary/40">
      <p className="text-[12px] text-foreground/80 italic leading-relaxed">{`\u201C${text}\u201D`}</p>
    </div>
  );
}

function ChartCard({ title, bars }: GenUIChart) {
  const maxVal = Math.max(...bars.map(b => b.value));
  return (
    <div className="py-2 border-b border-border/30 last:border-0">
      <span className="text-[11px] font-medium text-foreground/80 mb-2 block">{title}</span>
      <div className="space-y-1.5">
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16 truncate flex-shrink-0">{bar.label}</span>
            <div className="flex-1 h-4 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(bar.value / maxVal) * 100}%`, background: bar.color || 'hsl(var(--primary))' }}
              />
            </div>
            <span className="text-[10px] font-medium text-foreground/80 w-10 text-right flex-shrink-0">{bar.displayValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageCard({ src, alt, caption, link }: GenUIImage) {
  const img = (
    <div className="py-2 border-b border-border/30 last:border-0">
      <div className="rounded-lg overflow-hidden border border-border/30">
        <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
      </div>
      {caption && <p className="text-[10px] text-muted-foreground mt-1.5">{caption}</p>}
    </div>
  );
  return link ? <a href={link} className="block no-underline hover:opacity-90 transition-opacity">{img}</a> : img;
}

function InfoCard({ title, subtitle, body, icon }: GenUIInfo) {
  return (
    <div className="py-2 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-2">
        {icon && <span className="text-sm mt-0.5">{icon}</span>}
        <div>
          <span className="text-[12px] font-medium text-foreground">{title}</span>
          {subtitle && <span className="text-[11px] text-primary/80 block">{subtitle}</span>}
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{body}</p>
        </div>
      </div>
    </div>
  );
}

function GenUIBlock({ items }: { items: GenUIItem[] }) {
  return (
    <div className="mt-2.5 rounded-xl bg-background/40 border border-border/40 px-3 py-1 divide-y-0">
      {items.map((item, i) => {
        if (item.type === 'stat')       return <StatCard      key={i} {...item} />;
        if (item.type === 'project')    return <ProjectCard   key={i} {...item} />;
        if (item.type === 'timeline')   return <TimelineCard  key={i} {...item} />;
        if (item.type === 'skill_grid') return <SkillsCard    key={i} {...item} />;
        if (item.type === 'quote')      return <QuoteCard     key={i} {...item} />;
        if (item.type === 'chart')      return <ChartCard     key={i} {...item} />;
        if (item.type === 'image')      return <ImageCard     key={i} {...item} />;
        if (item.type === 'info')       return <InfoCard      key={i} {...item} />;
        return null;
      })}
    </div>
  );
}

// ─── Predefined Card Registry ────────────────────────────────────────────────
// AI picks IDs from this list — we control every render, zero hallucination risk

const CARD_REGISTRY: Record<string, GenUIItem> = {
  // Stats
  'stat:downloads':   { type: 'stat', value: '100k+', label: 'App Downloads',          context: 'Finshots · first year' },
  'stat:conversion':  { type: 'stat', value: '+17%',  label: 'Conversion Rate',         context: 'Ditto booking portal' },
  'stat:engagement':  { type: 'stat', value: '+92%',  label: 'User Engagement',          context: 'Nesoi.ai dashboards' },
  'stat:efficiency':  { type: 'stat', value: '+20%',  label: 'Team Efficiency',          context: 'Ditto CRM redesign' },
  'stat:rating':      { type: 'stat', value: '4.9★',  label: 'Play Store Rating',        context: 'Finshots' },
  'stat:subscribers': { type: 'stat', value: '500k+', label: 'Subscribers',              context: 'Finshots newsletter' },
  'stat:dropoff':     { type: 'stat', value: '-8%',   label: 'Drop-off Rate',            context: 'Ditto onboarding' },
  'stat:devtime':     { type: 'stat', value: '-30%',  label: 'Design-to-Dev Time',       context: 'Falcon Design System' },
  'stat:clients':     { type: 'stat', value: '15+',   label: 'Enterprise Clients',       context: 'Nesoi.ai' },
  'stat:coursetime':  { type: 'stat', value: '-37%',  label: 'Course Creation Time',     context: 'Nesoi.ai' },

  // Projects
  'project:finshots':   { type: 'project', title: 'Finshots News App',       description: 'Award-winning fintech mobile app. 100k+ downloads, 4.9★, Google Play Best App 2020.',          tags: ['Mobile', 'Fintech', 'UX'],         link: '/work?project=finshots-news-app' },
  'project:falcon':     { type: 'project', title: 'Falcon Design System',    description: 'Comprehensive design system for Ditto Insurance. Reduced design-to-dev time by 30%.',          tags: ['Design System', 'Figma'],          link: '/work?project=falcon-design-system' },
  'project:crm':        { type: 'project', title: 'CRM Redesign',            description: 'Internal CRM overhaul for Ditto Insurance. Boosted team efficiency by 20%.',                   tags: ['B2B', 'Product Design'],           link: '/work?project=crm-redesign' },
  'project:onboarding': { type: 'project', title: 'Onboarding Redesign',     description: '+17% conversion, -8% drop-off. Data-driven slot booking flow redesign.',                       tags: ['Conversion', 'UX Research'],       link: '/work?project=onboarding-redesign' },
  'project:booking':    { type: 'project', title: 'Booking Portal',          description: 'Full redesign using Double Diamond. WCAG 2.1 AA compliant. 17% conversion increase.',          tags: ['Accessibility', 'Web'],            link: '/work?project=booking-portal-redesign' },
  'project:nesoi':      { type: 'project', title: 'Nesoi.ai Dashboard',      description: 'AI-powered learning dashboards for 15+ enterprise clients. Engagement up 92%.',               tags: ['AI', 'Dashboard', 'B2B'] },

  // Timeline
  'timeline:wordsmith': { type: 'timeline', role: 'Product Designer', company: 'Wordsmith AI',    period: 'Apr 2026 – Jun 2026', highlights: ['AI-powered writing and content platform'] },
  'timeline:nesoi':     { type: 'timeline', role: 'Product Designer', company: 'Nesoi.ai',         period: 'Jul 2025 – Nov 2025', highlights: ['+92% engagement', '-37% course creation time', 'WCAG 2.1 AA'] },
  'timeline:ditto':     { type: 'timeline', role: 'Product Designer', company: 'Ditto Insurance',  period: 'Nov 2021 – Dec 2022', highlights: ['Falcon Design System', '+17% conversion', '+20% efficiency'] },
  'timeline:finshots':  { type: 'timeline', role: 'UI/UX Designer',   company: 'Finshots',         period: 'Aug 2019 – Oct 2021', highlights: ['Google Play Best App 2020', '100k+ downloads', '4.9★'] },

  // Skills
  'skills:design':    { type: 'skill_grid', categories: [{ name: 'Design',    skills: ['UX/UI', 'Interaction Design', 'Prototyping', 'Visual Design', 'Wireframing', 'Design Systems', 'Mockups'] }] },
  'skills:research':  { type: 'skill_grid', categories: [{ name: 'Research',  skills: ['User Interviews', 'User Testing', 'A/B Testing', 'Journey Mapping', 'Persona Creation', 'Information Architecture'] }] },
  'skills:software':  { type: 'skill_grid', categories: [{ name: 'Tools',     skills: ['Figma', 'Framer', 'Cursor', 'v0', 'Adobe XD', 'Principle', 'After Effects', 'HTML', 'CSS', 'JavaScript'] }] },

  // Quotes
  'quote:philosophy': { type: 'quote', text: 'Great design is invisible — it solves real problems while feeling effortless to the person using it.' },
  'quote:approach':   { type: 'quote', text: 'I balance creativity with practicality, always keeping the user at the center of every decision.' },
  'quote:systems':    { type: 'quote', text: 'A good design system isn\'t just a library of components — it\'s a shared language for the whole team.' },

  // Charts
  'chart:impact': { type: 'chart', title: 'Impact Across Roles', bars: [
    { label: 'Engagement', value: 92, displayValue: '+92%', color: 'hsl(var(--primary))' },
    { label: 'Conversion', value: 17, displayValue: '+17%', color: 'hsl(var(--primary) / 0.8)' },
    { label: 'Efficiency', value: 20, displayValue: '+20%', color: 'hsl(var(--primary) / 0.6)' },
    { label: 'Dev Time', value: 30, displayValue: '-30%', color: 'hsl(var(--primary) / 0.5)' },
  ]},
  'chart:downloads': { type: 'chart', title: 'Finshots Growth', bars: [
    { label: 'Downloads', value: 100, displayValue: '100k+' },
    { label: 'Subscribers', value: 500, displayValue: '500k+' },
    { label: 'Rating', value: 98, displayValue: '4.9★' },
  ]},
  'chart:skills': { type: 'chart', title: 'Skill Proficiency', bars: [
    { label: 'UX/UI', value: 95, displayValue: 'Expert' },
    { label: 'Prototyping', value: 90, displayValue: 'Expert' },
    { label: 'Research', value: 85, displayValue: 'Advanced' },
    { label: 'Design Sys', value: 92, displayValue: 'Expert' },
    { label: 'Frontend', value: 70, displayValue: 'Proficient' },
  ]},
  'chart:nesoi': { type: 'chart', title: 'Nesoi.ai Results', bars: [
    { label: 'Engagement', value: 92, displayValue: '+92%' },
    { label: 'Course Time', value: 37, displayValue: '-37%' },
    { label: 'Clients', value: 15, displayValue: '15+' },
  ]},

  // Images
  'image:finshots':  { type: 'image', src: '/finshots/image.png',             alt: 'Finshots News App',          caption: 'Finshots — Award-winning fintech news app',         link: '/work?project=finshots-news-app' },
  'image:falcon':    { type: 'image', src: '/falcon design system/image.png', alt: 'Falcon Design System',       caption: 'Falcon — Comprehensive design system for Ditto',    link: '/work?project=falcon-design-system' },
  'image:crm':       { type: 'image', src: '/CRM/prototype.gif',             alt: 'CRM Redesign Prototype',     caption: 'CRM Redesign — Interactive prototype',              link: '/work?project=crm-redesign' },
  'image:ditto':     { type: 'image', src: '/ditto insurance/1.png',         alt: 'Ditto Insurance',            caption: 'Ditto — Booking portal redesign',                   link: '/work?project=onboarding-redesign' },
  'image:nesoi':     { type: 'image', src: '/nesoi/final-prototype.png',     alt: 'Nesoi.ai Dashboard',         caption: 'Nesoi.ai — Enterprise learning dashboard' },
  'image:portrait':  { type: 'image', src: '/photos/MEE.png',               alt: 'Devadhathan M D',            caption: 'Devadhathan M D — Product Designer' },

  // Info cards
  'info:education':  { type: 'info', title: 'MSc User Experience Design', subtitle: 'Edinburgh Napier University', body: '2023–2024 · Edinburgh, UK. Specialized in UX research methods, interaction design, and human-computer interaction.', icon: '🎓' },
  'info:bsc':        { type: 'info', title: 'BSc Computer Science Engineering', subtitle: 'University of Kerala', body: 'Foundation in software engineering, data structures, and algorithms.', icon: '💻' },
  'info:award':      { type: 'info', title: 'Google Play Best App 2020', subtitle: 'Finshots News App', body: 'Recognized by Google for outstanding user experience, design quality, and engagement metrics.', icon: '🏆' },
  'info:cert:google': { type: 'info', title: 'Google UX Design Professional', subtitle: 'Google', body: 'Certified in user-centered design, wireframing, prototyping, and usability testing.', icon: '📜' },
  'info:cert:ibm':   { type: 'info', title: 'IBM Design Thinking Practitioner', subtitle: 'IBM', body: 'Certified in enterprise design thinking, team collaboration, and user outcomes framework.', icon: '📜' },
  'info:location':   { type: 'info', title: 'Based in Edinburgh, UK', subtitle: 'Originally from Kerala, India', body: 'Open to full-time Product Design roles. Available for remote or hybrid positions.', icon: '📍' },
  'info:contact':    { type: 'info', title: 'Get in Touch', subtitle: 'Open to opportunities', body: 'Email: hello@devadhathan.com · LinkedIn: devadhathan · Portfolio: devadhathan.com', icon: '✉️', link: '/contact' },
};

// ─────────────────────────────────────────────────────────────────────────────

interface SideAgentProps {
  onStateChange: (state: AgentState) => void;
  onAgentWorking?: (working: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  onExplanation?: (explanation: string | null) => void;
  onExplanationComplete?: (complete: boolean) => void;
  onGenUI?: (items: GenUIItem[] | null) => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
  externalCollapsed?: boolean;
  initialMode?: 'ask' | 'agent';
}

// --- 1. RICH CONTENT DATABASE (Source of Truth) ---
// This ensures cards always have descriptions and links, regardless of what the AI generates.
// Helper function to convert project title to ID (matching work page logic)
const getProjectIdFromTitle = (title: string): string => {
  return title.toLowerCase().trim().replace(/\s+/g, '-');
};

const CONTENT_DATABASE: Record<string, Partial<PortfolioSection> & { link?: string }> = {
  'falcon': {
    title: 'Falcon Design System',
    type: 'projects',
    description: 'A comprehensive design system for Ditto Insurance.',
    content: 'Built on principles of modularity and reusability, Falcon standardizes elements such as typography, color palettes, icons, and interactive components to streamline development.\n\n**Impact:**\n- Unified brand experience across platforms\n- Accelerated development cycles\n- Improved accessibility standards',
    link: `/work?project=${getProjectIdFromTitle('Falcon Design System')}`
  },
  'finshots': {
    title: 'Finshots News App',
    type: 'projects',
    description: 'Award-winning financial news application.',
    content: 'Redesigned the mobile experience to provide a centralized platform for financial insights.\n\n**Results:**\n- **100k+** Downloads\n- **4.9** Star Rating\n- Google Play "Best App of 2020"',
    link: `/work?project=${getProjectIdFromTitle('Finshots News App')}`
  },
  'onboarding': {
    title: 'Onboarding Redesign',
    type: 'projects',
    description: 'Optimized flow for insurance slot booking.',
    content: 'Reimagined the user journey to reduce friction and drop-offs.\n\n**Metrics:**\n- 17% increase in conversion\n- 8% reduction in drop-offs',
    link: `/work?project=${getProjectIdFromTitle('Onboarding Redesign')}`
  },
  'kiosk': {
    title: 'Sustainable Kiosk',
    type: 'projects',
    description: 'Academic UX research project.',
    content: 'Conducted field research and usability testing to design a user-centric kiosk interface for Edinburgh Napier University.'
  },
  'crm': {
    title: 'CRM Redesign',
    type: 'projects',
    description: 'Internal tool optimization for insurance agents.',
    content: ' streamlined workflows and reduced cognitive load.\n\n**Impact:** 20% boost in team efficiency and 30% faster task completion.',
    link: `/work?project=${getProjectIdFromTitle('CRM Redesign')}`
  },
  'booking': {
    title: 'Booking Portal Redesign',
    type: 'projects',
    description: 'Web portal redesign focused on conversion.',
    content: 'Applied the Double Diamond process to revamp the booking experience, achieving WCAG 2.1 AA accessibility compliance.',
    link: `/work?project=${getProjectIdFromTitle('Booking Portal Redesign')}`
  },
  'experience': {
    title: 'Work Experience',
    type: 'experience',
    description: 'Professional Timeline',
    content: resumeData.experience.map(exp => `**${exp.role}** @ ${exp.company} (${exp.period})`).join('\n\n')
  },
  'skills': {
    title: 'Skills & Tools',
    type: 'skills',
    description: 'Technical Competencies',
    content: `**Design:** ${resumeData.skills.design.join(', ')}\n\n**Research:** ${resumeData.skills.research.join(', ')}`
  }
};

export function SideAgent({ onStateChange, onAgentWorking, onCollapseChange, onExplanation, onExplanationComplete, onGenUI, resetRef, externalCollapsed, initialMode }: SideAgentProps) {
  const [agent] = useState(() => new PortfolioAgent());
  const [state, setState] = useState<AgentState>(agent.getState());
  const pendingSectionsRef = React.useRef<PortfolioSection[]>([]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [promptCount, setPromptCount] = useState(10); // Start with 10 prompts

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Track if component is mounted to prevent flash
  const [mounted, setMounted] = useState(false);
  
  // Initialize collapsed state - respect external prop first, otherwise default to collapsed
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // If external collapsed state is provided, use it immediately
    if (externalCollapsed !== undefined) {
      return externalCollapsed;
    }
    // Otherwise default to collapsed (true)
    return true;
  });

  // Set mounted after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with external collapsed state if provided
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  useEffect(() => {
    if (externalCollapsed !== undefined) {
      return;
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      const desktop = window.innerWidth >= 1280;
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
        onCollapseChange?.(true);
      } else if (desktop && isCollapsed) {
        setIsCollapsed(false);
        onCollapseChange?.(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [externalCollapsed, isCollapsed, onCollapseChange]);
  
  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };
  const handleSheetOpenChange = (open: boolean) => {
    const newCollapsed = !open;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'assistant'; content: string; isStreaming?: boolean; ui?: GenUIItem[] }>>([
    { role: 'agent', content: 'Hi! Ask me anything about Dev\'s work — try "Show me his impact metrics" or "What are his skills?" and I\'ll build a UI for you.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'agent' | 'ask'>(initialMode || 'ask');
  
  // Handler to safely change mode
  const handleModeChange = React.useCallback((newMode: 'agent' | 'ask') => {
    try {
      setMode(newMode);
    } catch (error) {
      console.error('Error changing mode:', error);
    }
  }, []);

  // Sync mode when initialMode changes (from floating button)
  useEffect(() => {
    if (initialMode !== undefined && initialMode !== mode) {
      handleModeChange(initialMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode]);

  // Reset to default when switching to ask mode
  const prevModeRef = React.useRef(mode);
  useEffect(() => {
    // Only reset when mode actually changes to 'ask', not on every render
    if (mode === 'ask' && prevModeRef.current !== 'ask') {
      try {
        // Reset agent to default state
        if (agent && typeof agent.reset === 'function') {
          agent.reset();
          const defaultState = agent.getState();
          setState(defaultState);
          onStateChange(defaultState);
        }
        if (onExplanation) {
          onExplanation(null);
        }
        if (onExplanationComplete) {
          onExplanationComplete(false);
        }
        // Clear any pending sections
        pendingSectionsRef.current = [];
      } catch (error) {
        console.error('Error resetting agent state:', error);
      }
    }
    prevModeRef.current = mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    onStateChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Initialize state on mount to ensure UI renders immediately
  useEffect(() => {
    const initialState = agent.getState();
    onStateChange(initialState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch initial prompt count from API on mount
  useEffect(() => {
    const fetchPromptCount = async () => {
      try {
        const response = await fetch('/api/check-prompt-limit');
        const data = await response.json();
        if (data.remaining !== undefined) {
          setPromptCount(data.remaining);
        }
      } catch (error) {
        console.error('Error fetching prompt count:', error);
        // Keep default value if API fails
      }
    };
    fetchPromptCount();
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Check IP-based prompt limit via API
    try {
      const limitCheck = await fetch('/api/check-prompt-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const limitData = await limitCheck.json();
      
      if (!limitData.allowed) {
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: `You've reached the prompt limit (${limitData.count}/${limitData.limit}). Please contact me at **${resumeData.email}** or connect on [LinkedIn](https://linkedin.com/${resumeData.linkedin}) to continue using the portfolio agent.` 
        }]);
        setPromptCount(0); // Update UI to show 0 remaining
        return;
      }
      
      // Update prompt count from API response
      if (limitData.remaining !== undefined) {
        setPromptCount(limitData.remaining);
      } else {
        // Fallback: decrement local count
        setPromptCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error checking prompt limit:', error);
      // Continue with local count check as fallback
      if (promptCount <= 0) {
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: 'You have reached the prompt limit. Please contact me to continue.' 
        }]);
        return;
      }
      setPromptCount(prev => Math.max(0, prev - 1));
    }

    // Add user message
    const userMessage = { role: 'user' as const, content: command };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Only show "agent working" in center section when in agent mode
    if (mode === 'agent') {
      onAgentWorking?.(true);
    }
    
    // Reset state before each command
    if (mode === 'agent') {
      onGenUI?.(null); // clear previous gen UI so home shows while loading
      if (onExplanation) onExplanation(null);
      if (onExplanationComplete) onExplanationComplete(false);
      pendingSectionsRef.current = [];
    } else if (mode === 'ask') {
      // In ask mode, reset to default bentos and clear explanation
      try {
        if (agent && typeof agent.reset === 'function') {
          agent.reset();
          const defaultState = agent.getState();
          setState(defaultState);
          onStateChange(defaultState);
        }
        if (onExplanation) {
          onExplanation(null);
        }
        if (onExplanationComplete) {
          onExplanationComplete(false);
        }
        pendingSectionsRef.current = [];
      } catch (error) {
        console.error('Error resetting in ask mode:', error);
      }
    }

     try {
         // Prepare context for OpenAI
         const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages
           .filter(msg => !msg.isStreaming && msg.role !== 'user')
           .map(msg => ({ role: msg.role === 'agent' ? 'assistant' as const : msg.role, content: msg.content }));

         // Different prompts for ask vs agent mode
         const systemPrompt = mode === 'ask'
           ? `You are a Gen UI Portfolio Assistant for Devadhathan M D, a Product Designer. You answer questions AND generate relevant UI components to make information visual and interactive.

ABOUT DEVADHATHAN:
- Product Designer, 5+ years experience
- Education: MSc User Experience Design, Edinburgh Napier University (2023-2024); BSc Computer Science Engineering
- Location: Edinburgh, UK (originally Kerala, India)
- Status: Actively looking for full-time Product Design roles

EXPERIENCE:
- Product Designer at Wordsmith AI (Apr–Jun 2026): Designed product experiences for an AI-powered writing and content platform.
- Product Designer at Nesoi.ai (July–Nov 2025): Adviser/client dashboards for 15+ enterprise clients. Engagement +92%, course-creation time -37%. WCAG 2.1 AA. Design system foundations.
- Product Designer at Ditto Insurance (Nov 2021–Dec 2022): Falcon Design System (design-to-dev time -30%), booking portal redesign (+17% conversion), CRM redesign (efficiency +20%).
- UI/UX Designer at Finshots (Aug 2019–Oct 2021): Award-winning fintech mobile app. Google Play Best App 2020. 100k+ downloads. 500k+ subscribers. 4.9 stars.

SKILLS:
Design: UX/UI, Interaction Design, Prototyping, Visual Design, Wireframing, Mockups, Design Systems
Research: User Interviews, User Testing, Information Architecture, A/B Testing, Journey Mapping, Persona Creation, Quantitative Analysis
Software: Figma, Cursor, v0, Framer, Sketch, Principle, Adobe XD, Illustrator, Photoshop, After Effects, HTML, CSS, JavaScript

PHILOSOPHY: User-centered design, iterative improvement, accessibility-first, data-driven decisions, scalable systems.

AWARDS: Google Play Best App 2020 (Finshots). Certifications: Google UX Design Professional, IBM Design Thinking Practitioner.

RESPONSE FORMAT — CRITICAL:
Write 2-3 sentences as a helpful, conversational reply with specific details (numbers, project names, highlights). Then on a NEW LINE output exactly:
CARDS:[id1,id2,id3]

Pick 2-6 card IDs from this list that best visualise the answer:

STATS: stat:downloads, stat:conversion, stat:engagement, stat:efficiency, stat:rating, stat:subscribers, stat:dropoff, stat:devtime, stat:clients, stat:coursetime
PROJECTS: project:finshots, project:falcon, project:crm, project:onboarding, project:booking, project:nesoi
TIMELINE: timeline:wordsmith, timeline:nesoi, timeline:ditto, timeline:finshots
SKILLS: skills:design, skills:research, skills:software
QUOTES: quote:philosophy, quote:approach, quote:systems
CHARTS: chart:impact, chart:downloads, chart:skills, chart:nesoi
IMAGES: image:finshots, image:falcon, image:crm, image:ditto, image:nesoi, image:portrait
INFO: info:education, info:bsc, info:award, info:cert:google, info:cert:ibm, info:location, info:contact

RULES:
- ALWAYS end with CARDS: followed by comma-separated IDs — use ONLY exact IDs from the list above
- No brackets, no quotes, no spaces around commas
- Text: 2-3 sentences, plain text, no markdown
- Match user intent to card types:
  impact/metrics/numbers → stat cards + chart:impact
  projects/work/case studies → project cards + image cards
  experience/career/timeline → timeline cards
  skills/tools → skills cards + chart:skills
  philosophy/approach → quote cards
  education/degree/university → info:education, info:bsc
  awards/certifications → info:award, info:cert:google, info:cert:ibm
  contact/hire/location → info:location, info:contact
  about/who/overview → image:portrait, info:location + stats
  show me everything → mix of chart:impact + project + timeline + image
  visuals/screenshots/designs → image cards
  graphs/charts/data → chart cards + stat cards

FORMAT (exactly like this):
Dev has delivered strong results across his roles — from 100k+ app downloads at Finshots to a 17% conversion boost at Ditto. Here are the key numbers.
CARDS:stat:downloads,stat:conversion,chart:impact`
           : `You are an intelligent portfolio agent for Devadhathan M D, a Product Designer. You generate UI cards that appear in the center of his portfolio page based on what the user asks.

ABOUT DEV:
- Product Designer at Wordsmith AI (Apr–Jun 2026)
- Product Designer at Nesoi.ai (Jul–Nov 2025): +92% engagement, -37% course creation time, 15+ enterprise clients
- Product Designer at Ditto Insurance (2021–2022): Falcon Design System (-30% dev time), +17% conversion, +20% efficiency
- UI/UX Designer at Finshots (2019–2021): 100k+ downloads, 4.9★, Google Play Best App 2020, 500k+ subscribers

RESPONSE FORMAT — STRICT:
Write 2-4 sentences as a friendly, conversational reply that adds context about what you're showing. Be enthusiastic and specific — mention actual numbers, project names, or highlights. Then on a NEW LINE output CARDS:[id1,id2,id3].

CARD IDs TO CHOOSE FROM:
STATS: stat:downloads, stat:conversion, stat:engagement, stat:efficiency, stat:rating, stat:subscribers, stat:dropoff, stat:devtime, stat:clients, stat:coursetime
PROJECTS: project:finshots, project:falcon, project:crm, project:onboarding, project:booking, project:nesoi
TIMELINE: timeline:wordsmith, timeline:nesoi, timeline:ditto, timeline:finshots
SKILLS: skills:design, skills:research, skills:software
QUOTES: quote:philosophy, quote:approach, quote:systems
CHARTS: chart:impact, chart:downloads, chart:skills, chart:nesoi
IMAGES: image:finshots, image:falcon, image:crm, image:ditto, image:nesoi, image:portrait
INFO: info:education, info:bsc, info:award, info:cert:google, info:cert:ibm, info:location, info:contact

MAPPING:
- "metrics" / "impact" / "numbers" / "results" → stat cards + chart:impact
- "projects" / "work" / "case studies" → project cards + image cards
- "experience" / "career" / "history" / "roles" → timeline cards
- "skills" / "tools" / "expertise" → skills cards + chart:skills
- "philosophy" / "approach" / "beliefs" → quote cards
- "education" / "degree" / "university" → info:education, info:bsc
- "awards" / "certifications" → info:award, info:cert:google, info:cert:ibm
- "contact" / "hire" / "location" → info:location, info:contact
- "about" / "who" / "overview" → image:portrait, info:location, chart:impact
- "everything" → chart:impact, project:finshots, timeline:ditto, image:falcon
- "visuals" / "screenshots" / "designs" → image cards
- "graphs" / "charts" / "data" → chart cards + stat cards
- specific project name → that project card + its image + related stats

ALWAYS end with CARDS: — never skip it. Use ONLY exact IDs from the list above. No brackets, no quotes, no spaces around commas.
EXAMPLE:
Dev has driven measurable impact across every role. At Finshots, the app hit 100k+ downloads and a 4.9-star rating. At Ditto, his booking portal redesign boosted conversions by 17%, and the CRM overhaul improved team efficiency by 20%. Here's a visual breakdown of his key metrics.
CARDS:chart:impact,stat:downloads,stat:conversion,image:finshots`;

         openAIMessages.unshift({
           role: 'system',
           content: systemPrompt
         });
         
         openAIMessages.push({ role: 'user', content: command });

        // user message was appended above (stale `messages` + 1), placeholder goes right after
        const placeholderIndex = messages.length + 1;
        setMessages(prev => {
          const withPlaceholder = [...prev, { role: 'agent' as const, content: 'Thinking...', isStreaming: true }];
          return withPlaceholder;
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: openAIMessages, stream: true }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        // ── STEP 1: Stream — just accumulate, show "Generating..." ──
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const json = JSON.parse(data);
                if (json.content) fullResponse += json.content;
              } catch (_) { /* skip */ }
            }
          }
        }

        // ── STEP 2: Parse CARDS from complete response ──
        const MARKER = /CARDS:?\s*\[?/;
        const markerMatch = MARKER.exec(fullResponse);
        let chatText = fullResponse;
        let cardIds: string[] = [];

        if (markerMatch) {
          chatText = fullResponse.substring(0, markerMatch.index).trim();
          const idsPart = fullResponse.substring(markerMatch.index + markerMatch[0].length);
          const raw = idsPart.replace(/\].*/s, '').replace(/[\[\]]/g, '').trim();
          cardIds = raw.split(',').map(s => s.trim().replace(/['"]/g, '').trim()).filter(Boolean);
        }

        // ── STEP 3: Resolve card IDs to registry items ──
        const allKeys = Object.keys(CARD_REGISTRY);
        const resolvedItems = cardIds.map(id => {
          if (CARD_REGISTRY[id]) return CARD_REGISTRY[id];
          // "statengagement" → "stat:engagement"
          const noColon = allKeys.find(k => k.replace(':', '') === id.replace(':', ''));
          if (noColon) return CARD_REGISTRY[noColon];
          // ":engagement" → "stat:engagement"
          if (id.startsWith(':')) {
            const found = allKeys.find(k => k.endsWith(':' + id.slice(1)));
            if (found) return CARD_REGISTRY[found];
          }
          // "engagement" → "stat:engagement"
          const byName = allKeys.find(k => k.split(':').pop() === id);
          if (byName) return CARD_REGISTRY[byName];
          // partial contains: id has "engagement" in it somewhere
          const contains = allKeys.find(k => {
            const suffix = k.split(':').pop() || '';
            return suffix.length > 3 && id.includes(suffix);
          });
          if (contains) return CARD_REGISTRY[contains];
          return null;
        }).filter(Boolean) as GenUIItem[];

        // Deduplicate
        const seen = new Set<GenUIItem>();
        const parsedItems = resolvedItems.filter(item => {
          if (seen.has(item)) return false;
          seen.add(item);
          return true;
        });

        const finalText = chatText.trim() || 'Here\u2019s what I found:';

        // ── STEP 4: Apply results ──
        if (mode === 'ask') {
            setMessages(prev => {
                const newM = [...prev];
                if (newM[placeholderIndex]) {
                    newM[placeholderIndex] = {
                        role: 'agent',
                        content: finalText,
                        ui: parsedItems.length > 0 ? parsedItems : undefined,
                        isStreaming: false
                    };
                }
                return newM;
            });
            setIsLoading(false);
            return;
        }

        // Agent mode
        if (parsedItems.length > 0) {
            onGenUI?.(parsedItems);
        }

        setMessages(prev => {
            const newM = [...prev];
            if (newM[placeholderIndex]) {
                newM[placeholderIndex] = {
                    role: 'agent',
                    content: finalText,
                    isStreaming: false
                };
            }
            return newM;
        });

        if (onExplanation) onExplanation(null);
        if (onExplanationComplete) onExplanationComplete(true);

    } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev.filter(m => !m.isStreaming), { 
            role: 'agent', 
            content: 'I encountered a connection error. Please try again.' 
        }]);
    } finally {
        setIsLoading(false);
        // Only update agent working state in agent mode
        if (mode === 'agent') {
          onAgentWorking?.(false);
        }
    }
  };

  const handleReset = () => {
    onGenUI?.(null);
    setMessages([{ role: 'agent', content: 'Hi! Ask me anything — try "show me metrics" or "what projects have you done?"' }]);
  };

  // Expose reset function via ref
  React.useEffect(() => {
    if (resetRef) {
      resetRef.current = handleReset;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetRef]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; // Max 200px height
  };

  return (
    <>
      {/* Desktop Chat - Centered bottom floating panel */}
      {mounted && !isCollapsed && (
        <div className="fixed z-40 hidden lg:block bottom-8 left-1/2 -translate-x-1/2">
          <style>{`
            @keyframes corb1 {
              0%   { transform: translate(0px,  0px)  scale(1);    }
              14%  { transform: translate(4px, -6px)  scale(1.10); }
              28%  { transform: translate(7px, -1px)  scale(1.18); }
              42%  { transform: translate(5px,  5px)  scale(1.08); }
              57%  { transform: translate(-2px, 7px)  scale(0.93); }
              71%  { transform: translate(-6px, 2px)  scale(0.88); }
              85%  { transform: translate(-3px,-5px)  scale(0.96); }
              100% { transform: translate(0px,  0px)  scale(1);    }
            }
            @keyframes corb2 {
              0%   { transform: translate(0px,  0px)  scale(1);    }
              18%  { transform: translate(-5px,-7px)  scale(1.12); }
              36%  { transform: translate(-8px,-2px)  scale(1.20); }
              54%  { transform: translate(-4px, 6px)  scale(1.10); }
              72%  { transform: translate(4px,  5px)  scale(0.91); }
              90%  { transform: translate(2px, -3px)  scale(0.97); }
              100% { transform: translate(0px,  0px)  scale(1);    }
            }
            @keyframes corb3 {
              0%   { transform: translate(0px,  0px)  scale(1);    }
              22%  { transform: translate(6px,  8px)  scale(1.11); }
              44%  { transform: translate(3px,  2px)  scale(1.06); }
              66%  { transform: translate(-8px,-5px)  scale(0.86); }
              88%  { transform: translate(-4px, 3px)  scale(0.94); }
              100% { transform: translate(0px,  0px)  scale(1);    }
            }
            @keyframes cnoise {
              0%   { transform: translate(0%,  0%)  rotate(0deg);  }
              16%  { transform: translate(-3%, 4%)  rotate(3deg);  }
              33%  { transform: translate(4%, -3%)  rotate(-2deg); }
              50%  { transform: translate(3%,  5%)  rotate(4deg);  }
              66%  { transform: translate(-4%,-2%)  rotate(-3deg); }
              83%  { transform: translate(2%, -4%)  rotate(2deg);  }
              100% { transform: translate(0%,  0%)  rotate(0deg);  }
            }
            @keyframes cwave1 {
              0%   { transform: translateX(-130%) rotate(-35deg); }
              100% { transform: translateX(160%)  rotate(-35deg); }
            }
            @keyframes cwave2 {
              0%   { transform: translateX(160%)  rotate(40deg); }
              100% { transform: translateX(-130%) rotate(40deg); }
            }
            @keyframes cwave3 {
              0%   { transform: translateX(-130%) rotate(-15deg); }
              100% { transform: translateX(160%)  rotate(-15deg); }
            }
            @keyframes cpanel {
              0%   { clip-path: inset(100% 0% 0% 0% round 24px); opacity: 0; }
              100% { clip-path: inset(0%   0% 0% 0% round 24px); opacity: 1; }
            }
            .cpanel-enter {
              animation: cpanel 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
          `}</style>

          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="chat-orb-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
          </svg>

          {/* Panel — grows from bottom center via clip-path */}
          <div className="cpanel-enter" style={{ willChange: 'clip-path, opacity' }}>
            <div className="w-[400px] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden" style={{ height: '560px' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">

                {/* Animated B&W orb — click collapses */}
                <button
                  onClick={handleCollapseToggle}
                  className="relative h-10 w-10 rounded-full overflow-hidden group flex-shrink-0 focus:outline-none"
                  title="Minimize"
                >
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 38% 36%, #d4d4d4 0%, #6b6b6b 40%, #1a1a1a 72%, #000000 100%)' }} />
                  {/* blob 1 — white light */}
                  <div className="absolute rounded-full" style={{ width: '72%', height: '72%', top: '2%', left: '2%', opacity: 0.55, background: 'radial-gradient(circle, #ffffff 0%, transparent 68%)', animation: 'corb1 9s ease-in-out infinite', willChange: 'transform' }} />
                  {/* blob 2 — black depth */}
                  <div className="absolute rounded-full" style={{ width: '68%', height: '68%', bottom: '-6%', right: '-6%', opacity: 0.72, background: 'radial-gradient(circle, #000000 0%, transparent 68%)', animation: 'corb2 12s ease-in-out infinite', willChange: 'transform' }} />
                  {/* blob 3 — grey swirl */}
                  <div className="absolute rounded-full" style={{ width: '58%', height: '58%', bottom: '14%', left: '6%', opacity: 0.38, background: 'radial-gradient(circle, #888888 0%, transparent 68%)', animation: 'corb3 15s ease-in-out infinite', willChange: 'transform' }} />
                  {/* animated noise */}
                  <div className="absolute mix-blend-overlay" style={{ inset: '-10%', opacity: 0.30, filter: 'url(#chat-orb-noise)', background: 'white', animation: 'cnoise 6s ease-in-out infinite', willChange: 'transform' }} />
                  {/* wave 1 — fast diagonal sweep left→right */}
                  <div className="absolute" style={{ inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
                    <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '18%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0.18) 60%, transparent 100%)', animation: 'cwave1 1.1s linear infinite', willChange: 'transform' }} />
                  </div>
                  {/* wave 2 — medium speed, opposite direction */}
                  <div className="absolute" style={{ inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
                    <div style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: '12%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0.10) 55%, transparent 100%)', animation: 'cwave2 1.7s linear infinite', willChange: 'transform' }} />
                  </div>
                  {/* wave 3 — slower, nearly horizontal */}
                  <div className="absolute" style={{ inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
                    <div style={{ position: 'absolute', top: '68%', left: 0, right: 0, height: '10%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)', animation: 'cwave3 2.4s linear infinite 0.4s', willChange: 'transform' }} />
                  </div>
                  {/* specular */}
                  <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 28% 26%, rgba(255,255,255,0.65) 0%, transparent 48%)' }} />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </div>
                </button>

                {/* Ask / Agent toggle */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-secondary border border-border">
                  <button
                    onClick={() => handleModeChange('ask')}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      mode === 'ask' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Ask
                  </button>
                  <button
                    onClick={() => handleModeChange('agent')}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      mode === 'agent' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Agent
                  </button>
                </div>

                {/* Minimize button */}
                <button onClick={handleCollapseToggle} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Minimize">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 py-2 space-y-3">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 max-w-[92%] text-[14px] leading-relaxed ${
                        message.role === 'user' ? 'bg-secondary text-foreground' : 'bg-muted text-foreground'
                      }`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                          {(() => {
                            const isThinking = message.content === 'Thinking...' || message.content.startsWith('Thinking...');
                            const isGenerating = message.content === 'Generating...' || message.content.startsWith('Generating...');
                            if (isThinking || isGenerating) {
                              return <p className="mb-0 text-muted-foreground animate-pulse">{message.content}</p>;
                            }
                            return (
                              <ReactMarkdown components={{
                                p: ({node: _node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node: _node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                a: ({node: _node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                strong: ({node: _node, ...props}) => <strong className="font-semibold" {...props} />,
                              }}>{message.content}</ReactMarkdown>
                            );
                          })()}
                        </div>
                        {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking...' && message.content !== 'Generating...' && !message.content.startsWith('Thinking...') && !message.content.startsWith('Generating...') && (
                          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-muted-foreground animate-pulse rounded-sm" />
                        )}
                        {!message.isStreaming && message.ui && message.ui.length > 0 && (
                          <GenUIBlock items={message.ui} />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="px-4 pb-5 pt-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-2.5">
                  <textarea
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyPress}
                    placeholder={isLoading ? 'Thinking...' : promptCount > 0 ? 'Or send a message...' : 'Prompt limit reached'}
                    disabled={isLoading || promptCount <= 0}
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-h-[20px] max-h-[120px] overflow-y-auto"
                  />
                  <button
                    onClick={() => handleCommand(input)}
                    disabled={isLoading || !input.trim()}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-80 transition-opacity"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Chat - Bottom Sheet */}
      {isMobile && (
          <Sheet open={!isCollapsed} onOpenChange={handleSheetOpenChange}>
          <SheetContent side="bottom" hideClose className="h-[85vh] p-0 flex flex-col">
              <div className="h-full p-4 flex flex-col">
                <Card className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-2 border-border/70 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2"><Smile className="h-5 w-5" /> Portfolio Agent</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8" title="Reset Layout"><RotateCcw className="h-4 w-4" /></Button>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Close chat">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  </CardHeader>
                    <Separator className="flex-shrink-0" />
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                      <ScrollArea className="flex-1 w-full min-h-0">
                        <div className="px-4">
                          <div className="space-y-4 py-4">
                            {messages.map((message, index) => (
                              <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {(message.role === 'agent' || message.role === 'assistant') && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Smile className="h-4 w-4" /></AvatarFallback></Avatar>}
                                <div className={`rounded-lg px-4 py-2 max-w-[85%] relative overflow-hidden ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                  <div className="text-sm prose dark:prose-invert max-w-none break-words">
                                    {(() => {
                                      const isThinking = message.content === 'Thinking...' || message.content.startsWith('Thinking...');
                                      const isGenerating = message.content === 'Generating...' || message.content.startsWith('Generating...');
                                      const shimmerClass = (isThinking || isGenerating) ? 'bg-gradient-to-r from-foreground/80 via-foreground/40 to-foreground/80 bg-[length:200%_100%] animate-[text-shimmer_2s_infinite] bg-clip-text text-transparent' : '';
                                      
                                      if (isThinking || isGenerating) {
                                        return <p className={`mb-2 last:mb-0 ${shimmerClass}`}>{message.content}</p>;
                                      }
                                      
                                      return (
                                        <ReactMarkdown components={{
                                            p: ({node: _node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({node: _node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                            a: ({node: _node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                            strong: ({node: _node, ...props}) => <strong className="font-bold" {...props} />,
                                        }}>{message.content}</ReactMarkdown>
                                      );
                                    })()}
                                  </div>
                                  {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking...' && message.content !== 'Generating...' && !message.content.startsWith('Thinking...') && !message.content.startsWith('Generating...') && (
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/50 animate-pulse" />
                                  )}
                                  {!message.isStreaming && message.ui && message.ui.length > 0 && (
                                    <GenUIBlock items={message.ui} />
                                  )}
                                </div>
                                {message.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary"><User className="h-4 w-4" /></AvatarFallback></Avatar>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                    <Separator className="flex-shrink-0" />
                    <CardContent className="pt-4 pb-4 flex-none mt-auto">
                      <div className="flex flex-col gap-3 border border-border/50 rounded-lg bg-card backdrop-blur-sm p-3">
                        <div className="relative">
                          <textarea
                            value={input}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyPress}
                            placeholder={isLoading ? "Thinking..." : promptCount > 0 ? `Type a command... (${promptCount} prompts left)` : "Prompt limit reached"}
                            disabled={isLoading || promptCount <= 0}
                            rows={1}
                            className="w-full resize-none bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono min-h-[24px] max-h-[200px] overflow-y-auto"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                            }}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {input.length > 0 && (
                              <span className="text-xs text-muted-foreground/40 font-mono">
                                {input.split('\n').length}L
                              </span>
                            )}
                            {promptCount > 0 && (
                              <span className="text-xs text-muted-foreground/60 font-mono">
                                {promptCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 p-0.5 rounded-full bg-secondary/40 border border-border/30">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleModeChange('ask');
                                }}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                  mode === 'ask'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <MessageCircle className="h-3 w-3" />
                                Ask
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleModeChange('agent');
                                }}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                  mode === 'agent'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Sparkles className="h-3 w-3" />
                                Agent
                              </button>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleCommand(input)} 
                            size="sm"
                            disabled={isLoading || !input.trim()}
                            className="h-7 px-3 text-xs font-medium rounded-full"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
      )}
    </>
  );
}
