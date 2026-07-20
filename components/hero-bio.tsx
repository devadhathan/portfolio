'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

function companyLink(href: string, chunks: ReactNode) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-inherit underline decoration-muted-foreground/30 underline-offset-[3px] transition-colors duration-200 hover:text-foreground hover:decoration-foreground/60"
      onClick={(e) => e.stopPropagation()}
    >
      {chunks}
    </a>
  );
}

type HeroBioProps = {
  className?: string;
  as?: 'p' | 'span';
  variant?: 'hero' | 'full';
};

export function HeroBio({
  className = 'text-[13px] text-muted-foreground/70 leading-relaxed',
  as: Tag = 'p',
  variant = 'full',
}: HeroBioProps) {
  const t = useTranslations('home');
  const messageKey = variant === 'hero' ? 'devBioHero' : 'devBio';

  return (
    <Tag className={className}>
      {t.rich(messageKey, {
        wordsmith: (chunks) => companyLink('https://wordsmith.ai', chunks),
        nesoi: (chunks) => companyLink('https://nesoi.ai', chunks),
        ditto: (chunks) => companyLink('https://joinditto.in', chunks),
        finshots: (chunks) => companyLink('https://finshots.in', chunks),
      })}
    </Tag>
  );
}
