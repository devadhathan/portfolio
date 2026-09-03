'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Widgets stay dark glass — wallpaper contrast does not flip them light. */
export function osNotificationGlassClass(opts?: { interactive?: boolean }) {
  return cn(
    'os-notification-widget w-full os-notification-widget--dark-glass',
    opts?.interactive === false && 'os-notification-widget--static',
  );
}

export function useOsNotificationGlassClass(opts?: { interactive?: boolean }) {
  return osNotificationGlassClass(opts);
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
