import type { Project } from '@/lib/types/project';

export type CaseStudySection = { id: string; name: string };

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
};

/** Build the “On this page” TOC entries for a case study. */
export function buildCaseStudySections(
  project: Project,
  labels: SectionLabels,
): CaseStudySection[] {
  const sections: CaseStudySection[] = [];
  const isNesoi = project.title.toLowerCase().includes('nesoi');
  const detailIds = new Set(project.detailSections?.map((s) => s.id) ?? []);

  if (project.designGallery?.length || project.title.toLowerCase().includes('falcon')) {
    sections.push({ id: 'design', name: labels.designGallery });
  }
  if (project.problem) sections.push({ id: 'problem', name: labels.problem });
  if (isNesoi && project.hmw) sections.push({ id: 'goal', name: 'Goal' });
  if (isNesoi) sections.push({ id: 'problem-image', name: 'Framing' });
  if (project.targetAudience) {
    sections.push({ id: 'target-audience', name: labels.targetAudience });
  }
  project.detailSections?.forEach((section) => {
    if (section.id === 'system-video') return;
    sections.push({ id: section.id, name: section.title });
  });
  if (project.research) sections.push({ id: 'research', name: labels.research });
  if (project.explorations?.length) {
    sections.push({ id: 'exploring', name: labels.exploring });
  }
  if (project.prototype && !detailIds.has('prototype')) {
    sections.push({ id: 'prototype', name: labels.prototype });
  }
  if (project.hmw && !isNesoi) sections.push({ id: 'hmw', name: labels.hmw });
  if (project.title.toLowerCase().includes('finshots')) {
    sections.push({ id: 'possible-solutions', name: labels.possibleSolutions });
    if (project.results?.length) sections.push({ id: 'stats', name: labels.result });
  } else if (project.results?.length) {
    sections.push({ id: 'stats', name: labels.stats });
  }
  if (project.keyFeatures?.length) {
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
