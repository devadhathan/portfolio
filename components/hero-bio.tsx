'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSiteContent } from '@/components/site-content-provider';

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
  className = 'text-[14px] leading-[1.65] text-foreground/80 whitespace-pre-line',
  as: Tag = 'p',
  variant = 'full',
}: HeroBioProps) {
  const t = useTranslations('home');
  const { settings } = useSiteContent();
  const messageKey = variant === 'hero' ? 'devBioHero' : 'devBio';
  const linkedinUrl = settings.linkedin?.startsWith('http')
    ? settings.linkedin
    : `https://www.linkedin.com/${settings.linkedin || 'in/devadhathan/'}`;
  const emailHref = `mailto:${settings.email || 'devadhathanmd18@gmail.com'}`;

  return (
    <Tag className={className}>
      {t.rich(messageKey, {
        i: (chunks) => <em className="italic">{chunks}</em>,
        wordsmith: (chunks) => companyLink('https://wordsmith.ai', chunks),
        nesoi: (chunks) => companyLink('https://nesoi.ai', chunks),
        ditto: (chunks) => companyLink('https://joinditto.in', chunks),
        finshots: (chunks) => companyLink('https://finshots.in', chunks),
        linkedin: (chunks) => companyLink(linkedinUrl, chunks),
        email: (chunks) => companyLink(emailHref, chunks),
      })}
    </Tag>
  );
}
