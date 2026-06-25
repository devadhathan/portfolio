import { resumeData } from '@/lib/resume-data';
import { getProjectId, type Project, type ProjectImage } from '@/lib/types/project';

const EXCLUDED_TITLES = new Set(['Sustainable Kiosk', 'Booking Portal Redesign']);

const FINSHOTS_GALLERY = [
  { src: '/finshots/n3pGQMdpISBs8GNixqX0HtgFg.png.webp', title: 'Highlights', description: 'Article view with engagement features' },
  { src: '/finshots/Bm0PeueVjQrfNc6ZGLBrN2V3wM.png.webp', title: 'Categories', description: 'Category filters and navigation' },
  { src: '/finshots/E4DFBuj0Koz7GYv9xXNlfGQxGtI.png.webp', title: 'Infographics', description: 'Data visualization and charts' },
  { src: '/finshots/0xqsjn29l4LoZolS3dyyR2tY.png.webp', title: 'Best App 2021', description: 'Google Play award recognition' },
  { src: '/finshots/sr6ljGiHCaM0R1fK5YqIBWQa6kI.png.webp', title: 'Custom Notification', description: 'Personalized notification settings' },
  { src: '/finshots/s6XIdXr2BqaE8sFliwZJQA9ZM.png.webp', title: 'Filters & Search', description: 'Advanced search and filtering' },
];

function truncate(text: string, max = 380): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function addImage(
  cards: Record<string, object>,
  id: string,
  src: string,
  alt: string,
  caption?: string,
  projectSlug?: string,
) {
  if (!src || cards[id]) return;
  cards[id] = { type: 'image', src, alt, caption, projectSlug };
}

function addVideo(
  cards: Record<string, object>,
  id: string,
  src: string,
  alt: string,
  caption?: string,
  poster?: string,
  projectSlug?: string,
) {
  if (!src || cards[id]) return;
  cards[id] = { type: 'video', src, alt, caption, poster, projectSlug };
}

function addProjectImage(
  cards: Record<string, object>,
  slug: string,
  key: string,
  img: ProjectImage | undefined,
  projectTitle: string,
) {
  if (!img?.src) return;
  addImage(
    cards,
    `image:case:${slug}:${key}`,
    img.src,
    img.alt || img.title || projectTitle,
    img.caption || img.description || img.title,
    slug,
  );
}

export function buildCaseStudyCards(projects: Project[] = resumeData.projects as Project[]): Record<string, object> {
  const cards: Record<string, object> = {};

  for (const project of projects) {
    if (EXCLUDED_TITLES.has(project.title)) continue;

    const slug = getProjectId(project.title);

    cards[`case:${slug}:project`] = {
      type: 'project',
      title: project.title,
      description: truncate(project.description || project.cardSubtext || ''),
      tags: project.tools?.slice(0, 4) || (project.type ? [project.type] : []),
      projectSlug: slug,
    };

    if (project.problem) {
      cards[`case:${slug}:problem`] = {
        type: 'info',
        title: 'Problem',
        subtitle: project.title,
        body: truncate(project.problem),
        icon: '🎯',
        projectSlug: slug,
      };
    }

    if (project.approach) {
      cards[`case:${slug}:approach`] = {
        type: 'info',
        title: 'Approach',
        subtitle: project.title,
        body: truncate(project.approach),
        icon: '🔬',
        projectSlug: slug,
      };
    } else if (project.hmw) {
      cards[`case:${slug}:approach`] = {
        type: 'info',
        title: 'How might we',
        subtitle: project.title,
        body: truncate(project.hmw),
        icon: '💡',
        projectSlug: slug,
      };
    }

    if (project.research) {
      cards[`case:${slug}:research`] = {
        type: 'info',
        title: 'Research',
        subtitle: project.title,
        body: truncate(project.research),
        icon: '🔍',
        projectSlug: slug,
      };
    }

    const impactText = project.impact?.join(' · ') || project.results?.join(' · ') || '';
    if (impactText) {
      cards[`case:${slug}:impact`] = {
        type: 'info',
        title: 'Impact & results',
        subtitle: project.title,
        body: truncate(impactText),
        icon: '📈',
        projectSlug: slug,
      };
    }

    const learning = Array.isArray(project.learnings)
      ? project.learnings[0]
      : typeof project.learnings === 'string'
        ? project.learnings
        : undefined;
    if (learning) {
      cards[`case:${slug}:learning`] = {
        type: 'quote',
        text: truncate(learning, 320),
        author: project.title,
      };
    }

    addProjectImage(cards, slug, 'problem-image', project.problemImage, project.title);
    addProjectImage(cards, slug, 'audience', project.targetAudienceImage, project.title);
    addProjectImage(cards, slug, 'feature', project.keyFeatureImage, project.title);

    project.detailSections?.forEach((section) => {
      const key = section.id.replace(/[^a-z0-9-]/gi, '-');
      if (section.image) {
        addImage(
          cards,
          `image:case:${slug}:${key}`,
          section.image,
          section.title,
          truncate(section.description, 140),
          slug,
        );
      }
      if (section.prototypeGif) {
        addImage(
          cards,
          `image:case:${slug}:${key}-gif`,
          section.prototypeGif,
          section.title,
          truncate(section.description, 140),
          slug,
        );
      }
      if (section.video) {
        addVideo(
          cards,
          `video:case:${slug}:${key}`,
          section.video,
          section.title,
          truncate(section.description, 140),
          undefined,
          slug,
        );
      }
    });

    project.designGallery?.forEach((item, i) => {
      addImage(
        cards,
        `image:case:${slug}:gallery-${i}`,
        item.src,
        item.title || project.title,
        item.description || item.title,
        slug,
      );
    });

    project.explorations?.forEach((exp, i) => {
      if (exp.image) {
        addImage(
          cards,
          `image:case:${slug}:exploration-${i}`,
          exp.image,
          exp.title,
          exp.solution ? truncate(exp.solution, 140) : exp.problem ? truncate(exp.problem, 140) : exp.tag,
          slug,
        );
      }
    });

    if (slug === 'finshots-news-app') {
      addImage(cards, 'image:case:finshots-news-app:hero', '/finshots/image.png', 'Finshots News App', 'Award-winning fintech news app', slug);
      addImage(cards, 'image:case:finshots-news-app:navigation', '/finshots/navigation.png', 'Navigation', 'Categories, filters, and search', slug);
      addImage(cards, 'image:case:finshots-news-app:infographics', encodeURI('/finshots/Info graphics.png'), 'Infographics', 'Illustrated data visualization', slug);
      addImage(cards, 'image:case:finshots-news-app:notifications', '/finshots/Notifications.png', 'Custom Notifications', 'Personalized alert preferences', slug);

      FINSHOTS_GALLERY.forEach((img, i) => {
        addImage(cards, `image:case:finshots-news-app:screen-${i}`, img.src, img.title, img.description, slug);
      });

      addVideo(cards, 'video:case:finshots-news-app:accessibility', '/finshots/acess.mp4', 'Accessibility', 'Dark mode and font size controls', '/finshots/Bg.png', slug);
      addVideo(cards, 'video:case:finshots-news-app:walkthrough', '/finshots/first.mp4', 'App walkthrough', 'Finshots mobile experience', '/finshots/Bg.png', slug);
    }
  }

  return cards;
}

export const CASE_STUDY_SLUGS = resumeData.projects
  .filter((p) => !EXCLUDED_TITLES.has(p.title))
  .map((p) => getProjectId(p.title));
