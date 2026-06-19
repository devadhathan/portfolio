'use client';

import { useEffect } from 'react';

/**
 * Installs a global error handler that swallows React DOM cleanup errors
 * (removeChild on null parent) which happen during Next.js page transitions.
 * These are harmless — the page has already navigated successfully.
 */
export function SuppressCleanupErrors() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      const msg = event.error?.message ?? event.message ?? '';
      const stack = event.error?.stack ?? '';
      if (
        msg.includes('removeChild') ||
        msg.includes('parentNode') ||
        msg.includes("reading 'get'") ||
        stack.includes('removeChild') ||
        stack.includes('unmountHoistable')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Use capture phase so we intercept before React's handler
    window.addEventListener('error', handler, true);
    return () => window.removeEventListener('error', handler, true);
  }, []);

  return null;
}
