import type { GenUIItem } from '@/lib/gen-ui-registry';
import { MAX_VIEWPORT_CARDS } from '@/lib/enrich-gen-ui';
import { dedupeGenUIItems } from '@/lib/organize-gen-ui';
import { getItemSlug } from '@/lib/gen-ui-item-slug';

const TOPIC_SLUGS: Array<{ test: RegExp; slug: string }> = [
  { test: /\bfinshots\b/i, slug: 'finshots-news-app' },
  { test: /\bnesoi\b/i, slug: 'nesoi-ai-dashboard' },
  { test: /\b(falcon|design system)\b/i, slug: 'falcon-design-system' },
  { test: /\bcrm\b/i, slug: 'crm-redesign' },
  { test: /\b(onboarding|ditto insurance|ditto)\b/i, slug: 'onboarding-redesign' },
  { test: /\bwordsmith\b/i, slug: 'wordsmith' },
];

function itemMatchesSlug(item: GenUIItem, slug: string): boolean {
  if (getItemSlug(item) === slug) return true;

  const haystack = [
    item.type === 'project' ? item.title : '',
    item.type === 'info' ? `${item.title} ${item.subtitle ?? ''}` : '',
    item.type === 'feature' ? `${item.title} ${item.body}` : '',
    item.type === 'stat' ? `${item.label} ${item.context ?? ''}` : '',
    item.type === 'image' || item.type === 'video' ? `${item.alt} ${item.caption ?? ''}` : '',
  ]
    .join(' ')
    .toLowerCase();

  const tokens = slug.split('-').filter((t) => t.length > 2);
  return tokens.some((t) => haystack.includes(t));
}

function isOverviewQuery(prompt: string): boolean {
  // "Show me his finshots projects" is a specific project ask, not a portfolio overview.
  if (TOPIC_SLUGS.some(({ test }) => test.test(prompt))) {
    return false;
  }
  return /\b(all|overview|every|each|projects?|works?|portfolio|selected\s+work|show\s+me\s+(?:his|dev'?s?)\s+work|tell\s+me\s+about\s+(?:his|dev'?s?)\s+projects?)\b/i.test(
    prompt,
  );
}

export function isSpecificTopicQuery(prompt: string): boolean {
  return TOPIC_SLUGS.some(({ test }) => test.test(prompt)) && !isOverviewQuery(prompt);
}

export function getTopicSlugFromPrompt(prompt: string): string | null {
  if (!isSpecificTopicQuery(prompt)) return null;
  return TOPIC_SLUGS.find(({ test }) => test.test(prompt))?.slug ?? null;
}

function hasConcreteCards(items: GenUIItem[]): boolean {
  return items.some((i) =>
    ['project', 'stat', 'timeline', 'image', 'video', 'chart', 'info'].includes(i.type),
  );
}

/** Cap unique project slugs on overview so one merged card per project. */
function capUniqueProjects(items: GenUIItem[], maxProjects: number): GenUIItem[] {
  const slugOrder: string[] = [];
  const bySlug = new Map<string, GenUIItem[]>();
  const rest: GenUIItem[] = [];

  for (const item of items) {
    const slug = getItemSlug(item);
    if (!slug) {
      rest.push(item);
      continue;
    }
    if (!bySlug.has(slug)) slugOrder.push(slug);
    const group = bySlug.get(slug) ?? [];
    group.push(item);
    bySlug.set(slug, group);
  }

  const keptSlugs = slugOrder.slice(0, maxProjects);
  const kept: GenUIItem[] = [];
  for (const slug of keptSlugs) {
    kept.push(...(bySlug.get(slug) ?? []));
  }

  return [...kept, ...rest];
}

export function filterRelevantItems(items: GenUIItem[], prompt: string): GenUIItem[] {
  let next = dedupeGenUIItems(items);

  if (hasConcreteCards(next) && !isSpecificTopicQuery(prompt)) {
    next = next.filter((i) => i.type !== 'feature_section');
  }

  if (isOverviewQuery(prompt)) {
    next = next.filter((i) => i.type !== 'feature_section' && i.type !== 'feature');
    next = capUniqueProjects(next, MAX_VIEWPORT_CARDS);
  }

  if (isSpecificTopicQuery(prompt)) {
    const topic = TOPIC_SLUGS.find(({ test }) => test.test(prompt));
    if (topic) {
      next = next.filter(
        (i) =>
          itemMatchesSlug(i, topic.slug) ||
          i.type === 'skill_grid' ||
          i.type === 'feature' ||
          i.type === 'feature_section',
      );
    }
  }

  return next;
}
