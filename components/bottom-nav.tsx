'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Briefcase, Mail, Code } from 'lucide-react';

const tabs = [
  { id: 'about', label: 'About', icon: User, path: '/' },
  { id: 'work', label: 'Work', icon: Briefcase, path: '/work' },
  { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
  { id: 'playground', label: 'Playground', icon: Code, path: '/playground' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    // Set active tab based on current pathname
    const currentTab = tabs.find(tab => tab.path === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else if (pathname === '/') {
      setActiveTab('about');
    }
  }, [pathname]);

  const handleClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    router.push(path);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-2 py-2 bg-card backdrop-blur-xl border-2 border-border/70 rounded-full shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id, tab.path)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

