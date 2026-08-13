'use client';

import type { ReactNode } from 'react';
import { Minus, Square, X } from 'lucide-react';
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
 * Zoom toggles full desktop cover. No drag, minimize, or edge resize.
 * Closed windows stay mounted (hidden) so revisits skip Loading….
 */
export function OsWindow({ id, title, children }: OsWindowProps) {
  const { windows, focusedId, focusWindow, closeWindow, toggleCover } = useDesktopOs();
  const win = windows[id];
  const isOpen = win.open;

  return (
    <div
      className={cn(
        'os-window absolute flex flex-col overflow-hidden rounded-2xl border border-border/40',
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
      <div className="os-window-titlebar flex h-10 shrink-0 cursor-default items-center gap-3 border-b border-border/35 px-3">
        <span className="pointer-events-none flex-1 select-none pl-1 text-left text-sm font-medium tracking-tight text-foreground/80">
          {title}
        </span>
        <div className="flex items-center gap-1" data-os-controls>
          <button
            type="button"
            aria-label={win.covered ? 'Restore window' : 'Cover desktop'}
            title={win.covered ? 'Restore' : 'Cover desktop'}
            className="os-window-control"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              toggleCover(id);
            }}
          >
            {win.covered ? (
              <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <Square className="h-3 w-3" strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            aria-label="Close"
            className="os-window-control os-window-control--close"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div className="os-window-body min-h-0 flex-1 overflow-auto overscroll-contain">{children}</div>
    </div>
  );
}
