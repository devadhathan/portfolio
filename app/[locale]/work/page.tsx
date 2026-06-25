import { SANITY_REVALIDATE_SECONDS } from '@/lib/sanity/cache';
import { getProjects } from '@/lib/sanity/projects';
import { localizeProjects } from '@/lib/i18n/localize-projects';
import type { Locale } from '@/i18n/routing';
import WorkPageClient from './work-client';

export const revalidate = SANITY_REVALIDATE_SECONDS;

export default async function WorkPage({ params: { locale } }: { params: { locale: Locale } }) {
  const projects = localizeProjects(await getProjects(), locale);
  return <WorkPageClient projects={projects} />;
}
