'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { useNavActions } from '@/contexts/nav-actions-context';
import { useAskAI } from '@/components/ask-ai-provider';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { OsWindow } from '@/components/desktop-os/os-window';
import { WidgetsPanel } from '@/components/desktop-os/widgets-panel';
import { DesktopIcons } from '@/components/desktop-os/desktop-icons';
import { ContactChat } from '@/components/contact-chat';
import {
  AskWindowBody,
  GamesWindowBody,
  HomeWindowBody,
  PlaygroundWindowBody,
  prefetchDesktopWindowBodies,
  WordsmithWindowBody,
  WorkWindowBody,
} from '@/components/desktop-os/window-bodies';
import { PhotosWindowBody } from '@/components/desktop-os/photos-window-body';
import { DESKTOP_WINDOW_IDS, type DesktopWindowId } from '@/lib/desktop-os';
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
};

export function DesktopOsShell() {
  const t = useTranslations('nav');
  const { windows, openWindow, wallpaperBackground, isNarrow } = useDesktopOs();
  const { onProjectSelectRef } = useNavActions();
  const [chatOpen, setChatOpen] = useState(false);

  // Warm heavy window chunks in idle time so first opens feel instant
  useEffect(() => {
    const run = () => prefetchDesktopWindowBodies();
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
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
  };

  return (
    <div
      className={
        isNarrow
          ? 'desktop-os-canvas desktop-os-canvas--wallpaper desktop-os-canvas--narrow relative h-[100dvh] w-full overflow-hidden'
          : 'desktop-os-canvas desktop-os-canvas--wallpaper relative h-[100dvh] w-full overflow-hidden'
      }
      style={{ background: wallpaperBackground }}
    >
      <AskWindowBridge />
      <DesktopIcons onContact={() => setChatOpen(true)} />
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
      <ContactChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
