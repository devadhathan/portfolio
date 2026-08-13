'use client';

import { OsBackButton } from '@/components/os-back-button';

/** Shown while the case-study chunk is loading. */
export function CaseStudyLoading({ onBack }: { onBack?: () => void }) {
  return (
    <div className="os-col pt-1">
      {onBack ? (
        <div className="mb-8">
          <OsBackButton onClick={onBack} aria-label="Back to Home" />
        </div>
      ) : null}

      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading case study">
        <div className="space-y-3">
          <div className="h-8 w-2/3 max-w-md rounded-lg bg-foreground/10" />
          <div className="flex gap-3">
            <div className="h-4 w-28 rounded-full bg-foreground/8" />
            <div className="h-4 w-24 rounded-full bg-foreground/8" />
          </div>
        </div>
        <div className="h-40 w-full rounded-2xl bg-foreground/8" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-foreground/8" />
          <div className="h-4 w-11/12 rounded-full bg-foreground/8" />
          <div className="h-4 w-4/5 rounded-full bg-foreground/8" />
        </div>
        <div className="h-56 w-full rounded-2xl bg-foreground/8" />
      </div>
    </div>
  );
}
