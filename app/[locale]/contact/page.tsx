'use client';

import { useCallback, useState } from 'react';
import { play } from 'cuelume';
import { useTranslations } from 'next-intl';
import { useSiteContent } from '@/components/site-content-provider';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type ContactAction =
  | { label: string; href: string; external?: boolean }
  | { label: string; onClick: () => void; activeLabel?: string };

export default function ContactPage() {
  const t = useTranslations('contact');
  const router = useRouter();
  const { settings } = useSiteContent();
  const [copied, setCopied] = useState(false);

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  useRegisterNavActions({ onHomeClick: handleHomeClick });

  const linkedinUrl = (settings.linkedin ?? 'in/devadhathan/').startsWith('http')
    ? settings.linkedin!
    : `https://linkedin.com/${(settings.linkedin ?? 'in/devadhathan/').replace(/^\/+/, '')}`;
  const githubUrl = settings.github?.startsWith('http')
    ? settings.github
    : `https://github.com/${settings.github ?? 'devadhathan'}`;
  const websiteUrl = settings.website?.startsWith('http')
    ? settings.website
    : `https://${settings.website ?? 'devadhathan.com'}`;

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(settings.email);
      play('success', { volume: 0.45 });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      play('error', { volume: 0.4 });
      window.location.href = `mailto:${settings.email}`;
    }
  }, [settings.email]);

  const actions: ContactAction[] = [
    {
      label: t('copyEmail'),
      onClick: handleCopyEmail,
      activeLabel: t('copied'),
    },
    { label: 'LinkedIn', href: linkedinUrl, external: true },
    { label: 'GitHub', href: githubUrl, external: true },
    { label: t('website'), href: websiteUrl, external: true },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground lg:min-h-0 lg:bg-transparent">
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 pb-20 pt-14 sm:px-6 lg:min-h-[calc(100vh-8.5rem)] lg:pt-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

          <a
            href={`mailto:${settings.email}`}
            data-cuelume-hover="tick"
            data-cuelume-press
            data-cuelume-release
            className="max-w-full break-all text-[clamp(1.5rem,5vw,3rem)] font-normal leading-tight tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {settings.email}
          </a>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {actions.map((action) => {
              const isCopy = 'onClick' in action;
              const label = isCopy && copied && action.activeLabel ? action.activeLabel : action.label;

              if (isCopy) {
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    data-cuelume-release
                    className={cn(
                      'rounded-full px-4 py-2 text-sm transition-colors',
                      copied
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-foreground hover:bg-secondary/80',
                    )}
                  >
                    {label}
                  </button>
                );
              }

              return (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  data-cuelume-release
                  className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80"
                >
                  {action.label}
                </a>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
