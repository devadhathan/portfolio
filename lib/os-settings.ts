import {
  DEFAULT_WALLPAPER_ID,
  DESKTOP_OS_WALLPAPER_KEY,
  OS_MENUBAR_CONTRAST_ATTR,
  OS_WALLPAPER_CSS_VAR,
  WALLPAPER_PRESETS,
  type WallpaperId,
} from '@/lib/desktop-os';

export const OS_SETTINGS_KEY = 'portfolio-os-settings-v2';

/** Bump when the default wallpaper changes and saved picks should reset once. */
export const OS_WALLPAPER_EPOCH_KEY = 'portfolio-os-wallpaper-epoch';
export const CURRENT_WALLPAPER_EPOCH = 1;

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 125;
export const ZOOM_STEP = 5;
export const MAX_RECENTS = 8;

export type OsSettings = {
  wallpaperId: WallpaperId | null;
  shuffleDaily: boolean;
  sounds: boolean;
  /** Interface sound level, 0–100. */
  soundVolume: number;
  widgets: boolean;
  iconLabels: boolean;
  zoom: number;
  recents: import('@/lib/desktop-os').DesktopWindowId[];
};

export const DEFAULT_OS_SETTINGS: OsSettings = {
  wallpaperId: null,
  shuffleDaily: false,
  sounds: true,
  soundVolume: 25,
  widgets: false,
  iconLabels: true,
  zoom: 100,
  recents: [],
};

function readWallpaperEpoch(): number {
  try {
    const raw = localStorage.getItem(OS_WALLPAPER_EPOCH_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** One-time reset when default wallpaper changes (e.g. bridge → dunes). */
function applyWallpaperEpochMigration(settings: OsSettings): OsSettings {
  if (readWallpaperEpoch() >= CURRENT_WALLPAPER_EPOCH) return settings;
  try {
    localStorage.setItem(OS_WALLPAPER_EPOCH_KEY, String(CURRENT_WALLPAPER_EPOCH));
    localStorage.removeItem(DESKTOP_OS_WALLPAPER_KEY);
  } catch {
    /* ignore */
  }
  const next = { ...settings, wallpaperId: null };
  writeOsSettings(next);
  return next;
}

export function readOsSettings(): OsSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_OS_SETTINGS };
  try {
    const raw = localStorage.getItem(OS_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_OS_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<OsSettings>;
    let next: OsSettings = { ...DEFAULT_OS_SETTINGS, ...parsed };
    if (Array.isArray(parsed.recents)) {
      next.recents = parsed.recents.filter(Boolean).slice(0, MAX_RECENTS) as OsSettings['recents'];
    }
    if (typeof parsed.soundVolume !== 'number' || !Number.isFinite(parsed.soundVolume)) {
      next.soundVolume = DEFAULT_OS_SETTINGS.soundVolume;
    } else {
      next.soundVolume = Math.min(100, Math.max(0, Math.round(parsed.soundVolume)));
    }
    next = applyWallpaperEpochMigration(next);
    return next;
  } catch {
    return { ...DEFAULT_OS_SETTINGS };
  }
}

export function writeOsSettings(settings: OsSettings) {
  try {
    localStorage.setItem(OS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function resolveWallpaperId(settings: OsSettings): WallpaperId {
  if (settings.shuffleDaily === true) {
    const n = new Date();
    const d = Math.floor((n.getTime() - n.getTimezoneOffset() * 6e4) / 864e5);
    const order = WALLPAPER_PRESETS.map((p) => p.id);
    return order[Math.abs(d) % order.length] ?? DEFAULT_WALLPAPER_ID;
  }
  if (settings.wallpaperId && WALLPAPER_PRESETS.some((p) => p.id === settings.wallpaperId)) {
    return settings.wallpaperId;
  }
  return DEFAULT_WALLPAPER_ID;
}

/**
 * Inline boot script for `<head>`. Applies the wallpaper before first paint —
 * the flash of a wrong background is what gives these away.
 */
export function getOsSettingsBootScript(): string {
  const backgrounds = Object.fromEntries(
    WALLPAPER_PRESETS.map((preset) => [preset.id, preset.background]),
  );
  const mobileBackgrounds = Object.fromEntries(
    WALLPAPER_PRESETS.filter((p) => p.mobileBackground).map((preset) => [
      preset.id,
      preset.mobileBackground as string,
    ]),
  );
  const contrasts = Object.fromEntries(
    WALLPAPER_PRESETS.map((preset) => [preset.id, preset.menubarContrast]),
  );
  const order = WALLPAPER_PRESETS.map((preset) => preset.id);

  return `(function(){try{
document.title=${JSON.stringify('Dev')};
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})})}
/* The 'clear' theme is gone. Rewrite it before next-themes reads the key, or a
   returning visitor boots into a class with no styles behind it. */
try{if(localStorage.getItem('theme')==='clear'){localStorage.setItem('theme','dark');document.documentElement.classList.remove('clear');document.documentElement.classList.add('dark');}}catch(e){}
var S={};try{S=JSON.parse(localStorage.getItem(${JSON.stringify(OS_SETTINGS_KEY)}))||{}}catch(e){}
var P=${JSON.stringify(backgrounds)},M=${JSON.stringify(mobileBackgrounds)},C=${JSON.stringify(contrasts)},O=${JSON.stringify(order)};
var epoch=0;try{epoch=Number(localStorage.getItem(${JSON.stringify(OS_WALLPAPER_EPOCH_KEY)})||0)}catch(e){}
if(!Number.isFinite(epoch))epoch=0;
if(epoch<${CURRENT_WALLPAPER_EPOCH}){
try{
localStorage.setItem(${JSON.stringify(OS_WALLPAPER_EPOCH_KEY)},${JSON.stringify(String(CURRENT_WALLPAPER_EPOCH))});
localStorage.removeItem(${JSON.stringify(DESKTOP_OS_WALLPAPER_KEY)});
if(S.wallpaperId){S.wallpaperId=null;localStorage.setItem(${JSON.stringify(OS_SETTINGS_KEY)},JSON.stringify(S));}
}catch(e){}
}
var id=S.wallpaperId;
if(!id){var l=localStorage.getItem(${JSON.stringify(DESKTOP_OS_WALLPAPER_KEY)});if(l&&P[l])id=l;}
if(S.shuffleDaily===true){var n=new Date();var d=Math.floor((n.getTime()-n.getTimezoneOffset()*6e4)/864e5);id=O[Math.abs(d)%O.length];}
var rid=(id&&P[id])?id:${JSON.stringify(DEFAULT_WALLPAPER_ID)};
var narrow=window.matchMedia&&window.matchMedia('(max-width:1023px)').matches;
var bg=(narrow&&M[rid])?M[rid]:P[rid];
if(bg){
var r=document.documentElement;
r.style.setProperty(${JSON.stringify(OS_WALLPAPER_CSS_VAR)},bg);
r.style.background=bg;
r.style.backgroundAttachment='fixed';
var m=bg.match(/url\\(['"]?([^'")]+)/);
/* Preload the wallpaper that will paint — mobile assets are small; desktop needs high priority too */
if(m&&m[1]){var pl=document.createElement('link');pl.rel='preload';pl.as='image';pl.href=m[1];pl.setAttribute('fetchpriority','high');document.head.appendChild(pl);}
}
var contrast=C[rid]||C[${JSON.stringify(DEFAULT_WALLPAPER_ID)}]||'light';
document.documentElement.setAttribute(${JSON.stringify(OS_MENUBAR_CONTRAST_ATTR)},contrast);
}catch(e){}})();`;
}
