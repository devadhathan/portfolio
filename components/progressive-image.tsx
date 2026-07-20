'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_CARD_PLACEHOLDER } from '@/lib/default-media';

type ProgressiveImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  /** Pass `null` to skip the brand placeholder while loading. */
  placeholderSrc?: string | null;
  loading?: 'eager' | 'lazy';
  onImageError?: React.ReactEventHandler<HTMLImageElement>;
};

export const ProgressiveImage = forwardRef<HTMLImageElement, ProgressiveImageProps>(
  function ProgressiveImage(
    {
      src,
      alt,
      className,
      placeholderSrc = DEFAULT_CARD_PLACEHOLDER,
      loading = 'lazy',
      onImageError,
      style,
    },
    ref,
  ) {
    const showPlaceholder = placeholderSrc != null && src !== placeholderSrc;
    const [loaded, setLoaded] = useState(!showPlaceholder);

    return (
      <div className="relative h-full w-full">
        {showPlaceholder && !loaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden
            className={cn('absolute inset-0 h-full w-full object-cover opacity-90', className)}
            style={style}
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          style={style}
          onLoad={() => setLoaded(true)}
          onError={onImageError}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            showPlaceholder && !loaded ? 'opacity-0' : 'opacity-100',
            className,
          )}
        />
      </div>
    );
  },
);
