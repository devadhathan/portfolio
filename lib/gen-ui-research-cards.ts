import type { GenUIItem } from '@/lib/gen-ui-registry';
import type { LineIllustrationId } from '@/lib/gen-ui-registry';
import { isSpecificTopicQuery } from '@/lib/filter-relevant-gen-ui';
import { richCardDescription, richFeatureDescription } from '@/lib/gen-ui-card-copy';
import { resolveItemCover, getProjectCover, type CoverMedia } from '@/lib/gen-ui-covers';
import { getItemSlug, isProjectScopedItem, projectHref, resolveItemHref } from '@/lib/gen-ui-item-slug';

export type ResearchCardData = {
  key: string;
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  cover: CoverMedia;
  illustration?: LineIllustrationId;
  statValue?: string;
  icon?: string;
};

function joinMeta(parts: (string | undefined)[]): string | undefined {
  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' · ') : undefined;
}

function withCoverFallback(cover: CoverMedia, ...labels: (string | undefined)[]): CoverMedia {
  if (cover.src) return cover;
  for (const label of labels) {
    if (!label) continue;
    const src = getProjectCover(label);
    if (src) return { ...cover, src };
  }
  return cover;
}

function pickCoverItem(group: GenUIItem[]): GenUIItem {
  return (
    group.find((i) => i.type === 'image') ??
    group.find((i) => i.type === 'video') ??
    group.find((i) => i.type === 'project') ??
    group[0]
  );
}

function mergedProjectCard(slug: string, group: GenUIItem[], allItems: GenUIItem[]): ResearchCardData {
  const project = group.find((i): i is Extract<GenUIItem, { type: 'project' }> => i.type === 'project');
  const media = group.find((i) => i.type === 'image' || i.type === 'video');
  const impact = group.find((i) => i.type === 'info' && i.title === 'Impact & results');

  const title =
    project?.title ??
    (media && (media.type === 'image' || media.type === 'video') ? media.alt : undefined) ??
    slug.replace(/-/g, ' ');

  const description =
    (project && richCardDescription(project, allItems)) ||
    (impact && richCardDescription(impact, allItems)) ||
    (media && richCardDescription(media, allItems)) ||
    undefined;

  const coverSource = pickCoverItem(group);
  const cover = withCoverFallback(
    resolveItemCover(coverSource, allItems),
    title,
    slug.replace(/-/g, ' '),
    project?.title,
  );

  return {
    key: `project-${slug}`,
    title,
    description,
    meta: joinMeta(project?.tags?.slice(0, 3) ?? []),
    href: project?.link ?? projectHref(slug),
    cover,
  };
}

function dedupeCoverSrc(cover: CoverMedia, usedSrcs: Set<string>): CoverMedia {
  if (!cover.src) return cover;
  if (usedSrcs.has(cover.src)) return { gradient: cover.gradient };
  usedSrcs.add(cover.src);
  return cover;
}

function expandProjectGroup(
  slug: string,
  group: GenUIItem[],
  allItems: GenUIItem[],
  usedSrcs: Set<string>,
): ResearchCardData[] {
  const cards: ResearchCardData[] = [];

  const project = group.find((i): i is Extract<GenUIItem, { type: 'project' }> => i.type === 'project');
  const impact = group.find((i): i is Extract<GenUIItem, { type: 'info' }> => i.type === 'info' && i.title === 'Impact & results');
  const mediaItems = group.filter((i): i is Extract<GenUIItem, { type: 'image' | 'video' }> => i.type === 'image' || i.type === 'video');
  const otherInfos = group.filter((i): i is Extract<GenUIItem, { type: 'info' }> => i.type === 'info' && i !== impact);
  const quotes = group.filter((i): i is Extract<GenUIItem, { type: 'quote' }> => i.type === 'quote');

  if (project) {
    cards.push({
      key: `project-${slug}`,
      title: project.title,
      description: richCardDescription(project, allItems),
      meta: joinMeta(project.tags?.slice(0, 3) ?? []),
      cover: dedupeCoverSrc(
        withCoverFallback(
          resolveItemCover(project, allItems),
          project.title,
          slug.replace(/-/g, ' '),
        ),
        usedSrcs,
      ),
    });
  }

  if (impact) {
    cards.push({
      key: `impact-${slug}`,
      title: impact.title,
      description: richCardDescription(impact, allItems),
      meta: impact.subtitle ?? 'Impact',
      icon: impact.icon,
      cover: resolveItemCover(impact, allItems),
    });
  }

  mediaItems.forEach((item, i) => {
    cards.push({
      key: `media-${slug}-${i}-${item.src}`,
      title: item.alt,
      description: richCardDescription(item, allItems),
      meta: item.type === 'video' ? 'Screen recording' : 'Interface',
      cover: dedupeCoverSrc(resolveItemCover(item, allItems), usedSrcs),
    });
  });

  otherInfos.forEach((info, i) => {
    cards.push({
      key: `info-${slug}-${i}-${info.title}`,
      title: info.title,
      description: richCardDescription(info, allItems),
      meta: info.subtitle,
      icon: info.icon,
      cover: resolveItemCover(info, allItems),
    });
  });

  quotes.forEach((quote, i) => {
    cards.push({
      key: `quote-${slug}-${i}`,
      title: quote.author ?? 'Research insight',
      description: quote.text,
      meta: 'From the case study',
      cover: resolveItemCover(quote, allItems),
    });
  });

  if (cards.length === 0) {
    return [mergedProjectCard(slug, group, allItems)];
  }

  return cards;
}

function singleItemCard(item: GenUIItem, index: number, allItems: GenUIItem[]): ResearchCardData[] {
  switch (item.type) {
    case 'stat':
      return [{
        key: `stat-${index}-${item.label}`,
        title: item.label,
        description: richCardDescription(item, allItems),
        meta: 'Impact',
        statValue: item.value,
        cover: resolveItemCover(item, allItems),
      }];

    case 'timeline':
      return [{
        key: `tl-${index}-${item.role}`,
        title: item.role,
        description: richCardDescription(item, allItems),
        meta: joinMeta([item.company, item.period]),
        cover: resolveItemCover(item, allItems),
      }];

    case 'feature':
      return [{
        key: `feat-${index}-${item.title}`,
        title: item.title,
        description: richCardDescription(item, allItems),
        meta: 'Interactive overview',
        illustration: item.illustration,
        cover: resolveItemCover(item, allItems),
      }];

    case 'feature_section':
      return item.features.map((feat, j) => ({
        key: `fs-${index}-${j}-${feat.title}`,
        title: feat.title,
        description: richFeatureDescription(feat, allItems),
        meta: item.headline,
        href: feat.link,
        illustration: feat.illustration,
        cover: resolveItemCover({ type: 'feature', ...feat }, allItems),
      }));

    case 'chart':
      return [{
        key: `chart-${index}-${item.title}`,
        title: item.title,
        description: richCardDescription(item, allItems),
        meta: 'Metrics',
        cover: resolveItemCover(item, allItems),
      }];

    case 'skill_grid':
      return item.categories.map((cat, j) => ({
        key: `skill-${index}-${j}-${cat.name}`,
        title: cat.name,
        description: cat.skills.slice(0, 8).join(', '),
        meta: 'Skills',
        cover: resolveItemCover(item, allItems),
      }));

    default:
      return [];
  }
}

export function itemsToResearchCards(items: GenUIItem[], prompt?: string): ResearchCardData[] {
  const expandProjects = prompt ? isSpecificTopicQuery(prompt) : false;
  const slugGroups = new Map<string, GenUIItem[]>();
  const other: GenUIItem[] = [];

  for (const item of items) {
    if (isProjectScopedItem(item)) {
      const slug = getItemSlug(item)!;
      const group = slugGroups.get(slug) ?? [];
      group.push(item);
      slugGroups.set(slug, group);
    } else {
      other.push(item);
    }
  }

  const cards: ResearchCardData[] = [];
  const usedCoverSrcs = new Set<string>();

  for (const [slug, group] of slugGroups) {
    if (expandProjects) {
      cards.push(...expandProjectGroup(slug, group, items, usedCoverSrcs));
    } else {
      cards.push(mergedProjectCard(slug, group, items));
    }
  }

  other.forEach((item, index) => {
    cards.push(...singleItemCard(item, index, items));
  });

  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.key)) return false;
    seen.add(card.key);
    return true;
  });
}
