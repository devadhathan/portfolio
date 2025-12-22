'use client';

import { MessageCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isCollapsed: boolean;
  mode?: 'ask' | 'agent';
  onModeChange?: (mode: 'ask' | 'agent') => void;
}

export function FloatingChatButton({ onClick, isCollapsed, mode: externalMode, onModeChange }: FloatingChatButtonProps) {
  const [internalMode, setInternalMode] = useState<'ask' | 'agent'>(externalMode || 'agent');
  const mode = externalMode !== undefined ? externalMode : internalMode;
  
  // Sync internal mode when external mode changes
  useEffect(() => {
    if (externalMode !== undefined) {
      setInternalMode(externalMode);
    }
  }, [externalMode]);
  const [shouldShimmer, setShouldShimmer] = useState(false);
  
  const setMode = (newMode: 'ask' | 'agent') => {
    try {
      if (onModeChange) {
        onModeChange(newMode);
      } else {
        setInternalMode(newMode);
      }
    } catch (error) {
      console.error('Error setting mode:', error);
    }
  };
  const [shouldBounce, setShouldBounce] = useState(false);

  // Trigger bounce animation once when collapsed
  useEffect(() => {
    if (isCollapsed) {
      setShouldBounce(true);
      const timer = setTimeout(() => {
        setShouldBounce(false);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  useEffect(() => {
    let timeoutId: number | null = null;
    const intervalId = window.setInterval(() => {
      setShouldShimmer(true);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setShouldShimmer(false);
      }, 900);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!isCollapsed) {
    return null; // Don't show when chat is open
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3 items-end">
      {/* Mode Toggle - Above main button */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 shadow-lg">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              setMode('ask');
            } catch (error) {
              console.error('Error switching to ask mode:', error);
            }
          }}
          className={`p-1.5 rounded-full transition-all ${
            mode === 'ask'
              ? 'bg-white/20'
              : 'hover:bg-white/10'
          }`}
          title="Ask mode"
        >
          <MessageCircle className={`h-3.5 w-3.5 ${mode === 'ask' ? 'text-white' : 'text-white/60'}`} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              setMode('agent');
            } catch (error) {
              console.error('Error switching to agent mode:', error);
            }
          }}
          className={`p-1.5 rounded-full transition-all ${
            mode === 'agent'
              ? 'bg-white/20'
              : 'hover:bg-white/10'
          }`}
          title="Agent mode"
        >
          <Sparkles className={`h-3.5 w-3.5 ${mode === 'agent' ? 'text-white' : 'text-white/60'}`} />
        </button>
      </div>

      {/* Main Chat Button - Circular, glowing with one-time bounce */}
      <button
        onClick={() => {
          onClick();
        }}
        className={`relative h-14 w-14 rounded-full bg-black/90 backdrop-blur-xl border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-110 transition-all duration-200 flex items-center justify-center group overflow-hidden ${
          shouldBounce ? 'animate-bounce-once' : ''
        } ${shouldShimmer ? 'shimmer-button' : ''}`}
      >
        {mode === 'agent' ? (
          <>
            <Sparkles className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            <span className="shimmer-dot shimmer-dot-1" aria-hidden />
            <span className="shimmer-dot shimmer-dot-2" aria-hidden />
          </>
        ) : (
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}
