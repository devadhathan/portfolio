'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSiteContent } from '@/components/site-content-provider';
import { easeOutExpo } from '@/lib/motion';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const UPDATED_CACHE_KEY = 'portfolio-home-updated-label';

function formatUpdatedLabel(date: Date) {
  return `Updated ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function readCachedUpdatedLabel() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(UPDATED_CACHE_KEY);
  } catch {
    return null;
  }
}

function useUpdatedLabel(fallback: string) {
  const [label, setLabel] = useState(() => readCachedUpdatedLabel() ?? fallback);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/last-updated', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.lastUpdatedDate) return;
        const parsed = new Date(data.lastUpdatedDate);
        if (Number.isNaN(parsed.getTime())) return;
        const next = formatUpdatedLabel(parsed);
        setLabel(next);
        try {
          window.sessionStorage.setItem(UPDATED_CACHE_KEY, next);
        } catch {
          /* ignore */
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return label;
}

/** Start staggered enter only after paint so delays aren’t burned during chunk load. */
export function useHomeIntroPlay(reduceMotion: boolean | null) {
  const [play, setPlay] = useState(() => Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) {
      setPlay(true);
      return;
    }
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setPlay(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [reduceMotion]);

  return play;
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

const LINE_KEYS = ['p1', 'p2', 'p3', 'p4'] as const;

export const HOME_INTRO_LINE_STAGGER = 0.07;
export const HOME_INTRO_LINE_DURATION = 0.38;

/** Seconds until the last intro line finishes — used to delay following home content. */
export const HOME_INTRO_CARDS_DELAY =
  (1 + LINE_KEYS.length) * HOME_INTRO_LINE_STAGGER + HOME_INTRO_LINE_DURATION * 0.25;

type HomeIntroProps = {
  className?: string;
};

export function HomeIntro({ className }: HomeIntroProps) {
  const t = useTranslations('home.intro');
  const { settings } = useSiteContent();
  const reduceMotion = useReducedMotion();
  const play = useHomeIntroPlay(reduceMotion);
  const updatedLabel = useUpdatedLabel(t('updatedFallback'));

  const linkedinUrl = settings.linkedin?.startsWith('http')
    ? settings.linkedin
    : `https://www.linkedin.com/${settings.linkedin || 'in/devadhathan/'}`;
  const emailHref = `mailto:${settings.email || 'devadhathanmd18@gmail.com'}`;

  const richTags = {
    i: (chunks: ReactNode) => <em className="italic">{chunks}</em>,
    wordsmith: (chunks: ReactNode) => introLink('https://wordsmith.ai', chunks),
    nesoi: (chunks: ReactNode) => introLink('https://nesoi.ai', chunks),
    ditto: (chunks: ReactNode) => introLink('https://joinditto.in', chunks),
    finshots: (chunks: ReactNode) => introLink('https://finshots.in', chunks),
    x: (chunks: ReactNode) => introLink('https://x.com/mddevadhathan', chunks),
    linkedin: (chunks: ReactNode) => introLink(linkedinUrl, chunks),
    email: (chunks: ReactNode) => (
      <a
        href={emailHref}
        className="text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground"
      >
        {chunks}
      </a>
    ),
  };

  const lines: { key: string; content: ReactNode }[] = [
    {
      key: 'header',
      content: (
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-[1.2rem] font-medium tracking-tight text-foreground sm:text-[1.35rem] md:text-[1.5rem]">
            {t('name')}
          </h1>
          <p className="min-h-[1.25rem] text-[12px] text-muted-foreground transition-opacity duration-200 sm:text-[13px]">
            {updatedLabel}
          </p>
        </div>
      ),
    },
    ...LINE_KEYS.map((key) => ({
      key,
      content: (
        <p className="text-[14px] leading-[1.65] text-foreground/90 sm:text-[15px] sm:leading-[1.7] md:text-[16px] md:leading-[1.75]">
          {t.rich(key, richTags)}
        </p>
      ),
    })),
  ];

  const hidden = { opacity: 0, y: 8 };
  const shown = { opacity: 1, y: 0 };

  return (
    <header className={cn('home-intro max-w-[40rem] w-full pt-4 sm:pt-6 md:pt-8 lg:pt-10', className)}>
      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
        {lines.map((line, index) => (
          <motion.div
            key={line.key}
            className={index === 0 ? 'mb-1 sm:mb-2 md:mb-3' : undefined}
            initial={reduceMotion ? false : hidden}
            animate={reduceMotion || play ? shown : hidden}
            transition={{
              duration: reduceMotion ? 0 : HOME_INTRO_LINE_DURATION,
              delay: reduceMotion || !play ? 0 : index * HOME_INTRO_LINE_STAGGER,
              ease: easeOutExpo,
            }}
          >
            {line.content}
          </motion.div>
        ))}
      </div>
    </header>
  );
}
