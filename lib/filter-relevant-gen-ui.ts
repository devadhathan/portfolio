import type { GenUIItem } from '@/lib/gen-ui-registry';
import { MAX_VIEWPORT_CARDS } from '@/lib/gen-ui-constants';
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

export function itemMatchesSlug(item: GenUIItem, slug: string): boolean {
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

export function isOverviewQuery(prompt: string): boolean {
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

/** Employers / where he worked — distinct from role-and-responsibility experience asks. */
export function isCompaniesQuery(prompt: string): boolean {
  return /\b(compan(y|ies)|employer|employers|where\s+(?:did|has)\s+he\s+work|who\s+did\s+he\s+work|worked\s+(?:at|for)|places?\s+he\s+worked|organizations?\s+he\s+worked)\b/i.test(
    prompt,
  );
}

/** Roles, responsibilities, and career arc — not a company-name listing. */
export function isExperienceQuery(prompt: string): boolean {
  if (isCompaniesQuery(prompt)) return false;
  return /\b(experience|career|progression|roles?|responsibilit|background|journey|work\s+history|professional\s+(?:path|journey)|what\s+(?:did|has)\s+he\s+do|his\s+work\s+as)\b/i.test(
    prompt,
  );
}

export function isCareerQuery(prompt: string): boolean {
  return isExperienceQuery(prompt) || isCompaniesQuery(prompt);
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

function isGenericImpactItem(item: GenUIItem): boolean {
  if (item.type === 'chart') return true;
  if (item.type === 'stat' && !getItemSlug(item)) return true;
  if (item.type === 'project') return true;
  if (
    item.type === 'feature_section' &&
    /engagement|conversion|team efficiency/i.test(item.headline)
  ) {
    return true;
  }
  return false;
}

export function filterRelevantItems(items: GenUIItem[], prompt: string): GenUIItem[] {
  let next = dedupeGenUIItems(items);

  if (isExperienceQuery(prompt)) {
    next = next.filter(
      (i) =>
        !isGenericImpactItem(i) &&
        i.type !== 'timeline' &&
        !(i.type === 'info' && /finshots|ditto/i.test(`${i.title} ${i.body}`)),
    );
  } else if (isCompaniesQuery(prompt)) {
    next = next.filter((i) => !isGenericImpactItem(i) && i.type !== 'project');
  }

  // Topic deep-dives: only drop cards explicitly scoped to a different project.
  // Keep charts, stats, features, etc. the agent chose as supporting context.
  if (isSpecificTopicQuery(prompt)) {
    const topic = TOPIC_SLUGS.find(({ test }) => test.test(prompt));
    if (topic) {
      next = next.filter((i) => {
        const slug = getItemSlug(i);
        if (!slug) return true;
        return slug === topic.slug || itemMatchesSlug(i, topic.slug);
      });
    }
  }

  if (isOverviewQuery(prompt)) {
    next = capUniqueProjects(next, MAX_VIEWPORT_CARDS);
  }

  return next;
}
