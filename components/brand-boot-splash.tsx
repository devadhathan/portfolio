'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  BOOT_READY_EVENT,
  imageUrlFromBackground,
  isBootReady,
  preloadImage,
} from '@/lib/boot-critical';
import {
  DEFAULT_WALLPAPER_ID,
  DESKTOP_OS_WALLPAPER_KEY,
  OS_WALLPAPER_CSS_VAR,
  WALLPAPER_PRESETS,
  pathToWindowId,
  wallpaperBackgroundFor,
  type WallpaperId,
} from '@/lib/desktop-os';
import { prefetchDesktopWindow } from '@/components/desktop-os/window-bodies';

type BootPhase = 'loading' | 'fading' | 'done';

const FADE_MS = 550;
const HOLD_AT_FULL_MS = 120;
const SAFETY_MS = 2800;

function readWallpaperId(): WallpaperId {
  try {
    const raw = localStorage.getItem(DESKTOP_OS_WALLPAPER_KEY);
    if (raw && WALLPAPER_PRESETS.some((p) => p.id === raw)) return raw as WallpaperId;
  } catch {
    /* ignore */
  }
  return DEFAULT_WALLPAPER_ID;
}

function criticalWallpaperUrl(): string | null {
  // Prefer live CSS var (boot script may have set it already).
  try {
    const live = getComputedStyle(document.documentElement)
      .getPropertyValue(OS_WALLPAPER_CSS_VAR)
      .trim();
    const fromLive = live ? imageUrlFromBackground(live) : null;
    if (fromLive) return fromLive;
  } catch {
    /* ignore */
  }
  return imageUrlFromBackground(wallpaperBackgroundFor(readWallpaperId()));
}

/**
 * Full-screen splash until the *critical* desktop is ready:
 * fonts + wallpaper + active window chunk painted.
 * Does not wait on lazy photos / analytics / below-fold media.
 */
export function BrandBootSplash({ children }: { children: React.ReactNode }) {
  // Locale-stripped path — same source as DesktopOsProvider.
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [phase, setPhase] = useState<BootPhase>('loading');
  const [progress, setProgress] = useState(8);
  const progressRef = useRef(8);
  const doneRef = useRef(false);

  // One-shot boot — layout stays mounted across client navigations.
  useEffect(() => {
    let cancelled = false;
    const marks = {
      fonts: false,
      wallpaper: false,
      chunk: false,
      paint: false,
    };

    const bump = (value: number) => {
      if (cancelled || doneRef.current) return;
      const next = Math.max(progressRef.current, Math.min(100, value));
      if (next === progressRef.current) return;
      progressRef.current = next;
      setProgress(next);
    };

    const recompute = () => {
      let total = 10; // client mounted
      if (marks.fonts) total += 20;
      if (marks.wallpaper) total += 30;
      if (marks.chunk) total += 25;
      if (marks.paint) total += 15;
      const ready = marks.fonts && marks.wallpaper && marks.chunk && marks.paint;
      bump(ready ? 100 : Math.min(94, total));
    };

    const tryFinish = () => {
      if (cancelled || doneRef.current) return;
      if (!(marks.fonts && marks.wallpaper && marks.chunk && marks.paint)) return;
      doneRef.current = true;
      bump(100);
      window.setTimeout(() => {
        if (!cancelled) setPhase('fading');
      }, HOLD_AT_FULL_MS);
    };

    recompute();

    // 1) Fonts (text in home / menubar)
    void (document.fonts?.ready ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        marks.fonts = true;
        recompute();
        tryFinish();
      });

    // 2) Wallpaper image only (not every photo on the page)
    const wallpaperUrl = criticalWallpaperUrl();
    const wallpaperTask = wallpaperUrl
      ? preloadImage(wallpaperUrl)
      : Promise.resolve();
    void wallpaperTask.then(() => {
      if (cancelled) return;
      marks.wallpaper = true;
      recompute();
      tryFinish();
    });

    // Logo (tiny — fire and forget into cache)
    void preloadImage('/photos/Image@4x.png');

    // 3) Prefetch the window that will be open on first paint
    const windowId = pathToWindowId(pathnameRef.current);
    prefetchDesktopWindow(windowId);
    const chunkTask = (async () => {
      switch (windowId) {
        case 'work':
          await import('@/app/[locale]/work/work-client');
          break;
        case 'playground':
          await import('@/app/[locale]/playground/page');
          break;
        case 'home':
        default:
          await import('@/components/home-page');
          break;
      }
    })();
    void chunkTask.then(() => {
      if (cancelled) return;
      marks.chunk = true;
      recompute();
      tryFinish();
    });

    // 4) First paint of the active window body (sticky flag covers late subscribe)
    const onPaintReady = () => {
      if (cancelled) return;
      marks.paint = true;
      marks.chunk = true;
      recompute();
      tryFinish();
    };
    if (isBootReady()) onPaintReady();
    window.addEventListener(BOOT_READY_EVENT, onPaintReady);

    // Safety — never trap the user on black
    const safety = window.setTimeout(() => {
      if (cancelled || doneRef.current) return;
      marks.fonts = true;
      marks.wallpaper = true;
      marks.chunk = true;
      marks.paint = true;
      recompute();
      tryFinish();
    }, SAFETY_MS);

    return () => {
      cancelled = true;
      window.removeEventListener(BOOT_READY_EVENT, onPaintReady);
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot boot on mount only
  }, []);

  useEffect(() => {
    if (phase !== 'fading') return;
    const t = window.setTimeout(() => setPhase('done'), FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const showSplash = phase !== 'done';
  const fading = phase === 'fading';

  return (
    <>
      <div
        className={cn(
          'min-h-screen transition-opacity ease-out',
          phase === 'loading' ? 'opacity-0' : 'opacity-100',
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        {children}
      </div>

      {showSplash ? (
        <div
          className={cn(
            'fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-black transition-opacity ease-out',
            fading ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          aria-busy={phase === 'loading'}
          aria-live="polite"
          aria-label="Loading"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/photos/Image@4x.png"
            alt=""
            aria-hidden
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            draggable={false}
          />
          <div
            className="brand-boot-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Loading"
          >
            <span className="brand-boot-line__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </>
  );
}
