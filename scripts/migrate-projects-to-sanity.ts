import fs from 'node:fs'
import path from 'node:path'
import { resumeData } from '../lib/resume-data'

const HIDDEN = new Set(['Sustainable Kiosk', 'Booking Portal Redesign'])

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function toSanityDoc(project: (typeof resumeData.projects)[number], index: number) {
  const slug = slugify(project.title)
  const learnings = project.learnings
    ? Array.isArray(project.learnings)
      ? project.learnings
      : [project.learnings]
    : undefined

  return {
    _id: `project-${slug}`,
    _type: 'project',
    title: project.title,
    slug: {_type: 'slug', current: slug},
    type: project.type,
    company: project.company,
    institution: project.institution,
    period: project.period,
    cardSubtext: project.cardSubtext,
    description: project.description,
    url: project.url,
    role: project.role,
    team: project.team,
    tools: project.tools,
    problem: project.problem,
    targetAudience: project.targetAudience,
    research: project.research,
    hmw: project.hmw,
    approach: project.approach,
    prototype: project.prototype,
    prototypeFrame: project.prototypeFrame,
    takeStepBack: project.takeStepBack,
    painPointsIntro: project.painPointsIntro,
    impactOverview: project.impactOverview,
    learnings,
    keyFeatures: project.keyFeatures,
    results: project.results,
    impact: project.impact,
    businessOpportunity: project.businessOpportunity,
    details: project.details,
    detailSections: project.detailSections,
    designGallery: project.designGallery,
    explorations: project.explorations,
    painPoints: project.painPoints,
    problemImage: project.problemImage,
    targetAudienceImage: project.targetAudienceImage,
    keyFeatureImage: project.keyFeatureImage,
    order: index,
    hidden: HIDDEN.has(project.title),
  }
}

const projects = resumeData.projects.map(toSanityDoc)
const outDir = path.join(process.cwd(), 'studio-portfolio-cms', 'data')
const outFile = path.join(outDir, 'projects.ndjson')

fs.mkdirSync(outDir, {recursive: true})
fs.writeFileSync(
  outFile,
  projects.map((doc) => JSON.stringify(doc)).join('\n') + '\n',
  'utf8'
)

console.log(`Wrote ${projects.length} case studies to ${outFile}`)
console.log('Run: cd studio-portfolio-cms && npx sanity dataset import data/projects.ndjson production --replace')
