import type { GenUIItem } from '@/lib/gen-ui-registry';
import { getProjectId } from '@/lib/types/project';

export function getItemSlug(item: GenUIItem): string | null {
  const slugged = item as { projectSlug?: string };
  if (slugged.projectSlug) return slugged.projectSlug;
  if (item.type === 'project') return getProjectId(item.title);
  if (item.type === 'info' && item.subtitle) return getProjectId(item.subtitle);
  if (item.type === 'quote' && item.author) return getProjectId(item.author);
  if (item.type === 'feature' && item.link?.includes('project=')) {
    const match = item.link.match(/project=([^&]+)/);
    if (match) return match[1];
  }
  if (item.type === 'image' || item.type === 'video') {
    const src = item.src.toLowerCase();
    if (src.includes('/finshots/')) return 'finshots-news-app';
    if (src.includes('/falcon')) return 'falcon-design-system';
    if (src.includes('/crm/')) return 'crm-redesign';
    if (src.includes('/ditto insurance/')) return 'onboarding-redesign';
    if (src.includes('/nesoi/')) return 'nesoi-ai-dashboard';
  }
  return null;
}

export function projectHref(slug: string): string {
  return `/work?project=${slug}`;
}

export function resolveItemHref(item: GenUIItem): string | undefined {
  if ('link' in item && item.link) return item.link;
  const slug = getItemSlug(item);
  if (slug && slug !== 'wordsmith') return projectHref(slug);
  return undefined;
}

export function isProjectScopedItem(item: GenUIItem): boolean {
  return getItemSlug(item) !== null && ['project', 'image', 'video', 'info', 'quote'].includes(item.type);
}
