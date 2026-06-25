import type { GenUIItem } from '@/lib/gen-ui-registry';
import { CARD_REGISTRY } from '@/lib/gen-ui-registry';
import { CASE_STUDY_SLUGS } from '@/lib/build-case-study-cards';
import { dedupeGenUIItems } from '@/lib/organize-gen-ui';
import { resumeData } from '@/lib/resume-data';

export const MAX_VIEWPORT_CARDS = 6;

export const WORDSMITH_LOCKED_MESSAGE = `Wordsmith AI is a locked, confidential project. Please contact Dev at ${resumeData.email} or via LinkedIn to learn more.`;

const FEATURE_BY_PROMPT: Array<{ test: RegExp; cardId: string }> = [
  { test: /\bwordsmith\b/i, cardId: 'feature:wordsmith-locked' },
  { test: /\b(resume|cv|education|degree|university|qualification|certification|cert)\b/i, cardId: 'feature:education' },
  { test: /\b(skill|tools?|design skill|research skill|where.*skill)\b/i, cardId: 'feature:skills' },
  { test: /\b(impact|metric|conversion|engagement|number|result)\b/i, cardId: 'feature:impact' },
  { test: /\b(career|experience|timeline|background|journey|work history)\b/i, cardId: 'feature:career' },
  { test: /\bfinshots\b/i, cardId: 'feature:finshots' },
  { test: /\b(falcon|design system)\b/i, cardId: 'feature:falcon' },
  { test: /\bnesoi\b/i, cardId: 'feature:nesoi' },
  { test: /\b(projects?|works?|latest|recent|portfolio)\b/i, cardId: 'feature:impact' },
];

const PROJECT_SLUG_BY_PROMPT: Array<{ test: RegExp; slug: string }> = [
  { test: /\bfinshots\b/i, slug: 'finshots-news-app' },
  { test: /\b(falcon|design system)\b/i, slug: 'falcon-design-system' },
  { test: /\b(crm)\b/i, slug: 'crm-redesign' },
  { test: /\b(onboarding|ditto insurance|booking portal)\b/i, slug: 'onboarding-redesign' },
  { test: /\bnesoi\b/i, slug: 'nesoi-ai-dashboard' },
];

export function isWordsmithQuery(prompt: string): boolean {
  return /\bwordsmith\b/i.test(prompt);
}

export function applyWordsmithLocked(items: GenUIItem[]): GenUIItem[] {
  const locked = [
    CARD_REGISTRY['feature:wordsmith-locked'],
    CARD_REGISTRY['info:wordsmith-locked'],
  ].filter(Boolean) as GenUIItem[];
  return locked.length > 0 ? locked : items;
}

function uniqueCards(cards: GenUIItem[]): GenUIItem[] {
  const seen = new Set<GenUIItem>();
  return cards.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function cardsForSlug(slug: string): GenUIItem[] {
  const ids = [`case:${slug}:project`, `case:${slug}:impact`];
  const mediaIds = Object.keys(CARD_REGISTRY)
    .filter((id) => id.startsWith(`image:case:${slug}:`) || id.startsWith(`video:case:${slug}:`))
    .slice(0, 2);

  return uniqueCards(
    [...ids, ...mediaIds]
      .map((id) => CARD_REGISTRY[id])
      .filter(Boolean) as GenUIItem[],
  );
}

export function capViewportItems(items: GenUIItem[]): GenUIItem[] {
  if (items.length <= MAX_VIEWPORT_CARDS) return items;

  const features = items.filter((i) => i.type === 'feature' || i.type === 'feature_section');
  const rest = items.filter((i) => i.type !== 'feature' && i.type !== 'feature_section');
  return [...features, ...rest].slice(0, MAX_VIEWPORT_CARDS);
}

export function enrichCaseStudyMedia(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (isWordsmithQuery(prompt)) return items;

  const projectMatch = PROJECT_SLUG_BY_PROMPT.find(({ test }) => test.test(prompt));
  if (projectMatch) {
    const additions = cardsForSlug(projectMatch.slug);
    const existing = new Set(items);
    return uniqueCards([...items, ...additions.filter((card) => !existing.has(card))]);
  }

  if (/\b(all|every|overview|multiple|projects?|works?|portfolio)\b/i.test(prompt)) {
    const additions = CASE_STUDY_SLUGS.slice(0, 3).flatMap((slug) => {
      const project = CARD_REGISTRY[`case:${slug}:project`];
      const media = Object.keys(CARD_REGISTRY)
        .filter((id) => id.startsWith(`image:case:${slug}:`))
        .slice(0, 1)
        .map((id) => CARD_REGISTRY[id])
        .filter(Boolean);
      return [project, ...media].filter(Boolean) as GenUIItem[];
    });
    const existing = new Set(items);
    return uniqueCards([...items, ...additions.filter((card) => !existing.has(card))]);
  }

  return items;
}

export function enrichGenUIItems(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (isWordsmithQuery(prompt)) return applyWordsmithLocked([]);

  const hasLineArt = items.some((item) => item.type === 'feature' || item.type === 'feature_section');
  let next = items;

  if (!hasLineArt) {
    const match = FEATURE_BY_PROMPT.find(({ test }) => test.test(prompt));
    if (!match) {
      const fallback = CARD_REGISTRY['feature:impact'];
      next = fallback ? [fallback, ...items] : items;
    } else {
      const feature = CARD_REGISTRY[match.cardId];
      next = feature ? [feature, ...items] : items;
    }
  }

  return capViewportItems(dedupeGenUIItems(enrichCaseStudyMedia(next, prompt)));
}

export function stripAgentMeta(text: string): string {
  return text.replace(/\n\n_\d+ tool step[\s\S]*?$/i, '').trim();
}

export function capitalizePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function deriveShortTitle(prompt: string): string {
  const p = prompt.toLowerCase().trim();
  const rules: Array<[RegExp, string]> = [
    [/\b(resume|cv)\b/, "Dev's Resume"],
    [/\b(projects?|works?|case studies?|portfolio)\b/, 'Selected Work'],
    [/\b(skill|tools?)\b/, 'Skills & Expertise'],
    [/\b(latest|recent)\b/, 'Recent Work'],
    [/\b(impact|metrics?|numbers?|results?)\b/, 'Impact at a Glance'],
    [/\b(experience|career|timeline|background|journey)\b/, 'Career Journey'],
    [/\b(education|degree|university)\b/, 'Education & Credentials'],
    [/\b(certifications?|certs?|awards?)\b/, 'Awards & Certifications'],
    [/\bfinshots\b/, 'Finshots'],
    [/\b(falcon|design system)\b/, 'Falcon Design System'],
    [/\bnesoi\b/, 'Nesoi.ai'],
    [/\b(contact|reach|email|touch)\b/, 'Get in Touch'],
    [/\b(about|who is)\b/, 'About Dev'],
    [/\bwordsmith\b/, 'Wordsmith AI'],
    [/\b(arrange|reorder|prioriti[sz]e|layout|hide\s|show\s+(?:photos|experience|sections?))\b/, 'Portfolio Layout'],
  ];

  for (const [re, title] of rules) {
    if (re.test(p)) return title;
  }

  return 'Overview';
}

export function stripMarkdown(text: string): string {
  let s = stripAgentMeta(text);
  s = s.replace(/^#{1,6}\s+[^\n]*/gm, '');
  s = s.replace(/#{1,6}\s+/g, '');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/__([^_]+)__/g, '$1');
  s = s.replace(/_([^_\n]+)_/g, '$1');
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  s = s.replace(/\[[^\]]*(?:can be added|details about|placeholder)[^\]]*\]/gi, '');
  s = s.replace(/^\s*[-*•]\s+/gm, '');
  s = s.replace(/^\s*\d+[.)]\s+/gm, '');
  s = s.replace(/:\s*[-*•]\s*/g, '.\n');
  s = s.replace(/\.\s+(?=[A-Z][a-z]+:)/g, '.\n');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

export function formatLeadSummary(text: string, prompt?: string): string {
  const s = stripMarkdown(text);

  if (!s || s.includes('###') || s.includes('**') || s.includes('__')) {
    return prompt ? fallbackLeadSummary(prompt) : '';
  }

  return s;
}

export function fallbackLeadSummary(prompt: string): string {
  const short = deriveShortTitle(prompt).toLowerCase();
  const map: Record<string, string> = {
    "dev's resume": "Education, degrees, certifications, and awards pulled from Dev's portfolio.",
    'skills & expertise': "Design, research, and tool skills from five years of product design work.",
    'selected work': "Highlighted projects with outcomes from Dev's product design career.",
    'impact at a glance': "Key metrics and results across Dev's roles in fintech, insurance, and AI.",
    'career journey': "Roles across Finshots & Ditto (2019–2022), Nesoi, and Wordsmith AI.",
    'wordsmith ai': 'Confidential AI writing platform work — contact Dev directly to learn more.',
    'education & credentials': "Degrees and certifications that shaped Dev's design practice.",
  };
  return map[short] || "Curated from Dev's portfolio based on your question.";
}
