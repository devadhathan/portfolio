import type { SVGProps } from 'react';

/**
 * The dot-matrix D — vector version of the old /photos/Image@4x.png mark. The
 * PNG was pure white; this inherits ink instead, so it follows the wallpaper
 * contrast the menubar already resolves (`data-os-menubar` → light/dark).
 */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="19" height="23" viewBox="0 0 19 23" fill="none" aria-hidden {...props}>
      <circle cx="2.5" cy="2.5" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="8.5" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="14.5" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="8.5" cy="2.5" r="2.5" fill="currentColor" />
      <circle cx="8.5" cy="8.5" r="2.5" fill="currentColor" />
      <circle cx="8.5" cy="14.5" r="2.5" fill="currentColor" />
      <circle cx="8.5" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="13.5" cy="5.5" r="2.5" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="2.5" fill="currentColor" />
      <circle cx="14.5" cy="16.5" r="2.5" fill="currentColor" />
    </svg>
  );
}
