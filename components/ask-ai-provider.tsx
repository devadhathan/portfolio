'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import type { AgentState } from '@/lib/agent';

type AskAIContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  resetAgent: () => void;
  registerStateChange: (handler: (state: AgentState) => void) => void;
  dispatchStateChange: (state: AgentState) => void;
  resetRef: MutableRefObject<(() => void) | null>;
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

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  const resetAgent = useCallback(() => {
    resetAgentRef.current?.();
  }, []);

  const registerStateChange = useCallback((handler: (state: AgentState) => void) => {
    stateChangeRef.current = handler;
  }, []);

  const dispatchStateChange = useCallback((state: AgentState) => {
    stateChangeRef.current(state);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  // Ask AI always lives in the Desktop OS window — no fixed SideAgent rail.
  return (
    <AskAIContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        resetAgent,
        registerStateChange,
        dispatchStateChange,
        resetRef: resetAgentRef,
      }}
    >
      <div>{children}</div>
    </AskAIContext.Provider>
  );
}
