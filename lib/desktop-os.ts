export type DesktopWindowId =
  | 'home'
  | 'work'
  | 'playground'
  | 'ask'
  | 'games'
  | 'photos'
  | 'wordsmith';

export type DesktopLinkIconId =
  | 'writings'
  | 'catalystic'
  | 'pixl'
  | 'musicNotch'
  | 'linkring'
  | 'bigBang';

export type DesktopIconId = DesktopWindowId | DesktopLinkIconId | 'contact' | 'trash';

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

export type WallpaperId = 'cafe' | 'fjord' | 'vista' | 'bloom' | 'dusk' | 'mist';

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
};

export const DESKTOP_WINDOW_IDS: DesktopWindowId[] = [
  'home',
  'work',
  'playground',
  'ask',
  'games',
  'photos',
  'wordsmith',
];

export const GAMES_EMBED_URL = 'https://puzzlegig.vercel.app';
export const WORDSMITH_EMBED_URL = 'https://www.wordsmith.ai/products/blueprints';

/** External redirects — shown with an arrow badge on the icon. */
export const DESKTOP_LINK_ICONS: DesktopLinkIcon[] = [
  {
    id: 'writings',
    label: 'Writings',
    href: 'https://medium.com/@devadhathanmd18',
  },
  {
    id: 'catalystic',
    label: 'Catalystic',
    href: 'https://catalysticui.space/landing.html',
  },
  {
    id: 'pixl',
    label: 'Pixl',
    href: 'https://pixlanimations.vercel.app',
  },
  {
    id: 'musicNotch',
    label: 'MusicNotch',
    href: 'https://musicnotch-landing.vercel.app/',
  },
  {
    id: 'linkring',
    label: 'Linkring',
    href: 'https://linkring.vercel.app/',
  },
  {
    id: 'bigBang',
    label: 'Big Bang',
    href: 'https://big-bang-timeline.vercel.app/',
  },
];

export const DESKTOP_LINK_ICON_IDS: DesktopLinkIconId[] = DESKTOP_LINK_ICONS.map((i) => i.id);

export const DESKTOP_ICON_IDS: DesktopIconId[] = [
  'home',
  'work',
  'playground',
  'ask',
  'games',
  'photos',
  'writings',
  'catalystic',
  'pixl',
  'musicNotch',
  'linkring',
  'bigBang',
  'contact',
  'trash',
];

export const WINDOW_PATH: Partial<Record<DesktopWindowId, string>> = {
  home: '/',
  work: '/work',
  playground: '/playground',
  // ask + games + photos + wordsmith stay as floating OS windows (no route sync)
};

export function pathToWindowId(pathname: string): DesktopWindowId {
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/playground')) return 'playground';
  return 'home';
}

export const DESKTOP_OS_ICON_STORAGE_KEY = 'portfolio-desktop-os-icons-v6';
export const DESKTOP_OS_WALLPAPER_KEY = 'portfolio-desktop-os-wallpaper-v6';

/** One visible window at a time. */
export const MAX_OPEN_WINDOWS = 1;

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cafe',
    label: 'Cafe',
    background:
      "#0a0a0a center / cover no-repeat url('/playground/posters/1c6bf4951f51208c6c506133e9605963.jpg')",
  },
  {
    id: 'fjord',
    label: 'Fjord',
    background: "center / cover no-repeat url('/wallpapers/fjord.png')",
  },
  {
    id: 'vista',
    label: 'Vista',
    background:
      "#0a0a0a center / cover no-repeat url('/playground/posters/image-4.jpg')",
  },
  {
    id: 'bloom',
    label: 'Bloom',
    background:
      "#0a0a0a center / cover no-repeat url('/playground/posters/image-5.jpg')",
  },
  {
    id: 'dusk',
    label: 'Dusk',
    background:
      'radial-gradient(ellipse 100% 80% at 50% 0%, hsl(28 40% 28%) 0%, transparent 55%), linear-gradient(180deg, hsl(230 35% 12%) 0%, hsl(20 30% 8%) 100%)',
  },
  {
    id: 'mist',
    label: 'Mist',
    background:
      'radial-gradient(ellipse 90% 70% at 40% 20%, hsl(200 20% 70% / 0.35) 0%, transparent 50%), linear-gradient(180deg, hsl(210 15% 82%) 0%, hsl(40 10% 70%) 100%)',
  },
];

export const DEFAULT_WALLPAPER_ID: WallpaperId = 'bloom';

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
  pixl: { x: COL_INSET, y: START_Y + ROW, edge: 'right' },
  musicNotch: { x: COL_INSET, y: START_Y + ROW * 2, edge: 'right' },
  linkring: { x: COL_INSET, y: START_Y + ROW * 3, edge: 'right' },
  bigBang: { x: COL_INSET, y: START_Y + ROW * 4, edge: 'right' },
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
  pixl: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'right' },
  musicNotch: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 2, edge: 'right' },
  linkring: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 3, edge: 'right' },
  bigBang: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 4, edge: 'right' },
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
