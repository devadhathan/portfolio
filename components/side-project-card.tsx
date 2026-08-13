'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CardTag } from '@/components/card-tag';
import { cn } from '@/lib/utils';

export type SideProjectItem = {
  id: string;
  name: string;
  image: string;
  href?: string;
  status?: string;
};

type SideProjectCardProps = {
  title: string;
  url?: string;
  projects: SideProjectItem[];
  className?: string;
};

type CardRole = 'front' | 'exit' | 'stack';

const MAX_VISIBLE_STACK = 4;
const CARD_WIDTH = 292;
const PEEK = 26;
const SCALE_STEP = 0.055;
const EXIT_MS = 1500;
const SPRING_STACK = '1400ms cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Front sits full-size. Exiting card uses `.side-project-card-exit` keyframes
 * (scale + move forward under clip). Stack peeks behind, scaled down.
 */
function cardMotion(role: CardRole, depth: number) {
  if (role === 'front') {
    return {
      zIndex: 40,
      opacity: 1,
      transform: 'translate3d(-50%, 0, 0) scale(1)',
    };
  }

  if (role === 'exit') {
    return {
      zIndex: 20,
      opacity: 1,
      transform: 'translate3d(-50%, 0, 0) scale(1)',
    };
  }

  const scale = Math.max(0.78, 1 - depth * SCALE_STEP);
  const y = -(depth * PEEK);
  return {
    zIndex: 30 - depth,
    opacity: depth >= MAX_VISIBLE_STACK ? 0 : 1,
    transform: `translate3d(-50%, ${y}px, 0) scale(${scale})`,
  };
}

export function SideProjectCard({
  title,
  url,
  projects,
  className,
}: SideProjectCardProps) {
  const [activeId, setActiveId] = useState<string | null>(projects[0]?.id ?? null);
  const [previousId, setPreviousId] = useState<string | null>(null);
  const [exitGen, setExitGen] = useState(0);
  const [arrowTop, setArrowTop] = useState(0);
  const [nearViewport, setNearViewport] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const node = rootRef.current;
    if (!node || nearViewport) return;

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearViewport]);
  useLayoutEffect(() => {
    if (!previousId) return;
    const node = cardRefs.current.get(previousId);
    if (!node) return;
    node.classList.remove('side-project-card-exit');
    void node.offsetWidth;
    node.classList.add('side-project-card-exit');
  }, [previousId, exitGen]);

  useEffect(() => {
    if (!previousId) return;
    const timer = window.setTimeout(() => setPreviousId(null), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [previousId, activeId]);

  const firstId = projects[0]?.id ?? null;
  const active = projects.find((p) => p.id === activeId) ?? projects[0] ?? null;

  const roles = useMemo(() => {
    const map = new Map<string, { role: CardRole; depth: number }>();
    if (!active) return map;

    map.set(active.id, { role: 'front', depth: 0 });

    if (previousId && previousId !== active.id) {
      map.set(previousId, { role: 'exit', depth: 0 });
    }

    let depth = 1;
    for (const project of projects) {
      if (project.id === active.id) continue;
      if (project.id === previousId) continue;
      map.set(project.id, { role: 'stack', depth });
      depth += 1;
    }

    return map;
  }, [projects, active, previousId]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const row = active ? rowRefs.current.get(active.id) : null;
    if (!list || !row) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setArrowTop(rowRect.top - listRect.top + rowRect.height / 2 - 6);
  }, [active?.id, projects]);

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const promote = (id: string) => {
    const current = activeIdRef.current;
    if (current && current !== id) {
      setPreviousId(current);
      setExitGen((g) => g + 1);
    }
    setActiveId(id);
  };

  const selectProject = (id: string) => {
    if (id === activeId) return;
    promote(id);
  };

  return (
    <div
      ref={rootRef}
      className={cn('flex h-full min-h-[340px] flex-col overflow-hidden sm:min-h-[400px]', className)}
      data-cuelume-card-hover
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={() => {
        if (!firstId) return;
        if (firstId !== activeId) promote(firstId);
      }}
    >
      <div className="shrink-0 px-4 pt-4 pb-2">
        <span className="card-title-type">{title}</span>
        {url ? (
          <p className="card-body-type mt-4 truncate">{url}</p>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col px-4">
        <div className="relative pl-5">
          <ChevronRight
            className="pointer-events-none absolute left-0 h-3 w-3 text-foreground transition-[top] duration-500 ease-[cubic-bezier(0.22,1.4,0.36,1)]"
            style={{ top: arrowTop }}
            strokeWidth={2.5}
            aria-hidden
          />

          <ul ref={listRef} className="m-0 flex list-none flex-col gap-2 p-0">
            {projects.map((project) => {
              const isActive = active?.id === project.id;
              const RowTag = project.href ? 'a' : 'button';
              return (
                <li
                  key={project.id}
                  ref={(node: HTMLLIElement | null) => {
                    if (node) rowRefs.current.set(project.id, node);
                    else rowRefs.current.delete(project.id);
                  }}
                >
                  <RowTag
                    {...(project.href
                      ? {
                          href: project.href,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : { type: 'button' as const })}
                    data-cuelume-hover="tick"
                    className={cn(
                      'group/row flex w-full items-center justify-between gap-2 text-left transition-colors duration-200',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                    onMouseEnter={() => selectProject(project.id)}
                    onFocus={() => selectProject(project.id)}
                  >
                    <span className="card-body-type min-w-0 truncate">{project.name}</span>
                    {project.status ? (
                      <CardTag tone="mono" className="max-w-[48%] shrink-0 truncate sm:max-w-none">
                        {project.status}
                      </CardTag>
                    ) : null}
                  </RowTag>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="relative mt-auto flex min-h-[240px] flex-1 items-end justify-center overflow-hidden pb-4 pt-16 sm:min-h-[300px] sm:pt-20"
          style={{ perspective: '1100px' }}
        >
          <div
            className="relative w-full max-w-[340px]"
            style={{
              height: 190 + (MAX_VISIBLE_STACK - 1) * PEEK,
              transformStyle: 'preserve-3d',
            }}
          >
            {projects.map((project) => {
              const entry = roles.get(project.id) ?? { role: 'stack' as const, depth: MAX_VISIBLE_STACK };
              const motion = cardMotion(entry.role, entry.depth);
              const isExit = entry.role === 'exit';
              // Only fetch visible stack faces once near the viewport.
              const shouldLoadImage =
                nearViewport &&
                (entry.role === 'front' ||
                  entry.role === 'exit' ||
                  (entry.role === 'stack' && entry.depth < MAX_VISIBLE_STACK));

              return (
                <div
                  key={project.id}
                  ref={(node: HTMLDivElement | null) => {
                    if (node) cardRefs.current.set(project.id, node);
                    else cardRefs.current.delete(project.id);
                  }}
                  className={cn(
                    'absolute bottom-0 left-1/2 overflow-hidden border border-border/30 bg-card shadow-[0_12px_28px_rgba(0,0,0,0.28)]',
                    !isExit && 'will-change-transform',
                    isExit && 'side-project-card-exit',
                  )}
                  style={{
                    width: CARD_WIDTH,
                    aspectRatio: '3 / 2',
                    zIndex: motion.zIndex,
                    opacity: motion.opacity,
                    transform: isExit
                      ? 'translate3d(-50%, 0, 0) scale(1)'
                      : motion.transform,
                    transformOrigin: 'center bottom',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    pointerEvents: 'none',
                    transition: isExit ? 'none' : `transform ${SPRING_STACK}`,
                  }}
                >
                  {shouldLoadImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={project.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary/25" aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
