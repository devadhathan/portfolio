'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  createInitialWindows,
  DEFAULT_ICON_POSITIONS,
  DESKTOP_OS_ICON_STORAGE_KEY,
  DESKTOP_WINDOW_IDS,
  MAX_OPEN_WINDOWS,
  menubarContrastFor,
  OS_MENUBAR_CONTRAST_ATTR,
  OS_WALLPAPER_CSS_VAR,
  pathToWindowId,
  wallpaperBackgroundFor,
  WINDOW_PATH,
  type DesktopIconId,
  type DesktopIconPosition,
  type DesktopWindowId,
  type DesktopWindowState,
  type FinderLocation,
  type OpenWindowOpts,
  type WallpaperId,
} from '@/lib/desktop-os';
import {
  DEFAULT_OS_SETTINGS,
  MAX_RECENTS,
  readOsSettings,
  resolveWallpaperId,
  writeOsSettings,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  type OsSettings,
} from '@/lib/os-settings';
import { setEnabled as setSoundEnabled, setVolume as setSoundVolume } from '@/lib/sound';
import { trackEvent } from '@/lib/analytics';
import { clearOsSession, patchOsSession, readOsSession } from '@/lib/os-session';

type DesktopOsContextValue = {
  /** Desktop OS is always on; kept for call-site compatibility. */
  enabled: true;
  /** False until localStorage prefs are applied — avoids SSR default → saved flash. */
  prefsReady: boolean;
  /** Touch / narrow layout: fixed icon rails, no drag, full-bleed windows. */
  isNarrow: boolean;
  windows: Record<DesktopWindowId, DesktopWindowState>;
  focusedId: DesktopWindowId | null;
  widgetsOpen: boolean;
  closedStack: DesktopWindowId[];
  wallpaperId: WallpaperId;
  wallpaperBackground: string;
  openWindow: (id: DesktopWindowId, opts?: OpenWindowOpts) => void;
  closeWindow: (id: DesktopWindowId) => void;
  toggleCover: (id: DesktopWindowId) => void;
  /** Cover / restore without stealing focus — used by auto-expand. */
  setCovered: (id: DesktopWindowId, covered: boolean) => void;
  focusWindow: (id: DesktopWindowId, opts?: OpenWindowOpts) => void;
  /** Finder sidebar selection — set when opening Favourites from the desktop. */
  finderLocation: FinderLocation;
  setFinderLocation: (location: FinderLocation) => void;
  toggleWidgets: () => void;
  setWidgetsOpen: (open: boolean) => void;
  restoreFromTrash: () => void;
  setWallpaperId: (id: WallpaperId) => void;
  /** Menu-extra settings — wallpaper lives above, the rest here. */
  shuffleDaily: boolean;
  setShuffleDaily: (on: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (on: boolean) => void;
  soundVolume: number;
  setSoundVolumeLevel: (percent: number) => void;
  /** View menu */
  iconLabels: boolean;
  setIconLabels: (on: boolean) => void;
  zoom: number;
  setZoom: (percent: number) => void;
  stepZoom: (direction: 1 | -1) => void;
  /** File > Open Recent — newest first, focused window excluded. */
  recents: DesktopWindowId[];
  clearRecents: () => void;
  /** Logo menu — close everything and restore defaults. */
  resetDesktop: () => void;
};

/** Isolated so icon drag commits don’t re-render windows / chrome. */
type DesktopIconLayoutValue = {
  iconPositions: Record<DesktopIconId, DesktopIconPosition>;
  moveIcon: (id: DesktopIconId, x: number, y: number) => void;
};

const DesktopOsContext = createContext<DesktopOsContextValue | null>(null);
const DesktopIconLayoutContext = createContext<DesktopIconLayoutValue | null>(null);

/** Survives Strict Mode remounts — shell should not unmount once prefs have been read. */
let osPrefsUnlocked = false;

const NARROW_QUERY = '(max-width: 1023px)';

function readIconPositions(): Record<DesktopIconId, DesktopIconPosition> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DESKTOP_OS_ICON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Record<DesktopIconId, DesktopIconPosition>>;
    const merged = { ...DEFAULT_ICON_POSITIONS };
    for (const id of Object.keys(merged) as DesktopIconId[]) {
      const stored = parsed[id];
      if (!stored) continue;
      merged[id] = {
        ...DEFAULT_ICON_POSITIONS[id],
        ...stored,
        edge: stored.edge ?? DEFAULT_ICON_POSITIONS[id].edge ?? 'left',
      };
    }
    return merged;
  } catch {
    return null;
  }
}

function writeIconPositions(positions: Record<DesktopIconId, DesktopIconPosition>) {
  try {
    sessionStorage.setItem(DESKTOP_OS_ICON_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    /* ignore */
  }
}


export function DesktopOsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNarrow, setIsNarrow] = useState(false);
  const zCounter = useRef(50);
  const syncingUrl = useRef(false);
  const isNarrowRef = useRef(isNarrow);
  isNarrowRef.current = isNarrow;

  const [windows, setWindows] = useState<Record<DesktopWindowId, DesktopWindowState>>(() =>
    createInitialWindows(pathToWindowId(pathname)),
  );
  /** Read-only mirror so callbacks can check state without re-creating. */
  const windowsRef = useRef(windows);
  windowsRef.current = windows;
  const [focusedId, setFocusedId] = useState<DesktopWindowId | null>(() =>
    pathToWindowId(pathname),
  );
  const focusedIdRef = useRef(focusedId);
  focusedIdRef.current = focusedId;
  const [finderLocation, setFinderLocation] = useState<FinderLocation>('applications');
  const [closedStack, setClosedStack] = useState<DesktopWindowId[]>([]);
  const [iconPositions, setIconPositions] = useState<Record<DesktopIconId, DesktopIconPosition>>(
    () => DEFAULT_ICON_POSITIONS,
  );
  // SSR always defaults; localStorage is applied in useLayoutEffect before paint.
  // If the module already unlocked prefs (Strict Mode remount), re-read storage so
  // wallpaperBackground is never the SSR default while prefsReady is true.
  const [settings, setSettings] = useState<OsSettings>(() =>
    typeof window !== 'undefined' && osPrefsUnlocked ? readOsSettings() : DEFAULT_OS_SETTINGS,
  );
  const [prefsReady, setPrefsReady] = useState(() => osPrefsUnlocked);
  const wallpaperId = resolveWallpaperId(settings);

  /** Widgets visibility is a View-menu setting, so it survives a reload. */
  const widgetsOpen = settings.widgets;

  /** Single writer — every setting lands in one localStorage object. */
  const updateSettings = useCallback((patch: Partial<OsSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeOsSettings(next);
      return next;
    });
  }, []);

  // Apply saved prefs before first paint — never write SSR defaults over the boot script.
  // Module flag keeps the shell mounted across Strict Mode provider remounts.
  // Mount-only: client navigations must not rebuild windows (that remounts Home/Work
  // and re-renders MenuBar). Path changes go through focusWindow below.
  useLayoutEffect(() => {
    const stored = readOsSettings();
    setSettings(stored);
    const id = resolveWallpaperId(stored);
    const narrow = window.matchMedia(NARROW_QUERY).matches;
    setIsNarrow(narrow);
    const bg = wallpaperBackgroundFor(id, { narrow });
    const root = document.documentElement;
    root.style.setProperty(OS_WALLPAPER_CSS_VAR, bg);
    root.style.background = bg;
    root.style.backgroundAttachment = 'fixed';
    root.setAttribute(OS_MENUBAR_CONTRAST_ATTR, menubarContrastFor(id));
    osPrefsUnlocked = true;
    setPrefsReady(true);

    const session = readOsSession();
    const pathFocus = pathToWindowId(pathname);
    // URL wins on full reload — restoring session.activeWindow here opened the
    // wrong window and sometimes triggered a follow-up router.replace (flash).
    const focusId = pathFocus;

    setWindows(() => {
      const next = createInitialWindows(focusId);
      for (const winId of DESKTOP_WINDOW_IDS) {
        if (winId === focusId || session.windows[winId]) {
          next[winId] = { ...next[winId], everOpened: true };
        }
      }
      return next;
    });
    setFocusedId(focusId);
    if (session.finderLocation) {
      setFinderLocation(session.finderLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once; pathname sync is separate
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mobile — force every open window into fullscreen cover.
  useEffect(() => {
    if (!isNarrow) return;
    setWindows((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of DESKTOP_WINDOW_IDS) {
        const w = next[id];
        if (w.open && !w.covered) {
          next[id] = { ...w, covered: true, maximized: true };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [isNarrow]);

  useEffect(() => {
    const stored = readIconPositions();
    if (stored) setIconPositions(stored);
  }, []);

  useLayoutEffect(() => {
    if (!prefsReady) return;
    const bg = wallpaperBackgroundFor(wallpaperId, { narrow: isNarrow });
    const root = document.documentElement;
    root.style.setProperty(OS_WALLPAPER_CSS_VAR, bg);
    root.style.background = bg;
    root.style.backgroundAttachment = 'fixed';
  }, [wallpaperId, prefsReady, isNarrow]);

  const bumpZ = useCallback(() => {
    // Stay below OS menubar (z-200) and widgets panel (z-190)
    zCounter.current = Math.min(zCounter.current + 1, 180);
    return zCounter.current;
  }, []);

  const syncUrl = useCallback(
    (id: DesktopWindowId) => {
      const path = WINDOW_PATH[id];
      if (!path || pathname === path) return;
      syncingUrl.current = true;
      router.replace(path, { scroll: false });
      window.setTimeout(() => {
        syncingUrl.current = false;
      }, 50);
    },
    [pathname, router],
  );

  const focusWindow = useCallback(
    (id: DesktopWindowId, opts?: OpenWindowOpts) => {
      // Windows call this on every mousedown. Re-focusing the window that is
      // already focused and on top produces identical state, but the setters
      // below allocate regardless — which invalidates the context and re-renders
      // the shell, every mounted window body and the menubar. Bail instead.
      if (!opts?.finderLocation) {
        const settled = windowsRef.current[id];
        const path = WINDOW_PATH[id];
        // syncUrl:false callers never touch the URL, so a mismatch is expected.
        const urlSettled = opts?.syncUrl === false || !path || pathname === path;
        if (
          settled?.open &&
          settled.maximized &&
          settled.zIndex === zCounter.current &&
          (!isNarrowRef.current || settled.covered) &&
          focusedIdRef.current === id &&
          urlSettled
        ) {
          return;
        }
      }

      if (opts?.finderLocation) {
        setFinderLocation(opts.finderLocation);
      }

      setWindows((prev) => {
        const current = prev[id];
        const alreadyOpen = Boolean(current?.open);
        // Keep fullscreen when hopping apps from the dock (or re-focusing).
        const inheritCovered =
          isNarrowRef.current ||
          (alreadyOpen
            ? Boolean(current.covered)
            : DESKTOP_WINDOW_IDS.some((wid) => prev[wid]?.open && prev[wid]?.covered));
        const next: Record<DesktopWindowId, DesktopWindowState> = {
          ...prev,
          [id]: {
            ...current,
            open: true,
            maximized: true,
            covered: inheritCovered,
            everOpened: true,
            // Already on top — reusing the value avoids a pointless style write.
            zIndex:
              alreadyOpen && current.zIndex === zCounter.current ? current.zIndex : bumpZ(),
          },
        };

        const visible = DESKTOP_WINDOW_IDS.filter((wid) => next[wid].open);
        if (visible.length > MAX_OPEN_WINDOWS) {
          const victims = visible
            .filter((wid) => wid !== id)
            .sort((a, b) => next[a].zIndex - next[b].zIndex);
          const overflow = visible.length - MAX_OPEN_WINDOWS;
          for (let i = 0; i < overflow; i++) {
            const victim = victims[i];
            if (!victim) break;
            // Swap away without sending to Trash — only explicit Close goes to trash.
            // Keep cover so a later reopen via dock can still inherit fullscreen.
            next[victim] = {
              ...next[victim],
              open: false,
              maximized: true,
            };
          }
        }

        return next;
      });

      // Only a real open — refocusing an open window is not a new visit.
      if (!windowsRef.current[id]?.open) trackEvent('window_opened', { window: id });

      // filter() would allocate on every call, changing state identity even when
      // the id was never in the stack.
      setClosedStack((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev));
      setFocusedId(id);
      // Open Recent lists what you were in before this one.
      setSettings((prev) => {
        const recents = [id, ...prev.recents.filter((x) => x !== id)].slice(0, MAX_RECENTS);
        if (recents.length === prev.recents.length && recents.every((x, i) => x === prev.recents[i])) {
          return prev;
        }
        const next = { ...prev, recents };
        writeOsSettings(next);
        return next;
      });
      if (opts?.syncUrl !== false) {
        syncUrl(id);
      }
    },
    [bumpZ, pathname, syncUrl],
  );

  const focusWindowRef = useRef(focusWindow);
  focusWindowRef.current = focusWindow;

  const openWindow = useCallback(
    (id: DesktopWindowId, opts?: OpenWindowOpts) => {
      focusWindow(id, opts);
    },
    [focusWindow],
  );

  const closeWindow = useCallback((id: DesktopWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false, covered: false, maximized: true },
    }));
    setFocusedId((curr) => (curr === id ? null : curr));
    // Trash itself never goes into the closed stack
    if (id === 'trash') return;
    setClosedStack((prev) => [id, ...prev.filter((x) => x !== id)]);
  }, []);

  const openTrash = useCallback(() => {
    openWindow('finder', { syncUrl: false, finderLocation: 'trash' });
  }, [openWindow]);

  const restoreFromTrash = useCallback(() => {
    openTrash();
  }, [openTrash]);

  const toggleCover = useCallback((id: DesktopWindowId) => {
    setWindows((prev) => {
      const w = prev[id];
      if (!w.open) return prev;
      // Mobile stays fullscreen — green traffic light is a no-op for restore.
      if (isNarrowRef.current) {
        if (w.covered) return prev;
        return {
          ...prev,
          [id]: { ...w, covered: true, maximized: true, zIndex: bumpZ() },
        };
      }
      return {
        ...prev,
        [id]: {
          ...w,
          covered: !w.covered,
          maximized: true,
          zIndex: bumpZ(),
        },
      };
    });
    setFocusedId(id);
  }, [bumpZ]);

  const setCovered = useCallback((id: DesktopWindowId, covered: boolean) => {
    setWindows((prev) => {
      const w = prev[id];
      if (!w.open) return prev;
      const nextCovered = isNarrowRef.current ? true : covered;
      if (w.covered === nextCovered) return prev;
      return {
        ...prev,
        [id]: { ...w, covered: nextCovered, maximized: true },
      };
    });
  }, []);

  const moveIcon = useCallback((id: DesktopIconId, x: number, y: number) => {
    setIconPositions((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          x: Math.max(8, x),
          y: Math.max(48, y),
          edge: prev[id]?.edge ?? DEFAULT_ICON_POSITIONS[id]?.edge ?? 'left',
        },
      };
      if (!isNarrowRef.current) {
        queueMicrotask(() => writeIconPositions(next));
      }
      return next;
    });
  }, []);

  /** Picking a wallpaper is an explicit choice — it ends the daily shuffle. */
  const setWallpaperId = useCallback(
    (id: WallpaperId) => updateSettings({ wallpaperId: id, shuffleDaily: false }),
    [updateSettings],
  );

  const setShuffleDaily = useCallback(
    (on: boolean) => updateSettings({ shuffleDaily: on }),
    [updateSettings],
  );

  const setSoundsEnabled = useCallback(
    (on: boolean) => updateSettings({ sounds: on }),
    [updateSettings],
  );

  const setSoundVolumeLevel = useCallback(
    (percent: number) =>
      updateSettings({ soundVolume: Math.min(100, Math.max(0, Math.round(percent))) }),
    [updateSettings],
  );

  const setIconLabels = useCallback(
    (on: boolean) => updateSettings({ iconLabels: on }),
    [updateSettings],
  );

  const setZoom = useCallback(
    (percent: number) =>
      updateSettings({ zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(percent))) }),
    [updateSettings],
  );

  const stepZoom = useCallback(
    (direction: 1 | -1) =>
      setSettings((prev) => {
        const zoom = Math.min(
          ZOOM_MAX,
          Math.max(ZOOM_MIN, prev.zoom + direction * ZOOM_STEP),
        );
        if (zoom === prev.zoom) return prev;
        const next = { ...prev, zoom };
        writeOsSettings(next);
        return next;
      }),
    [],
  );

  const clearRecents = useCallback(() => updateSettings({ recents: [] }), [updateSettings]);

  const resetDesktop = useCallback(() => {
    setWindows(() => createInitialWindows('home'));
    setFocusedId(null);
    setClosedStack([]);
    setIconPositions(DEFAULT_ICON_POSITIONS);
    clearOsSession();
    try {
      sessionStorage.removeItem(DESKTOP_OS_ICON_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSettings(() => {
      const next: OsSettings = { ...DEFAULT_OS_SETTINGS };
      writeOsSettings(next);
      return next;
    });
  }, []);

  // Icon labels ride on the root so the CSS can hide them without a re-render.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.iconLabels) root.removeAttribute('data-os-hide-icon-labels');
    else root.setAttribute('data-os-hide-icon-labels', 'true');
  }, [settings.iconLabels]);

  useEffect(() => {
    if (!prefsReady) return;
    document.documentElement.setAttribute(
      OS_MENUBAR_CONTRAST_ATTR,
      menubarContrastFor(wallpaperId),
    );
  }, [wallpaperId, prefsReady]);

  useEffect(() => {
    document.documentElement.style.setProperty('--os-zoom', String(settings.zoom / 100));
  }, [settings.zoom]);

  useEffect(() => {
    setSoundEnabled(settings.sounds);
  }, [settings.sounds]);

  useEffect(() => {
    setSoundVolume(settings.soundVolume / 100);
  }, [settings.soundVolume]);

  useEffect(() => {
    if (!prefsReady) return;
    const openId = DESKTOP_WINDOW_IDS.find((id) => windows[id]?.open) ?? null;
    patchOsSession((prev) => {
      if (prev.activeWindow === openId && prev.finderLocation === finderLocation) return prev;
      return { ...prev, activeWindow: openId, finderLocation };
    });
  }, [windows, finderLocation, prefsReady]);

  const setWidgetsOpen = useCallback(
    (open: boolean) => updateSettings({ widgets: open }),
    [updateSettings],
  );

  const toggleWidgets = useCallback(
    () =>
      setSettings((prev) => {
        const next = { ...prev, widgets: !prev.widgets };
        writeOsSettings(next);
        return next;
      }),
    [],
  );

  // Client navigations only — initial window already set in useState initializer.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    if (syncingUrl.current) return;
    const id = pathToWindowId(pathname);
    focusWindowRef.current(id, { syncUrl: false });
  }, [pathname]);

  const wallpaperBackground = wallpaperBackgroundFor(wallpaperId, {
    narrow: isNarrow,
  });

  const osValue = useMemo<DesktopOsContextValue>(
    () => ({
      enabled: true,
      prefsReady,
      isNarrow,
      windows,
      focusedId,
      widgetsOpen,
      closedStack,
      wallpaperId,
      wallpaperBackground,
      openWindow,
      closeWindow,
      toggleCover,
      setCovered,
      focusWindow,
      finderLocation,
      setFinderLocation,
      toggleWidgets,
      setWidgetsOpen,
      restoreFromTrash,
      setWallpaperId,
      shuffleDaily: settings.shuffleDaily,
      setShuffleDaily,
      soundsEnabled: settings.sounds,
      setSoundsEnabled,
      soundVolume: settings.soundVolume,
      setSoundVolumeLevel,
      iconLabels: settings.iconLabels,
      setIconLabels,
      zoom: settings.zoom,
      setZoom,
      stepZoom,
      recents: settings.recents,
      clearRecents,
      resetDesktop,
    }),
    [
      prefsReady,
      isNarrow,
      windows,
      focusedId,
      widgetsOpen,
      closedStack,
      wallpaperId,
      wallpaperBackground,
      openWindow,
      closeWindow,
      toggleCover,
      setCovered,
      focusWindow,
      finderLocation,
      toggleWidgets,
      setWidgetsOpen,
      restoreFromTrash,
      setWallpaperId,
      settings.shuffleDaily,
      setShuffleDaily,
      settings.sounds,
      setSoundsEnabled,
      settings.soundVolume,
      setSoundVolumeLevel,
      settings.iconLabels,
      setIconLabels,
      settings.zoom,
      setZoom,
      stepZoom,
      settings.recents,
      clearRecents,
      resetDesktop,
    ],
  );

  const iconLayoutValue = useMemo<DesktopIconLayoutValue>(
    () => ({
      iconPositions,
      moveIcon,
    }),
    [iconPositions, moveIcon],
  );

  return (
    <DesktopOsContext.Provider value={osValue}>
      <DesktopIconLayoutContext.Provider value={iconLayoutValue}>
        {children}
      </DesktopIconLayoutContext.Provider>
    </DesktopOsContext.Provider>
  );
}

export function useDesktopOs() {
  const ctx = useContext(DesktopOsContext);
  if (!ctx) {
    throw new Error('useDesktopOs must be used within DesktopOsProvider');
  }
  return ctx;
}

export function useDesktopIconLayout() {
  const ctx = useContext(DesktopIconLayoutContext);
  if (!ctx) {
    throw new Error('useDesktopIconLayout must be used within DesktopOsProvider');
  }
  return ctx;
}

export function useDesktopOsOptional() {
  return useContext(DesktopOsContext);
}
