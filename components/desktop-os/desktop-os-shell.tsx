'use client';

import { useEffect, useRef, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { useNavActions } from '@/contexts/nav-actions-context';
import { useAskAI } from '@/components/ask-ai-provider';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { OsWindow } from '@/components/desktop-os/os-window';
import { WidgetsPanel } from '@/components/desktop-os/widgets-panel';
import { DesktopIcons } from '@/components/desktop-os/desktop-icons';
import {
  AskWindowBody,
  ContactWindowBody,
  createLinkWindowBody,
  GamesWindowBody,
  HomeWindowBody,
  PlaygroundWindowBody,
  prefetchDesktopWindowBodies,
  TrashWindowBody,
  WordsmithWindowBody,
  WorkWindowBody,
} from '@/components/desktop-os/window-bodies';
import { PhotosWindowBody } from '@/components/desktop-os/photos-window-body';
import {
  DESKTOP_WINDOW_IDS,
  type DesktopWindowId,
} from '@/lib/desktop-os';
import { openCaseStudyInHomeWindow } from '@/lib/open-case-study';

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
  home: HomeWindowBody,
  work: WorkWindowBody,
  playground: PlaygroundWindowBody,
  ask: AskWindowBody,
  games: GamesWindowBody,
  photos: PhotosWindowBody,
  wordsmith: WordsmithWindowBody,
  trash: TrashWindowBody,
  contact: ContactWindowBody,
  writings: createLinkWindowBody('writings'),
  catalystic: createLinkWindowBody('catalystic'),
  pixl: createLinkWindowBody('pixl'),
  musicNotch: createLinkWindowBody('musicNotch'),
  linkring: createLinkWindowBody('linkring'),
  bigBang: createLinkWindowBody('bigBang'),
};

export function DesktopOsShell() {
  const t = useTranslations('nav');
  const { windows, openWindow, isNarrow } = useDesktopOs();
  const { onProjectSelectRef } = useNavActions();

  // Warm heavy window chunks in idle time so first opens feel instant
  useEffect(() => {
    const run = () => prefetchDesktopWindowBodies();
    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(run, { timeout: 1800 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 400);
    return () => window.clearTimeout(t);
  }, []);

  const titles: Record<DesktopWindowId, string> = {
    home: t('home'),
    work: t('work'),
    playground: t('playground'),
    ask: t('askAI'),
    games: t('games'),
    photos: t('photos'),
    wordsmith: 'Wordsmith AI',
    trash: 'Trash',
    contact: t('contact'),
    writings: 'Writings',
    catalystic: 'Catalystic',
    pixl: 'Pixl',
    musicNotch: 'MusicNotch',
    linkring: 'Linkring',
    bigBang: 'Big Bang',
  };

  return (
    <div
      className={
        isNarrow
          ? 'desktop-os-canvas desktop-os-canvas--wallpaper desktop-os-canvas--narrow relative h-[100dvh] w-full overflow-hidden'
          : 'desktop-os-canvas desktop-os-canvas--wallpaper relative h-[100dvh] w-full overflow-hidden'
      }
    >
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
      <WidgetsPanel
        onProjectSelect={(slug) => {
          openCaseStudyInHomeWindow({
            openWindow,
            selectProject: (id) => onProjectSelectRef.current?.(id),
            slug,
          });
        }}
      />
    </div>
  );
}
