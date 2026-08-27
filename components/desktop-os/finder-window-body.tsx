'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, FileText, Folder, Grid2X2, HardDrive, LayoutGrid, List, Star, Trash2 } from 'lucide-react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { useWindowTitles } from '@/components/desktop-os/window-titles';
import {
  TRASH_BAIT_VIDEO,
  WINDOW_ICON_SRC,
  type DesktopWindowId,
  type FinderLocation,
  type FinderTagId,
} from '@/lib/desktop-os';
import { trackEvent } from '@/lib/analytics';
import { cn, focusRing } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

type FinderItem = {
  id: string;
  label: string;
  src: string;
  openId?: DesktopWindowId;
  href?: string;
  syncUrl?: boolean;
  /** Navigate to another Finder sidebar location (in-window). */
  location?: FinderLocation;
};

const SIDEBAR: {
  id: FinderLocation;
  label: string;
  icon: typeof Clock;
}[] = [
  { id: 'recents', label: 'Recents', icon: Clock },
  { id: 'applications', label: 'Applications', icon: Grid2X2 },
  { id: 'desktop', label: 'Desktop', icon: HardDrive },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'sideProjects', label: 'Side Projects', icon: Folder },
  { id: 'favourites', label: 'Favourites', icon: Star },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

type FinderTag = {
  id: FinderTagId;
  label: string;
  color: string;
};

const TAGS: FinderTag[] = [
  { id: 'tag-red', label: 'Red', color: '#FF3B30' },
  { id: 'tag-orange', label: 'Orange', color: '#FF9500' },
  { id: 'tag-yellow', label: 'Yellow', color: '#FFCC00' },
  { id: 'tag-green', label: 'Green', color: '#34C759' },
  { id: 'tag-blue', label: 'Blue', color: '#007AFF' },
  { id: 'tag-purple', label: 'Purple', color: '#AF52DE' },
  { id: 'tag-gray', label: 'Gray', color: '#8E8E93' },
];

const TAG_IDS = new Set<string>(TAGS.map((t) => t.id));

const LOCATION_TITLE: Record<FinderLocation, string> = {
  recents: 'Recents',
  applications: 'Applications',
  desktop: 'Desktop',
  documents: 'Documents',
  sideProjects: 'Side Projects',
  favourites: 'Favourites',
  trash: 'Trash',
  'tag-red': 'Red',
  'tag-orange': 'Orange',
  'tag-yellow': 'Yellow',
  'tag-green': 'Green',
  'tag-blue': 'Blue',
  'tag-purple': 'Purple',
  'tag-gray': 'Gray',
};

const APPLICATIONS: FinderItem[] = [
  { id: 'home', label: 'Home', src: '/icons/home.svg', openId: 'home', syncUrl: true },
  { id: 'work', label: 'Work', src: '/icons/briefcase.svg', openId: 'work', syncUrl: true },
  {
    id: 'playground',
    label: 'Playground',
    src: '/icons/playgroundd.svg',
    openId: 'playground',
    syncUrl: true,
  },
  { id: 'games', label: 'Games', src: '/icons/gamess.svg', openId: 'games' },
  { id: 'drawesome', label: 'Draw', src: '/icons/pen.svg', openId: 'drawesome' },
  { id: 'photos', label: 'Photos', src: '/icons/image.svg', openId: 'photos' },
  { id: 'ask', label: 'Ask AI', src: '/icons/sparkles.svg', openId: 'ask' },
  { id: 'contact', label: 'Contact', src: '/icons/mailbox.svg', openId: 'contact' },
];

const DESKTOP: FinderItem[] = [
  { id: 'home', label: 'Home', src: '/icons/home.svg', openId: 'home', syncUrl: true },
  { id: 'work', label: 'Work', src: '/icons/briefcase.svg', openId: 'work', syncUrl: true },
  { id: 'photos', label: 'Photos', src: '/icons/image.svg', openId: 'photos' },
  {
    id: 'playground',
    label: 'Playground',
    src: '/icons/playgroundd.svg',
    openId: 'playground',
    syncUrl: true,
  },
  { id: 'ask', label: 'Ask AI', src: '/icons/sparkles.svg', openId: 'ask' },
  {
    id: 'favourites',
    label: 'Favourites',
    src: '/icons/folder.svg',
    location: 'favourites',
  },
];

const DOCUMENTS: FinderItem[] = [
  {
    id: 'favourites',
    label: 'Favourites',
    src: '/icons/folder.svg',
    location: 'favourites',
  },
];

/** Desktop Favourites folder — Medium, Games, and side projects. */
const FAVOURITES: FinderItem[] = [
  {
    id: 'medium',
    label: 'Medium',
    src: '/icons/news.svg',
    href: 'https://medium.com/@devadhathanmd18',
  },
  {
    id: 'games',
    label: 'Games',
    src: '/icons/gamess.svg',
    openId: 'games',
  },
  {
    id: 'catalystic',
    label: 'Catalystic',
    src: '/icons/lightbulb.svg',
    openId: 'catalystic',
  },
  {
    id: 'bigBang',
    label: 'Big Bang',
    src: '/icons/lightbulb.svg',
    openId: 'bigBang',
  },
];

/** Trash — classic bait file (same as the old Trash window). */
const TRASH: FinderItem[] = [
  {
    id: 'trash-bait',
    label: TRASH_BAIT_VIDEO.title,
    src: TRASH_BAIT_VIDEO.thumbnail,
    href: TRASH_BAIT_VIDEO.href,
  },
];

/** All side projects from the portfolio card — OS window or external link. */
const SIDE_PROJECTS: FinderItem[] = [
  {
    id: 'catalystic',
    label: 'Catalystic UI',
    src: '/icons/folder.svg',
    openId: 'catalystic',
  },
  {
    id: 'pixl',
    label: 'Pixl',
    src: '/icons/folder.svg',
    href: 'https://pixlanimations.vercel.app',
  },
  {
    id: 'musicNotch',
    label: 'MusicNotch',
    src: '/icons/folder.svg',
    href: 'https://musicnotch-landing.vercel.app/',
  },
  {
    id: 'linkring',
    label: 'Linkring',
    src: '/icons/folder.svg',
    href: 'https://linkring.vercel.app/',
  },
  {
    id: 'bigBang',
    label: 'Big Bang Timeline',
    src: '/icons/folder.svg',
    openId: 'bigBang',
  },
];

const ITEM_CATALOG: FinderItem[] = (() => {
  const map = new Map<string, FinderItem>();
  for (const item of [...APPLICATIONS, ...DESKTOP, ...DOCUMENTS, ...FAVOURITES, ...SIDE_PROJECTS]) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
})();

const TAGS_STORAGE_KEY = 'os-finder-item-tags';

type ItemTagsMap = Record<string, FinderTagId[]>;

function readItemTags(): ItemTagsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: ItemTagsMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) continue;
      const tags = value.filter((t): t is FinderTagId => typeof t === 'string' && TAG_IDS.has(t));
      if (tags.length) next[id] = tags;
    }
    return next;
  } catch {
    return {};
  }
}

function writeItemTags(map: ItemTagsMap) {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function openFinderItem(
  item: FinderItem,
  openWindow: (id: DesktopWindowId, opts?: { syncUrl?: boolean }) => void,
  setLocation: (location: FinderLocation) => void,
) {
  if (item.location) {
    setLocation(item.location);
    return;
  }
  if (item.openId) {
    openWindow(item.openId, { syncUrl: item.syncUrl ?? false });
    return;
  }
  if (item.href) {
    trackEvent('outbound_link', { destination: item.id, surface: 'finder' });
    window.open(item.href, '_blank', 'noopener,noreferrer');
  }
}

function SidebarItem({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Clock;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cuelume-press
      data-cuelume-release
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] leading-none transition-colors',
        active
          ? 'bg-primary/90 text-primary-foreground'
          : 'text-foreground/85 hover:bg-foreground/[0.06]',
        focusRing,
      )}
    >
      <Icon
        className={cn(
          'h-[14px] w-[14px] shrink-0',
          active ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function TagSidebarItem({
  tag,
  active,
  onClick,
}: {
  tag: FinderTag;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cuelume-press
      data-cuelume-release
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] leading-none transition-colors',
        active
          ? 'bg-primary/90 text-primary-foreground'
          : 'text-foreground/85 hover:bg-foreground/[0.06]',
        focusRing,
      )}
    >
      <span
        className="h-[11px] w-[11px] shrink-0 rounded-full"
        style={{ backgroundColor: tag.color }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{tag.label}</span>
    </button>
  );
}

function TagDots({ tags }: { tags: FinderTagId[] }) {
  if (tags.length === 0) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5" aria-hidden>
      {tags.map((id) => {
        const tag = TAGS.find((t) => t.id === id);
        if (!tag) return null;
        return (
          <span
            key={id}
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
        );
      })}
    </span>
  );
}

function TagsContextMenu({
  x,
  y,
  itemId,
  itemLabel,
  assigned,
  onToggle,
  onClose,
}: {
  x: number;
  y: number;
  itemId: string;
  itemLabel: string;
  assigned: FinderTagId[];
  onToggle: (tagId: FinderTagId) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    setPos({
      left: Math.min(x, window.innerWidth - rect.width - pad),
      top: Math.min(y, window.innerHeight - rect.height - pad),
    });
  }, [x, y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Tags for ${itemLabel}`}
      className="os-glass-menu fixed z-[240] min-w-[11rem] overflow-hidden rounded-[0.85rem] p-1 text-foreground shadow-md"
      style={{ left: pos.left, top: pos.top }}
      data-item-id={itemId}
    >
      <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Tags
      </p>
      {TAGS.map((tag) => {
        const on = assigned.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            role="menuitemcheckbox"
            aria-checked={on}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-foreground/[0.08]',
              focusRing,
            )}
            onClick={() => onToggle(tag.id)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: tag.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{tag.label}</span>
            {on ? <Check className="h-3.5 w-3.5 shrink-0 text-foreground/80" aria-hidden /> : null}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

function ItemViews({
  items,
  view,
  itemTags,
  onContextItem,
}: {
  items: FinderItem[];
  view: ViewMode;
  itemTags: ItemTagsMap;
  onContextItem: (item: FinderItem, e: ReactMouseEvent) => void;
}) {
  const { openWindow, setFinderLocation } = useDesktopOs();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">No items</p>
    );
  }

  if (view === 'list') {
    return (
      <ul className="flex flex-col px-2 py-2">
        {items.map((item) => {
          const selected = selectedId === item.id;
          const tags = itemTags[item.id] ?? [];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => openFinderItem(item, openWindow, setFinderLocation)}
                onContextMenu={(e) => onContextItem(item, e)}
                data-cuelume-press
                data-cuelume-release
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                  selected
                    ? 'bg-primary/90 text-primary-foreground'
                    : 'text-foreground/90 hover:bg-foreground/[0.06]',
                  focusRing,
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 object-contain drop-shadow-sm"
                  draggable={false}
                  decoding="async"
                />
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <TagDots tags={tags} />
                  <span className="truncate text-[13px]">{item.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-3 px-4 py-4 sm:grid-cols-4">
      {items.map((item) => {
        const selected = selectedId === item.id;
        const tags = itemTags[item.id] ?? [];
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              onDoubleClick={() => openFinderItem(item, openWindow, setFinderLocation)}
              onContextMenu={(e) => onContextItem(item, e)}
              data-cuelume-press
              data-cuelume-release
              className={cn(
                'flex w-full flex-col items-center gap-1.5 rounded-xl px-1.5 py-2 text-center transition-colors',
                selected ? 'bg-primary/15' : 'hover:bg-foreground/[0.05]',
                focusRing,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 drop-shadow-sm"
                draggable={false}
                decoding="async"
              />
              <span
                className={cn(
                  'inline-flex max-w-full items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] leading-tight',
                  selected ? 'bg-primary/90 text-primary-foreground' : 'text-foreground/90',
                )}
              >
                <TagDots tags={tags} />
                <span className="line-clamp-2 text-left">{item.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Finder — Favourites sidebar + color Tags (right-click to assign).
 */
export function FinderWindowBody() {
  const { recents, finderLocation, setFinderLocation } = useDesktopOs();
  const titles = useWindowTitles();
  const [view, setView] = useState<ViewMode>('grid');
  const [itemTags, setItemTags] = useState<ItemTagsMap>({});
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    item: FinderItem;
  } | null>(null);

  useEffect(() => {
    setItemTags(readItemTags());
  }, []);

  // Drop removed custom tags if a stale location was restored.
  useEffect(() => {
    if (
      finderLocation.startsWith('tag-') &&
      !TAG_IDS.has(finderLocation)
    ) {
      setFinderLocation('applications');
    }
  }, [finderLocation, setFinderLocation]);

  const toggleTag = useCallback((itemId: string, tagId: FinderTagId) => {
    setItemTags((prev) => {
      const current = prev[itemId] ?? [];
      const nextTags = current.includes(tagId)
        ? current.filter((t) => t !== tagId)
        : [...current, tagId];
      const next: ItemTagsMap = { ...prev };
      if (nextTags.length === 0) delete next[itemId];
      else next[itemId] = nextTags;
      writeItemTags(next);
      return next;
    });
  }, []);

  const onContextItem = useCallback((item: FinderItem, e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const items = useMemo(() => {
    if (finderLocation === 'applications') return APPLICATIONS;
    if (finderLocation === 'desktop') return DESKTOP;
    if (finderLocation === 'documents') return DOCUMENTS;
    if (finderLocation === 'sideProjects') return SIDE_PROJECTS;
    if (finderLocation === 'favourites') return FAVOURITES;
    if (finderLocation === 'trash') return TRASH;
    if (TAG_IDS.has(finderLocation)) {
      const tagId = finderLocation as FinderTagId;
      return ITEM_CATALOG.filter((item) => (itemTags[item.id] ?? []).includes(tagId));
    }
    return recents
      .filter((id) => id !== 'finder')
      .map((id) => {
        const known =
          APPLICATIONS.find((a) => a.openId === id) ||
          FAVOURITES.find((a) => a.openId === id) ||
          SIDE_PROJECTS.find((a) => a.openId === id);
        return {
          id,
          label: known?.label ?? titles[id] ?? id,
          src: WINDOW_ICON_SRC[id] ?? '/icons/folder.svg',
          openId: id,
          syncUrl: known?.syncUrl,
        } satisfies FinderItem;
      });
  }, [finderLocation, itemTags, recents, titles]);

  return (
    <div
      className="os-window-content flex h-full min-h-0 w-full overflow-hidden"
      data-os-embedded="true"
    >
      <aside className="flex w-[168px] shrink-0 flex-col border-r border-border/30 bg-foreground/[0.03] sm:w-[184px]">
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 py-3">
          <p className="mb-1.5 px-2 text-[11px] font-medium tracking-wide text-muted-foreground">
            Favourites
          </p>
          <ul className="flex flex-col gap-0.5">
            {SIDEBAR.map((item) => (
              <li key={item.id}>
                <SidebarItem
                  active={finderLocation === item.id}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => setFinderLocation(item.id)}
                />
              </li>
            ))}
          </ul>

          <p className="mb-1.5 mt-4 px-2 text-[11px] font-medium tracking-wide text-muted-foreground">
            Tags
          </p>
          <ul className="flex flex-col gap-0.5">
            {TAGS.map((tag) => (
              <li key={tag.id}>
                <TagSidebarItem
                  tag={tag}
                  active={finderLocation === tag.id}
                  onClick={() => setFinderLocation(tag.id)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border/25 px-3">
          <h2 className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-foreground/85">
            {LOCATION_TITLE[finderLocation] ?? 'Catalog'}
          </h2>
          <div
            className="inline-flex items-center rounded-lg border border-border/40 bg-foreground/[0.03] p-0.5"
            role="group"
            aria-label="View"
          >
            <button
              type="button"
              aria-label="Icons"
              aria-pressed={view === 'grid'}
              data-cuelume-press
              className={cn(
                'inline-flex h-6 w-7 items-center justify-center rounded-md transition-colors',
                view === 'grid'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80',
                focusRing,
              )}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="List"
              aria-pressed={view === 'list'}
              data-cuelume-press
              className={cn(
                'inline-flex h-6 w-7 items-center justify-center rounded-md transition-colors',
                view === 'list'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80',
                focusRing,
              )}
              onClick={() => setView('list')}
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ItemViews
            items={items}
            view={view}
            itemTags={itemTags}
            onContextItem={onContextItem}
          />
        </div>
      </div>

      {ctxMenu ? (
        <TagsContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          itemId={ctxMenu.item.id}
          itemLabel={ctxMenu.item.label}
          assigned={itemTags[ctxMenu.item.id] ?? []}
          onToggle={(tagId) => toggleTag(ctxMenu.item.id, tagId)}
          onClose={() => setCtxMenu(null)}
        />
      ) : null}
    </div>
  );
}
