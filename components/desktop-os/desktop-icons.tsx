'use client';

import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
  useDesktopIconLayout,
  useDesktopOs,
} from '@/components/desktop-os/desktop-os-provider';
import { OsLineIcon, type OsLineIconId } from '@/components/desktop-os/os-line-icons';
import {
  DESKTOP_LINK_ICONS,
  DESKTOP_LINK_ICON_IDS,
  NARROW_ICON_POSITIONS,
  type DesktopIconId,
  type DesktopLinkIconId,
  type DesktopWindowId,
} from '@/lib/desktop-os';
import { prefetchDesktopWindow } from '@/components/desktop-os/window-bodies';
import { cn, focusRing } from '@/lib/utils';

/**
 * Desktop apps. While the dock is parked, the primary apps (Home / Work /
 * Playground / Photos) live here alongside Ask AI.
 * Draw lives in Favourites; Trash is Finder-only.
 */
const APP_ICON_IDS = ['home', 'work', 'playground', 'photos', 'ask'] as const;
type AppIconWindowId = (typeof APP_ICON_IDS)[number];

const APP_ICONS: {
  id: AppIconWindowId;
  labelKey: 'home' | 'work' | 'playground' | 'photos' | 'askAI';
  iconId: OsLineIconId;
}[] = [
  { id: 'home', labelKey: 'home', iconId: 'home' },
  { id: 'work', labelKey: 'work', iconId: 'work' },
  { id: 'playground', labelKey: 'playground', iconId: 'playground' },
  { id: 'photos', labelKey: 'photos', iconId: 'photos' },
  { id: 'ask', labelKey: 'askAI', iconId: 'ask' },
];

const LINK_ICON_ID_SET = new Set<string>(DESKTOP_LINK_ICON_IDS);
const WINDOW_ICON_ID_SET = new Set<string>([...APP_ICON_IDS, ...DESKTOP_LINK_ICON_IDS]);

/** Favourites folder on the right rail — Draw / games / etc. live inside it. */
const DESKTOP_RAIL_LINK_IDS = ['writings'] as const satisfies readonly DesktopLinkIconId[];

const iconFocusClass =
  'focus-visible:ring-white/80 focus-visible:ring-offset-black/40';

function iconStyle(pos: { x: number; y: number; edge?: 'left' | 'right' }): CSSProperties {
  const edge = pos.edge ?? 'left';
  if (edge === 'right') {
    return { right: pos.x, top: pos.y, left: 'auto' };
  }
  return { left: pos.x, top: pos.y, right: 'auto' };
}

type DesktopIconsProps = {
  /** @deprecated Contact opens as an OS window now. */
  onContact?: () => void;
};

export function DesktopIcons(_props?: DesktopIconsProps) {
  const t = useTranslations('nav');
  const {
    windows,
    focusedId,
    openWindow,
    isNarrow,
    finderLocation,
  } = useDesktopOs();
  const { iconPositions, moveIcon } = useDesktopIconLayout();
  const positionsRef = useRef(iconPositions);
  positionsRef.current = iconPositions;

  const dragRef = useRef<{
    id: DesktopIconId;
    edge: 'left' | 'right';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currX: number;
    currY: number;
    dx: number;
    dy: number;
    moved: boolean;
    el: HTMLButtonElement | null;
  } | null>(null);

  const styleFor = useCallback(
    (id: DesktopIconId, pos: { x: number; y: number; edge?: 'left' | 'right' }): CSSProperties => {
      const base = iconStyle(pos);
      const d = dragRef.current;
      // Survive mid-drag React re-renders: keep GPU translate from live drag ref
      if (d && d.id === id && d.moved) {
        return {
          ...base,
          transform: `translate3d(${d.dx}px, ${d.dy}px, 0)`,
        };
      }
      return base;
    },
    [],
  );

  const onPointerDown = useCallback(
    (id: DesktopIconId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (isNarrow || e.button !== 0) return;
      // Avoid focus / image-drag work on the grab frame
      e.preventDefault();
      if (WINDOW_ICON_ID_SET.has(id)) {
        prefetchDesktopWindow(id);
      }
      const pos = positionsRef.current[id] ?? { x: 28, y: 72, edge: 'left' as const };
      const edge = pos.edge ?? 'left';
      dragRef.current = {
        id,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
        currX: pos.x,
        currY: pos.y,
        dx: 0,
        dy: 0,
        moved: false,
        el: e.currentTarget,
      };
      // Defer --dragging class until first move (avoids grab-frame style/layer thrash)
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [isNarrow],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (isNarrow) return;
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.hypot(dx, dy) < 4) return;
      if (!d.moved) {
        d.moved = true;
        e.currentTarget.classList.add('os-desktop-icon--dragging');
      }
      d.dx = dx;
      d.dy = dy;
      // Clamp committed coords; visual follows pointer via transform
      const rawX = d.edge === 'right' ? d.origX - dx : d.origX + dx;
      const rawY = d.origY + dy;
      d.currX = Math.max(8, rawX);
      d.currY = Math.max(48, rawY);
      e.currentTarget.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    },
    [isNarrow],
  );

  const activateIcon = useCallback(
    (id: DesktopIconId) => {
      if (!WINDOW_ICON_ID_SET.has(id)) return;
      const wid = id as DesktopWindowId;
      // Desktop Favourites folder opens Finder at that location.
      if (wid === 'writings') {
        openWindow('finder', { syncUrl: false, finderLocation: 'favourites' });
        return;
      }
      const noRouteSync =
        wid === 'finder' ||
        wid === 'games' ||
        wid === 'drawesome' ||
        wid === 'photos' ||
        wid === 'contact' ||
        LINK_ICON_ID_SET.has(wid);
      openWindow(wid, noRouteSync ? { syncUrl: false } : undefined);
    },
    [openWindow],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (isNarrow) return;
      const d = dragRef.current;
      dragRef.current = null;
      e.currentTarget.classList.remove('os-desktop-icon--dragging');
      e.currentTarget.style.transform = '';
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (!d) return;
      if (d.moved) {
        moveIcon(d.id, d.currX, d.currY);
        return;
      }
      activateIcon(d.id);
    },
    [activateIcon, isNarrow, moveIcon],
  );

  const iconClass = cn(
    'os-desktop-icon',
    focusRing,
    iconFocusClass,
    isNarrow && 'os-desktop-icon--fixed',
  );

  const positions = isNarrow ? NARROW_ICON_POSITIONS : iconPositions;

  const dragHandlers = (id: DesktopIconId) =>
    isNarrow
      ? {
          onTouchStart: () => {
            if (WINDOW_ICON_ID_SET.has(id)) prefetchDesktopWindow(id);
          },
          onClick: () => activateIcon(id),
        }
      : {
          onPointerDown: onPointerDown(id),
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        };

  return (
    <div
      className={cn('os-desktop-icons', isNarrow && 'os-desktop-icons--narrow')}
      aria-label="Desktop icons"
    >
      {APP_ICONS.map((item) => {
        const pos = positions[item.id] ?? { x: 28, y: 72 };
        const win = windows[item.id];
        const isOpen = win.open;
        const isFocused = focusedId === item.id && isOpen;
        const label = t(item.labelKey);

        return (
          <button
            key={item.id}
            type="button"
            data-cuelume-hover="tick"
            data-os-icon={item.id}
            aria-label={label}
            className={cn(iconClass, isFocused && 'os-desktop-icon--active')}
            style={styleFor(item.id, pos)}
            onMouseEnter={() => prefetchDesktopWindow(item.id)}
            onFocus={() => prefetchDesktopWindow(item.id)}
            {...dragHandlers(item.id)}
          >
            <span className="os-desktop-icon__well os-desktop-icon__well--circle">
              <OsLineIcon id={item.iconId} />
            </span>
            <span className="os-desktop-icon__label">{label}</span>
          </button>
        );
      })}

      {DESKTOP_RAIL_LINK_IDS.map((id) => {
        const item = DESKTOP_LINK_ICONS.find((entry) => entry.id === id);
        if (!item) return null;
        const pos = positions[item.id] ?? {
          x: 28,
          y: 64,
          edge: 'right' as const,
        };
        const isOpen =
          item.id === 'writings'
            ? Boolean(windows.finder?.open && finderLocation === 'favourites')
            : Boolean(windows[item.id]?.open);
        const isFocused =
          item.id === 'writings'
            ? isOpen && focusedId === 'finder'
            : focusedId === item.id && isOpen;

        return (
          <button
            key={item.id}
            type="button"
            data-cuelume-hover="tick"
            data-os-icon={item.id}
            aria-label={item.label}
            className={cn(iconClass, isFocused && 'os-desktop-icon--active')}
            style={styleFor(item.id, pos)}
            {...dragHandlers(item.id)}
          >
            <span className="os-desktop-icon__well os-desktop-icon__well--circle">
              <OsLineIcon id={item.id} />
            </span>
            <span className="os-desktop-icon__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
