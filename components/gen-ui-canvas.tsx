'use client';

import type { ReactNode } from 'react';
import type { GenUIItem } from '@/lib/gen-ui-registry';
import { FeatureCard, FeatureSection } from '@/components/line-illustrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { whiteButtonClass } from '@/components/gen-ui-action-button';
import { capitalizePrompt } from '@/lib/enrich-gen-ui';
import { organizeGenUIByProject, type ProjectGroup, type ProjectMediaItem } from '@/lib/organize-gen-ui';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type GenUILandingPageProps = {
  prompt: string;
  title: string;
  summary?: string;
  items: GenUIItem[];
};

function groupMiscItems(items: GenUIItem[]) {
  return {
    featureSections: items.filter((i): i is Extract<GenUIItem, { type: 'feature_section' }> => i.type === 'feature_section'),
    features: items.filter((i): i is Extract<GenUIItem, { type: 'feature' }> => i.type === 'feature'),
    stats: items.filter((i): i is Extract<GenUIItem, { type: 'stat' }> => i.type === 'stat'),
    projects: items.filter((i): i is Extract<GenUIItem, { type: 'project' }> => i.type === 'project'),
    timelines: items.filter((i): i is Extract<GenUIItem, { type: 'timeline' }> => i.type === 'timeline'),
    skills: items.filter((i): i is Extract<GenUIItem, { type: 'skill_grid' }> => i.type === 'skill_grid'),
    charts: items.filter((i): i is Extract<GenUIItem, { type: 'chart' }> => i.type === 'chart'),
    infos: items.filter((i): i is Extract<GenUIItem, { type: 'info' }> => i.type === 'info'),
    quotes: items.filter((i): i is Extract<GenUIItem, { type: 'quote' }> => i.type === 'quote'),
  };
}

function StatBlock({ label, value, context }: Extract<GenUIItem, { type: 'stat' }>) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 p-5 md:p-6 h-full flex flex-col justify-center min-h-[130px]">
      <p className="text-2xl md:text-3xl font-semibold text-foreground tabular-nums tracking-tight">{value}</p>
      <p className="text-sm font-medium text-foreground/85 mt-2">{label}</p>
      {context && <p className="text-xs text-muted-foreground mt-1">{context}</p>}
    </div>
  );
}

function InfoBlock({ title, subtitle, body, icon }: Extract<GenUIItem, { type: 'info' }>) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 p-5 md:p-6 h-full flex flex-col">
      {icon && <span className="text-xl mb-3">{icon}</span>}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-primary mt-1">{subtitle}</p>}
      <p className="text-xs text-muted-foreground leading-relaxed mt-2 flex-1">{body}</p>
    </div>
  );
}

function ProjectBlock({ title, description, tags }: Extract<GenUIItem, { type: 'project' }>) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 p-5 md:p-6 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{description}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineBlock({ role, company, period, highlights }: Extract<GenUIItem, { type: 'timeline' }>) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 p-5 md:p-6 h-full">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-foreground">{role}</p>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">{period}</p>
      </div>
      <p className="text-xs text-primary mb-2">{company}</p>
      {highlights && (
        <ul className="space-y-1">
          {highlights.slice(0, 3).map((h) => (
            <li key={h} className="text-[11px] text-muted-foreground flex gap-1.5">
              <span className="text-primary">·</span>{h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MediaCard({ item }: { item: ProjectMediaItem }) {
  return (
    <div className="border border-border/50 rounded-xl bg-card/50 overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] overflow-hidden bg-black/10">
        {item.type === 'video' ? (
          <video
            src={item.src}
            poster={item.poster}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            aria-label={item.alt}
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm font-medium text-foreground">{item.alt}</p>
        {item.caption && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{item.caption}</p>
        )}
      </div>
    </div>
  );
}

function ProjectGroupSection({ group }: { group: ProjectGroup }) {
  return (
    <section className="space-y-4 md:space-y-5">
      <div className="max-w-3xl">
        <h2 className="text-lg md:text-xl font-medium text-foreground tracking-tight">{group.title}</h2>
        {group.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{group.description}</p>
        )}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {group.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
            ))}
          </div>
        )}
        {group.highlights && group.highlights.length > 0 && (
          <ul className="mt-3 space-y-1">
            {group.highlights.map((h) => (
              <li key={h} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-primary">·</span>{h}
              </li>
            ))}
          </ul>
        )}
      </div>

      {group.media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.media.map((item) => (
            <MediaCard key={item.src} item={item} />
          ))}
        </div>
      )}

      {group.quote && (
        <blockquote className="border border-border/50 border-l-2 border-l-primary rounded-xl bg-card/40 px-5 py-4 max-w-3xl">
          <p className="text-sm text-foreground/90 italic leading-relaxed">{`\u201C${group.quote.text}\u201D`}</p>
        </blockquote>
      )}
    </section>
  );
}

export function GenUILandingPage({ prompt, title, summary, items }: GenUILandingPageProps) {
  const { projectGroups, otherItems } = organizeGenUIByProject(items);
  const groups = groupMiscItems(otherItems);

  const gridItems: ReactNode[] = [
    ...groups.stats.map((stat, i) => <StatBlock key={`stat-${i}`} {...stat} />),
    ...groups.infos.map((info, i) => <InfoBlock key={`info-${i}`} {...info} />),
    ...groups.timelines.map((tl, i) => <TimelineBlock key={`tl-${i}`} {...tl} />),
    ...groups.projects.map((proj, i) => <ProjectBlock key={`proj-${i}`} {...proj} />),
    ...groups.features.map((feature, i) => (
      <div key={`feat-${i}`} className="border border-border/50 rounded-xl bg-card/40 p-5 md:p-6 h-full">
        <FeatureCard {...feature} />
      </div>
    )),
  ];

  return (
    <article className="animate-fade-in-blur space-y-8 md:space-y-10">
      <header className="max-w-3xl">
        <p className="text-xs text-muted-foreground/70 mb-2 tracking-wide">
          {capitalizePrompt(prompt)}
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground tracking-[0.02em] leading-tight">
          {title}
        </h1>
        {summary && (
          <p className="text-sm md:text-base text-muted-foreground mt-4 md:mt-5 leading-relaxed max-w-3xl whitespace-pre-wrap">
            {summary}
          </p>
        )}
      </header>

      {groups.featureSections.map((section, i) => (
        <FeatureSection key={`fs-${i}`} headline={section.headline} features={section.features} />
      ))}

      {groups.skills.map((skill, i) => (
        <div key={`skill-${i}`} className="border border-border/50 rounded-xl bg-card/50 p-5 md:p-8">
          {skill.categories.map((cat) => (
            <div key={cat.name} className="mb-5 last:mb-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{cat.name}</p>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs font-normal px-3 py-1">{s}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {gridItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gridItems}
        </div>
      )}

      {projectGroups.length > 0 && (
        <div className="space-y-10 md:space-y-14 pt-2">
          {projectGroups.map((group) => (
            <ProjectGroupSection key={group.slug} group={group} />
          ))}
        </div>
      )}

      {groups.charts.map((item, i) => {
        const maxVal = Math.max(...item.bars.map((b) => b.value));
        return (
          <Card key={`chart-${i}`} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.bars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 truncate">{bar.label}</span>
                  <div className="flex-1 h-6 bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(bar.value / maxVal) * 100}%`, background: bar.color || 'hsl(var(--primary))' }} />
                  </div>
                  <span className="text-xs font-semibold w-14 text-right">{bar.displayValue}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {groups.quotes.map((item, i) => (
        <blockquote key={`quote-${i}`} className="border border-border/50 border-l-2 border-l-primary rounded-xl bg-card/40 px-6 py-6 md:px-8">
          <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed">{`\u201C${item.text}\u201D`}</p>
        </blockquote>
      ))}

      {projectGroups.length > 0 && (
        <div className="flex pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn('h-9 w-auto rounded-full px-6 text-xs font-medium', whiteButtonClass)}
          >
            <a href="/work" className="inline-flex items-center">
              View all projects
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      )}
    </article>
  );
}

/** @deprecated Use GenUILandingPage */
export function GenUICanvas({ items }: { items: GenUIItem[] }) {
  return <GenUILandingPage prompt="" title="Overview" items={items} />;
}
