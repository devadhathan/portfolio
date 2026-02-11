'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resumeData } from '@/lib/resume-data';
export function AboutSection() {
  return (
    <div className="mt-10 space-y-8 animate-in fade-in duration-300 pb-24">
      {/* Awards & Certifications */}
      {(resumeData.awards.length > 0 || resumeData.certifications.length > 0) && (
        <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2">
          {resumeData.awards.length > 0 && (
            <Card className="about-section-card w-full border border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-foreground">
                    Awards
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {resumeData.awards.map((award, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-1">🏆</span>
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {resumeData.certifications.length > 0 && (
            <Card className="about-section-card w-full border border-border/70 bg-card/60 backdrop-blur-none dark:bg-[#171717]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-dm-mono uppercase tracking-[0.4em] text-[11px] text-foreground">
                    Certifications
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {resumeData.certifications.map((cert, index) => (
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
