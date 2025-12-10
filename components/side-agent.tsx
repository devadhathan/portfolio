'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, RotateCcw, ChevronRight, ChevronLeft, Sparkles, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PortfolioAgent, AgentCommand, AgentState, PortfolioSection } from '@/lib/agent';
import { resumeData } from '@/lib/resume-data';
import { ResizableChat } from './resizable-chat';
import ReactMarkdown from 'react-markdown';

interface SideAgentProps {
  onStateChange: (state: AgentState) => void;
  onAgentWorking?: (working: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
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

export function SideAgent({ onStateChange, onAgentWorking, onCollapseChange }: SideAgentProps) {
  const [agent] = useState(() => new PortfolioAgent());
  const [state, setState] = useState<AgentState>(agent.getState());
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: command };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

     try {
         // Prepare context for OpenAI
         const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages
           .filter(msg => !msg.isStreaming && msg.role !== 'user')
           .map(msg => ({ role: msg.role === 'agent' ? 'assistant' as const : msg.role, content: msg.content }));

         // HYBRID PROMPT: Allows both Text AND JSON
         openAIMessages.unshift({
           role: 'system',
           content: `You are a helpful Portfolio Assistant.

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
1. Answer the user's request conversationally first.
2. If they want to SEE projects/content, append a JSON array of IDs at the very end.
3. Use "priority": "high" for the most important item.

EXAMPLE RESPONSE:
"Sure! Here are the projects Devadhathan has worked on. The Finshots app is particularly notable."
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
                            visibleText += contentFragment.substring(0, bracketIndex);
                            jsonBuffer += contentFragment.substring(bracketIndex);
                        } else {
                            // It's all text
                            visibleText += contentFragment;
                        }
                    } else {
                        // We are in JSON mode - hide everything from chat
                        jsonBuffer += contentFragment;
                    }

                    // Update Chat UI with just the text part
                    setMessages(prev => {
                        const newM = [...prev];
                        if (newM[placeholderIndex]) {
                            newM[placeholderIndex] = { 
                                role: 'agent', 
                                content: visibleText || '...', // Show dots if text is empty but working
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
        
        // 1. Process JSON if we found any
        if (isCollectingJson || jsonBuffer.trim().startsWith('[')) {
            // Fallback: if isCollectingJson wasn't triggered but fullResponse starts with [
            if (!isCollectingJson) jsonBuffer = fullResponse;

            try {
                // Cleanup markdown if present
                const cleanJson = jsonBuffer.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponseItems = JSON.parse(cleanJson);
                
                // Map IDs to Rich Content
                const generatedSections: PortfolioSection[] = aiResponseItems
                    .map((item: any) => {
                        const dbItem = CONTENT_DATABASE[item.id];
                        if (!dbItem) return null;
                        
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
                    .filter(Boolean);

                if (generatedSections.length > 0) {
                    const generateCommand: AgentCommand = {
                        type: 'generate',
                        sections: generatedSections,
                    };
                    
                    const newState = agent.executeCommand(generateCommand);
                    setState(newState);
                    onStateChange(newState);
                    
                    // Add a tiny success indicator to the text
                    visibleText += `\n\n*(Loaded ${generatedSections.length} cards)*`;
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
                newM[placeholderIndex] = {
                    role: 'agent',
                    content: visibleText || fullResponse, // Fallback to full response if something went weird
                    isStreaming: false
                };
            }
            return newM;
        });

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
              <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Portfolio Agent</CardTitle>
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
                        {(message.role === 'agent' || message.role === 'assistant') && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                        <div className={`rounded-lg px-4 py-2 max-w-[85%] relative overflow-hidden ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                           <div className="text-sm prose dark:prose-invert max-w-none break-words">
                                <ReactMarkdown components={{
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                }}>{message.content}</ReactMarkdown>
                            </div>
                           {message.isStreaming && message.role !== 'user' && (
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
                    placeholder={isLoading ? "Thinking..." : "Type a command..."}
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono min-h-[24px] max-h-[200px] overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}
                  />
                  {/* Cursor indicator when focused */}
                  {input.length > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">
                      {input.split('\n').length}L
                    </span>
                  )}
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
                    className="h-7 px-3 text-xs font-medium"
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          {isCollapsed ? (
            <Button 
              variant="default" 
              size="lg" 
              className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg z-50"
              onClick={handleCollapseToggle}
            >
              <Bot className="h-5 w-5" />
            </Button>
          ) : (
            <Sheet open={true} onOpenChange={(open) => !open && handleCollapseToggle()}>
              <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <div className="h-full p-4 flex flex-col">
              <Card className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-2 border-border/70 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Portfolio Agent</CardTitle>
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
                            {(message.role === 'agent' || message.role === 'assistant') && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                            <div className={`rounded-lg px-4 py-2 max-w-[85%] relative overflow-hidden ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <div className="text-sm prose dark:prose-invert max-w-none break-words">
                                <ReactMarkdown components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                  a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                }}>{message.content}</ReactMarkdown>
                              </div>
                              {message.isStreaming && message.role !== 'user' && (
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
                        placeholder={isLoading ? "Thinking..." : "Type a command..."}
                        disabled={isLoading}
                        rows={1}
                        className="w-full resize-none bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono min-h-[24px] max-h-[200px] overflow-y-auto"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                        }}
                      />
                      {input.length > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">
                          {input.split('\n').length}L
                        </span>
                      )}
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
                        className="h-7 px-3 text-xs font-medium"
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
        </div>
      )}
    </>
  );
}