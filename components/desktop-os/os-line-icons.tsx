import type { ReactNode, SVGProps } from 'react';

/** Geist-style line icons — stroked, currentColor, 20px box (matches ShortcutBar). */
export const osLineIconProps: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function OsWorkIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="2.75" y="6.25" width="14.5" height="10" rx="1.75" />
      <path d="M7 6.25V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.25M2.75 10.5h14.5" />
    </svg>
  );
}

export function OsSparkleIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M10 2.75 11.15 6.9 15.3 8.05 11.15 9.2 10 13.35 8.85 9.2 4.7 8.05 8.85 6.9 10 2.75Z" />
      <path d="m14.6 12.4.55 1.85 1.85.55-1.85.55-.55 1.85-.55-1.85-1.85-.55 1.85-.55.55-1.85Z" />
    </svg>
  );
}

/**
 * Custom app glyphs (Figma exports). Unlike the geist line set above these ship
 * their own fills and stroke weights, so they carry `os-icon--fixed` to opt out
 * of the plate rules that thin every stroke to 1.2.
 */
const osAssetIconProps: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  fill: 'none',
  className: 'os-icon--fixed',
  'aria-hidden': true,
};

export function OsHomeIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osAssetIconProps} className="os-icon--fixed os-glyph--home" viewBox="0 0 24 24" {...props}>
      <path
        d="M10.4766 3.55276C11.3468 2.73384 12.7062 2.73818 13.5713 3.56252L21.335 10.9629C21.7803 11.3874 22.0321 11.9766 22.0322 12.5918V20.6612C22.0322 21.9027 21.0267 22.9096 19.7852 22.9112L16.3096 22.9151C15.0662 22.9161 14.0576 21.9085 14.0576 20.6651V16.043C14.0572 15.6291 13.7216 15.293 13.3076 15.293L10.8584 15.294C10.4445 15.2941 10.1087 15.6301 10.1084 16.044V20.6416C10.1081 21.8952 9.08363 22.9066 7.83008 22.8906L4.22168 22.8448C2.99033 22.829 2 21.8262 2 20.5948V12.5059C2.00024 11.886 2.25666 11.2932 2.70801 10.8682L10.4766 3.55276ZM12.5361 4.64846C12.2478 4.37391 11.7949 4.3727 11.5049 4.64553L3.73633 11.96C3.58602 12.1015 3.50024 12.2995 3.5 12.5059V20.5948C3.5 21.0052 3.82988 21.3394 4.24023 21.3448L7.84863 21.3906C8.2664 21.396 8.60814 21.0594 8.6084 20.6416V16.044C8.60866 14.8017 9.61612 13.7943 10.8584 13.794L13.3076 13.793C14.55 13.793 15.5572 14.8007 15.5576 16.043V20.6651C15.5576 21.0796 15.8941 21.4155 16.3086 21.4151L19.7832 21.4112C20.1971 21.4107 20.5322 21.075 20.5322 20.6612V12.5918C20.5321 12.3869 20.4481 12.1903 20.2998 12.0489L12.5361 4.64846Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OsPhotosIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osAssetIconProps} className="os-icon--fixed os-glyph--photos" viewBox="0 0 24 24" {...props}>
      <circle cx="15.9379" cy="7.14497" r="1.75826" fill="currentColor" />
      <path
        d="M14.333 2C18.0607 2.00024 21.083 5.02223 21.083 8.75V14.333C21.0827 18.0605 18.0605 21.0828 14.333 21.083H8.75C8.62184 21.083 8.49456 21.0783 8.36816 21.0713C8.25437 21.0777 8.13981 21.082 8.02441 21.082C7.9581 21.082 7.89203 21.0803 7.82617 21.0781L7.82715 21.0176C4.83674 20.6085 2.472 18.2429 2.06445 15.252L2.00293 15.2549C2.00081 15.1892 2 15.1228 2 15.0566C2.00001 14.9389 2.00407 14.8221 2.01074 14.7061C2.004 14.5825 2.00001 14.4582 2 14.333V8.75C2 5.02208 5.02208 2 8.75 2H14.333ZM8.75 3.5C5.85051 3.5 3.5 5.85051 3.5 8.75V11.0811C4.60405 9.82565 6.22122 9.03233 8.02441 9.03223C10.2411 9.03223 12.1762 10.2307 13.2227 12.0137C13.7501 11.9792 14.221 11.9772 14.5947 12.0254C14.7994 12.0518 15.0227 12.0986 15.2207 12.1904C15.4075 12.2772 15.7104 12.4726 15.8086 12.8613C15.9126 13.2741 15.7111 13.6025 15.582 13.7646C15.4406 13.9423 15.2524 14.0939 15.0674 14.2207C14.7965 14.4063 14.4459 14.5938 14.042 14.7832C14.0461 14.8739 14.0498 14.965 14.0498 15.0566C14.0498 16.8607 13.2556 18.4787 11.999 19.583H14.333C17.2321 19.5828 19.5827 17.2321 19.583 14.333V8.75C19.583 5.85066 17.2323 3.50024 14.333 3.5H8.75ZM12.5352 15.4053C11.425 15.8145 10.077 16.2296 8.61621 16.5986C7.11743 16.9772 5.69933 17.2572 4.50781 17.4229C5.39184 18.6346 6.78189 19.4533 8.36816 19.5674C10.5914 19.4003 12.3657 17.6277 12.5352 15.4053ZM8.02441 10.5322C5.6438 10.5324 3.69388 12.3713 3.51465 14.7061C3.54633 15.1565 3.6353 15.591 3.77344 16.0029C4.98201 15.8642 6.54833 15.5741 8.24902 15.1445C9.84624 14.7411 11.2821 14.2859 12.3877 13.8574C11.8617 11.9409 10.1079 10.5322 8.02441 10.5322Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OsPlaygroundIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osAssetIconProps} className="os-icon--fixed os-glyph--playground" viewBox="0 0 24 24" {...props}>
      <ellipse
        cx="11.9429"
        cy="12.0275"
        rx="4.77183"
        ry="10.5"
        transform="rotate(44.3531 11.9429 12.0275)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="11.8756"
        cy="11.864"
        rx="4.87227"
        ry="10.5"
        transform="rotate(-45.0832 11.8756 11.864)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}

/**
 * Ask AI — the orb face as a line glyph: ring plus two eyes. The viewBox is
 * cropped to the ring's own bounds: a hairline circle reads smaller than the
 * filled Home / Photos shapes, so it needs the extra size to match them.
 */
export function OsAskIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osAssetIconProps} className="os-icon--fixed os-glyph--ask" viewBox="1.5 1.5 21 21" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 8V11.5M15.5 8V11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Favourites — starred ring. Same 24 grid and crop as Ask AI, so the two rings
 * render at identical size. */
export function OsFavouritesIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osAssetIconProps} className="os-icon--fixed os-glyph--favourites" viewBox="1.5 1.5 21 21" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.5245 6.46352C11.6741 6.00287 12.3259 6.00287 12.4755 6.46353L13.4593 9.49139C13.5263 9.6974 13.7183 9.83688 13.9349 9.83688H17.1186C17.6029 9.83688 17.8043 10.4567 17.4124 10.7414L14.8368 12.6127C14.6615 12.74 14.5882 12.9657 14.6552 13.1717L15.639 16.1996C15.7886 16.6602 15.2614 17.0433 14.8695 16.7586L12.2939 14.8873C12.1186 14.76 11.8814 14.76 11.7061 14.8873L9.13045 16.7586C8.73859 17.0433 8.21136 16.6602 8.36103 16.1996L9.34484 13.1717C9.41178 12.9657 9.33845 12.74 9.16321 12.6127L6.58755 10.7414C6.1957 10.4567 6.39708 9.83688 6.88145 9.83688H10.0651C10.2817 9.83688 10.4737 9.6974 10.5407 9.49139L11.5245 6.46352Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OsPenIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M11.6 4.4a1.7 1.7 0 0 1 2.4 2.4L7.35 13.45 4.25 14.3l.85-3.1L11.6 4.4Z" />
      <path d="m10.45 5.55 2.55 2.55" />
    </svg>
  );
}

export function OsFolderIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M2.75 6.75A1.75 1.75 0 0 1 4.5 5h3.4l1.35 1.5H15.5A1.75 1.75 0 0 1 17.25 8.25v6A1.75 1.75 0 0 1 15.5 16H4.5A1.75 1.75 0 0 1 2.75 14.25v-7.5Z" />
    </svg>
  );
}

export function OsTrashIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M4.25 6.25h11.5M8 6.25V5a1.25 1.25 0 0 1 1.25-1.25h1.5A1.25 1.25 0 0 1 12 5v1.25M6.75 6.25l.6 9.1A1.25 1.25 0 0 0 8.6 16.5h2.8a1.25 1.25 0 0 0 1.25-1.15l.6-9.1" />
    </svg>
  );
}

/** Controller silhouette — the old rounded bar read as a battery. */
export function OsGamesIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M7.4 6.9h5.2a4.35 4.35 0 0 1 4.11 5.74l-.63 1.87a1.95 1.95 0 0 1-3.28.75l-1.15-1.16H8.35L7.2 15.26a1.95 1.95 0 0 1-3.28-.75l-.63-1.87A4.35 4.35 0 0 1 7.4 6.9Z" />
      <path d="M6.6 9.6v2.4M5.4 10.8h2.4" />
      <path d="M13.15 9.95v.1M14.6 11.4v.1" />
    </svg>
  );
}

export function OsMailIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="2.75" y="5.25" width="14.5" height="9.5" rx="1.75" />
      <path d="m3.5 6.5 6.5 4.5 6.5-4.5" />
    </svg>
  );
}

export function OsNewsIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M4 4.75h9.5A1.75 1.75 0 0 1 15.25 6.5v9.25H5.75A1.75 1.75 0 0 1 4 14V4.75Z" />
      <path d="M15.25 7.5H16.5A1.5 1.5 0 0 1 18 9v5.25a1.5 1.5 0 0 1-1.5 1.5h-1.25M6.5 8h5M6.5 10.5h5M6.5 13h3.25" />
    </svg>
  );
}

export function OsLightbulbIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M10 2.75a4.75 4.75 0 0 1 2.6 8.7c-.45.3-.85.8-1 1.35h-3.2c-.15-.55-.55-1.05-1-1.35A4.75 4.75 0 0 1 10 2.75Z" />
      <path d="M8.4 14.5h3.2M8.75 16.5h2.5" />
    </svg>
  );
}

export function OsUserIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <circle cx="10" cy="7" r="3.25" />
      <path d="M4.25 16.5c1.35-2.4 3.3-3.5 5.75-3.5s4.4 1.1 5.75 3.5" />
    </svg>
  );
}

export function OsInfoIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 9v5.25M10 6.75v.1" />
    </svg>
  );
}

export function OsFinderIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.1 13.1 3.4 3.4" />
    </svg>
  );
}

/* Side projects — one glyph each, so a folder of five doesn't read as one thing. */

/** Pixl — pixel animation editor. */
export function OsPixelIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="3.25" y="3.25" width="6" height="6" rx="1.1" />
      <rect x="10.75" y="3.25" width="6" height="6" rx="1.1" />
      <rect x="3.25" y="10.75" width="6" height="6" rx="1.1" />
      <rect x="10.75" y="10.75" width="6" height="6" rx="1.1" />
    </svg>
  );
}

/** MusicNotch — now playing in the notch. */
export function OsMusicIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M7.75 14.5V5.35l7-1.6v9.15" />
      <circle cx="6" cy="14.75" r="1.85" />
      <circle cx="13" cy="12.9" r="1.85" />
    </svg>
  );
}

/** Linkring — the chain link. */
export function OsLinkIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M8.6 11.4a3.1 3.1 0 0 0 4.38 0l2.12-2.12a3.1 3.1 0 1 0-4.38-4.38l-.98.98" />
      <path d="M11.4 8.6a3.1 3.1 0 0 0-4.38 0L4.9 10.72a3.1 3.1 0 1 0 4.38 4.38l.98-.98" />
    </svg>
  );
}

/** Catalystic UI — a screen that generates itself. */
export function OsGenerateIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="2" />
      <path d="M2.75 7.75h14.5" />
      <path d="M10 9.6l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z" />
    </svg>
  );
}

/** Big Bang Timeline — everything from one point. */
export function OsOrbitIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <circle cx="10" cy="10" r="2.1" />
      <ellipse cx="10" cy="10" rx="7.5" ry="3.4" transform="rotate(-28 10 10)" />
      <ellipse cx="10" cy="10" rx="7.5" ry="3.4" transform="rotate(28 10 10)" />
    </svg>
  );
}

export type OsLineIconId =
  | 'home'
  | 'work'
  | 'playground'
  | 'photos'
  | 'ask'
  | 'drawesome'
  | 'writings'
  | 'catalystic'
  | 'bigBang'
  | 'pixl'
  | 'musicNotch'
  | 'linkring'
  | 'trash'
  | 'games'
  | 'contact'
  | 'medium'
  | 'folder'
  | 'lightbulb'
  | 'user'
  | 'info'
  | 'finder'
  | 'wordsmith'
  | 'about'
  | 'colophon'
  | 'guide';

const OS_LINE_ICONS: Record<OsLineIconId, () => ReactNode> = {
  home: () => <OsHomeIcon />,
  work: () => <OsWorkIcon />,
  playground: () => <OsPlaygroundIcon />,
  photos: () => <OsPhotosIcon />,
  ask: () => <OsAskIcon />,
  drawesome: () => <OsPenIcon />,
  writings: () => <OsFavouritesIcon />,
  catalystic: () => <OsGenerateIcon />,
  bigBang: () => <OsOrbitIcon />,
  pixl: () => <OsPixelIcon />,
  musicNotch: () => <OsMusicIcon />,
  linkring: () => <OsLinkIcon />,
  trash: () => <OsTrashIcon />,
  games: () => <OsGamesIcon />,
  contact: () => <OsMailIcon />,
  medium: () => <OsNewsIcon />,
  folder: () => <OsFolderIcon />,
  lightbulb: () => <OsLightbulbIcon />,
  user: () => <OsUserIcon />,
  info: () => <OsInfoIcon />,
  finder: () => <OsFinderIcon />,
  wordsmith: () => <OsSparkleIcon />,
  about: () => <OsUserIcon />,
  colophon: () => <OsInfoIcon />,
  guide: () => <OsInfoIcon />,
};

/** Map OS window ids → shared line glyphs (desktop, Finder, dock, menubar). */
export const WINDOW_LINE_ICON_ID: Partial<Record<string, OsLineIconId>> = {
  finder: 'finder',
  home: 'home',
  work: 'work',
  playground: 'playground',
  games: 'games',
  drawesome: 'drawesome',
  ask: 'ask',
  photos: 'photos',
  wordsmith: 'wordsmith',
  trash: 'trash',
  contact: 'contact',
  about: 'about',
  colophon: 'colophon',
  guide: 'guide',
  writings: 'writings',
  catalystic: 'catalystic',
  bigBang: 'bigBang',
};

export function windowLineIconId(id: string): OsLineIconId {
  return WINDOW_LINE_ICON_ID[id] ?? 'folder';
}

export function OsLineIcon({ id, className }: { id: OsLineIconId; className?: string }) {
  const node = OS_LINE_ICONS[id]?.();
  if (!node) return null;
  if (!className) return <>{node}</>;
  return <span className={className}>{node}</span>;
}

/** Black circle plate + white line glyph — matches desktop icons. */
export function OsCatalogIcon({
  id,
  size = 'md',
}: {
  id: OsLineIconId;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      className={
        size === 'sm'
          ? 'os-catalog-icon os-catalog-icon--sm'
          : size === 'lg'
            ? 'os-catalog-icon os-catalog-icon--lg'
            : 'os-catalog-icon'
      }
      aria-hidden
    >
      <OsLineIcon id={id} />
    </span>
  );
}
