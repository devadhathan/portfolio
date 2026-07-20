'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import type { AgentState } from '@/lib/agent';

const SideAgent = dynamic(
  () => import('@/components/side-agent').then((mod) => ({ default: mod.SideAgent })),
  { ssr: false },
);

type AskAIContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  resetAgent: () => void;
  registerStateChange: (handler: (state: AgentState) => void) => void;
};

const AskAIContext = createContext<AskAIContextValue | null>(null);

export function useAskAI() {
  const context = useContext(AskAIContext);
  if (!context) {
    throw new Error('useAskAI must be used within AskAIProvider');
  }
  return context;
}

export function AskAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const stateChangeRef = useRef<(state: AgentState) => void>(() => {});
  const resetAgentRef = useRef<(() => void) | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const resetAgent = useCallback(() => {
    resetAgentRef.current?.();
  }, []);

  const registerStateChange = useCallback((handler: (state: AgentState) => void) => {
    stateChangeRef.current = handler;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (window.innerWidth < 1024) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <AskAIContext.Provider
      value={{ isOpen, open, close, toggle, resetAgent, registerStateChange }}
    >
      <div>{children}</div>
      <SideAgent
        variant="sidebar"
        onStateChange={(state) => stateChangeRef.current(state)}
        onCollapseChange={(collapsed) => setIsOpen(!collapsed)}
        externalCollapsed={!isOpen}
        resetRef={resetAgentRef}
      />
    </AskAIContext.Provider>
  );
}
