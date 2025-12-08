'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Image as ImageIcon } from 'lucide-react';
import { useTheme, availableThemes } from '@/contexts/theme-context';
import { useBackground } from '@/contexts/background-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from './logo';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { backgroundImage, setBackgroundImage, availableBackgrounds } = useBackground();
  const currentTheme = availableThemes.find(t => t.id === theme) || availableThemes[0];
  const isGlassTheme = theme === 'glass';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/20">
      <div className="w-full px-3 md:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Logo />
            <div className="flex flex-col">
              <span className="font-medium text-sm leading-none">Devadhathan</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">Product Designer</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Product Designer</span>
            </div>
            
            {isGlassTheme && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors h-auto"
                  >
                    <ImageIcon className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span>{availableBackgrounds.find(bg => bg.id === backgroundImage)?.name || 'Background'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {availableBackgrounds.map((bg) => (
                    <DropdownMenuItem
                      key={bg.id}
                      onClick={() => setBackgroundImage(bg.id)}
                      className={backgroundImage === bg.id ? 'bg-secondary' : ''}
                    >
                      {bg.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors h-auto"
                >
                  {(() => {
                    const IconComponent = currentTheme.icon;
                    if (currentTheme.color) {
                      return (
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: currentTheme.color }}
                        />
                      );
                    } else if (IconComponent) {
                      return <IconComponent className="h-3 w-3 text-primary flex-shrink-0" />;
                    }
                    return <Palette className="h-3 w-3 text-primary" />;
                  })()}
                  <span>{currentTheme.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {availableThemes.map((t) => {
                  const IconComponent = t.icon;
                  return (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={theme === t.id ? 'bg-secondary' : ''}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {t.color ? (
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: t.color }}
                          />
                        ) : IconComponent ? (
                          <IconComponent className="h-3 w-3 flex-shrink-0" />
                        ) : null}
                        <span>{t.name}</span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

