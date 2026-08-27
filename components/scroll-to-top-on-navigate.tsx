'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { scrollPageToTop } from '@/lib/scroll-page';

/** Ensures each route starts at the top without smooth-scroll animation. */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const desktopOs = useDesktopOsOptional();

  useEffect(() => {
    // OS window navigations sync the URL — don't reset every window's scroll.
    if (desktopOs?.enabled) return;
    scrollPageToTop();
  }, [pathname, desktopOs?.enabled]);

  return null;
}
