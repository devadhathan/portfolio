import { cn } from '@/lib/utils';

type CardTagProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardTag({ children, className }: CardTagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border border-border/60 bg-muted/25 px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
