'use client';

import type { ReactNode } from 'react';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { menubarContrastFor, type WallpaperId } from '@/lib/desktop-os';
import { cn } from '@/lib/utils';

/** Same iOS notification glass as the welcome toast. */
export function osNotificationGlassClass(
  wallpaperId: WallpaperId,
  opts?: { interactive?: boolean },
) {
  const tone = menubarContrastFor(wallpaperId);
  return cn(
    'os-notification-widget w-full',
    tone === 'light'
      ? 'os-notification-widget--dark-glass'
      : 'os-notification-widget--light-glass',
    opts?.interactive === false && 'os-notification-widget--static',
  );
}

export function useOsNotificationGlassClass(opts?: { interactive?: boolean }) {
  const { wallpaperId } = useDesktopOs();
  return osNotificationGlassClass(wallpaperId, opts);
}

type OsWidgetGlassProps = {
  children: ReactNode;
  className?: string;
  /** Panel widgets are not dismiss buttons. */
  interactive?: boolean;
};

export function OsWidgetGlass({
  children,
  className,
  interactive = false,
}: OsWidgetGlassProps) {
  const glassClass = useOsNotificationGlassClass({ interactive });

  return <div className={cn(glassClass, className)}>{children}</div>;
}
