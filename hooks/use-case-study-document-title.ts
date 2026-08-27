'use client';

import { useEffect } from 'react';
import type { Project } from '@/lib/types/project';
import { findProjectBySlug, getProjectId } from '@/lib/types/project';

const DEFAULT_TAB_TITLE = 'Dev';

/** Short label shown in the browser tab for a case study. */
export function caseStudyTabLabel(project: Project): string {
  if (project.title.toLowerCase().includes('nesoi')) return 'Nesoi.ai';
  return project.title;
}

/**
 * Sets `document.title` to `Dev | {case study}` while a project is open.
 * Restores the site default when the case study closes.
 */
export function useCaseStudyDocumentTitle(
  slug: string | null | undefined,
  projects: Project[],
) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!slug) {
      document.title = DEFAULT_TAB_TITLE;
      return;
    }

    const project =
      findProjectBySlug(projects, slug) ??
      projects.find((p) => getProjectId(p.title) === slug);

    document.title = project
      ? `Dev | ${caseStudyTabLabel(project)}`
      : DEFAULT_TAB_TITLE;

    return () => {
      document.title = DEFAULT_TAB_TITLE;
    };
  }, [slug, projects]);
}
