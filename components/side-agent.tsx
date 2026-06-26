'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, RotateCcw, ChevronDown, Smile } from 'lucide-react';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { PortfolioAgent, AgentState, PortfolioSection } from '@/lib/agent';
import { resumeData } from '@/lib/resume-data';
import ReactMarkdown from 'react-markdown';
import {
  resolveCardIds,
  type GenUIItem,
  type GenUIStat,
  type GenUIProject,
  type GenUITimeline,
  type GenUISkills,
  type GenUIQuote,
  type GenUIChart,
  type GenUIImage,
  type GenUIVideo,
  type GenUIInfo,
  type GenUIFeature,
  type GenUIFeatureSection,
} from '@/lib/gen-ui-registry';
import { FeatureCard, FeatureSection } from '@/components/line-illustrations';
import { AgentThinkingIndicator } from '@/components/agent-thinking-indicator';
import type { LayoutActionCommand } from '@/lib/agent-loop';
import { inferSkeletonFromPrompt, type CardSkeletonType } from '@/lib/infer-skeleton';import { enrichGenUIItems, isWordsmithQuery, WORDSMITH_LOCKED_MESSAGE } from '@/lib/enrich-gen-ui';
import { inferGenUIBuild } from '@/lib/infer-gen-ui-build';

export type { GenUIItem, GenUIStat, GenUIProject, GenUITimeline, GenUISkills, GenUIQuote, GenUIChart, GenUIImage, GenUIVideo, GenUIInfo, GenUIFeature, GenUIFeatureSection };

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

function VideoCard({ src, alt, caption, poster, link }: GenUIVideo) {
  const block = (
    <div className="py-2 border-b border-border/30 last:border-0">
      <div className="rounded-lg overflow-hidden border border-border/30 bg-black/20">
        <video src={src} poster={poster} controls playsInline preload="metadata" className="w-full h-auto" aria-label={alt} />
      </div>
      {caption && <p className="text-[10px] text-muted-foreground mt-1.5">{caption}</p>}
    </div>
  );
  return link ? <a href={link} className="block no-underline hover:opacity-90 transition-opacity">{block}</a> : block;
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
    <div className="mt-2.5 space-y-2.5">
      {items.map((item, i) => {
        if (item.type === 'feature_section') {
          return (
            <div key={i} className="rounded-xl bg-background/40 border border-border/40 overflow-hidden scale-[0.98] origin-top">
              <FeatureSection headline={item.headline} features={item.features} />
            </div>
          );
        }
        if (item.type === 'feature') {
          return (
            <div key={i} className="rounded-xl bg-background/40 border border-border/40 px-3">
              <FeatureCard {...item} variant="compact" />
            </div>
          );
        }
        return (
          <div key={i} className="rounded-xl bg-background/40 border border-border/40 px-3 py-1">
            {item.type === 'stat' && <StatCard {...item} />}
            {item.type === 'project' && <ProjectCard {...item} />}
            {item.type === 'timeline' && <TimelineCard {...item} />}
            {item.type === 'skill_grid' && <SkillsCard {...item} />}
            {item.type === 'quote' && <QuoteCard {...item} />}
            {item.type === 'chart' && <ChartCard {...item} />}
            {item.type === 'image' && <ImageCard {...item} />}
            {item.type === 'video' && <VideoCard {...item} />}
            {item.type === 'info' && <InfoCard {...item} />}
          </div>
        );
      })}
    </div>
  );
}

// CARD_REGISTRY lives in @/lib/gen-ui-registry

// ─────────────────────────────────────────────────────────────────────────────

interface SideAgentProps {
  onStateChange: (state: AgentState) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  onExplanation?: (explanation: string | null) => void;
  onExplanationComplete?: (complete: boolean) => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
  externalCollapsed?: boolean;
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

const ASK_WELCOME =
  'Hi! Ask me anything about Dev\'s work — career, projects, skills, or impact. I\'ll answer here with cards and context. Try "What are his skills?" or "Tell me about Finshots."';

export function SideAgent({ onStateChange, onCollapseChange, onExplanation, onExplanationComplete, resetRef, externalCollapsed }: SideAgentProps) {
  const [agent] = useState(() => new PortfolioAgent());
  const [state, setState] = useState<AgentState>(agent.getState());
  const pendingSectionsRef = React.useRef<PortfolioSection[]>([]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [promptCount, setPromptCount] = useState(10); // Start with 10 prompts

  // ─── Orb: white ovals (random gaze + blink) and click-to-grow ───
  const orbRef = useRef<HTMLButtonElement>(null);
  const [orbPupil, setOrbPupil] = useState({ x: 0, y: 0 });
  const [orbBlink, setOrbBlink] = useState(false);
  const [orbGrown, setOrbGrown] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const max = 3; // px the oval can travel from center
    const scheduleGaze = () => {
      timer = setTimeout(() => {
        // Occasionally re-center, otherwise dart to a random direction.
        if (Math.random() < 0.25) {
          setOrbPupil({ x: 0, y: 0 });
        } else {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.5 + Math.random() * 0.5;
          setOrbPupil({ x: Math.cos(angle) * max * dist, y: Math.sin(angle) * max * dist });
        }
        scheduleGaze();
      }, 900 + Math.random() * 1600);
    };
    scheduleGaze();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        setOrbBlink(true);
        openTimer = setTimeout(() => setOrbBlink(false), 130);
        scheduleBlink();
      }, 2500 + Math.random() * 3500);
    };
    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  // Shrink the orb back when clicking anywhere outside it.
  useEffect(() => {
    if (!orbGrown) return;
    const handleDown = (e: MouseEvent) => {
      if (orbRef.current && !orbRef.current.contains(e.target as Node)) {
        setOrbGrown(false);
      }
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [orbGrown]);

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
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'assistant'; content: string; isStreaming?: boolean; uiLoading?: boolean; ui?: GenUIItem[]; skeletonTypes?: CardSkeletonType[] }>>(() => [
    { role: 'agent', content: ASK_WELCOME },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const [isLoading, setIsLoading] = useState(false);

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

    const skeletonTypes = inferSkeletonFromPrompt(command);

    // Reset layout/explanation state before each ask command
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

     try {
        const conversationHistory = messages
          .filter((msg) => !msg.isStreaming && (msg.role === 'user' || msg.role === 'agent'))
          .map((msg) => ({
            role: (msg.role === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: msg.content,
          }));

        conversationHistory.push({ role: 'user', content: command });

        setMessages((prev) => [
          ...prev,
          {
            role: 'agent' as const,
            content: 'Thinking…',
            isStreaming: true,
            uiLoading: true,
            skeletonTypes,
          },
        ]);

        const sectionSnapshot = agent.getState().sections.map((s) => ({
          id: s.id,
          title: s.title,
          visible: s.visible,
          priority: s.priority,
          order: s.order,
        }));

        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            mode: 'ask',
            sections: sectionSnapshot,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || 'Agent request failed');
        }

        const result = (await response.json()) as {
          message: string;
          cardIds: string[];
          layoutCommands: LayoutActionCommand[];
          steps: Array<{ tool: string; args: Record<string, unknown>; result: string }>;
          iterations: number;
          buildViewport?: boolean;
        };

        const priorMessages = messages
          .filter((msg) => !msg.isStreaming && (msg.role === 'user' || msg.role === 'agent'))
          .map((msg) => ({
            role: msg.role === 'agent' ? 'assistant' : 'user',
            content: msg.content,
          }));

        const wordsmithQuery = isWordsmithQuery(command);
        const shouldBuildViewport = inferGenUIBuild({
          mode: 'ask',
          command,
          result,
          priorMessages,
        });

        const parsedItems = shouldBuildViewport
          ? resolveCardIds(result.cardIds || [])
          : [];
        const stepNote =
          result.steps?.length > 0 && !wordsmithQuery && shouldBuildViewport
            ? `\n\n_${result.steps.length} tool step${result.steps.length === 1 ? '' : 's'} · ${result.iterations} loop iteration${result.iterations === 1 ? '' : 's'}_`
            : '';
        const finalText = wordsmithQuery
          ? WORDSMITH_LOCKED_MESSAGE
          : (result.message || (shouldBuildViewport ? "Here's what I found." : '')).trim() + stepNote;

        const enrichedItems = shouldBuildViewport
          ? enrichGenUIItems(parsedItems, command)
          : [];

        const agentMessage = {
          role: 'agent' as const,
          content: finalText,
          ui: enrichedItems.length > 0 ? enrichedItems : undefined,
          isStreaming: false,
          uiLoading: false,
        };

        setMessages((prev) => {
          const streamingIndex = prev.findIndex((m) => m.isStreaming);
          if (streamingIndex === -1) return [...prev, agentMessage];
          const next = [...prev];
          next[streamingIndex] = agentMessage;
          return next;
        });

    } catch (error) {
        console.error('Error:', error);
        setMessages((prev) => {
          const withoutStreaming = prev.filter((m) => !m.isStreaming);
          return [
            ...withoutStreaming,
            { role: 'agent' as const, content: 'I encountered a connection error. Please try again.' },
          ];
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'agent', content: ASK_WELCOME }]);
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

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-size the message box to its content — grows on paste/typing and
  // collapses back when the value is cleared (e.g. after sending). Driving
  // this from `input` (not onChange) ensures it also resets on programmatic
  // clears. The CSS `max-h-*` class caps the height and enables scrolling.
  useEffect(() => {
    for (const el of [inputRef.current, mobileInputRef.current]) {
      if (!el) continue;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [input]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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

                {/* Animated B&W orb — click to grow / shrink */}
                <button
                  ref={orbRef}
                  onClick={() => setOrbGrown((g) => !g)}
                  className="relative h-10 w-10 rounded-full overflow-hidden group flex-shrink-0 focus:outline-none"
                  style={{ transform: `scale(${orbGrown ? 1.7 : 1})`, transformOrigin: 'center', transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  title={orbGrown ? 'Shrink' : 'Enlarge'}
                >
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 38% 36%, #9a9a9a 0%, #454545 40%, #101010 72%, #000000 100%)' }} />
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

                  {/* Glowing white ovals that glance around in random directions */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      gap: '5px',
                      transform: `translate(${orbPupil.x}px, ${orbPupil.y}px) translateY(-4%)`,
                      transition: 'transform 260ms ease-out',
                      pointerEvents: 'none',
                    }}
                  >
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '22%',
                          height: '30%',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #f3f3f3 70%, #dcdcdc 100%)',
                          transform: `scaleY(${orbBlink ? 0.12 : 1})`,
                          transition: 'transform 90ms ease',
                        }}
                      />
                    ))}
                  </div>
                </button>

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
                            const isThinking = message.content === 'Thinking…' || message.content.startsWith('Thinking');
                            const isBuilding = message.content === 'Building UI…' || message.content.startsWith('Building UI');
                            if (isThinking || isBuilding) {
                              return (
                                <AgentThinkingIndicator label={message.content} />
                              );
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
                        {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking…' && message.content !== 'Building UI…' && !message.content.startsWith('Thinking') && !message.content.startsWith('Building UI') && (
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
                    ref={inputRef}
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
                                      const isThinking = message.content === 'Thinking…' || message.content.startsWith('Thinking');
                                      const isBuilding = message.content === 'Building UI…' || message.content.startsWith('Building UI');

                                      if (isThinking || isBuilding) {
                                        return (
                                          <AgentThinkingIndicator label={message.content} />
                                        );
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
                                  {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking…' && message.content !== 'Building UI…' && !message.content.startsWith('Thinking') && !message.content.startsWith('Building UI') && (
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
                            ref={mobileInputRef}
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
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
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
