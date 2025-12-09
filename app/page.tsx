'use client';

import { useState } from 'react';
import { SideAgent } from '@/components/side-agent';
import { PortfolioSections } from '@/components/portfolio-sections';
import { TopBar } from '@/components/top-bar';
import { DesktopSidebar } from '@/components/desktop-sidebar';
import { AboutSection } from '@/components/about-section';
import { ProjectDetailView } from '@/components/project-detail-view';
import { AgentState } from '@/lib/agent';

export default function Home() {
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const handleStateChange = (state: AgentState) => {
    setAgentState(state);
  };

  const handleAgentWorking = (working: boolean) => {
    setIsAgentWorking(working);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsChatCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden [html.glass_&]:bg-transparent [html.glass_&]:bg-none">
      <TopBar onProjectSelect={setSelectedProject} />
      <div className="absolute inset-0 bg-gradient-grid pointer-events-none opacity-30 z-0 [html.glass_&]:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none z-0 [html.glass_&]:hidden"></div>
      
      <div className="flex pt-14 relative z-10">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:block fixed left-0 top-14 w-80 h-[calc(100vh-3.5rem)] z-20">
          <DesktopSidebar onProjectSelect={setSelectedProject} />
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 container mx-auto p-4 md:p-6 lg:p-8 relative z-10 lg:ml-80 transition-all duration-300 ${isChatCollapsed ? 'lg:pr-4' : 'lg:pr-[440px]'} pb-20 lg:pb-8`}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Devadhathan</h1>
            <p className="text-muted-foreground text-sm">
              Product Designer
            </p>
          </div>
          {isAgentWorking ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-[16px] text-muted-foreground font-medium">Agent is working...</p>
              <p className="text-[14px] text-muted-foreground mt-2">Arranging your portfolio sections</p>
            </div>
          ) : selectedProject ? (
            <div className="w-full">
              <ProjectDetailView 
                projectId={selectedProject} 
                onBack={() => setSelectedProject(null)} 
              />
            </div>
          ) : agentState ? (
            <>
              <PortfolioSections agentState={agentState} />
              <AboutSection />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading portfolio agent...</p>
            </div>
          )}
        </div>
      </div>
      
      <SideAgent onStateChange={handleStateChange} onAgentWorking={handleAgentWorking} onCollapseChange={handleCollapseChange} />
    </div>
  );
}

