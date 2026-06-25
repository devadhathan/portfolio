import { resumeData } from '@/lib/resume-data'
import type { Project } from '@/lib/types/project'
import { sanityClient } from './client'
import { projectsQuery } from './queries'

type SanityProject = Project & { slug?: string }

function normalizeProject(project: SanityProject): Project {
  const { slug: _slug, ...rest } = project
  return rest
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await sanityClient.fetch<SanityProject[]>(projectsQuery)

    if (Array.isArray(projects) && projects.length > 0) {
      return projects.map(normalizeProject)
    }
  } catch (error) {
    console.warn('[Sanity] Failed to fetch projects, using local resume-data:', error)
  }

  return resumeData.projects.filter(
    (p) => p.title !== 'Sustainable Kiosk' && p.title !== 'Booking Portal Redesign'
  ) as Project[]
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  const normalized = slug.toLowerCase().replace(/\s+/g, '-')
  return (
    projects.find((p) => p.title.toLowerCase().replace(/\s+/g, '-') === normalized) ?? null
  )
}
