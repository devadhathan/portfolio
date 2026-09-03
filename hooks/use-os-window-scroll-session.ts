'use client';

import { useEffect } from 'react';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { patchOsWindowSession, readOsWindowSession } from '@/lib/os-session';
import type { DesktopWindowId } from '@/lib/desktop-os';

function scrollHost(windowId: DesktopWindowId): HTMLElement | null {
  const root = document.querySelector(`[data-os-window="${windowId}"]`);
  if (!(root instanceof HTMLElement)) return null;

  const caseScroll = root.querySelector('.os-case-scroll');
  if (caseScroll instanceof HTMLElement) return caseScroll;

  const body = root.querySelector('.os-window-body');
  return body instanceof HTMLElement ? body : null;
}

/** Debounced scroll position for an OS window body — read once on open, write on scroll. */
export function useOsWindowScrollSession(windowId: DesktopWindowId) {
  const os = useDesktopOsOptional();
  const isOpen = Boolean(os?.windows[windowId]?.open);

  useEffect(() => {
    if (!os?.enabled || !isOpen) return;

    const saved = readOsWindowSession(windowId).scrollY;
    if (saved == null) return;

    let attempts = 0;
    const restore = () => {
      const host = scrollHost(windowId);
      if (host) {
        host.scrollTop = saved;
        return;
      }
      if (attempts++ < 12) window.requestAnimationFrame(restore);
    };

    restore();
  }, [isOpen, os?.enabled, windowId]);

  useEffect(() => {
    if (!os?.enabled || !isOpen) return;

    const host = scrollHost(windowId);
    if (!host) return;

    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        patchOsWindowSession(windowId, { scrollY: host.scrollTop });
      }, 450);
    };

    host.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      host.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      patchOsWindowSession(windowId, { scrollY: host.scrollTop });
    };
  }, [isOpen, os?.enabled, windowId]);
}
