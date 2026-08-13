export type DesktopLinkIconId = 'writings' | 'catalystic' | 'bigBang';

export type DesktopWindowId =
  | 'home'
  | 'work'
  | 'playground'
  | 'ask'
  | 'games'
  | 'photos'
  | 'wordsmith'
  | 'trash'
  | 'contact'
  | DesktopLinkIconId;

export type DesktopIconId = DesktopWindowId;

export type DesktopWindowState = {
  open: boolean;
  /** Stage-fit max (default). When false with covered=false, unused — we always stage-fit or cover. */
  maximized: boolean;
  /** Full desktop cover (over icons). */
  covered: boolean;
  zIndex: number;
  /** Mounted once after first open. */
  everOpened: boolean;
};

export type DesktopIconPosition = {
  /** Inset from the anchored edge (px). */
  x: number;
  y: number;
  /** Which horizontal edge `x` is measured from. */
  edge?: 'left' | 'right';
};

export type WallpaperId = 'vista' | 'bloom' | 'dusk' | 'forth';

export type WallpaperPreset = {
  id: WallpaperId;
  label: string;
  /** CSS background value (image url or gradient). */
  background: string;
};

export type DesktopLinkIcon = {
  id: DesktopLinkIconId;
  label: string;
  href: string;
  /** When false, site blocks iframes — show a thumbnail open prompt instead. */
  embeddable?: boolean;
  /** Preview image used when embeddable is false. */
  thumbnail?: string;
};

export const GAMES_EMBED_URL = 'https://puzzlegig.vercel.app';
export const WORDSMITH_EMBED_URL = 'https://www.wordsmith.ai/products/blueprints';

/** Side projects / writings — open as iframe OS windows (no route sync). */
export const DESKTOP_LINK_ICONS: DesktopLinkIcon[] = [
  {
    id: 'writings',
    label: 'Writings',
    href: 'https://medium.com/@devadhathanmd18',
    // Medium refuses iframe embedding (X-Frame-Options / CSP).
    embeddable: false,
    thumbnail: '/videos/dew-medium-thumb.jpg',
  },
  {
    id: 'catalystic',
    label: 'Catalystic',
    href: 'https://catalysticui.space/landing.html',
  },
  {
    id: 'bigBang',
    label: 'Big Bang',
    href: 'https://big-bang-timeline.vercel.app/',
  },
];

export const DESKTOP_LINK_ICON_IDS: DesktopLinkIconId[] = DESKTOP_LINK_ICONS.map((i) => i.id);

export const DESKTOP_WINDOW_IDS: DesktopWindowId[] = [
  'home',
  'work',
  'playground',
  'ask',
  'games',
  'photos',
  'wordsmith',
  'trash',
  'contact',
  ...DESKTOP_LINK_ICON_IDS,
];

export function getDesktopLinkIcon(id: DesktopWindowId): DesktopLinkIcon | undefined {
  return DESKTOP_LINK_ICONS.find((item) => item.id === id);
}

export const DESKTOP_ICON_IDS: DesktopIconId[] = [
  'home',
  'work',
  'playground',
  'ask',
  'games',
  'photos',
  'writings',
  'catalystic',
  'bigBang',
  'contact',
  'trash',
];

export const WINDOW_PATH: Partial<Record<DesktopWindowId, string>> = {
  home: '/',
  work: '/work',
  playground: '/playground',
  // ask + games + photos + wordsmith + side-project embeds stay as floating OS windows
};

export function pathToWindowId(pathname: string): DesktopWindowId {
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/playground')) return 'playground';
  return 'home';
}

export const DESKTOP_OS_ICON_STORAGE_KEY = 'portfolio-desktop-os-icons-v7';
export const DESKTOP_OS_WALLPAPER_KEY = 'portfolio-desktop-os-wallpaper-v7';

/** One visible window at a time. */
export const MAX_OPEN_WINDOWS = 1;

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'forth',
    label: 'Forth',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/forth.webp')",
  },
  {
    id: 'vista',
    label: 'Vista',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/vista.webp')",
  },
  {
    id: 'bloom',
    label: 'Bloom',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/bloom.webp')",
  },
  {
    id: 'dusk',
    label: 'Dusk',
    /* Soft blue sky → warm peach/amber horizon glow (no land silhouette) */
    background: [
      'radial-gradient(ellipse 130% 58% at 48% 92%, hsl(32 95% 62%) 0%, hsl(22 88% 55% / 0.85) 18%, hsl(350 55% 62% / 0.28) 42%, transparent 62%)',
      'radial-gradient(ellipse 90% 45% at 62% 78%, hsl(18 80% 58% / 0.45) 0%, transparent 55%)',
      'linear-gradient(180deg, hsl(205 48% 36%) 0%, hsl(200 42% 46%) 28%, hsl(198 38% 58%) 48%, hsl(190 30% 68%) 58%, hsl(40 55% 72%) 70%, hsl(28 75% 58%) 82%, hsl(215 28% 22%) 100%)',
    ].join(', '),
  },
];

export const DEFAULT_WALLPAPER_ID: WallpaperId = 'bloom';

/** Applied on `<html>` before paint so reload doesn't flash the default wallpaper. */
export const OS_WALLPAPER_CSS_VAR = '--os-wallpaper';

export function wallpaperBackgroundFor(id: WallpaperId): string {
  return (
    WALLPAPER_PRESETS.find((p) => p.id === id)?.background ??
    WALLPAPER_PRESETS.find((p) => p.id === DEFAULT_WALLPAPER_ID)?.background ??
    WALLPAPER_PRESETS[0].background
  );
}

/** Inline boot script for `<head>` — reads localStorage and sets `--os-wallpaper`. */
export function getWallpaperBootScript(): string {
  const presets = Object.fromEntries(
    WALLPAPER_PRESETS.map((preset) => [preset.id, preset.background]),
  );
  return `(function(){try{var k=${JSON.stringify(DESKTOP_OS_WALLPAPER_KEY)};var id=localStorage.getItem(k);var p=${JSON.stringify(presets)};var bg=(id&&p[id])?p[id]:p[${JSON.stringify(DEFAULT_WALLPAPER_ID)}];if(bg)document.documentElement.style.setProperty(${JSON.stringify(OS_WALLPAPER_CSS_VAR)},bg);}catch(e){}})();`;
}

const COL_INSET = 24;
const ROW = 92;
const START_Y = 56;

const NARROW_COL_INSET = 6;
const NARROW_ROW = 58;
const NARROW_START_Y = 48;

/**
 * Default desktop icon layout (PostHog-style rails):
 * Left  — primary apps + media
 * Right — side projects, Trash at the bottom
 */
export const DEFAULT_ICON_POSITIONS: Record<DesktopIconId, DesktopIconPosition> = {
  // Left rail
  home: { x: COL_INSET, y: START_Y, edge: 'left' },
  work: { x: COL_INSET, y: START_Y + ROW, edge: 'left' },
  playground: { x: COL_INSET, y: START_Y + ROW * 2, edge: 'left' },
  ask: { x: COL_INSET, y: START_Y + ROW * 3, edge: 'left' },
  games: { x: COL_INSET, y: START_Y + ROW * 4, edge: 'left' },
  photos: { x: COL_INSET, y: START_Y + ROW * 5, edge: 'left' },
  writings: { x: COL_INSET, y: START_Y + ROW * 6, edge: 'left' },
  contact: { x: COL_INSET, y: START_Y + ROW * 7, edge: 'left' },
  // Opened from Case studies list — no desktop icon rail entry
  wordsmith: { x: COL_INSET, y: START_Y + ROW * 5, edge: 'left' },
  // Right rail
  catalystic: { x: COL_INSET, y: START_Y, edge: 'right' },
  bigBang: { x: COL_INSET, y: START_Y + ROW, edge: 'right' },
  trash: { x: COL_INSET, y: START_Y + ROW * 7, edge: 'right' },
};

/** Fixed compact rails for phone / tablet OS (no drag). */
export const NARROW_ICON_POSITIONS: Record<DesktopIconId, DesktopIconPosition> = {
  home: { x: NARROW_COL_INSET, y: NARROW_START_Y, edge: 'left' },
  work: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'left' },
  playground: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 2, edge: 'left' },
  ask: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 3, edge: 'left' },
  games: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 4, edge: 'left' },
  photos: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 5, edge: 'left' },
  writings: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 6, edge: 'left' },
  contact: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 7, edge: 'left' },
  wordsmith: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 5, edge: 'left' },
  catalystic: { x: NARROW_COL_INSET, y: NARROW_START_Y, edge: 'right' },
  bigBang: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'right' },
  trash: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 7, edge: 'right' },
};

export function createInitialWindows(
  focusId: DesktopWindowId,
): Record<DesktopWindowId, DesktopWindowState> {
  let z = 10;
  const base = {} as Record<DesktopWindowId, DesktopWindowState>;
  for (const id of DESKTOP_WINDOW_IDS) {
    const isFocus = id === focusId;
    base[id] = {
      open: isFocus,
      maximized: true,
      covered: false,
      zIndex: isFocus ? 50 : 10 + z++,
      everOpened: isFocus,
    };
  }
  return base;
}
