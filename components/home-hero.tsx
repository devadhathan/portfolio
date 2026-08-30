'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Briefcase, Github, Globe, Lightbulb, Linkedin, Mail } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { CardHoverGlow } from '@/components/card-hover-glow';
import { ConnectMiniPost } from '@/components/connect-mini-post';
import { MediumLogo } from '@/components/medium-logo';
import { CATALYSTIC_URL, MEDIUM_PROFILE_URL } from '@/lib/social-links';
import { useSiteContent } from '@/components/site-content-provider';
import { cn } from '@/lib/utils';

const ASCII_PREVIEW_SRC = '/videos/ascii-preview.mp4';
const ASCII_PREVIEW_POSTER = '/videos/ascii-preview-poster.webp';
/** Light theme — static portrait instead of the ASCII loop. */
const LIGHT_PORTRAIT_SRC = '/photos/case-study-bg/me-with-floor-white.png';
const AVATAR_SRC = '/photos/sideprojects/avatar-face.jpg';

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

/** Poster-first; plays when visible (including mobile — muted + playsInline). */
function DeferredAsciiPreview({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    if (reducedMotion || saveData) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload === 'none') video.preload = 'auto';
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '48px', threshold: 0.15 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      src={ASCII_PREVIEW_SRC}
      poster={ASCII_PREVIEW_POSTER}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="ASCII magic preview"
    />
  );
}

function LightPortrait({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LIGHT_PORTRAIT_SRC}
      alt="Portrait of Dev"
      className={className}
      decoding="async"
      loading="lazy"
      draggable={false}
    />
  );
}

const LINE_KEYS = ['p1'] as const;

type HomeHeroProps = {
  className?: string;
  /** Off when the title is hoisted into its own frame section. */
  showTitle?: boolean;
};

/** Rendered as its own frame section so the section padding sets the gap below it. */
export function HomeHeroTitle({ className }: { className?: string }) {
  const tHome = useTranslations('home');

  return (
    <h1 className={cn('home-hero__title tracking-tight text-foreground', className)}>
      {tHome('heroLine1')}
    </h1>
  );
}

export function HomeHero({ className, showTitle = true }: HomeHeroProps) {
  const t = useTranslations('home.intro');
  const tHome = useTranslations('home');
  const { settings } = useSiteContent();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const useLightPortrait = mounted && resolvedTheme === 'light';

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
  };

  const socialLinks = [
    {
      label: 'Email',
      href: emailHref,
      icon: <Mail className="h-4 w-4" />,
    },
    {
      label: 'LinkedIn',
      href: linkedinUrl,
      icon: <Linkedin className="h-4 w-4" />,
    },
    {
      label: 'GitHub',
      href: githubUrl,
      icon: <Github className="h-4 w-4" />,
    },
    {
      label: 'Medium',
      href: MEDIUM_PROFILE_URL,
      icon: <MediumLogo className="h-4 w-4" />,
    },
    {
      label: 'Catalystic UI',
      href: CATALYSTIC_URL,
      icon: <Lightbulb className="h-4 w-4" />,
    },
  ];

  return (
    <section className={cn('home-hero', className)} aria-label="About">
      {showTitle ? <HomeHeroTitle /> : null}

      <div className="home-hero__grid">
        <CardHoverGlow as="article" className="home-hero__about">
          <div className="home-hero__about-copy relative z-[2]">
            <div className="home-hero__identity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATAR_SRC}
                alt={t('name')}
                width={44}
                height={44}
                decoding="async"
                className="home-hero__avatar"
              />
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

            <ul className="home-hero__meta">
              <li>
                <Globe className="h-4 w-4 shrink-0" aria-hidden />
                <span>{tHome('basedIn')}</span>
              </li>
              <li className="home-hero__meta-available">
                <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
                <span>{tHome('available')}</span>
              </li>
            </ul>
          </div>

          <div className="home-hero__ascii relative z-[2]">
            {useLightPortrait ? (
              <LightPortrait className="home-hero__ascii-video home-hero__ascii-portrait" />
            ) : (
              <DeferredAsciiPreview className="home-hero__ascii-video" />
            )}
          </div>
        </CardHoverGlow>

        <CardHoverGlow as="article" className="home-hero__connect">
          <div className="relative z-[2] h-full min-h-0">
            <ConnectMiniPost
              title={tHome('connectPost.title')}
              body={tHome('connectPost.body')}
              socialLinks={socialLinks}
              flushMedia
              className="home-hero__connect-inner min-h-0 sm:min-h-0 h-full"
            />
          </div>
        </CardHoverGlow>
      </div>
    </section>
  );
}
