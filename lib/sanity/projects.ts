import { unstable_cache } from 'next/cache'
import { resumeData } from '@/lib/resume-data'
import type { Project } from '@/lib/types/project'
import { findProjectBySlug, getProjectId } from '@/lib/types/project'
import { SANITY_REVALIDATE_SECONDS } from './cache'
import { sanityClient } from './client'
import { projectsQuery } from './queries'

type SanityProject = Project & { slug?: string }

const localProjects = resumeData.projects.filter(
  (p) => p.title !== 'Sustainable Kiosk' && p.title !== 'Booking Portal Redesign',
) as Project[]

function normalizeProject(project: SanityProject): Project {
  const { slug: _slug, ...rest } = project
  return rest
}

/** Prefer local resume-data narrative fields so edits show without a Sanity republish. */
function overlayLocalContent(remote: Project): Project {
  const local = localProjects.find((p) => getProjectId(p.title) === getProjectId(remote.title))
  if (!local) return remote

  return {
    ...remote,
    period: local.period ?? remote.period,
    role: local.role ?? remote.role,
    tools: local.tools ?? remote.tools,
    type: local.type ?? remote.type,
    company: local.company ?? remote.company,
    team: local.team ?? remote.team,
    description: local.description ?? remote.description,
    cardSubtext: local.cardSubtext ?? remote.cardSubtext,
    problem: local.problem ?? remote.problem,
    approach: local.approach ?? remote.approach,
    research: local.research ?? remote.research,
    hmw: local.hmw ?? remote.hmw,
    takeStepBack: local.takeStepBack ?? remote.takeStepBack,
    painPointsIntro: local.painPointsIntro ?? remote.painPointsIntro,
    impactOverview: local.impactOverview ?? remote.impactOverview,
    prototype: local.prototype ?? remote.prototype,
    prototypeFrame: local.prototypeFrame ?? remote.prototypeFrame,
    learnings: local.learnings ?? remote.learnings,
    keyFeatures: local.keyFeatures ?? remote.keyFeatures,
    results: local.results ?? remote.results,
    impact: local.impact ?? remote.impact,
    businessOpportunity: local.businessOpportunity ?? remote.businessOpportunity,
    details: local.details ?? remote.details,
    detailSections: local.detailSections ?? remote.detailSections,
    designGallery: local.designGallery ?? remote.designGallery,
    explorations: local.explorations ?? remote.explorations,
    painPoints: local.painPoints ?? remote.painPoints,
    problemImage: local.problemImage ?? remote.problemImage,
    targetAudienceImage: local.targetAudienceImage ?? remote.targetAudienceImage,
    keyFeatureImage: local.keyFeatureImage ?? remote.keyFeatureImage,
    targetAudience: local.targetAudience ?? remote.targetAudience,
  }
}

async function fetchProjectsUncached(): Promise<Project[]> {
  try {
    const projects = await sanityClient.fetch<SanityProject[]>(projectsQuery)

    if (Array.isArray(projects) && projects.length > 0) {
      return projects.map(normalizeProject).map(overlayLocalContent)
    }
  } catch (error) {
    console.warn('[Sanity] Failed to fetch projects, using local resume-data:', error)
  }

  return localProjects
}

export const getProjects = unstable_cache(fetchProjectsUncached, ['sanity-projects-local-overlay-v4'], {
  revalidate: SANITY_REVALIDATE_SECONDS,
})

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return findProjectBySlug(projects, slug) ?? null
}
