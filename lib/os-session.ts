import type { GenUIChat } from '@/lib/gen-ui-viewport';
import { DESKTOP_WINDOW_IDS, type DesktopWindowId, type FinderLocation } from '@/lib/desktop-os';

export const OS_SESSION_KEY = 'portfolio-os-session-v1';
const WRITE_DEBOUNCE_MS = 450;
const MAX_ASK_CHATS = 12;
const MAX_VIEWPORTS_PER_CHAT = 24;

export type OsWindowSessionSlice = {
  scrollY?: number;
  selectedProject?: string | null;
  showProjectsList?: boolean;
  playgroundSelection?: string | null;
};

export type OsAskSession = {
  chats: GenUIChat[];
  activeChatId: string | null;
};

export type OsSession = {
  version: 1;
  activeWindow?: DesktopWindowId | null;
  finderLocation?: FinderLocation;
  windows: Partial<Record<DesktopWindowId, OsWindowSessionSlice>>;
  ask?: OsAskSession;
};

const EMPTY_SESSION: OsSession = {
  version: 1,
  activeWindow: null,
  windows: {},
};

let cached: OsSession | null = null;
let writeTimer = 0;

function isDesktopWindowId(id: string): id is DesktopWindowId {
  return (DESKTOP_WINDOW_IDS as string[]).includes(id);
}

function sanitizeAskSession(ask: OsAskSession | undefined): OsAskSession | undefined {
  if (!ask?.chats?.length) return undefined;

  const chats = ask.chats
    .slice(-MAX_ASK_CHATS)
    .map((chat) => ({
      ...chat,
      viewports: chat.viewports
        .filter((vp) => vp.status !== 'loading')
        .slice(-MAX_VIEWPORTS_PER_CHAT),
    }))
    .filter((chat) => chat.viewports.length > 0);

  if (!chats.length) return undefined;

  const activeChatId = ask.activeChatId && chats.some((c) => c.id === ask.activeChatId)
    ? ask.activeChatId
    : chats[chats.length - 1]?.id ?? null;

  return { chats, activeChatId };
}

function sanitizeSession(session: OsSession): OsSession {
  const windows: OsSession['windows'] = {};
  for (const [key, slice] of Object.entries(session.windows ?? {})) {
    if (!isDesktopWindowId(key) || !slice) continue;
    const next: OsWindowSessionSlice = {};
    if (typeof slice.scrollY === 'number' && Number.isFinite(slice.scrollY)) {
      next.scrollY = Math.max(0, Math.round(slice.scrollY));
    }
    if (typeof slice.selectedProject === 'string') next.selectedProject = slice.selectedProject;
    if (slice.selectedProject === null) next.selectedProject = null;
    if (typeof slice.showProjectsList === 'boolean') next.showProjectsList = slice.showProjectsList;
    if (typeof slice.playgroundSelection === 'string') next.playgroundSelection = slice.playgroundSelection;
    if (slice.playgroundSelection === null) next.playgroundSelection = null;
    if (Object.keys(next).length > 0) windows[key] = next;
  }

  const activeWindow =
    session.activeWindow && isDesktopWindowId(session.activeWindow) ? session.activeWindow : null;

  return {
    version: 1,
    activeWindow,
    finderLocation: session.finderLocation,
    windows,
    ask: sanitizeAskSession(session.ask),
  };
}

export function readOsSession(): OsSession {
  if (cached) return cached;
  if (typeof window === 'undefined') return { ...EMPTY_SESSION };

  try {
    const raw = sessionStorage.getItem(OS_SESSION_KEY);
    if (!raw) {
      cached = { ...EMPTY_SESSION };
      return cached;
    }
    cached = sanitizeSession({ ...EMPTY_SESSION, ...(JSON.parse(raw) as Partial<OsSession>) });
    return cached;
  } catch {
    cached = { ...EMPTY_SESSION };
    return cached;
  }
}

export function patchOsSession(mutator: (prev: OsSession) => OsSession) {
  if (typeof window === 'undefined') return;
  const next = sanitizeSession(mutator(readOsSession()));
  cached = next;
  window.clearTimeout(writeTimer);
  writeTimer = window.setTimeout(() => {
    try {
      sessionStorage.setItem(OS_SESSION_KEY, JSON.stringify(next));
    } catch {
      /* quota — keep working in memory */
    }
  }, WRITE_DEBOUNCE_MS);
}

export function patchOsWindowSession(
  windowId: DesktopWindowId,
  patch: Partial<OsWindowSessionSlice>,
) {
  patchOsSession((prev) => ({
    ...prev,
    windows: {
      ...prev.windows,
      [windowId]: { ...prev.windows[windowId], ...patch },
    },
  }));
}

export function readOsWindowSession(windowId: DesktopWindowId): OsWindowSessionSlice {
  return readOsSession().windows[windowId] ?? {};
}

export function clearOsSession() {
  if (typeof window === 'undefined') return;
  cached = { ...EMPTY_SESSION };
  window.clearTimeout(writeTimer);
  writeTimer = 0;
  try {
    sessionStorage.removeItem(OS_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
