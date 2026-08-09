import { cn } from '@/lib/utils';

type CardTagTone = 'glass' | 'accent' | 'sky' | 'amber' | 'emerald';

type CardTagProps = {
  children: React.ReactNode;
  className?: string;
  /** Subtle glass tint. `accent` matches Catalystic “Live”. */
  tone?: CardTagTone;
};

const TONE_CLASS: Record<CardTagTone, string> = {
  glass:
    'border-white/25 bg-white/15 text-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border-white/12 dark:bg-white/[0.07] dark:text-foreground/75 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  accent:
    'border-primary/30 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-primary/25 dark:bg-primary/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  sky:
    'border-sky-400/30 bg-sky-400/12 text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:border-sky-300/25 dark:bg-sky-300/12 dark:text-sky-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  amber:
    'border-amber-400/30 bg-amber-400/12 text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:border-amber-300/25 dark:bg-amber-300/12 dark:text-amber-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  emerald:
    'border-emerald-400/30 bg-emerald-400/12 text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:border-emerald-300/25 dark:bg-emerald-300/12 dark:text-emerald-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
};

export function CardTag({ children, className, tone = 'glass' }: CardTagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[12px] font-medium leading-none tracking-wide backdrop-blur-md backdrop-saturate-150',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
