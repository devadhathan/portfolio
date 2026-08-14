'use client';

type InitialLoadingOverlayProps = {
  fadingOut: boolean;
  label?: string;
};

/** @deprecated Prefer BrandBootSplash — kept for any leftover imports. */
export function InitialLoadingOverlay({ fadingOut, label = 'Loading' }: InitialLoadingOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black transition-opacity duration-700 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
      aria-busy={!fadingOut}
      aria-label={label}
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
      <div className="brand-boot-line" role="progressbar" aria-label={label}>
        <span className="brand-boot-line__fill" />
      </div>
    </div>
  );
}
