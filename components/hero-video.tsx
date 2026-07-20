'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_INTRO_VIDEO, HERO_LOOP_VIDEO, HERO_VIDEO_POSTER } from '@/lib/hero-media';

type HeroVideoProps = {
  className?: string;
};

export function HeroVideo({ className }: HeroVideoProps) {
  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
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
    setShowLoop(false);
    setIntroReady(false);
    setLoopReady(false);

    const intro = introRef.current;
    const loop = loopRef.current;
    muteVideo(intro);
    muteVideo(loop);
    intro?.load();
    loop?.load();
  }, [muteVideo]);

  const handleIntroReady = () => {
    muteVideo(introRef.current);
    setIntroReady(true);
    void introRef.current?.play().catch(() => undefined);
  };

  const handleLoopReady = () => {
    muteVideo(loopRef.current);
    setLoopReady(true);
  };

  const activeReady = showLoop ? loopReady : introReady;

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#1E1205] ${className ?? ''}`}
      style={{ backgroundImage: `url(${HERO_VIDEO_POSTER})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Poster stays visible until the active clip can play — no fade-in delay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_VIDEO_POSTER}
        alt=""
        aria-hidden
        fetchPriority="high"
        decoding="sync"
        className={`absolute inset-0 z-[2] h-full w-full object-cover ${
          activeReady ? 'pointer-events-none opacity-0 transition-opacity duration-300' : 'opacity-100'
        }`}
      />

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
          showLoop ? 'pointer-events-none opacity-0' : introReady ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'
        }`}
        onLoadedData={handleIntroReady}
        onCanPlay={handleIntroReady}
        onPlay={(e) => muteVideo(e.currentTarget)}
        onVolumeChange={(e) => muteVideo(e.currentTarget)}
        onEnded={() => {
          setShowLoop(true);
          muteVideo(loopRef.current);
          void loopRef.current?.play().catch(() => undefined);
        }}
      />

      <video
        ref={loopRef}
        src={HERO_LOOP_VIDEO}
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden={!showLoop}
        className={`absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-500 ${
          showLoop && loopReady ? 'opacity-80 group-hover:opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onLoadedData={handleLoopReady}
        onCanPlay={handleLoopReady}
        onPlay={(e) => muteVideo(e.currentTarget)}
        onVolumeChange={(e) => muteVideo(e.currentTarget)}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[#1E1205]/[20%]"
      />
    </div>
  );
}
