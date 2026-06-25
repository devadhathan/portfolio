'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteContent } from '@/components/site-content-provider';
import { useTranslations } from 'next-intl';

export function AboutSection() {
  const { settings } = useSiteContent();
  const t = useTranslations('about');

  return (
    <div className="mt-10 space-y-8 animate-card-reveal pb-24" style={{ animationDelay: '1.4s' }}>
      {((settings.awards?.length ?? 0) > 0 || (settings.certifications?.length ?? 0) > 0) && (
        <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2">
          {(settings.awards?.length ?? 0) > 0 && (
            <Card className="about-section-card w-full border border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-foreground">
                    {t('awards')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {(settings.awards ?? []).map((award, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-1">🏆</span>
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(settings.certifications?.length ?? 0) > 0 && (
            <Card className="about-section-card w-full border border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-foreground">
                    {t('certifications')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {(settings.certifications ?? []).map((cert, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-1">✓</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
