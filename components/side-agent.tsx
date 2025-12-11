'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, RotateCcw, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Smile, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PortfolioAgent, AgentCommand, AgentState, PortfolioSection } from '@/lib/agent';
import { resumeData } from '@/lib/resume-data';
import { ResizableChat } from './resizable-chat';
import ReactMarkdown from 'react-markdown';

interface SideAgentProps {
  onStateChange: (state: AgentState) => void;
  onAgentWorking?: (working: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  onExplanation?: (explanation: string | null) => void;
  onExplanationComplete?: (complete: boolean) => void;
}

// --- 1. RICH CONTENT DATABASE (Source of Truth) ---
// This ensures cards always have descriptions and links, regardless of what the AI generates.
const CONTENT_DATABASE: Record<string, Partial<PortfolioSection> & { link?: string }> = {
  'falcon': {
    title: 'Falcon Design System',
    type: 'projects',
    description: 'A comprehensive design system for Ditto Insurance.',
    content: 'Built on principles of modularity and reusability, Falcon standardizes elements such as typography, color palettes, icons, and interactive components to streamline development.\n\n**Impact:**\n- Unified brand experience across platforms\n- Accelerated development cycles\n- Improved accessibility standards',
    link: 'https://devadhathan.com/design-system3'
  },
  'finshots': {
    title: 'Finshots News App',
    type: 'projects',
    description: 'Award-winning financial news application.',
    content: 'Redesigned the mobile experience to provide a centralized platform for financial insights.\n\n**Results:**\n- **100k+** Downloads\n- **4.9** Star Rating\n- Google Play "Best App of 2020"',
    link: 'https://devadhathan.com/finshots-new'
  },
  'onboarding': {
    title: 'Ditto Onboarding',
    type: 'projects',
    description: 'Optimized flow for insurance slot booking.',
    content: 'Reimagined the user journey to reduce friction and drop-offs.\n\n**Metrics:**\n- 17% increase in conversion\n- 8% reduction in drop-offs',
    link: 'https://devadhathan.com/ditto-onboarding'
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
    content: ' streamlined workflows and reduced cognitive load.\n\n**Impact:** 20% boost in team efficiency and 30% faster task completion.'
  },
  'booking': {
    title: 'Booking Portal',
    type: 'projects',
    description: 'Web portal redesign focused on conversion.',
    content: 'Applied the Double Diamond process to revamp the booking experience, achieving WCAG 2.1 AA accessibility compliance.'
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

export function SideAgent({ onStateChange, onAgentWorking, onCollapseChange, onExplanation, onExplanationComplete }: SideAgentProps) {
  const [agent] = useState(() => new PortfolioAgent());
  const [state, setState] = useState<AgentState>(agent.getState());
  const pendingSectionsRef = React.useRef<PortfolioSection[]>([]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [promptCount, setPromptCount] = useState(10); // Start with 10 prompts

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize collapsed state based on screen size - desktop starts open, mobile starts collapsed
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024; // Start collapsed on mobile/tablet, open on desktop
    }
    return false; // Default to open (desktop-first)
  });

  // Update collapsed state when screen size changes
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      if (mobile && !isCollapsed) {
        // If switching to mobile and chat is open, collapse it
        setIsCollapsed(true);
      } else if (!mobile && isCollapsed) {
        // If switching to desktop and chat is collapsed, open it
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed]);
  
  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'assistant'; content: string; isStreaming?: boolean }>>([
    { role: 'agent', content: 'Hi! I can help you navigate. Try saying "Show me the design system" or "List the projects".' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'agent' | 'ask'>('agent');

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
    onAgentWorking?.(true);
    
    // Reset explanation and pending sections if in agent mode - do this BEFORE setting loading
    if (mode === 'agent') {
      if (onExplanation) {
        onExplanation(null);
      }
      if (onExplanationComplete) {
        onExplanationComplete(false);
      }
      pendingSectionsRef.current = [];
    }

     try {
         // Prepare context for OpenAI
         const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages
           .filter(msg => !msg.isStreaming && msg.role !== 'user')
           .map(msg => ({ role: msg.role === 'agent' ? 'assistant' as const : msg.role, content: msg.content }));

         // HYBRID PROMPT: Allows both Text AND JSON
         openAIMessages.unshift({
           role: 'system',
           content: `You are a helpful Portfolio Assistant for Devadhathan M D, a Product Designer.

ABOUT DEVADHATHAN:
Devadhathan M D is a Product Designer with extensive experience in UX/UI design, design systems, and user-centered design. He holds a Master's in User Experience Design from Edinburgh Napier University (2023-2024) and a Bachelor's in Computer Science Engineering.

CURRENT EXPERIENCE:
- Product Designer at Nesoi.ai (July 2025 - November 2025): Designed adviser/client-facing dashboards for 15+ enterprise clients, improving engagement by 92% and reducing course-creation time by 37%. Led accessibility integration (WCAG 2.1 AA) and strengthened design system foundations.

PREVIOUS EXPERIENCE:
- Product Designer at Ditto Insurance (2021-2022): Created the Falcon Design System, redesigned booking portal (17% conversion increase), redesigned internal CRM (20% efficiency improvement). Applied Double Diamond process and user research methodologies.
- UI/UX Designer at Finshots (2019-2021): Designed award-winning mobile app, contributed to Google Play "Best App of 2020" award, helped achieve 100k+ downloads and 500k+ subscribers.

DESIGN PHILOSOPHY & APPROACH:
Devadhathan emphasizes user-centered design, iterative improvement, and collaboration. He balances creativity with practicality, focuses on accessibility, creates scalable design systems, and uses data-driven insights. His work demonstrates a strong commitment to solving real problems while maintaining design consistency and brand integrity.

KEY SKILLS & EXPERTISE:
Design: UX/UI, Interaction Design, Prototyping, Visual Design, Wireframing, Mockups
Research: User Interviews, User Testing, Information Architecture, A/B Testing, Journey Mapping, Persona Creation
Software: Figma, Sketch, Principle, Adobe XD, Illustrator, Photoshop, After Effects, HTML, CSS, JavaScript

AVAILABLE CONTENT IDs:
- 'falcon' (Design System)
- 'finshots' (App)
- 'onboarding' (Web Flow)
- 'kiosk' (Research)
- 'crm' (Internal Tool)
- 'booking' (Portal)
- 'experience' (Timeline)
- 'skills' (List)

INSTRUCTIONS:
1. Answer the user's request conversationally with COMPREHENSIVE, DETAILED explanations (5-8 sentences). Base your response on:
   - The user's specific prompt/question
   - Devadhathan's profile, experience, and achievements above
   - The specific projects/items they're asking about
   - Relevant design philosophy, methodologies, and impact
   - Connections between different aspects of his work
   - Industry context and best practices
   
   Be informative, engaging, and thorough. Provide rich context including design philosophy, methodology, challenges overcome, impact on users and business, technical considerations, and insights. Connect the user's request to Devadhathan's broader experience and expertise.

2. If they want to SEE projects/content, append a JSON array of IDs at the very end. CRITICAL: 
   - If user asks for "projects" or mentions specific project names, ONLY include project IDs: 'falcon', 'finshots', 'onboarding', 'kiosk', 'crm', 'booking'
   - NEVER include 'experience' or 'skills' when user asks for projects
   - If user asks for "experience", ONLY include 'experience'
   - If user asks for "skills", ONLY include 'skills'
   - Be extremely selective - only match exactly what was requested

3. Use "priority": "high" for the most important item.

4. PROJECT IDs ONLY: 'falcon', 'finshots', 'onboarding', 'kiosk', 'crm', 'booking'
   NON-PROJECT IDs: 'experience', 'skills' - These are separate and should NEVER be mixed with projects.

EXAMPLE RESPONSE:
"Based on your request, I've curated a selection of Devadhathan's most notable projects that demonstrate his expertise in product design and user experience. The Finshots app stands out as an award-winning fintech application that revolutionized how users consume financial news, achieving over 100k downloads and a 4.9-star rating on Google Play. The app's success stems from its intuitive interface design that simplifies complex financial information, making it accessible to everyday users. Additionally, the Falcon Design System showcases Devadhathan's ability to create scalable, systematic design solutions that enhance team efficiency and maintain brand consistency across multiple platforms. This comprehensive design system includes standardized components, typography, color palettes, and interaction patterns that accelerated development cycles while improving accessibility standards. These projects collectively highlight Devadhathan's strength in balancing user-centered design principles with technical constraints, creating meaningful digital experiences that drive both user satisfaction and business value."
[{"id": "finshots", "priority": "high"}, {"id": "falcon", "priority": "medium"}]
`,
        });
        
        openAIMessages.push({ role: 'user', content: command });

        const placeholderIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'agent', content: 'Thinking...', isStreaming: true }]);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: openAIMessages, stream: true }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        let fullResponse = '';
        let visibleText = ''; // What shows in chat
        let explanationText = ''; // What shows in center section (agent mode)
        let jsonBuffer = '';  // What we collect for logic
        let isCollectingJson = false;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') break;
                try {
                  const json = JSON.parse(data);
                  if (json.content) {
                    const contentFragment = json.content;
                    fullResponse += contentFragment;

                    // --- HYBRID PARSING LOGIC ---
                    
                    // If we haven't found JSON yet, check for it
                    if (!isCollectingJson) {
                        const bracketIndex = contentFragment.indexOf('[');
                        if (bracketIndex !== -1) {
                            // Found the start of JSON!
                            isCollectingJson = true;
                            onAgentWorking?.(true); // Spin the gear icon
                            
                            // Split the chunk: Text part vs JSON part
                            const textPart = contentFragment.substring(0, bracketIndex);
                            visibleText += textPart;
                            explanationText += textPart;
                            jsonBuffer += contentFragment.substring(bracketIndex);
                            
                            // Final update of explanation before cards are generated
                            // Only if we're actually streaming
                            if (mode === 'agent' && isLoading && onExplanation && explanationText.trim().length > 0) {
                                onExplanation(explanationText);
                            }
                            
                            // Update message to "Generating..." when JSON starts
                            if (mode === 'agent') {
                                setMessages(prev => {
                                    const newM = [...prev];
                                    if (newM[placeholderIndex]) {
                                        newM[placeholderIndex] = { 
                                            role: 'agent', 
                                            content: 'Generating...', 
                                            isStreaming: true 
                                        };
                                    }
                                    return newM;
                                });
                            }
                        } else {
                            // It's all text
                            visibleText += contentFragment;
                            
                            // In agent mode, stream explanation to center section immediately
                            // Always accumulate explanation text when in agent mode
                            if (mode === 'agent') {
                                explanationText += contentFragment;
                                // Pass explanation immediately as it streams (no delay)
                                if (onExplanation && isLoading && explanationText.trim().length > 0) {
                                    onExplanation(explanationText);
                                }
                            }
                        }
                    } else {
                        // We are in JSON mode - hide everything from chat
                        jsonBuffer += contentFragment;
                    }

                    // Update Chat UI - in agent mode, show brief status, not explanation text
                    setMessages(prev => {
                        const newM = [...prev];
                        if (newM[placeholderIndex]) {
                            let chatContent = '...';
                            if (mode === 'agent') {
                                // In agent mode, don't show explanation in chat
                                if (isCollectingJson) {
                                    chatContent = 'Generating...';
                                } else if (explanationText.trim().length > 0) {
                                    chatContent = 'Generating...';
                                } else {
                                    chatContent = 'Thinking...';
                                }
                            } else {
                                // In ask mode, show the text
                                chatContent = visibleText || '...';
                            }
                            
                            newM[placeholderIndex] = { 
                                role: 'agent', 
                                content: chatContent,
                                isStreaming: true 
                            };
                        }
                        return newM;
                    });
                  }
                } catch (e) { /* skip */ }
              }
            }
          }
        }
        
        // --- FINALIZATION ---
        
        let generatedSections: PortfolioSection[] = [];
        
        // 1. Process JSON if we found any
        if (isCollectingJson || jsonBuffer.trim().startsWith('[')) {
            // Fallback: if isCollectingJson wasn't triggered but fullResponse starts with [
            if (!isCollectingJson) jsonBuffer = fullResponse;

            try {
                // Cleanup markdown if present
                const cleanJson = jsonBuffer.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponseItems = JSON.parse(cleanJson);
                
                // Map IDs to Rich Content and filter appropriately
                const userCommandLower = command.toLowerCase();
                const isProjectRequest = userCommandLower.includes('project') || 
                                        userCommandLower.includes('falcon') || 
                                        userCommandLower.includes('finshots') || 
                                        userCommandLower.includes('onboarding') || 
                                        userCommandLower.includes('kiosk') || 
                                        userCommandLower.includes('crm') || 
                                        userCommandLower.includes('booking');
                
                generatedSections = aiResponseItems
                    .map((item: any) => {
                        const dbItem = CONTENT_DATABASE[item.id];
                        if (!dbItem) return null;
                        
                        // Filter: if asking for projects, exclude skills and experience
                        if (isProjectRequest && (item.id === 'skills' || item.id === 'experience')) {
                            return null;
                        }
                        
                        // Filter: if asking for specific types, only include matching types
                        const dbItemType = dbItem.type;
                        if (isProjectRequest && dbItemType !== 'projects') {
                            return null;
                        }
                        
                        // Create proper link object if link exists
                        const links = dbItem.link ? [{ label: 'View Project', url: dbItem.link }] : [];

                        return {
                            id: item.id,
                            priority: item.priority || 'medium',
                            visible: true,
                            order: 0,
                            ...dbItem,
                            links: links // Inject link here
                        };
                    })
                    .filter(Boolean) as PortfolioSection[];

                if (generatedSections.length > 0) {
                    // Store sections but don't update state yet - wait for explanation to complete
                    if (mode === 'agent') {
                        pendingSectionsRef.current = generatedSections;
                        
                        // Ensure explanation is finalized and passed - this is critical
                        if (onExplanation && explanationText.trim().length > 0) {
                            onExplanation(explanationText.trim());
                        } else if (onExplanation && explanationText.trim().length === 0) {
                            // If no explanation was generated, pass a brief one
                            onExplanation(`Generated ${generatedSections.length} ${generatedSections.length === 1 ? 'card' : 'cards'} based on your request.`);
                        }
                        
                        // First, wait for explanation animation to complete
                        setTimeout(() => {
                            // Mark explanation as complete first
                            if (onExplanationComplete) {
                                onExplanationComplete(true);
                            }
                            
                            // Then after a delay, show the cards
                            setTimeout(() => {
                                const generateCommand: AgentCommand = {
                                    type: 'generate',
                                    sections: pendingSectionsRef.current,
                                };
                                
                                const newState = agent.executeCommand(generateCommand);
                                setState(newState);
                                onStateChange(newState);
                                pendingSectionsRef.current = [];
                            }, 800); // Delay before showing cards after explanation completes
                        }, 500); // Wait for explanation animation
                    } else {
                        // In ask mode, show cards immediately
                        const generateCommand: AgentCommand = {
                            type: 'generate',
                            sections: generatedSections,
                        };
                        
                        const newState = agent.executeCommand(generateCommand);
                        setState(newState);
                        onStateChange(newState);
                    }
                }
            } catch (e) {
                console.error("Layout Error:", e);
                // Don't show error to user if they just asked a question that happened to contain brackets
            }
        }

        // 2. Finalize Chat Message
        setMessages(prev => {
            const newM = [...prev];
            if (newM[placeholderIndex]) {
                let finalContent = visibleText || fullResponse;
                
                // In agent mode, chat should only show brief status messages, NOT the explanation
                if (mode === 'agent') {
                    if (isCollectingJson && generatedSections.length > 0) {
                        // Brief summary in agent mode when cards are generated
                        const cardCount = generatedSections.length;
                        finalContent = `Generated ${cardCount} ${cardCount === 1 ? 'card' : 'cards'}.`;
                    } else if (explanationText.trim().length > 0) {
                        // Brief status when explanation is being generated
                        finalContent = 'Generating...';
                    } else {
                        // Default brief message
                        finalContent = 'Processing your request...';
                    }
                }
                
                newM[placeholderIndex] = {
                    role: 'agent',
                    content: finalContent,
                    isStreaming: false
                };
            }
            return newM;
        });
        
        // Finalize explanation - ensure it's always passed if we have it
        if (mode === 'agent' && explanationText.trim().length > 0) {
            // Always pass the explanation, whether JSON was found or not
            if (onExplanation) {
                onExplanation(explanationText.trim());
            }
            // Mark as complete after animation
            setTimeout(() => {
                if (onExplanationComplete) {
                    onExplanationComplete(true);
                }
            }, 500);
        } else if (mode === 'agent' && explanationText.trim().length === 0 && generatedSections.length === 0) {
            // No explanation and no sections - mark as complete
            if (onExplanationComplete) {
                onExplanationComplete(true);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev.filter(m => !m.isStreaming), { 
            role: 'agent', 
            content: 'I encountered a connection error. Please try again.' 
        }]);
    } finally {
        setIsLoading(false);
        onAgentWorking?.(false);
    }
  };

  const handleReset = () => {
    setIsLoading(true);
    onAgentWorking?.(true);
    setTimeout(() => {
      agent.reset();
      const newState = agent.getState();
      setState(newState);
      setMessages([{ role: 'agent', content: 'Layout reset to defaults.' }]);
      onStateChange(newState);
      setIsLoading(false);
      onAgentWorking?.(false);
      if (onExplanation) onExplanation(null);
    }, 300);
  };

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
      {/* Desktop Chat */}
      <div className={`fixed right-0 top-14 bottom-0 z-40 hidden lg:block transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
      <ResizableChat minWidth={350} maxWidth={800} defaultWidth={420}>
        <div className="h-full p-4 flex flex-col" style={{ height: '100%' }}>
          <Card className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-2 border-border/70 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
              <CardTitle className="flex items-center gap-2"><Smile className="h-5 w-5" /> Portfolio Agent</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8" title="Reset Layout"><RotateCcw className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={handleCollapseToggle} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
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
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    }}>{message.content}</ReactMarkdown>
                                  );
                                })()}
                            </div>
                           {/* Don't show cursor for Thinking/Generating messages */}
                           {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking...' && message.content !== 'Generating...' && !message.content.startsWith('Thinking...') && !message.content.startsWith('Generating...') && (
                             <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/50 animate-pulse" />
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
              {/* Terminal-style input area */}
              <div className="flex flex-col gap-3 border border-border/50 rounded-lg bg-background/80 backdrop-blur-sm p-3">
                {/* Textarea at top - expands with content */}
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
                  {/* Cursor indicator and prompt count */}
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
                {/* Controls at bottom */}
                <div className="flex items-center   justify-between gap-2 pt-2 border-t border-border/30">
                  <div className="relative flex items-center gap-2">
                    <div className="relative">
                      <select 
                        value={mode} 
                        onChange={(e) => setMode(e.target.value as any)} 
                        className="pl-7 pr-6 py-1.5 text-xs bg-background/60 border border-border/80 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 min-w-[90px] appearance-none font-medium"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='hsl(var(--foreground))' stroke-width='2' stroke-opacity='0.6'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.4rem center',
                          backgroundSize: '12px',
                          borderRadius: '24px',
                        }}
                        disabled={isLoading}
                      >
                        <option value="agent">Agent</option>
                        <option value="ask">Ask</option>
                      </select>
                      <div className="absolute left-2 rounded-xl top-1/2 -translate-y-1/2 pointer-events-none">
                        {mode === 'agent' ? (
                          <Sparkles className="h-3 w-3 text-primary" />
                        ) : (
                          <MessageCircle className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground/60 rounded-lg font-mono">
                      {mode === 'agent' ? 'Layout' : 'Chat'}
                    </span>
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
      </ResizableChat>
      <Button variant="outline" size="icon" onClick={handleCollapseToggle} className={`absolute top-1/2 -translate-y-1/2 rounded-l-lg rounded-r-none border-r border-border/50 bg-card/90 backdrop-blur-xl shadow-xl transition-all duration-300 ${isCollapsed ? '-left-6' : '-left-6'}`}>{isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
      </div>
      
      {/* Mobile Chat - Bottom Sheet */}
      {isMobile && (
        <>
          {isCollapsed && (
            <Button 
              variant="outline" 
              size="lg" 
              className="lg:hidden fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-2xl z-[100] bg-background hover:bg-background/90 border-2 border-border backdrop-blur-sm flex items-center justify-center"
              onClick={handleCollapseToggle}
            >
              <MessageSquare className="h-6 w-6 text-foreground" />
            </Button>
          )}
          {!isCollapsed && (
            <Sheet open={!isCollapsed} onOpenChange={(open) => {
              if (!open) {
                handleCollapseToggle();
              }
            }}>
              <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <div className="h-full p-4 flex flex-col">
              <Card className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-2 border-border/70 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2"><Smile className="h-5 w-5" /> Portfolio Agent</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8" title="Reset Layout"><RotateCcw className="h-4 w-4" /></Button>
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
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    }}>{message.content}</ReactMarkdown>
                                  );
                                })()}
                              </div>
                              {/* Don't show cursor for Thinking/Generating messages */}
                              {message.isStreaming && message.role !== 'user' && message.content !== 'Thinking...' && message.content !== 'Generating...' && !message.content.startsWith('Thinking...') && !message.content.startsWith('Generating...') && (
                                <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/50 animate-pulse" />
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
                  <div className="flex flex-col gap-3 border border-border/50 rounded-lg bg-background/80 backdrop-blur-sm p-3">
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
                      <div className="relative flex items-center gap-2">
                        <div className="relative">
                          <select 
                            value={mode} 
                            onChange={(e) => setMode(e.target.value as any)} 
                            className="pl-7 pr-6 py-1.5 text-xs bg-background/60 border border-border/80 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 min-w-[90px] appearance-none font-medium"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.4rem center',
                              backgroundSize: '12px',
                              borderRadius: '24px',
                            }}
                            disabled={isLoading}
                          >
                            <option value="agent">Agent</option>
                            <option value="ask">Ask</option>
                          </select>
                          <div className="absolute left-2 rounded-xl top-1/2 -translate-y-1/2 pointer-events-none">
                            {mode === 'agent' ? (
                              <Sparkles className="h-3 w-3 text-primary" />
                            ) : (
                              <MessageCircle className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground/60 rounded-lg font-mono">
                          {mode === 'agent' ? 'Layout' : 'Chat'}
                        </span>
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
      )}
    </>
  );
}