'use client';

import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUIViewportStack } from '@/components/gen-ui-viewport-stack';
import { GenUISearchBar } from '@/components/gen-ui-search-bar';
import { GenUIThinkingRow } from '@/components/gen-ui-thinking-row';
import { cn } from '@/lib/utils';

type GenUIModeShellProps = {
  viewports: GenUIViewport[];
  activeViewportId: string | null;
  scrollToViewportId: string | null;
  isAgentWorking: boolean;
  hasPrompted: boolean;
  isLoading: boolean;
  promptCount: number;
  promptLimitLoaded?: boolean;
  hideMobileNav?: boolean;
  onSubmit: (prompt: string) => void | Promise<void>;
  onActiveChange: (id: string) => void;
  onCaseStudySelect?: (projectSlug: string) => void;
  headline?: string;
  subhead?: string;
};

function promptLimitLabel(promptLimitLoaded: boolean, limitReached: boolean, promptCount: number) {
  if (!promptLimitLoaded) return 'Checking prompt limit…';
  if (limitReached) return 'No prompts remaining';
  return `${promptCount} prompt${promptCount === 1 ? '' : 's'} remaining`;
}

export function GenUIModeShell({
  viewports,
  activeViewportId,
  scrollToViewportId,
  isAgentWorking,
  hasPrompted,
  isLoading,
  promptCount,
  promptLimitLoaded = true,
  hideMobileNav = false,
  onSubmit,
  onActiveChange,
  onCaseStudySelect,
  headline,
  subhead,
}: GenUIModeShellProps) {
  const limitReached = promptLimitLoaded && promptCount <= 0;
  const showCenterSearch = !hasPrompted && viewports.length === 0 && !isAgentWorking && !isLoading;
  const showBottomSearch = hasPrompted || viewports.length > 0 || isAgentWorking || isLoading;
  const limitText = promptLimitLabel(promptLimitLoaded, limitReached, promptCount);

  return (
    <div className={cn('relative w-full', showCenterSearch ? 'h-full min-h-0' : 'min-h-[calc(100vh-3.5rem)]')}>
      {showCenterSearch ? (
        <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:py-10">
          <div className="my-auto w-full max-w-2xl">
            <GenUISearchBar
              variant="center"
              onSubmit={onSubmit}
              isLoading={isLoading}
              promptCount={promptCount}
              disabled={limitReached || !promptLimitLoaded}
              headline={headline}
              subhead={subhead}
              limitLabel={limitText}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              showBottomSearch && 'pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] lg:pb-32',
            )}
          >
            {viewports.length > 0 ? (
              <GenUIViewportStack
                viewports={viewports}
                activeId={activeViewportId}
                isBuilding={isAgentWorking}
                scrollToId={scrollToViewportId}
                hideMobileNav={hideMobileNav}
                onActiveChange={onActiveChange}
                onCaseStudySelect={onCaseStudySelect}
              />
            ) : isLoading ? (
              <div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-20 md:pt-24">
                <GenUIThinkingRow />
              </div>
            ) : (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center px-4">
                <GenUISearchBar
                  variant="center"
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  promptCount={promptCount}
                  disabled={limitReached || !promptLimitLoaded}
                  headline={headline}
                  subhead={subhead}
                  limitLabel={limitText}
                />
              </div>
            )}
          </div>

          {showBottomSearch && (
            <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] left-1/2 z-40 w-full -translate-x-1/2 px-4 lg:bottom-10">
              <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col items-center gap-1.5">
                <GenUISearchBar
                  variant="bottom"
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  promptCount={promptCount}
                  disabled={limitReached || !promptLimitLoaded}
                />
                <p className="text-xs text-muted-foreground/50 tabular-nums">{limitText}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
