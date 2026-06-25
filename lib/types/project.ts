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
  video?: string
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

export type Project = {
  title: string
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
