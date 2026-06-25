import fs from 'node:fs'
import path from 'node:path'
import { resumeData } from '../lib/resume-data'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
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

const experienceDocs = resumeData.experience.map((exp, index) => ({
  _id: `experience-${slugify(exp.company)}`,
  _type: 'experience',
  role: exp.role,
  company: exp.company,
  period: exp.period,
  achievements: exp.achievements,
  order: index,
}))

const outDir = path.join(process.cwd(), 'studio-portfolio-cms', 'data')
const outFile = path.join(outDir, 'site-content.ndjson')

fs.mkdirSync(outDir, {recursive: true})
fs.writeFileSync(
  outFile,
  [siteSettings, ...experienceDocs].map((doc) => JSON.stringify(doc)).join('\n') + '\n',
  'utf8',
)

console.log(`Wrote site settings + ${experienceDocs.length} experience entries to ${outFile}`)
