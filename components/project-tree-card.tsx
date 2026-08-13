'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, FileText, Folder, Lock, type LucideIcon } from 'lucide-react';
import { play } from 'cuelume';
import { cn } from '@/lib/utils';
import { PROJECT_TREE, type ProjectTreeNode } from '@/lib/project-tree-data';

type ProjectTreeCardProps = {
  label: string;
  icon?: LucideIcon;
  selectedProjectId?: string | null;
  onProjectSelect?: (projectId: string) => void;
  className?: string;
};

/** Idle = fanned folders; hover = gather into a neat stack. */
const FOLDER_STACK = [
  { idle: 'translate(-22px, 10px) rotate(-18deg)', gathered: 'translate(-4px, 2px) rotate(-3deg)' },
  { idle: 'translate(8px, -6px) rotate(14deg)', gathered: 'translate(2px, -1px) rotate(2deg)' },
  { idle: 'translate(-6px, -14px) rotate(-8deg)', gathered: 'translate(-1px, -2px) rotate(-1deg)' },
  { idle: 'translate(18px, 8px) rotate(22deg)', gathered: 'translate(3px, 1px) rotate(3deg)' },
  { idle: 'translate(-14px, 16px) rotate(6deg)', gathered: 'translate(0px, 0px) rotate(0deg)' },
] as const;

function FolderOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 52"
      fill="none"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <path
        d="M4 14.5C4 12.0147 6.01472 10 8.5 10H22.2c1.1 0 2.15.5 2.85 1.35L27.5 14.5H55.5C57.9853 14.5 60 16.5147 60 19V43.5C60 45.9853 57.9853 48 55.5 48H8.5C6.01472 48 4 45.9853 4 43.5V14.5Z"
        className="fill-card stroke-foreground/35"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M4 19.5H60"
        className="stroke-foreground/30"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocStackGraphic({ gathered, className }: { gathered: boolean; className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute bottom-0 right-0 h-[150px] w-[170px] origin-bottom-right scale-110', className)}
      aria-hidden
    >
      <div className="relative h-full w-full">
        {FOLDER_STACK.map((folder, index) => (
          <div
            key={index}
            className="absolute left-1/2 top-1/2 h-[82px] w-[100px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              zIndex: index + 1,
              transform: `translate(-50%, -50%) ${gathered ? folder.gathered : folder.idle}`,
            }}
          >
            <FolderOutline />
          </div>
        ))}
      </div>
    </div>
  );
}

function collectDefaultOpen(nodes: ProjectTreeNode[]): Set<string> {
  const open = new Set<string>();
  const walk = (list: ProjectTreeNode[]) => {
    for (const node of list) {
      if (node.defaultOpen) open.add(node.id);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return open;
}

function TreeItemGlyph({ isDocument, locked }: { isDocument: boolean; locked?: boolean }) {
  const Icon = isDocument ? FileText : Folder;

  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <Icon className="h-3.5 w-3.5 text-primary/55" strokeWidth={1.35} aria-hidden />
      {locked && (
        <Lock
          className="absolute -bottom-0.5 -right-0.5 h-[7px] w-[7px] text-primary/50"
          strokeWidth={2.25}
          aria-hidden
        />
      )}
    </span>
  );
}

function TreeRow({
  node,
  depth,
  isLast,
  openIds,
  selectedProjectId,
  onToggle,
  onProjectSelect,
}: {
  node: ProjectTreeNode;
  depth: number;
  isLast: boolean;
  openIds: Set<string>;
  selectedProjectId?: string | null;
  onToggle: (id: string) => void;
  onProjectSelect?: (projectId: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = openIds.has(node.id);
  const isCaseStudy = Boolean(node.projectId);
  const isLocked = node.locked;
  const isDocument = !hasChildren && (isCaseStudy || Boolean(isLocked));
  const isActive = isCaseStudy && node.projectId === selectedProjectId;
  const showOpenHint = isCaseStudy && !isLocked;

  const rowContent = (
    <>
      {hasChildren ? (
          <button
            type="button"
            aria-label={isOpen ? `Collapse ${node.label}` : `Expand ${node.label}`}
            aria-expanded={isOpen}
            data-cuelume-toggle
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground/70 transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
          <ChevronRight
            className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-90')}
            strokeWidth={1.75}
          />
        </button>
      ) : (
        <span className="h-6 w-6 shrink-0" aria-hidden />
      )}

      <TreeItemGlyph isDocument={isDocument} locked={isLocked} />

      <span
        className={cn(
          'min-w-0 flex-1 truncate text-[14px] leading-none',
          isActive ? 'text-primary-foreground' : 'text-foreground/80',
          showOpenHint && !isActive && 'group-hover/row:text-foreground',
        )}
      >
        {node.label}
      </span>

      {showOpenHint ? (
        <ArrowUpRight
          className={cn(
            'h-3 w-3 shrink-0 translate-x-0.5 opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100',
            isActive ? 'text-primary-foreground/75' : 'text-muted-foreground/60 group-hover/row:text-foreground/65',
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <li
      className={cn(
        'relative list-none',
        depth > 0 && 'ml-4 pl-3',
        depth > 0 &&
          'before:pointer-events-none before:absolute before:-left-px before:top-0 before:w-px before:bg-border/50',
        depth > 0 && (isLast ? 'before:h-[14px]' : 'before:-bottom-1'),
        depth > 0 &&
          'after:pointer-events-none after:absolute after:-left-px after:top-[14px] after:h-px after:w-3 after:bg-border/50',
      )}
    >
      {isCaseStudy && node.projectId && !isLocked ? (
        <button
          type="button"
          aria-label={`Open ${node.label}`}
          aria-current={isActive ? 'page' : undefined}
          data-cuelume-hover="tick"
          data-cuelume-press
          onClick={() => {
            if (window.matchMedia('(hover: none)').matches) {
              play('tick', { volume: 0.4 });
            }
            onProjectSelect?.(node.projectId!);
          }}
          className={cn(
            'group/row flex min-h-[30px] w-full items-center gap-1 rounded-full px-1 pr-2 text-left transition-colors duration-200',
            isActive
              ? 'bg-primary/90 text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.2)]'
              : 'text-foreground/80 hover:bg-secondary/40',
          )}
        >
          {rowContent}
        </button>
      ) : (
        <div
          data-cuelume-hover="tick"
          className={cn(
            'group/row flex min-h-[30px] items-center gap-1 pr-0.5',
            isLocked && 'opacity-45',
          )}
        >
          {rowContent}
        </div>
      )}

      {hasChildren && isOpen && (
        <ul className="m-0 space-y-0.5 p-0 pt-0.5">
          {node.children!.map((child, index) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              openIds={openIds}
              selectedProjectId={selectedProjectId}
              onToggle={onToggle}
              onProjectSelect={onProjectSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ProjectTreeCard({
  label,
  icon: Icon,
  selectedProjectId,
  onProjectSelect,
  className,
}: ProjectTreeCardProps) {
  const defaultOpen = useMemo(() => collectDefaultOpen(PROJECT_TREE), []);
  const [openIds, setOpenIds] = useState<Set<string>>(defaultOpen);
  const [stackGathered, setStackGathered] = useState(false);

  const onToggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div
      className={cn('relative flex h-full min-h-0 flex-col', className)}
      onMouseEnter={() => setStackGathered(true)}
      onMouseLeave={() => setStackGathered(false)}
    >
      <div className="mb-4 flex shrink-0 items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} /> : null}
        <span className="card-title-type">{label}</span>
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        <ul className="m-0 flex flex-col gap-2 p-0">
          {PROJECT_TREE.map((node, index) => (
            <TreeRow
              key={node.id}
              node={node}
              depth={0}
              isLast={index === PROJECT_TREE.length - 1}
              openIds={openIds}
              selectedProjectId={selectedProjectId}
              onToggle={onToggle}
              onProjectSelect={onProjectSelect}
            />
          ))}
        </ul>
      </div>
      <DocStackGraphic gathered={stackGathered} />
    </div>
  );
}
