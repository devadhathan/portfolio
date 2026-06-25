'use client'

import { createContext, useContext } from 'react'
import { resumeData } from '@/lib/resume-data'
import type { Project } from '@/lib/types/project'
import type { ExperienceEntry, SiteSettings } from '@/lib/types/site-content'

const fallbackProjects = resumeData.projects.filter(
  (p) => p.title !== 'Sustainable Kiosk' && p.title !== 'Booking Portal Redesign',
) as Project[]

type SiteContentContextValue = {
  settings: SiteSettings
  experience: ExperienceEntry[]
  projects: Project[]
}

const fallbackSettings: SiteSettings = {
  name: resumeData.name,
  email: resumeData.email,
  website: resumeData.website,
  linkedin: resumeData.linkedin,
  phone: resumeData.phone,
  github: 'devadhathan',
  experienceIntro:
    'Product Designer crafting **thoughtful, user-centric products** across AI startups and fintech.',
  awards: resumeData.awards,
  certifications: resumeData.certifications,
}

const SiteContentContext = createContext<SiteContentContextValue>({
  settings: fallbackSettings,
  experience: resumeData.experience,
  projects: fallbackProjects,
})

export function SiteContentProvider({
  children,
  settings,
  experience,
  projects,
}: {
  children: React.ReactNode
  settings: SiteSettings
  experience: ExperienceEntry[]
  projects: Project[]
}) {
  return (
    <SiteContentContext.Provider value={{ settings, experience, projects }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
