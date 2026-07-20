export const HERO_INTRO_VIDEO = '/videos/Can_you_create_202512230008_e8yfn.mp4';
export const HERO_LOOP_VIDEO = '/videos/second.mp4';
export const HERO_VIDEO_POSTER = '/videos/hero-intro-poster.jpg';

export function preloadHeroVideos() {
  if (typeof document === 'undefined') return;

  if (!document.querySelector(`link[rel="preload"][href="${HERO_VIDEO_POSTER}"]`)) {
    const posterLink = document.createElement('link');
    posterLink.rel = 'preload';
    posterLink.href = HERO_VIDEO_POSTER;
    posterLink.as = 'image';
    document.head.appendChild(posterLink);
  }

  for (const href of [HERO_INTRO_VIDEO, HERO_LOOP_VIDEO]) {
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) continue;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'video';
    link.type = 'video/mp4';
    document.head.appendChild(link);
  }
}
