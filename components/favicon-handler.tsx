'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { availableThemes } from '@/contexts/theme-context';

export function FaviconHandler() {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const currentTheme = availableThemes.find(t => t.id === theme) || availableThemes[0];
    
    // Remove existing favicon
    const existingLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (existingLink) {
      existingLink.remove();
    }

    // Create SVG favicon based on theme
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');

    // Create a group for the icon
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (currentTheme.color) {
      // For color themes, create a colored circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '16');
      circle.setAttribute('cy', '16');
      circle.setAttribute('r', '14');
      circle.setAttribute('fill', currentTheme.color);
      group.appendChild(circle);
      svg.appendChild(group);
    } else if (theme === 'light') {
      // Sun icon - simplified
      // Center circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '16');
      circle.setAttribute('cy', '16');
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#000000');
      group.appendChild(circle);
      // Rays
      for (let i = 0; i < 8; i++) {
        const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const angle = (i * Math.PI) / 4;
        const x1 = 16 + Math.cos(angle) * 6;
        const y1 = 16 + Math.sin(angle) * 6;
        const x2 = 16 + Math.cos(angle) * 10;
        const y2 = 16 + Math.sin(angle) * 10;
        ray.setAttribute('x1', x1.toString());
        ray.setAttribute('y1', y1.toString());
        ray.setAttribute('x2', x2.toString());
        ray.setAttribute('y2', y2.toString());
        ray.setAttribute('stroke', '#000000');
        ray.setAttribute('stroke-width', '2');
        ray.setAttribute('stroke-linecap', 'round');
        group.appendChild(ray);
      }
      svg.appendChild(group);
    } else {
      // For icon themes, create an SVG path representing the icon
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Icon paths (simplified versions for 32x32 viewBox)
      if (theme === 'dark') {
        // Moon icon - simplified
        path.setAttribute('d', 'M22.5 17.5c-2.5 0-4.5-2-4.5-4.5 0-1 .3-2 .8-2.8C16.2 9 14 7 11.5 7c-3 0-5.5 2.5-5.5 5.5 0 3 2.5 5.5 5.5 5.5 2.5 0 4.5-1.2 5.7-3 0.8 0.5 1.8 0.8 2.8 0.8 2.5 0 4.5-2 4.5-4.5 0-0.5-0.1-1-0.3-1.5-0.3 0.3-0.7 0.5-1.2 0.5z');
        path.setAttribute('fill', '#ffffff');
      } else {
        path.setAttribute('d', 'M22.5 17.5c-2.5 0-4.5-2-4.5-4.5 0-1 .3-2 .8-2.8C16.2 9 14 7 11.5 7c-3 0-5.5 2.5-5.5 5.5 0 3 2.5 5.5 5.5 5.5 2.5 0 4.5-1.2 5.7-3 0.8 0.5 1.8 0.8 2.8 0.8 2.5 0 4.5-2 4.5-4.5 0-0.5-0.1-1-0.3-1.5-0.3 0.3-0.7 0.5-1.2 0.5z');
        path.setAttribute('fill', '#ffffff');
      }
      
      group.appendChild(path);
      svg.appendChild(group);
    }

    // Convert SVG to data URL
    const svgString = new XMLSerializer().serializeToString(svg);
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

    // Create and append new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = dataUrl;
    document.head.appendChild(link);
  }, [theme]);

  return null;
}
