'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesktopWindowId } from '@/lib/desktop-os';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';

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

  return (
    <div
      className={cn(
        'os-window absolute flex flex-col overflow-hidden rounded-2xl border border-border/40 isolate',
        focusedId === id && isOpen && 'os-window--focused',
        win.covered ? 'os-window--covered' : 'os-window--stage-max',
        !isOpen && 'os-window--closed',
      )}
      style={{ zIndex: isOpen ? win.zIndex : 0 }}
      aria-hidden={!isOpen}
      onMouseDown={() => {
        if (!isOpen) return;
        focusWindow(id, { syncUrl: true });
      }}
    >
      <div className="os-window-titlebar flex h-10 shrink-0 cursor-default items-center gap-3 border-b border-border/25 px-3.5">
        <div className="flex items-center gap-[0.35rem]" data-os-controls>
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
          {/* Minimize not supported — blank yellow slot */}
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
          />
        </div>
        <span className="pointer-events-none flex-1 select-none text-left text-sm font-medium tracking-tight text-foreground/80">
          {title}
        </span>
      </div>
      <div className="os-window-body min-h-0 flex-1 overflow-auto overscroll-contain">{children}</div>
    </div>
  );
}
