'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const tabs = [
  { id: 'about', label: 'About', path: '/' },
  { id: 'work', label: 'Work', path: '/work' },
  { id: 'contact', label: 'Contact', path: '/contact' },
  { id: 'playground', label: 'Playground', path: '/playground' },
];

interface BottomNavProps {
  variant?: 'bottom' | 'top';
  className?: string;
}

export function BottomNav({ variant = 'bottom', className }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else if (pathname === '/') {
      setActiveTab('about');
    }
  }, [pathname]);

  const handleClick = async (tabId: string, path: string) => {
    if (tabId === activeTab && pathname === path) return;
    setActiveTab(tabId);
    setIsNavigating(true);
    try {
      await router.push(path);
    } catch (error) {
      // Navigation error - ignore
    } finally {
      setIsNavigating(false);
    }
  };

  if (variant === 'top') {
    return (
      <>
        {isNavigating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="flex flex-col items-center gap-2 text-white">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        <div className={className ?? ''}>
          <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-card/60 border border-border/40">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleClick(tab.id, tab.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
                    ${isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                >
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-muted-foreground">Loading...
            </p>
          </div>
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="flex items-center justify-between gap-1 px-2 py-1 bg-card border-t border-border/70 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.45)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleClick(tab.id, tab.path)}
                className={`flex-1 flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 transition-all duration-200
                  ${isActive ? 'text-foreground bg-background/70' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <span className="text-[12px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 px-2 py-2 bg-card backdrop-blur-xl border-2 border-border/70 rounded-full shadow-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleClick(tab.id, tab.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200
                  ${isActive
                    ? 'bg-background text-foreground shadow-lg -translate-y-0.5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
