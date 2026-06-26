import type { GenUIItem } from '@/lib/gen-ui-registry';
import { CARD_REGISTRY } from '@/lib/gen-ui-registry';
import {
  filterRelevantItems,
  getTopicSlugFromPrompt,
  isCompaniesQuery,
  isExperienceQuery,
  isOverviewQuery,
  isSpecificTopicQuery,
  itemMatchesSlug,
} from '@/lib/filter-relevant-gen-ui';
import { getItemSlug } from '@/lib/gen-ui-item-slug';
import { MAX_VIEWPORT_CARDS } from '@/lib/gen-ui-constants';
import { normalizeGenUIItemsForGrid } from '@/lib/gen-ui-grid';
import { resumeData } from '@/lib/resume-data';

export { MAX_VIEWPORT_CARDS };

export const WORDSMITH_LOCKED_MESSAGE = `Wordsmith AI is a locked, confidential project. Please contact Dev at ${resumeData.email} or via LinkedIn to learn more.`;

export function isWordsmithQuery(prompt: string): boolean {
  return /\bwordsmith\b/i.test(prompt);
}

export function isCaseStudyQuery(prompt: string): boolean {
  return /\b(case stud(y|ies)|deep dive|project breakdown|tell me about (?:the )?(?:finshots|nesoi|falcon|crm|onboarding|ditto))\b/i.test(
    prompt,
  );
}

function applyWordsmithLocked(items: GenUIItem[]): GenUIItem[] {
  const locked = [
    CARD_REGISTRY['feature:wordsmith-locked'],
    CARD_REGISTRY['info:wordsmith-locked'],
  ].filter(Boolean) as GenUIItem[];
  return locked.length > 0 ? locked : items;
}

const EXPERIENCE_CARD_IDS = ['feature:career'] as const;

const COMPANIES_CARD_IDS = [
  'timeline:ditto-finshots',
  'timeline:nesoi',
  'timeline:wordsmith',
] as const;

function resolveRegistryCards(ids: readonly string[]): GenUIItem[] {
  return ids.map((id) => CARD_REGISTRY[id]).filter(Boolean) as GenUIItem[];
}

function isCareerFeatureSection(item: GenUIItem): boolean {
  return (
    item.type === 'feature_section' &&
    /fintech|five years|shipping product design/i.test(item.headline)
  );
}

function ensureCareerCards(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (isExperienceQuery(prompt)) {
    const kept = items.filter((i) => isCareerFeatureSection(i) || i.type === 'quote');
    if (kept.length > 0) return kept.slice(0, MAX_VIEWPORT_CARDS);
    return resolveRegistryCards(EXPERIENCE_CARD_IDS);
  }

  if (isCompaniesQuery(prompt)) {
    const timelines = items.filter((i) => i.type === 'timeline');
    if (timelines.length >= 2) return timelines.slice(0, MAX_VIEWPORT_CARDS);
    return resolveRegistryCards(COMPANIES_CARD_IDS);
  }

  return items;
}

export function enrichGenUIItems(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (isWordsmithQuery(prompt)) return applyWordsmithLocked([]);

  let next = filterRelevantItems(items, prompt);
  next = ensureCareerCards(next, prompt);
  next = ensureTopicItems(next, prompt);
  next = ensureOverviewProjects(next, prompt);
  next = supplementProjectViewport(next, prompt);
  next = supplementInteractiveCards(next, prompt);
  return normalizeGenUIItemsForGrid(next, prompt);
}

const PROJECT_DEFAULT_CARD_IDS: Record<string, string[]> = {
  'finshots-news-app': [
    'case:finshots-news-app:project',
    'case:finshots-news-app:impact',
    'image:case:finshots-news-app:hero',
    'video:case:finshots-news-app:walkthrough',
    'chart:downloads',
    'feature:finshots',
  ],
  'nesoi-ai-dashboard': [
    'case:nesoi-ai-dashboard:project',
    'case:nesoi-ai-dashboard:impact',
    'chart:nesoi',
    'feature:nesoi',
  ],
  'falcon-design-system': [
    'case:falcon-design-system:project',
    'case:falcon-design-system:impact',
    'stat:devtime',
    'feature:falcon',
  ],
  'crm-redesign': [
    'case:crm-redesign:project',
    'case:crm-redesign:impact',
    'stat:efficiency',
    'image:crm',
  ],
  'onboarding-redesign': [
    'case:onboarding-redesign:project',
    'case:onboarding-redesign:impact',
    'stat:conversion',
    'stat:dropoff',
  ],
};

const OVERVIEW_PROJECT_CARD_IDS = [
  'case:finshots-news-app:project',
  'case:nesoi-ai-dashboard:project',
  'case:falcon-design-system:project',
  'case:crm-redesign:project',
  'case:onboarding-redesign:project',
] as const;

function uniqueProjectSlugs(items: GenUIItem[]): Set<string> {
  const slugs = new Set<string>();
  for (const item of items) {
    const slug = getItemSlug(item);
    if (!slug) continue;
    if (item.type === 'project' || item.type === 'image' || item.type === 'video') {
      slugs.add(slug);
    }
  }
  return slugs;
}

function resolveOverviewProjectCards(): GenUIItem[] {
  return OVERVIEW_PROJECT_CARD_IDS.map((id) => CARD_REGISTRY[id]).filter(Boolean) as GenUIItem[];
}

function ensureOverviewProjects(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (!isOverviewQuery(prompt)) return items;

  const slugs = uniqueProjectSlugs(items);
  const looseMetrics = items.filter((i) => (i.type === 'stat' || i.type === 'chart') && !getItemSlug(i));
  const dominatedByMetrics = looseMetrics.length >= 2 && slugs.size < 2;

  if (slugs.size === 0 || dominatedByMetrics) {
    const projects = resolveOverviewProjectCards();
    const chart = CARD_REGISTRY['chart:impact'] as GenUIItem | undefined;
    const result = chart ? [...projects, chart] : projects;
    return result.slice(0, MAX_VIEWPORT_CARDS);
  }

  let next = items.filter((i) => !(i.type === 'stat' && !getItemSlug(i)));

  const present = uniqueProjectSlugs(next);
  for (const id of OVERVIEW_PROJECT_CARD_IDS) {
    if (next.length >= MAX_VIEWPORT_CARDS) break;
    const card = CARD_REGISTRY[id] as GenUIItem | undefined;
    const slug = card ? getItemSlug(card) : null;
    if (card && slug && !present.has(slug)) {
      next.push(card);
      present.add(slug);
    }
  }

  return next.slice(0, MAX_VIEWPORT_CARDS);
}

function ensureTopicItems(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (!isSpecificTopicQuery(prompt)) return items;

  const slug = getTopicSlugFromPrompt(prompt);
  if (!slug) return items;

  const hasTopicMatch = items.some(
    (i) => getItemSlug(i) === slug || itemMatchesSlug(i, slug),
  );

  const ids =
    PROJECT_DEFAULT_CARD_IDS[slug] ??
    [`case:${slug}:project`, `case:${slug}:impact`, PROJECT_FEATURE_IDS[slug]].filter(
      (id): id is string => Boolean(id),
    );

  const defaults = ids.map((id) => CARD_REGISTRY[id]).filter(Boolean) as GenUIItem[];
  if (defaults.length === 0) return items;

  // Agent picked relevant cards — keep them and only fill gaps.
  if (hasTopicMatch) return items;

  // Agent missed the topic entirely — use defaults, but preserve any extras it did pick.
  if (items.length === 0) return defaults.slice(0, MAX_VIEWPORT_CARDS);

  const merged = [...items];
  for (const card of defaults) {
    if (merged.length >= MAX_VIEWPORT_CARDS) break;
    const cardSlug = getItemSlug(card);
    const alreadyCovered =
      cardSlug &&
      merged.some((i) => getItemSlug(i) === cardSlug && i.type === card.type);
    if (!alreadyCovered) merged.push(card);
  }
  return merged.slice(0, MAX_VIEWPORT_CARDS);
}

const PROJECT_FEATURE_IDS: Record<string, string> = {
  'finshots-news-app': 'feature:finshots',
  'falcon-design-system': 'feature:falcon',
  'nesoi-ai-dashboard': 'feature:nesoi',
  'crm-redesign': 'feature:impact',
  'onboarding-redesign': 'feature:impact',
};

function supplementProjectViewport(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (!isSpecificTopicQuery(prompt)) return items;

  const primarySlug = getTopicSlugFromPrompt(prompt) ?? getItemSlug(items[0] ?? { type: 'info', title: '', body: '' });
  if (!primarySlug) return items;

  const featureId = PROJECT_FEATURE_IDS[primarySlug];
  if (!featureId) return items;

  const hasIllustration = items.some((i) => i.type === 'feature' || i.type === 'feature_section');
  if (hasIllustration) return items;

  const feature = CARD_REGISTRY[featureId] as GenUIItem | undefined;
  if (feature && feature.type === 'feature') {
    return [...items, feature];
  }

  return items;
}

const TOPIC_CHART_IDS: Record<string, string> = {
  'finshots-news-app': 'chart:downloads',
  'nesoi-ai-dashboard': 'chart:nesoi',
  'falcon-design-system': 'chart:skills',
  'crm-redesign': 'chart:impact',
  'onboarding-redesign': 'chart:impact',
};

const OVERVIEW_INTERACTIVE_IDS = ['chart:impact', 'feature:impact', 'stat:engagement', 'stat:conversion'] as const;

function supplementInteractiveCards(items: GenUIItem[], prompt: string): GenUIItem[] {
  if (isWordsmithQuery(prompt)) return items;
  if (isExperienceQuery(prompt) || isCompaniesQuery(prompt)) return items;

  const next = [...items];
  const hasType = (type: GenUIItem['type']) => next.some((i) => i.type === type);
  const slug = getTopicSlugFromPrompt(prompt);

  const pushId = (id: string) => {
    if (next.length >= MAX_VIEWPORT_CARDS) return;
    if (CARD_REGISTRY[id] && !items.some((i) => JSON.stringify(i) === JSON.stringify(CARD_REGISTRY[id]))) {
      const card = CARD_REGISTRY[id] as GenUIItem;
      if (!next.some((i) => i.type === card.type && JSON.stringify(i).slice(0, 80) === JSON.stringify(card).slice(0, 80))) {
        next.push(card);
      }
    }
  };

  if (slug) {
    if (!hasType('chart') && TOPIC_CHART_IDS[slug]) pushId(TOPIC_CHART_IDS[slug]);
    if (!hasType('video') && slug === 'finshots-news-app') pushId('video:case:finshots-news-app:walkthrough');
    if (!hasType('stat')) {
      if (slug === 'onboarding-redesign') pushId('stat:conversion');
      else if (slug === 'nesoi-ai-dashboard') pushId('stat:engagement');
      else if (slug === 'falcon-design-system') pushId('stat:devtime');
    }
  } else if (isOverviewQuery(prompt)) {
    const hasProjects = uniqueProjectSlugs(next).size >= 2;
    if (hasProjects && !hasType('chart')) pushId('chart:impact');
  } else if (!isSpecificTopicQuery(prompt)) {
    if (!hasType('chart')) pushId(OVERVIEW_INTERACTIVE_IDS[0]);
    if (!hasType('feature') && !hasType('feature_section')) pushId(OVERVIEW_INTERACTIVE_IDS[1]);
    if (!hasType('stat')) pushId(OVERVIEW_INTERACTIVE_IDS[2]);
  }

  return next.slice(0, MAX_VIEWPORT_CARDS);
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
    [/\b(gen ui|gen-ui)\b/i, 'Gen UI'],
    [/\b(what is|what'?s|explain|how does|how do)\b.*\b(this|here|mode|feature|viewport)\b/i, 'Gen UI'],
    [/\b(resume|cv)\b/, "Dev's Resume"],
    [/\bfinshots\b/, 'Finshots'],
    [/\b(falcon|design system)\b/, 'Falcon Design System'],
    [/\bnesoi\b/, 'Nesoi.ai'],
    [/\bcrm\b/, 'CRM Redesign'],
    [/\b(onboarding|ditto insurance|ditto)\b/, 'Ditto Onboarding'],
    [/\b(all|every|overview of)\b.*\b(projects?|works?|case studies?)\b/i, 'Selected Work'],
    [/\b(show|tell).*\b(all|every|each)\b.*\b(projects?|works?)\b/i, 'Selected Work'],
    [/\b(projects?|works?|case studies?|portfolio)\b/, 'Selected Work'],
    [/\bcase stud(y|ies)\b/, 'Case Studies'],
    [/\b(skill|tools?)\b/, 'Skills & Expertise'],
    [/\b(latest|recent)\b/, 'Recent Work'],
    [/\b(impact|metrics?|numbers?|results?)\b/, 'Impact at a Glance'],
    [/\b(compan(y|ies)|employer|employers|where\s+(?:did|has)\s+he\s+work)\b/i, 'Companies'],
    [/\b(experience|career|timeline|background|journey|progression)\b/, 'Career Journey'],
    [/\b(education|degree|university)\b/, 'Education & Credentials'],
    [/\b(certifications?|certs?|awards?)\b/, 'Awards & Certifications'],
    [/\b(contact|reach|email|touch)\b/, 'Get in Touch'],
    [/\b(about|who is)\b.*\b(dev|him|he|designer)\b/i, 'About Dev'],
    [/\bwordsmith\b/, 'Wordsmith AI'],
    [/\b(arrange|reorder|prioriti[sz]e|layout|hide\s|show\s+(?:photos|experience|sections?))\b/, 'Portfolio Layout'],
  ];

  for (const [re, title] of rules) {
    if (re.test(p)) return title;
  }

  return titleFromPrompt(prompt);
}

function titleFromPrompt(prompt: string): string {
  let t = prompt.trim().replace(/\?+$/, '').trim();
  t = t.replace(
    /^(what is|what are|what's|how does|how do|tell me about|show me|can you|could you|who is|who are)\s+/i,
    '',
  );
  t = t.replace(/^(his|her|the|a|an)\s+/i, '');

  if (!t) return 'Your question';

  if (t.length > 52) {
    const cut = t.slice(0, 52);
    const lastSpace = cut.lastIndexOf(' ');
    t = `${(lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }

  return t.charAt(0).toUpperCase() + t.slice(1);
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
    return prompt ? fallbackStorySummary(prompt) : '';
  }

  if (prompt && isCaseStudyQuery(prompt) && s.length < 180) {
    return fallbackStorySummary(prompt);
  }

  return s;
}

/** Split agent narrative into readable story paragraphs for the viewport header. */
export function formatStoryParagraphs(text: string): string[] {
  const s = stripMarkdown(text).trim();
  if (!s) return [];

  const byBreak = s.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (byBreak.length > 1) return byBreak;

  const sentences = s.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map((x) => x.trim()) ?? [s];
  if (sentences.length <= 2) return [s];

  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(' ').trim());
  }
  return paragraphs.filter(Boolean);
}

export function fallbackLeadSummary(prompt: string): string {
  return fallbackStorySummary(prompt);
}

export function fallbackStorySummary(prompt: string): string {
  const p = prompt.toLowerCase();

  if (isCaseStudyQuery(prompt)) {
    if (/\bfinshots\b/.test(p)) {
      return "Finshots is Dev's award-winning fintech news app — his first major product design role at Finshots & Ditto in Bangalore, where he shaped the mobile experience from early UI explorations through shipped flows.\n\nThe core challenge was making financial news feel approachable on a phone: dense topics, scattered archives, and readers who wanted to revisit stories without endless scrolling.\n\nBelow you'll find the project overview, impact metrics, and screen recordings that show how the product evolved.";
    }
    if (/\bnesoi\b/.test(p)) {
      return "Nesoi.ai is an AI-powered learning platform used by enterprise teams — Dev led dashboard and creation-flow design so educators could build interactive modules without manual assembly.\n\nThe challenge was trust and speed: creators needed to upload raw materials and turn them into structured learning experiences through conversation, not rigid wizards.\n\nExplore the cards below for the product story, key outcomes, and prototype work from that engagement.";
    }
    if (/\b(falcon|design system)\b/.test(p)) {
      return "Falcon is the design system Dev built for Ditto Insurance — a shared language for shipping consistent, accessible flows across CRM, onboarding, and adviser-facing products.\n\nThe challenge was fragmentation: teams were reinventing components, slowing delivery, and drifting from accessible patterns as the product surface grew.\n\nThe cards below cover the system scope, efficiency gains, and the components that scaled across the org.";
    }
    if (/\b(crm)\b/.test(p)) {
      return "The CRM redesign replaced manual Excel tracking with role-specific workflows for insurance advisers — one of Dev's highest-impact enterprise projects at Ditto.\n\nManual lead tracking couldn't scale with volume, and the existing tooling lacked real-time insight and a cohesive interface tailored to how advisers actually work.\n\nBelow are the project summary, measurable outcomes, and interface highlights from the redesign.";
    }
    if (/\b(onboarding|ditto|booking)\b/.test(p)) {
      return "Ditto's onboarding redesign focused on slot booking and trust — reducing drop-off in a flow where users hesitated at phone-number entry and abandoned when preferred times weren't available.\n\nDev led research-backed iterations across WhatsApp support, spam-trust treatments, and autosave patterns so progress wasn't lost on accidental exits.\n\nThe cards below walk through the problem framing, solutions shipped, and the conversion impact that followed.";
    }
    return "Each case study in Dev's portfolio follows the same arc: a product context, a concrete design challenge, and the measurable outcome that followed.\n\nDev's work spans fintech news, insurance onboarding, enterprise CRM, AI learning dashboards, and design systems — always grounded in research, iteration, and shipped results.\n\nPick a project card below to dive into the problem, approach, and impact for that engagement.";
  }

  const short = deriveShortTitle(prompt).toLowerCase();
  const map: Record<string, string> = {
    "dev's resume": "Every credential here tells part of the story — from formal education to the certifications that sharpened Dev's craft. Browse the highlights below to see how training and recognition shaped the designer behind these projects.",
    'skills & expertise': "Five years of product design across fintech, insurance, and AI left a distinct toolkit in its wake. The skills below aren't a laundry list — they're the instruments Dev reaches for when turning research into shipped work.",
    'selected work': "These projects trace a line from early mobile news design to enterprise dashboards and design systems. Each one carries a problem, a bet, and an outcome — explore the cards below to follow that thread.",
    'impact at a glance': "Numbers only matter when they sit inside a story. What follows are the metrics that moved — conversion lifts, user growth, and efficiency gains from work Dev led or shaped directly.",
    'career journey': "Dev's path runs through Finshots and Ditto in Bangalore, then Nesoi in San Francisco, and onward into AI product work. The timeline below maps roles to the moments that defined each chapter.",
    'wordsmith ai': "Wordsmith sits behind a closed door — confidential AI writing infrastructure Dev helped shape. What can be shared is here; for the rest, reach out directly.",
    'education & credentials': "Before the shipped products came the foundations — degrees, certifications, and awards that grounded Dev's practice in research and craft.",
    finshots: "Finshots began as a question: how do you make financial news feel alive on a phone? What follows is the story of that mobile product — the design choices, the impact, and the work that still echoes in Dev's portfolio.",
    'falcon design system': "Falcon grew out of a familiar pain — teams shipping insurance flows without a shared language. Below is how a design system took root and scaled across products.",
    'nesoi.ai': "At Nesoi, dashboards had to earn trust fast — educators and operators making high-stakes calls from a single screen. Explore how that constraint shaped the work.",
    'gen ui': "Gen UI turns your question into a living viewport — narrative up top, then cards pulled from Dev's portfolio. Ask about a project, skill, or career thread and it assembles a focused view just for that.",
  };
  return map[short] || "Here's a curated slice of Dev's portfolio — shaped by your question and ready to explore below.";
}
