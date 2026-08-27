'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_INTRO_VIDEO, HERO_LOOP_VIDEO, HERO_VIDEO_POSTER } from '@/lib/hero-media';

type HeroVideoProps = {
  className?: string;
};

export function HeroVideo({ className }: HeroVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const showLoopRef = useRef(false);
  const visibleRef = useRef(true);
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
      className={`relative h-full w-full overflow-hidden bg-[#1D1807] ${className ?? ''}`}
    >
      {/* Poster only until the active clip can play — never stacked under a playing video */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!activeReady && (
        <img
          src={HERO_VIDEO_POSTER}
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 z-[2] h-full w-full object-cover"
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
        className={`absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-500 ${
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
        className={`absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-500 ${
          showLoop && loopReady ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onLoadedData={handleLoopReady}
        onCanPlay={handleLoopReady}
        onPlay={(e) => muteVideo(e.currentTarget)}
        onVolumeChange={(e) => muteVideo(e.currentTarget)}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[#1D1802]/[40%]"
      />
    </div>
  );
}
