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
  onSubmit,
  onActiveChange,
}: GenUIModeShellProps) {
  const showCenterSearch = !hasPrompted && viewports.length === 0 && !isAgentWorking && !isLoading;
  const showBottomSearch = hasPrompted || viewports.length > 0 || isAgentWorking || isLoading;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full">
      {showCenterSearch ? (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 pb-24">
          <GenUISearchBar variant="center" onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      ) : (
        <>
          <div className={cn(showBottomSearch && 'pb-28')}>
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
            <div className="fixed bottom-6 left-1/2 z-40 w-full -translate-x-1/2 px-4 pointer-events-none">
              <div className="pointer-events-auto mx-auto max-w-3xl">
                <GenUISearchBar variant="bottom" onSubmit={onSubmit} isLoading={isLoading} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
