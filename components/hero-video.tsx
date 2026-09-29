'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { HERO_INTRO_VIDEO, HERO_LOOP_VIDEO, HERO_VIDEO_POSTER } from '@/lib/hero-media';

type HeroVideoProps = {
  className?: string;
};

/**
 * Travel limits, as a % of the container. Hover drift rides on top of wherever
 * the frame was dropped, so the two stack: 12 + 6 = 18 at most. The media sits
 * at scale(1.55) — 27.5% of overhang per side — so that still has margin
 * before an edge could come into view.
 */
const DRAG_RANGE = 12;
const HOVER_RANGE = 6;

export function HeroVideo({ className }: HeroVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const showLoopRef = useRef(false);
  const visibleRef = useRef(true);
  const panEnabledRef = useRef(false);
  const rafRef = useRef(0);
  /** Where a drag left the frame — hover drifts around this, not around centre. */
  const homeRef = useRef({ x: 0, y: 0 });
  /** Last position actually applied, so a drag starts from what you can see. */
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  const [showLoop, setShowLoop] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [loopReady, setLoopReady] = useState(false);

  const muteVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }, []);

  useEffect(() => {
    showLoopRef.current = showLoop;
  }, [showLoop]);

  useEffect(() => {
    setShowLoop(false);
    setIntroReady(false);
    setLoopReady(false);

    const intro = introRef.current;
    muteVideo(intro);
    // Load intro first; defer the loop clip until intro is ready/playing.
    intro?.load();
  }, [muteVideo]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pauseAll = () => {
      introRef.current?.pause();
      loopRef.current?.pause();
    };

    const resumeActive = () => {
      const active = showLoopRef.current ? loopRef.current : introRef.current;
      muteVideo(active);
      void active?.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const on = Boolean(entry?.isIntersecting);
        visibleRef.current = on;
        if (on) resumeActive();
        else pauseAll();
      },
      { threshold: 0.15 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.hidden) pauseAll();
      else if (visibleRef.current) resumeActive();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      pauseAll();
    };
  }, [muteVideo]);

  useEffect(() => {
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncEnabled = () => {
      panEnabledRef.current = fineHover.matches && !reduceMotion.matches;
      if (!panEnabledRef.current) {
        dragRef.current = null;
        homeRef.current = { x: 0, y: 0 };
        panOffsetRef.current = { x: 0, y: 0 };
        const pan = panRef.current;
        if (pan) {
          pan.style.transition = 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)';
          pan.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    };
    syncEnabled();
    fineHover.addEventListener('change', syncEnabled);
    reduceMotion.addEventListener('change', syncEnabled);
    return () => {
      fineHover.removeEventListener('change', syncEnabled);
      reduceMotion.removeEventListener('change', syncEnabled);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const setPan = useCallback(
    (xPct: number, yPct: number, mode: 'drag' | 'hover' | 'settle') => {
      const pan = panRef.current;
      if (!pan) return;
      panOffsetRef.current = { x: xPct, y: yPct };
      // A drag is direct manipulation — any easing there reads as lag. Hover
      // gets a little smoothing, and returning home gets a proper glide.
      pan.style.transition =
        mode === 'drag'
          ? 'none'
          : mode === 'hover'
            ? 'transform 140ms ease-out'
            : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)';
      pan.style.transform = `translate3d(${xPct}%, ${yPct}%, 0)`;
    },
    [],
  );

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!panEnabledRef.current || event.pointerType !== 'mouse' || event.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    // Pre-empts the browser's own image/selection drag.
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      // From what's on screen, drift included, so the grab doesn't jump.
      baseX: panOffsetRef.current.x,
      baseY: panOffsetRef.current.y,
    };
    // Capture so the frame keeps tracking when the hand leaves the card.
    root.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const drag = dragRef.current;
      let x: number;
      let y: number;

      if (drag && event.pointerId === drag.pointerId) {
        const clamp = (value: number) => Math.min(DRAG_RANGE, Math.max(-DRAG_RANGE, value));
        x = clamp(drag.baseX + ((event.clientX - drag.startX) / rect.width) * 100);
        y = clamp(drag.baseY + ((event.clientY - drag.startY) / rect.height) * 100);
      } else {
        if (!panEnabledRef.current || event.pointerType !== 'mouse') return;
        const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        // Opposite of the cursor so the frame slides toward what you point at,
        // and around wherever a drag left it rather than around centre.
        x = homeRef.current.x - nx * HOVER_RANGE;
        y = homeRef.current.y - ny * HOVER_RANGE;
      }

      const mode = drag ? 'drag' : 'hover';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setPan(x, y, mode));
    },
    [setPan],
  );

  /** Release drops the frame: where it lands becomes what hover drifts around. */
  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    homeRef.current = { ...panOffsetRef.current };
    try {
      rootRef.current?.releasePointerCapture(drag.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (dragRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPan(homeRef.current.x, homeRef.current.y, 'settle');
  }, [setPan]);

  const handleIntroReady = () => {
    muteVideo(introRef.current);
    setIntroReady(true);
    if (visibleRef.current) void introRef.current?.play().catch(() => undefined);

    const loop = loopRef.current;
    if (loop && loop.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      muteVideo(loop);
      loop.load();
    }
  };

  const handleLoopReady = () => {
    muteVideo(loopRef.current);
    setLoopReady(true);
  };

  const activeReady = showLoop ? loopReady : introReady;

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden rounded-[inherit] bg-[#1D1807] ${className ?? ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={panRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        {/* Poster only until the active clip can play — never stacked under a playing video */}
        {!activeReady && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={HERO_VIDEO_POSTER}
            alt=""
            aria-hidden
            fetchPriority="high"
            decoding="sync"
            draggable={false}
            className="absolute inset-0 z-[2] h-full w-full object-cover object-bottom"
          />
        )}

        <video
          ref={introRef}
          src={HERO_INTRO_VIDEO}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER}
          aria-label="Hero animation"
          className={`absolute inset-0 z-[1] h-full w-full object-cover object-bottom transition-opacity duration-500 ${
            showLoop ? 'pointer-events-none opacity-0' : introReady ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={handleIntroReady}
          onCanPlay={handleIntroReady}
          onPlay={(e) => muteVideo(e.currentTarget)}
          onVolumeChange={(e) => muteVideo(e.currentTarget)}
          onEnded={() => {
            setShowLoop(true);
            muteVideo(loopRef.current);
            if (visibleRef.current) void loopRef.current?.play().catch(() => undefined);
          }}
        />

        <video
          ref={loopRef}
          src={HERO_LOOP_VIDEO}
          loop
          muted
          playsInline
          preload="none"
          aria-hidden={!showLoop}
          className={`absolute inset-0 z-[1] h-full w-full object-cover object-bottom transition-opacity duration-500 ${
            showLoop && loopReady ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onLoadedData={handleLoopReady}
          onCanPlay={handleLoopReady}
          onPlay={(e) => muteVideo(e.currentTarget)}
          onVolumeChange={(e) => muteVideo(e.currentTarget)}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[#1D1802]/[20%]"
      />
    </div>
  );
}
