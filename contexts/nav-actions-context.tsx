'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type NavActions = {
  onProjectSelect?: (projectSlug: string) => void;
  onHomeClick?: () => void;
  hideTopBar?: boolean;
  hideMobileNav?: boolean;
};

type NavVisibility = {
  hideTopBar: boolean;
  hideMobileNav: boolean;
};

type NavActionsContextValue = {
  onProjectSelectRef: React.MutableRefObject<NavActions['onProjectSelect']>;
  onHomeClickRef: React.MutableRefObject<NavActions['onHomeClick']>;
  hideTopBar: boolean;
  hideMobileNav: boolean;
  setVisibility: (next: Partial<NavVisibility>) => void;
};

const DEFAULT_VISIBILITY: NavVisibility = {
  hideTopBar: false,
  hideMobileNav: false,
};

const NavActionsContext = createContext<NavActionsContextValue | null>(null);

export function NavActionsProvider({ children }: { children: ReactNode }) {
  const onProjectSelectRef = useRef<NavActions['onProjectSelect']>();
  const onHomeClickRef = useRef<NavActions['onHomeClick']>();
  const [visibility, setVisibilityState] = useState<NavVisibility>(DEFAULT_VISIBILITY);

  const setVisibility = useCallback((next: Partial<NavVisibility>) => {
    setVisibilityState((prev) => {
      const merged = { ...prev, ...next };
      if (
        prev.hideTopBar === merged.hideTopBar &&
        prev.hideMobileNav === merged.hideMobileNav
      ) {
        return prev;
      }
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({
      onProjectSelectRef,
      onHomeClickRef,
      hideTopBar: visibility.hideTopBar,
      hideMobileNav: visibility.hideMobileNav,
      setVisibility,
    }),
    [visibility.hideTopBar, visibility.hideMobileNav, setVisibility],
  );

  return (
    <NavActionsContext.Provider value={value}>
      {children}
    </NavActionsContext.Provider>
  );
}

export function useNavActions(): NavActionsContextValue {
  const ctx = useContext(NavActionsContext);
  if (!ctx) {
    throw new Error('useNavActions must be used within NavActionsProvider');
  }
  return ctx;
}

export function useRegisterNavActions(actions: NavActions) {
  const { onProjectSelectRef, onHomeClickRef, setVisibility } = useNavActions();

  onProjectSelectRef.current = actions.onProjectSelect;
  onHomeClickRef.current = actions.onHomeClick;

  useEffect(() => {
    setVisibility({
      hideTopBar: actions.hideTopBar ?? false,
      hideMobileNav: actions.hideMobileNav ?? false,
    });
    return () => setVisibility(DEFAULT_VISIBILITY);
  }, [setVisibility, actions.hideTopBar, actions.hideMobileNav]);
}
