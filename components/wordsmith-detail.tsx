'use client';

import { ArrowUpRight, Briefcase, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { OsBackButton } from '@/components/os-back-button';
import { trackEvent } from '@/lib/analytics';
import { WORDSMITH_EMBED_URL } from '@/lib/desktop-os';

type WordsmithDetailProps = {
  onBack: () => void;
  hideBackButton?: boolean;
  layout?: 'page' | 'work-rail';
  onContact?: () => void;
};

const WORDSMITH_SKILLS = [
  'UX research',
  'Prototyping',
  'Interaction design',
  'Design systems',
  'Legal workflows',
] as const;

export function WordsmithDetail({
  onBack,
  hideBackButton = false,
  layout = 'page',
  onContact,
}: WordsmithDetailProps) {
  const t = useTranslations('caseStudy');

  useEffect(() => {
    const previous = document.title;
    document.title = 'Dev | Wordsmith AI';
    return () => {
      document.title = previous;
    };
  }, []);

  const handleContact = () => {
    trackEvent('nav_click', { destination: 'contact', surface: 'wordsmith' });
    if (onContact) {
      onContact();
      return;
    }
    window.location.href = 'mailto:devadhathanmd18@gmail.com';
  };

  return (
    <div
      className={`${layout === 'work-rail' ? 'os-col--work-case' : 'os-col--case'} mt-4 pb-20 text-foreground sm:mt-5 md:mt-6 lg:pb-0`}
    >
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-16">
        <div className="w-full">
          {!hideBackButton ? (
            <div className="mb-5">
              <OsBackButton onClick={onBack} aria-label="Back to Home" />
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <h1 className="cs-display text-foreground" style={{ fontWeight: 600 }}>
              Wordsmith AI
            </h1>
            <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium leading-none text-orange-400 md:text-[12px]">
              New
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-balance cs-body font-medium text-foreground">
            I designed experiences for legal AI.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground md:text-sm">
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              Wordsmith AI
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              April 2026 – June 2026
            </span>
            <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium leading-none text-primary md:text-[12px]">
              Product Design
            </span>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-8 lg:mb-12 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-8 lg:col-span-2">
          <p className="cs-body text-muted-foreground">
            I worked as a product designer at Wordsmith AI. After research and internal
            prototyping, I shipped contract review and versioning for in-house legal teams. I ran
            discovery end to end and stayed close to legal engineers through launch.
          </p>
          <p className="cs-body text-muted-foreground">
            Most of the deeper work sits behind an NDA. If you want the real story (process, flows,
            and what shipped), contact me directly.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleContact}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Contact me
            </button>
            <a
              href={WORDSMITH_EMBED_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('wordsmith_feature_clicked', { surface: 'wordsmith_detail' });
                trackEvent('outbound_link', { destination: 'wordsmith', surface: 'window_cta' });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              Feature
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </a>
          </div>
        </div>

        <div className="space-y-0 border-t border-border/50 pt-8 lg:col-span-1 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8">
          <div className="border-b border-border/50 pb-6">
            <h3 className="cs-label mb-2 uppercase text-muted-foreground">{t('product')}</h3>
            <p className="cs-meta text-foreground">Legal AI platform</p>
          </div>

          <div className="border-b border-border/50 py-6">
            <h3 className="cs-label mb-2 uppercase text-muted-foreground">{t('skills')}</h3>
            <div className="space-y-2">
              {WORDSMITH_SKILLS.map((skill) => (
                <p key={skill} className="cs-meta text-foreground">
                  {skill}
                </p>
              ))}
            </div>
          </div>

          <div className="border-b border-border/50 py-6">
            <h3 className="cs-label mb-2 uppercase text-muted-foreground">{t('myRole')}</h3>
            <p className="cs-meta text-foreground">Product Designer</p>
          </div>

          <div className="pt-6">
            <h3 className="cs-label mb-2 uppercase text-muted-foreground">{t('team')}</h3>
            <p className="cs-meta text-foreground">Product, legal engineers, design</p>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photos/wordsmith-preview.webp"
        alt="Wordsmith AI Blueprints"
        className="h-auto w-full object-cover shadow-lg"
      />
    </div>
  );
}
