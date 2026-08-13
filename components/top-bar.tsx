'use client';

import { Button } from '@/components/ui/button';
import { Sun, List, User, Briefcase, Gamepad2, ChevronDown } from 'lucide-react';
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
import { motion, useReducedMotion } from 'framer-motion';
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
import { openCaseStudyInHomeWindow } from '@/lib/open-case-study';
import { useNavActions } from '@/contexts/nav-actions-context';
import { scrollPageToTop } from '@/lib/scroll-page';
import { cn, focusRing } from '@/lib/utils';
import { SoundToggle } from '@/components/sound-toggle';
import { ProgressiveBlurTop } from '@/components/progressive-blur-top';
import { navPillTransition } from '@/lib/motion';
import { play } from 'cuelume';
import { MenubarClock } from '@/components/desktop-os/menubar-clock';
import { WallpaperPicker } from '@/components/desktop-os/wallpaper-picker';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';

const MobileSidebar = dynamic(
  () => import('./mobile-sidebar').then((mod) => ({ default: mod.MobileSidebar })),
  { ssr: false },
);

const NAV_TAB_KEYS = [
  { labelKey: 'home' as const, path: '/', icon: User },
  { labelKey: 'work' as const, path: '/work', icon: Briefcase },
  { labelKey: 'playground' as const, path: '/playground', icon: Gamepad2 },
];

export function TopBar() {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const { projects } = useSiteContent();
  const { onProjectSelectRef, onHomeClickRef } = useNavActions();
  const desktopOs = useDesktopOsOptional();
  const osEnabled = desktopOs?.enabled ?? false;
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
  /** Only one menubar dropdown open at a time. */
  const [menubarMenu, setMenubarMenu] = useState<'caseStudies' | 'wallpaper' | 'theme' | null>(
    null,
  );
  const activePath = optimisticPath ?? pathname;

  const setExclusiveMenu = useCallback(
    (id: 'caseStudies' | 'wallpaper' | 'theme') => (open: boolean) => {
      setMenubarMenu((prev) => {
        if (open) return id;
        // Ignore dismiss from a menu that is no longer active (switching menus)
        return prev === id ? null : prev;
      });
      if (open) desktopOs?.setWidgetsOpen(false);
    },
    [desktopOs],
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  useEffect(() => {
    if (osEnabled && consumeOpenAskAI()) {
      desktopOs?.openWindow('ask', { syncUrl: false });
      return;
    }
    if (pathname === '/' && consumeOpenAskAI()) {
      openAskAI();
    }
  }, [pathname, openAskAI, osEnabled, desktopOs]);

  const prefetchTab = (path: string) => {
    router.prefetch(path);
  };

  const handleLogoClick = () => {
    onHomeClickRef.current?.();
    scrollPageToTop();
    if (osEnabled) {
      desktopOs?.openWindow('home');
      return;
    }
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleOsCaseStudy = useCallback(
    (slug: string) => {
      if (!desktopOs) return;
      openCaseStudyInHomeWindow({
        openWindow: desktopOs.openWindow,
        selectProject: (id) => onProjectSelectRef.current?.(id),
        slug,
      });
    },
    [desktopOs, onProjectSelectRef],
  );

  const handleOsPlayground = () => {
    desktopOs?.openWindow('playground');
  };

  const focusedId = desktopOs?.focusedId ?? null;
  const playgroundActive = osEnabled && focusedId === 'playground';

  const handleAskAI = () => {
    if (osEnabled) {
      const askOpen = desktopOs?.windows.ask.open;
      if (askOpen) {
        desktopOs?.closeWindow('ask');
      } else {
        desktopOs?.openWindow('ask', { syncUrl: false });
      }
      return;
    }
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
    <div
      className={cn(
        'pointer-events-none fixed top-0 left-0 right-0',
        osEnabled ? 'os-menubar z-[200]' : 'z-50',
      )}
    >
      {osEnabled ? null : <ProgressiveBlurTop heightClassName="h-20 sm:h-24" />}
      <div className="relative z-10 w-full px-3 md:px-5 lg:px-6">
        <div
          className={cn(
            'relative flex items-center justify-between',
            osEnabled ? 'h-11' : 'h-14',
          )}
        >
          <div className="pointer-events-auto flex min-w-0 flex-shrink items-center gap-1.5 sm:gap-2 lg:gap-3">
            {!osEnabled && !isWorkPage && (
              <div className="lg:hidden">
                <MobileSidebar onProjectSelect={handleProjectSelect} />
              </div>
            )}
            {!osEnabled && isWorkPage && (
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
            <div className="relative flex min-w-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleLogoClick}
                aria-label="Home"
                className={cn(
                  'flex shrink-0 items-center rounded-md transition-opacity hover:opacity-80',
                  focusRing,
                )}
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

              {osEnabled ? (
                <nav
                  className="os-logo-menu ml-0.5 hidden max-w-[min(100%,18rem)] items-center gap-0 overflow-x-auto sm:ml-1 sm:max-w-none sm:gap-0.5 lg:flex"
                  aria-label="Desktop menu"
                >
                  <button
                    type="button"
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    onClick={handleOsPlayground}
                    aria-current={playgroundActive ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                      focusRing,
                      playgroundActive
                        ? 'text-foreground'
                        : 'text-foreground/70 hover:bg-secondary/40 hover:text-foreground',
                    )}
                  >
                    {t('playground')}
                  </button>

                  <DropdownMenu
                    open={menubarMenu === 'caseStudies'}
                    onOpenChange={setExclusiveMenu('caseStudies')}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-cuelume-hover="tick"
                        data-cuelume-press
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-secondary/40 hover:text-foreground',
                          focusRing,
                        )}
                      >
                        {t('caseStudies')}
                        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="max-h-[min(70vh,28rem)] w-64 overflow-y-auto border border-border bg-card"
                    >
                      {projects.map((project) => {
                        const projectId = getProjectId(project.title);
                        return (
                          <DropdownMenuItem
                            key={projectId}
                            data-cuelume-hover="tick"
                            onClick={() => handleOsCaseStudy(projectId)}
                            className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
                          >
                            <span className="text-sm font-medium">{project.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {project.company || project.type || project.period}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              ) : null}
            </div>
          </div>

          {/* Classic tablet center pill — hidden when Desktop OS is on */}
          {!osEnabled ? (
            <nav className="glass-nav-pill pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full p-1 md:flex lg:hidden">
              {NAV_TAB_KEYS.map((tab) => {
                const isActive = activePath === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    prefetch={false}
                    onMouseEnter={() => prefetchTab(tab.path)}
                    onFocus={() => prefetchTab(tab.path)}
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    onClick={() => handleNavClick(tab.path)}
                    className={cn(
                      'relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 select-none',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="nav-pill-desktop"
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                        transition={reduceMotion ? { duration: 0 } : navPillTransition}
                      />
                    ) : null}
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          <div className="pointer-events-auto flex flex-shrink-0 items-center gap-2">
            {/* Ask AI is a desktop icon/window on lg OS; menubar entry stays for mobile/non-OS */}
            {!osEnabled ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleAskAI}
                aria-pressed={pathname === '/' && isAskAIActive}
                data-cuelume-press
                data-cuelume-hover="tick"
                className={cn(
                  'hidden h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors lg:flex',
                  isAskAIActive
                    ? 'border border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15'
                    : 'glass-chrome text-foreground',
                )}
              >
                {t('askAI')}
              </Button>
            ) : null}
            {osEnabled ? (
              <WallpaperPicker
                open={menubarMenu === 'wallpaper'}
                onOpenChange={setExclusiveMenu('wallpaper')}
              />
            ) : null}
            <DropdownMenu
              open={menubarMenu === 'theme'}
              onOpenChange={setExclusiveMenu('theme')}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  className={cn(
                    'flex h-9 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-foreground sm:px-3.5',
                    'focus-visible:ring-offset-0',
                    focusRing,
                    osEnabled
                      ? 'hover:bg-secondary/50'
                      : 'glass-chrome',
                  )}
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
            <SoundToggle variant="inline" />
            {osEnabled ? <MenubarClock /> : null}
          </div>
        </div>
      </div>
      {!osEnabled ? <ContactChat open={chatOpen} onOpenChange={setChatOpen} /> : null}
    </div>
  );
}

export function MobileBottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const activePath = optimisticPath ?? pathname;

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="glass-nav-pill pointer-events-auto relative flex items-center gap-0.5 rounded-full p-1">
        {NAV_TAB_KEYS.map((tab) => {
          const isActive = activePath === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              prefetch={false}
              onTouchStart={() => router.prefetch(tab.path)}
              onMouseEnter={() => router.prefetch(tab.path)}
              data-cuelume-press
              data-cuelume-hover="tick"
              onClick={() => {
                // Cuelume press/hover need a mouse — tap feedback for touch.
                if (window.matchMedia('(hover: none)').matches) {
                  play('tick', { volume: 0.4 });
                }
                if (pathname === tab.path) {
                  scrollPageToTop();
                  return;
                }
                scrollPageToTop();
                setOptimisticPath(tab.path);
              }}
              className={cn(
                'relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 select-none',
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground active:text-foreground',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-pill-mobile"
                  aria-hidden
                  className="absolute inset-0 z-[1] rounded-full bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.18)]"
                  transition={reduceMotion ? { duration: 0 } : navPillTransition}
                />
              ) : null}
              <span className="relative z-10">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
