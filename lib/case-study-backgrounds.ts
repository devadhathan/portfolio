/** Active painting backgrounds for case-study screen stages. */
export const CASE_STUDY_BACKGROUNDS = [
  '/photos/case-study-bg/castle-golden-hour.webp',
  '/photos/case-study-bg/coastal-fjord.webp',
  '/photos/case-study-bg/forth-bridge.webp',
  '/photos/case-study-bg/harbor-quay.webp',
  '/photos/case-study-bg/kuwasseg-riverside.webp',
  '/photos/case-study-bg/cliff-castle.webp',
  '/photos/case-study-bg/highland-mist.webp',
  '/photos/case-study-bg/riverside-town.webp',
  '/photos/case-study-bg/olavinlinna-castle.webp',
  '/photos/case-study-bg/mountain-sunset.webp',
  '/photos/case-study-bg/golden-valley.webp',
  '/photos/case-study-bg/river-boat.webp',
  '/photos/case-study-bg/manor-hill.webp',
  '/photos/case-study-bg/pastoral-stream.webp',
] as const;

/** Stable per-project slots so neighboring stages never share a painting. */
const PROJECT_BG_SLOTS: Record<string, Record<string, number>> = {
  nesoi: {
    'design-gallery': 0,
    framing: 1,
    system: 2,
    'system-image-1': 5,
    validation: 3,
    prototype: 4,
  },
  crm: {
    'adding-notes': 4,
    'my-tasks-lead-owner-change': 5,
    'tags-for-leads': 6,
  },
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic painting path. Prefer unique project slots when available
 * so the same painting is never reused twice in one case study.
 */
export function getCaseStudyBackground(seed: string): string {
  const lower = seed.toLowerCase();
  for (const [projectKey, slots] of Object.entries(PROJECT_BG_SLOTS)) {
    if (!lower.includes(projectKey)) continue;
    for (const [sectionId, index] of Object.entries(slots)) {
      if (lower.includes(sectionId)) {
        return CASE_STUDY_BACKGROUNDS[index % CASE_STUDY_BACKGROUNDS.length];
      }
    }
  }
  const index = hashSeed(seed) % CASE_STUDY_BACKGROUNDS.length;
  return CASE_STUDY_BACKGROUNDS[index];
}

/**
 * Interior case-study media that should sit on a painting stage.
 * Work grid thumbnails are never included.
 */
export function shouldStageCaseStudyMedia(opts: {
  projectId: string;
  sectionId?: string;
  kind: 'detail-image' | 'detail-video' | 'detail-gif' | 'problem-image' | 'exploration' | 'design-gallery' | 'target-image' | 'key-feature';
}): boolean {
  const id = opts.projectId.toLowerCase();

  // Nesoi: framing / system / validation / prototype.
  // Design gallery uses the comparison slider (no painting stage).
  // System video stays unstaged; prototype video keeps the painting stage.
  if (id.includes('nesoi')) {
    if (opts.kind === 'design-gallery') return false;
    if (opts.kind === 'detail-video') {
      return opts.sectionId === 'prototype';
    }
    if (opts.kind === 'detail-image' || opts.kind === 'detail-gif') {
      return ['framing', 'system', 'validation', 'prototype'].includes(opts.sectionId ?? '');
    }
    return false;
  }

  // Falcon + Onboarding: leave as-is.
  if (id.includes('falcon') || id.includes('onboarding')) return false;

  // CRM: stage all walkthrough videos; skip design gallery.
  if (id.includes('crm')) {
    return opts.kind === 'detail-video';
  }

  return false;
}
