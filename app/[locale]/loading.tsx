'use client';

import { useEffect, useState } from 'react';

/** Route-level loading — logo + progress line that advances while the segment loads. */
export default function LoadingPage() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 160);
    return () => window.clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const started = performance.now();
    let raf = 0;
    let lastReported = 12;

    const tick = (now: number) => {
      const t = (now - started) / 1000;
      // Ease toward ~90% while the route is still loading; real page replace unmounts this.
      const next = Math.min(90, 12 + (1 - Math.exp(-t * 1.1)) * 78);
      const rounded = Math.round(next);
      // Only re-render when the visible % changes.
      if (rounded !== lastReported) {
        lastReported = rounded;
        setProgress(rounded);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[900] flex flex-col items-center justify-center gap-5 bg-black animate-in fade-in duration-300"
      aria-busy="true"
      aria-label="Loading"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photos/Image@4x.png"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        draggable={false}
      />
      <div
        className="brand-boot-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Loading"
      >
        <span className="brand-boot-line__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
