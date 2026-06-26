'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AgentOrbProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  creating?: boolean;
};

const SIZE = { xs: 28, sm: 40, md: 56, lg: 72 } as const;

export function AgentOrb({ size = 'md', className, interactive = false, creating = false }: AgentOrbProps) {
  const orbRef = useRef<HTMLButtonElement>(null);
  const [orbPupil, setOrbPupil] = useState({ x: 0, y: 0 });
  const [orbBlink, setOrbBlink] = useState(false);
  const [orbGrown, setOrbGrown] = useState(false);
  const px = SIZE[size];

  useEffect(() => {
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
  }, []);

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

  useEffect(() => {
    if (!interactive || !orbGrown) return;
    const handleDown = (e: MouseEvent) => {
      if (orbRef.current && !orbRef.current.contains(e.target as Node)) {
        setOrbGrown(false);
      }
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [interactive, orbGrown]);

  const orbBody = (
    <>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 38% 36%, #9a9a9a 0%, #454545 40%, #101010 72%, #000000 100%)' }} />
      <div className="absolute rounded-full agent-orb-blob-1" style={{ width: '72%', height: '72%', top: '2%', left: '2%', opacity: 0.55, background: 'radial-gradient(circle, #ffffff 0%, transparent 68%)' }} />
      <div className="absolute rounded-full agent-orb-blob-2" style={{ width: '68%', height: '68%', bottom: '-6%', right: '-6%', opacity: 0.72, background: 'radial-gradient(circle, #000000 0%, transparent 68%)' }} />
      <div className="absolute rounded-full agent-orb-blob-3" style={{ width: '58%', height: '58%', bottom: '14%', left: '6%', opacity: 0.38, background: 'radial-gradient(circle, #888888 0%, transparent 68%)' }} />
      <div className="absolute inset-0 mix-blend-overlay opacity-30 agent-orb-noise rounded-full" style={{ background: 'white' }} />
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 28% 26%, rgba(255,255,255,0.65) 0%, transparent 48%)' }} />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          gap: '5px',
          transform: `translate(${orbPupil.x}px, ${orbPupil.y}px) translateY(-4%)`,
          transition: 'transform 260ms ease-out',
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: '22%',
              height: '30%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #f3f3f3 70%, #dcdcdc 100%)',
              transform: `scaleY(${orbBlink ? 0.12 : 1})`,
              transition: 'transform 90ms ease',
            }}
          />
        ))}
      </div>
    </>
  );

  const orbShell = (
    <div
      className="relative rounded-full overflow-hidden flex-shrink-0"
      style={{ width: px, height: px }}
    >
      {orbBody}
    </div>
  );

  const wrapClass = cn(
    'flex items-center justify-center overflow-visible',
    className,
  );

  if (interactive) {
    return (
      <button
        ref={orbRef}
        type="button"
        onClick={() => setOrbGrown((g) => !g)}
        className={cn(wrapClass, 'focus:outline-none')}
        style={{
          transform: `scale(${orbGrown ? 1.15 : 1})`,
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-label="Agent orb"
      >
        {orbShell}
      </button>
    );
  }

  return (
    <motion.div
      className={wrapClass}
      aria-hidden
      animate={creating ? { scale: [0.86, 1.14, 0.86] } : { scale: 1 }}
      transition={
        creating
          ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
      style={{ transformOrigin: 'center center', padding: creating ? 8 : 0 }}
    >
      {orbShell}
    </motion.div>
  );
}
