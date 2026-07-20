import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeSvgForDisplay,
  pixelGridHasPixels,
  pixelsToSmoothSvg,
  PIXEL_GRID_SIZE,
  PIXEL_VIEWBOX,
  PIXEL_ICON_FILL,
} from '@/lib/pixel-grid';

function normalizeGrid(body: unknown): boolean[][] | null {
  if (!body || typeof body !== 'object' || !('grid' in body)) return null;
  const grid = (body as { grid: unknown }).grid;
  if (!Array.isArray(grid) || grid.length === 0) return null;

  const size = grid.length;
  if (size > PIXEL_GRID_SIZE) return null;

  const normalized: boolean[][] = [];
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== size) return null;
    normalized.push(row.map((cell) => Boolean(cell)));
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const grid = normalizeGrid(body);

    if (!grid) {
      return NextResponse.json({ error: 'Invalid pixel grid' }, { status: 400 });
    }

    if (!pixelGridHasPixels(grid)) {
      return NextResponse.json({ error: 'Draw something on the grid first' }, { status: 400 });
    }

    const traced = normalizeSvgForDisplay(
      pixelsToSmoothSvg(grid, PIXEL_VIEWBOX, PIXEL_ICON_FILL),
    );

    return NextResponse.json({ svg: traced, source: 'traced' });
  } catch (error) {
    console.error('[pixel-icon]', error);
    return NextResponse.json({ error: 'Failed to generate icon' }, { status: 500 });
  }
}
