'use client';

import { OsBackButton } from '@/components/os-back-button';
import { GlowProgressBar } from '@/components/glow-progress-bar';

/** Shown while the case-study chunk is loading. */
export function CaseStudyLoading({ onBack }: { onBack?: () => void }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-0 pt-1">
      {onBack ? (
        <div className="mb-8">
          <OsBackButton onClick={onBack} aria-label="Back to Home" />
        </div>
      ) : null}

      <div className="flex min-h-[40vh] items-center justify-center px-2">
        <GlowProgressBar className="w-full max-w-md" label="Loading case study" />
      </div>
    </div>
  );
}
