/** Desktop: stacked backdrop blur. Mobile: soft tint fade only (cheaper). */
export function ProgressiveBlurTop({
  className,
  heightClassName = 'h-20',
}: {
  className?: string;
  heightClassName?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -top-px z-0 overflow-hidden ${heightClassName} ${className ?? ''}`}
    >
      {/* Soft fade on mobile — no backdrop-filter */}
      <div className="progressive-blur-tint progressive-blur-tint--mobile lg:hidden" />

      {/* Progressive blur only from lg up — masks stay opaque at the top edge (no gap). */}
      <div
        className="progressive-blur-layer hidden lg:block"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 20%, transparent 55%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 20%, transparent 55%)',
        }}
      />
      <div
        className="progressive-blur-layer hidden lg:block"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 75%)',
        }}
      />
      <div
        className="progressive-blur-layer hidden lg:block"
        style={{
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
        }}
      />
      <div className="progressive-blur-tint hidden lg:block" />
    </div>
  );
}
