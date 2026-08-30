'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSiteContent } from '@/components/site-content-provider';
import { cn } from '@/lib/utils';

/** Kept for call sites that still gate on “intro play” — always ready under boot. */
export function useHomeIntroPlay(_reduceMotion: boolean | null) {
  return true;
}

function introLink(href: string, chunks: ReactNode) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground"
    >
      {chunks}
    </a>
  );
}

const LINE_KEYS = ['p1'] as const;

export const HOME_INTRO_LINE_STAGGER = 0.1;
export const HOME_INTRO_LINE_DURATION = 0.42;

/** Seconds until the last intro line finishes — used to delay following home content. */
export const HOME_INTRO_CARDS_DELAY =
  (1 + LINE_KEYS.length) * HOME_INTRO_LINE_STAGGER + HOME_INTRO_LINE_DURATION * 0.25;

const ASCII_PREVIEW_SRC = '/videos/ascii-preview.mp4';
const ASCII_PREVIEW_POSTER = '/videos/ascii-preview-poster.jpg';

type HomeIntroProps = {
  className?: string;
};

export function HomeIntro({ className }: HomeIntroProps) {
  const t = useTranslations('home.intro');
  const tHome = useTranslations('home');
  const { settings } = useSiteContent();

  const linkedinUrl = settings.linkedin?.startsWith('http')
    ? settings.linkedin
    : `https://www.linkedin.com/${settings.linkedin || 'in/devadhathan/'}`;
  const emailHref = `mailto:${settings.email || 'devadhathanmd18@gmail.com'}`;
  const emailLabel = settings.email || 'devadhathanmd18@gmail.com';

  const richTags = {
    i: (chunks: ReactNode) => <em className="italic">{chunks}</em>,
    keep: (chunks: ReactNode) => <span className="home-hero__keep">{chunks}</span>,
    wordsmith: (chunks: ReactNode) => introLink('https://wordsmith.ai', chunks),
    nesoi: (chunks: ReactNode) => introLink('https://nesoi.ai', chunks),
    ditto: (chunks: ReactNode) => introLink('https://joinditto.in', chunks),
    finshots: (chunks: ReactNode) => introLink('https://finshots.in', chunks),
  };

  const contactLinks = [
    { label: 'LinkedIn', href: linkedinUrl, external: true },
    { label: 'Email', href: emailHref, external: false },
  ] as const;

  return (
    <header className={cn('home-intro os-col w-full', className)}>
      <div className="home-intro__copy flex w-full flex-col gap-10 sm:gap-12 md:gap-14">
        <h1 className="home-intro__title tracking-tight text-foreground">
          {tHome('heroLine1')}
        </h1>
        <div className="home-intro__body flex w-full flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10 md:gap-14">
          <div className="flex max-w-xl flex-col gap-7 sm:max-w-[34rem] sm:gap-8 md:gap-9">
            {LINE_KEYS.map((key) => (
              <p
                key={key}
                className="text-[15px] font-normal leading-[1.65] text-foreground/90 sm:text-base sm:leading-[1.7]"
              >
                {t.rich(key, richTags)}
              </p>
            ))}
            <nav
              className="home-intro__contacts flex flex-wrap gap-x-5 gap-y-2 pt-1"
              aria-label="Contact"
            >
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-[15px] font-normal text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground sm:text-base"
                  {...(link.label === 'Email' ? { title: emailLabel } : {})}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mx-auto w-full max-w-[22rem] shrink-0 overflow-hidden rounded-xl sm:mx-0 sm:max-w-[28rem]">
            <video
              src={ASCII_PREVIEW_SRC}
              poster={ASCII_PREVIEW_POSTER}
              className="h-auto w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="ASCII magic preview"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
