export const GEN_UI_STARTER_CHIPS = [
  {
    id: 'impact',
    label: 'His impact',
    prompt:
      'What measurable impact has Dev delivered as a designer-engineer across Finshots, Nesoi, and Ditto?',
  },
  {
    id: 'strongest',
    label: 'Strongest work',
    prompt: "Show Dev's strongest shipped work — award-winning Finshots, Nesoi, and a walkthrough.",
  },
  {
    id: 'ship-code',
    label: 'Can he ship code?',
    prompt:
      'Can Dev ship production code? Show his engineering stack, design craft, and CS background.',
  },
  {
    id: 'hire',
    label: 'Why hire him?',
    prompt:
      'Why hire Dev as a product designer who also engineers and ships real products?',
  },
] as const;

export type StarterChipId = (typeof GEN_UI_STARTER_CHIPS)[number]['id'];

/** Curated 3-card grids — designer + engineer proof per chip. */
export const STARTER_CHIP_CARD_IDS: Record<StarterChipId, readonly string[]> = {
  impact: ['chart:impact', 'case:finshots-news-app:impact', 'case:nesoi-ai-dashboard:impact'],
  strongest: [
    'case:finshots-news-app:project',
    'case:nesoi-ai-dashboard:project',
    'video:case:finshots-news-app:walkthrough',
  ],
  'ship-code': ['skills:software', 'skills:design', 'info:bsc'],
  hire: ['case:finshots-news-app:project', 'chart:impact', 'skills:software'],
};

const CHIP_PROMPT_SET = new Set(
  GEN_UI_STARTER_CHIPS.flatMap((c) => [c.prompt.toLowerCase(), c.label.toLowerCase()]),
);

export function getStarterChipId(prompt: string): StarterChipId | null {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();
  if (CHIP_PROMPT_SET.has(lower)) {
    return GEN_UI_STARTER_CHIPS.find(
      (c) => c.prompt.toLowerCase() === lower || c.label.toLowerCase() === lower,
    )!.id;
  }
  if (/\b(his impact|impact across|measurable impact|delivered as a designer)\b/i.test(trimmed)) {
    return 'impact';
  }
  if (/\b(strongest work|strongest shipped|best work|award-winning finshots)\b/i.test(trimmed)) {
    return 'strongest';
  }
  if (/\b(ship code|ship production|production code|designer.?engineer|engineer.*design)\b/i.test(trimmed)) {
    return 'ship-code';
  }
  if (/\b(why hire|why should i hire|hire dev)\b/i.test(trimmed)) {
    return 'hire';
  }
  return null;
}

export function isStarterChipQuery(prompt: string): boolean {
  return getStarterChipId(prompt) !== null;
}
