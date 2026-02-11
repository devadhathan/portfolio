'use client';

import React from 'react';

/**
 * Catches Framer Motion / React DOM cleanup errors during page transitions
 * (e.g. "reading 'get'" when Motion context is torn down, "removeChild" when
 * parent is already null) so the app doesn't show the full error UI.
 */
export class MotionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const msg = error?.message ?? '';
    const isMotionOrCleanup =
      msg.includes("reading 'get'") ||
      msg.includes('removeChild') ||
      msg.includes('parentNode');
    if (isMotionOrCleanup) {
      return { hasError: true };
    }
    return null; // Let error propagate to parent boundary
  }

  componentDidCatch(error: Error) {
    const msg = error?.message ?? '';
    if (msg.includes("reading 'get'") || msg.includes('removeChild')) {
      // Suppress - don't log to avoid console noise
      return;
    }
    console.error('MotionErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Continue
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
