'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatSiteUpdateDate(date: Date) {
  return `${date.getDate()}/${MONTHS[date.getMonth()]}/${date.getFullYear()}`;
}

function useLastUpdatedDate() {
  const [dateLabel, setDateLabel] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/last-updated', { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.lastUpdatedDate) return;
        const parsed = new Date(data.lastUpdatedDate);
        if (Number.isNaN(parsed.getTime())) return;
        setDateLabel(formatSiteUpdateDate(parsed));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return dateLabel;
}

type SiteUpdateNoteProps = {
  className?: string;
};

export function SiteUpdateNote({ className }: SiteUpdateNoteProps) {
  const dateLabel = useLastUpdatedDate();

  return (
    <div className={cn('space-y-2 text-left', className)}>
      <h3 className="text-[15px] font-medium tracking-tight text-foreground">
        Still in motion
      </h3>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        This portfolio keeps shifting — expect small commits, layout tweaks, and polish whenever something starts to itch.
      </p>
      <p className="text-[11px] text-muted-foreground/75">
        Last updated: {dateLabel ?? '...'}
      </p>
    </div>
  );
}
