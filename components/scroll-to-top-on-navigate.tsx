'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { scrollPageToTop } from '@/lib/scroll-page';

/** Ensures each route starts at the top without smooth-scroll animation. */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    scrollPageToTop();
  }, [pathname]);

  return null;
}
