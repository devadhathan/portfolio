'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  HOME_CARD_BORDER,
  useCardHoverGlow,
} from '@/components/card-hover-glow';
import { CardTag } from '@/components/card-tag';
import { useSiteContent } from '@/components/site-content-provider';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { getProjectId, type Project } from '@/lib/types/project';
import { trackEvent } from '@/lib/analytics';
import { cn, focusRing } from '@/lib/utils';
import {
  HOME_INTRO_CARDS_DELAY,
  HOME_INTRO_LINE_DURATION,
} from '@/components/home-intro';

type CaseStudiesListProps = {
  onProjectSelect?: (projectId: string) => void;
  className?: string;
  /** Home shows featured only; archive stays on Work. */
  showArchive?: boolean;
  titleKey?: 'caseStudies' | 'selectedCaseStudies';
};

type ParsedPeriod = {
  year: number;
  month: number;
  sortKey: number;
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const CASE_STUDY_DATE_BY_ID: Record<string, { year: number; month: number }> = {
  'nesoi-ai-dashboard': { year: 2025, month: 11 },
  'falcon-design-system': { year: 2022, month: 4 },
  'finshots-news-app': { year: 2020, month: 9 },
  'onboarding-redesign': { year: 2022, month: 8 },
  'crm-redesign': { year: 2022, month: 10 },
};

function formatPeriodLabel(year: number, month: number): string {
  if (!year) return '—';
  const label = MONTH_LABELS[month - 1];
  return label ? `${label} ${year}` : String(year);
}

function parsePeriod(period?: string): ParsedPeriod {
  if (!period) {
    return { year: 0, month: 0, sortKey: 0 };
  }

  const years = [...period.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  const year = years.length ? years[years.length - 1] : 0;

  const monthMatches = [...period.toLowerCase().matchAll(/\b([a-z]+)\b/g)]
    .map((m) => MONTHS[m[1]])
    .filter((n): n is number => Boolean(n));
  const month = monthMatches.length ? monthMatches[monthMatches.length - 1] : 6;

  return {
    year,
    month,
    sortKey: year * 100 + month,
  };
}

type ListItem = {
  id: string;
  title: string;
  company?: string;
  year: number;
  dateLabel: string;
  sortKey: number;
  openWordsmith?: boolean;
  href?: string;
  subtitle?: string;
};

type FeaturedMedia = {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  /** Product UI layered on top of bg media. */
  overlay?: string;
  overlayType?: 'image' | 'video';
  overlayPoster?: string;
};

type FeaturedItem = ListItem & {
  media: FeaturedMedia;
};

const WORDSMITH_FEATURED: FeaturedItem = {
  id: 'wordsmith-ai',
  title: 'Wordsmith AI',
  year: 2026,
  dateLabel: formatPeriodLabel(2026, 6),
  sortKey: 2026 * 100 + 6,
  openWordsmith: true,
  href: 'https://www.wordsmith.ai/products/blueprints',
  subtitle: 'I designed experiences for legal AI.',
  media: {
    type: 'video',
    src: '/videos/wordsmith-thumb-bg-sm.mp4',
    poster: '/videos/wordsmith-thumb-bg-poster.webp',
    overlay: '/photos/wordsmith-preview.webp',
  },
};

const FEATURED_MEDIA: Record<
  string,
  FeaturedMedia & { subtitle: string; title?: string }
> = {
  'nesoi-ai-dashboard': {
    type: 'video',
    src: '/videos/nesoi-thumb.mp4',
    poster: '/videos/nesoi-poster.webp',
    subtitle: 'I redesigned how teams turn files into interactive learning.',
    title: 'Nesoi.ai',
  },
  'crm-redesign': {
    type: 'image',
    src: '/videos/crm-thumb-bg.webp',
    overlay: '/CRM/leads-thumb.mp4',
    overlayType: 'video',
    overlayPoster: '/CRM/image.webp',
    subtitle: 'We rebuilt leads and notes so agents could move faster.',
    title: 'CRM',
  },
};

const FEATURED_IDS = ['nesoi-ai-dashboard', 'crm-redesign'] as const;

function buildItems(projects: Project[]): { featured: FeaturedItem[]; archive: ListItem[] } {
  const parsed = projects
    .filter((project) => !/wordsmith/i.test(project.title))
    .map((project) => {
      const id = getProjectId(project.title);
      const meta = parsePeriod(project.period);
      const exact = CASE_STUDY_DATE_BY_ID[id];
      const year = exact?.year ?? meta.year;
      const month = exact?.month ?? meta.month;
      const company = project.company?.split(/\s*[&·]\s*|\s+Insurance\b/)[0]?.trim();
      const named = company
        ? project.title.toLowerCase().includes(company.toLowerCase())
        : true;
      const featuredMeta = FEATURED_MEDIA[id];
      return {
        id,
        title: featuredMeta?.title ?? project.title,
        company: named ? undefined : company,
        year,
        dateLabel: formatPeriodLabel(year, month),
        sortKey: year * 100 + month,
        subtitle: featuredMeta?.subtitle ?? project.cardSubtext,
        media: featuredMeta
          ? {
              type: featuredMeta.type,
              src: featuredMeta.src,
              poster: featuredMeta.poster,
              overlay: featuredMeta.overlay,
              overlayType: featuredMeta.overlayType,
              overlayPoster: featuredMeta.overlayPoster,
            }
          : undefined,
      };
    });

  parsed.sort((a, b) => b.sortKey - a.sortKey || a.title.localeCompare(b.title));

  const featuredFromProjects = FEATURED_IDS.map((id) => parsed.find((p) => p.id === id)).filter(
    (p): p is (typeof parsed)[number] & { media: NonNullable<(typeof parsed)[number]['media']> } =>
      Boolean(p?.media),
  );

  const featured: FeaturedItem[] = [WORDSMITH_FEATURED, ...featuredFromProjects];
  const featuredIdSet = new Set(featured.map((f) => f.id));
  const archive = parsed.filter((p) => !featuredIdSet.has(p.id));

  return { featured, archive };
}

export function getHomeAfterCaseStudiesDelay(_itemCount?: number) {
  return HOME_INTRO_CARDS_DELAY + HOME_INTRO_LINE_DURATION * 0.25;
}

/** Cap concurrent home thumb loops so mobile doesn’t decode 3 videos at once. */
const playingFeatured = new Set<HTMLVideoElement>();

/**
 * Session-stable video nodes keyed by src. React remounts used to recreate
 * `<video>` and restart from 0 — reattach the same element instead.
 * Refcounted; idle unused entries are disposed to free decode buffers.
 */
type PooledVideo = { el: HTMLVideoElement; users: number };
const featuredVideoPool = new Map<string, PooledVideo>();
let poolDisposeTimer = 0;
const POOL_IDLE_MS = 45_000;

function disposeIdlePoolEntries() {
  poolDisposeTimer = 0;
  for (const [src, entry] of featuredVideoPool) {
    if (entry.users > 0 || entry.el.isConnected) continue;
    releaseFeatured(entry.el);
    entry.el.removeAttribute('src');
    entry.el.load();
    featuredVideoPool.delete(src);
  }
}

function schedulePoolDispose() {
  if (poolDisposeTimer) window.clearTimeout(poolDisposeTimer);
  poolDisposeTimer = window.setTimeout(disposeIdlePoolEntries, POOL_IDLE_MS);
}

let featuredPoolPagehideBound = false;
if (typeof window !== 'undefined' && !featuredPoolPagehideBound) {
  featuredPoolPagehideBound = true;
  window.addEventListener('pagehide', () => {
    if (poolDisposeTimer) window.clearTimeout(poolDisposeTimer);
    for (const [, entry] of featuredVideoPool) {
      releaseFeatured(entry.el);
      entry.el.removeAttribute('src');
      entry.el.load();
    }
    featuredVideoPool.clear();
  });
}

function acquireFeaturedVideo(src: string, poster?: string): HTMLVideoElement {
  let entry = featuredVideoPool.get(src);
  if (!entry) {
    const el = document.createElement('video');
    el.src = src;
    el.muted = true;
    el.defaultMuted = true;
    el.loop = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    el.preload = 'none';
    el.setAttribute('aria-hidden', 'true');
    if (poster) el.poster = poster;
    entry = { el, users: 0 };
    featuredVideoPool.set(src, entry);
  } else if (poster && !entry.el.poster) {
    entry.el.poster = poster;
  }
  entry.users += 1;
  return entry.el;
}

function releasePooledVideo(src: string) {
  const entry = featuredVideoPool.get(src);
  if (!entry) return;
  entry.users = Math.max(0, entry.users - 1);
  if (entry.users === 0) schedulePoolDispose();
}

function featuredPlayBudget(): number {
  if (typeof window === 'undefined') return 1;
  // Phones: posters only — decoding looping video thumbs tanks Lighthouse / battery.
  if (window.matchMedia('(max-width: 1023px)').matches) return 0;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  try {
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
      return 0;
    }
  } catch {
    /* ignore */
  }
  return 2;
}

function tryPlayFeatured(el: HTMLVideoElement) {
  if (playingFeatured.has(el)) {
    if (el.paused) void el.play().catch(() => {});
    return;
  }
  if (playingFeatured.size >= featuredPlayBudget()) return;
  playingFeatured.add(el);
  void el.play().catch(() => {
    playingFeatured.delete(el);
  });
}

function releaseFeatured(el: HTMLVideoElement) {
  if (!playingFeatured.has(el)) return;
  playingFeatured.delete(el);
  el.pause();
  // Do not reset currentTime — resume from the same frame when visible again.
}

/** Autoplay only while on-screen — keeps Home from decoding 3 heavy loops at once. */
function FeaturedVideo({
  src,
  poster,
  className,
  priority = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  /** First featured card — SSR poster so LCP can start before JS. */
  priority?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const el = acquireFeaturedVideo(src, poster);
    if (className) el.className = className;
    // Only start network once the card is (or will be) on screen.
    el.preload = 'metadata';
    host.appendChild(el);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (featuredPlayBudget() <= 0) return;
          if (el.preload !== 'auto') el.preload = 'auto';
          tryPlayFeatured(el);
        } else if (el.isConnected) {
          // Only pause when truly off-screen — not when React detaches for remount.
          releaseFeatured(el);
        }
      },
      { rootMargin: '40px 0px', threshold: 0.15 },
    );
    io.observe(el);

    if (el.isConnected && (el.readyState >= 2 || el.currentTime > 0)) {
      tryPlayFeatured(el);
    }

    return () => {
      io.disconnect();
      releaseFeatured(el);
      if (el.parentNode === host) host.removeChild(el);
      releasePooledVideo(src);
    };
  }, [src, poster, className]);

  // Poster paints on SSR for LCP; video layers on top after hydrate.
  return (
    <div ref={hostRef} className="absolute inset-0" aria-hidden>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            className,
          )}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
        />
      ) : null}
    </div>
  );
}
function FeaturedThumb({
  item,
  reduceMotion,
  onSelect,
  size = 'default',
}: {
  item: FeaturedItem;
  reduceMotion: boolean | null;
  onSelect: () => void;
  size?: 'hero' | 'default';
}) {
  const isHero = size === 'hero';
  const { glow, glowHandlers } = useCardHoverGlow();
  // SSR + mobile: posters only (avoids decoding multiple looping MP4s on phones).
  const [allowLoopVideo, setAllowLoopVideo] = useState(false);
  useEffect(() => {
    setAllowLoopVideo(featuredPlayBudget() > 0);
  }, []);
  const showVideo = item.media.type === 'video' && reduceMotion !== true && allowLoopVideo;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-cuelume-hover="tick"
      data-cuelume-press
      data-cuelume-release
      data-cuelume-card-hover
      {...glowHandlers}
      className={cn(
        'case-study-feature group relative flex h-full w-full flex-col overflow-hidden bg-transparent text-left',
        HOME_CARD_BORDER,
        isHero && 'case-study-feature--hero',
        focusRing,
      )}
    >
      {glow}
      <div
        className={cn(
          'case-study-feature__media relative z-[2] w-full overflow-hidden bg-transparent',
          // Mobile / tablet: same aspect as sibling cards. Desktop hero fills the tall cell.
          isHero
            ? 'aspect-[16/10] lg:aspect-auto lg:min-h-0 lg:flex-1 lg:h-full'
            : 'aspect-[16/10]',
        )}
      >
        {showVideo ? (
          <FeaturedVideo
            className="case-study-feature__asset absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
            src={item.media.src}
            poster={item.media.poster}
            priority={isHero}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.media.type === 'video' ? item.media.poster || item.media.src : item.media.src}
            alt=""
            className="case-study-feature__asset absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
            loading={isHero ? 'eager' : 'lazy'}
            fetchPriority={isHero ? 'high' : 'auto'}
            decoding="async"
            draggable={false}
          />
        )}
        {item.media.overlay ? (
          <div
            className={cn(
              'pointer-events-none absolute z-[1] transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]',
              item.openWordsmith
                ? 'inset-y-[11%] left-[16%] right-0 group-hover:translate-x-0.5'
                : 'inset-y-[8%] left-1/2 w-[82%] -translate-x-1/2 sm:w-[78%]',
            )}
          >
            <div
              className={cn(
                'h-full w-full overflow-hidden rounded-none',
                item.openWordsmith
                  ? 'border border-r-0 border-white/30 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.28)]'
                  : 'shadow-[0_10px_28px_rgba(0,0,0,0.22)]',
              )}
            >
              {item.media.overlayType === 'video' && reduceMotion !== true && allowLoopVideo ? (
                <FeaturedVideo
                  className="h-full w-full object-cover object-left-top"
                  src={item.media.overlay}
                  poster={item.media.overlayPoster}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    item.media.overlayType === 'video'
                      ? item.media.overlayPoster || item.media.overlay
                      : item.media.overlay
                  }
                  alt=""
                  className="h-full w-full object-cover object-left-top"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
      </div>
      <div
        className={cn(
          'relative z-[2] flex shrink-0 flex-col gap-1.5 px-3.5 py-3.5 sm:px-4 sm:py-4',
          isHero && 'sm:px-5 sm:py-5',
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={cn(
                'font-medium tracking-tight text-foreground',
                isHero ? 'text-[15px] sm:text-base' : 'text-[14px] sm:text-[15px]',
              )}
            >
              {item.title}
            </span>
            {item.openWordsmith ? (
              <>
                <CardTag tone="orange" className="normal-case tracking-normal">
                  New
                </CardTag>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground/80"
                  aria-hidden
                />
              </>
            ) : null}
          </div>
          {item.dateLabel && item.dateLabel !== '—' ? (
            <span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-muted-foreground sm:text-[13px]">
              {item.dateLabel}
            </span>
          ) : null}
        </div>
        {item.subtitle ? (
          <p
            className={cn(
              'text-muted-foreground',
              isHero
                ? 'line-clamp-3 text-[13px] leading-5 sm:text-[14px] sm:leading-6'
                : 'line-clamp-2 text-[12px] leading-5 sm:text-[13px] sm:leading-5',
            )}
          >
            {item.subtitle}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function CaseStudiesList({
  onProjectSelect,
  className,
  showArchive = false,
  titleKey = 'selectedCaseStudies',
}: CaseStudiesListProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const { projects } = useSiteContent();
  const desktopOs = useDesktopOsOptional();
  const reduceMotion = useReducedMotion();

  const { featured, archive } = useMemo(() => buildItems(projects), [projects]);

  if (featured.length === 0 && (!showArchive || archive.length === 0)) return null;

  const handleSelect = (item: ListItem) => {
    if (item.openWordsmith) {
      trackEvent('outbound_link', { destination: 'wordsmith' });
      if (desktopOs?.enabled) {
        desktopOs.openWindow('wordsmith', { syncUrl: false });
        return;
      }
      if (item.href) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    onProjectSelect?.(item.id);
  };

  const title = t(titleKey);

  const openAllWork = () => {
    trackEvent('nav_click', { destination: 'work', surface: 'home_selected_work' });
    if (desktopOs?.enabled) {
      desktopOs.openWindow('work', { syncUrl: true });
      return;
    }
    router.push('/work');
  };

  return (
    <section className={cn('os-col w-full', className)} aria-label={title}>
      <div className="mb-5 flex items-baseline justify-between gap-3 sm:mb-6">
        <h2 className="text-[15px] font-medium text-muted-foreground sm:text-base">
          {title}
        </h2>
        <button
          type="button"
          onClick={openAllWork}
          data-cuelume-hover="tick"
          data-cuelume-press
          data-cuelume-release
          className={cn(
            'shrink-0 font-mono text-[13px] font-normal text-muted-foreground underline decoration-muted-foreground/50 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/60 sm:text-sm',
            focusRing,
          )}
        >
          {t('allWork')}
        </button>
      </div>

      <div className="case-study-bento grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-[minmax(11.5rem,1fr)_minmax(11.5rem,1fr)] lg:gap-4">
        {featured.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'min-h-0',
              /* Hero (Wordsmith) — tall left column, not 2/3 width */
              index === 0 && 'sm:col-span-2 lg:col-span-1 lg:row-span-2',
            )}
          >
            <FeaturedThumb
              item={item}
              reduceMotion={reduceMotion}
              onSelect={() => handleSelect(item)}
              size={index === 0 ? 'hero' : 'default'}
            />
          </div>
        ))}
      </div>

      {showArchive && archive.length > 0 ? (
        <ul className="case-study-rail mt-6 flex flex-col sm:mt-7">
          {archive.map((item) => (
            <li
              key={item.id}
              className="case-study-rail__row border-b border-border/40 py-2 last:border-b-0 sm:py-2.5"
            >
              <button
                type="button"
                onClick={() => handleSelect(item)}
                data-cuelume-hover="tick"
                data-cuelume-press
                data-cuelume-release
                className={cn(
                  'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 text-left sm:gap-x-5',
                  focusRing,
                )}
              >
                <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5">
                  {item.company ? (
                    <span className="text-[14px] font-medium text-foreground transition-colors group-hover:text-foreground/80 sm:text-[15px]">
                      {item.company}
                    </span>
                  ) : null}
                  <span className="text-[14px] font-medium text-foreground transition-colors group-hover:text-foreground/80 sm:text-[15px]">
                    {item.title}
                  </span>
                </span>
                <span className="whitespace-nowrap text-right text-[13px] tabular-nums text-muted-foreground sm:text-sm">
                  {item.dateLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
