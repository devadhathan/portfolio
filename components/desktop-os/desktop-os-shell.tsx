'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { useAskAI } from '@/components/ask-ai-provider';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { OsWindow } from '@/components/desktop-os/os-window';
import { WidgetsPanel } from '@/components/desktop-os/widgets-panel';
import { DesktopIcons } from '@/components/desktop-os/desktop-icons';
import { Dock } from '@/components/desktop-os/dock';
import { BridgeWaterSurface } from '@/components/desktop-os/bridge-water-surface';
import { DevOsWelcomeToast } from '@/components/desktop-os/dev-os-welcome-widget';
import {
  AboutWindowBody,
  AskWindowBody,
  ColophonWindowBody,
  ContactWindowBody,
  createLinkWindowBody,
  DrawesomeWindowBody,
  GamesWindowBody,
  HomeWindowBody,
  PlaygroundWindowBody,
  prefetchDesktopWindowBodies,
  TrashWindowBody,
  WordsmithWindowBody,
  WorkWindowBody,
  WritingsFolderWindowBody,
} from '@/components/desktop-os/window-bodies';
import { FinderWindowBody } from '@/components/desktop-os/finder-window-body';
import { PhotosWindowBody } from '@/components/desktop-os/photos-window-body';
import {
  DESKTOP_WINDOW_IDS,
  OS_WALLPAPER_CSS_VAR,
  type DesktopWindowId,
} from '@/lib/desktop-os';

/** Keep Cmd/Ctrl+I Ask AI toggle in sync with the Ask OS window. */
function AskWindowBridge() {
  const { isOpen, open, close } = useAskAI();
  const { windows, openWindow, closeWindow } = useDesktopOs();
  const askOpen = windows.ask.open;
  const prevIsOpen = useRef(isOpen);
  const prevAskOpen = useRef(askOpen);

  useEffect(() => {
    const wasOpen = prevIsOpen.current;
    const wasAsk = prevAskOpen.current;
    prevIsOpen.current = isOpen;
    prevAskOpen.current = askOpen;

    // Keyboard / AskAI API opened → open window
    if (isOpen && !wasOpen && !askOpen) {
      openWindow('ask', { syncUrl: false });
      return;
    }
    // Keyboard / AskAI API closed → close window
    if (!isOpen && wasOpen && askOpen) {
      closeWindow('ask');
      return;
    }
    // Icon / window chrome opened → mark AskAI open
    if (askOpen && !wasAsk && !isOpen) {
      open();
      return;
    }
    // Window chrome closed → mark AskAI closed
    if (!askOpen && wasAsk && isOpen) {
      close();
    }
  }, [isOpen, askOpen, open, close, openWindow, closeWindow]);

  return null;
}

const BODY: Record<DesktopWindowId, ComponentType> = {
  finder: FinderWindowBody,
  home: HomeWindowBody,
  work: WorkWindowBody,
  playground: PlaygroundWindowBody,
  ask: AskWindowBody,
  games: GamesWindowBody,
  drawesome: DrawesomeWindowBody,
  photos: PhotosWindowBody,
  wordsmith: WordsmithWindowBody,
  trash: TrashWindowBody,
  contact: ContactWindowBody,
  about: AboutWindowBody,
  colophon: ColophonWindowBody,
  writings: WritingsFolderWindowBody,
  catalystic: createLinkWindowBody('catalystic'),
  bigBang: createLinkWindowBody('bigBang'),
};

/**
 * Wallpaper as two permanently mounted layers that swap opacity on *user*
 * changes. Prefs hydrate in useLayoutEffect; boot script already set
 * `--os-wallpaper` so the first paint matches saved wallpaper.
 *
 * Critical: do NOT sync from the React `background` prop until prefsReady.
 * Before that, the prop is still the SSR default (bridge) and would flash over
 * the boot-script wallpaper.
 */
function WallpaperLayers({
  background,
  onSwap,
}: {
  background: string;
  onSwap: (swapping: boolean) => void;
}) {
  const { prefsReady } = useDesktopOs();
  const [slots, setSlots] = useState<[string, string] | null>(null);
  const [front, setFront] = useState<0 | 1>(0);
  const frontRef = useRef<0 | 1>(0);
  const hydratedRef = useRef(false);
  const lastAppliedRef = useRef<string | null>(null);

  frontRef.current = front;

  // First real prefs paint — snap to the stored wallpaper (no crossfade).
  useLayoutEffect(() => {
    if (!prefsReady || hydratedRef.current) return;
    hydratedRef.current = true;
    lastAppliedRef.current = background;
    setSlots([background, background]);
    setFront(0);
    frontRef.current = 0;
  }, [prefsReady, background]);

  // User-driven wallpaper changes after hydrate — crossfade between layers.
  useEffect(() => {
    if (!prefsReady || !hydratedRef.current) return;
    if (lastAppliedRef.current === background) return;

    lastAppliedRef.current = background;
    const next: 0 | 1 = frontRef.current === 0 ? 1 : 0;

    setSlots((prev) => {
      const base: [string, string] = prev ?? [background, background];
      const copy: [string, string] = [base[0], base[1]];
      copy[next] = background;
      return copy;
    });
    setFront(next);
    frontRef.current = next;

    onSwap(true);
    const done = window.setTimeout(() => onSwap(false), 450);
    return () => window.clearTimeout(done);
  }, [background, prefsReady, onSwap]);

  // Until prefs hydrate, paint only via the boot CSS var — never the SSR default.
  if (!slots) {
    return (
      <div
        aria-hidden
        className="desktop-os-wallpaper-layer"
        data-front="true"
        style={{ background: `var(${OS_WALLPAPER_CSS_VAR}, #0a0a0a)` }}
      />
    );
  }

  return (
    <>
      {slots.map((layer, index) => (
        <div
          key={index}
          aria-hidden
          className="desktop-os-wallpaper-layer"
          data-front={front === index ? 'true' : undefined}
          style={{ background: layer }}
        />
      ))}
    </>
  );
}

export function DesktopOsShell() {
  const t = useTranslations('nav');
  const { windows, isNarrow, wallpaperBackground } = useDesktopOs();
  const [swapping, setSwapping] = useState(false);

  // Warm window chunks after LCP — mobile delay was 4.5s (too slow for dock opens); now 1.5s.
  useEffect(() => {
    const run = () => prefetchDesktopWindowBodies();
    const delay = isNarrow ? 1500 : 400;
    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(run, { timeout: isNarrow ? 2200 : 1800 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, delay);
    return () => window.clearTimeout(t);
  }, [isNarrow]);

  const titles: Record<DesktopWindowId, string> = {
    finder: 'Catalog',
    home: t('home'),
    work: t('work'),
    playground: t('playground'),
    ask: t('askAI'),
    games: t('games'),
    drawesome: t('drawesome'),
    photos: t('photos'),
    wordsmith: 'Wordsmith AI',
    trash: 'Trash',
    contact: t('contact'),
    about: 'About Me',
    colophon: 'Colophon',
    writings: 'Favourites',
    catalystic: 'Catalystic',
    bigBang: 'Big Bang',
  };

  // Any covered window (case studies auto-cover) drops the desktop back.
  const dimmed = DESKTOP_WINDOW_IDS.some((id) => windows[id].open && windows[id].covered);
  const anyWindowOpen = DESKTOP_WINDOW_IDS.some((id) => windows[id].open);

  return (
    <div
      className={
        isNarrow
          ? 'desktop-os-canvas desktop-os-canvas--wallpaper desktop-os-canvas--narrow relative h-[100dvh] w-full overflow-hidden'
          : 'desktop-os-canvas desktop-os-canvas--wallpaper relative h-[100dvh] w-full overflow-hidden'
      }
      data-os-dimmed={dimmed ? 'true' : undefined}
      data-os-window-open={anyWindowOpen ? 'true' : undefined}
      data-wallpaper-swapping={swapping ? 'true' : undefined}
    >
      <WallpaperLayers background={wallpaperBackground} onSwap={setSwapping} />
      {/* Canvas water sparks compete with LCP on phones — desktop only */}
      {!isNarrow ? <BridgeWaterSurface /> : null}
      <AskWindowBridge />
      <DesktopIcons />
      <div className="desktop-os-stage-windows">
        {DESKTOP_WINDOW_IDS.map((id) => {
          if (!windows[id].everOpened) return null;
          const Body = BODY[id];
          return (
            <OsWindow key={id} id={id} title={titles[id]}>
              <Body />
            </OsWindow>
          );
        })}
      </div>
      <Dock />
      <DevOsWelcomeToast />
      <WidgetsPanel />
    </div>
  );
}
