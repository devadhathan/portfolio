'use client';

import { useCallback, useRef, useState } from 'react';
import { Draw, SWATCHES_COMPACT, type DrawHandle } from 'drawesome';
import { useTheme } from 'next-themes';
import { Download } from 'lucide-react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import {
  contentBounds,
  downloadBlob,
  drawingFilename,
  exportDrawing,
  type DrawExportFormat,
} from '@/lib/draw-export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import 'drawesome/styles.css';

const FORMATS: Array<{ id: DrawExportFormat; label: string }> = [
  { id: 'png', label: 'PNG' },
  { id: 'jpeg', label: 'JPEG' },
  { id: 'webp', label: 'WebP' },
];

export function DrawesomeWindowBody() {
  const { resolvedTheme } = useTheme();
  const { isNarrow } = useDesktopOs();
  const drawRef = useRef<DrawHandle>(null);
  const [status, setStatus] = useState<string | null>(null);

  const dark = resolvedTheme === 'dark';

  const handleDownload = useCallback(
    async (format: DrawExportFormat) => {
      const handle = drawRef.current;
      if (!handle) return;

      const board = handle.getSize();
      const bounds = contentBounds(handle.getStrokes(), board);
      if (!bounds) {
        setStatus('Nothing to save yet');
        window.setTimeout(() => setStatus(null), 2400);
        return;
      }

      try {
        const blob = await exportDrawing({
          svg: handle.toSvg(),
          bounds,
          format,
          // JPEG has no alpha, so it gets the board colour behind the ink.
          background: format === 'jpeg' ? (dark ? '#0a0a0a' : '#ffffff') : null,
        });
        downloadBlob(blob, drawingFilename(format));
      } catch {
        setStatus('Could not save that');
        window.setTimeout(() => setStatus(null), 2400);
      }
    },
    [dark],
  );

  const buttonClass =
    'flex h-8 items-center gap-1.5 rounded-full border border-border/50 bg-background/85 px-3 text-[12px] font-medium text-foreground/80 shadow-sm backdrop-blur transition-colors hover:bg-secondary/70 hover:text-foreground';

  return (
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
      <div className="flex h-full min-h-[min(360px,60vh)] flex-col p-2 sm:min-h-[min(520px,70vh)] sm:p-4">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40 bg-background">
          <Draw
            ref={drawRef}
            theme={dark ? 'dark' : 'light'}
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

          {/*
            * The pen toolbar owns the bottom edge, so save lives in the
            * opposite corner. z-40 clears the toolbar's own stacking (z-30).
            */}
          <div className="absolute right-3 top-3 z-40 flex items-center gap-2">
            {status ? (
              <span className="rounded-full bg-background/85 px-2.5 py-1 text-[12px] text-muted-foreground shadow-sm backdrop-blur">
                {status}
              </span>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" title="Save drawing" className={buttonClass}>
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Save
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {FORMATS.map((format) => (
                  <DropdownMenuItem
                    key={format.id}
                    onSelect={() => void handleDownload(format.id)}
                    className="text-[13px]"
                  >
                    {format.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
