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
    <div className={cn('min-w-0 space-y-4 text-left', className)}>
      <h3 className="card-title-type leading-tight">
        Still in motion
      </h3>
      <div className="space-y-2">
        <p className="card-body-type">
          Small commits and polish as things itch.
        </p>
        <p className="card-meta-type">
          Updated {dateLabel ?? '...'}
        </p>
      </div>
    </div>
  );
}
