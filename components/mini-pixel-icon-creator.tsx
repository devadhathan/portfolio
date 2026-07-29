'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Download, Loader2, PenLine, RotateCcw, X } from 'lucide-react';
import { play } from 'cuelume';
import { cn } from '@/lib/utils';
import {
  PIXEL_GRID_SIZE,
  PIXEL_VIEWBOX,
  pixelGridFromSet,
  pixelGridHasPixels,
  pixelsToSmoothSvg,
  normalizeSvgForDisplay,
  PIXEL_ICON_FILL,
  brushPixelKeys,
  linePixelCoords,
} from '@/lib/pixel-grid';
import { PIXL_THUMBNAIL_SRC } from '@/lib/pixl-thumbnail-svg';

function PixlArtwork({ hovered }: { hovered: boolean }) {
  return (
    <div
      role="img"
      aria-label="Pixl"
      className={cn(
        'absolute inset-[10%] origin-center transition-all duration-300 ease-out',
        hovered ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-[0.38]',
      )}
    >
      <img
        src={PIXL_THUMBNAIL_SRC}
        alt=""
        aria-hidden
        className="pixl-artwork-svg h-full w-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

type MiniPixelIconCreatorProps = {
  createLabel: string;
  startDrawLabel?: string;
  retryLabel?: string;
  cancelLabel?: string;
  downloadLabel?: string;
  generatingLabel?: string;
  errorEmptyLabel?: string;
  apiErrorLabel?: string;
  cardHovered?: boolean;
  onSvgCreated?: (svg: string) => void;
  className?: string;
};

function downloadSvg(svg: string, filename = 'pixl-icon.svg') {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PixelGridDisplay({
  pixels,
  interactive = false,
  isDrawing,
  drawMode,
  onPaint,
  onDrawingChange,
  className,
}: {
  pixels: Set<string>;
  interactive?: boolean;
  isDrawing?: boolean;
  drawMode?: boolean;
  onPaint?: (x: number, y: number, mode: boolean, continueStroke?: boolean) => void;
  onDrawingChange?: (drawing: boolean) => void;
  className?: string;
}) {
  const grid = useMemo(() => pixelGridFromSet(pixels, PIXEL_GRID_SIZE), [pixels]);

  return (
    <div
      className={cn(
        'pixel-draw-cursor grid aspect-square w-full touch-none select-none gap-px rounded-md border border-border/40 bg-border/25 p-px',
        !interactive && 'pointer-events-none',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${PIXEL_GRID_SIZE}, minmax(0, 1fr))` }}
      onPointerUp={() => {
        onDrawingChange?.(false);
      }}
      onPointerLeave={() => {
        onDrawingChange?.(false);
      }}
    >
      {grid.map((row, y) =>
        row.map((on, x) => {
          const key = `${x},${y}`;

          return interactive ? (
            <button
              key={key}
              type="button"
              aria-label={`Pixel ${x + 1}, ${y + 1}`}
              className={cn(
                'aspect-square w-full bg-secondary/35 transition-colors',
                on ? 'bg-[var(--theme-color)]' : 'hover:bg-muted/55',
              )}
              onPointerDown={(e) => {
                e.stopPropagation();
                onDrawingChange?.(true);
                onPaint?.(x, y, !on, false);
              }}
              onPointerEnter={(e) => {
                if (!isDrawing || e.buttons !== 1) return;
                onPaint?.(x, y, drawMode ?? true, true);
              }}
            />
          ) : (
            <span
              key={key}
              className={cn(
                'block aspect-square w-full bg-secondary/35',
                on ? 'bg-[var(--theme-color)]' : '',
              )}
            />
          );
        }),
      )}
    </div>
  );
}

function PixlThumbnail({
  startDrawLabel,
  onStartDraw,
  cardHovered = false,
}: {
  startDrawLabel: string;
  onStartDraw: () => void;
  cardHovered?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full px-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-md">
          <PixlArtwork hovered={cardHovered} />
        </div>
      </div>
      <button
        type="button"
        onClick={onStartDraw}
        data-cuelume-press
        data-cuelume-release
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-primary px-5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <PenLine className="h-3.5 w-3.5" strokeWidth={1.75} />
        {startDrawLabel}
      </button>
    </div>
  );
}

export function MiniPixelIconCreator({
  createLabel = 'Generate',
  startDrawLabel = 'Draw',
  retryLabel = 'Retry',
  cancelLabel = 'Cancel',
  downloadLabel = 'Download SVG',
  generatingLabel = 'Generating…',
  errorEmptyLabel = 'Draw something on the grid first.',
  apiErrorLabel = 'Could not reach the icon API. Try again.',
  cardHovered = false,
  onSvgCreated,
  className,
}: MiniPixelIconCreatorProps) {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [pixels, setPixels] = useState<Set<string>>(() => new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(true);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPaintRef = useRef<[number, number] | null>(null);

  const grid = useMemo(() => pixelGridFromSet(pixels, PIXEL_GRID_SIZE), [pixels]);

  const clearStroke = useCallback(() => {
    lastPaintRef.current = null;
  }, []);

  const paintAt = useCallback((x: number, y: number, mode: boolean, continueStroke = true) => {
    if (!continueStroke) {
      play('tick', { volume: 0.22 });
    }
    setDrawMode(mode);
    setPixels((prev) => {
      const next = new Set(prev);

      const stamp = (px: number, py: number) => {
        for (const key of brushPixelKeys(px, py)) {
          if (mode) next.add(key);
          else next.delete(key);
        }
      };

      const last = continueStroke ? lastPaintRef.current : null;
      if (last) {
        for (const [px, py] of linePixelCoords(last[0], last[1], x, y)) {
          stamp(px, py);
        }
      } else {
        stamp(x, y);
      }

      lastPaintRef.current = [x, y];
      return next;
    });
  }, []);

  const startDrawing = () => {
    setIsEditorActive(true);
    setPixels(new Set());
    setGeneratedSvg(null);
    setError(null);
    setIsDrawing(false);
    clearStroke();
    play('press', { volume: 0.4 });
  };

  const cancelEditing = () => {
    setIsEditorActive(false);
    setPixels(new Set());
    setGeneratedSvg(null);
    setError(null);
    setIsDrawing(false);
    clearStroke();
    play('droplet', { volume: 0.35 });
  };

  const retryDrawing = () => {
    setPixels(new Set());
    setGeneratedSvg(null);
    setError(null);
    setIsDrawing(false);
    clearStroke();
    play('droplet', { volume: 0.4 });
  };

  const generateIcon = async () => {
    if (!pixelGridHasPixels(grid)) {
      setError(errorEmptyLabel);
      play('error', { volume: 0.4 });
      return;
    }

    setError(null);
    setIsGenerating(true);
    play('loading', { volume: 0.35 });

    // Local boundary trace — single smooth cubic-bezier path, no AI latency.
    const traced = normalizeSvgForDisplay(
      pixelsToSmoothSvg(grid, PIXEL_VIEWBOX, PIXEL_ICON_FILL),
    );
    setGeneratedSvg(traced);
    onSvgCreated?.(traced);
    setIsGenerating(false);
    play('success', { volume: 0.45 });
  };

  if (!isEditorActive) {
    return (
      <div className={cn('relative z-10', className)}>
        <PixlThumbnail
          startDrawLabel={startDrawLabel}
          onStartDraw={startDrawing}
          cardHovered={cardHovered}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative z-10 flex flex-col gap-3', className)}>
      <div className="relative w-full px-1">
        <div className="relative aspect-square w-full rounded-md border border-border/40 bg-secondary/25">
          {generatedSvg ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 p-[12%]">
              <div
                key="generated-svg"
                className="h-full w-full max-h-full max-w-full animate-in fade-in zoom-in-95 duration-300 [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible"
                style={{ imageRendering: 'auto' }}
                dangerouslySetInnerHTML={{ __html: generatedSvg }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 p-px"
              onPointerUp={() => {
                setIsDrawing(false);
                clearStroke();
              }}
              onPointerLeave={() => {
                setIsDrawing(false);
                clearStroke();
              }}
            >
              <PixelGridDisplay
                pixels={pixels}
                interactive
                isDrawing={isDrawing}
                drawMode={drawMode}
                onPaint={(x, y, mode, continueStroke) => {
                  paintAt(x, y, mode, continueStroke);
                }}
                onDrawingChange={setIsDrawing}
              />
            </div>
          )}

          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {generatingLabel}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="px-1 font-mono text-[10px] text-red-400/90">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-center gap-2 px-1">
        {generatedSvg ? (
          <button
            type="button"
            onClick={() => downloadSvg(generatedSvg)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-primary px-4 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            {downloadLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={generateIcon}
            disabled={isGenerating}
            data-cuelume-press
            data-cuelume-release
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-primary px-4 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {generatingLabel}
              </>
            ) : (
              createLabel
            )}
          </button>
        )}
        <button
          type="button"
          onClick={retryDrawing}
          disabled={isGenerating}
          aria-label={retryLabel}
          data-cuelume-press
          data-cuelume-release
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-60"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={cancelEditing}
          disabled={isGenerating}
          aria-label={cancelLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
