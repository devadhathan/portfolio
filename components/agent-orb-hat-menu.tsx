'use client';

import { AgentOrb } from '@/components/agent-orb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ORB_HAT_PRESETS, useOrbHatEmoji } from '@/lib/orb-hat';
import { cn } from '@/lib/utils';

type AgentOrbHatMenuProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  align?: 'start' | 'center' | 'end';
};

export function AgentOrbHatMenu({
  size = 'sm',
  className,
  align = 'center',
}: AgentOrbHatMenuProps) {
  const [hat, setHat] = useOrbHatEmoji();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            className,
          )}
          aria-label="Customize orb hat"
          title="Customize hat"
        >
          <AgentOrb size={size} hatEmoji={hat} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={10}
        className="w-[220px] rounded-2xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161616]/95"
      >
        <DropdownMenuLabel className="px-1 pb-2 pt-0 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground/70">
          Hat
        </DropdownMenuLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {ORB_HAT_PRESETS.map((emoji) => {
            const selected = hat === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setHat(emoji)}
                className={cn(
                  'flex h-10 items-center justify-center rounded-xl text-xl transition-colors',
                  selected
                    ? 'bg-black/[0.08] ring-1 ring-foreground/20 dark:bg-white/[0.12]'
                    : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06]',
                )}
                aria-label={`Set hat to ${emoji}`}
                aria-pressed={selected}
              >
                {emoji}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setHat(null)}
          className="mt-2 w-full rounded-xl px-2 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]"
        >
          Remove hat
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** @deprecated use AgentOrbHatMenu */
export const AgentOrbFaceMenu = AgentOrbHatMenu;
