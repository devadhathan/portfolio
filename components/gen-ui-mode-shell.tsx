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
    <div className={cn('relative w-full', showCenterSearch ? 'h-full overflow-hidden' : 'min-h-[calc(100vh-3.5rem)]')}>
      <div className="pointer-events-none fixed bottom-3 left-1/2 z-30 -translate-x-1/2">
        <p className="text-xs text-muted-foreground/50 tabular-nums text-center">
          {limitReached
            ? 'No prompts remaining'
            : `${promptCount} prompt${promptCount === 1 ? '' : 's'} remaining`}
        </p>
      </div>

      {showCenterSearch ? (
        <div className="grid h-full place-items-center overflow-hidden px-4">
          <div className="-translate-y-6 md:-translate-y-8 w-full max-w-2xl">
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
          <div className={cn(showBottomSearch && 'pb-32')}>
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
            ) : null}
          </div>

          {showBottomSearch && (
            <div className="fixed bottom-10 left-1/2 z-40 w-full -translate-x-1/2 px-4 pointer-events-none">
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
