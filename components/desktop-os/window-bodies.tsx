'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSiteContent } from '@/components/site-content-provider';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { OsBackButton } from '@/components/os-back-button';
import {
  DESKTOP_LINK_ICONS,
  GAMES_EMBED_URL,
  WORDSMITH_EMBED_URL,
  type DesktopLinkIconId,
} from '@/lib/desktop-os';
import { cn } from '@/lib/utils';

/**
 * Window body adapters — mount page UIs inside OS windows.
 * `embedded` strips full-page chrome (top padding, competing sidebars).
 */

function BodySkeleton() {
  // Keep the window calm on reload — no pulse bar flash while the page chunk loads.
  return <div className="min-h-[120px]" aria-hidden />;
}

const homePageImport = () => import('@/components/home-page');
const workPageImport = () => import('@/app/[locale]/work/work-client');
const playgroundPageImport = () => import('@/app/[locale]/playground/page');
const askWindowImport = () =>
  import('@/components/desktop-os/ask-window-body').then((m) => ({ default: m.AskWindowBody }));
const photosBodyImport = () =>
  import('@/components/desktop-os/photos-window-body').then((m) => ({
    default: m.PhotosWindowBody,
  }));

const HomePage = dynamic(homePageImport, { ssr: false, loading: BodySkeleton });
const WorkPageClient = dynamic(workPageImport, { ssr: false, loading: BodySkeleton });
const PlaygroundPage = dynamic(playgroundPageImport, { ssr: false, loading: BodySkeleton });
/** Lazy — keeps Gen UI / agent stack off the initial OS shell chunk. */
export const AskWindowBody = dynamic(askWindowImport, { ssr: false, loading: BodySkeleton });

/** Warm common window chunks in idle time. Ask/Gen UI is hover-prefetched only. */
export function prefetchDesktopWindowBodies() {
  void homePageImport();
  void workPageImport();
  void playgroundPageImport();
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
      void askWindowImport();
      void import('@/components/gen-ui-mode-shell');
      break;
    case 'photos':
      void photosBodyImport();
      break;
    default:
      break;
  }
}

function embedHostLabel(href: string) {
  try {
    const url = new URL(href);
    return url.host + url.pathname.replace(/\/$/, '');
  } catch {
    return href;
  }
}

export function EmbedWindowBody({
  title,
  href,
  allow = 'clipboard-read; clipboard-write',
  embeddable = true,
  thumbnail,
  openLabel,
  thumbnailClassName,
}: {
  title: string;
  href: string;
  allow?: string;
  embeddable?: boolean;
  thumbnail?: string;
  /** CTA when embeddable is false. Defaults to "Open {title}". */
  openLabel?: string;
  thumbnailClassName?: string;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Load third-party iframe only after this body is on screen (first open).
  useEffect(() => {
    if (!embeddable) return;
    const id = window.requestAnimationFrame(() => setShouldLoad(true));
    return () => window.cancelAnimationFrame(id);
  }, [embeddable]);

  if (!embeddable) {
    return (
      <div
        className="os-window-content flex h-full min-h-[520px] flex-col items-center justify-center gap-5 px-6"
        data-os-embedded="true"
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className={cn(
              'h-auto w-full rounded-2xl object-cover shadow-[0_12px_40px_-16px_hsl(0_0%_0%_/_0.45)]',
              thumbnailClassName ?? 'max-w-md',
            )}
          />
        ) : null}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {openLabel ?? `Open ${title}`}
        </a>
      </div>
    );
  }

  return (
    <div className="os-window-content flex h-full min-h-[520px] flex-col" data-os-embedded="true">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">{embedHostLabel(href)}</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
        >
          Open externally
        </a>
      </div>
      {shouldLoad ? (
        <iframe
          title={title}
          src={href}
          className="min-h-0 w-full flex-1 border-0 bg-background"
          allow={allow}
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="h-1.5 w-24 animate-pulse rounded-full bg-foreground/15" />
        </div>
      )}
    </div>
  );
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

export function GamesWindowBody() {
  return (
    <EmbedWindowBody
      title="Puzzle Gig"
      href={GAMES_EMBED_URL}
      allow="fullscreen; gamepad; clipboard-read; clipboard-write"
    />
  );
}

export function WordsmithWindowBody() {
  const desktopOs = useDesktopOsOptional();

  // Wordsmith CSP: frame-ancestors 'self' studio.wordsmith.ai localhost:* —
  // staging/prod portfolios cannot iframe it (localhost works).
  return (
    <div className="relative h-full min-h-0" data-os-embedded="true">
      {desktopOs?.enabled ? (
        <div className="absolute left-4 top-3 z-10 sm:left-5 sm:top-4">
          <OsBackButton
            onClick={() => desktopOs.openWindow('home', { syncUrl: false })}
            aria-label="Back to Home"
          />
        </div>
      ) : null}
      <EmbedWindowBody
        title="Wordsmith AI"
        href={WORDSMITH_EMBED_URL}
        embeddable={false}
        thumbnail="/photos/wordsmith-preview.png"
        thumbnailClassName="max-w-3xl sm:max-w-4xl"
        openLabel="Open Wordsmith"
      />
    </div>
  );
}

export function TrashWindowBody() {
  return (
    <div
      className="os-window-content flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center"
      data-os-embedded="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/trash.svg"
        alt=""
        width={72}
        height={72}
        className="h-[4.5rem] w-[4.5rem] opacity-80"
        draggable={false}
      />
      <p className="text-sm font-medium text-foreground/85">Trash is Empty</p>
    </div>
  );
}

export function ContactWindowBody() {
  const { settings } = useSiteContent();
  const [copied, setCopied] = useState(false);

  const email = settings.email || 'devadhathanmd18@gmail.com';
  const linkedinUrl = settings.linkedin?.startsWith('http')
    ? settings.linkedin
    : `https://www.linkedin.com/${(settings.linkedin || 'in/devadhathan/').replace(/^\/+/, '')}`;

  const links = [
    {
      label: 'Email',
      detail: email,
      href: `mailto:${email}`,
      external: false,
    },
    {
      label: 'X',
      detail: '@mddevadhathan',
      href: 'https://x.com/mddevadhathan',
      external: true,
    },
    {
      label: 'LinkedIn',
      detail: 'linkedin.com/in/devadhathan',
      href: linkedinUrl,
      external: true,
    },
  ] as const;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div
      className="os-window-content flex h-full min-h-[360px] flex-col items-center justify-center gap-8 px-6 py-10"
      data-os-embedded="true"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Contact
        </p>
        <a
          href={`mailto:${email}`}
          className="break-all text-[1.35rem] font-medium tracking-tight text-foreground transition-opacity hover:opacity-80 sm:text-[1.6rem]"
        >
          {email}
        </a>
        <button
          type="button"
          onClick={copyEmail}
          className="rounded-full border border-border/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          {copied ? 'Copied' : 'Copy email'}
        </button>
      </div>

      <div className="flex w-full max-w-md flex-col gap-1.5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-foreground/[0.03] px-4 py-3 transition-colors hover:bg-foreground/[0.06]"
          >
            <span className="text-sm font-medium text-foreground">{link.label}</span>
            <span className="truncate text-xs text-muted-foreground">{link.detail}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function createLinkWindowBody(id: DesktopLinkIconId) {
  const link = DESKTOP_LINK_ICONS.find((item) => item.id === id);
  if (!link) {
    return function MissingLinkWindowBody() {
      return null;
    };
  }
  return function LinkWindowBody() {
    return (
      <EmbedWindowBody
        title={link.label}
        href={link.href}
        embeddable={link.embeddable !== false}
        thumbnail={link.thumbnail}
        openLabel={link.openLabel}
      />
    );
  };
}
