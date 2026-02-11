'use client';

import { useEffect } from 'react';

export function FaviconHandler() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Remove existing favicon
    document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());

    const logoPath = '/photos/Image@4x.png';

    // Standard favicon
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = logoPath;
    document.head.appendChild(icon);

    // Apple touch icon (optional but nice)
    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = logoPath;
    document.head.appendChild(apple);
  }, []);

  return null;
}
