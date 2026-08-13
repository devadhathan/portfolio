'use client';

import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useDesktopIconLayout,
  useDesktopOs,
} from '@/components/desktop-os/desktop-os-provider';
import {
  DESKTOP_LINK_ICONS,
  NARROW_ICON_POSITIONS,
  type DesktopIconId,
  type DesktopLinkIconId,
  type DesktopWindowId,
} from '@/lib/desktop-os';
import { prefetchDesktopWindow } from '@/components/desktop-os/window-bodies';
import { cn, focusRing } from '@/lib/utils';

/** App icons that open an OS window (subset of DesktopWindowId). */
const APP_ICON_IDS = ['home', 'work', 'playground', 'ask', 'games', 'photos'] as const;
type AppIconWindowId = (typeof APP_ICON_IDS)[number];

const APP_ICONS: {
  id: AppIconWindowId;
  labelKey: 'aboutMe' | 'work' | 'playground' | 'askAI' | 'games' | 'photos';
  src: string;
}[] = [
  { id: 'home', labelKey: 'aboutMe', src: '/icons/user.svg' },
  { id: 'work', labelKey: 'work', src: '/icons/briefcase.svg' },
  { id: 'playground', labelKey: 'playground', src: '/icons/folder.svg' },
  { id: 'ask', labelKey: 'askAI', src: '/icons/sparkles.svg' },
  { id: 'games', labelKey: 'games', src: '/icons/lightbulb.svg' },
  { id: 'photos', labelKey: 'photos', src: '/icons/image.svg' },
];

const APP_ICON_ID_SET = new Set<DesktopWindowId>(APP_ICON_IDS);

const LINK_ICON_SRC: Record<DesktopLinkIconId, string> = {
  writings: '/icons/news.svg',
  catalystic: '/icons/settings.svg',
  pixl: '/icons/sync.svg',
  musicNotch: '/icons/music.svg',
  linkring: '/icons/contact-card.svg',
  bigBang: '/icons/analytics.svg',
};

const iconFocusClass =
  'focus-visible:ring-white/80 focus-visible:ring-offset-black/40';

function iconStyle(pos: { x: number; y: number; edge?: 'left' | 'right' }): CSSProperties {
  const edge = pos.edge ?? 'left';
  if (edge === 'right') {
    return { right: pos.x, top: pos.y, left: 'auto' };
  }
  return { left: pos.x, top: pos.y, right: 'auto' };
}

function DesktopAssetIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      {/* Plain img — local SVGs don’t benefit from next/image */}
      <img
        src={src}
        alt={alt}
        width={64}
        height={64}
        className="os-desktop-icon__asset"
        draggable={false}
        decoding="async"
      />
      <span className="os-desktop-icon__tint" aria-hidden />
    </>
  );
}

type DesktopIconsProps = {
  onContact?: () => void;
};

export function DesktopIcons({ onContact }: DesktopIconsProps) {
  const t = useTranslations('nav');
  const {
    windows,
    focusedId,
    openWindow,
    closedStack,
    restoreFromTrash,
    isNarrow,
  } = useDesktopOs();
  const { iconPositions, moveIcon } = useDesktopIconLayout();
  const trashEmpty = closedStack.length === 0;
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
      if (APP_ICON_ID_SET.has(id as DesktopWindowId)) {
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

  const openExternal = useCallback((href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  }, []);

  const activateIcon = useCallback(
    (id: DesktopIconId) => {
      if (id === 'trash') {
        if (!trashEmpty) restoreFromTrash();
        return;
      }
      if (id === 'contact') {
        onContact?.();
        return;
      }

      const link = DESKTOP_LINK_ICONS.find((item) => item.id === id);
      if (link) {
        openExternal(link.href);
        return;
      }

      if (APP_ICON_ID_SET.has(id as DesktopWindowId)) {
        const wid = id as AppIconWindowId;
        openWindow(wid, wid === 'games' || wid === 'photos' ? { syncUrl: false } : undefined);
      }
    },
    [onContact, openExternal, openWindow, restoreFromTrash, trashEmpty],
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
            aria-label={label}
            className={cn(iconClass, isFocused && 'os-desktop-icon--active')}
            style={styleFor(item.id, pos)}
            onMouseEnter={() => prefetchDesktopWindow(item.id)}
            onFocus={() => prefetchDesktopWindow(item.id)}
            {...dragHandlers(item.id)}
          >
            <span className="os-desktop-icon__well os-desktop-icon__well--asset">
              <DesktopAssetIcon src={item.src} alt="" />
              {isOpen ? <span className="os-desktop-icon__dot" /> : null}
            </span>
            <span className="os-desktop-icon__label">{label}</span>
          </button>
        );
      })}

      {DESKTOP_LINK_ICONS.map((item) => {
        const pos = positions[item.id] ?? {
          x: 28,
          y: 64,
          edge: item.id === 'writings' ? ('left' as const) : ('right' as const),
        };

        return (
          <button
            key={item.id}
            type="button"
            data-cuelume-hover="tick"
            aria-label={`Open ${item.label} (external)`}
            title={`${item.label} — opens externally`}
            className={iconClass}
            style={styleFor(item.id, pos)}
            {...dragHandlers(item.id)}
          >
            <span className="os-desktop-icon__well os-desktop-icon__well--asset">
              <DesktopAssetIcon src={LINK_ICON_SRC[item.id]} alt="" />
              <span className="os-desktop-icon__external" aria-hidden>
                <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
            </span>
            <span className="os-desktop-icon__label">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        data-cuelume-hover="tick"
        aria-label={t('contact')}
        className={iconClass}
        style={styleFor('contact', positions.contact ?? { x: 28, y: 416, edge: 'left' })}
        {...dragHandlers('contact')}
      >
        <span className="os-desktop-icon__well os-desktop-icon__well--asset">
          <DesktopAssetIcon src="/icons/mailbox.svg" alt="" />
        </span>
        <span className="os-desktop-icon__label">{t('contact')}</span>
      </button>

      <button
        type="button"
        data-cuelume-hover="tick"
        disabled={trashEmpty}
        aria-label={trashEmpty ? 'Trash is empty' : 'Restore from trash'}
        className={cn(iconClass, trashEmpty && 'os-desktop-icon--disabled')}
        style={styleFor('trash', positions.trash ?? { x: 28, y: 504, edge: 'right' })}
        {...dragHandlers('trash')}
      >
        <span className="os-desktop-icon__well os-desktop-icon__well--asset">
          <DesktopAssetIcon src="/icons/trash.svg" alt="" />
          {!trashEmpty ? (
            <span className="os-desktop-icon__badge">{Math.min(closedStack.length, 9)}</span>
          ) : null}
        </span>
        <span className="os-desktop-icon__label">Trash</span>
      </button>
    </div>
  );
}
