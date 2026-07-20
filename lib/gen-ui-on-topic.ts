import {
  isCompaniesQuery,
  isContactQuery,
  isEducationQuery,
  isExperienceQuery,
  isOverviewQuery,
  isSpecificTopicQuery,
} from '@/lib/filter-relevant-gen-ui';
import { isStarterChipQuery } from '@/lib/gen-ui-starter-chips';
import { resumeData } from '@/lib/resume-data';

function isWordsmithQuery(prompt: string): boolean {
  return /\bwordsmith\b/i.test(prompt);
}

function isCaseStudyQuery(prompt: string): boolean {
  return /\b(case stud(y|ies)|deep dive|project breakdown|tell me about (?:the )?(?:finshots|nesoi|falcon|crm|onboarding|ditto))\b/i.test(
    prompt,
  );
}

/** Signals the prompt is about Dev, this portfolio, or Gen UI mode. */
const PORTFOLIO_TOPIC =
  /\b(dev(?:adhathan)?|his|he|him|portfolio|project|work|designer|design|ux|ui|product|finshots|nesoi|falcon|crm|ditto|onboarding|wordsmith|career|experience|skill|impact|hire|contact|email|linkedin|resume|education|certification|award|fintech|insurance|case stud|gen ui|gen-ui|figma|prototype|cursor|claude|framer|developer|engineer|shipped|metrics?|timeline|background|strongest|playground|about you|about dev|this site|this page|what can you do|what do you do|how does this work|how do i use)\b/i;

const LAYOUT_TOPIC =
  /\b(arrange|reorder|prioriti[sz]e|layout|hide|show)\b.*\b(section|photo|experience|project|card)\b/i;

/** Portfolio areas this site can actually answer with cards and narrative. */
const ANSWERABLE_INTENT =
  /\b(skill|tools?|expertise|stack|impact|metrics?|numbers?|results?|measurable|strongest|best work|top work|award|flagship|ship code|production code|designer.?engineer|why hire|hire (?:him|dev)|certifications?|certs?|awards?|resume|cv|gen ui|gen-ui|this site|this page|how does this work|how do i use|playground|prototype|figma|cursor|claude|framer|developer|engineer|shipped|timeline|background|fintech|insurance|portfolio|project|work|design|ux|ui|product)\b/i;

const ABOUT_DEV =
  /\b(about|who is|introduce)\b.*\b(dev|him|he|designer)\b|\babout dev\b/i;

export function hasKnownPortfolioIntent(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;

  if (isStarterChipQuery(trimmed)) return true;
  if (isWordsmithQuery(trimmed)) return true;
  if (isContactQuery(trimmed)) return true;
  if (isEducationQuery(trimmed)) return true;
  if (isExperienceQuery(trimmed)) return true;
  if (isCompaniesQuery(trimmed)) return true;
  if (isOverviewQuery(trimmed)) return true;
  if (isSpecificTopicQuery(trimmed)) return true;
  if (isCaseStudyQuery(trimmed)) return true;
  if (LAYOUT_TOPIC.test(trimmed)) return true;
  if (ABOUT_DEV.test(trimmed)) return true;
  if (ANSWERABLE_INTENT.test(trimmed)) return true;
  if (/\b(finshots|nesoi|falcon|crm|ditto|onboarding|wordsmith)\b/i.test(trimmed)) return true;

  return false;
}

/** On-topic (about Dev) but not covered by portfolio data — show contact instead of generic cards. */
export function isInsufficientContextQuery(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  if (isOffTopicGenUIPrompt(trimmed)) return false;
  if (hasKnownPortfolioIntent(trimmed)) return false;
  return isPortfolioGenUITopic(trimmed);
}

export function insufficientContextTitle(): string {
  return 'Get in Touch';
}

export function insufficientContextMessage(prompt: string): string {
  const trimmed = prompt.trim();
  const quoted = trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;

  return `I don't have much context about that in Dev's portfolio — it's built around his work, projects, skills, and career, not personal details.\n\n"${quoted}" isn't something I can answer well from what's here. Reach out to Dev directly and he can follow up in conversation.\n\nUse the contact card below for email, LinkedIn, and location.`;
}

export function isPortfolioGenUITopic(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;

  if (isStarterChipQuery(trimmed)) return true;
  if (isWordsmithQuery(trimmed)) return true;
  if (isContactQuery(trimmed)) return true;
  if (isEducationQuery(trimmed)) return true;
  if (isExperienceQuery(trimmed)) return true;
  if (isCompaniesQuery(trimmed)) return true;
  if (isOverviewQuery(trimmed)) return true;
  if (isSpecificTopicQuery(trimmed)) return true;
  if (isCaseStudyQuery(trimmed)) return true;
  if (LAYOUT_TOPIC.test(trimmed)) return true;
  if (PORTFOLIO_TOPIC.test(trimmed)) return true;

  return false;
}

export function isOffTopicGenUIPrompt(prompt: string): boolean {
  return !isPortfolioGenUITopic(prompt);
}

export function offTopicGenUITitle(): string {
  return 'Ask about Dev';
}

export function offTopicGenUIMessage(prompt: string): string {
  const trimmed = prompt.trim();
  const quoted = trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;

  return `This assistant only answers questions about Dev — his work, projects, skills, career, and impact as a product designer who ships code.\n\n"${quoted}" is outside that scope, so there are no portfolio cards for it.\n\nTry asking about Finshots, Nesoi, his design-to-code workflow, measurable impact, or reach him at ${resumeData.email}.`;
}
