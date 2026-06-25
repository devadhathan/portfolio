import type { Project, ProjectDetailSection, ProjectExploration, ProjectPainPoint } from '@/lib/types/project'
import { getProjectId } from '@/lib/types/project'
import { ML_PROJECT_OVERLAYS } from './project-overlays/ml/index'

type ProjectOverlay = Partial<Omit<Project, 'detailSections' | 'explorations' | 'painPoints' | 'designGallery'>> & {
  detailSections?: Partial<ProjectDetailSection>[]
  explorations?: Partial<ProjectExploration>[]
  painPoints?: Partial<ProjectPainPoint>[]
  designGallery?: Array<{ src: string; title?: string; description?: string }>
}

function mergeDetailSections(
  original: ProjectDetailSection[] | undefined,
  overlay: Partial<ProjectDetailSection>[] | undefined
): ProjectDetailSection[] | undefined {
  if (!original) return original
  if (!overlay?.length) return original
  return original.map((section) => {
    const match = overlay.find((item) => item.id === section.id)
    return match ? { ...section, ...match } : section
  })
}

function mergeExplorations(
  original: ProjectExploration[] | undefined,
  overlay: Partial<ProjectExploration>[] | undefined
): ProjectExploration[] | undefined {
  if (!original) return original
  if (!overlay?.length) return original
  return original.map((item, index) => ({ ...item, ...(overlay[index] ?? {}) }))
}

function mergePainPoints(
  original: ProjectPainPoint[] | undefined,
  overlay: Partial<ProjectPainPoint>[] | undefined
): ProjectPainPoint[] | undefined {
  if (!original) return original
  if (!overlay?.length) return original
  return original.map((item, index) => ({ ...item, ...(overlay[index] ?? {}) }))
}

function mergeDesignGallery(
  original: Project['designGallery'],
  overlay: ProjectOverlay['designGallery']
): Project['designGallery'] {
  if (!original) return original
  if (!overlay?.length) return original
  return original.map((item, index) => ({ ...item, ...(overlay[index] ?? {}) }))
}

export function localizeProject(project: Project, locale: string): Project {
  if (locale !== 'ml') return project

  const slug = getProjectId(project.title)
  const overlay = ML_PROJECT_OVERLAYS[slug] as ProjectOverlay | undefined
  if (!overlay) return project

  const { detailSections, explorations, painPoints, designGallery, ...rest } = overlay

  return {
    ...project,
    ...rest,
    detailSections: mergeDetailSections(project.detailSections, detailSections),
    explorations: mergeExplorations(project.explorations, explorations),
    painPoints: mergePainPoints(project.painPoints, painPoints),
    designGallery: mergeDesignGallery(project.designGallery, designGallery),
  }
}

export function localizeProjects(projects: Project[], locale: string): Project[] {
  return projects.map((project) => localizeProject(project, locale))
}
