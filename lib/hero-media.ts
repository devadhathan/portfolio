export const HERO_INTRO_VIDEO = '/videos/Can_you_create_202512230008_e8yfn.mp4';
export const HERO_LOOP_VIDEO = '/videos/second.mp4';
export const HERO_VIDEO_POSTER = '/videos/hero-intro-poster.jpg';

/** Poster only — full video preloads contend with first paint. */
export function preloadHeroVideos() {
  if (typeof document === 'undefined') return;

  if (!document.querySelector(`link[rel="preload"][href="${HERO_VIDEO_POSTER}"]`)) {
    const posterLink = document.createElement('link');
    posterLink.rel = 'preload';
    posterLink.href = HERO_VIDEO_POSTER;
    posterLink.as = 'image';
    document.head.appendChild(posterLink);
  }
}
