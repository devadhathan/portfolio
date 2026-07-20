'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, FileText, Folder, Lock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROJECT_TREE, type ProjectTreeNode } from '@/lib/project-tree-data';

type ProjectTreeCardProps = {
  label: string;
  icon?: LucideIcon;
  selectedProjectId?: string | null;
  onProjectSelect?: (projectId: string) => void;
  className?: string;
};

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
      <Icon className="h-3.5 w-3.5 text-foreground/50" strokeWidth={1.35} aria-hidden />
      {locked && (
        <Lock
          className="absolute -bottom-0.5 -right-0.5 h-[7px] w-[7px] text-foreground/45"
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
          'min-w-0 flex-1 truncate text-[13px] leading-none',
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
          onClick={() => onProjectSelect?.(node.projectId!)}
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

  const onToggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="mb-3 flex shrink-0 items-center gap-2.5">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-foreground/80" strokeWidth={1.75} /> : null}
        <span className="text-[15px] font-medium tracking-tight text-foreground">{label}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        <ul className="m-0 flex flex-col gap-1.5 p-0">
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
    </div>
  );
}
