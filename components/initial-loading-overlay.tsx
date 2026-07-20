'use client';

import { LOADING_VIDEO_POSTER } from '@/lib/loading-video';

type InitialLoadingOverlayProps = {
  fadingOut: boolean;
  label: string;
};

export function InitialLoadingOverlay({ fadingOut, label }: InitialLoadingOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOADING_VIDEO_POSTER}
            alt=""
            aria-hidden
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-base md:text-lg text-white font-normal font-mono animate-pulse">
          {label}
        </p>
      </div>
    </div>
  );
}
