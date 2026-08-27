'use client';

import { TopBar, MobileBottomNav } from '@/components/top-bar';
import { ScrollToTopOnNavigate } from '@/components/scroll-to-top-on-navigate';
import { CuelumeBind } from '@/components/cuelume-bind';
import { DesktopOsProvider, useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { DesktopOsShell } from '@/components/desktop-os/desktop-os-shell';
import { useNavActions } from '@/contexts/nav-actions-context';
import { installPerfDebug } from '@/lib/perf-debug';
import { useEffect } from 'react';

function AppChromeInner({ children }: { children: React.ReactNode }) {
  const { hideTopBar, hideMobileNav } = useNavActions();
  const { enabled } = useDesktopOs();

  // No-op unless the URL carries ?perf=1
  useEffect(() => installPerfDebug(), []);

  return (
    <div className="desktop-stage min-h-screen overflow-x-hidden">
      <CuelumeBind />
      <ScrollToTopOnNavigate />
      {!hideTopBar ? <TopBar /> : null}
      {enabled ? (
        <DesktopOsShell />
      ) : (
        <div className="desktop-stage-inset">{children}</div>
      )}
      {!hideMobileNav && !enabled ? <MobileBottomNav /> : null}
    </div>
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOsProvider>
      <AppChromeInner>{children}</AppChromeInner>
    </DesktopOsProvider>
  );
}
