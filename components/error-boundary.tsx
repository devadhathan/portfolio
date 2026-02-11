'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary that suppresses Framer Motion cleanup errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState | null {
    const errorMessage = error?.message || '';
    const errorString = error?.toString() || '';
    const stack = error?.stack || '';

    // Suppress Framer Motion cleanup errors
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('parentNode') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorString.includes('removeChild') ||
      errorString.includes('unmountHoistable') ||
      stack.includes('unmountHoistable') ||
      stack.includes('commitDeletionEffects')
    ) {
      return null;
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error?.message || '';
    const stack = error?.stack || '';

    // Suppress Framer Motion cleanup errors
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('parentNode') ||
      errorMessage.includes('Cannot read properties of null') ||
      stack.includes('unmountHoistable') ||
      stack.includes('commitDeletionEffects')
    ) {
      this.setState({ hasError: false, error: null });
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
