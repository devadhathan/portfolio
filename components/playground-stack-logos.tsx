'use client';

import type { ReactElement } from 'react';
import type { PlaygroundStackId } from '@/lib/playground-items';
import { cn } from '@/lib/utils';

const STACK_LABELS: Record<PlaygroundStackId, string> = {
  whisper: 'Whisper',
  swiftui: 'SwiftUI',
  rive: 'Rive',
  xcode: 'Xcode',
};

function WhisperLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.5c-2.2 0-4 1.9-4 4.2v4.6c0 2.3 1.8 4.2 4 4.2s4-1.9 4-4.2V7.7c0-2.3-1.8-4.2-4-4.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M5.5 11.5v1c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SwiftUILogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M17.8 4.2c-3.2 2.4-6.2 6.2-8.4 10.4 1.3-.9 2.7-1.5 4.1-1.5 2.6 0 4.7 1.6 5.8 3.9.7-1.5 1-3.2.8-5-.3-4.2-1.2-6.5-2.3-7.8Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M5.2 16.4c2.4-2.8 5.5-5.3 8.8-7.1-2.1 3.5-3.5 7.3-3.8 10.5-1.9-.7-3.5-1.9-5-3.4Z"
        fill="currentColor"
      />
      <path d="M4 19.2c1.6-1.2 3.4-2 5.3-2.3-.4 1.1-.5 2.1-.4 3.1-1.9-.1-3.5-.4-4.9-.8Z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function RiveLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.2 14.8c1.1-3.4 2.8-5.8 5.4-7.6-1.6 2.6-2.2 5.1-2 7.4 1.8-.3 3.3-1.1 4.5-2.3-.8 2.4-2.6 4.1-5.1 4.8-1.1.3-2 .2-2.8-.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XcodeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const STACK_ICONS: Record<PlaygroundStackId, (props: { className?: string }) => ReactElement> = {
  whisper: WhisperLogo,
  swiftui: SwiftUILogo,
  rive: RiveLogo,
  xcode: XcodeLogo,
};

type PlaygroundStackLogosProps = {
  stack: PlaygroundStackId[];
  label?: string;
  className?: string;
};

export function PlaygroundStackLogos({ stack, label = 'Built with', className }: PlaygroundStackLogosProps) {
  if (stack.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {stack.map((id) => {
          const Icon = STACK_ICONS[id];
          const name = STACK_LABELS[id];
          return (
            <li
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[12px] text-foreground/85"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
