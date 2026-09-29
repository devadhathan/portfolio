/**
 * Hero portrait art, shared by the home hero card and the portfolio section so
 * the same theme can't resolve to two different renderings.
 */
export const HERO_LIGHT_SVG = '/svg/me alone and the background.svg';

export const HERO_THEME_SVGS: Record<'blue' | 'green' | 'red', string> = {
  blue: '/svg/blue me.svg',
  green: '/svg/green me.svg',
  red: '/svg/red me.svg',
};

type HeroArt =
  | { kind: 'video' }
  | { kind: 'svg'; src: string; tintClass?: string };

/**
 * Pass a *resolved* theme — 'system' has no artwork of its own. The colour
 * themes ship their own tinted files, so they take no CSS filter; only the
 * light artwork is tinted, and only to darken it.
 */
export function heroArtFor(mode: string): HeroArt {
  if (mode === 'dark') return { kind: 'video' };
  if (mode === 'blue' || mode === 'green' || mode === 'red') {
    return { kind: 'svg', src: HERO_THEME_SVGS[mode] };
  }
  return { kind: 'svg', src: HERO_LIGHT_SVG, tintClass: 'svg-hero-light' };
}
