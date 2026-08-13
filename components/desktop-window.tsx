'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

function windowTitleKey(pathname: string): 'home' | 'work' | 'playground' | 'contact' {
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/playground')) return 'playground';
  if (pathname.startsWith('/contact')) return 'contact';
  return 'home';
}

/** Opacity-only enter via CSS — no transform, so fixed overlays stay viewport-relative. */
export function DesktopWindow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const title = t(windowTitleKey(pathname));

  return (
    <div className={cn('desktop-window', className)}>
      <div className="desktop-window-titlebar">
        <div className="desktop-window-traffic" aria-hidden>
          <span className="desktop-window-dot desktop-window-dot--close" />
          <span className="desktop-window-dot desktop-window-dot--minimize" />
          <span className="desktop-window-dot desktop-window-dot--zoom" />
        </div>
        <span className="desktop-window-title">{title}</span>
      </div>
      <div className="desktop-window-body">{children}</div>
    </div>
  );
}
