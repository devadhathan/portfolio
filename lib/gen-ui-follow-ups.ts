export type GenUIFollowUp = {
  id: string;
  label: string;
  prompt: string;
  /** Matches a prompt already covering this topic, so it isn't suggested again. */
  match: RegExp;
};

/**
 * Only topics the agent has real portfolio content for — every suggestion here
 * resolves to a grounded answer rather than a generic fallback.
 */
export const GEN_UI_FOLLOW_UPS: GenUIFollowUp[] = [
  {
    id: 'finshots',
    label: 'Tell me about Finshots',
    prompt: 'Tell me about the Finshots news app — the design challenge and what shipped.',
    match: /\bfinshots\b/i,
  },
  {
    id: 'nesoi',
    label: 'What did he do at Nesoi?',
    prompt: 'What did Dev design at Nesoi.ai, and what was the outcome?',
    match: /\bnesoi\b/i,
  },
  {
    id: 'crm',
    label: 'The CRM redesign',
    prompt: 'Walk me through the CRM redesign Dev led at Ditto.',
    match: /\bcrm\b/i,
  },
  {
    id: 'falcon',
    label: 'The Falcon design system',
    prompt: 'What is the Falcon design system Dev built at Ditto?',
    match: /\b(falcon|design system)\b/i,
  },
  {
    id: 'onboarding',
    label: 'Ditto onboarding',
    prompt: 'How did Dev improve the Ditto onboarding and slot-booking flow?',
    match: /\b(onboarding|booking)\b/i,
  },
  {
    id: 'impact',
    label: 'His measurable impact',
    prompt: 'What measurable impact has Dev delivered across Finshots, Nesoi, and Ditto?',
    match: /\b(impact|metrics?|numbers?|results?|measurable)\b/i,
  },
  {
    id: 'skills',
    label: 'His skills and tools',
    prompt: "What are Dev's core skills and the tools he designs and builds with?",
    match: /\b(skills?|tools?|expertise|stack)\b/i,
  },
  {
    id: 'career',
    label: 'His career journey',
    prompt: "Walk me through Dev's career journey and the roles he has held.",
    match: /\b(career|experience|background|journey|roles?)\b/i,
  },
  {
    id: 'education',
    label: 'His education',
    prompt: 'What is Dev’s education, and which certifications does he hold?',
    match: /\b(education|degree|university|studied|certification)\b/i,
  },
  {
    id: 'ship-code',
    label: 'Can he ship code?',
    prompt: 'Can Dev ship production code? Show his engineering stack and CS background.',
    match: /\b(ship code|production code|designer.?engineer|engineering|code)\b/i,
  },
  {
    id: 'hire',
    label: 'Why hire him?',
    prompt: 'Why hire Dev as a product designer who also engineers and ships?',
    match: /\b(why hire|why should|hire)\b/i,
  },
  {
    id: 'contact',
    label: 'How to reach him',
    prompt: 'How can I get in touch with Dev?',
    match: /\b(contact|email|reach|linkedin|hire him for|get in touch)\b/i,
  },
];

/** Steer the next question toward neighbouring topics rather than a random jump. */
const RELATED: Record<string, string[]> = {
  finshots: ['impact', 'nesoi', 'crm'],
  nesoi: ['impact', 'finshots', 'skills'],
  crm: ['falcon', 'onboarding', 'impact'],
  falcon: ['crm', 'skills', 'impact'],
  onboarding: ['crm', 'impact', 'finshots'],
  impact: ['finshots', 'nesoi', 'crm'],
  skills: ['ship-code', 'career', 'falcon'],
  career: ['finshots', 'nesoi', 'education'],
  education: ['career', 'skills', 'ship-code'],
  'ship-code': ['skills', 'hire', 'nesoi'],
  hire: ['impact', 'ship-code', 'contact'],
  contact: ['hire', 'impact', 'career'],
};

const DEFAULT_ORDER = ['finshots', 'impact', 'nesoi', 'ship-code', 'career', 'skills', 'hire'];

function topicOf(prompt: string): string | null {
  return GEN_UI_FOLLOW_UPS.find((f) => f.match.test(prompt))?.id ?? null;
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded shuffle — varies between messages but stays stable across re-renders. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Three follow-ups for the message just answered, skipping anything the
 * conversation has already covered.
 */
export function getFollowUps(
  prompt: string,
  askedPrompts: string[] = [],
  seed = '',
): GenUIFollowUp[] {
  const covered = new Set<string>();
  for (const asked of [prompt, ...askedPrompts]) {
    const id = topicOf(asked);
    if (id) covered.add(id);
  }

  const byId = new Map(GEN_UI_FOLLOW_UPS.map((f) => [f.id, f]));
  const rand = hash(`${seed}|${prompt}|${askedPrompts.length}`);
  // Related topics still lead, but each tier is shuffled so consecutive
  // messages don't surface the same trio.
  const ordered = [
    ...shuffle([...(RELATED[topicOf(prompt) ?? ''] ?? [])], rand),
    ...shuffle(DEFAULT_ORDER, rand ^ 0x9e3779b9),
    ...shuffle([...byId.keys()], rand ^ 0x85ebca6b),
  ];

  const picked: GenUIFollowUp[] = [];
  const seen = new Set<string>();
  for (const id of ordered) {
    if (picked.length === 3) break;
    const item = byId.get(id);
    if (!item || seen.has(id) || covered.has(id)) continue;
    seen.add(id);
    picked.push(item);
  }

  // Everything covered already — fall back to the default trio so the user is
  // never left without a next step.
  if (picked.length < 3) {
    for (const id of shuffle([...byId.keys()], rand)) {
      if (picked.length === 3) break;
      const item = byId.get(id);
      if (!item || seen.has(id)) continue;
      seen.add(id);
      picked.push(item);
    }
  }

  return picked;
}
