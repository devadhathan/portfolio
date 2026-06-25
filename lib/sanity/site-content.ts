import { resumeData } from '@/lib/resume-data'
import type { ExperienceEntry, SiteSettings } from '@/lib/types/site-content'
import { sanityClient } from './client'
import { experienceQuery, siteSettingsQuery } from './queries'

const defaultSiteSettings: SiteSettings = {
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

function normalizeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!raw?.email) return defaultSiteSettings

  return {
    ...defaultSiteSettings,
    ...raw,
    awards: Array.isArray(raw.awards) ? raw.awards : defaultSiteSettings.awards,
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications
      : defaultSiteSettings.certifications,
    linkedin: raw.linkedin || defaultSiteSettings.linkedin,
    github: raw.github || defaultSiteSettings.github,
    experienceIntro: raw.experienceIntro || defaultSiteSettings.experienceIntro,
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await sanityClient.fetch<Partial<SiteSettings> | null>(siteSettingsQuery)
    return normalizeSettings(settings)
  } catch (error) {
    console.warn('[Sanity] Failed to fetch site settings, using local data:', error)
  }
  return defaultSiteSettings
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  try {
    const experience = await sanityClient.fetch<ExperienceEntry[]>(experienceQuery)
    if (Array.isArray(experience) && experience.length > 0) {
      return experience.map((entry) => ({
        ...entry,
        achievements: Array.isArray(entry.achievements) ? entry.achievements : [],
      }))
    }
  } catch (error) {
    console.warn('[Sanity] Failed to fetch experience, using local data:', error)
  }
  return resumeData.experience
}

export async function getSiteContent() {
  const [settings, experience] = await Promise.all([getSiteSettings(), getExperience()])
  return { settings, experience }
}
