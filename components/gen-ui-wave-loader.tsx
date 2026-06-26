'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type GenUIWaveLoaderProps = {
  className?: string;
  label?: string;
};

const GAP = 14;
const RADIUS = 1.3;
const CYCLE = 3.2;
const RING_WIDTH = 0.18;

function getDotRgb() {
  if (typeof document === 'undefined') return '255, 255, 255';
  return document.documentElement.classList.contains('dark') ? '255, 255, 255' : '0, 0, 0';
}

function ringBrightness(dist: number, wavePos: number): number {
  const target = 1 - wavePos;
  const delta = Math.abs(dist - target);
  if (delta > RING_WIDTH) return 0;
  const core = 1 - delta / RING_WIDTH;
  return core * core;
}

export function GenUIWaveLoader({ className, label = 'Building…' }: GenUIWaveLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let time = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!running) return;

      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.hypot(cx, cy);
      const rgb = getDotRgb();
      const wavePos = (time % CYCLE) / CYCLE;

      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / GAP) + 1;
      const rows = Math.ceil(h / GAP) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * GAP + GAP * 0.5;
          const y = row * GAP + GAP * 0.5;
          const dist = Math.hypot(x - cx, y - cy) / maxDist;

          const bright = ringBrightness(dist, wavePos);
          if (bright < 0.04) continue;

          const opacity = bright * (0.35 + (1 - dist) * 0.25) + 0.03;

          ctx.beginPath();
          ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
          ctx.fill();
        }
      }

      time += 0.016;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden animate-fade-in-blur',
        className ?? 'min-h-[calc(100vh-8rem)]',
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden />
      <p className="relative z-10 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70 select-none">
        {label}
      </p>
    </div>
  );
}
