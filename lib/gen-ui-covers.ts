import type { GenUIItem } from '@/lib/gen-ui-registry';
import { getProjectId } from '@/lib/types/project';

export const CARD_GRADIENTS = [
  'from-amber-200/90 via-yellow-100/70 to-sky-200/80 dark:from-amber-900/40 dark:via-yellow-900/20 dark:to-sky-900/30',
  'from-emerald-200/90 via-teal-100/60 to-blue-200/80 dark:from-emerald-900/40 dark:via-teal-900/20 dark:to-blue-900/30',
  'from-lime-200/80 via-green-100/60 to-emerald-200/70 dark:from-lime-900/30 dark:via-green-900/20 dark:to-emerald-900/30',
  'from-violet-200/80 via-purple-100/50 to-fuchsia-200/60 dark:from-violet-900/35 dark:via-purple-900/20 dark:to-fuchsia-900/25',
  'from-orange-200/80 via-rose-100/50 to-pink-200/70 dark:from-orange-900/35 dark:via-rose-900/20 dark:to-pink-900/25',
] as const;

export function getProjectCover(title: string): string | undefined {
  const t = title.toLowerCase();
  if (t.includes('finshots')) return '/finshots/image.png';
  if (t.includes('nesoi')) return '/nesoi/final-prototype.png';
  if (t.includes('falcon')) return '/falcon design system/image.png';
  if (t.includes('onboarding') || t.includes('ditto') || t.includes('booking')) return '/ditto insurance/1.png';
  if (t.includes('crm')) return '/CRM/image.png';
  if (t.includes('kiosk')) return '/photos/image.png';
  return undefined;
}

export function gradientForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * (i + 1)) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[hash];
}

export type CoverMedia = {
  src?: string;
  poster?: string;
  isVideo?: boolean;
  gradient: string;
};

export function resolveItemCover(item: GenUIItem, allItems: GenUIItem[]): CoverMedia {
  const gradient = gradientForKey(
    item.type === 'project' ? item.title : item.type === 'stat' ? item.label : JSON.stringify(item).slice(0, 40),
  );

  if (item.type === 'image') {
    return { src: item.src, gradient };
  }
  if (item.type === 'video') {
    return { src: item.src, poster: item.poster, isVideo: true, gradient };
  }
  if (item.type === 'project') {
    const slug = item.projectSlug || getProjectId(item.title);
    const linked = allItems.find(
      (i) => (i.type === 'image' || i.type === 'video') && (i as { projectSlug?: string }).projectSlug === slug,
    );
    if (linked && linked.type === 'image') return { src: linked.src, gradient };
    if (linked && linked.type === 'video') return { src: linked.src, poster: linked.poster, isVideo: true, gradient };
    return { src: getProjectCover(item.title), gradient };
  }

  if (item.type === 'info' || item.type === 'quote') {
    return { gradient };
  }

  return { gradient };
}
