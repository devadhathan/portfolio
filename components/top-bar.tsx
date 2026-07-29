'use client';

import { Button } from '@/components/ui/button';
import { Sun, List, User, Briefcase, Mail, Gamepad2 } from 'lucide-react';
import { useTheme, allThemes } from '@/contexts/theme-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ContactChat } from './contact-chat';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSiteContent } from '@/components/site-content-provider';
import { getProjectId } from '@/lib/types/project';
import { useAskAI } from '@/components/ask-ai-provider';
import { markOpenAskAI, consumeOpenAskAI } from '@/lib/open-ask-ai';
import { useNavActions } from '@/contexts/nav-actions-context';
import { scrollPageToTop } from '@/lib/scroll-page';
import { cn } from '@/lib/utils';

const MobileSidebar = dynamic(
  () => import('./mobile-sidebar').then((mod) => ({ default: mod.MobileSidebar })),
  { ssr: false },
);

const NAV_TAB_KEYS = [
  { labelKey: 'about' as const, path: '/', icon: User },
  { labelKey: 'work' as const, path: '/work', icon: Briefcase },
  { labelKey: 'contact' as const, path: '/contact', icon: Mail },
  { labelKey: 'playground' as const, path: '/playground', icon: Gamepad2 },
];

export function TopBar() {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const { projects } = useSiteContent();
  const { onProjectSelectRef, onHomeClickRef } = useNavActions();
  const handleProjectSelect = useCallback((projectSlug: string) => {
    onProjectSelectRef.current?.(projectSlug);
  }, [onProjectSelectRef]);
  const { isOpen: isAskAIActive, toggle: toggleAskAI, open: openAskAI } = useAskAI();
  const pathname = usePathname();
  const router = useRouter();
  const isWorkPage = pathname === '/work';
  const [chatOpen, setChatOpen] = useState(false);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const activePath = optimisticPath ?? pathname;

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  useEffect(() => {
    NAV_TAB_KEYS.forEach((tab) => {
      router.prefetch(tab.path);
    });
  }, [router]);

  useEffect(() => {
    if (pathname === '/' && consumeOpenAskAI()) {
      openAskAI();
    }
  }, [pathname, openAskAI]);

  const handleLogoClick = () => {
    onHomeClickRef.current?.();
    scrollPageToTop();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleAskAI = () => {
    if (pathname === '/') {
      toggleAskAI();
      return;
    }
    markOpenAskAI();
    router.push('/');
  };

  const handleNavClick = (tabPath: string) => {
    if (pathname === tabPath) {
      scrollPageToTop();
      return;
    }
    scrollPageToTop();
    setOptimisticPath(tabPath);
    if (tabPath === '/' && onHomeClickRef.current) {
      onHomeClickRef.current();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/55 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:border-border/70 dark:bg-[#1B1917] dark:shadow-md">
      <div className="w-full px-3 md:px-5 lg:px-6">
        <div className="relative flex h-14 items-center justify-between">
          <div className="flex flex-shrink-0 items-center gap-2">
            {!isWorkPage && (
              <div className="lg:hidden">
                <MobileSidebar onProjectSelect={handleProjectSelect} />
              </div>
            )}
            {isWorkPage && (
              <div className="lg:hidden">
                <Sheet open={isProjectSheetOpen} onOpenChange={setIsProjectSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      aria-label={t('openProjectList')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-r border-border/30 p-4">
                    <SheetHeader>
                      <SheetTitle>{t('projects')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
                      {projects.map((project) => {
                        const projectId = getProjectId(project.title);
                        return (
                          <button
                            key={projectId}
                            onClick={() => {
                              handleProjectSelect(projectId);
                              setIsProjectSheetOpen(false);
                            }}
                            className="w-full rounded-2xl border border-border/30 bg-secondary/20 px-3 py-2 text-left transition-colors hover:border-primary hover:bg-secondary/30"
                          >
                            <span className="text-[14px] font-semibold">{project.title}</span>
                            <span className="block text-[12px] text-muted-foreground">
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
              type="button"
              onClick={handleLogoClick}
              className="flex items-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/photos/Image@4x.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-6 w-auto"
                priority
              />
            </button>
          </div>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border border-border/55 bg-secondary/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:border-border/40 dark:bg-white/[0.04] lg:flex">
              {NAV_TAB_KEYS.map((tab) => {
                const isActive = activePath === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    prefetch
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    onClick={() => handleNavClick(tab.path)}
                    className={cn(
                      'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 select-none',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAskAI}
              aria-pressed={pathname === '/' && isAskAIActive}
              data-cuelume-press
              data-cuelume-hover="tick"
              className={cn(
                'hidden h-10 items-center rounded-full border px-3.5 text-sm font-medium transition-colors lg:flex',
                pathname === '/' && isAskAIActive
                  ? 'border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15'
                  : 'border-border/55 bg-secondary/35 text-foreground hover:bg-secondary/50 dark:border-border/40 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]',
              )}
            >
              {t('askAI')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  className="flex h-10 items-center gap-2 rounded-full border border-border/55 bg-secondary/35 px-3.5 text-sm font-medium transition-colors hover:bg-secondary/50 dark:border-border/40 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                >
                  {(() => {
                    const currentTheme = allThemes.find((item) => item.id === theme);
                    if (currentTheme?.icon) {
                      const IconComponent = currentTheme.icon;
                      return <IconComponent className="h-4 w-4 text-primary" />;
                    }
                    if (currentTheme?.color && 'letter' in currentTheme && currentTheme.letter) {
                      return (
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black/80"
                          style={{ backgroundColor: currentTheme.color }}
                        >
                          {currentTheme.letter}
                        </div>
                      );
                    }
                    if (currentTheme?.color) {
                      return <div className="h-4 w-4 rounded-full" style={{ backgroundColor: currentTheme.color }} />;
                    }
                    return <Sun className="h-4 w-4 text-primary" />;
                  })()}
                  <span className="hidden sm:inline">{allThemes.find((item) => item.id === theme)?.name ?? 'Theme'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 border border-border bg-card">
                {allThemes.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      data-cuelume-toggle
                      className={theme === item.id ? 'bg-muted' : ''}
                    >
                      <div className="flex items-center gap-2">
                        {IconComponent ? (
                          <IconComponent className="h-3.5 w-3.5" />
                        ) : item.color && 'letter' in item && item.letter ? (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black/80"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.letter}
                          </div>
                        ) : item.color ? (
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        ) : null}
                        <span>{item.name}</span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <ContactChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

export function MobileBottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const activePath = optimisticPath ?? pathname;

  useEffect(() => {
    NAV_TAB_KEYS.forEach((tab) => {
      router.prefetch(tab.path);
    });
  }, [router]);

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/55 bg-card shadow-[0_-1px_2px_rgba(0,0,0,0.04),0_-4px_12px_rgba(0,0,0,0.03)] dark:border-border/70 dark:bg-[#1B1917] dark:shadow-md lg:hidden">
      <div className="relative flex h-14 items-center justify-around px-2">
        {NAV_TAB_KEYS.map((tab) => {
          const isActive = activePath === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              prefetch
              data-cuelume-press
              onClick={() => {
                if (pathname === tab.path) {
                  scrollPageToTop();
                  return;
                }
                scrollPageToTop();
                setOptimisticPath(tab.path);
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 transition-colors duration-200',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('relative z-10 h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('relative z-10 text-[10px] font-medium', isActive && 'font-semibold')}>
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
