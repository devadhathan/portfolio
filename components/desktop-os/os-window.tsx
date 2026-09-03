'use client';

import type { ReactNode } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesktopWindowId } from '@/lib/desktop-os';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { OsWindowIdProvider, useOsWindowId } from '@/components/desktop-os/os-window-scope';
import { useOsWindowScrollSession } from '@/hooks/use-os-window-scroll-session';

function OsWindowScrollSession() {
  const id = useOsWindowId() as DesktopWindowId;
  useOsWindowScrollSession(id);
  return null;
}

type OsWindowProps = {
  id: DesktopWindowId;
  title: string;
  children: ReactNode;
};

/**
 * Single-window chrome: opens stage-fit (max).
 * Green toggles desktop cover. Yellow is decorative (no minimize).
 * Closed windows stay mounted (hidden) so revisits skip Loading….
 */
export function OsWindow({ id, title, children }: OsWindowProps) {
  const { windows, focusedId, focusWindow, closeWindow, toggleCover } = useDesktopOs();
  const win = windows[id];
  const isOpen = win.open;
  const isFinder = id === 'finder';

  return (
    <div
      data-os-window={id}
      className={cn(
        'os-window absolute flex flex-col overflow-hidden rounded-2xl border border-border/40 isolate',
        focusedId === id && isOpen && 'os-window--focused',
        win.covered ? 'os-window--covered' : 'os-window--stage-max',
        isFinder && !win.covered && 'os-window--finder',
        !isOpen && 'os-window--closed',
      )}
      style={{ zIndex: isOpen ? win.zIndex : 0 }}
      aria-hidden={!isOpen}
      onMouseDown={() => {
        if (!isOpen) return;
        focusWindow(id, { syncUrl: true });
      }}
    >
      <div className="os-window-titlebar flex h-11 shrink-0 cursor-default items-center gap-3 border-b border-border/30 px-3.5">
        <div className="os-window-traffic-group flex items-center gap-1.5" data-os-controls>
          <button
            type="button"
            aria-label="Close"
            title="Close"
            className="os-window-traffic os-window-traffic--close"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
          >
            <X className="os-window-traffic__glyph" strokeWidth={2.75} aria-hidden />
          </button>
          {/* Minimize not supported — empty inactive slot */}
          <span className="os-window-traffic os-window-traffic--idle" aria-hidden />
          <button
            type="button"
            aria-label={win.covered ? 'Restore window' : 'Cover desktop'}
            title={win.covered ? 'Restore' : 'Cover desktop'}
            className="os-window-traffic os-window-traffic--zoom"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              toggleCover(id);
            }}
          >
            {win.covered ? (
              <Minimize2 className="os-window-traffic__glyph" strokeWidth={2.75} aria-hidden />
            ) : (
              <Maximize2 className="os-window-traffic__glyph" strokeWidth={2.75} aria-hidden />
            )}
          </button>
        </div>
        <span className="os-window-title pointer-events-none flex-1 select-none text-left font-medium tracking-tight text-foreground/85">
          {title}
        </span>
      </div>
      <div
        className={cn(
          'os-window-body min-h-0 flex-1 overscroll-contain',
          isFinder ? 'overflow-hidden' : 'overflow-auto',
        )}
      >
        <OsWindowIdProvider value={id}>
          <OsWindowScrollSession />
          {children}
        </OsWindowIdProvider>
      </div>
    </div>
  );
}
