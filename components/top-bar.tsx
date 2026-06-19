'use client';

import { Button } from '@/components/ui/button';
import { Sun, List, User, Briefcase, Mail, Gamepad2 } from 'lucide-react';
import { useTheme, availableThemes, rgbThemes } from '@/contexts/theme-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './mobile-sidebar';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
import { motion } from 'framer-motion';

const NAV_TABS = [
  { label: 'About', path: '/', icon: User },
  { label: 'Work', path: '/work', icon: Briefcase },
  { label: 'Contact', path: '/contact', icon: Mail },
  { label: 'Playground', path: '/playground', icon: Gamepad2 },
];

interface TopBarProps {
  onProjectSelect?: (projectSlug: string) => void;
  onHomeClick?: () => void;
}

export function TopBar({ onProjectSelect, onHomeClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isWorkPage = pathname === '/work';
  const [chatOpen, setChatOpen] = useState(false);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);

  // Tracks which tab the indicator is on — decoupled from pathname so we can
  // move it before the navigation happens.
  const [activeTab, setActiveTab] = useState(pathname);
  const [isSliding, setIsSliding] = useState(false);

  const handleLogoClick = () => {
    if (onHomeClick) onHomeClick();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabPath: string) => {
    e.preventDefault();
    if (pathname === tabPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Move the pill immediately — it will slide while glass/scaled
    setActiveTab(tabPath);
    setIsSliding(true);
    if (tabPath === '/' && onHomeClick) onHomeClick();
    // Navigate after the pill lands
    setTimeout(() => {
      window.location.href = tabPath;
    }, 320);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/55 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_1px_12px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* Frost highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="w-full px-3 md:px-5 lg:px-6 relative">
        <div className="relative flex items-center justify-between h-14">
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isWorkPage && (
              <div className="lg:hidden">
                <MobileSidebar onProjectSelect={onProjectSelect} />
              </div>
            )}
            {isWorkPage && (
              <div className="lg:hidden">
                <Sheet open={isProjectSheetOpen} onOpenChange={setIsProjectSheetOpen}>
                  <SheetTrigger asChild>
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-card/40 backdrop-blur-sm border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.07)] hover:border-primary/60 transition-all"
                        aria-label="Open project list"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </motion.div>
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
            <motion.button
              onClick={handleLogoClick}
              className="flex items-center"
              whileHover={{ opacity: 0.8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Image
                src="/photos/Image@4x.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </motion.button>
          </div>

          {/* Desktop nav tabs — glass pill, absolutely centered */}
          <nav className="hidden lg:flex items-center gap-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] p-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.path;
              return (
                <a
                  key={tab.path}
                  href={tab.path}
                  onClick={(e) => handleTabClick(e, tab.path)}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 select-none ${
                    isActive && !isSliding ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full overflow-hidden"
                      style={{
                        background: isSliding
                          ? 'hsl(var(--primary) / 0.22)'
                          : 'hsl(var(--primary) / 0.92)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: isSliding
                          ? '0 2px 10px hsl(var(--primary) / 0.2), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.08)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.06)',
                        border: '1px solid rgba(255,255,255,0.28)',
                      }}
                      animate={isSliding ? { scale: 1.12 } : { scale: 1 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 380, damping: 32 },
                        scale: { type: 'spring', stiffness: 380, damping: 32 },
                      }}
                    >
                      {/* Convex bulge — radial highlight from top-center */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 45%, transparent 72%)',
                        }}
                      />
                      {/* Top specular line — very subtle, blends into bulge */}
                      <div
                        className="absolute left-6 right-6 top-[2px] h-[1px] rounded-full"
                        style={{ background: 'rgba(255,255,255,0.22)' }}
                      />
                      {/* Diagonal refraction sweep */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(130deg, rgba(255,255,255,0.18) 0%, transparent 42%, rgba(255,255,255,0.07) 100%)',
                        }}
                      />
                    </motion.div>
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile: dropdown theme picker */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileTap={{ scale: 0.91 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] text-xs hover:bg-white/[0.09] transition-colors h-auto"
                    >
                      {(() => {
                        const currentTheme = [...availableThemes, ...rgbThemes].find(t => t.id === theme);
                        if (currentTheme?.icon) {
                          const IconComponent = currentTheme.icon;
                          return <IconComponent className="h-3 w-3 text-primary" />;
                        }
                        if (currentTheme?.color && 'letter' in currentTheme && currentTheme.letter) {
                          return (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black/80"
                              style={{ backgroundColor: currentTheme.color }}
                            >
                              {currentTheme.letter}
                            </div>
                          );
                        }
                        if (currentTheme?.color) {
                          return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTheme.color }} />;
                        }
                        return <Sun className="h-3 w-3 text-primary" />;
                      })()}
                      <span className="hidden sm:inline">Theme</span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 bg-card/65 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
                >
                  {availableThemes.map((t) => {
                    const IconComponent = t.icon;
                    return (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={theme === t.id ? 'bg-white/10' : ''}
                      >
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-3 w-3" />}
                          <span>{t.name}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  {rgbThemes.map((rgbTheme) => (
                    <DropdownMenuItem
                      key={rgbTheme.id}
                      onClick={() => setTheme(rgbTheme.id)}
                      className={theme === rgbTheme.id ? 'bg-white/10' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black/80"
                          style={{ backgroundColor: rgbTheme.color }}
                        >
                          {rgbTheme.letter}
                        </div>
                        <span>{rgbTheme.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: theme pill — glass, animated indicator */}
            <div className="hidden lg:flex items-center gap-0.5 px-1 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
              {availableThemes.map((t) => {
                const IconComponent = t.icon;
                const isActive = theme === t.id;
                return (
                  <motion.div key={t.id} whileTap={{ scale: 0.86 }}>
                    <button
                      onClick={() => setTheme(t.id)}
                      className={`relative flex items-center justify-center px-3 py-2 rounded-full h-auto transition-colors ${
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={t.name}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="theme-active"
                          className="absolute inset-0 rounded-full bg-background/80 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      {IconComponent && <IconComponent className="h-4 w-4 relative z-10" />}
                      <span className="sr-only">{t.name}</span>
                    </button>
                  </motion.div>
                );
              })}
              {rgbThemes.map((rgbTheme) => {
                const isActive = theme === rgbTheme.id;
                return (
                  <motion.div key={rgbTheme.id} whileTap={{ scale: 0.86 }}>
                    <button
                      onClick={() => setTheme(rgbTheme.id)}
                      className="relative flex items-center justify-center p-0 w-8 h-8 rounded-full"
                      title={rgbTheme.name}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="theme-active"
                          className="absolute inset-0 rounded-full bg-background/80 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black/80 flex-shrink-0 relative z-10"
                        style={{ backgroundColor: rgbTheme.color }}
                      >
                        {rgbTheme.letter}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ContactChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabPath: string) => {
    e.preventDefault();
    if (pathname === tabPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.href = tabPath;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/55 backdrop-blur-2xl border-t border-white/[0.07] shadow-[0_-1px_12px_rgba(0,0,0,0.18),inset_0_-1px_0_rgba(255,255,255,0.03)]">
      {/* Frost highlight */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
      <div className="flex items-center justify-around h-14 px-2 relative">
        {NAV_TABS.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <motion.a
              key={tab.path}
              href={tab.path}
              onClick={(e) => handleTabClick(e, tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.86 }}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </motion.a>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
