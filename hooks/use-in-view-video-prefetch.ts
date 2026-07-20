'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const DEW_VIDEO_SRC = '/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k_compressed.mp4';
export const DEW_VIDEO_POSTER = '/videos/dew-poster.jpg';

/** Prefetch video when the container enters (or nears) the viewport. */
export function useInViewVideoPrefetch(containerRef: React.RefObject<HTMLElement | null>, src: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (!el) return;

    const handleCanPlay = () => {
      setIsReady(true);
      setIsLoading(false);
    };

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleCanPlay();
      return;
    }

    el.addEventListener('canplay', handleCanPlay, { once: true });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || prefetchedRef.current) return;

        const video = videoRef.current;
        if (!video || video.src) return;

        prefetchedRef.current = true;
        setIsLoading(true);
        video.src = src;
        video.load();
      },
      { rootMargin: '320px', threshold: 0.01 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, src]);

  return { setVideoRef, isLoading, isReady };
}
