'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CONNECT_PREVIEW_POSTER = '/videos/connect-preview-poster.webp';

type ConnectMiniPostProps = {
  title?: string;
  body: string;
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
  title,
  body,
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
      className={cn('group/connect flex h-full min-h-[400px] flex-col overflow-hidden sm:min-h-[480px]', className)}
      data-cuelume-card-hover
      onClick={(e) => e.stopPropagation()}
    >
      {/* No bottom padding — the preview sits flush against the card edge. */}
      <div className="flex min-h-0 flex-1 flex-col p-[20px] pb-0">
        <div className="space-y-1.5">
          {title ? <p className="home-card-title">{title}</p> : null}
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              // Balanced wrap keeps the two lines even instead of leaving a
              // short orphan on the second row.
              className="home-card-desc max-w-[34ch] whitespace-pre-wrap leading-[1.45] [text-wrap:balance]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {socialLinks && socialLinks.length > 0 ? (
          <div className="relative z-20 mt-4 flex items-center gap-2">
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

        {/* mt-auto pins the preview to the bottom edge of the card. */}
        <div className="mt-auto flex flex-col pt-5">
          <div
            className={cn(
              'relative mb-0 aspect-video min-h-[15rem] max-h-[17rem] w-full shrink-0 overflow-hidden rounded-2xl rounded-b-none border border-border/40 bg-secondary/15 shadow-none transition-[transform,box-shadow] duration-500 ease-out will-change-transform group-hover/connect:-translate-y-1.5 group-hover/connect:shadow-[0_10px_24px_rgba(0,0,0,0.16)] dark:group-hover/connect:shadow-[0_12px_28px_rgba(0,0,0,0.4)]',
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
