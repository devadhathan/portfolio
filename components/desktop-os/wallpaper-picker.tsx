'use client';

import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { WALLPAPER_PRESETS } from '@/lib/desktop-os';
import { cn, focusRing } from '@/lib/utils';

type WallpaperPickerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WallpaperPicker({ open, onOpenChange }: WallpaperPickerProps) {
  const { wallpaperId, setWallpaperId } = useDesktopOs();

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Change wallpaper"
          title="Wallpaper"
          data-cuelume-press
          data-cuelume-hover="tick"
          className={cn(
            'flex h-9 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-foreground/85 hover:bg-secondary/50 hover:text-foreground sm:px-3',
            // Override Button’s default ring-offset so menubar doesn’t get a double ring.
            'focus-visible:ring-offset-0',
            focusRing,
          )}
        >
          <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
          <span className="hidden xl:inline">Wallpaper</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border border-border bg-card">
        {WALLPAPER_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => setWallpaperId(preset.id)}
            className={cn(wallpaperId === preset.id && 'bg-muted')}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
