'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LineIllustration, type LineIllustrationId } from '@/components/line-illustrations';
import type { CoverMedia } from '@/lib/gen-ui-covers';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type GenUIResearchCardProps = {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  cover: CoverMedia;
  illustration?: LineIllustrationId;
  statValue?: string;
  icon?: string;
  chartBars?: { label: string; value: number; displayValue: string; color?: string }[];
  skills?: string[];
  className?: string;
};

function ChartCover({
  bars,
  active,
}: {
  bars: NonNullable<GenUIResearchCardProps['chartBars']>;
  active: boolean;
}) {
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="flex h-full w-full flex-col justify-end gap-2.5 px-5 pb-5 pt-4">
      {bars.map((bar, i) => (
        <div key={bar.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="truncate">{bar.label}</span>
            <span className="font-medium text-foreground/80 tabular-nums">{bar.displayValue}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background/40">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: active ? `${(bar.value / maxVal) * 100}%` : '0%',
                transitionDelay: `${i * 80}ms`,
                background: bar.color || 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsCover({ skills, active }: { skills: string[]; active: boolean }) {
  return (
    <div className="flex h-full w-full flex-wrap content-center gap-1.5 p-4">
      {skills.slice(0, 10).map((skill, i) => (
        <span
          key={skill}
          className="rounded-full border border-border/50 bg-background/40 px-2.5 py-1 text-[11px] text-foreground/85 transition-all duration-300"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(6px)',
            transitionDelay: `${i * 40}ms`,
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function CoverVisual({
  cover,
  illustration,
  statValue,
  icon,
  title,
  interactive,
  chartBars,
  skills,
  hovered,
}: Pick<GenUIResearchCardProps, 'cover' | 'illustration' | 'statValue' | 'icon' | 'title' | 'chartBars' | 'skills'> & {
  interactive?: boolean;
  hovered?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMedia = !!cover.src;

  const handleEnter = () => {
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {});
  };

  const handleLeave = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  if (chartBars && chartBars.length > 0) {
    return (
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br',
          cover.gradient,
        )}
      >
        <ChartCover bars={chartBars} active={!interactive || !!hovered} />
      </div>
    );
  }

  if (skills && skills.length > 0) {
    return (
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br',
          cover.gradient,
        )}
      >
        <SkillsCover skills={skills} active={!interactive || !!hovered} />
      </div>
    );
  }

  if (hasMedia) {
    return (
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/25"
        onMouseEnter={cover.isVideo ? handleEnter : undefined}
        onMouseLeave={cover.isVideo ? handleLeave : undefined}
      >
        {cover.isVideo ? (
          <video
            ref={videoRef}
            src={cover.src}
            poster={cover.poster}
            muted
            playsInline
            loop
            preload="metadata"
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out',
              interactive && 'group-hover:scale-[1.04]',
            )}
            aria-label={title}
          />
        ) : (
          <img
            src={cover.src}
            alt=""
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out',
              interactive && 'group-hover:scale-[1.04]',
            )}
            loading="lazy"
          />
        )}
        {interactive && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
      </div>
    );
  }

  let inner: ReactNode = null;

  if (statValue) {
    inner = (
      <p className={cn(
        'text-4xl md:text-5xl font-semibold tracking-tight text-foreground/90 tabular-nums transition-transform duration-500',
        interactive && 'group-hover:scale-110',
      )}>
        {statValue}
      </p>
    );
  } else if (illustration) {
    inner = (
      <div className="w-full max-w-[65%] text-foreground/75 transition-transform duration-500 group-hover:scale-105">
        <LineIllustration id={illustration} className="aspect-square max-h-none" />
      </div>
    );
  } else if (icon) {
    inner = <span className="text-5xl md:text-6xl select-none transition-transform duration-500 group-hover:scale-110">{icon}</span>;
  } else {
    inner = (
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-foreground/15 bg-background/30">
        <span className="text-3xl font-light text-foreground/60">{title.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br',
        cover.gradient,
      )}
    >
      {inner}
    </div>
  );
}

export function GenUIResearchCard({
  title,
  description,
  meta,
  href,
  cover,
  illustration,
  statValue,
  icon,
  chartBars,
  skills,
  className,
}: GenUIResearchCardProps) {
  const interactive = true;
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  const showInteractive = revealed || hovered;

  const inner = (
    <>
      <CoverVisual
        cover={cover}
        illustration={illustration}
        statValue={statValue}
        icon={icon}
        title={title}
        chartBars={chartBars}
        skills={skills}
        interactive={interactive}
        hovered={showInteractive}
      />
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base md:text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {href && (
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:border-primary/40 group-hover:bg-primary/10">
              <ArrowUpRight className="h-4 w-4 text-foreground group-hover:text-primary" />
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-line">{description}</p>
        )}
        {meta && (
          <p className="text-xs text-muted-foreground/75 pt-0.5">{meta}</p>
        )}
      </div>
    </>
  );

  const shellClass = cn(
    'group flex h-full w-full max-w-[380px] flex-col rounded-2xl border border-border/45 bg-card/25 p-3.5 md:p-4',
    'transition-all duration-300 ease-out',
    'hover:border-border/70 hover:bg-card/40 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] hover:-translate-y-1',
    href && 'cursor-pointer',
    className,
  );

  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href) {
    return (
      <Link href={href} className={cn(shellClass, 'no-underline')} {...hoverHandlers}>
        {inner}
      </Link>
    );
  }

  return <article className={shellClass} {...hoverHandlers}>{inner}</article>;
}
