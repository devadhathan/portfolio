import type { GenUIItem } from '@/lib/gen-ui-registry';
import { CASE_STUDY_SLUGS } from '@/lib/build-case-study-cards';
import { getProjectId } from '@/lib/types/project';

export type ProjectMediaItem =
  | Extract<GenUIItem, { type: 'image' }>
  | Extract<GenUIItem, { type: 'video' }>;

export type ProjectGroup = {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  media: ProjectMediaItem[];
  quote?: Extract<GenUIItem, { type: 'quote' }>;
};

type Slugged = { projectSlug?: string };

function slugFromItem(item: GenUIItem): string | null {
  const slugged = item as Slugged;
  if (slugged.projectSlug) return slugged.projectSlug;

  if (item.type === 'project') return getProjectId(item.title);
  if (item.type === 'info' && item.subtitle) return getProjectId(item.subtitle);
  if (item.type === 'quote' && item.author) return getProjectId(item.author);
  if (item.type === 'feature' && item.link?.includes('project=')) {
    const match = item.link.match(/project=([^&]+)/);
    if (match) return match[1];
  }

  if (item.type === 'image' || item.type === 'video') {
    const src = item.src.toLowerCase();
    if (src.includes('/finshots/')) return 'finshots-news-app';
    if (src.includes('/falcon')) return 'falcon-design-system';
    if (src.includes('/crm/')) return 'crm-redesign';
    if (src.includes('/ditto insurance/')) return 'onboarding-redesign';
    if (src.includes('/nesoi/')) return 'nesoi-ai-dashboard';
  }

  return null;
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bai\b/i, 'AI');
}

function stripMediaLink(item: ProjectMediaItem): ProjectMediaItem {
  const { link: _link, ...rest } = item;
  return rest as ProjectMediaItem;
}

export function dedupeGenUIItems(items: GenUIItem[]): GenUIItem[] {
  const seenProjects = new Map<string, GenUIItem & { type: 'project' }>();
  const seenMedia = new Set<string>();
  const seenInfo = new Set<string>();
  const result: GenUIItem[] = [];

  for (const item of items) {
    const slug = slugFromItem(item);

    if (item.type === 'project' && slug) {
      const existing = seenProjects.get(slug);
      if (!existing || item.description.length > existing.description.length) {
        seenProjects.set(slug, item);
      }
      continue;
    }

    if (item.type === 'image' || item.type === 'video') {
      if (seenMedia.has(item.src)) continue;
      seenMedia.add(item.src);
      result.push(stripMediaLink(item));
      continue;
    }

    if (item.type === 'info' && slug) {
      const key = `${slug}:${item.title}`;
      if (seenInfo.has(key)) continue;
      seenInfo.add(key);
      result.push({ ...item, link: undefined });
      continue;
    }

    if (item.type === 'feature' && slug && CASE_STUDY_SLUGS.includes(slug)) {
      continue;
    }

    result.push(item);
  }

  const projects = [...seenProjects.values()];
  return [...projects, ...result];
}

export function organizeGenUIByProject(
  items: GenUIItem[],
  options?: { maxMedia?: number },
): {
  projectGroups: ProjectGroup[];
  otherItems: GenUIItem[];
} {
  const maxMedia = options?.maxMedia ?? 4;
  const groups = new Map<string, ProjectGroup>();
  const otherItems: GenUIItem[] = [];

  for (const item of items) {
    const slug = slugFromItem(item);
    const isCaseStudy = slug && CASE_STUDY_SLUGS.includes(slug);

    if (!isCaseStudy) {
      otherItems.push(item);
      continue;
    }

    if (item.type === 'feature') continue;

    if (!groups.has(slug)) {
      groups.set(slug, { slug, title: slugToTitle(slug), media: [] });
    }
    const group = groups.get(slug)!;

    switch (item.type) {
      case 'project':
        group.title = item.title;
        group.description = item.description;
        group.tags = item.tags;
        break;
      case 'info':
        if (item.title === 'Impact & results') {
          group.highlights = item.body.split(' · ').slice(0, 4);
        } else if (item.title === 'Problem' && !group.description) {
          group.description = item.body;
        }
        break;
      case 'image':
      case 'video':
        if (!group.media.some((m) => m.src === item.src)) {
          group.media.push(stripMediaLink(item));
        }
        break;
      case 'quote':
        group.quote = item;
        break;
      default:
        otherItems.push(item);
    }
  }

  const projectGroups = [...groups.values()]
    .filter((g) => g.media.length > 0 || g.description)
    .map((g) => ({
      ...g,
      media: g.media.slice(0, maxMedia),
    }));

  const groupedSlugs = new Set(projectGroups.map((g) => g.slug));
  const filteredOther = otherItems.filter((item) => {
    const slug = slugFromItem(item);
    if (slug && groupedSlugs.has(slug)) {
      return !['project', 'image', 'video', 'info', 'quote'].includes(item.type);
    }
    return true;
  });

  return { projectGroups, otherItems: filteredOther };
}
