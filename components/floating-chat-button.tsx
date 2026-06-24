'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isCollapsed: boolean;
  mode?: 'ask' | 'agent';
  onModeChange?: (mode: 'ask' | 'agent') => void;
}

export function FloatingChatButton({ onClick, isCollapsed }: FloatingChatButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // White ovals glance around in random directions.
  const orbRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const max = 3; // px the ovals can travel from center
    const scheduleGaze = () => {
      timer = setTimeout(() => {
        // Occasionally re-center, otherwise dart to a random direction.
        if (Math.random() < 0.25) {
          setPupil({ x: 0, y: 0 });
        } else {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.5 + Math.random() * 0.5;
          setPupil({ x: Math.cos(angle) * max * dist, y: Math.sin(angle) * max * dist });
        }
        scheduleGaze();
      }, 900 + Math.random() * 1600);
    };
    scheduleGaze();
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 900);
  };

  if (!isCollapsed) return null;

  const orbAnim = (name: string, duration: string, delay = '0s'): CSSProperties => ({
    animation: `${name} ${duration} ease-in-out infinite`,
    animationDelay: delay,
  });

  return (
    <>
      <style>{`
        @keyframes corb1 {
          0%   { transform: translate(0px,  0px)  scale(1);    }
          14%  { transform: translate(4px, -6px)  scale(1.10); }
          28%  { transform: translate(7px, -1px)  scale(1.18); }
          42%  { transform: translate(5px,  5px)  scale(1.08); }
          57%  { transform: translate(-2px, 7px)  scale(0.93); }
          71%  { transform: translate(-6px, 2px)  scale(0.88); }
          85%  { transform: translate(-3px,-5px)  scale(0.96); }
          100% { transform: translate(0px,  0px)  scale(1);    }
        }
        @keyframes corb2 {
          0%   { transform: translate(0px,  0px)  scale(1);    }
          18%  { transform: translate(-5px,-7px)  scale(1.12); }
          36%  { transform: translate(-8px,-2px)  scale(1.20); }
          54%  { transform: translate(-4px, 6px)  scale(1.10); }
          72%  { transform: translate(4px,  5px)  scale(0.91); }
          90%  { transform: translate(2px, -3px)  scale(0.97); }
          100% { transform: translate(0px,  0px)  scale(1);    }
        }
        @keyframes corb3 {
          0%   { transform: translate(0px,  0px)  scale(1);    }
          22%  { transform: translate(6px,  8px)  scale(1.11); }
          44%  { transform: translate(3px,  2px)  scale(1.06); }
          66%  { transform: translate(-8px,-5px)  scale(0.86); }
          88%  { transform: translate(-4px, 3px)  scale(0.94); }
          100% { transform: translate(0px,  0px)  scale(1);    }
        }
        @keyframes cnoise {
          0%   { transform: translate(0%,  0%)  rotate(0deg);  }
          16%  { transform: translate(-3%, 4%)  rotate(3deg);  }
          33%  { transform: translate(4%, -3%)  rotate(-2deg); }
          50%  { transform: translate(3%,  5%)  rotate(4deg);  }
          66%  { transform: translate(-4%,-2%)  rotate(-3deg); }
          83%  { transform: translate(2%, -4%)  rotate(2deg);  }
          100% { transform: translate(0%,  0%)  rotate(0deg);  }
        }
        @keyframes cwave1 {
          0%   { transform: translateX(-130%) rotate(-35deg); }
          100% { transform: translateX(160%)  rotate(-35deg); }
        }
        @keyframes cwave2 {
          0%   { transform: translateX(160%)  rotate(40deg); }
          100% { transform: translateX(-130%) rotate(40deg); }
        }
        @keyframes cwave3 {
          0%   { transform: translateX(-130%) rotate(-15deg); }
          100% { transform: translateX(160%)  rotate(-15deg); }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="fcb-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <div className="fixed bottom-20 right-6 md:bottom-8 md:right-auto md:left-1/2 md:-translate-x-1/2 z-50">
        <button
          onClick={handleClick}
          className="relative flex items-center gap-3 h-12 w-12 md:w-auto md:h-auto md:pl-2 md:pr-6 md:py-2 justify-center rounded-full bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.08] md:hover:scale-[1.04] active:scale-[0.95] md:active:scale-[0.98] transition-all duration-200"
        >
          <div ref={orbRef} className="relative h-10 w-10 md:h-11 md:w-11 rounded-full overflow-hidden flex-shrink-0">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 38% 36%, #9a9a9a 0%, #454545 40%, #101010 72%, #000000 100%)' }} />
            <div className="absolute rounded-full" style={{ width: '72%', height: '72%', top: '2%', left: '2%', opacity: 0.55, background: 'radial-gradient(circle, #ffffff 0%, transparent 68%)', ...orbAnim('corb1', '9s') }} />
            <div className="absolute rounded-full" style={{ width: '68%', height: '68%', bottom: '-6%', right: '-6%', opacity: 0.72, background: 'radial-gradient(circle, #000000 0%, transparent 68%)', ...orbAnim('corb2', '12s') }} />
            <div className="absolute rounded-full" style={{ width: '58%', height: '58%', bottom: '14%', left: '6%', opacity: 0.38, background: 'radial-gradient(circle, #888888 0%, transparent 68%)', ...orbAnim('corb3', '15s') }} />
            <div className="absolute mix-blend-overlay" style={{ inset: '-10%', opacity: 0.30, filter: 'url(#fcb-noise)', background: 'white', ...orbAnim('cnoise', '6s') }} />
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
              <div style={{ position: 'absolute', top: '28%', left: '-20%', right: '-20%', height: '22%', borderRadius: '50%', background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,255,255,0.20) 0%, transparent 100%)', ...orbAnim('cwave1', '2.2s') }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
              <div style={{ position: 'absolute', top: '50%', left: '-20%', right: '-20%', height: '16%', borderRadius: '50%', background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,255,255,0.13) 0%, transparent 100%)', ...orbAnim('cwave2', '3.1s') }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50%' }}>
              <div style={{ position: 'absolute', top: '66%', left: '-20%', right: '-20%', height: '14%', borderRadius: '50%', background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,255,255,0.09) 0%, transparent 100%)', ...orbAnim('cwave3', '4.0s', '0.6s') }} />
            </div>
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 28% 26%, rgba(255,255,255,0.65) 0%, transparent 48%)' }} />

            <div className="absolute inset-0 flex items-center justify-center" style={{ gap: '5px', transform: `translate(${pupil.x}px, ${pupil.y}px) translateY(-4%)`, transition: 'transform 260ms ease-out', pointerEvents: 'none' }}>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '22%',
                    height: '30%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #f3f3f3 70%, #dcdcdc 100%)',
                    transform: isAnimating ? 'scaleY(0.12)' : 'scaleY(1)',
                    transition: 'transform 90ms ease',
                  }}
                />
              ))}
            </div>
          </div>

          <span className="hidden md:inline text-[15px] font-medium text-foreground whitespace-nowrap select-none">
            Talk to my agent
          </span>
        </button>
      </div>
    </>
  );
}
