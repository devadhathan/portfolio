export type DesktopLinkIconId = 'writings' | 'catalystic' | 'bigBang';

/** Finder sidebar locations (Favourites section + color Tags). */
export type FinderLocation =
  | 'recents'
  | 'applications'
  | 'desktop'
  | 'documents'
  | 'sideProjects'
  | 'favourites'
  | 'trash'
  | 'tag-red'
  | 'tag-orange'
  | 'tag-yellow'
  | 'tag-green'
  | 'tag-blue'
  | 'tag-purple'
  | 'tag-gray';

export type FinderTagId =
  | 'tag-red'
  | 'tag-orange'
  | 'tag-yellow'
  | 'tag-green'
  | 'tag-blue'
  | 'tag-purple'
  | 'tag-gray';

export type OpenWindowOpts = {
  syncUrl?: boolean;
  /** When opening Finder, land on this sidebar location. */
  finderLocation?: FinderLocation;
};

export type DesktopWindowId =
  | 'finder'
  | 'home'
  | 'work'
  | 'playground'
  | 'ask'
  | 'games'
  | 'drawesome'
  | 'photos'
  | 'wordsmith'
  | 'trash'
  | 'contact'
  | 'about'
  | 'colophon'
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

export type WallpaperId =
  | 'bloom'
  | 'forth'
  | 'painting'
  | 'loch'
  | 'mountain'
  | 'green'
  | 'heather'
  | 'dunes'
  | 'bridge'
  | 'clouds';

export type WallpaperPreset = {
  id: WallpaperId;
  label: string;
  /** CSS background value (image url or gradient). */
  background: string;
  /** Optional lighter asset for narrow viewports (mobile LCP). */
  mobileBackground?: string;
  /** Menubar label color that contrasts with this wallpaper’s top band. */
  menubarContrast: 'light' | 'dark';
};

export type DesktopLinkIcon = {
  id: DesktopLinkIconId;
  label: string;
  href: string;
  /** When false, site blocks iframes — show a thumbnail open prompt instead. */
  embeddable?: boolean;
  /** Preview image used when embeddable is false. */
  thumbnail?: string;
  /** CTA label when embeddable is false. */
  openLabel?: string;
};

export const GAMES_EMBED_URL = 'https://puzzlegig.vercel.app';
export const WORDSMITH_EMBED_URL = 'https://www.wordsmith.ai/products/blueprints';

/** Side projects / writings — open as iframe OS windows (no route sync). */
export const DESKTOP_LINK_ICONS: DesktopLinkIcon[] = [
  {
    id: 'writings',
    label: 'Favourites',
    href: 'https://medium.com/@devadhathanmd18',
    // Medium refuses iframe embedding (X-Frame-Options / CSP).
    embeddable: false,
    thumbnail: '/videos/dew-medium-thumb.jpg',
    openLabel: 'Open on Medium',
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

/** Bait file that lives in Trash — earnest thumbnail, classic link. */
export const TRASH_BAIT_VIDEO = {
  title: 'Three mistakes in my life',
  href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnail: '/photos/Cafe-laptop.png',
} as const;

export const DESKTOP_WINDOW_IDS: DesktopWindowId[] = [
  'finder',
  'home',
  'work',
  'playground',
  'ask',
  'games',
  'drawesome',
  'photos',
  'wordsmith',
  'trash',
  'contact',
  'about',
  'colophon',
  ...DESKTOP_LINK_ICON_IDS,
];

/** Shared icon assets for dock, desktop, and menubar open-app strip. */
export const WINDOW_ICON_SRC: Partial<Record<DesktopWindowId, string>> = {
  finder: '/icons/dark-finder.svg',
  home: '/icons/home.svg',
  work: '/icons/briefcase.svg',
  playground: '/icons/playgroundd.svg',
  games: '/icons/gamess.svg',
  drawesome: '/icons/pen.svg',
  ask: '/icons/sparkles.svg',
  photos: '/icons/image.svg',
  wordsmith: '/icons/sparkles.svg',
  trash: '/icons/trash.svg',
  contact: '/icons/mailbox.svg',
  about: '/icons/user.svg',
  colophon: '/icons/info-bubble.svg',
  writings: '/icons/folder.svg',
  catalystic: '/icons/lightbulb.svg',
  bigBang: '/icons/lightbulb.svg',
};

export function getDesktopLinkIcon(id: DesktopWindowId): DesktopLinkIcon | undefined {
  return DESKTOP_LINK_ICONS.find((item) => item.id === id);
}

/** Desktop icons on the right rail — primary apps live in the bottom dock. */
export const DESKTOP_ICON_IDS: DesktopIconId[] = [
  'ask',
  'writings',
  'drawesome',
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

export const DESKTOP_OS_ICON_STORAGE_KEY = 'portfolio-desktop-os-icons-v13';
export const DESKTOP_OS_WALLPAPER_KEY = 'portfolio-desktop-os-wallpaper-v10';

/** One visible window at a time. */
export const MAX_OPEN_WINDOWS = 1;

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'bridge',
    label: 'Bridge',
    background:
      "#000000 center / cover no-repeat url('/wallpapers/bridge.webp')",
    mobileBackground:
      "#000000 center / cover no-repeat url('/wallpapers/bridge-mobile.webp')",
    menubarContrast: 'light',
  },
  {
    id: 'bloom',
    label: 'Bloom',
    /* Bias crop downward so mountain mass sits under the icon rails */
    background:
      "#0a0a0a center 68% / cover no-repeat url('/wallpapers/bloom.webp')",
    mobileBackground:
      "#0a0a0a center 68% / cover no-repeat url('/wallpapers/bloom-mobile.jpg')",
    menubarContrast: 'dark',
  },
  {
    id: 'forth',
    label: 'Forth',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/forth.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/forth-mobile.webp')",
    menubarContrast: 'dark',
  },
  {
    id: 'painting',
    label: 'Painting',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/painting.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/painting-mobile.webp')",
    menubarContrast: 'dark',
  },
  {
    id: 'loch',
    label: 'Loch',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/loch.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/loch-mobile.webp')",
    menubarContrast: 'light',
  },
  {
    id: 'mountain',
    label: 'Mountain',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/mountain.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/mountain-mobile.webp')",
    menubarContrast: 'dark',
  },
  {
    id: 'green',
    label: 'Green',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/green.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/green-mobile.jpg')",
    menubarContrast: 'light',
  },
  {
    id: 'heather',
    label: 'Heather',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/heather.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/heather-mobile.webp')",
    menubarContrast: 'light',
  },
  {
    id: 'dunes',
    label: 'Dunes',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/dunes.webp')",
    menubarContrast: 'light',
  },
  {
    id: 'clouds',
    label: 'Clouds',
    background:
      "#0a0a0a center / cover no-repeat url('/wallpapers/clouds.webp')",
    mobileBackground:
      "#0a0a0a center / cover no-repeat url('/wallpapers/clouds-mobile.webp')",
    menubarContrast: 'light',
  },
];

export const DEFAULT_WALLPAPER_ID: WallpaperId = 'bridge';

/** Applied on `<html>` before paint so reload doesn't flash the default wallpaper. */
export const OS_WALLPAPER_CSS_VAR = '--os-wallpaper';

/** `data-os-menubar` on `<html>` — ink color for the transparent menubar. */
export const OS_MENUBAR_CONTRAST_ATTR = 'data-os-menubar';

export function wallpaperBackgroundFor(
  id: WallpaperId,
  opts?: { narrow?: boolean },
): string {
  const preset =
    WALLPAPER_PRESETS.find((p) => p.id === id) ??
    WALLPAPER_PRESETS.find((p) => p.id === DEFAULT_WALLPAPER_ID) ??
    WALLPAPER_PRESETS[0];
  if (opts?.narrow && preset.mobileBackground) return preset.mobileBackground;
  return preset.background;
}

export function menubarContrastFor(id: WallpaperId): 'light' | 'dark' {
  return (
    WALLPAPER_PRESETS.find((p) => p.id === id)?.menubarContrast ??
    WALLPAPER_PRESETS.find((p) => p.id === DEFAULT_WALLPAPER_ID)?.menubarContrast ??
    'light'
  );
}

/* Boot script moved to lib/os-settings.ts — it now applies every stored setting. */

const COL_INSET = 22;
const ROW = 100;
const START_Y = 56;

const NARROW_COL_INSET = 8;
const NARROW_ROW = 100;
const NARROW_START_Y = 40;

/**
 * Desktop icons sit on the right — primary apps live in the bottom dock.
 * Visible rail (top → bottom): Ask AI → Favourites → Draw → Trash.
 */
export const DEFAULT_ICON_POSITIONS: Record<DesktopIconId, DesktopIconPosition> = {
  // Visible right-rail stack
  ask: { x: COL_INSET, y: START_Y, edge: 'right' },
  writings: { x: COL_INSET, y: START_Y + ROW, edge: 'right' },
  drawesome: { x: COL_INSET, y: START_Y + ROW * 2, edge: 'right' },
  trash: { x: COL_INSET, y: START_Y + ROW * 3, edge: 'right' },
  // Dock / menu apps — kept for layout typing, not shown on the rail
  finder: { x: COL_INSET, y: START_Y, edge: 'right' },
  home: { x: COL_INSET, y: START_Y, edge: 'right' },
  work: { x: COL_INSET, y: START_Y + ROW, edge: 'right' },
  playground: { x: COL_INSET, y: START_Y + ROW * 2, edge: 'right' },
  games: { x: COL_INSET, y: START_Y + ROW * 3, edge: 'right' },
  photos: { x: COL_INSET, y: START_Y + ROW, edge: 'right' },
  contact: { x: COL_INSET, y: START_Y + ROW * 3, edge: 'right' },
  catalystic: { x: COL_INSET, y: START_Y + ROW * 4, edge: 'right' },
  bigBang: { x: COL_INSET, y: START_Y + ROW * 5, edge: 'right' },
  wordsmith: { x: COL_INSET, y: START_Y + ROW * 5, edge: 'right' },
  about: { x: COL_INSET, y: START_Y + ROW * 6, edge: 'right' },
  colophon: { x: COL_INSET, y: START_Y + ROW * 6, edge: 'right' },
};

/** Fixed compact right rail for phone / tablet OS (no drag). Dock holds primaries. */
export const NARROW_ICON_POSITIONS: Record<DesktopIconId, DesktopIconPosition> = {
  ask: { x: NARROW_COL_INSET, y: NARROW_START_Y, edge: 'right' },
  writings: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'right' },
  drawesome: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 2, edge: 'right' },
  trash: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 3, edge: 'right' },
  finder: { x: NARROW_COL_INSET, y: NARROW_START_Y, edge: 'right' },
  home: { x: NARROW_COL_INSET, y: NARROW_START_Y, edge: 'right' },
  work: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'right' },
  playground: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 2, edge: 'right' },
  games: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 3, edge: 'right' },
  photos: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW, edge: 'right' },
  contact: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 3, edge: 'right' },
  catalystic: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 4, edge: 'right' },
  bigBang: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 5, edge: 'right' },
  wordsmith: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 5, edge: 'right' },
  about: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 6, edge: 'right' },
  colophon: { x: NARROW_COL_INSET, y: NARROW_START_Y + NARROW_ROW * 6, edge: 'right' },
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
