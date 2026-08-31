import type { Board, Stroke } from 'drawesome';

/** A text label placed on the drawing surface, in board coordinates. */
export type DrawTextItem = {
  id: string;
  /** Top-left corner of the first line. */
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
};

export type DrawExportFormat = 'png' | 'jpeg' | 'webp';

export type DrawRect = { x: number; y: number; w: number; h: number };

/**
 * Kept deliberately boring: the same stack has to parse both as a CSS
 * `font-family` and inside a canvas `font` shorthand, or the exported text
 * drifts from what was typed on screen.
 */
export const DRAW_TEXT_FONT = 'system-ui, sans-serif';
export const DRAW_TEXT_LINE_HEIGHT = 1.25;

const EXPORT_PADDING = 16;
const MIME: Record<DrawExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

let measureCtx: CanvasRenderingContext2D | null = null;

function measurer() {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  return measureCtx;
}

export function textLines(item: DrawTextItem) {
  return item.text.split('\n');
}

/** Width of the widest line, in board pixels. */
export function measureTextWidth(item: DrawTextItem) {
  const ctx = measurer();
  if (!ctx) return item.text.length * item.size * 0.6;
  ctx.font = `${item.size}px ${DRAW_TEXT_FONT}`;
  return textLines(item).reduce((widest, line) => Math.max(widest, ctx.measureText(line).width), 0);
}

export function measureTextHeight(item: DrawTextItem) {
  return textLines(item).length * item.size * DRAW_TEXT_LINE_HEIGHT;
}

/**
 * The box the ink and labels actually occupy, so a download is the drawing
 * rather than an acre of empty board around it. Eraser passes are skipped —
 * rubbing something out shouldn't stretch the crop to where the rubbing went.
 */
export function contentBounds(
  strokes: Stroke[],
  texts: DrawTextItem[],
  board: Board,
): DrawRect | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    if (stroke.erase) continue;
    const reach = stroke.size / 2 + 1;
    for (const [x, y] of stroke.points) {
      minX = Math.min(minX, x - reach);
      minY = Math.min(minY, y - reach);
      maxX = Math.max(maxX, x + reach);
      maxY = Math.max(maxY, y + reach);
    }
  }

  for (const item of texts) {
    if (!item.text.trim()) continue;
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + measureTextWidth(item));
    maxY = Math.max(maxY, item.y + measureTextHeight(item));
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

  const x = Math.max(0, Math.floor(minX - EXPORT_PADDING));
  const y = Math.max(0, Math.floor(minY - EXPORT_PADDING));
  const right = Math.min(board.w, Math.ceil(maxX + EXPORT_PADDING));
  const bottom = Math.min(board.h, Math.ceil(maxY + EXPORT_PADDING));

  return { x, y, w: Math.max(1, right - x), h: Math.max(1, bottom - y) };
}

/**
 * Re-wrap the board SVG in a viewBox covering just the crop. Stroke geometry is
 * already in board coordinates, so the viewBox does the cropping and the raster
 * still comes out at full resolution.
 */
function cropSvg(svg: string, bounds: DrawRect, scale: number) {
  const open = svg.indexOf('>');
  const close = svg.lastIndexOf('</svg>');
  if (!svg.startsWith('<svg') || open === -1 || close === -1) return null;

  const inner = svg.slice(open + 1, close);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.w * scale}" height="${bounds.h * scale}" ` +
    `viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}">${inner}</svg>`
  );
}

function loadSvg(markup: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not rasterise the drawing'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

export async function exportDrawing(options: {
  /** Full-board SVG, as produced by the Draw handle. */
  svg: string;
  texts: DrawTextItem[];
  bounds: DrawRect;
  format: DrawExportFormat;
  scale?: number;
  /** Painted behind the ink. Required for JPEG, which has no alpha. */
  background?: string | null;
}): Promise<Blob> {
  const { svg, texts, bounds, format } = options;
  const scale = options.scale ?? 2;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bounds.w * scale);
  canvas.height = Math.round(bounds.h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not rasterise the drawing');

  const background = format === 'jpeg' ? (options.background ?? '#ffffff') : options.background;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const cropped = cropSvg(svg, bounds, scale);
  const image = await loadSvg(cropped ?? svg);
  if (cropped) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    // Shape of the markup changed under us: fall back to a source-rect crop.
    ctx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-bounds.x, -bounds.y);
  ctx.textBaseline = 'top';
  for (const item of texts) {
    if (!item.text.trim()) continue;
    ctx.fillStyle = item.color;
    ctx.font = `${item.size}px ${DRAW_TEXT_FONT}`;
    textLines(item).forEach((line, i) => {
      ctx.fillText(line, item.x, item.y + i * item.size * DRAW_TEXT_LINE_HEIGHT);
    });
  }
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, MIME[format], 0.92);
  });
  // Older Safari returns null rather than refusing a format outright.
  if (!blob) {
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME.png));
    if (!png) throw new Error('Could not encode the drawing');
    return png;
  }
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking straight away cancels the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function drawingFilename(format: DrawExportFormat) {
  const stamp = new Date().toISOString().slice(0, 10);
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `drawing-${stamp}.${ext}`;
}
