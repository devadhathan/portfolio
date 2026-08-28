'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useWindowTitles } from '@/components/desktop-os/window-titles';
import { prefetchDesktopWindow } from '@/components/desktop-os/window-bodies';
import { trackEvent } from '@/lib/analytics';
import { cn, focusRing } from '@/lib/utils';
import { DESKTOP_WINDOW_IDS, type DesktopWindowId } from '@/lib/desktop-os';

type ShortcutItem = { id: DesktopWindowId; icon: ReactNode };

/** Geist-style line icons — stroked, currentColor, 20px box. */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const SHORTCUT_ITEMS: ShortcutItem[] = [
  {
    id: 'home',
    icon: (
      <svg {...iconProps}>
        <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V8.5Z" />
      </svg>
    ),
  },
  {
    id: 'work',
    icon: (
      <svg {...iconProps}>
        <rect x="2.75" y="6.25" width="14.5" height="10" rx="1.75" />
        <path d="M7 6.25V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.25M2.75 10.5h14.5" />
      </svg>
    ),
  },
  {
    id: 'playground',
    icon: (
      <svg {...iconProps}>
        <path d="M8 2.75v4.6l-3.72 6.36A1.55 1.55 0 0 0 5.6 16.5h8.8a1.55 1.55 0 0 0 1.32-2.79L12 7.35v-4.6" />
        <path d="M6.9 2.75h6.2M5.85 12.25h8.3" />
      </svg>
    ),
  },
];

/** Pointer distance (px) from the bottom edge that opens the bar. */
const REVEAL_EDGE_PX = 110;
const HIDE_DELAY_MS = 520;
/** Mobile scroll delta (px) before the pill shrinks / grows back. */
const SCROLL_SHRINK_THRESHOLD = 10;

/**
 * Compact bottom shortcut bar for Home / Work / Playground. Rests as a small
 * pill handle and expands when the pointer nears the bottom edge — the dock is
 * parked, so this is the quick way between the three primary windows.
 */
export function ShortcutBar() {
  const t = useTranslations('nav');
  const titles = useWindowTitles();
  const { windows, openWindow, isNarrow } = useDesktopOs();
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const hoverRef = useRef(false);
  const hideTimerRef = useRef(0);
  const navRef = useRef<HTMLElement | null>(null);

  /** Pointer move fires constantly — only re-render on a real change. */
  const setRevealedIfChanged = useCallback((next: boolean) => {
    if (revealedRef.current === next) return;
    revealedRef.current = next;
    setRevealed(next);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = 0;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = 0;
      // Trust the DOM over the ref: opening a window can swallow the
      // pointerleave, which used to leave hoverRef stuck true forever.
      const el = navRef.current;
      if (el?.isConnected && el.matches(':hover')) {
        hoverRef.current = true;
        return;
      }
      hoverRef.current = false;
      setRevealedIfChanged(false);
    }, HIDE_DELAY_MS);
  }, [cancelHide, setRevealedIfChanged]);

  /** Collapse and forget any stale hover — used when a window takes over. */
  const collapseNow = useCallback(() => {
    hoverRef.current = false;
    cancelHide();
    setRevealedIfChanged(false);
  }, [cancelHide, setRevealedIfChanged]);

  // Touch has no hover — the bar stays open and shrinks while scrolling down.
  useEffect(() => {
    if (!isNarrow) return;
    cancelHide();
    setRevealedIfChanged(true);

    let lastY = 0;
    let lastTarget: Element | null = null;

    const onScroll = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const y = 'scrollTop' in target ? (target as HTMLElement).scrollTop : 0;
      // Identity check first — the ancestor walk only runs when the scrolling
      // container changes, not on every event from the same one.
      if (lastTarget !== target) {
        if (target.closest('.os-shortcut-bar')) return;
        lastTarget = target;
        lastY = y;
        return;
      }

      const dy = y - lastY;
      lastY = y;

      // At the very top it always sits open; otherwise it follows scroll direction.
      if (y <= 12) {
        setRevealedIfChanged(true);
        return;
      }
      if (dy > SCROLL_SHRINK_THRESHOLD) setRevealedIfChanged(false);
      else if (dy < -SCROLL_SHRINK_THRESHOLD) setRevealedIfChanged(true);
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [isNarrow, cancelHide, setRevealedIfChanged]);

  useEffect(() => {
    if (isNarrow) return;

    const onMove = (e: PointerEvent) => {
      const nearBottom = window.innerHeight - e.clientY <= REVEAL_EDGE_PX;
      if (nearBottom) {
        cancelHide();
        setRevealedIfChanged(true);
        return;
      }
      // Already collapsed: nothing to hide, so skip the hover probe and the
      // timer entirely. This is the common case on every pointer move.
      if (!revealedRef.current) return;
      if (hoverRef.current && navRef.current?.matches(':hover')) return;
      hoverRef.current = false;
      scheduleHide();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelHide();
    };
  }, [isNarrow, cancelHide, scheduleHide, setRevealedIfChanged]);

  // A window expanding to cover the desktop takes focus — shrink out of its way.
  const anyCovered = DESKTOP_WINDOW_IDS.some(
    (id) => windows[id]?.open && windows[id]?.covered,
  );

  useEffect(() => {
    if (isNarrow || !anyCovered) return;
    collapseNow();
  }, [isNarrow, anyCovered, collapseNow]);

  useEffect(() => cancelHide, [cancelHide]);

  const open = (item: ShortcutItem) => {
    trackEvent('dock_opened', { window: item.id });
    openWindow(item.id, { syncUrl: true });
  };

  return (
    <nav
      ref={navRef}
      className="os-shortcut-bar"
      aria-label={t('dock')}
      onPointerEnter={() => {
        hoverRef.current = true;
        cancelHide();
        setRevealedIfChanged(true);
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
        if (!isNarrow) scheduleHide();
      }}
    >
      {/*
        Only the well's own box animates. Both layers stay mounted and are
        absolutely centered, so the icons never reflow mid-transition — that
        per-frame relayout was what made the row shimmer.
      */}
      <div className={cn('os-shortcut-bar__well', revealed && 'os-shortcut-bar__well--open')}>
        <span className="os-shortcut-bar__layer os-shortcut-bar__layer--handle" aria-hidden>
          <span className="os-shortcut-bar__handle" />
        </span>
        <div className="os-shortcut-bar__layer os-shortcut-bar__layer--items">
          {SHORTCUT_ITEMS.map((item) => {
            const label = titles[item.id];
            return (
              <button
                key={item.id}
                type="button"
                aria-label={label}
                tabIndex={revealed ? undefined : -1}
                data-cuelume-hover="tick"
                data-cuelume-press
                data-os-icon={item.id}
                className={cn('os-shortcut-bar__item', focusRing)}
                onClick={() => open(item)}
                onPointerDown={() => prefetchDesktopWindow(item.id)}
                onMouseEnter={() => prefetchDesktopWindow(item.id)}
                onFocus={() => prefetchDesktopWindow(item.id)}
              >
                <span className="os-shortcut-bar__tooltip" aria-hidden>
                  {label}
                </span>
                <span className="os-shortcut-bar__icon">{item.icon}</span>
                <span
                  className={cn(
                    'os-shortcut-bar__dot',
                    windows[item.id]?.open && 'os-shortcut-bar__dot--on',
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
