'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONNECT_PREVIEW_POSTER = '/videos/connect-preview-poster.webp';

type ConnectMiniPostProps = {
  name: string;
  handle: string;
  avatarSrc: string;
  body: string;
  profileHref?: string;
  videoSrc?: string;
  videoPoster?: string;
  className?: string;
  /** Keep the media fully inside the card (no peek crop). */
  flushMedia?: boolean;
  socialLinks?: Array<{
    label: string;
    href: string;
    icon: ReactNode;
  }>;
};

export function ConnectMiniPost({
  name,
  handle,
  avatarSrc,
  body,
  profileHref = 'https://www.linkedin.com/in/devadhathan/',
  videoSrc = '/videos/connect-preview.mp4',
  videoPoster = CONNECT_PREVIEW_POSTER,
  className,
  flushMedia = false,
  socialLinks,
}: ConnectMiniPostProps) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const allowPlay =
      !window.matchMedia('(max-width: 1023px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

    if (!allowPlay) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '80px', threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn('group/connect flex h-full min-h-[352px] flex-col overflow-hidden sm:min-h-[452px]', className)}
      data-cuelume-card-hover
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
        {socialLinks && socialLinks.length > 0 ? (
          <div className="relative z-20 mb-auto flex items-center gap-2">
            {socialLinks.map((link, index) => {
              const tooltip = link.href.startsWith('mailto:')
                ? link.href.replace(/^mailto:/, '')
                : link.href.replace(/^https?:\/\//, '');
              const isFirst = index === 0;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  aria-label={`${link.label}: ${tooltip}`}
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  className="group/social relative flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-secondary/30 text-foreground/85 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                >
                  <span className="flex shrink-0 items-center justify-center [&_svg]:shrink-0">
                    {link.icon}
                  </span>
                  <span
                    role="tooltip"
                    className={cn(
                      'pointer-events-none absolute top-[calc(100%+8px)] z-50 hidden whitespace-nowrap rounded-md border border-border/50 bg-popover px-2 py-1 text-[12px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/social:opacity-100 sm:block',
                      isFirst ? 'left-0' : 'left-1/2 -translate-x-1/2',
                    )}
                  >
                    {tooltip}
                  </span>
                </a>
              );
            })}
          </div>
        ) : null}

        <div className="mt-5 flex items-start justify-between gap-3 sm:mt-6">
          <a
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            data-cuelume-hover="tick"
            className="flex min-w-0 items-center gap-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={name}
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-cover object-[center_20%] ring-1 ring-border/40"
            />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">
                {name}
              </span>
              <span className="block truncate text-[12px] leading-tight text-muted-foreground/70">
                {handle}
              </span>
            </span>
          </a>
          <a
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="More options"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-secondary/40 hover:text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </a>
        </div>

        <div className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-muted-foreground transition-colors duration-300 group-hover/connect:text-foreground/90">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph.split(/(@[A-Za-z0-9_]+)/g).map((part, partIndex) =>
                part.startsWith('@') ? (
                  <span key={partIndex} className="text-sky-400/80 transition-colors duration-300 group-hover/connect:text-sky-400">
                    {part}
                  </span>
                ) : (
                  <span key={partIndex}>{part}</span>
                ),
              )}
            </p>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div
            className={cn(
              'relative w-full shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-secondary/15 aspect-video shadow-none transition-[transform,box-shadow] duration-500 ease-out will-change-transform group-hover/connect:-translate-y-1.5 group-hover/connect:shadow-[0_10px_24px_rgba(0,0,0,0.16)] dark:group-hover/connect:shadow-[0_12px_28px_rgba(0,0,0,0.4)]',
              flushMedia ? 'mb-0' : '-mb-6 sm:-mb-8',
            )}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              poster={videoPoster}
              className={cn(
                'absolute inset-0 h-full w-full object-cover',
                flushMedia ? 'object-center' : 'object-top',
              )}
              muted
              loop
              playsInline
              preload="none"
              aria-label="Connect preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
