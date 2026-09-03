'use client';

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import HomePage from '@/components/home-page';
import { useSiteContent } from '@/components/site-content-provider';
import { useDesktopOs, useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { OsBackButton } from '@/components/os-back-button';
import { WordsmithDetail } from '@/components/wordsmith-detail';
import { useOsWindowId } from '@/components/desktop-os/os-window-scope';
import {
  DESKTOP_LINK_ICONS,
  GAMES_EMBED_URL,
  type DesktopLinkIconId,
} from '@/lib/desktop-os';
import { trackEvent } from '@/lib/analytics';
import { useWordsmithTracking } from '@/hooks/use-wordsmith-tracking';
import { cn, focusRing } from '@/lib/utils';

/**
 * Window body adapters — mount page UIs inside OS windows.
 * `embedded` strips full-page chrome (top padding, competing sidebars).
 *
 * Home is a static import so featured thumbs mount once under the boot splash
 * (no dynamic skeleton → remount that restarted videos).
 */

const workPageImport = () => import('@/app/[locale]/work/work-client');
const playgroundPageImport = () => import('@/app/[locale]/playground/page');
const askWindowImport = () =>
  import('@/components/desktop-os/ask-window-body').then((m) => ({ default: m.AskWindowBody }));
const photosBodyImport = () =>
  import('@/components/desktop-os/photos-window-body').then((m) => ({
    default: m.PhotosWindowBody,
  }));
const drawesomeBodyImport = () =>
  import('@/components/desktop-os/drawesome-window-body').then((m) => ({
    default: m.DrawesomeWindowBody,
  }));

const WorkPageClient = dynamic(workPageImport, { ssr: false });
const PlaygroundPage = dynamic(playgroundPageImport, { ssr: false });
/** Lazy — keeps Gen UI / agent stack off the initial OS shell chunk. */
export const AskWindowBody = dynamic(askWindowImport, { ssr: false });
export const DrawesomeWindowBody = dynamic(drawesomeBodyImport, { ssr: false });

/** Warm common window chunks in idle time. Ask/Gen UI is hover-prefetched only. */
export function prefetchDesktopWindowBodies() {
  void workPageImport();
  void playgroundPageImport();
  void photosBodyImport();
}

export function prefetchDesktopWindow(id: string) {
  switch (id) {
    case 'home':
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
    case 'drawesome':
      void drawesomeBodyImport();
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
  const windowId = useOsWindowId();
  const os = useDesktopOsOptional();
  const hostOpen = windowId ? Boolean(os?.windows[windowId]?.open) : true;
  const [shouldLoad, setShouldLoad] = useState(false);

  // Load third-party iframe only while the host window is open; tear down on close.
  useEffect(() => {
    if (!embeddable || !hostOpen) {
      setShouldLoad(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setShouldLoad(true));
    return () => window.cancelAnimationFrame(id);
  }, [embeddable, hostOpen]);

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
          onClick={() => trackEvent('outbound_link', { destination: title, surface: 'window_cta' })}
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
          onClick={() => trackEvent('outbound_link', { destination: title, surface: 'window_header' })}
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
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
      <HomePage embedded />
    </div>
  );
}

export function WorkWindowBody() {
  const { projects } = useSiteContent();
  return (
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
      <WorkPageClient projects={projects} />
    </div>
  );
}

export function PlaygroundWindowBody() {
  return (
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
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
  const wordsmithOpen = Boolean(desktopOs?.windows.wordsmith?.open);
  useWordsmithTracking(wordsmithOpen, 'desktop_window');

  return (
    <div className="relative flex h-full min-h-0 flex-col" data-os-embedded="true">
      <div className="os-window-content flex min-h-0 flex-1 flex-col pb-20 pt-4 sm:pt-5 md:pt-6">
        <WordsmithDetail
          onBack={() => desktopOs?.openWindow('home', { syncUrl: false })}
          onContact={() => {
            if (desktopOs?.enabled) {
              desktopOs.openWindow('contact', { syncUrl: false });
              return;
            }
            window.location.href = 'mailto:devadhathanmd18@gmail.com';
          }}
        />
      </div>
    </div>
  );
}

/** If Trash is opened as its own window id, bounce into Finder. */
export function TrashWindowBody() {
  const { openWindow, closeWindow } = useDesktopOs();

  useLayoutEffect(() => {
    closeWindow('trash');
    openWindow('finder', { syncUrl: false, finderLocation: 'trash' });
  }, [closeWindow, openWindow]);

  return null;
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
            onClick={() => trackEvent('contact_clicked', { channel: link.label })}
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

/** If Favourites is ever opened as its own window id, bounce into Finder. */
export function WritingsFolderWindowBody() {
  const { openWindow, closeWindow } = useDesktopOs();

  useLayoutEffect(() => {
    closeWindow('writings');
    openWindow('finder', { syncUrl: false, finderLocation: 'favourites' });
  }, [closeWindow, openWindow]);

  return null;
}

/** Logo menu → About Me. */
export function AboutWindowBody() {
  const paragraphs = [
    "I got here sideways. Engineering degree, and the only subject I actually loved was soft computing. Neural networks, node weights, backpropagation. I remember the specific feeling of watching a network get less wrong over iterations and thinking that was the most interesting thing anyone had shown me in four years. Then I graduated into a design job and spent a few years pretending that part of me didn't exist. It came back.",
    "Chess. I'm not good. That's not false modesty, I'm genuinely mid. What I like is that chess punishes exactly the thing I'm worst at, which is falling in love with a plan. You can build a beautiful position and lose to a move you didn't look at because you were busy admiring your own idea. I've shipped features that way. Now when a design feels too clean I go looking for the move I'm not considering.",
    "The Lord of the Rings. The maps. Tolkien built the languages and the geography before he built the plot, and you can feel it, because the world holds weight even in scenes where nothing happens. That's the same reason a good product feels solid before you've used half of it. Someone built the system underneath, not just the screen you're looking at. I read the appendices. I know what that says about me.",
    "Meditation. I sit most days. Not for calm, or not only for that. What it actually trains is the gap between something happening and me reacting to it, and that gap is where all the good design decisions live. Ship the thing. Care enormously about the craft and not much about whether it lands, because the second one isn't yours to control. It's the only reason I can keep putting work into the world after it's been rejected.",
    "Right now I'm in Edinburgh, building tools for designers and developers, and looking for a team where design and code aren't separate departments.",
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <p className="text-[17px] leading-8 text-foreground">
        I&rsquo;m Dev. I design products and then I build them, which used to be two jobs and is
        increasingly one.
      </p>

      <div className="mt-6 space-y-5 text-[15px] leading-7 text-foreground/85">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

/** Help → What is this site? The desktop, explained in plain words. */
export function GuideWindowBody() {
  const moves: [string, string][] = [
    ['Open something', 'Click an icon on the desktop, or pick an app from the bar at the bottom.'],
    ['Keep it open', 'Opening a second app doesn’t close the first. Come back to it whenever.'],
    ['Make room', 'Drag icons where you like. The green light fills the screen, the red one closes.'],
    ['Just ask', 'Ask AI knows the work. Ask it anything and it will pull the right pieces up for you.'],
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        It&rsquo;s a desktop, on purpose.
      </h1>

      <div className="mt-6 space-y-5 text-[15px] leading-7 text-foreground/85">
        <p>
          The work kept growing. Case studies, side projects, experiments, things I made on a
          weekend because I wanted to see if they&rsquo;d work. A single scrolling page stopped
          being able to hold it.
        </p>
        <p>
          Most portfolios solve that by sending you somewhere else. Click into a project, read it,
          click back, find your place again, click into the next one. It&rsquo;s a lot of asking
          you to leave.
        </p>
        <p>
          So I built the thing that already solved this years ago: a desktop. Open Work next to
          Playground. Leave a case study open while you look at something else. Put a window aside
          without losing it. Everything is here at once, and you decide what to look at.
        </p>
      </div>

      <h2 className="mt-8 text-[13px] uppercase tracking-[0.08em] text-muted-foreground">
        Getting around
      </h2>
      <dl className="mt-3">
        {moves.map(([label, detail]) => (
          <div key={label} className="border-b border-border/30 py-3 last:border-b-0">
            <dt className="text-[15px] font-medium text-foreground">{label}</dt>
            <dd className="mt-1 text-[15px] leading-7 text-foreground/85">{detail}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-[15px] leading-7 text-foreground/85">
        That&rsquo;s the whole idea. Have a look around — you can&rsquo;t break it, and everything
        goes back to normal from Menu → Reset Desktop.
      </p>
    </div>
  );
}

/** Logo menu → Colophon. Stack and type, nothing more. */
export function ColophonWindowBody() {
  const rows: [string, string][] = [
    ['Built with', 'Next.js · React · TypeScript'],
    ['Styling', 'Tailwind CSS'],
    ['Type', 'Geist Sans · Geist Mono'],
    ['Case-study stages', 'Public-domain landscape paintings'],
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Colophon</h1>

      <dl className="mt-6">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-border/30 py-2.5 last:border-b-0"
          >
            <dt className="text-[13px] text-muted-foreground">{label}</dt>
            <dd className="text-right text-[13px] text-foreground/90">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
