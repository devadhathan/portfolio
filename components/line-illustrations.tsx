'use client';

import React from 'react';
import { GenUIActionButton } from '@/components/gen-ui-action-button';
import { cn } from '@/lib/utils';

export type LineIllustrationId =
  | 'growth-curve'
  | 'funnel'
  | 'network'
  | 'timeline'
  | 'system'
  | 'users'
  | 'mobile'
  | 'research'
  | 'accessibility';

const stroke = 'currentColor';

function GrowthCurveIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <path d="M20 90 Q60 88 90 70 T160 25" stroke={stroke} strokeWidth="1.2" />
      <path d="M20 95 Q70 92 120 85 T180 70" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <circle cx="90" cy="70" r="3" fill={stroke} />
      <circle cx="160" cy="25" r="3" fill={stroke} />
      <text x="78" y="62" fontSize="9" fill="currentColor" opacity="0.6">Good</text>
      <text x="148" y="18" fontSize="9" fill="currentColor" opacity="0.6">Great</text>
    </svg>
  );
}

function FunnelIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <ellipse cx="100" cy="60" rx="70" ry="35" stroke={stroke} strokeWidth="1" />
      <ellipse cx="100" cy="60" rx="50" ry="25" stroke={stroke} strokeWidth="1" />
      <ellipse cx="100" cy="60" rx="30" ry="15" stroke={stroke} strokeWidth="1" />
      <line x1="30" y1="60" x2="170" y2="60" stroke={stroke} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      <circle cx="30" cy="60" r="3" fill={stroke} />
      <circle cx="170" cy="60" r="3" fill={stroke} />
    </svg>
  );
}

function NetworkIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="100" cy="60" r="4" fill={stroke} />
      <line x1="100" y1="60" x2="40" y2="35" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" />
      <line x1="100" y1="60" x2="40" y2="85" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" />
      <line x1="100" y1="60" x2="160" y2="60" stroke={stroke} strokeWidth="1.2" />
      <circle cx="40" cy="35" r="3" fill="none" stroke={stroke} strokeWidth="1" />
      <circle cx="40" cy="85" r="3" fill="none" stroke={stroke} strokeWidth="1" />
      <circle cx="160" cy="60" r="3" fill={stroke} />
    </svg>
  );
}

function TimelineIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <line x1="30" y1="60" x2="170" y2="60" stroke={stroke} strokeWidth="1" />
      <circle cx="50" cy="60" r="4" fill={stroke} />
      <circle cx="100" cy="60" r="4" fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="150" cy="60" r="4" fill="none" stroke={stroke} strokeWidth="1.2" />
      <line x1="50" y1="60" x2="50" y2="40" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <line x1="100" y1="60" x2="100" y2="78" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <line x1="150" y1="60" x2="150" y2="38" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
    </svg>
  );
}

function SystemIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <rect x="55" y="30" width="40" height="28" rx="2" stroke={stroke} strokeWidth="1" />
      <rect x="105" y="30" width="40" height="28" rx="2" stroke={stroke} strokeWidth="1" />
      <rect x="55" y="68" width="40" height="28" rx="2" stroke={stroke} strokeWidth="1" />
      <rect x="105" y="68" width="40" height="28" rx="2" stroke={stroke} strokeWidth="1" />
      <line x1="75" y1="58" x2="75" y2="68" stroke={stroke} strokeWidth="1" />
      <line x1="125" y1="58" x2="125" y2="68" stroke={stroke} strokeWidth="1" />
      <line x1="95" y1="44" x2="105" y2="44" stroke={stroke} strokeWidth="1" />
      <line x1="95" y1="82" x2="105" y2="82" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

function UsersIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="80" cy="45" r="12" stroke={stroke} strokeWidth="1" />
      <path d="M55 88 Q80 68 105 88" stroke={stroke} strokeWidth="1" />
      <circle cx="120" cy="50" r="10" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d="M100 88 Q120 72 140 88" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  );
}

function MobileIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <rect x="78" y="22" width="44" height="76" rx="6" stroke={stroke} strokeWidth="1.2" />
      <line x1="88" y1="38" x2="112" y2="38" stroke={stroke} strokeWidth="1" />
      <line x1="88" y1="50" x2="112" y2="50" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="88" y1="62" x2="105" y2="62" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <circle cx="100" cy="88" r="3" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

function ResearchIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="85" cy="50" r="22" stroke={stroke} strokeWidth="1.2" />
      <line x1="100" y1="65" x2="125" y2="90" stroke={stroke} strokeWidth="1.5" />
      <line x1="70" y1="70" x2="100" y2="70" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="70" y1="55" x2="100" y2="55" stroke={stroke} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function AccessibilityIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="100" cy="35" r="8" stroke={stroke} strokeWidth="1" />
      <line x1="100" y1="43" x2="100" y2="72" stroke={stroke} strokeWidth="1.2" />
      <line x1="78" y1="55" x2="122" y2="55" stroke={stroke} strokeWidth="1.2" />
      <line x1="100" y1="72" x2="82" y2="95" stroke={stroke} strokeWidth="1.2" />
      <line x1="100" y1="72" x2="118" y2="95" stroke={stroke} strokeWidth="1.2" />
      <path d="M55 95 Q100 75 145 95" stroke={stroke} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<LineIllustrationId, React.FC> = {
  'growth-curve': GrowthCurveIllustration,
  funnel: FunnelIllustration,
  network: NetworkIllustration,
  timeline: TimelineIllustration,
  system: SystemIllustration,
  users: UsersIllustration,
  mobile: MobileIllustration,
  research: ResearchIllustration,
  accessibility: AccessibilityIllustration,
};

export function LineIllustration({ id, className }: { id: LineIllustrationId; className?: string }) {
  const Illustration = ILLUSTRATIONS[id];
  return (
    <div className={cn('text-foreground/80 aspect-[5/3] w-full flex items-center justify-center', className)}>
      <Illustration />
    </div>
  );
}

export type FeatureItem = {
  illustration: LineIllustrationId;
  title: string;
  body: string;
  link?: string;
};

export function FeatureCard({
  illustration,
  title,
  body,
  link,
  variant = 'default',
}: FeatureItem & { variant?: 'default' | 'compact' }) {
  const inner = (
    <>
      <LineIllustration id={illustration} className={variant === 'compact' ? 'max-h-24' : 'max-h-32'} />
      <h3 className={cn('font-semibold text-foreground', variant === 'compact' ? 'text-[12px] mt-2' : 'text-sm mt-4')}>
        {title}
      </h3>
      <p className={cn('text-muted-foreground leading-relaxed', variant === 'compact' ? 'text-[11px] mt-1' : 'text-xs mt-2')}>
        {body}
      </p>
      {link && variant !== 'compact' && (
        <GenUIActionButton href={link} label="Learn more" className="mt-3" />
      )}
    </>
  );

  const className = cn(
    'flex flex-col h-full',
    variant === 'compact' ? 'py-2' : 'p-6',
  );

  if (link && variant === 'compact') {
    return (
      <a href={link} className={cn(className, 'block no-underline hover:opacity-90 transition-opacity')}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function FeatureSection({
  headline,
  features,
}: {
  headline: string;
  features: FeatureItem[];
}) {
  const cols = features.length >= 3 ? 'sm:grid-cols-3' : features.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-1';

  return (
    <section className="border border-border/50 rounded-xl overflow-hidden bg-card/40">
      <div className="px-6 sm:px-8 py-8 sm:py-10 border-b border-border/40">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug max-w-3xl">{headline}</h2>
      </div>
      <div className={cn('grid grid-cols-1 divide-y sm:divide-y-0 sm:divide-x divide-border/40', cols)}>
        {features.map((feature, i) => (
          <div key={i} className="relative">
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
    </section>
  );
}
