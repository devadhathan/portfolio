import type { GenUIItem } from '@/lib/gen-ui-registry';
import { resumeData } from '@/lib/resume-data';
import { getProjectId } from '@/lib/types/project';

function truncate(text: string, max = 320): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 200 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function projectCopy(slug: string): string | undefined {
  const project = resumeData.projects.find((p) => getProjectId(p.title) === slug);
  if (!project) return undefined;
  return truncate(project.description || project.problem || project.cardSubtext || '');
}

function structuredProjectCopy(slug: string): string | undefined {
  const project = resumeData.projects.find((p) => getProjectId(p.title) === slug);
  if (!project) return undefined;

  const parts: string[] = [];

  const context = project.description || project.cardSubtext;
  if (context) parts.push(`Context — ${truncate(context, 130)}`);

  const challenge =
    typeof project.problem === 'string'
      ? project.problem
      : project.painPointsIntro;
  if (challenge) parts.push(`Challenge — ${truncate(challenge, 130)}`);

  const impact =
    project.impactOverview ||
    (Array.isArray(project.impact) ? project.impact[0] : undefined);
  if (impact) parts.push(`Impact — ${truncate(String(impact), 120)}`);

  if (parts.length === 0) return projectCopy(slug);
  return parts.join('\n');
}

export function richCardDescription(item: GenUIItem, allItems: GenUIItem[]): string | undefined {
  switch (item.type) {
    case 'project': {
      const slug = item.projectSlug || getProjectId(item.title);
      return structuredProjectCopy(slug) || item.description;
    }
    case 'info':
      return truncate(item.body);
    case 'feature':
      return item.body;
    case 'timeline':
      return item.highlights?.join('. ') || `${item.role} at ${item.company} (${item.period})`;
    case 'stat':
      return item.context ? `${item.value} — ${item.context}` : item.label;
    case 'image':
    case 'video': {
      if (item.caption) return item.caption;
      const slug = (item as { projectSlug?: string }).projectSlug;
      if (slug) return projectCopy(slug);
      return item.alt;
    }
    case 'quote':
      return item.text;
    case 'chart':
      return item.bars.map((b) => `${b.label}: ${b.displayValue}`).join(' · ');
    default:
      return undefined;
  }
}

export function richFeatureDescription(
  feat: { title: string; body: string },
  _allItems: GenUIItem[],
): string {
  return feat.body;
}
