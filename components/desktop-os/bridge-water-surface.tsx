'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import {
  isDockInteractionBusy,
  subscribeDockInteractionBusy,
} from '@/lib/dock-interaction';
import { DESKTOP_WINDOW_IDS } from '@/lib/desktop-os';

type WaveParticle = {
  /** 0 = horizon (far), 1 = near shore */
  depth: number;
  /** 0–1 across the width at that depth */
  u: number;
  phase: number;
  drift: number;
  sparkle: number;
  /** Random length multiplier per particle line */
  length: number;
};

/**
 * Bottom-left tree cutout — tweak these if waves still clash / feel too empty.
 * - width: how far right the fade reaches (0–1 of screen)
 * - startY: only affect water below this (0–1 of screen)
 * - strength: 0 = no cut, 1 = fully clear trees
 */
const TREE_MASK = {
  width: 0.22,
  startY: 0.62,
  strength: 0.55,
};

function seedParticles(count: number): WaveParticle[] {
  // Stratified grid, with extra weight in the lower (near) water band —
  // but lightly avoid parking waves on the bottom-left tree silhouettes.
  const cols = Math.max(6, Math.round(Math.sqrt(count * 1.8)));
  const rows = Math.max(4, Math.ceil(count / cols));
  const out: WaveParticle[] = [];
  let n = 0;
  for (let row = 0; row < rows && n < count; row += 1) {
    for (let col = 0; col < cols && n < count; col += 1) {
      const rowT = (row + 0.2 + Math.random() * 0.6) / rows;
      // Pack more particles toward the bottom (screenT → 1).
      const screenT = Math.pow(rowT, 0.48);
      const depth = Math.min(1, screenT);
      let u = (col + 0.15 + Math.random() * 0.7) / cols;
      // Soft nudge only in the far-left near shore (trees).
      if (depth > 0.55 && u < TREE_MASK.width * 0.85) {
        u = u + (TREE_MASK.width - u) * 0.35;
      }
      out.push({
        depth,
        u,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.072,
        sparkle: 0.4 + Math.random() * 0.6,
        // Slightly longer near shore so the bottom reads denser.
        length: 0.4 + Math.random() * (0.9 + depth * 0.7),
      });
      n += 1;
    }
  }
  return out;
}

function depthToY(depth: number, top: number, bottom: number): number {
  // Almost linear in screen space so foreground depth actually reaches the bottom.
  const persp = Math.pow(depth, 0.92);
  return top + (bottom - top) * persp;
}

function depthScale(depth: number): number {
  return 0.22 + Math.pow(depth, 1.05) * 0.95;
}

/**
 * Soft cutout for the foreground trees (bottom-left of the Bridge wallpaper).
 * Returns 0–1 alpha multiplier.
 */
function treeClearance(nx: number, ny: number): number {
  if (nx >= TREE_MASK.width || ny <= TREE_MASK.startY) return 1;
  const left = 1 - nx / TREE_MASK.width;
  const low = (ny - TREE_MASK.startY) / (1 - TREE_MASK.startY);
  const cover = Math.min(1, left * low);
  // Keep some wave presence even in the tree zone (strength < 1).
  return 1 - cover * TREE_MASK.strength;
}

/**
 * Bridge wallpaper — dotted particle lines on the water (perspective).
 * Same look (small dots forming straight lines, random lengths, drift),
 * drawn cheaply via dashed strokes; pauses when the desktop is covered
 * or while the dock magnification wave is active (Chrome frame budget).
 */
export function BridgeWaterSurface() {
  const { wallpaperId, windows } = useDesktopOs();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<WaveParticle[]>([]);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const lastRef = useRef(0);
  const desktopHiddenRef = useRef(false);
  const dockBusyRef = useRef(isDockInteractionBusy());
  const scheduleRef = useRef<(() => void) | null>(null);

  const desktopCovered = useMemo(
    () => DESKTOP_WINDOW_IDS.some((id) => windows[id]?.open && windows[id]?.covered),
    [windows],
  );

  useEffect(() => {
    desktopHiddenRef.current = desktopCovered;
    if (!desktopCovered && !dockBusyRef.current) scheduleRef.current?.();
  }, [desktopCovered]);

  useEffect(() => {
    return subscribeDockInteractionBusy((busy) => {
      dockBusyRef.current = busy;
      if (busy) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        return;
      }
      scheduleRef.current?.();
    });
  }, []);

  useEffect(() => {
    if (wallpaperId !== 'bridge' || reduceMotion) return;

    const canvasEl = canvasRef.current;
    const root = rootRef.current;
    if (!canvasEl || !root) return;

    const ctx2d = canvasEl.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx2d) return;
    const canvas = canvasEl;
    const ctx = ctx2d;

    runningRef.current = true;
    lastRef.current = performance.now();

    const resize = () => {
      const rect = root.getBoundingClientRect();
      // Cap DPR — Retina 3x is wasted for soft water sparks.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = rect.width * rect.height;
      // Same visual density, fewer stroke batches (each stroke = one dotted line).
      const count = Math.round(Math.min(240, Math.max(130, area / 9500)));
      particlesRef.current = seedParticles(count);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    const strokeColor = 'rgb(215, 220, 225)';

    const schedule = () => {
      if (!runningRef.current || rafRef.current) return;
      if (document.hidden || desktopHiddenRef.current || dockBusyRef.current) return;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(draw);
    };
    scheduleRef.current = schedule;

    function draw(now: number) {
      rafRef.current = 0;
      if (!runningRef.current) return;
      if (document.hidden || desktopHiddenRef.current || dockBusyRef.current) return;

      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const waterTop = h * 0.36;
      const waterBottom = h * 0.92;

      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const p of particlesRef.current) {
        p.u = (p.u + p.drift * dt * 0.75 + 1) % 1;
        p.phase += dt * (0.5 + p.sparkle * 0.7);

        const y = depthToY(p.depth, waterTop, waterBottom);
        const edge = 0.03 + (1 - p.depth) * 0.04;
        const x = w * (edge + p.u * (1 - edge * 2));
        const s = depthScale(p.depth);
        const bob = Math.sin(p.phase) * s * 0.75;
        const shimmer =
          0.12 +
          p.sparkle * 0.24 * (0.45 + 0.55 * Math.sin(p.phase * 1.2 + p.u * 9));
        const pulse = 0.65 + 0.35 * Math.sin(p.phase * 1.1 + p.u * 4);

        // Cap stroke length so mid-band waves don’t fuse into thick bars.
        const len = Math.min(w * 0.22, (5 + s * 22) * p.length);
        const dotR = Math.max(0.45, s * 0.9);
        const gap = Math.max(dotR * 2.8, 2.6);
        const yPos = y + bob;

        // Soft fade over bottom-left trees — tweak TREE_MASK at top of file.
        // Do NOT raise this threshold high (e.g. 0.98) or almost all waves vanish.
        const clear = treeClearance(x / w, yPos / h);

        ctx.globalAlpha = Math.min(0.85, shimmer * pulse * clear);
        ctx.lineWidth = dotR * 2;
        // Round caps + zero-length dash slots → a row of dots.
        ctx.setLineDash([0.01, gap]);
        ctx.beginPath();
        ctx.moveTo(x - len * 0.5, yPos);
        ctx.lineTo(x + len * 0.5, yPos);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      if (
        runningRef.current &&
        !document.hidden &&
        !desktopHiddenRef.current &&
        !dockBusyRef.current
      ) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    schedule();

    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      runningRef.current = false;
      scheduleRef.current = null;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [wallpaperId, reduceMotion]);

  if (wallpaperId !== 'bridge' || reduceMotion) return null;

  return (
    <div ref={rootRef} className="os-bridge-water" aria-hidden>
      <canvas ref={canvasRef} className="os-bridge-water__canvas" />
    </div>
  );
}
