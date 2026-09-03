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

export function OsHomeIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V8.5Z" />
    </svg>
  );
}

export function OsWorkIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="2.75" y="6.25" width="14.5" height="10" rx="1.75" />
      <path d="M7 6.25V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.25M2.75 10.5h14.5" />
    </svg>
  );
}

export function OsPlaygroundIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M8 2.75v4.6l-3.72 6.36A1.55 1.55 0 0 0 5.6 16.5h8.8a1.55 1.55 0 0 0 1.32-2.79L12 7.35v-4.6" />
      <path d="M6.9 2.75h6.2M5.85 12.25h8.3" />
    </svg>
  );
}

export function OsPhotosIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <rect x="2.75" y="4.75" width="14.5" height="10.5" rx="1.75" />
      <circle cx="7.25" cy="8.25" r="1.15" />
      <path d="m5.5 14.25 2.6-2.7a1 1 0 0 1 1.4 0L11.5 13.5l1.1-1.1a1 1 0 0 1 1.4 0l2.25 2.1" />
    </svg>
  );
}

export function OsAskIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M10 2.75 11.15 6.9 15.3 8.05 11.15 9.2 10 13.35 8.85 9.2 4.7 8.05 8.85 6.9 10 2.75Z" />
      <path d="m14.6 12.4.55 1.85 1.85.55-1.85.55-.55 1.85-.55-1.85-1.85-.55 1.85-.55.55-1.85Z" />
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

export function OsGamesIcon(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg {...osLineIconProps} {...props}>
      <path d="M4.5 8.75h11a2.75 2.75 0 0 1 0 5.5h-11a2.75 2.75 0 0 1 0-5.5Z" />
      <path d="M7 10.25v3M5.5 11.75h3M13.25 11.1v.1M15 12.4v.1" />
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
  writings: () => <OsFolderIcon />,
  catalystic: () => <OsLightbulbIcon />,
  bigBang: () => <OsLightbulbIcon />,
  trash: () => <OsTrashIcon />,
  games: () => <OsGamesIcon />,
  contact: () => <OsMailIcon />,
  medium: () => <OsNewsIcon />,
  folder: () => <OsFolderIcon />,
  lightbulb: () => <OsLightbulbIcon />,
  user: () => <OsUserIcon />,
  info: () => <OsInfoIcon />,
  finder: () => <OsFinderIcon />,
  wordsmith: () => <OsAskIcon />,
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
