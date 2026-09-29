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
import { HomeHeroTitle } from '@/components/home-hero-title';
import { cn } from '@/lib/utils';

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

const LINE_KEYS = ['p1'] as const;

type HomeHeroProps = {
  className?: string;
  /** Off when the title is hoisted into its own frame section. */
  showTitle?: boolean;
};

export function HomeHero({ className, showTitle = true }: HomeHeroProps) {
  const t = useTranslations('home.intro');
  const tHome = useTranslations('home');
  const { settings } = useSiteContent();

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

      <div className="home-hero__grid">
        <CardHoverGlow as="article" className="home-hero__about">
          <div className="home-hero__about-copy relative z-[2]">
            <div className="home-hero__identity">
              <span className="min-w-0">
                <span className="home-hero__identity-name">{t('name')}</span>
                <span className="home-hero__identity-role">{t('role')}</span>
              </span>
            </div>

            <div className="home-hero__body">
              {LINE_KEYS.map((key) => (
                <p key={key} className="home-hero__p">
                  {t.rich(key, richTags)}
                </p>
              ))}
            </div>

            <div className="home-hero__meta">
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
                      {/*
                        Above the icon and left-aligned to it. The card clips its
                        children, and this row is pinned to the bottom of the
                        copy column (margin-top: auto), so anything below the
                        icon lands outside the card. Centring it ran off the left
                        edge for the same reason. Upwards there is body copy to
                        sit over, and rightwards there is card to grow into.
                      */}
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
          </div>

          <div className="home-hero__ascii relative z-[2]">
            <DevCardMedia />
          </div>
        </CardHoverGlow>

        <CardHoverGlow as="article" className="home-hero__connect !overflow-visible">
          <a
            href={CATALYSTIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="connect-findme relative z-[2] h-full min-h-0 text-inherit no-underline"
          >
            <div className="connect-findme__copy">
              <div className="home-hero__identity">
                <span className="min-w-0">
                  <span className="home-hero__identity-name inline-flex items-center gap-1">
                    {tHome('latestProjects.catalystic.title')}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 shrink-0 text-foreground/70"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                  <span className="home-hero__identity-role">{tHome('sideProject.label')}</span>
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
      </div>
    </section>
  );
}
