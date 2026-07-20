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

/** Curated card sets — each chip maps to one themed feature section or focused project trio. */
export const STARTER_CHIP_CARD_IDS: Record<StarterChipId, readonly string[]> = {
  impact: ['feature:impact'],
  strongest: [
    'case:finshots-news-app:project',
    'video:case:finshots-news-app:walkthrough',
    'image:nesoi',
  ],
  'ship-code': ['feature:ship-code'],
  hire: ['feature:hire'],
};

/** Narrative copy that directly answers each starter-chip prompt. */
export const STARTER_CHIP_SUMMARIES: Record<StarterChipId, string> = {
  impact:
    "Dev's work shows up in the metrics — not slide decks. Across Finshots, Ditto, and Nesoi, he moved engagement, conversion, and team efficiency in production products people use daily.\n\nAt Nesoi, dashboard redesigns lifted engagement by 92% while cutting course creation time by 37%. At Ditto, onboarding and booking flows gained 17% conversion. Falcon and the CRM redesign sped up delivery by 30% and 20% respectively.\n\nThe cards below break down those outcomes by theme — engagement, conversion, and operational efficiency.",
  strongest:
    "When you want proof of craft, start with what actually shipped. Finshots earned Google Play's Best App of 2020 — 100k+ downloads, 4.9★, and a mobile experience Dev designed end-to-end at Finshots & Ditto.\n\nAt Nesoi.ai, he led enterprise dashboard design for 15+ clients, driving a 92% engagement lift on AI-powered learning flows.\n\nBelow: the Finshots product overview, a screen recording walkthrough, and Nesoi's dashboard interface.",
  'ship-code':
    "Dev is a product designer with a B.Tech in Computer Science who prototypes in Claude Code and Cursor, then ships the result himself — not a designer who stops at Figma.\n\nHe uses AI-assisted IDEs to move from idea to working UI fast: interactive prototypes, production React/Next.js, and this portfolio's Gen UI mode were all built that way.\n\nThe cards below cover his CS foundation, AI-assisted prototyping workflow, and shipping to production.",
  hire:
    "Hiring Dev means getting a product designer who prototypes in Claude Code and Cursor and ships what he builds — not someone who hands off mockups and waits.\n\nFive years across fintech, insurance, and AI. Finshots hit Google Play's Best App of 2020; Nesoi engagement moved 92%; Falcon cut handoff time by 30%.\n\nThe cards below spell out why teams hire him — shipped products, measurable impact, and designer-engineer range.",
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
