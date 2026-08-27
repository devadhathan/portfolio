'use client';

import { Draw } from 'drawesome';
import { useTheme } from 'next-themes';
import 'drawesome/styles.css';

export function DrawesomeWindowBody() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="os-window-content os-window-content--fill" data-os-embedded="true">
      <div className="flex h-full min-h-[min(520px,70vh)] flex-col p-3 sm:p-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40 bg-background">
          <Draw theme={resolvedTheme === 'dark' ? 'dark' : 'light'} look="studio" />
        </div>
      </div>
    </div>
  );
}
