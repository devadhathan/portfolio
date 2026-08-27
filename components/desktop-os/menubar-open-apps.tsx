'use client';

import { useMemo } from 'react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useWindowTitles } from '@/components/desktop-os/window-titles';
import {
  DESKTOP_WINDOW_IDS,
  WINDOW_ICON_SRC,
  type DesktopWindowId,
} from '@/lib/desktop-os';
import { cn, focusRing } from '@/lib/utils';

/**
 * Apps launched from the desktop rail (not the dock cluster).
 * Open ones pin as small menubar icons left of Control Center.
 */
const DESKTOP_LAUNCH_IDS = new Set<DesktopWindowId>([
  'ask',
  'photos',
  'catalystic',
  'bigBang',
  'contact',
  'about',
  'colophon',
  'wordsmith',
  'trash',
]);

export function MenubarOpenApps() {
  const { windows, focusedId, openWindow, focusWindow } = useDesktopOs();
  const titles = useWindowTitles();

  const openIds = useMemo(() => {
    return DESKTOP_WINDOW_IDS.filter(
      (id) => DESKTOP_LAUNCH_IDS.has(id) && windows[id]?.open,
    ).sort((a, b) => (windows[b]?.zIndex ?? 0) - (windows[a]?.zIndex ?? 0));
  }, [windows]);

  if (openIds.length === 0) return null;

  return (
    <div className="os-menubar-apps flex items-center gap-0.5 pr-1" role="toolbar" aria-label="Open apps">
      {openIds.map((id) => {
        const active = focusedId === id;
        const src = WINDOW_ICON_SRC[id];
        if (!src) return null;
        return (
          <button
            key={id}
            type="button"
            title={titles[id]}
            aria-label={titles[id]}
            aria-pressed={active}
            data-cuelume-hover="tick"
            data-cuelume-press
            className={cn(
              'os-menubar-apps__btn inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              focusRing,
              active ? 'bg-white/[0.16]' : 'hover:bg-white/[0.1]',
            )}
            onClick={() => {
              if (windows[id]?.open) focusWindow(id, { syncUrl: false });
              else openWindow(id, { syncUrl: false });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain drop-shadow-sm"
              draggable={false}
              decoding="async"
            />
          </button>
        );
      })}
    </div>
  );
}
