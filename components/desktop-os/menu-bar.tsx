'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useWindowTitles } from '@/components/desktop-os/window-titles';
import { useNavActions } from '@/contexts/nav-actions-context';
import { useSiteContent } from '@/components/site-content-provider';
import { WINDOW_PATH, type DesktopWindowId } from '@/lib/desktop-os';
import { ZOOM_MAX, ZOOM_MIN } from '@/lib/os-settings';
import { getProjectId, type Project } from '@/lib/types/project';
import { trackEvent } from '@/lib/analytics';
import { cn, focusRing } from '@/lib/utils';

type MenuId = 'logo' | 'window' | 'file' | 'view' | 'help' | 'overflow';

const REPORT_BUG_MAILTO =
  'mailto:devadhathanmd18@gmail.com?subject=Bug%20on%20devadhathan.com&body=What%20happened%3A%0A%0AWhere%3A%0A%0ABrowser%3A';

const menuItemClass =
  'os-menu-row flex h-[30px] cursor-pointer items-center gap-2 px-3 text-[13px]';

export function MenuBar() {
  const t = useTranslations('nav');
  const windowTitles = useWindowTitles();
  const {
    windows,
    focusedId,
    openWindow,
    closeWindow,
    toggleCover,
    widgetsOpen,
    toggleWidgets,
    iconLabels,
    setIconLabels,
    zoom,
    setZoom,
    stepZoom,
    recents,
    clearRecents,
    resetDesktop,
  } = useDesktopOs();
  const { projects } = useSiteContent();
  const { onProjectSelectRef, selectedProjectId } = useNavActions();

  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const triggerRefs = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});

  const activeId = focusedId && windows[focusedId]?.open ? focusedId : null;
  const activeTitle = activeId ? windowTitles[activeId] : 'Desktop';
  const activePath = activeId ? WINDOW_PATH[activeId] : undefined;

  const activeProject: Project | undefined = useMemo(() => {
    if (!selectedProjectId) return undefined;
    return projects.find((project) => getProjectId(project.title) === selectedProjectId);
  }, [projects, selectedProjectId]);

  const stepCaseStudy = useCallback(
    (direction: 1 | -1) => {
      if (!selectedProjectId || projects.length === 0) return;
      const ids = projects.map((project) => getProjectId(project.title));
      const index = ids.indexOf(selectedProjectId);
      if (index < 0) return;
      const next = ids[(index + direction + ids.length) % ids.length];
      onProjectSelectRef.current?.(next);
    },
    [projects, selectedProjectId, onProjectSelectRef],
  );

  const copyLink = useCallback(() => {
    if (!activePath) return;
    trackEvent('link_copied', { path: activePath });
    void navigator.clipboard?.writeText(new URL(activePath, window.location.origin).toString());
  }, [activePath]);

  /** Menu ids present in the bar, left to right — drives roving tabindex. */
  const barOrder: MenuId[] = ['logo', 'window', 'file', 'view', 'help'];

  const onTriggerKeyDown = (e: React.KeyboardEvent, id: MenuId) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const index = barOrder.indexOf(id);
    const next = barOrder[(index + (e.key === 'ArrowRight' ? 1 : -1) + barOrder.length) % barOrder.length];
    setFocusIndex(barOrder.indexOf(next));
    triggerRefs.current[next]?.focus();
  };

  /** Hovering a sibling label switches menus without a second click. */
  const onTriggerEnter = (id: MenuId) => {
    if (openMenu !== null && openMenu !== id) setOpenMenu(id);
  };

  const triggerProps = (id: MenuId) => ({
    ref: (el: HTMLButtonElement | null) => {
      triggerRefs.current[id] = el;
    },
    type: 'button' as const,
    role: 'menuitem',
    tabIndex: barOrder.indexOf(id) === focusIndex ? 0 : -1,
    'data-cuelume-hover': 'tick',
    'data-cuelume-press': true,
    onPointerEnter: () => onTriggerEnter(id),
    onKeyDown: (e: React.KeyboardEvent) => onTriggerKeyDown(e, id),
    onFocus: () => setFocusIndex(Math.max(0, barOrder.indexOf(id))),
  });

  const labelClass = (id: MenuId) =>
    cn(
      'os-menu-label flex h-full items-center rounded-md px-3.5 text-[13px] font-medium transition-colors duration-120',
      focusRing,
      openMenu === id ? 'bg-white/[0.12] text-current' : 'text-current hover:bg-white/[0.08]',
    );

  const menuContentProps = {
    align: 'start' as const,
    sideOffset: 8,
    className: 'os-menu-content',
  };

  /*
   * Rows are built lazily: this component re-renders on any OS state change, and
   * eagerly constructing every menu (File/View/Help exist twice — full bar plus
   * overflow) meant ~40 items per render for menus nobody had opened. The Content
   * element stays mounted so Radix keeps its close animation.
   */
  const rowsWhenOpen = (id: MenuId, rows: () => React.ReactNode) =>
    openMenu === id ? rows() : null;

  /* ---------------------------------------------------------------- Logo */
  const logoRows = () => (
    <>
      <DropdownMenuItem className={menuItemClass} onClick={() => openWindow('home')}>
        {t('home')}
      </DropdownMenuItem>
      <DropdownMenuSeparator className="os-menu-divider" />
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('about', { syncUrl: false })}
      >
        About Me
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('contact', { syncUrl: false })}
      >
        {t('contact')}
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('colophon', { syncUrl: false })}
      >
        Colophon
      </DropdownMenuItem>
      <DropdownMenuSeparator className="os-menu-divider" />
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => {
          trackEvent('desktop_reset');
          resetDesktop();
        }}
      >
        Reset Desktop
      </DropdownMenuItem>
    </>
  );

  const logoMenu = (
    <DropdownMenu open={openMenu === 'logo'} onOpenChange={(o) => setOpenMenu(o ? 'logo' : null)}>
      <DropdownMenuTrigger asChild>
        <button
          {...triggerProps('logo')}
          aria-label="Menu"
          className={cn(
            'os-menu-label flex h-full items-center rounded-md px-3 transition-colors duration-120',
            focusRing,
            openMenu === 'logo' ? 'bg-white/[0.12]' : 'hover:bg-white/[0.08]',
          )}
        >
          <Image
            src="/photos/Image@4x.png"
            alt=""
            width={120}
            height={40}
            className="h-5 w-auto"
            priority
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...menuContentProps}>{rowsWhenOpen('logo', logoRows)}</DropdownMenuContent>
    </DropdownMenu>
  );

  /*
   * Recent windows, listed inline rather than in a submenu — nested menus are
   * the one thing in here that did not survive contact with the OS chrome.
   */
  const recentRows = () => (
    <>
      <DropdownMenuLabel className="os-menu-heading">Open Recent</DropdownMenuLabel>
      {recents.length === 0 ? (
        <DropdownMenuItem className={cn(menuItemClass, 'pointer-events-none opacity-30')}>
          No Recent Items
        </DropdownMenuItem>
      ) : (
        <>
          {recents.map((id) => (
            <DropdownMenuItem key={id} className={menuItemClass} onClick={() => openWindow(id)}>
              {windowTitles[id]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem className={menuItemClass} onClick={clearRecents}>
            Clear Menu
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  /* -------------------------------------------------------- Active window */
  const windowMenu = (
    <DropdownMenu
      open={openMenu === 'window'}
      onOpenChange={(o) => setOpenMenu(o ? 'window' : null)}
    >
      <DropdownMenuTrigger asChild>
        <button
          {...triggerProps('window')}
          className={cn(labelClass('window'), 'font-semibold !text-current')}
        >
          {activeTitle}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...menuContentProps}>
        {openMenu !== 'window' ? null : activeId ? (
          <>
            {activePath ? (
              <DropdownMenuItem className={menuItemClass} onClick={copyLink}>
                Copy Link
              </DropdownMenuItem>
            ) : null}
            {activeProject ? (
              <>
                <DropdownMenuSeparator className="os-menu-divider" />
                <DropdownMenuItem className={menuItemClass} onClick={() => stepCaseStudy(1)}>
                  Next Case Study
                </DropdownMenuItem>
                <DropdownMenuItem className={menuItemClass} onClick={() => stepCaseStudy(-1)}>
                  Previous Case Study
                </DropdownMenuItem>
                {activeProject.url ? (
                  <DropdownMenuItem
                    className={menuItemClass}
                    onClick={() =>
                      {
                        trackEvent('outbound_link', {
                          destination: 'case_study_live_site',
                          slug: selectedProjectId ?? '',
                        });
                        window.open(activeProject.url, '_blank', 'noopener,noreferrer');
                      }
                    }
                  >
                    View Live Site
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : null}
            <DropdownMenuSeparator className="os-menu-divider" />
            <DropdownMenuItem className={menuItemClass} onClick={() => window.print()}>
              Print…
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => closeWindow(activeId)}>
              Close
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {recentRows()}
            <DropdownMenuSeparator className="os-menu-divider" />
            <DropdownMenuItem className={menuItemClass} onClick={toggleWidgets}>
              Show Desktop Widgets
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /* ---------------------------------------------------------------- File */
  const fileRows = () => (
    <>
      {recentRows()}
      <DropdownMenuSeparator className="os-menu-divider" />
      <DropdownMenuItem
        className={cn(menuItemClass, !activeId && 'pointer-events-none opacity-30')}
        onClick={() => activeId && closeWindow(activeId)}
      >
        Close Window
      </DropdownMenuItem>
    </>
  );

  /* ---------------------------------------------------------------- View */
  const viewRows = () => (
    <>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={toggleWidgets}
        role="menuitemcheckbox"
        aria-checked={widgetsOpen}
      >
        <Check className={cn('h-3.5 w-3.5', !widgetsOpen && 'invisible')} aria-hidden />
        Show Desktop Widgets
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => setIconLabels(!iconLabels)}
        role="menuitemcheckbox"
        aria-checked={iconLabels}
      >
        <Check className={cn('h-3.5 w-3.5', !iconLabels && 'invisible')} aria-hidden />
        Show Icon Labels
      </DropdownMenuItem>
      <DropdownMenuSeparator className="os-menu-divider" />
      <DropdownMenuItem
        className={cn(menuItemClass, zoom >= ZOOM_MAX && 'pointer-events-none opacity-30')}
        onSelect={(e) => {
          e.preventDefault();
          stepZoom(1);
        }}
      >
        Zoom In
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(menuItemClass, zoom <= ZOOM_MIN && 'pointer-events-none opacity-30')}
        onSelect={(e) => {
          e.preventDefault();
          stepZoom(-1);
        }}
      >
        Zoom Out
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(menuItemClass, zoom === 100 && 'pointer-events-none opacity-30')}
        onClick={() => setZoom(100)}
      >
        Actual Size
      </DropdownMenuItem>
      <DropdownMenuSeparator className="os-menu-divider" />
      <DropdownMenuItem
        className={cn(menuItemClass, !activeId && 'pointer-events-none opacity-30')}
        onClick={() => activeId && toggleCover(activeId)}
      >
        {activeId && windows[activeId].covered ? 'Exit Full Screen' : 'Enter Full Screen'}
      </DropdownMenuItem>
    </>
  );

  /* ---------------------------------------------------------------- Help */
  const helpRows = () => (
    <>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('guide', { syncUrl: false })}
      >
        What is this site?
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('about', { syncUrl: false })}
      >
        About Me
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => openWindow('ask', { syncUrl: false })}
      >
        {t('askAI')}
      </DropdownMenuItem>
      <DropdownMenuItem
        className={menuItemClass}
        onClick={() => {
          trackEvent('bug_reported');
          window.open(REPORT_BUG_MAILTO, '_self');
        }}
      >
        Report a Bug
      </DropdownMenuItem>
    </>
  );

  const namedMenu = (id: MenuId, label: string, rows: () => React.ReactNode) => (
    <DropdownMenu open={openMenu === id} onOpenChange={(o) => setOpenMenu(o ? id : null)}>
      <DropdownMenuTrigger asChild>
        <button {...triggerProps(id)} className={labelClass(id)}>
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...menuContentProps}>{rowsWhenOpen(id, rows)}</DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav role="menubar" aria-label="Desktop menu" className="os-menubar-row flex h-full items-center gap-0.5">
      {/* Phones get the mark only — the icon rail is the navigation there */}
      <span className="os-menubar-logo contents">{logoMenu}</span>
      <button
        type="button"
        aria-label="Home"
        onClick={() => openWindow('home')}
        className={cn(
          'os-menubar-logo-plain hidden h-full items-center rounded-md px-3',
          focusRing,
        )}
      >
        <Image src="/photos/Image@4x.png" alt="" width={120} height={40} className="h-5 w-auto" priority />
      </button>
      <span className="os-menubar-menus contents">{windowMenu}</span>

      {/* ≥900px: full bar */}
      <div className="os-menubar-full os-menubar-menus contents">
        {namedMenu('file', 'File', fileRows)}
        {namedMenu('view', 'View', viewRows)}
        {namedMenu('help', 'Help', helpRows)}
      </div>

      {/* 640–900px: one flat menu, section labels instead of nested submenus */}
      <div className="os-menubar-overflow os-menubar-menus hidden">
        <DropdownMenu
          open={openMenu === 'overflow'}
          onOpenChange={(o) => setOpenMenu(o ? 'overflow' : null)}
        >
          <DropdownMenuTrigger asChild>
            <button
              {...triggerProps('overflow')}
              aria-label="More menus"
              className={labelClass('overflow')}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent {...menuContentProps}>
            {rowsWhenOpen('overflow', () => (
              <>
                <DropdownMenuLabel className="os-menu-heading">File</DropdownMenuLabel>
                {fileRows()}
                <DropdownMenuSeparator className="os-menu-divider" />
                <DropdownMenuLabel className="os-menu-heading">View</DropdownMenuLabel>
                {viewRows()}
                <DropdownMenuSeparator className="os-menu-divider" />
                <DropdownMenuLabel className="os-menu-heading">Help</DropdownMenuLabel>
                {helpRows()}
              </>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
