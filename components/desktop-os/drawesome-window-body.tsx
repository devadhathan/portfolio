'use client';

import { Draw, SWATCHES_COMPACT } from 'drawesome';
import { useTheme } from 'next-themes';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import 'drawesome/styles.css';

export function DrawesomeWindowBody() {
  const { resolvedTheme } = useTheme();
  const { isNarrow } = useDesktopOs();

  return (
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
      <div className="flex h-full min-h-[min(360px,60vh)] flex-col p-2 sm:min-h-[min(520px,70vh)] sm:p-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40 bg-background">
          <Draw
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            look="studio"
            /*
             * On a phone the bar has to fit a narrow window: trim to the compact
             * palette, drop the custom-colour picker (fiddly at that size), and
             * move size/opacity into each tool so the bar stays one short row.
             */
            swatches={isNarrow ? SWATCHES_COMPACT : undefined}
            settings={isNarrow ? 'tool' : 'bar'}
            controls={isNarrow ? { custom: false } : undefined}
            tooltips={!isNarrow}
            inset={isNarrow ? 8 : undefined}
          />
        </div>
      </div>
    </div>
  );
}
