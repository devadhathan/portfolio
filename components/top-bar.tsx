'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Image as ImageIcon, Sun } from 'lucide-react';
import { useTheme, availableThemes, rgbThemes } from '@/contexts/theme-context';
import { useBackground } from '@/contexts/background-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './mobile-sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  onProjectSelect?: (projectSlug: string) => void;
  onHomeClick?: () => void;
}

export function TopBar({ onProjectSelect, onHomeClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { backgroundImage, setBackgroundImage, availableBackgrounds } = useBackground();
  const isGlassTheme = theme === 'glass';
  const router = useRouter();

  const handleLogoClick = () => {
    // Reset portfolio state if handler provided
    if (onHomeClick) {
      onHomeClick();
    }
    // Navigate to home
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/20">
      <div className="w-full px-3 md:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <MobileSidebar onProjectSelect={onProjectSelect} />
            </div>
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/photos/Image@4x.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors cursor-pointer">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Message me</span>
              <span className="sm:hidden">Message</span>
            </button>
            
            {/* Mobile: Single dropdown for all themes */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors h-auto"
                  >
                    {(() => {
                      const currentTheme = [...availableThemes, ...rgbThemes].find(t => t.id === theme);
                      if (currentTheme?.icon) {
                        const IconComponent = currentTheme.icon;
                        return <IconComponent className="h-3 w-3 text-primary" />;
                      }
                      if (currentTheme?.color) {
                        return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTheme.color }} />;
                      }
                      return <Sun className="h-3 w-3 text-primary" />;
                    })()}
                    <span className="hidden sm:inline">Theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {availableThemes.map((t) => {
                    const IconComponent = t.icon;
                    return (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={theme === t.id ? 'bg-secondary' : ''}
                      >
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-3 w-3" />}
                          <span>{t.name}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  {rgbThemes.map((rgbTheme) => (
                    <DropdownMenuItem
                      key={rgbTheme.id}
                      onClick={() => setTheme(rgbTheme.id)}
                      className={theme === rgbTheme.id ? 'bg-secondary' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: rgbTheme.color }}
                        />
                        <span>{rgbTheme.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {isGlassTheme && (
                    <>
                      <DropdownMenuSeparator />
                      {availableBackgrounds.map((bg) => (
                        <DropdownMenuItem
                          key={bg.id}
                          onClick={() => setBackgroundImage(bg.id)}
                          className={backgroundImage === bg.id ? 'bg-secondary' : ''}
                        >
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" />
                            <span>{bg.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: Separate theme controls */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Dark, Light, Glass tabs */}
              <div className="flex items-center gap-0.5 px-1 py-1 rounded-full bg-secondary/40 border border-border/30">
                {availableThemes.map((t) => {
                  const IconComponent = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <Button
                      key={t.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-colors h-auto ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-3 w-3 flex-shrink-0" />}
                      <span>{t.name}</span>
                    </Button>
                  );
                })}
              </div>

              {isGlassTheme && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/30 text-xs hover:bg-secondary/50 transition-colors h-auto"
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

              {/* Red, Green, Blue buttons */}
              <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-secondary/40 border border-border/30">
                {rgbThemes.map((rgbTheme) => (
                  <Button
                    key={rgbTheme.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(rgbTheme.id)}
                    className={`flex items-center justify-center px-2 py-1.5 rounded-full hover:bg-secondary/50 transition-colors h-auto ${
                      theme === rgbTheme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    title={rgbTheme.name}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: rgbTheme.color }}
                    />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

