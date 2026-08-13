'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  createInitialWindows,
  DEFAULT_ICON_POSITIONS,
  DEFAULT_WALLPAPER_ID,
  DESKTOP_OS_ICON_STORAGE_KEY,
  DESKTOP_OS_WALLPAPER_KEY,
  DESKTOP_WINDOW_IDS,
  MAX_OPEN_WINDOWS,
  pathToWindowId,
  WALLPAPER_PRESETS,
  WINDOW_PATH,
  type DesktopIconId,
  type DesktopIconPosition,
  type DesktopWindowId,
  type DesktopWindowState,
  type WallpaperId,
} from '@/lib/desktop-os';

type DesktopOsContextValue = {
  /** Desktop OS is always on; kept for call-site compatibility. */
  enabled: true;
  /** Touch / narrow layout: fixed icon rails, no drag, full-bleed windows. */
  isNarrow: boolean;
  windows: Record<DesktopWindowId, DesktopWindowState>;
  focusedId: DesktopWindowId | null;
  widgetsOpen: boolean;
  closedStack: DesktopWindowId[];
  wallpaperId: WallpaperId;
  wallpaperBackground: string;
  openWindow: (id: DesktopWindowId, opts?: { syncUrl?: boolean }) => void;
  closeWindow: (id: DesktopWindowId) => void;
  toggleCover: (id: DesktopWindowId) => void;
  focusWindow: (id: DesktopWindowId, opts?: { syncUrl?: boolean }) => void;
  toggleWidgets: () => void;
  setWidgetsOpen: (open: boolean) => void;
  restoreFromTrash: () => void;
  setWallpaperId: (id: WallpaperId) => void;
};

/** Isolated so icon drag commits don’t re-render windows / chrome. */
type DesktopIconLayoutValue = {
  iconPositions: Record<DesktopIconId, DesktopIconPosition>;
  moveIcon: (id: DesktopIconId, x: number, y: number) => void;
};

const DesktopOsContext = createContext<DesktopOsContextValue | null>(null);
const DesktopIconLayoutContext = createContext<DesktopIconLayoutValue | null>(null);

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

function readWallpaperId(): WallpaperId {
  if (typeof window === 'undefined') return DEFAULT_WALLPAPER_ID;
  try {
    const raw = localStorage.getItem(DESKTOP_OS_WALLPAPER_KEY);
    if (raw && WALLPAPER_PRESETS.some((p) => p.id === raw)) return raw as WallpaperId;
  } catch {
    /* ignore */
  }
  return DEFAULT_WALLPAPER_ID;
}

export function DesktopOsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(NARROW_QUERY).matches : false,
  );
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const zCounter = useRef(50);
  const syncingUrl = useRef(false);
  const isNarrowRef = useRef(isNarrow);
  isNarrowRef.current = isNarrow;

  const [windows, setWindows] = useState<Record<DesktopWindowId, DesktopWindowState>>(() =>
    createInitialWindows(pathToWindowId(pathname)),
  );
  const [focusedId, setFocusedId] = useState<DesktopWindowId | null>(() =>
    pathToWindowId(pathname),
  );
  const [closedStack, setClosedStack] = useState<DesktopWindowId[]>([]);
  const [iconPositions, setIconPositions] = useState<Record<DesktopIconId, DesktopIconPosition>>(
    () => DEFAULT_ICON_POSITIONS,
  );
  const [wallpaperId, setWallpaperIdState] = useState<WallpaperId>(DEFAULT_WALLPAPER_ID);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = () => setIsNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const stored = readIconPositions();
    if (stored) setIconPositions(stored);
    setWallpaperIdState(readWallpaperId());
  }, []);

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
    (id: DesktopWindowId, opts?: { syncUrl?: boolean }) => {
      setWindows((prev) => {
        const next: Record<DesktopWindowId, DesktopWindowState> = {
          ...prev,
          [id]: {
            ...prev[id],
            open: true,
            maximized: true,
            covered: false,
            everOpened: true,
            zIndex: bumpZ(),
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
            next[victim] = {
              ...next[victim],
              open: false,
              maximized: true,
              covered: false,
            };
          }
        }

        return next;
      });

      setClosedStack((prev) => prev.filter((x) => x !== id));
      setFocusedId(id);
      if (opts?.syncUrl !== false) {
        syncUrl(id);
      }
    },
    [bumpZ, syncUrl],
  );

  const focusWindowRef = useRef(focusWindow);
  focusWindowRef.current = focusWindow;

  const openWindow = useCallback(
    (id: DesktopWindowId, opts?: { syncUrl?: boolean }) => {
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
    setClosedStack((prev) => [id, ...prev.filter((x) => x !== id)]);
  }, []);

  const restoreFromTrash = useCallback(() => {
    setClosedStack((prev) => {
      if (prev.length === 0) return prev;
      const [id, ...rest] = prev;
      queueMicrotask(() => {
        openWindow(id);
      });
      return rest.filter((x) => x !== id);
    });
  }, [openWindow]);

  const toggleCover = useCallback((id: DesktopWindowId) => {
    setWindows((prev) => {
      const w = prev[id];
      if (!w.open) return prev;
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

  const setWallpaperId = useCallback((id: WallpaperId) => {
    setWallpaperIdState(id);
    try {
      localStorage.setItem(DESKTOP_OS_WALLPAPER_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleWidgets = useCallback(() => {
    setWidgetsOpen((v) => !v);
  }, []);

  // Client navigations only — initial window already set in useState initializer.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    if (syncingUrl.current) return;
    const id = pathToWindowId(pathname);
    focusWindowRef.current(id, { syncUrl: false });
  }, [pathname]);

  const wallpaperBackground =
    WALLPAPER_PRESETS.find((p) => p.id === wallpaperId)?.background ??
    WALLPAPER_PRESETS[0].background;

  const osValue = useMemo<DesktopOsContextValue>(
    () => ({
      enabled: true,
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
      focusWindow,
      toggleWidgets,
      setWidgetsOpen,
      restoreFromTrash,
      setWallpaperId,
    }),
    [
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
      focusWindow,
      toggleWidgets,
      restoreFromTrash,
      setWallpaperId,
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
