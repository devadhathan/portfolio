'use client';

import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUIViewportStack } from '@/components/gen-ui-viewport-stack';
import { GenUISearchBar } from '@/components/gen-ui-search-bar';
import { GenUIThinkingRow } from '@/components/gen-ui-thinking-row';
import { OsBackButton } from '@/components/os-back-button';
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
  /** Fill a parent panel/window instead of full viewport chrome. */
  embedded?: boolean;
  orbSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  subheadPlacement?: 'under-headline' | 'below-chips';
  onSubmit: (prompt: string) => void | Promise<void>;
  onActiveChange: (id: string) => void;
  onCaseStudySelect?: (projectSlug: string) => void;
  /** Return to the empty orb / center search state. */
  onBack?: () => void;
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
  embedded = false,
  orbSize = 'sm',
  subheadPlacement = 'under-headline',
  onSubmit,
  onActiveChange,
  onCaseStudySelect,
  onBack,
  headline,
  subhead,
}: GenUIModeShellProps) {
  const limitReached = promptLimitLoaded && promptCount <= 0;
  const showCenterSearch = !hasPrompted && viewports.length === 0 && !isAgentWorking && !isLoading;
  const showBottomSearch = hasPrompted || viewports.length > 0 || isAgentWorking || isLoading;
  const limitText = promptLimitLabel(promptLimitLoaded, limitReached, promptCount);
  const showBack = Boolean(onBack) && !showCenterSearch;

  return (
    <div
      className={cn(
        'relative w-full',
        embedded
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
          : showCenterSearch
            ? 'h-full min-h-0'
            : 'min-h-[calc(100vh-3.5rem)]',
      )}
    >
      {showBack ? (
        <div
          className={cn(
            'z-50',
            embedded ? 'absolute left-3 top-3' : 'sticky top-3 z-50 px-4 pt-1 md:px-6',
          )}
        >
          <OsBackButton onClick={onBack!} aria-label="Back to Ask AI" />
        </div>
      ) : null}

      {showCenterSearch ? (
        <div
          className={cn(
            'flex min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:py-10',
            embedded ? 'flex-1' : 'h-full',
          )}
        >
          <div className="my-auto w-full max-w-2xl">
            <GenUISearchBar
              variant="center"
              onSubmit={onSubmit}
              isLoading={isLoading}
              promptCount={promptCount}
              disabled={limitReached || !promptLimitLoaded}
              headline={headline}
              subhead={subhead}
              subheadPlacement={subheadPlacement}
              orbSize={orbSize}
              limitLabel={limitText}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              embedded
                ? viewports.length > 0
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                  : 'min-h-0 flex-1 overflow-y-auto'
                : undefined,
              showBack && (embedded ? 'pt-12' : 'pt-2'),
              showBottomSearch &&
                !embedded &&
                'pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] lg:pb-32',
            )}
          >
            {viewports.length > 0 ? (
              <GenUIViewportStack
                viewports={viewports}
                activeId={activeViewportId}
                isBuilding={isAgentWorking}
                scrollToId={scrollToViewportId}
                hideMobileNav={hideMobileNav}
                embedded={embedded}
                onActiveChange={onActiveChange}
                onCaseStudySelect={onCaseStudySelect}
              />
            ) : isLoading ? (
              <div
                className={cn(
                  'mx-auto w-full max-w-3xl px-4 md:px-6',
                  embedded ? 'pt-10 pb-28' : 'pt-20 md:pt-24',
                )}
              >
                <GenUIThinkingRow />
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center px-4',
                  embedded ? 'h-full min-h-[280px]' : 'h-[calc(100vh-8rem)]',
                )}
              >
                <GenUISearchBar
                  variant="center"
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  promptCount={promptCount}
                  disabled={limitReached || !promptLimitLoaded}
                  headline={headline}
                  subhead={subhead}
                  subheadPlacement={subheadPlacement}
                  orbSize={orbSize}
                  limitLabel={limitText}
                />
              </div>
            )}
          </div>

          {showBottomSearch && (
            <div
              className={cn(
                'pointer-events-none z-40 w-full px-4',
                embedded
                  ? 'absolute inset-x-0 bottom-3'
                  : 'fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] left-1/2 -translate-x-1/2 lg:bottom-10',
              )}
            >
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
