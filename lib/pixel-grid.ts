export const PIXEL_GRID_SIZE = 48;
export const PIXEL_VIEWBOX = 24;
/** Round brush fits in a 3×3 (9-cell) grid; paints ~5 cells (center + cross). */
export const PIXEL_BRUSH_RADIUS = 1;

/** All grid keys covered by the round brush centered at (cx, cy). */
export function brushPixelKeys(
  cx: number,
  cy: number,
  radius = PIXEL_BRUSH_RADIUS,
  size = PIXEL_GRID_SIZE,
): string[] {
  const keys: string[] = [];
  const r2 = radius * radius + 0.01;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < size && y >= 0 && y < size) keys.push(`${x},${y}`);
    }
  }
  return keys;
}

/** Bresenham line — fills gaps when dragging quickly across the grid. */
export function linePixelCoords(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
}

export function emptyPixelGrid(size = PIXEL_GRID_SIZE): boolean[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false));
}

export function pixelGridFromSet(set: Set<string>, size = PIXEL_GRID_SIZE): boolean[][] {
  const grid = emptyPixelGrid(size);
  for (const key of set) {
    const [x, y] = key.split(',').map(Number);
    if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = true;
  }
  return grid;
}

export function pixelGridHasPixels(grid: boolean[][]): boolean {
  return grid.some((row) => row.some(Boolean));
}

/** ASCII sketch for the model — # filled, · empty. */
export function pixelGridToAscii(grid: boolean[][]): string {
  return grid.map((row) => row.map((on) => (on ? '#' : '·')).join('')).join('\n');
}

export const PIXEL_ICON_FILL = '#FFFFFF';

/** Upscale before trace for smoother curves (grid coords → finer boundary). */
const TRACE_UPSCALE = 1;

function fmt(n: number): string {
  return n.toFixed(3);
}

function upscaleGrid(grid: boolean[][], factor: number): boolean[][] {
  const size = grid.length;
  const upscaled = emptyPixelGrid(size * factor);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) continue;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          upscaled[y * factor + dy][x * factor + dx] = true;
        }
      }
    }
  }
  return upscaled;
}

/** Bridge diagonal-only neighbors so consecutive strokes form one connected shape. */
function connectDiagonalPixels(grid: boolean[][]): boolean[][] {
  const size = grid.length;
  const out = grid.map((row) => [...row]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) continue;

      if (
        y + 1 < size &&
        x + 1 < size &&
        grid[y + 1][x + 1] &&
        !grid[y + 1][x] &&
        !grid[y][x + 1]
      ) {
        out[y + 1][x] = true;
      }
      if (
        y + 1 < size &&
        x - 1 >= 0 &&
        grid[y + 1][x - 1] &&
        !grid[y + 1][x] &&
        !grid[y][x - 1]
      ) {
        out[y + 1][x] = true;
      }
      if (
        y - 1 >= 0 &&
        x + 1 < size &&
        grid[y - 1][x + 1] &&
        !grid[y - 1][x] &&
        !grid[y][x + 1]
      ) {
        out[y][x + 1] = true;
      }
      if (
        y - 1 >= 0 &&
        x - 1 >= 0 &&
        grid[y - 1][x - 1] &&
        !grid[y - 1][x] &&
        !grid[y][x - 1]
      ) {
        out[y][x - 1] = true;
      }
    }
  }

  return out;
}

/** Blocky fallback — one rect per filled cell. */
export function pixelsToSvg(grid: boolean[][], viewBox = 24, fill = PIXEL_ICON_FILL): string {
  const size = grid.length;
  if (size === 0) return '';

  const cell = viewBox / size;
  const rects: string[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        rects.push(
          `<rect x="${fmt(x * cell)}" y="${fmt(y * cell)}" width="${fmt(cell)}" height="${fmt(cell)}" fill="${fill}"/>`,
        );
      }
    }
  }

  return wrapSvg(viewBox, rects.join(''));
}

/** Legacy overlap rects — kept as last-resort fallback. */
export function pixelsToCurvedSvg(grid: boolean[][], viewBox = 24, fill = PIXEL_ICON_FILL): string {
  const size = grid.length;
  if (size === 0) return '';

  const cell = viewBox / size;
  const bleed = cell * 0.45;
  const rectSize = cell + bleed;
  const inset = -bleed / 2;
  const radius = cell * 0.35;
  const rects: string[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) continue;

      rects.push(
        `<rect x="${fmt(x * cell + inset)}" y="${fmt(y * cell + inset)}" width="${fmt(rectSize)}" height="${fmt(rectSize)}" rx="${fmt(radius)}" fill="${fill}"/>`,
      );
    }
  }

  return wrapSvg(viewBox, rects.join(''));
}

type GridPoint = [number, number];
type SvgPoint = [number, number];

function collectBoundaryEdges(grid: boolean[][]): Array<[number, number, number, number]> {
  const size = grid.length;
  const edges: Array<[number, number, number, number]> = [];
  const filled = (x: number, y: number) => x >= 0 && x < size && y >= 0 && y < size && grid[y][x];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) continue;
      if (!filled(x, y - 1)) edges.push([x, y, x + 1, y]);
      if (!filled(x + 1, y)) edges.push([x + 1, y, x + 1, y + 1]);
      if (!filled(x, y + 1)) edges.push([x + 1, y + 1, x, y + 1]);
      if (!filled(x - 1, y)) edges.push([x, y + 1, x, y]);
    }
  }

  return edges;
}

function turnDelta(inAngle: number, outAngle: number): number {
  let delta = outAngle - inAngle;
  while (delta <= 0) delta += Math.PI * 2;
  while (delta > Math.PI * 2) delta -= Math.PI * 2;
  return delta;
}

function chainBoundaryLoops(edges: Array<[number, number, number, number]>): GridPoint[][] {
  const adj = new Map<string, GridPoint[]>();

  for (const [x1, y1, x2, y2] of edges) {
    const k1 = `${x1},${y1}`;
    const k2 = `${x2},${y2}`;
    if (!adj.has(k1)) adj.set(k1, []);
    if (!adj.has(k2)) adj.set(k2, []);
    adj.get(k1)!.push([x2, y2]);
    adj.get(k2)!.push([x1, y1]);
  }

  const used = new Set<string>();
  const loops: GridPoint[][] = [];

  for (const [x1, y1, x2, y2] of edges) {
    const startKey = `${x1},${y1}|${x2},${y2}`;
    if (used.has(startKey)) continue;

    const loop: GridPoint[] = [[x1, y1]];
    let px = x1;
    let py = y1;
    let cx = x2;
    let cy = y2;
    used.add(startKey);
    used.add(`${x2},${y2}|${x1},${y1}`);

    let guard = 0;
    while ((cx !== x1 || cy !== y1) && guard++ < edges.length * 4) {
      loop.push([cx, cy]);
      const neighbors = adj.get(`${cx},${cy}`) ?? [];
      const inAngle = Math.atan2(cy - py, cx - px);

      let next: GridPoint | null = null;
      let bestDelta = Number.POSITIVE_INFINITY;

      for (const [nx, ny] of neighbors) {
        if (nx === px && ny === py) continue;
        const edgeKey = `${cx},${cy}|${nx},${ny}`;
        if (used.has(edgeKey)) continue;

        const outAngle = Math.atan2(ny - cy, nx - cx);
        const delta = turnDelta(inAngle, outAngle);
        if (delta < bestDelta) {
          bestDelta = delta;
          next = [nx, ny];
        }
      }

      if (!next) break;

      used.add(`${cx},${cy}|${next[0]},${next[1]}`);
      used.add(`${next[0]},${next[1]}|${cx},${cy}`);
      px = cx;
      py = cy;
      cx = next[0];
      cy = next[1];
    }

    if (loop.length >= 3) loops.push(loop);
  }

  return loops;
}

function edgeType(a: GridPoint, b: GridPoint): 'h' | 'v' | null {
  if (a[1] === b[1]) return 'h';
  if (a[0] === b[0]) return 'v';
  return null;
}

function unitEdge(a: GridPoint, b: GridPoint): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

/** Collapse pixel stair-steps (alternating H/V unit edges) into straight segments. */
function simplifyStaircases(points: GridPoint[]): GridPoint[] {
  const n = points.length;
  if (n < 4) return points;

  const result: GridPoint[] = [];
  let i = 0;

  while (i < n) {
    let k = i;

    while (k + 2 < n) {
      const prev = points[k];
      const curr = points[k + 1];
      const next = points[k + 2];
      const t1 = edgeType(prev, curr);
      const t2 = edgeType(curr, next);

      if (t1 && t2 && t1 !== t2 && unitEdge(prev, curr) && unitEdge(curr, next)) {
        k += 2;
      } else {
        break;
      }
    }

    if (k > i) {
      result.push(points[i]);
      result.push(points[k]);
      i = k;
    } else {
      result.push(points[i]);
      i++;
    }
  }

  return result;
}

/** Remove middle points that lie on the same straight line (grid space). */
function mergeCollinearGrid(points: GridPoint[]): GridPoint[] {
  const n = points.length;
  if (n < 3) return points;

  const result: GridPoint[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    const cross =
      (curr[0] - prev[0]) * (next[1] - prev[1]) - (curr[1] - prev[1]) * (next[0] - prev[0]);
    if (cross === 0) continue;
    result.push(curr);
  }

  return result.length >= 3 ? result : points;
}

function dedupeConsecutive(points: GridPoint[]): GridPoint[] {
  if (points.length === 0) return points;
  const result: GridPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    if (curr[0] !== prev[0] || curr[1] !== prev[1]) result.push(curr);
  }
  if (result.length > 1) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) result.pop();
  }
  return result;
}

function simplifyGridContour(loop: GridPoint[]): GridPoint[] {
  let pts = dedupeConsecutive(loop);
  for (let pass = 0; pass < 2; pass++) {
    pts = mergeCollinearGrid(pts);
    pts = dedupeConsecutive(pts);
    pts = simplifyStaircases(pts);
    pts = dedupeConsecutive(pts);
  }
  pts = mergeCollinearGrid(pts);
  return dedupeConsecutive(pts);
}

function perpDistance(point: SvgPoint, lineStart: SvgPoint, lineEnd: SvgPoint): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
}

function douglasPeuckerOpen(points: SvgPoint[], epsilon: number): SvgPoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpDistance(points[i], points[0], points[end]);
    if (d > maxDist) {
      maxDist = d;
      maxIndex = i;
    }
  }

  if (maxDist <= epsilon) return [points[0], points[end]];

  const left = douglasPeuckerOpen(points.slice(0, maxIndex + 1), epsilon);
  const right = douglasPeuckerOpen(points.slice(maxIndex), epsilon);
  return [...left.slice(0, -1), ...right];
}

function douglasPeuckerClosed(points: SvgPoint[], epsilon: number): SvgPoint[] {
  const n = points.length;
  if (n < 4) return points;

  let maxDist = 0;
  let split = 0;

  for (let i = 0; i < n; i++) {
    const d = perpDistance(points[i], points[0], points[n - 1]);
    if (d > maxDist) {
      maxDist = d;
      split = i;
    }
  }

  if (maxDist <= epsilon) return points;

  const part1 = points.slice(0, split + 1);
  const part2 = [...points.slice(split), points[0]];
  const simplified = [
    ...douglasPeuckerOpen(part1, epsilon).slice(0, -1),
    ...douglasPeuckerOpen(part2, epsilon).slice(0, -1),
  ];

  return simplified.length >= 3 ? simplified : points;
}

/** Round corners only — keeps straight pixel edges, softens 90° steps. */
function roundedPolygonPath(points: SvgPoint[], radius: number): string {
  const n = points.length;
  if (n < 3) return '';

  const corners: { start: SvgPoint; end: SvgPoint; ctrl: SvgPoint }[] = [];

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const v1x = prev[0] - curr[0];
    const v1y = prev[1] - curr[1];
    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 < 1e-6 || len2 < 1e-6) continue;

    const r = Math.min(radius, len1 * 0.45, len2 * 0.45);
    corners.push({
      start: [curr[0] + (v1x / len1) * r, curr[1] + (v1y / len1) * r],
      end: [curr[0] + (v2x / len2) * r, curr[1] + (v2y / len2) * r],
      ctrl: curr,
    });
  }

  if (corners.length < 2) return '';

  let d = `M ${fmt(corners[0].start[0])} ${fmt(corners[0].start[1])}`;
  for (let i = 0; i < corners.length; i++) {
    const c = corners[i];
    const next = corners[(i + 1) % corners.length];
    d += ` Q ${fmt(c.ctrl[0])} ${fmt(c.ctrl[1])} ${fmt(c.end[0])} ${fmt(c.end[1])}`;
    d += ` L ${fmt(next.start[0])} ${fmt(next.start[1])}`;
  }
  return `${d} Z`;
}

function loopToSmoothPath(loop: GridPoint[], cell: number): string {
  const simplified = simplifyGridContour(loop);
  if (simplified.length < 3) return '';

  const scaled: SvgPoint[] = simplified.map(([x, y]) => [x * cell, y * cell]);
  return roundedPolygonPath(scaled, cell * 0.42);
}

function wrapSvg(viewBox: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" fill="none" shape-rendering="geometricPrecision">${inner}</svg>`;
}

function buildSmoothPath(grid: boolean[][], viewBox: number): string {
  const connected = connectDiagonalPixels(grid);
  const upscaled = upscaleGrid(connected, TRACE_UPSCALE);
  const edges = collectBoundaryEdges(upscaled);
  if (edges.length === 0) return '';

  const cell = viewBox / upscaled.length;
  const loops = chainBoundaryLoops(edges);
  return loops.map((loop) => loopToSmoothPath(loop, cell)).filter(Boolean).join(' ');
}

/** Single smooth path outline — no per-pixel blocks. */
export function pixelsToOutlineSvg(grid: boolean[][], viewBox = 24, fill = PIXEL_ICON_FILL): string {
  const pathData = buildSmoothPath(grid, viewBox);
  if (!pathData) {
    // Last resort: sharp rects — never use overlapping rounded rects (looks blocky).
    return pixelsToSvg(grid, viewBox, fill);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" fill="none" shape-rendering="geometricPrecision"><path d="${pathData}" fill="${fill}"/></svg>`;
}

/** Preferred local vectorization — rounded corners on pixel outline, not full simplify. */
export function pixelsToSmoothSvg(grid: boolean[][], viewBox = 24, fill = PIXEL_ICON_FILL): string {
  return pixelsToOutlineSvg(grid, viewBox, fill);
}

/** AI often returns per-pixel rects or stair-stepped paths — reject blocky output. */
export function isBlockySvg(svg: string): boolean {
  const rectCount = (svg.match(/<rect\b/gi) ?? []).length;
  if (rectCount > 0) return true;

  const pathMatch = svg.match(/\bd=["']([^"']+)["']/i);
  if (!pathMatch) return false;

  const d = pathMatch[1];
  const lineCount = (d.match(/\bL\b/g) ?? []).length;
  const curveCount = (d.match(/\b[CSQTA]\b/g) ?? []).length;
  // Many short line segments = pixel-traced stair steps, not smooth vector.
  return lineCount > 12 && curveCount < lineCount / 4;
}

export function svgHasVisibleContent(svg: string): boolean {
  return /<(path|rect|circle|ellipse|polygon|polyline|line)\b/i.test(svg);
}

export function normalizeSvgForDisplay(svg: string): string {
  let out = svg.trim();
  if (!out) return out;

  if (!/\bxmlns=/.test(out)) {
    out = out.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/\bshape-rendering=/.test(out)) {
    out = out.replace(/<svg\b/i, '<svg shape-rendering="geometricPrecision"');
  }

  return out;
}

export function extractSvgMarkup(text: string): string | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:svg|xml)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const match = candidate.match(/<svg[\s\S]*<\/svg>/i);
  return match?.[0] ?? null;
}

/** Strip scripts and foreign objects from model output. */
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
