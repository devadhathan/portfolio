'use client';

import { Button } from '@/components/ui/button';
import { Sun, List } from 'lucide-react';
import { useTheme, availableThemes, rgbThemes } from '@/contexts/theme-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './mobile-sidebar';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ContactChat } from './contact-chat';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { resumeData } from '@/lib/resume-data';

interface TopBarProps {
  onProjectSelect?: (projectSlug: string) => void;
  onHomeClick?: () => void;
}

export function TopBar({ onProjectSelect, onHomeClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isWorkPage = pathname === '/work';
  const [chatOpen, setChatOpen] = useState(false);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);

  const handleLogoClick = () => {
    // Reset portfolio state if handler provided
    if (onHomeClick) {
      onHomeClick();
    }
    // Navigate to home
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card backdrop-blur-2xl border-b border-border/30">
      <div className="w-full px-3 md:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            {!isWorkPage && (
              <div className="lg:hidden">
                <MobileSidebar onProjectSelect={onProjectSelect} />
              </div>
            )}
            {isWorkPage && (
              <div className="lg:hidden">
                <Sheet open={isProjectSheetOpen} onOpenChange={setIsProjectSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-card/60 border border-border/40 shadow-lg hover:border-primary/60 transition-all"
                      aria-label="Open project list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-r border-border/30 p-4">
                    <SheetHeader>
                      <SheetTitle>Projects</SheetTitle>
                    </SheetHeader>
                    <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto">
                      {resumeData.projects
                        .filter(project => project.title !== 'Sustainable Kiosk' && project.title !== 'Booking Portal Redesign')
                        .map((project) => {
                          const projectId = project.title.toLowerCase().trim().replace(/\s+/g, '-');
                          return (
                            <button
                              key={projectId}
                              onClick={() => {
                                onProjectSelect?.(projectId);
                                setIsProjectSheetOpen(false);
                              }}
                              className="w-full rounded-2xl border border-border/30 bg-secondary/20 px-3 py-2 text-left transition-colors hover:border-primary hover:bg-secondary/30"
                            >
                              <span className="text-[14px] font-semibold">{project.title}</span>
                              <span className="text-[12px] text-muted-foreground block">
                                {project.company || project.type || project.period}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/photos/Image@4x.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </button>
          </div>

          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            {/* Mobile: Single dropdown for all themes */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors h-auto"
                  >
                    {(() => {
                      const currentTheme = [...availableThemes, ...rgbThemes].find(t => t.id === theme);
                      if (currentTheme?.icon) {
                        const IconComponent = currentTheme.icon;
                        return <IconComponent className="h-3 w-3 text-primary" />;
                      }
                      if (currentTheme?.color) {
                        return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTheme.color }} />;
                      }
                      return <Sun className="h-3 w-3 text-primary" />;
                    })()}
                    <span className="hidden sm:inline">Theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {availableThemes.map((t) => {
                    const IconComponent = t.icon;
                    return (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={theme === t.id ? 'bg-secondary' : ''}
                      >
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-3 w-3" />}
                          <span>{t.name}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  {rgbThemes.map((rgbTheme) => (
                    <DropdownMenuItem
                      key={rgbTheme.id}
                      onClick={() => setTheme(rgbTheme.id)}
                      className={theme === rgbTheme.id ? 'bg-secondary' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: rgbTheme.color }}
                        />
                        <span>{rgbTheme.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: Separate theme controls */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme toggles */}
              <div className="flex items-center gap-0.5 px-1 py-1 rounded-full bg-secondary/40 border border-border/30">
                {availableThemes.map((t) => {
                  const IconComponent = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <Button
                      key={t.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center justify-center px-3 py-2 rounded-full transition-colors h-auto ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span className="sr-only">{t.name}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Red, Green, Blue buttons */}
              <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-secondary/40 border border-border/30">
                {rgbThemes.map((rgbTheme) => (
                  <Button
                    key={rgbTheme.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(rgbTheme.id)}
                    className={`flex items-center justify-center px-2 py-1.5 rounded-full hover:bg-secondary/50 transition-colors h-auto ${
                      theme === rgbTheme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    title={rgbTheme.name}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: rgbTheme.color }}
                    />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContactChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
