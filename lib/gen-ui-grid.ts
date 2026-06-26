import type { GenUIItem } from '@/lib/gen-ui-registry';
import { CARD_REGISTRY } from '@/lib/gen-ui-registry';
import type { ResearchCardData } from '@/lib/gen-ui-research-cards';
import { itemsToResearchCards } from '@/lib/gen-ui-research-cards';
import {
  isCompaniesQuery,
  isExperienceQuery,
  isOverviewQuery,
  getTopicSlugFromPrompt,
} from '@/lib/filter-relevant-gen-ui';
import { getItemSlug } from '@/lib/gen-ui-item-slug';

export { GRID_CARD_COUNTS, MAX_GRID_CARDS } from '@/lib/gen-ui-constants';

/** Snap any count to the nearest valid grid size: 1, 3, 6, or 9. */
export function targetGridCardCount(actual: number): number {
  if (actual <= 1) return 1;
  if (actual <= 3) return 3;
  if (actual <= 6) return 6;
  return 9;
}

const OVERVIEW_PAD_IDS = [
  'chart:impact',
  'feature:impact',
  'stat:engagement',
  'stat:conversion',
  'stat:efficiency',
  'image:finshots',
  'image:nesoi',
  'image:falcon',
] as const;

const GENERIC_PAD_IDS = [
  'chart:impact',
  'feature:skills',
  'stat:rating',
  'timeline:nesoi',
  'info:education',
  'quote:philosophy',
] as const;

const EXPERIENCE_PAD_IDS = ['feature:career'] as const;

const COMPANIES_PAD_IDS = [
  'timeline:ditto-finshots',
  'timeline:nesoi',
  'timeline:wordsmith',
] as const;

function itemPriority(item: GenUIItem, prompt: string): number {
  if (isExperienceQuery(prompt)) {
    if (item.type === 'feature_section') return 0;
    if (item.type === 'quote') return 1;
    if (item.type === 'timeline') return 4;
    if (item.type === 'project' || item.type === 'chart' || item.type === 'stat') return 5;
    return 3;
  }
  if (isCompaniesQuery(prompt)) {
    if (item.type === 'timeline') return 0;
    if (item.type === 'info') return 1;
    return 4;
  }
  if (item.type === 'project') return 0;
  if (item.type === 'image' || item.type === 'video') return 1;
  if (item.type === 'feature') return 2;
  if (item.type === 'chart' || item.type === 'stat') return 3;
  return 4;
}

function trimItemsToCount(items: GenUIItem[], target: number, prompt: string): GenUIItem[] {
  return [...items]
    .sort((a, b) => itemPriority(a, prompt) - itemPriority(b, prompt))
    .slice(0, target);
}

function padItemIds(prompt: string): readonly string[] {
  if (isExperienceQuery(prompt)) return EXPERIENCE_PAD_IDS;
  if (isCompaniesQuery(prompt)) return COMPANIES_PAD_IDS;
  if (isOverviewQuery(prompt)) return OVERVIEW_PAD_IDS;
  const slug = getTopicSlugFromPrompt(prompt);
  if (slug) {
    return [
      `case:${slug}:impact`,
      `chart:impact`,
      `feature:finshots`,
      `stat:engagement`,
      ...OVERVIEW_PAD_IDS,
    ];
  }
  return GENERIC_PAD_IDS;
}

function padItemsToCount(items: GenUIItem[], target: number, prompt: string): GenUIItem[] {
  const next = [...items];
  const existing = new Set(next.map((i) => JSON.stringify(i).slice(0, 120)));

  for (const id of padItemIds(prompt)) {
    if (next.length >= target) break;
    const card = CARD_REGISTRY[id] as GenUIItem | undefined;
    if (!card) continue;
    const key = JSON.stringify(card).slice(0, 120);
    if (existing.has(key)) continue;
    next.push(card);
    existing.add(key);
  }

  return next.slice(0, target);
}

export function normalizeGenUIItemsForGrid(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (items.length === 0) return items;
  const target = targetGridCardCount(items.length);
  if (items.length === target) return items;
  if (items.length > target) return trimItemsToCount(items, target, prompt);
  return padItemsToCount(items, target, prompt);
}

function cardPriority(card: ResearchCardData): number {
  if (card.cover.src || card.cover.isVideo) return 0;
  if (card.illustration || card.chartBars) return 1;
  if (card.statValue) return 2;
  return 3;
}

function trimCardsToCount(cards: ResearchCardData[], target: number): ResearchCardData[] {
  const seen = new Set<string>();
  const unique = cards.filter((c) => {
    if (seen.has(c.key)) return false;
    seen.add(c.key);
    return true;
  });
  return [...unique].sort((a, b) => cardPriority(a) - cardPriority(b)).slice(0, target);
}

export function normalizeResearchCardsForGrid(
  cards: ResearchCardData[],
  sourceItems: GenUIItem[],
  prompt: string,
): ResearchCardData[] {
  if (cards.length === 0) return cards;

  const target = targetGridCardCount(cards.length);
  if (cards.length === target) return cards;

  if (cards.length > target) return trimCardsToCount(cards, target);

  const paddedItems = padItemsToCount(sourceItems, target, prompt);
  const paddedCards = itemsToResearchCards(paddedItems, prompt);
  const seen = new Set(cards.map((c) => c.key));
  const merged = [...cards];

  for (const card of paddedCards) {
    if (merged.length >= target) break;
    if (seen.has(card.key)) continue;
    merged.push(card);
    seen.add(card.key);
  }

  return merged.slice(0, target);
}

export function researchGridClass(count: number): string {
  const target = targetGridCardCount(count);
  const gap = 'gap-4 md:gap-5 lg:gap-6';

  if (target === 1) {
    return 'mx-auto flex w-full justify-center';
  }

  return `mx-auto grid w-full max-w-[1200px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gap} items-stretch justify-items-center`;
}
