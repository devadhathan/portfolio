'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Own module so the title isn’t blocked by HomeHero’s video chunk. */
export function HomeHeroTitle({ className }: { className?: string }) {
  const tHome = useTranslations('home');

  return (
    <h1
      className={cn(
        'home-hero__title m-0 max-w-[18ch] text-[56px] font-light leading-[1.15] tracking-tight text-foreground',
        className,
      )}
    >
      {tHome('heroLine1')}
    </h1>
  );
}
