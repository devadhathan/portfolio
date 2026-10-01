'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CardHoverGlow } from '@/components/card-hover-glow';
import { MediumLogo } from '@/components/medium-logo';
import { useTheme } from '@/contexts/theme-context';
import { heroArtFor } from '@/lib/hero-art';
import { CATALYSTIC_URL, MEDIUM_PROFILE_URL } from '@/lib/social-links';
import { useSiteContent } from '@/components/site-content-provider';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { HomeHeroTitle } from '@/components/home-hero-title';
import { cn, focusRing } from '@/lib/utils';

/** Flip on to bring the Catalystic card back beside About. */
const SHOW_CATALYSTIC_CARD = false;

const CATALYSTIC_THUMB = '/photos/case-study-bg/catalysitc-1.png';

const HeroVideo = dynamic(
  () => import('@/components/hero-video').then((m) => m.HeroVideo),
  { ssr: false },
);

function introLink(href: string, chunks: ReactNode) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-[3px] transition-colors"
    >
      {chunks}
    </a>
  );
}

function DevCardMedia() {
  const { resolvedTheme } = useTheme();
  const art = heroArtFor(resolvedTheme);

  if (art.kind === 'video') {
    return <HeroVideo className="home-hero__ascii-video h-full w-full rounded-[inherit]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={art.src}
      alt=""
      className={cn('home-hero__ascii-video h-full w-full object-contain', art.tintClass)}
      draggable={false}
    />
  );
}

function socialTooltip(href: string) {
  if (href.startsWith('mailto:')) return href.replace(/^mailto:/, '');
  return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

const LINE_KEYS = ['p1', 'p2', 'p3'] as const;

type HomeHeroProps = {
  className?: string;
  /** Off when the title is hoisted into its own frame section. */
  showTitle?: boolean;
};

export function HomeHero({ className, showTitle = true }: HomeHeroProps) {
  const t = useTranslations('home.intro');
  const tHome = useTranslations('home');
  const { settings } = useSiteContent();
  const desktopOs = useDesktopOsOptional();

  const linkedinUrl = settings.linkedin?.startsWith('http')
    ? settings.linkedin
    : `https://www.linkedin.com/${settings.linkedin || 'in/devadhathan/'}`;
  const githubUrl = settings.github?.startsWith('http')
    ? settings.github
    : `https://github.com/${settings.github ?? 'devadhathan'}`;
  const emailHref = `mailto:${settings.email || 'devadhathanmd18@gmail.com'}`;

  const richTags = {
    i: (chunks: ReactNode) => <em className="italic">{chunks}</em>,
    keep: (chunks: ReactNode) => <span className="home-hero__keep">{chunks}</span>,
    wordsmith: (chunks: ReactNode) => introLink('https://wordsmith.ai', chunks),
    nesoi: (chunks: ReactNode) => introLink('https://nesoi.ai', chunks),
    ditto: (chunks: ReactNode) => introLink('https://joinditto.in', chunks),
    finshots: (chunks: ReactNode) => introLink('https://finshots.in', chunks),
    linkedin: (chunks: ReactNode) => introLink(linkedinUrl, chunks),
    email: (chunks: ReactNode) => introLink(emailHref, chunks),
  };

  const socialLinks = [
    {
      label: 'Email',
      href: emailHref,
      icon: <Mail className="h-4 w-4" strokeWidth={1.2} />,
    },
    {
      label: 'LinkedIn',
      href: linkedinUrl,
      icon: <Linkedin className="h-4 w-4" strokeWidth={1.2} />,
    },
    {
      label: 'GitHub',
      href: githubUrl,
      icon: <Github className="h-4 w-4" strokeWidth={1.2} />,
    },
    {
      label: 'Medium',
      href: MEDIUM_PROFILE_URL,
      icon: <MediumLogo className="h-4 w-4" />,
    },
  ];

  return (
    <section className={cn('home-hero', className)} aria-label="About">
      {showTitle ? <HomeHeroTitle /> : null}

      <div
        className={cn('home-hero__grid', !SHOW_CATALYSTIC_CARD && 'home-hero__grid--solo')}
      >
        <article className="home-hero__about">
          <div className="home-hero__about-copy relative z-[2]">
            <div className="home-hero__identity">
              <h2 className="home-hero__identity-name">{t('name')}</h2>
            </div>

            <div className="home-hero__body">
              <div className="home-hero__body-text">
                {LINE_KEYS.map((key) => (
                  <p key={key} className="home-hero__p">
                    {t.rich(key, richTags)}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (desktopOs?.enabled) {
                    desktopOs.openWindow('about', { syncUrl: false });
                    return;
                  }
                  window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
                }}
                data-cuelume-hover="tick"
                data-cuelume-press
                data-cuelume-release
                className={cn(
                  'home-hero__more text-left text-[15px] font-medium text-muted-foreground underline decoration-muted-foreground/45 underline-offset-[3px] transition-colors hover:text-foreground/90 hover:decoration-foreground/55',
                  focusRing,
                )}
              >
                {t('moreAbout')}
              </button>
            </div>
          </div>

          <div className="home-hero__ascii relative z-[2]">
            <DevCardMedia />
          </div>

          <div className="home-hero__meta relative z-[2]">
            <div className="home-hero__socials">
              {socialLinks.map((link) => {
                const tooltip = socialTooltip(link.href);
                const isMail = link.href.startsWith('mailto:');
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener noreferrer'}
                    aria-label={`${link.label}: ${tooltip}`}
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    className="group/social home-hero__social"
                  >
                    <span className="flex items-center justify-center [&_svg]:shrink-0">
                      {link.icon}
                    </span>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-50 hidden whitespace-nowrap rounded-md border border-border/50 bg-popover px-2 py-1 text-[12px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/social:opacity-100 sm:block"
                    >
                      {tooltip}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </article>

        {SHOW_CATALYSTIC_CARD ? (
          <CardHoverGlow as="article" className="home-hero__connect !overflow-visible">
            <a
              href={CATALYSTIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="connect-findme relative z-[2] h-full min-h-0 text-inherit no-underline"
            >
              <div className="connect-findme__copy">
                <div className="home-hero__identity">
                  <span className="home-hero__identity-name inline-flex items-center gap-1">
                    {tHome('latestProjects.catalystic.title')}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                </div>
                <p className="home-card-desc max-w-[34ch] leading-[1.45] [text-wrap:balance]">
                  {tHome('latestProjects.catalystic.description')}
                </p>
              </div>
              <div className="connect-findme__stage">
                <div className="connect-findme__tilt">
                  <div className="connect-findme__panel connect-findme__panel--thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CATALYSTIC_THUMB}
                      alt=""
                      width={1951}
                      height={1080}
                      sizes="(max-width: 920px) 100vw, 720px"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </a>
          </CardHoverGlow>
        ) : null}
      </div>
    </section>
  );
}
