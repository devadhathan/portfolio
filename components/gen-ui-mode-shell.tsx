'use client';

import type { GenUIViewport } from '@/lib/gen-ui-viewport';
import { GenUIAskSidebar } from '@/components/gen-ui-ask-sidebar';
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
  /** Fill a parent panel/window instead of full viewport chrome. */
  embedded?: boolean;
  orbSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  subheadPlacement?: 'under-headline' | 'below-chips';
  onSubmit: (prompt: string) => void | Promise<void>;
  onActiveChange: (id: string) => void;
  onCaseStudySelect?: (projectSlug: string) => void;
  /** Return to the empty center search state (New Chat). */
  onBack?: () => void;
  /** Brand wordmark next to the orb (center empty state). */
  brandLabel?: string;
  headline?: string;
  subhead?: string;
  /** Show Grok-style left rail (default on for embedded Ask window). */
  showSidebar?: boolean;
};

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
  brandLabel = 'Ask AI',
  headline,
  subhead,
  showSidebar,
}: GenUIModeShellProps) {
  const limitReached = promptLimitLoaded && promptCount <= 0;
  const showCenterSearch = !hasPrompted && viewports.length === 0 && !isAgentWorking && !isLoading;
  const showBottomSearch = hasPrompted || viewports.length > 0 || isAgentWorking || isLoading;
  const sidebarEnabled = showSidebar ?? (embedded && Boolean(onBack));

  const handleSelectViewport = (id: string) => {
    onActiveChange(id);
    requestAnimationFrame(() => {
      document.getElementById(`gen-ui-viewport-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };

  const main = (
    <div
      className={cn(
        'relative min-w-0',
        embedded || sidebarEnabled
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
          : showCenterSearch
            ? 'h-full min-h-0'
            : 'min-h-[calc(100vh-3.5rem)]',
      )}
    >
      {showCenterSearch ? (
        <div
          className={cn(
            'flex min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:py-10',
            embedded || sidebarEnabled ? 'flex-1' : 'h-full',
          )}
        >
          <div className="my-auto w-full max-w-2xl">
            <GenUISearchBar
              variant="center"
              onSubmit={onSubmit}
              isLoading={isLoading}
              promptCount={promptCount}
              disabled={limitReached || !promptLimitLoaded}
              brandLabel={brandLabel}
              headline={headline}
              subhead={subhead}
              subheadPlacement={subheadPlacement}
              orbSize={orbSize}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              embedded || sidebarEnabled
                ? viewports.length > 0
                  ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                  : 'min-h-0 flex-1 overflow-y-auto'
                : undefined,
              showBottomSearch &&
                !embedded &&
                !sidebarEnabled &&
                'pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] lg:pb-32',
              showBottomSearch &&
                (embedded || sidebarEnabled) &&
                'pb-[4.75rem]',
              onBack && !showCenterSearch && 'pt-12',
            )}
          >
            {viewports.length > 0 ? (
              <GenUIViewportStack
                viewports={viewports}
                activeId={activeViewportId}
                isBuilding={isAgentWorking}
                scrollToId={scrollToViewportId}
                hideMobileNav={hideMobileNav}
                embedded={embedded || sidebarEnabled}
                onActiveChange={onActiveChange}
                onCaseStudySelect={onCaseStudySelect}
              />
            ) : isLoading ? (
              <div
                className={cn(
                  'mx-auto w-full max-w-3xl px-4 md:px-6',
                  embedded || sidebarEnabled ? 'pt-10 pb-28' : 'pt-20 md:pt-24',
                )}
              >
                <GenUIThinkingRow />
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center px-4',
                  embedded || sidebarEnabled ? 'h-full min-h-[280px]' : 'h-[calc(100vh-8rem)]',
                )}
              >
                <GenUISearchBar
                  variant="center"
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  promptCount={promptCount}
                  disabled={limitReached || !promptLimitLoaded}
                  brandLabel={brandLabel}
                  headline={headline}
                  subhead={subhead}
                  subheadPlacement={subheadPlacement}
                  orbSize={orbSize}
                />
              </div>
            )}
          </div>

          {showBottomSearch && (
            <div
              className={cn(
                'pointer-events-none z-40 w-full px-4',
                embedded || sidebarEnabled
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (!sidebarEnabled || !onBack) {
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
        {main}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex w-full min-h-0 overflow-hidden',
        embedded ? 'flex-1' : 'h-full min-h-[calc(100vh-3.5rem)]',
      )}
    >
      <GenUIAskSidebar
        brandLabel={brandLabel}
        viewports={viewports}
        activeViewportId={activeViewportId}
        isEmpty={showCenterSearch}
        onNewChat={onBack}
        onSelectViewport={handleSelectViewport}
        className="hidden sm:flex"
      />
      {main}
    </div>
  );
}
