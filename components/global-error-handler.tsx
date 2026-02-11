'use client';

/**
 * Global error handler - no longer needed since we patched React DOM's
 * unmountHoistable function directly. Kept as a no-op export for
 * backwards compatibility.
 */
export function GlobalErrorHandler() {
  return null;
}
