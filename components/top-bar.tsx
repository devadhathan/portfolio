'use client';

import { Button } from '@/components/ui/button';
import { Sun, List, User, Briefcase, Gamepad2, ChevronsRight } from 'lucide-react';
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { SoundToggle } from '@/components/sound-toggle';
import { ProgressiveBlurTop } from '@/components/progressive-blur-top';
import { play } from 'cuelume';

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
  const { onProjectSelectRef, onHomeClickRef, onOpenWidgetsRef, showWidgetsToggle, widgetsCollapsed } =
    useNavActions();
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
  const showLogoWidgetsArrow = showWidgetsToggle && widgetsCollapsed;
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pillMotion, setPillMotion] = useState(false);

  const updatePill = useCallback(() => {
    const nav = navRef.current;
    const activeTab = tabRefs.current[activePath];
    if (!nav || !activeTab) {
      setPill((prev) => ({ ...prev, ready: false }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    if (tabRect.width < 2) {
      setPill((prev) => ({ ...prev, ready: false }));
      return;
    }

    setPill({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      ready: true,
    });
  }, [activePath]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    updatePill();
    let cancelled = false;
    const fontsReady =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();
    fontsReady.then(() => {
      if (!cancelled) updatePill();
    });
    return () => {
      cancelled = true;
    };
  }, [updatePill, t]);

  // Enable slide animation only after the pill has been placed once (avoids fill-on-reload).
  useEffect(() => {
    if (!pill.ready || pillMotion) return;
    const id = requestAnimationFrame(() => setPillMotion(true));
    return () => cancelAnimationFrame(id);
  }, [pill.ready, pillMotion]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => updatePill());
    observer.observe(nav);
    Object.values(tabRefs.current).forEach((tab) => {
      if (tab) observer.observe(tab);
    });
    window.addEventListener('resize', updatePill);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [updatePill]);

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  useEffect(() => {
    if (pathname === '/' && consumeOpenAskAI()) {
      openAskAI();
    }
  }, [pathname, openAskAI]);

  const prefetchTab = (path: string) => {
    router.prefetch(path);
  };

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
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50">
      <ProgressiveBlurTop heightClassName="h-20 sm:h-24" />
      <div className="relative z-10 w-full px-3 md:px-5 lg:px-6">
        <div className="relative flex h-14 items-center justify-between">
          <div className="pointer-events-auto flex flex-shrink-0 items-center gap-2">
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
            <div className="relative flex items-center">
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
              {showLogoWidgetsArrow ? (
                <button
                  type="button"
                  aria-label="Open widgets"
                  title="Open widgets"
                  data-cuelume-press
                  data-cuelume-hover="tick"
                  onClick={() => onOpenWidgetsRef.current?.()}
                  className="absolute left-1/2 top-full mt-3.5 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border/55 bg-secondary/50 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-secondary/70 lg:flex dark:border-border/40 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                >
                  <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>
          </div>

          <nav
            ref={navRef}
            className="glass-nav-pill pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full p-1 lg:flex"
          >
              {pill.ready ? (
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute left-0 top-1 bottom-1 rounded-full bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]',
                    pillMotion &&
                      !reduceMotion &&
                      'transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  )}
                  style={{
                    width: pill.width,
                    transform: `translate3d(${pill.left}px, 0, 0)`,
                  }}
                />
              ) : null}
              {NAV_TAB_KEYS.map((tab) => {
                const isActive = activePath === tab.path;
                return (
                  <Link
                    key={tab.path}
                    ref={(node) => {
                      tabRefs.current[tab.path] = node;
                    }}
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
                      isActive && !pill.ready && 'bg-primary',
                    )}
                  >
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

          <div className="pointer-events-auto flex flex-shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAskAI}
              aria-pressed={pathname === '/' && isAskAIActive}
              data-cuelume-press
              data-cuelume-hover="tick"
              className={cn(
                'hidden h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors lg:flex',
                pathname === '/' && isAskAIActive
                  ? 'border border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15'
                  : 'glass-chrome text-foreground',
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
                  className="glass-chrome flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-foreground"
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
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pillMotion, setPillMotion] = useState(false);

  const updatePill = useCallback(() => {
    const nav = navRef.current;
    const activeTab = tabRefs.current[activePath];
    if (!nav || !activeTab) {
      setPill((prev) => ({ ...prev, ready: false }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    if (tabRect.width < 2) {
      setPill((prev) => ({ ...prev, ready: false }));
      return;
    }

    setPill({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      ready: true,
    });
  }, [activePath]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    updatePill();
    let cancelled = false;
    const fontsReady =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();
    fontsReady.then(() => {
      if (!cancelled) updatePill();
    });
    return () => {
      cancelled = true;
    };
  }, [updatePill, t]);

  useEffect(() => {
    if (!pill.ready || pillMotion) return;
    const id = requestAnimationFrame(() => setPillMotion(true));
    return () => cancelAnimationFrame(id);
  }, [pill.ready, pillMotion]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => updatePill());
    observer.observe(nav);
    Object.values(tabRefs.current).forEach((tab) => {
      if (tab) observer.observe(tab);
    });
    window.addEventListener('resize', updatePill);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [updatePill]);

  useEffect(() => {
    if (optimisticPath !== null && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav
        ref={navRef}
        className="glass-nav-pill pointer-events-auto relative flex items-center gap-0.5 rounded-full p-1"
      >
        {pill.ready ? (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute left-0 top-1 bottom-1 z-[1] rounded-full bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.18)]',
              pillMotion &&
                !reduceMotion &&
                'transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            )}
            style={{
              width: pill.width,
              transform: `translate3d(${pill.left}px, 0, 0)`,
            }}
          />
        ) : null}
        {NAV_TAB_KEYS.map((tab) => {
          const isActive = activePath === tab.path;
          return (
            <Link
              key={tab.path}
              ref={(node) => {
                tabRefs.current[tab.path] = node;
              }}
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
                isActive && !pill.ready && 'bg-primary',
              )}
            >
              <span className="relative z-10">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
