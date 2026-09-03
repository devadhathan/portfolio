export type ProjectImage = {
  src: string
  alt?: string
  caption?: string
  title?: string
  description?: string
}

export type ProjectDetailSection = {
  id: string
  title: string
  description: string
  image?: string
  /** Extra images stacked under `image` (same section). */
  images?: string[]
  video?: string
  /** Poster image for `video` (and for legacy `prototypeGif` when migrated to mp4). */
  videoPoster?: string
  /** Player chrome on `video`. Off for ambient loops. Defaults to on. */
  videoControls?: boolean
  prototypeGif?: string
}

export type ProjectExploration = {
  tag?: string
  title: string
  problem?: string
  solution?: string
  image?: string
}

export type ProjectPainPoint = {
  title: string
  detail: string
}

export type ProjectImpactMetric = {
  description: string
}

export type Project = {
  title: string
  /** Stable URL slug from Sanity; used when display title differs from slug id. */
  slug?: string
  type?: string
  company?: string
  institution?: string
  period?: string
  description?: string
  cardSubtext?: string
  url?: string
  role?: string
  tools?: string[]
  team?: string
  problem?: string
  targetAudience?: string
  research?: string
  hmw?: string
  approach?: string
  prototype?: string
  prototypeFrame?: string
  takeStepBack?: string
  painPointsIntro?: string
  impactOverview?: string
  learnings?: string[] | string
  keyFeatures?: string[]
  results?: string[]
  impact?: string[]
  impactMetricsTitle?: string
  impactMetrics?: ProjectImpactMetric[]
  businessOpportunity?: string[]
  details?: string[]
  detailSections?: ProjectDetailSection[]
  designGallery?: Array<{ src: string; title?: string; description?: string }>
  explorations?: ProjectExploration[]
  painPoints?: ProjectPainPoint[]
  problemImage?: ProjectImage
  targetAudienceImage?: ProjectImage
  keyFeatureImage?: ProjectImage
}

export function getProjectId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function normalizeProjectSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
}

export function getProjectSlug(project: Project): string {
  return project.slug ? normalizeProjectSlug(project.slug) : getProjectId(project.title)
}

export function findProjectBySlug(projects: Project[], slug: string): Project | undefined {
  const normalized = normalizeProjectSlug(slug)
  return projects.find((project) => {
    if (project.slug && normalizeProjectSlug(project.slug) === normalized) return true
    return getProjectId(project.title) === normalized
  })
}

/** Work grid, sidebar, and nav order — Nesoi → CRM → Onboarding → Finshots → Design System. */
export const WORK_PROJECT_ORDER = [
  'nesoi-ai-dashboard',
  'crm-redesign',
  'onboarding-redesign',
  'finshots-news-app',
  'falcon-design-system',
] as const

export function sortProjectsForWork(projects: Project[]): Project[] {
  const order = new Map<string, number>(WORK_PROJECT_ORDER.map((slug, index) => [slug, index]))
  return [...projects].sort((a, b) => {
    const aIndex = order.get(getProjectSlug(a))
    const bIndex = order.get(getProjectSlug(b))
    if (aIndex === undefined && bIndex === undefined) {
      return getProjectSlug(a).localeCompare(getProjectSlug(b))
    }
    if (aIndex === undefined) return 1
    if (bIndex === undefined) return -1
    return aIndex - bIndex
  })
}
