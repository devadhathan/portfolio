'use client';

import { useEffect, useState } from 'react';

export default function LoadingPage() {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 250);

    return () => {
      clearTimeout(timer);
      setShowLoader(false);
    };
  }, []);

  if (!showLoader) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-center text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
