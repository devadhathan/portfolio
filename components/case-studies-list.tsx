'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSiteContent } from '@/components/site-content-provider';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import {
  HOME_INTRO_CARDS_DELAY,
  HOME_INTRO_LINE_DURATION,
  useHomeIntroPlay,
} from '@/components/home-intro';
import { getProjectId, type Project } from '@/lib/types/project';
import { easeOutExpo } from '@/lib/motion';
import { cn, focusRing } from '@/lib/utils';

type CaseStudiesListProps = {
  onProjectSelect?: (projectId: string) => void;
  className?: string;
};

type ParsedPeriod = {
  year: number;
  /** DD/MM label, Benji-style */
  dateLabel: string;
  sortKey: number;
};

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

function parsePeriod(period?: string): ParsedPeriod {
  if (!period) {
    return { year: 0, dateLabel: '—', sortKey: 0 };
  }

  const years = [...period.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  const year = years.length ? years[years.length - 1] : 0;

  const monthMatches = [...period.toLowerCase().matchAll(/\b([a-z]+)\b/g)]
    .map((m) => MONTHS[m[1]])
    .filter((n): n is number => Boolean(n));
  const month = monthMatches.length ? monthMatches[monthMatches.length - 1] : 6;

  const day = 1;
  const dateLabel =
    year > 0
      ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
      : '—';

  return {
    year,
    dateLabel,
    sortKey: year * 100 + month,
  };
}

type ListItem = {
  id: string;
  title: string;
  year: number;
  dateLabel: string;
  sortKey: number;
  /** Opens Wordsmith OS window when Desktop OS is on. */
  openWordsmith?: boolean;
  href?: string;
};

const WORDSMITH_ITEM: ListItem = {
  id: 'wordsmith-ai',
  title: 'Wordsmith AI',
  year: 2026,
  dateLabel: '01/06',
  sortKey: 2026 * 100 + 6,
  openWordsmith: true,
  href: 'https://www.wordsmith.ai/products/blueprints',
};

function buildItems(projects: Project[]): ListItem[] {
  const parsed = projects
    .filter((project) => !/wordsmith/i.test(project.title))
    .map((project) => {
      const meta = parsePeriod(project.period);
      return {
        id: getProjectId(project.title),
        title: project.title,
        year: meta.year,
        dateLabel: meta.dateLabel,
        sortKey: meta.sortKey,
      };
    });

  parsed.sort((a, b) => b.sortKey - a.sortKey || a.title.localeCompare(b.title));
  return [WORDSMITH_ITEM, ...parsed];
}

/** Delay until the case-studies block animation completes. */
export function getHomeAfterCaseStudiesDelay(_itemCount?: number) {
  return HOME_INTRO_CARDS_DELAY + HOME_INTRO_LINE_DURATION * 0.25;
}

export function CaseStudiesList({ onProjectSelect, className }: CaseStudiesListProps) {
  const t = useTranslations('nav');
  const { projects } = useSiteContent();
  const desktopOs = useDesktopOsOptional();
  const reduceMotion = useReducedMotion();
  const play = useHomeIntroPlay(reduceMotion);

  const items = useMemo(() => buildItems(projects), [projects]);

  const rows = useMemo(() => {
    const out: { year: number | null; item: ListItem }[] = [];
    let lastYear: number | null = null;
    for (const item of items) {
      const showYear = item.year !== lastYear;
      out.push({ year: showYear ? item.year : null, item });
      lastYear = item.year;
    }
    return out;
  }, [items]);

  if (items.length === 0) return null;

  const handleSelect = (item: ListItem) => {
    if (item.openWordsmith) {
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

  const blockTransition = {
    duration: reduceMotion ? 0 : HOME_INTRO_LINE_DURATION,
    delay: reduceMotion || !play ? 0 : HOME_INTRO_CARDS_DELAY,
    ease: easeOutExpo,
  };

  const hidden = { opacity: 0, y: 8 };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.section
      className={cn('os-col w-full', className)}
      aria-label={t('caseStudies')}
      initial={reduceMotion ? false : hidden}
      animate={reduceMotion || play ? shown : hidden}
      transition={blockTransition}
    >
      <h2 className="mb-5 text-[15px] font-medium text-muted-foreground sm:mb-6 sm:text-base">
        {t('caseStudies')}
      </h2>
      <ul className="flex flex-col gap-4 sm:gap-5">
        {rows.map(({ year, item }) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleSelect(item)}
              className={cn(
                'group grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 text-left sm:grid-cols-[3.75rem_minmax(0,1fr)_auto] sm:gap-x-5',
                focusRing,
              )}
            >
              <span className="text-[13px] tabular-nums text-muted-foreground sm:text-sm">
                {year && year > 0 ? year : ''}
              </span>
              <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="text-[14px] font-medium text-foreground transition-colors group-hover:text-foreground/80 sm:text-[15px]">
                  {item.title}
                </span>
                {item.openWordsmith ? (
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground/80"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="text-[13px] tabular-nums text-muted-foreground sm:text-sm">
                {item.dateLabel}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
