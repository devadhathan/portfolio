import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LinedPageFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Extra class on the title (e.g. max-width). */
  titleClassName?: string;
};

/**
 * Home-style lined rectangle — corner pluses, title, double rule, then body.
 */
export function LinedPageFrame({
  title,
  children,
  className,
  titleClassName,
}: LinedPageFrameProps) {
  return (
    <div className={cn('home-intro-cafe home-intro-cafe--lined os-col w-full', className)}>
      <div className="home-intro-frame">
        <span className="home-intro-frame__plus home-intro-frame__plus--tl" aria-hidden>
          +
        </span>
        <span className="home-intro-frame__plus home-intro-frame__plus--br" aria-hidden>
          +
        </span>

        <div className="home-intro-frame__section home-intro-frame__section--title">
          <h1 className={cn('page-lined-title tracking-tight text-foreground', titleClassName)}>
            {title}
          </h1>
        </div>

        <div className="home-intro-frame__rule-pair" aria-hidden>
          <div className="home-intro-frame__rule" />
          <div className="home-intro-frame__rule" />
        </div>

        <div className="home-intro-frame__section home-intro-frame__section--body">{children}</div>
      </div>
    </div>
  );
}
