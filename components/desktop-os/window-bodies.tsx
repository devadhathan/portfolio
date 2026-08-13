'use client';

import dynamic from 'next/dynamic';
import { useSiteContent } from '@/components/site-content-provider';
import { useAskAI } from '@/components/ask-ai-provider';

/**
 * Window body adapters — mount page UIs inside OS windows.
 * `embedded` strips full-page chrome (top padding, competing sidebars).
 */

function BodySkeleton() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-1.5 w-24 animate-pulse rounded-full bg-foreground/15" />
    </div>
  );
}

const homePageImport = () => import('@/app/[locale]/page');
const workPageImport = () => import('@/app/[locale]/work/work-client');
const playgroundPageImport = () => import('@/app/[locale]/playground/page');
const sideAgentImport = () =>
  import('@/components/side-agent').then((m) => ({ default: m.SideAgent }));
const photosBodyImport = () =>
  import('@/components/desktop-os/photos-window-body').then((m) => ({
    default: m.PhotosWindowBody,
  }));

const HomePage = dynamic(homePageImport, { ssr: false, loading: BodySkeleton });
const WorkPageClient = dynamic(workPageImport, { ssr: false, loading: BodySkeleton });
const PlaygroundPage = dynamic(playgroundPageImport, { ssr: false, loading: BodySkeleton });
const SideAgent = dynamic(sideAgentImport, { ssr: false, loading: BodySkeleton });

/** Warm page chunks so the first open of each window is faster. */
export function prefetchDesktopWindowBodies() {
  void homePageImport();
  void workPageImport();
  void playgroundPageImport();
  void sideAgentImport();
  void photosBodyImport();
}

export function prefetchDesktopWindow(id: string) {
  switch (id) {
    case 'home':
      void homePageImport();
      break;
    case 'work':
      void workPageImport();
      break;
    case 'playground':
      void playgroundPageImport();
      break;
    case 'ask':
      void sideAgentImport();
      break;
    case 'photos':
      void photosBodyImport();
      break;
    default:
      break;
  }
}

export function HomeWindowBody() {
  return (
    <div className="os-window-content" data-os-embedded="true">
      <HomePage embedded />
    </div>
  );
}

export function WorkWindowBody() {
  const { projects } = useSiteContent();
  return (
    <div className="os-window-content" data-os-embedded="true">
      <WorkPageClient projects={projects} />
    </div>
  );
}

export function PlaygroundWindowBody() {
  return (
    <div className="os-window-content" data-os-embedded="true">
      <PlaygroundPage />
    </div>
  );
}

export function AskWindowBody() {
  const { dispatchStateChange, resetRef } = useAskAI();

  return (
    <div className="os-window-content h-full min-h-[480px]" data-os-embedded="true">
      <SideAgent
        variant="sidebar"
        embedded
        externalCollapsed={false}
        resetRef={resetRef}
        onStateChange={dispatchStateChange}
      />
    </div>
  );
}

export function GamesWindowBody() {
  return (
    <div className="os-window-content flex h-full min-h-[520px] flex-col" data-os-embedded="true">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">puzzlegig.vercel.app</span>
        <a
          href="https://puzzlegig.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
        >
          Open externally
        </a>
      </div>
      <iframe
        title="Puzzle Gig"
        src="https://puzzlegig.vercel.app"
        className="min-h-0 w-full flex-1 border-0 bg-background"
        allow="fullscreen; gamepad; clipboard-read; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function WordsmithWindowBody() {
  return (
    <div className="os-window-content flex h-full min-h-[520px] flex-col" data-os-embedded="true">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">wordsmith.ai/products/blueprints</span>
        <a
          href="https://www.wordsmith.ai/products/blueprints"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
        >
          Open externally
        </a>
      </div>
      <iframe
        title="Wordsmith AI"
        src="https://www.wordsmith.ai/products/blueprints"
        className="min-h-0 w-full flex-1 border-0 bg-background"
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
