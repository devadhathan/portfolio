'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import type { DesktopWindowId } from '@/lib/desktop-os';

const OsWindowIdContext = createContext<DesktopWindowId | null>(null);

export const OsWindowIdProvider = OsWindowIdContext.Provider;

/** Window this subtree renders inside, or null outside the desktop OS. */
export function useOsWindowId() {
  return useContext(OsWindowIdContext);
}

/**
 * Run `onClose` when the host window goes from open to closed. Windows stay
 * mounted after closing, so this is where a body resets its view — otherwise
 * reopening lands back on whatever was on screen when it was closed.
 */
export function useOsWindowClose(onClose: () => void) {
  const os = useDesktopOsOptional();
  const id = useOsWindowId();
  const isOpen = id ? Boolean(os?.windows[id]?.open) : true;

  const wasOpenRef = useRef(isOpen);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (wasOpen && !isOpen) onCloseRef.current();
  }, [isOpen]);
}

/**
 * Cover the desktop while `active` (a case study is open), then put the window
 * back to the size it had before. No-op outside an OS window, and it never
 * fights a manual restore — if the user un-covers mid case study, going back
 * leaves the window where they put it.
 */
export function useOsWindowAutoExpand(active: boolean) {
  const os = useDesktopOsOptional();
  const id = useOsWindowId();
  const setCovered = os?.setCovered;

  const covered = Boolean(id && os?.windows[id]?.covered);
  const coveredRef = useRef(covered);
  coveredRef.current = covered;

  /** Cover state to return to, captured when auto-expand kicked in. */
  const restoreToRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!id || !setCovered) return;

    if (active) {
      if (restoreToRef.current === null) restoreToRef.current = coveredRef.current;
      setCovered(id, true);
      return;
    }

    const restoreTo = restoreToRef.current;
    restoreToRef.current = null;
    if (restoreTo === false && coveredRef.current) setCovered(id, false);
  }, [active, id, setCovered]);
}
