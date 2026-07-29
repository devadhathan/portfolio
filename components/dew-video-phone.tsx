'use client';

import { useRef } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import {
  DEW_VIDEO_POSTER,
  DEW_VIDEO_SRC,
  useInViewVideoPrefetch,
} from '@/hooks/use-in-view-video-prefetch';

export { DEW_VIDEO_SRC, DEW_VIDEO_POSTER };

export function resolveDewVideoSrc(content?: string): string {
  if (!content || content.includes('2tUv4Phgglg0Cvb9dLfZYDnN1k')) {
    return DEW_VIDEO_SRC;
  }
  return content;
}

type DewVideoPhoneProps = {
  title: string;
  linkLabel: string;
  linkHref: string;
  videoSrc?: string;
  onVideoRef?: (el: HTMLVideoElement | null) => void;
};

export function DewVideoPhone({
  title,
  linkLabel,
  linkHref,
  videoSrc = DEW_VIDEO_SRC,
  onVideoRef,
}: DewVideoPhoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVideoRef: assignVideoRef, isLoading, isReady } = useInViewVideoPrefetch(containerRef, videoSrc);

  const setVideoRef = (el: HTMLVideoElement | null) => {
    assignVideoRef(el);
    onVideoRef?.(el);
  };

  return (
    <div
      ref={containerRef}
      data-cuelume-hover="whisper"
      className="relative z-10 flex h-full w-full items-center justify-center p-4"
    >
      <div className="relative aspect-[9/19.5] w-full max-w-[250px] rounded-[2.25rem] bg-black p-2 shadow-2xl">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.85rem] bg-black">
          {!isReady && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={DEW_VIDEO_POSTER}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {isLoading && !isReady ? (
            <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white/70" aria-label="Loading video" />
            </div>
          ) : null}

          <video
            ref={setVideoRef}
            className={`h-full w-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            poster={DEW_VIDEO_POSTER}
            loop
            muted
            playsInline
            preload="none"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <h3 className="mb-2 text-[13px] font-semibold text-white">{title}</h3>
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cuelume-hover="tick"
              data-cuelume-press
              data-cuelume-release
              className="group/link inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{linkLabel}</span>
              <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
