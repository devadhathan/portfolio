export type SiteSettings = {
  name: string
  email: string
  website: string
  linkedin: string
  phone?: string
  github?: string
  experienceIntro?: string
  awards: string[]
  certifications: string[]
}

export type ExperienceEntry = {
  role: string
  company: string
  period: string
  achievements?: string[]
}
