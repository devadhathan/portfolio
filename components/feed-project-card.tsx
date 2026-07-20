'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardTag } from '@/components/card-tag';

type FeedProjectCardProps = {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  tags?: string[];
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

export function FeedProjectCard({
  title,
  subtitle,
  statusLabel,
  tags,
  icon,
  href,
  onClick,
  footer,
  className,
  bodyClassName,
  children,
}: FeedProjectCardProps) {
  const HeaderTag = href ? 'a' : onClick ? 'button' : 'div';
  const headerProps = href
    ? { href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : onClick
      ? { type: 'button' as const, onClick }
      : {};

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-border/40 dark:bg-[#1B1917]',
        className,
      )}
    >
      <HeaderTag
        {...headerProps}
        className={cn(
          'flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5 text-left dark:border-white/[0.06]',
          (href || onClick) && 'transition-colors hover:bg-secondary/20',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border/50 bg-secondary/30 text-foreground/70">
              {icon}
            </div>
          ) : null}
          <span className="truncate text-[13px] font-medium tracking-tight text-foreground">{title}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      </HeaderTag>

      <div
        className={cn(
          'flex min-h-[180px] flex-1 items-center justify-center bg-secondary/8 p-4 dark:bg-white/[0.02] sm:min-h-[200px] sm:p-5',
          bodyClassName,
        )}
      >
        {children}
      </div>

      {(subtitle || statusLabel || tags?.length || footer) && (
        <div className="space-y-2 border-t border-border/35 px-3.5 py-3 dark:border-white/[0.05]">
          {statusLabel ? (
            <CardTag className="border-primary/25 bg-primary/10 text-primary">{statusLabel}</CardTag>
          ) : null}
          {subtitle ? <p className="text-[12px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <CardTag key={tag}>{tag}</CardTag>
              ))}
            </div>
          ) : null}
          {footer}
        </div>
      )}
    </article>
  );
}

type PhoneFrameProps = {
  children: React.ReactNode;
  aspectRatio?: string;
  className?: string;
  maxWidth?: number;
};

export function PhoneFrame({
  children,
  aspectRatio = '9 / 19.5',
  className,
  maxWidth = 168,
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.35rem] border-[5px] border-foreground/[0.08] bg-black shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
        className,
      )}
      style={{
        aspectRatio,
        width: `min(100%, ${maxWidth}px)`,
      }}
    >
      {children}
    </div>
  );
}
