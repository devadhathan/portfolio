'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useWindowTitles } from '@/components/desktop-os/window-titles';
import { prefetchDesktopWindow } from '@/components/desktop-os/window-bodies';
import { trackEvent } from '@/lib/analytics';
import { setDockInteractionBusy } from '@/lib/dock-interaction';
import {
  DESKTOP_WINDOW_IDS,
  WINDOW_ICON_SRC,
  WINDOW_PATH,
  type DesktopWindowId,
  type FinderLocation,
} from '@/lib/desktop-os';
import { cn, focusRing } from '@/lib/utils';

type DockItem = {
  id: DesktopWindowId;
  src: string;
  /** Route-syncing windows keep their URL; the rest open in place. */
  syncUrl?: boolean;
  /** When set, dock opens Finder at this sidebar location. */
  finderLocation?: FinderLocation;
};

/** Primary cluster — Mac-style dock apps (Photos sits after a divider). */
const PRIMARY_DOCK_ITEMS: DockItem[] = [
  { id: 'home', src: '/icons/home.svg', syncUrl: true },
  { id: 'work', src: '/icons/briefcase.svg', syncUrl: true },
  { id: 'playground', src: '/icons/playgroundd.svg', syncUrl: true },
];

/** Trailing dock apps — right of the divider. */
const TRAILING_DOCK_ITEMS: DockItem[] = [
  { id: 'photos', src: '/icons/image.svg' },
];

const PRIMARY_DOCK_IDS = new Set<DesktopWindowId>([
  ...PRIMARY_DOCK_ITEMS.map((item) => item.id),
  ...TRAILING_DOCK_ITEMS.map((item) => item.id),
]);

/** Peak icon scale under the cursor (desktop only). */
const MAX_SCALE = 1.48;
/** How far (px) the wave falls off from the cursor. */
const WAVE_RADIUS = 120;
/** Desktop resting slot / icon sizes (px). */
const BASE_SLOT_PX = 50;
const BASE_ICON_PX = 44;
const BARE_ICON_PX = 47;
/** Mobile — tighter so the dock isn’t full-width. */
const NARROW_SLOT_PX = 38;
const NARROW_ICON_PX = 32;
const NARROW_BARE_ICON_PX = 34;
/** Resting / expanded horizontal padding (px). */
const PAD_X_REST = 14;
const PAD_X_HOT = 28;
const GAP_REST = 10;
const GAP_HOT = 16;
const NARROW_PAD_X = 8;
const NARROW_GAP = 4;
/** Bottom edge (px) that peeks the dock while a window is fullscreen. */
const REVEAL_EDGE_PX = 14;
const HIDE_DELAY_MS = 420;

/** Soft spring — icon wave, padding, labels, show/hide. */
const DOCK_SPRING = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 24,
  mass: 0.45,
};

const DOCK_SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 28,
  mass: 0.35,
};

const TOOLTIP_VARIANTS = {
  rest: { opacity: 0, y: 8, x: '-50%' },
  hover: { opacity: 1, y: 0, x: '-50%' },
};

function waveScale(distance: number): number {
  if (distance >= WAVE_RADIUS) return 1;
  const t = distance / WAVE_RADIUS;
  return 1 + (MAX_SCALE - 1) * Math.cos((t * Math.PI) / 2);
}

function DockIcon({
  item,
  label,
  open,
  mouseX,
  centerIndex,
  centersRef,
  onOpen,
  onWarm,
  itemRef,
  reduceMotion,
  compact,
}: {
  item: DockItem;
  label: string;
  open: boolean;
  mouseX: MotionValue<number>;
  /** Index into centersRef — read each frame, no React re-render on capture. */
  centerIndex: number;
  centersRef: MutableRefObject<number[]>;
  onOpen: () => void;
  /** Start downloading lazy window chunks before click completes. */
  onWarm?: () => void;
  itemRef: (el: HTMLButtonElement | null) => void;
  reduceMotion: boolean | null;
  /** Mobile: smaller slots, no magnification wave. */
  compact: boolean;
}) {
  const isBare = item.id === 'finder';
  const slotPx = compact ? NARROW_SLOT_PX : BASE_SLOT_PX;
  const baseIcon = compact
    ? isBare
      ? NARROW_BARE_ICON_PX
      : NARROW_ICON_PX
    : isBare
      ? BARE_ICON_PX
      : BASE_ICON_PX;

  const rawScale = useTransform(mouseX, (x) => {
    if (compact || !Number.isFinite(x)) return 1;
    const centerX = centersRef.current[centerIndex] ?? 0;
    if (!centerX) return 1;
    return waveScale(Math.abs(x - centerX));
  });

  const scale = useSpring(
    rawScale,
    reduceMotion || compact
      ? { stiffness: 1000, damping: 100, mass: 0.1 }
      : { stiffness: DOCK_SPRING.stiffness, damping: DOCK_SPRING.damping, mass: DOCK_SPRING.mass },
  );

  // Grow footprint equally left + right so the dock chrome expands on both edges.
  // Icon size uses transform `scale` (not width/height) so Chrome stays on the compositor;
  // the wave read is identical.
  const sideGrow = useTransform(scale, (s) => (slotPx * (s - 1)) / 2);
  const liftY = useTransform(scale, (s) => (compact ? 0 : -(s - 1) * 20));
  const tipSpring = reduceMotion ? { duration: 0 } : DOCK_SPRING_SNAPPY;

  const icon = (
    // eslint-disable-next-line @next/next/no-img-element -- local SVG, no optimisation to gain
    <img
      src={item.src}
      alt=""
      width={60}
      height={60}
      className={cn('os-dock__icon', isBare && 'os-dock__icon--bare')}
      draggable={false}
      decoding="async"
    />
  );

  return (
    <motion.button
      ref={itemRef}
      type="button"
      aria-label={label}
      data-cuelume-hover="tick"
      data-cuelume-press
      data-cuelume-release
      onClick={onOpen}
      onPointerDown={() => onWarm?.()}
      onMouseEnter={() => onWarm?.()}
      onFocus={() => onWarm?.()}
      className={cn(
        'os-dock__item',
        isBare && 'os-dock__item--bare',
        compact && 'os-dock__item--compact',
        focusRing,
      )}
      data-os-icon={item.id}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap={compact ? 'hover' : undefined}
      style={{
        width: slotPx,
        flexBasis: slotPx,
        marginLeft: sideGrow,
        marginRight: sideGrow,
      }}
    >
      <motion.span
        className="os-dock__tooltip"
        aria-hidden
        variants={TOOLTIP_VARIANTS}
        transition={tipSpring}
      >
        {label}
      </motion.span>
      {isBare ? (
        <motion.span
          className="os-dock__magnify"
          style={{ width: baseIcon, height: baseIcon, scale, y: liftY }}
        >
          {icon}
          <span className="os-dock__tint" aria-hidden />
        </motion.span>
      ) : (
        <motion.span
          className="os-dock__icon-well"
          style={{ width: baseIcon, height: baseIcon, scale, y: liftY }}
        >
          {icon}
          <span className="os-dock__tint" aria-hidden />
        </motion.span>
      )}
      <span className={cn('os-dock__dot', open && 'os-dock__dot--on')} aria-hidden />
    </motion.button>
  );
}

/** Scroll delta (px) before mobile dock hides / shows. */
const SCROLL_HIDE_THRESHOLD = 10;

/**
 * Bottom dock with a continuous, spring-smoothed magnification wave.
 * Mobile: compact, no wave; hides on scroll-down, returns on scroll-up /
 * when all windows are closed.
 */
export function Dock() {
  const t = useTranslations('nav');
  const titles = useWindowTitles();
  const { windows, openWindow, isNarrow, focusedId, finderLocation } = useDesktopOs();
  const reduceMotion = useReducedMotion();
  /** Mobile: tucked away while scrolling down inside an open window. */
  const [scrollHidden, setScrollHidden] = useState(false);

  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const padX = useMotionValue(PAD_X_REST);
  const gapMv = useMotionValue(GAP_REST);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const centersRef = useRef<number[]>([]);
  const hoveringRef = useRef(false);
  const rafRef = useRef(0);
  const hideTimerRef = useRef(0);
  const dockHoverRef = useRef(false);
  const revealedRef = useRef(false);
  const scrollLastY = useRef(0);
  const scrollLastTarget = useRef<Element | null>(null);

  const runningItems = useMemo<DockItem[]>(() => {
    const items: Array<DockItem & { zIndex: number }> = [];

    for (const id of DESKTOP_WINDOW_IDS) {
      if (!windows[id]?.open || PRIMARY_DOCK_IDS.has(id)) continue;

      // Trash / Favourites open as Finder locations — show their own dock icons.
      if (id === 'finder') {
        const zIndex = windows.finder?.zIndex ?? 0;
        if (finderLocation === 'trash') {
          items.push({
            id: 'trash',
            src: WINDOW_ICON_SRC.trash ?? '/icons/trash.svg',
            syncUrl: false,
            finderLocation: 'trash',
            zIndex,
          });
        } else if (finderLocation === 'favourites') {
          items.push({
            id: 'writings',
            src: WINDOW_ICON_SRC.writings ?? '/icons/folder.svg',
            syncUrl: false,
            finderLocation: 'favourites',
            zIndex,
          });
        }
        continue;
      }

      // Bounce-only window ids — never pin them separately.
      if (id === 'trash' || id === 'writings') continue;

      items.push({
        id,
        src: WINDOW_ICON_SRC[id] ?? '/icons/sparkles.svg',
        syncUrl: Boolean(WINDOW_PATH[id]),
        zIndex: windows[id]?.zIndex ?? 0,
      });
    }

    return items
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(({ zIndex: _z, ...item }) => item);
  }, [windows, finderLocation]);

  const allItems = useMemo(
    () => [...PRIMARY_DOCK_ITEMS, ...TRAILING_DOCK_ITEMS, ...runningItems],
    [runningItems],
  );

  const fullscreen = DESKTOP_WINDOW_IDS.some(
    (id) => windows[id]?.open && windows[id]?.covered,
  );
  /** Desktop-only: peek/hide dock over fullscreen windows. Mobile uses scroll hide. */
  const autohideFullscreen = Boolean(fullscreen && !isNarrow);
  const anyWindowOpen = DESKTOP_WINDOW_IDS.some((id) => windows[id]?.open);
  const [revealed, setRevealed] = useState(false);

  // Keep pad/gap motion values in sync with layout mode (no hover flash).
  useEffect(() => {
    if (isNarrow) {
      padX.set(NARROW_PAD_X);
      gapMv.set(NARROW_GAP);
      return;
    }
    if (!dockHoverRef.current) {
      padX.set(PAD_X_REST);
      gapMv.set(GAP_REST);
    }
  }, [isNarrow, padX, gapMv]);

  useEffect(() => {
    return () => setDockInteractionBusy(false);
  }, []);

  // Mobile: hide dock when scrolling down in a window; show on scroll up / desktop.
  useEffect(() => {
    if (!isNarrow) {
      setScrollHidden(false);
      return;
    }
    if (!anyWindowOpen) {
      setScrollHidden(false);
      scrollLastTarget.current = null;
      return;
    }

    const onScroll = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.os-dock') || target.closest('.os-dock__hotzone')) return;

      const y = 'scrollTop' in target ? (target as HTMLElement).scrollTop : 0;
      if (scrollLastTarget.current !== target) {
        scrollLastTarget.current = target;
        scrollLastY.current = y;
        return;
      }

      const dy = y - scrollLastY.current;
      scrollLastY.current = y;

      if (y <= 12) {
        setScrollHidden(false);
        return;
      }
      if (dy > SCROLL_HIDE_THRESHOLD) setScrollHidden(true);
      else if (dy < -SCROLL_HIDE_THRESHOLD) setScrollHidden(false);
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [isNarrow, anyWindowOpen]);

  // Switching / opening a window brings the dock back.
  useEffect(() => {
    if (!isNarrow) return;
    setScrollHidden(false);
    scrollLastTarget.current = null;
  }, [isNarrow, focusedId]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, allItems.length);
    if (!dockHoverRef.current) centersRef.current = [];
  }, [allItems.length]);

  const warmWindow = useCallback((id: DesktopWindowId) => {
    prefetchDesktopWindow(id);
  }, []);

  const open = (item: DockItem) => {
    trackEvent('dock_opened', { window: item.id });
    if (item.finderLocation) {
      openWindow('finder', { syncUrl: false, finderLocation: item.finderLocation });
      return;
    }
    if (item.id === 'trash') {
      openWindow('finder', { syncUrl: false, finderLocation: 'trash' });
      return;
    }
    if (item.id === 'writings') {
      openWindow('finder', { syncUrl: false, finderLocation: 'favourites' });
      return;
    }
    openWindow(item.id, { syncUrl: item.syncUrl ?? false });
  };

  const captureCenters = useCallback(() => {
    const next = itemRefs.current.map((el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    if (next.some((c) => c > 0)) centersRef.current = next;
  }, []);

  const resetWave = useCallback(() => {
    hoveringRef.current = false;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    mouseX.set(Number.POSITIVE_INFINITY);
  }, [mouseX]);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = 0;
    }
  }, []);

  const showDock = useCallback(() => {
    cancelHide();
    if (!revealedRef.current) {
      revealedRef.current = true;
      setRevealed(true);
    }
  }, [cancelHide]);

  const scheduleHide = useCallback(() => {
    if (!revealedRef.current || dockHoverRef.current) return;
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = 0;
      if (dockHoverRef.current) return;
      revealedRef.current = false;
      setRevealed(false);
    }, HIDE_DELAY_MS);
  }, [cancelHide]);

  useEffect(() => {
    if (!autohideFullscreen) {
      cancelHide();
      if (revealedRef.current) {
        revealedRef.current = false;
        setRevealed(false);
      }
      return;
    }

    const onMove = (e: PointerEvent) => {
      const fromBottom = window.innerHeight - e.clientY;
      if (fromBottom <= REVEAL_EDGE_PX || dockHoverRef.current) {
        showDock();
        return;
      }
      scheduleHide();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelHide();
    };
  }, [autohideFullscreen, cancelHide, scheduleHide, showDock]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Mobile: no magnification wave — keeps the dock compact; labels still show on press.
    if (reduceMotion || isNarrow) return;
    hoveringRef.current = true;
    mouseX.set(e.clientX);
    // Recapture at most once per frame while the gap/padding spring settles —
    // trailing icons (e.g. Photos) otherwise magnify off a stale center.
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (hoveringRef.current) captureCenters();
      });
    }
  };

  const onDockEnter = () => {
    dockHoverRef.current = true;
    if (isNarrow) {
      setScrollHidden(false);
    } else {
      setDockInteractionBusy(true);
      captureCenters();
      // One layout pass after enter — still ref-only, no React re-render.
      requestAnimationFrame(() => {
        if (dockHoverRef.current) captureCenters();
      });
      if (!reduceMotion) {
        void animate(padX, PAD_X_HOT, DOCK_SPRING);
        void animate(gapMv, GAP_HOT, DOCK_SPRING);
      } else {
        padX.set(PAD_X_HOT);
        gapMv.set(GAP_HOT);
      }
    }
    if (autohideFullscreen) showDock();
  };

  const onDockLeave = () => {
    dockHoverRef.current = false;
    setDockInteractionBusy(false);
    resetWave();
    centersRef.current = [];
    if (!isNarrow) {
      if (!reduceMotion) {
        void animate(padX, PAD_X_REST, DOCK_SPRING);
        void animate(gapMv, GAP_REST, DOCK_SPRING);
      } else {
        padX.set(PAD_X_REST);
        gapMv.set(GAP_REST);
      }
    }
    if (autohideFullscreen) scheduleHide();
  };

  const revealFromEdge = useCallback(() => {
    setScrollHidden(false);
    if (autohideFullscreen) showDock();
  }, [autohideFullscreen, showDock]);

  const spring = reduceMotion ? { duration: 0 } : DOCK_SPRING;
  const primaryCount = PRIMARY_DOCK_ITEMS.length;
  const trailingCount = TRAILING_DOCK_ITEMS.length;
  const dockHidden = Boolean(autohideFullscreen && !revealed);
  const scrollAway = Boolean(isNarrow && scrollHidden && anyWindowOpen);
  const dockOffscreen = dockHidden || scrollAway;

  const iconProps = {
    mouseX,
    centersRef,
    reduceMotion,
    compact: isNarrow,
  };

  return (
    <>
      {autohideFullscreen || (isNarrow && anyWindowOpen && scrollAway) ? (
        <div
          className="os-dock__hotzone"
          aria-hidden
          onPointerEnter={revealFromEdge}
          onPointerDown={revealFromEdge}
        />
      ) : null}
      <motion.nav
        className={cn(
          'os-dock',
          isNarrow && 'os-dock--compact',
          autohideFullscreen && 'os-dock--autohide',
          scrollAway && 'os-dock--scroll-hidden',
        )}
        aria-label={t('dock')}
        aria-hidden={dockOffscreen ? true : undefined}
        initial={false}
        animate={{
          y: dockOffscreen ? 'calc(100% + 1.25rem)' : 0,
          opacity: dockOffscreen ? 0 : 1,
        }}
        transition={spring}
        style={{
          left: '50%',
          x: '-50%',
        }}
      >
        <motion.div
          className="os-dock__well"
          onPointerEnter={onDockEnter}
          onPointerMove={onPointerMove}
          onPointerLeave={onDockLeave}
          style={{
            paddingLeft: padX,
            paddingRight: padX,
            gap: gapMv,
            pointerEvents: dockOffscreen ? 'none' : 'auto',
          }}
        >
          {PRIMARY_DOCK_ITEMS.map((item, index) => (
            <DockIcon
              key={item.id}
              item={item}
              label={titles[item.id]}
              open={windows[item.id]?.open ?? false}
              centerIndex={index}
              onOpen={() => open(item)}
              onWarm={() => warmWindow(item.id)}
              itemRef={(el) => {
                itemRefs.current[index] = el;
              }}
              {...iconProps}
            />
          ))}

          <span className="os-dock__divider" aria-hidden />

          {TRAILING_DOCK_ITEMS.map((item, trailIndex) => {
            const index = primaryCount + trailIndex;
            return (
              <DockIcon
                key={item.id}
                item={item}
                label={titles[item.id]}
                open={windows[item.id]?.open ?? false}
                centerIndex={index}
                onOpen={() => open(item)}
              onWarm={() => warmWindow(item.id)}
                itemRef={(el) => {
                  itemRefs.current[index] = el;
                }}
                {...iconProps}
              />
            );
          })}

          {runningItems.map((item, runIndex) => {
            const index = primaryCount + trailingCount + runIndex;
            return (
              <DockIcon
                key={`${item.id}-${item.finderLocation ?? 'app'}`}
                item={item}
                label={titles[item.id]}
                open
                centerIndex={index}
                onOpen={() => open(item)}
              onWarm={() => warmWindow(item.id)}
                itemRef={(el) => {
                  itemRefs.current[index] = el;
                }}
                {...iconProps}
              />
            );
          })}
        </motion.div>
      </motion.nav>
    </>
  );
}
