import { cn } from '@/lib/utils';

type CardTagTone = 'glass' | 'accent' | 'sky' | 'amber' | 'emerald' | 'mono';

type CardTagProps = {
  children: React.ReactNode;
  className?: string;
  /** `mono` is plain status text. All other tones share one compact pill style. */
  tone?: CardTagTone;
};

/** One compact pill look for Latest / 2026 / Case study / etc. */
const PILL_CLASS =
  'rounded-full border border-foreground/20 bg-secondary/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground dark:border-white/35 dark:bg-white/[0.07]';

const TONE_CLASS: Record<CardTagTone, string> = {
  glass: PILL_CLASS,
  accent: PILL_CLASS,
  sky: PILL_CLASS,
  amber: PILL_CLASS,
  emerald: PILL_CLASS,
  mono:
    'font-mono text-[11px] font-normal tracking-wide text-muted-foreground transition-colors duration-200 hover:text-primary group-hover:text-primary group-hover/row:text-primary group-hover/nesoi:text-primary group-hover/cat:text-primary group-hover/ws:text-primary group-hover/notch:text-primary',
};

export function CardTag({ children, className, tone = 'glass' }: CardTagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center leading-none',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
