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
  onSubmit: (prompt: string) => void | Promise<void>;
  onActiveChange: (id: string) => void;
};

export function GenUIModeShell({
  viewports,
  activeViewportId,
  scrollToViewportId,
  isAgentWorking,
  hasPrompted,
  isLoading,
  promptCount,
  onSubmit,
  onActiveChange,
}: GenUIModeShellProps) {
  const limitReached = promptCount <= 0;
  const showCenterSearch = !hasPrompted && viewports.length === 0 && !isAgentWorking && !isLoading;
  const showBottomSearch = hasPrompted || viewports.length > 0 || isAgentWorking || isLoading;

  return (
    <div className={cn('relative w-full', showCenterSearch ? 'h-full min-h-0' : 'min-h-[calc(100vh-3.5rem)]')}>
      <div
        className={cn(
          'pointer-events-none fixed left-1/2 z-30 -translate-x-1/2',
          showBottomSearch
            ? 'bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+4.25rem)] lg:bottom-3'
            : 'bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] lg:bottom-3',
        )}
      >
        <p className="text-xs text-muted-foreground/50 tabular-nums text-center">
          {limitReached
            ? 'No prompts remaining'
            : `${promptCount} prompt${promptCount === 1 ? '' : 's'} remaining`}
        </p>
      </div>

      {showCenterSearch ? (
        <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:py-10">
          <div className="w-full max-w-2xl my-auto">
            <GenUISearchBar
              variant="center"
              onSubmit={onSubmit}
              isLoading={isLoading}
              promptCount={promptCount}
              disabled={limitReached}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              showBottomSearch &&
                'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+5.5rem)] lg:pb-32',
            )}
          >
            {viewports.length > 0 ? (
              <GenUIViewportStack
                viewports={viewports}
                activeId={activeViewportId}
                isBuilding={isAgentWorking}
                scrollToId={scrollToViewportId}
                onActiveChange={onActiveChange}
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
                  disabled={limitReached}
                />
              </div>
            )}
          </div>

          {showBottomSearch && (
            <div className="fixed left-1/2 z-40 w-full -translate-x-1/2 px-4 pointer-events-none bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] lg:bottom-10">
              <div className="pointer-events-auto mx-auto max-w-3xl">
                <GenUISearchBar
                  variant="bottom"
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  promptCount={promptCount}
                  disabled={limitReached}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
