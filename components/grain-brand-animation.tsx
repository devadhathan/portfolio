'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const BRAND_MARK_SRC = '/brand-mark.png';

type Grain = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

type DriftGrain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  opacity: number;
};

type GrainBrandAnimationProps = {
  className?: string;
  size?: number;
  src?: string;
};

function resolveGrainColor() {
  if (typeof window === 'undefined') return 'hsl(0 0% 98%)';
  const fg = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
  return fg ? `hsl(${fg})` : 'hsl(0 0% 98%)';
}

function buildGrains(source: ImageData, width: number, height: number, targetSize: number): Grain[] {
  const grains: Grain[] = [];
  const cell = 3;
  const gridW = width;
  const gridH = height;
  const scale = (targetSize * 0.88) / Math.max(gridW, gridH);
  const offsetX = (targetSize - gridW * scale) / 2;
  const offsetY = (targetSize - gridH * scale) / 2;

  for (let y = 0; y < gridH; y += 1) {
    for (let x = 0; x < gridW; x += 1) {
      const i = (y * gridW + x) * 4;
      const lum =
        source.data[i] * 0.299 +
        source.data[i + 1] * 0.587 +
        source.data[i + 2] * 0.114;

      if (lum < 48) continue;

      const grainsInCell = lum > 180 ? 3 : 2;
      for (let g = 0; g < grainsInCell; g += 1) {
        const jitter = cell * 0.45;
        const homeX = offsetX + (x + 0.5 + (Math.random() - 0.5) * jitter) * scale;
        const homeY = offsetY + (y + 0.5 + (Math.random() - 0.5) * jitter) * scale;

        grains.push({
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          vx: 0,
          vy: 0,
          size: (0.55 + Math.random() * 0.65) * scale * 0.22,
        });
      }
    }
  }

  return grains;
}

function spawnDriftGrain(renderSize: number, targets: Array<{ x: number; y: number }>, grainScale: number): DriftGrain | null {
  if (targets.length === 0) return null;

  const edge = Math.floor(Math.random() * 4);
  const inset = renderSize * 0.02;
  let x = 0;
  let y = 0;

  if (edge === 0) {
    x = inset + Math.random() * (renderSize - inset * 2);
    y = inset;
  } else if (edge === 1) {
    x = renderSize - inset;
    y = inset + Math.random() * (renderSize - inset * 2);
  } else if (edge === 2) {
    x = inset + Math.random() * (renderSize - inset * 2);
    y = renderSize - inset;
  } else {
    x = inset;
    y = inset + Math.random() * (renderSize - inset * 2);
  }

  const target = targets[Math.floor(Math.random() * targets.length)];

  return {
    x,
    y,
    vx: 0,
    vy: 0,
    targetX: target.x,
    targetY: target.y,
    size: (0.35 + Math.random() * 0.45) * grainScale,
    opacity: 0.08 + Math.random() * 0.12,
  };
}

export function GrainBrandAnimation({
  className,
  size = 112,
  src = BRAND_MARK_SRC,
}: GrainBrandAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainsRef = useRef<Grain[]>([]);
  const driftGrainsRef = useRef<DriftGrain[]>([]);
  const targetsRef = useRef<Array<{ x: number; y: number }>>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const frameRef = useRef<number>();
  const lastSpawnRef = useRef(0);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseRef.current = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
      active: true,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderSize = Math.round(size * dpr);
    canvas.width = renderSize;
    canvas.height = renderSize;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    let cancelled = false;

    const spring = 0.092;
    const damping = 0.78;
    const repelRadius = renderSize * 0.38;
    const repelStrength = renderSize * 0.018;
    const driftSpring = 0.011;
    const driftDamping = 0.94;
    const maxDriftGrains = 18;
    const spawnIntervalMs = 420;
    const grainScale = (renderSize * 0.88) / Math.floor(renderSize / 3) * 0.22;

    const prepareGrains = () => {
      const sample = document.createElement('canvas');
      const sampleCell = 3;
      const gridW = Math.floor(renderSize / sampleCell);
      const gridH = Math.floor(renderSize / sampleCell);
      sample.width = gridW;
      sample.height = gridH;

      const sampleCtx = sample.getContext('2d');
      if (!sampleCtx) return;

      sampleCtx.fillStyle = '#000';
      sampleCtx.fillRect(0, 0, gridW, gridH);

      const fit = Math.min(gridW / img.width, gridH / img.height) * 0.92;
      const drawW = img.width * fit;
      const drawH = img.height * fit;
      sampleCtx.drawImage(img, (gridW - drawW) / 2, (gridH - drawH) / 2, drawW, drawH);

      const source = sampleCtx.getImageData(0, 0, gridW, gridH);
      grainsRef.current = buildGrains(source, gridW, gridH, renderSize);
      targetsRef.current = grainsRef.current.map((grain) => ({ x: grain.homeX, y: grain.homeY }));
      driftGrainsRef.current = [];

      for (let i = 0; i < 6; i += 1) {
        const drift = spawnDriftGrain(renderSize, targetsRef.current, grainScale);
        if (drift) driftGrainsRef.current.push(drift);
      }
    };

    const tick = (time: number) => {
      const grains = grainsRef.current;
      const driftGrains = driftGrainsRef.current;
      const targets = targetsRef.current;
      const mouse = mouseRef.current;
      const fill = resolveGrainColor();

      if (
        targets.length > 0 &&
        driftGrains.length < maxDriftGrains &&
        time - lastSpawnRef.current > spawnIntervalMs
      ) {
        const drift = spawnDriftGrain(renderSize, targets, grainScale);
        if (drift) {
          driftGrains.push(drift);
          lastSpawnRef.current = time;
        }
      }

      ctx.clearRect(0, 0, renderSize, renderSize);

      for (let i = driftGrains.length - 1; i >= 0; i -= 1) {
        const drift = driftGrains[i];
        const toTargetX = drift.targetX - drift.x;
        const toTargetY = drift.targetY - drift.y;
        const dist = Math.hypot(toTargetX, toTargetY);

        drift.vx += toTargetX * driftSpring;
        drift.vy += toTargetY * driftSpring;
        drift.vx *= driftDamping;
        drift.vy *= driftDamping;
        drift.x += drift.vx;
        drift.y += drift.vy;
        drift.opacity = Math.min(0.55, drift.opacity + 0.0035);

        ctx.fillStyle = fill;
        ctx.globalAlpha = drift.opacity;
        ctx.beginPath();
        ctx.arc(drift.x, drift.y, drift.size, 0, Math.PI * 2);
        ctx.fill();

        if (dist < drift.size * 1.6) {
          driftGrains.splice(i, 1);
        }
      }

      for (const grain of grains) {
        const toHomeX = grain.homeX - grain.x;
        const toHomeY = grain.homeY - grain.y;
        grain.vx += toHomeX * spring;
        grain.vy += toHomeY * spring;

        if (mouse.active) {
          const dx = grain.x - mouse.x;
          const dy = grain.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < repelRadius) {
            const push = (1 - dist / repelRadius) * repelStrength;
            grain.vx += (dx / dist) * push;
            grain.vy += (dy / dist) * push;
          }
        }

        grain.vx *= damping;
        grain.vy *= damping;
        grain.x += grain.vx;
        grain.y += grain.vy;

        ctx.fillStyle = fill;
        ctx.globalAlpha = 0.75 + Math.min(0.25, Math.hypot(grain.vx, grain.vy) * 0.08);
        ctx.beginPath();
        ctx.arc(grain.x, grain.y, grain.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(tick);
    };

    img.onload = () => {
      if (cancelled) return;
      prepareGrains();
      lastSpawnRef.current = performance.now();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [size, src]);

  return (
    <div
      className={cn('relative touch-none', className)}
      style={{ width: size, height: size }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair" />
    </div>
  );
}

export { GrainBrandAnimation as DitherBrandAnimation };
