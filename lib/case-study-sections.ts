import type { Project } from '@/lib/types/project';

export type CaseStudySection = { id: string; name: string };

const CRM_OTHER_FEATURE_SECTION_IDS = new Set([
  'adding-notes',
  'my-tasks-lead-owner-change',
  'tags-for-leads',
]);

type SectionLabels = {
  designGallery: string;
  problem: string;
  targetAudience: string;
  research: string;
  exploring: string;
  prototype: string;
  hmw: string;
  possibleSolutions: string;
  result: string;
  stats: string;
  keyFeatures: string;
  business: string;
  learnings: string;
  impact: string;
  otherFeatures: string;
};

/** Build the “On this page” TOC entries for a case study. */
export function buildCaseStudySections(
  project: Project,
  labels: SectionLabels,
): CaseStudySection[] {
  const sections: CaseStudySection[] = [];
  const isNesoi = project.title.toLowerCase().includes('nesoi');
  const isCrm = project.title.toLowerCase().includes('crm');
  const detailIds = new Set(project.detailSections?.map((s) => s.id) ?? []);

  if (
    !isCrm &&
    (project.designGallery?.length || project.title.toLowerCase().includes('falcon'))
  ) {
    sections.push({ id: 'design', name: labels.designGallery });
  }
  if (project.problem) sections.push({ id: 'problem', name: labels.problem });
  if (isNesoi && project.hmw) sections.push({ id: 'goal', name: 'Goal' });
  if (isNesoi) sections.push({ id: 'exploring', name: labels.exploring });
  if (isNesoi) sections.push({ id: 'problem-image', name: 'Framing' });
  if (project.hmw && !isNesoi) sections.push({ id: 'hmw', name: labels.hmw });
  if (project.targetAudience && !isCrm) {
    sections.push({ id: 'target-audience', name: labels.targetAudience });
  }
  project.detailSections?.forEach((section) => {
    if (section.id === 'system-video') return;
    if (isCrm && CRM_OTHER_FEATURE_SECTION_IDS.has(section.id)) {
      if (section.id === 'adding-notes') {
        sections.push({ id: 'other-features', name: labels.otherFeatures });
      }
      return;
    }
    sections.push({ id: section.id, name: section.title });
  });
  if (project.research && !isCrm) {
    sections.push({ id: 'research', name: labels.research });
  }
  if (project.explorations?.length && !isCrm) {
    sections.push({ id: 'exploring', name: labels.exploring });
  }
  if (project.prototype && !detailIds.has('prototype')) {
    sections.push({ id: 'prototype', name: labels.prototype });
  }
  if (project.title.toLowerCase().includes('finshots')) {
    sections.push({ id: 'possible-solutions', name: labels.possibleSolutions });
    if (project.results?.length) sections.push({ id: 'stats', name: labels.result });
  } else if (project.results?.length) {
    sections.push({ id: 'stats', name: labels.stats });
  }
  if (project.keyFeatures?.length && !isCrm) {
    sections.push({ id: 'key-features', name: labels.keyFeatures });
  }
  if (project.businessOpportunity?.length) {
    sections.push({ id: 'business', name: labels.business });
  }
  if (project.learnings && !detailIds.has('learnings')) {
    sections.push({ id: 'learnings', name: labels.learnings });
  }
  if (project.impact?.length) sections.push({ id: 'impact', name: labels.impact });
  return sections;
}
