'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useOrbHatEmoji } from '@/lib/orb-hat';
import { cn } from '@/lib/utils';

type AgentOrbProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  hoverScale?: boolean;
  creating?: boolean;
  onClick?: () => void;
  /** When set, pupils lock to this offset instead of random gaze. */
  lookAt?: { x: number; y: number } | null;
  /**
   * Optional hat emoji sits on top of the head (eyes stay).
   * Omit to use the persisted hat; pass `null` to force no hat.
   */
  hatEmoji?: string | null;
};

const SIZE = { xs: 28, sm: 40, md: 56, lg: 72, xl: 96, '2xl': 128 } as const;

export function AgentOrb({
  size = 'md',
  className,
  hoverScale = false,
  creating = false,
  onClick,
  lookAt = null,
  hatEmoji,
}: AgentOrbProps) {
  const orbRef = useRef<HTMLButtonElement>(null);
  const filterId = useId().replace(/:/g, '');
  const [orbPupil, setOrbPupil] = useState({ x: 0, y: 0 });
  const [orbBlink, setOrbBlink] = useState(false);
  const [storedHat] = useOrbHatEmoji();
  const px = SIZE[size];
  const resolvedHat = hatEmoji === undefined ? storedHat : hatEmoji;
  const showHat = Boolean(resolvedHat?.trim());
  const hatSize =
    size === 'xs' ? 14 : size === 'sm' ? 18 : size === 'md' ? 24 : size === 'lg' ? 30 : size === 'xl' ? 38 : 46;

  useEffect(() => {
    if (lookAt != null) return;

    let timer: ReturnType<typeof setTimeout>;
    const max = 3;
    const scheduleGaze = () => {
      timer = setTimeout(() => {
        if (Math.random() < 0.25) {
          setOrbPupil({ x: 0, y: 0 });
        } else {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.5 + Math.random() * 0.5;
          setOrbPupil({ x: Math.cos(angle) * max * dist, y: Math.sin(angle) * max * dist });
        }
        scheduleGaze();
      }, 900 + Math.random() * 1600);
    };
    scheduleGaze();
    return () => clearTimeout(timer);
  }, [lookAt]);

  const pupil = lookAt ?? orbPupil;

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        setOrbBlink(true);
        openTimer = setTimeout(() => setOrbBlink(false), 130);
        scheduleBlink();
      }, 2500 + Math.random() * 3500);
    };
    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const orbBody = (
    <>
      <div
        className="absolute inset-0 rounded-full transition-[background] duration-500 ease-out"
        style={{ background: 'var(--orb-surface)' }}
      />
      <div
        className="absolute rounded-full agent-orb-blob-1 transition-[background] duration-500 ease-out"
        style={{
          width: '72%',
          height: '72%',
          top: '2%',
          left: '2%',
          opacity: 0.55,
          background: 'var(--orb-blob-1)',
        }}
      />
      <div
        className="absolute rounded-full agent-orb-blob-2 transition-[background] duration-500 ease-out"
        style={{
          width: '68%',
          height: '68%',
          bottom: '-6%',
          right: '-6%',
          opacity: 0.72,
          background: 'var(--orb-blob-2)',
        }}
      />
      <div
        className="absolute rounded-full agent-orb-blob-3 transition-[background] duration-500 ease-out"
        style={{
          width: '58%',
          height: '58%',
          bottom: '14%',
          left: '6%',
          opacity: 0.38,
          background: 'var(--orb-blob-3)',
        }}
      />
      <div
        className="absolute mix-blend-overlay agent-orb-noise transition-[background] duration-500 ease-out"
        style={{
          inset: '-10%',
          opacity: 0.3,
          filter: `url(#${filterId})`,
          background: 'var(--orb-noise)',
        }}
      />
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="agent-orb-wave-1 absolute left-0 right-0 top-[30%] h-[18%] transition-[background] duration-500 ease-out"
          style={{ background: 'var(--orb-wave-1)' }}
        />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="agent-orb-wave-2 absolute left-0 right-0 top-[52%] h-[12%] transition-[background] duration-500 ease-out"
          style={{ background: 'var(--orb-wave-2)' }}
        />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="agent-orb-wave-3 absolute left-0 right-0 top-[68%] h-[10%] transition-[background] duration-500 ease-out"
          style={{ background: 'var(--orb-wave-3)' }}
        />
      </div>
      <div
        className="absolute inset-0 rounded-full transition-[background] duration-500 ease-out"
        style={{ background: 'var(--orb-shine)' }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          gap: '5px',
          transform: `translate(${pupil.x}px, ${pupil.y}px) translateY(-4%)`,
          transition: lookAt != null ? 'transform 40ms linear' : 'transform 260ms ease-out',
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: '22%',
              height: '30%',
              borderRadius: '50%',
              background: 'var(--orb-pupil)',
              transform: `scaleY(${orbBlink ? 0.12 : 1})`,
              transition: 'transform 90ms ease, background 500ms ease',
            }}
          />
        ))}
      </div>
    </>
  );

  const orbShell = (
    <div
      className="relative flex-shrink-0 overflow-visible"
      style={{ width: px, height: px }}
    >
      {showHat ? (
        <div
          className="pointer-events-none absolute left-1/2 z-10 select-none"
          aria-hidden
          style={{
            top: `-${Math.round(hatSize * 0.55)}px`,
            fontSize: hatSize,
            lineHeight: 1,
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))',
          }}
        >
          {resolvedHat}
        </div>
      ) : null}
      <div className="relative h-full w-full overflow-hidden rounded-full">{orbBody}</div>
    </div>
  );

  const wrapClass = cn(
    'flex items-center justify-center overflow-visible transition-transform duration-300 ease-out',
    hoverScale && 'group-hover:scale-110',
    className,
  );

  const noiseFilter = (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  );

  if (onClick) {
    return (
      <>
        {noiseFilter}
        <button
          ref={orbRef}
          type="button"
          onClick={onClick}
          className={cn(wrapClass, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full')}
          aria-label="Open Gen UI"
        >
          {orbShell}
        </button>
      </>
    );
  }

  return (
    <>
      {noiseFilter}
      <div
        className={cn(wrapClass, creating && 'agent-orb-creating')}
        aria-hidden
        style={{ padding: creating ? 8 : 0 }}
      >
        {orbShell}
      </div>
    </>
  );
}
