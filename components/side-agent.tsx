'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, RotateCcw, ChevronRight, ChevronLeft, Sparkles, MessageCircle } from 'lucide-react';
import { PortfolioAgent, AgentCommand, AgentState, PortfolioSection } from '@/lib/agent';
import { resumeData } from '@/lib/resume-data';
import { ResizableChat } from './resizable-chat';

interface SideAgentProps {
  onStateChange: (state: AgentState) => void;
  onAgentWorking?: (working: boolean) => void;
}

export function SideAgent({ onStateChange, onAgentWorking }: SideAgentProps) {
  const [agent] = useState(() => new PortfolioAgent());
  const [state, setState] = useState<AgentState>(agent.getState());
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<'recruiter' | 'user' | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'assistant'; content: string }>>([
    { role: 'agent', content: 'Hello! I\'m Devadhathan\'s portfolio assistant. To get started, please tell me: Are you a **recruiter** or a **user**?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'agent' | 'ask'>('agent');

  useEffect(() => {
    onStateChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    // Initialize with default state on mount
    // Add photo sections if they don't exist
    const currentState = agent.getState();
    const hasPhotos = currentState.sections.some(s => s.type === 'photos');
    
    if (!hasPhotos) {
      agent.addPhotoSections([
        {
          title: 'Travel Photos',
          images: [
            '/photos/ZZXFdA0RZyD5h20wZdhoCxLhy0.jpg',
            '/photos/O6bInc2LhAgXBkQ6yLobk41OLss.jpg',
            '/photos/Le5RRVetScFh9EG3aEJYsrCsM.jpg.avif'
          ],
          description: 'A collection of travel moments'
        }
      ]);
      const updatedState = agent.getState();
      setState(updatedState);
      onStateChange(updatedState);
    } else {
      // Ensure photos are visible
      const photosSection = currentState.sections.find(s => s.type === 'photos');
      if (photosSection && !photosSection.visible) {
        const showCommand: AgentCommand = {
          type: 'show',
          sectionId: photosSection.id,
        };
        const newState = agent.executeCommand(showCommand);
        setState(newState);
        onStateChange(newState);
      } else {
        onStateChange(currentState);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Check if user is setting their role
    const lowerCommand = command.toLowerCase().trim();
    if (!userRole && (lowerCommand.includes('recruiter') || lowerCommand.includes('user'))) {
      const role = lowerCommand.includes('recruiter') ? 'recruiter' : 'user';
      setUserRole(role);
      const userMessage = { role: 'user' as const, content: command };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: `Got it! You're a ${role}. I can help you explore Devadhathan's portfolio. What would you like to know? For example:\n- "Show me his projects"\n- "What are his design systems?"\n- "Tell me about his work at Finshots"\n- "Show me his experience"` 
      }]);
      return;
    }

    // If role not set, remind user
    if (!userRole) {
      const userMessage = { role: 'user' as const, content: command };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: 'Before I can help, please tell me: Are you a **recruiter** or a **user**?' 
      }]);
      return;
    }

    // Add user message
    const userMessage = { role: 'user' as const, content: command };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // If mode is "ask", only use OpenAI chat, don't execute portfolio commands
    if (mode === 'ask') {
      try {
        // Prepare messages for OpenAI (convert agent messages to assistant)
        const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages.map(msg => ({
          role: msg.role === 'agent' ? 'assistant' as const : msg.role,
          content: msg.content,
        }));
        
        // Add system context
        openAIMessages.unshift({
          role: 'system',
          content: 'You are a helpful portfolio assistant. You help manage and customize portfolio sections. You can also answer questions about the portfolio, design, or provide general assistance. Keep responses concise and friendly.',
        });
        
        // Add current user message
        openAIMessages.push({
          role: 'user',
          content: command,
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: openAIMessages }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get AI response');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: data.message || 'Sorry, I couldn\'t generate a response.' 
        }]);
      } catch (error) {
        console.error('Error calling AI:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: `I encountered an error: ${errorMessage}. Please make sure your API key is set in .env.local file.` 
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mode is "agent" - ONLY generate portfolio sections based on user queries
    setIsLoading(true);
    onAgentWorking?.(true);
    
    try {
      // Prepare messages for OpenAI (convert agent messages to assistant)
      const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages.map(msg => ({
        role: msg.role === 'agent' ? 'assistant' as const : msg.role,
        content: msg.content,
      }));
      
      // Add comprehensive portfolio data from scraped project URLs
      const portfolioData = `
PORTFOLIO DATA FOR DEVADHATHAN M D:

PROJECTS:

1. FALCON DESIGN SYSTEM (Ditto Insurance, 2022)
   URL: https://devadhathan.com/design-system3
   Role: Interaction designer, UX researcher
   Tools: Figma, Tailwind CSS, Loom
   Team: Shreyans, Lokesh, Narasmiha, Vishnu, Sachin
   Description: A comprehensive, unified framework that brings consistency, efficiency, and accessibility to all digital products. Provides reusable UI components, cohesive visual language, and clear design guidelines that streamline the creation of intuitive interfaces across multiple platforms. Built on principles of modularity and reusability, Falcon standardizes elements such as typography, color palettes, icons, and interactive components.
   Problem: How might we develop a unified design system that streamlines workflows, ensures consistent and accessible user experiences, and empowers cross-functional teams to rapidly iterate and innovate?
   Target Audience: Internal designers and developers who craft and implement digital interfaces, product managers, stakeholders, cross-functional teams (marketing, content, customer support), external partners and agencies
   Impact: Enhanced consistency through standardized UI elements ensuring unified brand experience, Accelerated development with comprehensive documentation and ready-to-use components streamlining workflows, Improved collaboration through shared design language fostering better alignment, Increased user satisfaction with consistent and accessible interfaces

2. FINSHOTS NEWS APP (Finshots, 2019-2020)
   URL: https://devadhathan.com/finshots-new
   Role: Product Designer, UX Designer
   Tools: Adobe XD, After Effects, Illustrator, Sketch, Principle
   Team: Arif, Manoranjan, Lokesh
   Description: Redesigned mobile app to provide centralized platform for accessing financial news and insights. Addresses challenge of fragmented content delivery across emails, social posts, and channels. As Finshots continued establishing itself as trusted platform for financial news primarily via email newsletters and website, we noticed significant challenge - navigating and revisiting older stories through emails or web searches was cumbersome.
   Problem: Frequent readers struggle to revisit old stories due to inefficient navigation. Endless scrolling and scattered content make it difficult to locate previously engaged stories, leading to frustration and decreased engagement. Feedback from social media and surveys indicated strong demand for more accessible, centralized platform.
   Research: Users loved content but felt overwhelmed by fragmented delivery across emails, social posts, and channels. Revisiting valuable financial news was cumbersome due to lack of centralized access. Issue wasn't about quality of content—it was about making it more accessible and intuitive to navigate.
   HMW: How might we design a centralized platform that provides an intuitive and seamless navigation experience, enabling users to easily explore and revisit financial stories?
   Solution: Developed mobile app offering dedicated, user-friendly environment for accessing and rediscovering financial insights on the go.
   Key Features: 
   - Navigation: Sleek, intuitive interface with categories, filters, and search options. Users can effortlessly browse both recent and archived stories.
   - Infographics: Interactive infographics and tappable charts to simplify complex financial data, making it more accessible and engaging. Users can explore detailed breakdowns and key trends with simple tap.
   - Accessibility: Adjustable font sizes and dark mode to ensure inclusive experience. Users can tailor interface to their preferences for diverse needs.
   - Custom Notifications: Personalized alerts for key updates and deadlines, ensuring users receive relevant information at right time.
   Results: 100k downloads in one year, 4.9 Play Store rating, Google Play's Best App of 2020 award, 500k+ subscribers achieved. Highly positive user feedback upon release.
   Learnings: This pivotal project pulled me into product design. First hands-on experience with Adobe XD in 2019 when UI/UX was still emerging. Learned that great design is more than aesthetics—it's about crafting seamless, user-centric experiences that solve real problems. Embraced iterative design, continuously refining each element until it looked polished and functioned flawlessly. This process underscored importance of balancing creativity with practicality.

3. DITTO ONBOARDING REDESIGN (Ditto Insurance, 2022)
   URL: https://devadhathan.com/ditto-onboarding
   Role: Interaction designer, UX researcher
   Tools: Figma, After Effects, Illustrator, Amplitude, Loom
   Team: Arif, Manoranjan, Lokesh
   Description: Reimagined onboarding experience to reduce friction for new users and improve conversion rates in slot booking process. Collaborated with product manager to leverage data-driven insights and iterative design methods to pinpoint user pain points and develop tailored solutions.
   Problem: Users dropping off before completing slot booking process, resulting in low conversion rates. Major challenge was aligning design solutions with business goal of increasing conversion rates while maintaining user-centric approach. Understanding root causes of abandonment in relatively new product required continuous collaboration across teams.
   Approach: Analyzed data to identify major drop-off points, spoke with range of customers to uncover improvement opportunities, conducted cognitive walkthrough, interviewed users to pinpoint key questions about booking experience. Created two personas to understand pain points and refine approach.
   Key Features: Progress indicators showing booking steps, Simplified slot booking flow, Clear call-to-action buttons, Improved information architecture
   Results: 17% increase in conversion rates, 8% decrease in drop-off rates within 60 days, 600 slots booked successfully
   Learnings: Focus only on data points that directly inform solution - data overload can obscure problem. Collaboration is key - constantly engaging with developers, product managers, and stakeholders ensured alignment. User testing is essential even for small changes - prototyping and gathering feedback early helped refine design. Flexibility and adaptability in design are critical in dynamic environment.

4. SUSTAINABLE KIOSK (Edinburgh Napier University, January 2024)
   Type: UX Design Project
   Description: Conducted field research and user interviews to create personas and inform the kiosk's design. Developed high-fidelity prototype and refined it through usability testing. Executed usability testing and evaluation to ensure customer-centric solution aligned with project goals and brief.

5. CRM REDESIGN (Ditto Insurance, 2022)
   Type: Product Design
   Description: Redesigned the internal CRM system to improve team efficiency and user experience. Focused on streamlining workflows and reducing cognitive load for insurance agents.
   Problem: Internal CRM was outdated and inefficient, causing frustration among agents and reducing productivity.
   Approach: Conducted user interviews with agents, analyzed workflow patterns, created personas, and designed new interface with improved information architecture.
   Key Features: Streamlined workflow patterns, Improved information architecture, Reduced cognitive load, Better data visualization
   Results: 20% improvement in team efficiency, Reduced task completion time by 30%, Improved user satisfaction scores

6. BOOKING PORTAL REDESIGN (Ditto Insurance, 2021-2022)
   Type: UX Redesign
   Description: Led a full redesign of the booking portal using user research and the Double Diamond process. Focused on improving conversion rates and user experience.
   Problem: Low conversion rates and high drop-off rates in the booking process.
   Approach: Applied Double Diamond process: Discover (user research), Define (problem framing), Develop (prototyping), Deliver (testing and iteration).
   Key Features: Simplified booking flow, Clear progress indicators, Improved form design, Mobile-responsive design
   Results: 17% increase in conversion rates, WCAG 2.1 AA accessibility compliance, Improved user satisfaction

EXPERIENCE:
${resumeData.experience.map(exp => `
- ${exp.role} at ${exp.company} (${exp.period})
  ${exp.achievements.join('\n  ')}
`).join('\n')}

EDUCATION:
${resumeData.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.period})\n  ${edu.details}`).join('\n')}

SKILLS:
Design: ${resumeData.skills.design.join(', ')}
Research: ${resumeData.skills.research.join(', ')}
Software: ${resumeData.skills.software.join(', ')}

AWARDS: ${resumeData.awards.join(', ')}
CERTIFICATIONS: ${resumeData.certifications.join(', ')}
`;

        openAIMessages.unshift({
          role: 'system',
          content: `You are Devadhathan's portfolio assistant. Your ONLY function is to GENERATE portfolio sections (bento boxes) based on the portfolio data provided.

${portfolioData}

IMPORTANT RULES:
1. You can ONLY generate portfolio sections based on the data above
2. If the user asks about something NOT in the portfolio data, respond: "I can't help with that. I can only show information from Devadhathan's portfolio. Try asking about his projects, experience, skills, or education."
3. UNDERSTAND USER INTENT - Don't require exact phrases. If user asks about:
   - "projects", "work", "portfolio", "designs", "apps", "things he built", "what has he done", "show projects", "his projects" → Generate ALL 6+ projects
   - "experience", "jobs", "roles", "work history", "employment", "where he worked" → Generate experience boxes
   - "skills", "abilities", "expertise", "what can he do" → Generate skills boxes
   - "education", "degrees", "studies", "where he studied" → Generate education boxes

4. Generate INDIVIDUAL bento boxes for EACH item:
   - For projects: Create ONE box per project. Generate ALL 6+ projects from the portfolio data:
     * Falcon Design System
     * Finshots News App  
     * Onboarding Redesign
     * Sustainable Kiosk
     * CRM Redesign
     * Booking Portal Redesign
   - For experience: Create ONE box per job/role (Nesoi.ai, Ditto Insurance, Finshots)
   - For skills: Create boxes grouped by skill category

CRITICAL FOR PROJECTS:
- When user asks about projects (in ANY way - "show me projects", "what projects", "his work", "portfolio", etc.), you MUST generate ALL 6+ projects from the portfolio data above
- Generate ALL 6 individual project boxes (Falcon Design System, Finshots App, Onboarding Redesign, Sustainable Kiosk, CRM Redesign, Booking Portal Redesign)
- Each project should be a separate bento box with unique id, title, description, and full content
- Include project URLs in the links array when available
- Use appropriate icons for each project type (design system, mobile app, UX redesign, etc.)
- Each project MUST have complete information: problem, approach, key features, results, learnings

Each section should have:
- id: unique identifier (like "project-1", "experience-nesoi", "skill-design", etc.)
- title: Specific name (e.g., "Sustainable Kiosk Project", "Nesoi.ai - Product Designer")
- type: one of: hero, about, preferences, experience, contact, philosophy, projects, skills, education, custom
- priority: high, medium, or low
- visible: true
- placeholder: false
- description: Brief summary (first line visible in card)
- content: Detailed explanation (shown when card is clicked) - use full details from resume
- links: Array of links when relevant

CRITICAL RULES:
1. Create SEPARATE boxes for each item (e.g., one box per project, one box per job)
2. Populate "description" with a short summary (what shows in the card)
3. Populate "content" with FULL details (shown when clicked)
4. Use REAL data from the resume above
5. Make titles specific and descriptive

Example for "show me his projects" - MUST generate ALL 6+ projects:
[
  {
    "id": "project-falcon",
    "title": "Falcon Design System",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "Design System - Ditto Insurance (2022) | Unified framework for consistency and accessibility",
    "content": "A comprehensive, unified framework that brings consistency, efficiency, and accessibility to all digital products. Built on principles of modularity and reusability, Falcon standardizes elements such as typography, color palettes, icons, and interactive components. Problem: How might we develop a unified design system that streamlines workflows, ensures consistent and accessible user experiences, and empowers cross-functional teams to rapidly iterate and innovate? Impact: Enhanced consistency through standardized UI elements, Accelerated development with comprehensive documentation, Improved collaboration through shared design language, Increased user satisfaction with consistent interfaces.",
    "links": [{"label": "View Project", "url": "https://devadhathan.com/design-system3"}],
    "order": 1
  },
  {
    "id": "project-finshots",
    "title": "Finshots News App",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "Mobile App Design - Finshots (2019-2020) | 100k downloads, 4.9 rating, Best App 2020",
    "content": "Redesigned mobile app to provide centralized platform for accessing financial news. Problem: Frequent readers struggled to revisit old stories due to inefficient navigation. Research: Users loved content but felt overwhelmed by fragmented delivery. Solution: Developed mobile app with Navigation (categories, filters, search), Interactive Infographics, Accessibility features (adjustable fonts, dark mode), Custom Notifications. Results: 100k downloads in one year, 4.9 Play Store rating, Google Play's Best App of 2020 award, 500k+ subscribers. This pivotal project introduced me to product design.",
    "links": [{"label": "View Project", "url": "https://devadhathan.com/finshots-new"}],
    "order": 2
  },
  {
    "id": "project-onboarding",
    "title": "Onboarding Redesign",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "UX Redesign - Ditto Insurance (2022) | 17% conversion increase, 8% drop-off reduction",
    "content": "Reimagined onboarding experience to reduce friction for new users and improve conversion rates in slot booking process. Problem: Users dropping off before completing slot booking, resulting in low conversion rates. Approach: Analyzed data to identify drop-off points, spoke with customers, conducted cognitive walkthroughs, interviewed users, created personas. Key Features: Progress indicators, simplified booking flow, clear CTAs, improved information architecture. Results: 17% increase in conversion rates, 8% decrease in drop-off rates within 60 days, 600 slots booked successfully.",
    "links": [{"label": "View Project", "url": "https://devadhathan.com/ditto-onboarding"}],
    "order": 3
  },
  {
    "id": "project-kiosk",
    "title": "Sustainable Kiosk",
    "type": "projects",
    "priority": "medium",
    "visible": true,
    "placeholder": false,
    "description": "UX Design Project - Edinburgh Napier University (January 2024)",
    "content": "Conducted field research and user interviews to create personas and inform the kiosk's design. Developed high-fidelity prototype and refined it through usability testing. Executed usability testing and evaluation to ensure customer-centric solution aligned with project goals and brief.",
    "order": 4
  },
  {
    "id": "project-crm",
    "title": "CRM Redesign",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "Product Design - Ditto Insurance (2022) | 20% efficiency improvement",
    "content": "Redesigned the internal CRM system to improve team efficiency and user experience. Problem: Internal CRM was outdated and inefficient, causing frustration among agents. Approach: Conducted user interviews with agents, analyzed workflow patterns, created personas, and designed new interface with improved information architecture. Key Features: Streamlined workflow patterns, Improved information architecture, Reduced cognitive load, Better data visualization. Results: 20% improvement in team efficiency, Reduced task completion time by 30%, Improved user satisfaction scores.",
    "order": 5
  },
  {
    "id": "project-booking",
    "title": "Booking Portal Redesign",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "UX Redesign - Ditto Insurance (2021-2022) | 17% conversion increase",
    "content": "Led a full redesign of the booking portal using user research and the Double Diamond process. Problem: Low conversion rates and high drop-off rates in the booking process. Approach: Applied Double Diamond process: Discover (user research), Define (problem framing), Develop (prototyping), Deliver (testing and iteration). Key Features: Simplified booking flow, Clear progress indicators, Improved form design, Mobile-responsive design. Results: 17% increase in conversion rates, WCAG 2.1 AA accessibility compliance, Improved user satisfaction.",
    "order": 6
  }
]

Example for "I want to know his experience":
[
  {
    "id": "exp-nesoi",
    "title": "Product Designer at Nesoi.ai",
    "type": "experience",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "July 2025 - November 2025 | 15+ enterprise clients",
    "content": "Designed and shipped adviser/client-facing dashboards used by 15+ enterprise clients, enabling them to deliver interactive, AI-powered learning modules. Led iterative UX improvements and introduced reusable Figma components that improved engagement by 92% and reduced course-creation time by 37%. Developed scalable workflow and automation patterns, partnering closely with engineering to ensure consistent, reliable UI behaviour and frictionless component implementation across devices. Integrated WCAG 2.1 AA accessibility into component and template design, conducting audits, refining behaviours, and ensuring all patterns met regulatory and compliance requirements.",
    "order": 1
  },
  {
    "id": "exp-ditto",
    "title": "Product Designer at Ditto Insurance",
    "type": "experience",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "November 2021 - December 2022 | 17% conversion increase",
    "content": "Led a full redesign of the booking portal using user research and the Double Diamond process, achieving a 17% increase in conversion and ensuring WCAG 2.1 AA accessibility compliance. Created and standardized the Falcon Design System, defining components, tokens, interaction rules, and documentation to deliver cross-platform consistency and accessibility, reducing design-to-development time by 30%. Spearheaded the redesign of the internal CRM in an agile environment, collaborating with stakeholders and developers, improving team efficiency by 20%.",
    "order": 2
  }
]

Generate sections based on the user's prompt. Create INDIVIDUAL boxes for each relevant item from the portfolio data.

OUTPUT FORMAT - CRITICAL:
- If the query is about portfolio data, respond with ONLY a valid JSON array
- NO markdown code blocks (no code fences)
- NO explanations
- NO additional text before or after
- Start directly with [ and end with ]
- Each section MUST have: id, title, type, priority, visible (true), placeholder (false), description, content, order, links (if available)
- For projects queries: MUST generate ALL 6 projects (Falcon Design System, Finshots News App, Onboarding Redesign, Sustainable Kiosk, CRM Redesign, Booking Portal Redesign)
- Each project MUST have full content with problem, approach, key features, results, and learnings from the portfolio data
- If you understand the user wants projects but the query is unclear, still generate ALL 6 projects

Example valid response:
[
  {
    "id": "project-finshots",
    "title": "Finshots News App",
    "type": "projects",
    "priority": "high",
    "visible": true,
    "placeholder": false,
    "description": "Mobile App Design - Finshots (2019-2020) | 100k downloads, 4.9 rating",
    "content": "Redesigned mobile app to provide centralized platform for accessing financial news. Key features: Navigation with categories/filters, Interactive Infographics, Accessibility features, Custom Notifications. Results: 100k downloads, 4.9 Play Store rating, Google Play's Best App of 2020 award.",
    "order": 1
  }
]

If the user asks about something NOT in the portfolio data, respond with plain text: "I can't help with that. I can only show information from Devadhathan's portfolio. Try asking about his projects, experience, skills, or education."`,
        });
        
        // Add current user message
        openAIMessages.push({
          role: 'user',
          content: command,
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: openAIMessages }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get AI response');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Extract response from AI
        const aiResponse = data.message || '';
        const trimmedResponse = aiResponse.trim();
        
        // Check if AI returned JSON (for generating new layout)
        let generatedSections: PortfolioSection[] | null = null;
        try {
          // Try to extract JSON from response (might be in markdown code blocks)
          let jsonString = trimmedResponse;
          
          // Remove markdown code blocks if present
          const codeBlockMatch = trimmedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            jsonString = codeBlockMatch[1].trim();
          }
          
          // Try to find JSON array in the response
          const jsonArrayMatch = jsonString.match(/\[[\s\S]*\]/);
          if (jsonArrayMatch) {
            jsonString = jsonArrayMatch[0];
          }
          
          // Try to parse as JSON array
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Accept any array length, not just 6-9
            generatedSections = parsed as PortfolioSection[];
            console.log('Generated sections:', generatedSections);
          }
        } catch (e) {
          console.error('Failed to parse JSON from AI response:', e);
          console.log('AI Response:', trimmedResponse);
          // Not JSON, continue with command parsing
        }
        
        if (generatedSections && generatedSections.length > 0) {
          // Generate new layout from AI response
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const generateCommand: AgentCommand = {
            type: 'generate',
            sections: generatedSections,
          };
          
          const newState = agent.executeCommand(generateCommand);
          setState(newState);
          onStateChange(newState);
          
          setMessages(prev => [...prev, { 
            role: 'agent', 
            content: `✓ Generated ${generatedSections.length} new portfolio section${generatedSections.length > 1 ? 's' : ''} based on your prompt. Use reset to go back to default layout.`
          }]);
        } else {
          // If JSON parsing failed, check if it's an "I can't help" message or show error
          console.log('AI response was not valid JSON, showing as message');
          console.log('Full AI response:', trimmedResponse);
          
          // Check if AI said it can't help
          if (trimmedResponse.toLowerCase().includes("can't help") || trimmedResponse.toLowerCase().includes("cannot help")) {
            setMessages(prev => [...prev, { 
              role: 'agent', 
              content: trimmedResponse 
            }]);
          } else {
            // Show error message
            setMessages(prev => [...prev, { 
              role: 'agent', 
              content: `I had trouble generating the boxes. Please try rephrasing your request, for example:\n- "Show me his projects"\n- "I want to see his work experience"\n- "Display his skills"\n- "Tell me about the Finshots app"\n- "What design systems has he worked on?"` 
            }]);
          }
        }
      } catch (error) {
        console.error('Error calling AI:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: `I encountered an error: ${errorMessage}. Please make sure your API key is set in .env.local file. You can still try portfolio commands like: "prioritize [section]", "hide [section]", "show [section]", or "move [section] to position [number]"` 
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
      setMessages([{ role: 'agent', content: 'Portfolio reset to default layout.' }]);
      onStateChange(newState);
      setIsLoading(false);
      onAgentWorking?.(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand(input);
    }
  };

  return (
    <div 
      className={`fixed right-0 top-14 bottom-0 z-40 hidden lg:block transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'translate-x-full' : 'translate-x-0'
      }`}
    >
      <ResizableChat minWidth={350} maxWidth={800} defaultWidth={420}>
        <div className="h-full p-4 flex flex-col" style={{ height: '100%' }}>
          <Card className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Portfolio Agent
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  title="Reset to defaults"
                  className="h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  title="Collapse"
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <Separator className="flex-shrink-0" />
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <ScrollArea className="flex-1 w-full min-h-0">
                <div className="px-4">
                  <div className="space-y-4 py-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {(message.role === 'agent' || message.role === 'assistant') && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
            <Separator className="flex-shrink-0" />
            <CardContent className="pt-4 pb-4 flex-none mt-auto">
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'agent' | 'ask')}
                    className="pl-8 pr-8 py-2 text-[14px] bg-background/50 border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer appearance-none hover:bg-background/70 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '16px',
                    }}
                    disabled={isLoading}
                  >
                    <option value="agent">Agent</option>
                    <option value="ask">Ask</option>
                  </select>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {mode === 'agent' ? (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "Thinking..." : mode === 'agent' ? "Type a command or ask a question..." : "Ask me anything..."}
                  className="flex-1 bg-background/50 h-12"
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => handleCommand(input)} 
                  size="icon"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isLoading ? 'AI is thinking...' : mode === 'agent' ? 'Agent: Can execute portfolio commands • Ask: Chat only' : 'Ask mode: Chat only, no portfolio changes'}
              </p>
            </CardContent>
          </Card>
        </div>
      </ResizableChat>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-1/2 -translate-y-1/2 rounded-l-lg rounded-r-none border-r-0 bg-card/80 backdrop-blur-xl shadow-lg transition-all duration-300 ${
          isCollapsed ? '-left-8' : '-left-8'
        }`}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

