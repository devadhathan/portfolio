'use client';

import { TopBar, MobileBottomNav } from '@/components/top-bar';
import { ScrollToTopOnNavigate } from '@/components/scroll-to-top-on-navigate';
import { CuelumeBind } from '@/components/cuelume-bind';
import { SoundToggle } from '@/components/sound-toggle';
import { useNavActions } from '@/contexts/nav-actions-context';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const { hideTopBar, hideMobileNav } = useNavActions();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <CuelumeBind />
      <ScrollToTopOnNavigate />
      {!hideTopBar && <TopBar />}
      {children}
      {!hideMobileNav && <MobileBottomNav />}
      <SoundToggle />
    </div>
  );
}
