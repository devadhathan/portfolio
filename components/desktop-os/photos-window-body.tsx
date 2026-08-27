'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

/** Personal / lifestyle photos for the Photos OS window. */
export const PHOTOS_WINDOW_ITEMS = [
  { src: '/photos/sakura-park.jpg', alt: 'Sakura park' },
  { src: '/photos/edinburgh-street.jpg', alt: 'Edinburgh street' },
  { src: '/photos/daffodils-squirrel.jpg', alt: 'Daffodils and squirrel' },
  { src: '/photos/Cafe-laptop.png', alt: 'Cafe laptop' },
  { src: '/photos/optimized/O6bInc2LhAgXBkQ6yLobk41OLss.jpg', alt: 'Photo' },
  { src: '/photos/optimized/ZZXFdA0RZyD5h20wZdhoCxLhy0.jpg', alt: 'Photo' },
  { src: '/photos/optimized/edinburgh-street.jpg', alt: 'Edinburgh street' },
  { src: '/photos/optimized/daffodils-squirrel.jpg', alt: 'Daffodils' },
  { src: '/photos/optimized/Cafe-laptop.jpg', alt: 'Cafe' },
] as const;

export function PhotosWindowBody() {
  const [active, setActive] = useState<(typeof PHOTOS_WINDOW_ITEMS)[number] | null>(null);

  return (
    <div
      className="os-window-content relative flex h-full min-h-[420px] flex-col"
      data-os-embedded="true"
    >
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 md:grid-cols-4">
        {PHOTOS_WINDOW_ITEMS.map((photo) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActive(photo)}
            className={cn(
              'group relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary/40',
              focusRing,
            )}
            aria-label={`Open ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="os-photos-lightbox absolute inset-0 z-20 flex items-center justify-center p-4"
          role="dialog"
          aria-modal
          aria-label={active.alt}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Close photo"
            className={cn(
              'os-photos-lightbox__close absolute right-3 top-3 rounded-full p-2 text-foreground',
              focusRing,
            )}
            onClick={() => setActive(null)}
          >
            <X className="h-4 w-4" />
          </button>
          <div
            className="relative h-[min(80vh,720px)] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="(max-width: 768px) 100vw, 48rem"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
