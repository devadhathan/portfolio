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
  /** Homepage desktop widgets rail — open from the logo-aligned chevron. */
  showWidgetsToggle?: boolean;
  widgetsCollapsed?: boolean;
  onOpenWidgets?: () => void;
};

type NavVisibility = {
  hideTopBar: boolean;
  hideMobileNav: boolean;
};

type NavActionsContextValue = {
  onProjectSelectRef: React.MutableRefObject<NavActions['onProjectSelect']>;
  onHomeClickRef: React.MutableRefObject<NavActions['onHomeClick']>;
  onOpenWidgetsRef: React.MutableRefObject<NavActions['onOpenWidgets']>;
  hideTopBar: boolean;
  hideMobileNav: boolean;
  showWidgetsToggle: boolean;
  widgetsCollapsed: boolean;
  setVisibility: (next: Partial<NavVisibility>) => void;
  setWidgetsChrome: (next: { showWidgetsToggle: boolean; widgetsCollapsed: boolean }) => void;
};

const DEFAULT_VISIBILITY: NavVisibility = {
  hideTopBar: false,
  hideMobileNav: false,
};

const NavActionsContext = createContext<NavActionsContextValue | null>(null);

export function NavActionsProvider({ children }: { children: ReactNode }) {
  const onProjectSelectRef = useRef<NavActions['onProjectSelect']>();
  const onHomeClickRef = useRef<NavActions['onHomeClick']>();
  const onOpenWidgetsRef = useRef<NavActions['onOpenWidgets']>();
  const [visibility, setVisibilityState] = useState<NavVisibility>(DEFAULT_VISIBILITY);
  const [widgetsChrome, setWidgetsChromeState] = useState({
    showWidgetsToggle: false,
    widgetsCollapsed: true,
  });

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

  const setWidgetsChrome = useCallback(
    (next: { showWidgetsToggle: boolean; widgetsCollapsed: boolean }) => {
      setWidgetsChromeState((prev) => {
        if (
          prev.showWidgetsToggle === next.showWidgetsToggle &&
          prev.widgetsCollapsed === next.widgetsCollapsed
        ) {
          return prev;
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      onProjectSelectRef,
      onHomeClickRef,
      onOpenWidgetsRef,
      hideTopBar: visibility.hideTopBar,
      hideMobileNav: visibility.hideMobileNav,
      showWidgetsToggle: widgetsChrome.showWidgetsToggle,
      widgetsCollapsed: widgetsChrome.widgetsCollapsed,
      setVisibility,
      setWidgetsChrome,
    }),
    [
      visibility.hideTopBar,
      visibility.hideMobileNav,
      widgetsChrome.showWidgetsToggle,
      widgetsChrome.widgetsCollapsed,
      setVisibility,
      setWidgetsChrome,
    ],
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
  const {
    onProjectSelectRef,
    onHomeClickRef,
    onOpenWidgetsRef,
    setVisibility,
    setWidgetsChrome,
  } = useNavActions();

  onProjectSelectRef.current = actions.onProjectSelect;
  onHomeClickRef.current = actions.onHomeClick;
  onOpenWidgetsRef.current = actions.onOpenWidgets;

  useEffect(() => {
    setVisibility({
      hideTopBar: actions.hideTopBar ?? false,
      hideMobileNav: actions.hideMobileNav ?? false,
    });
    return () => setVisibility(DEFAULT_VISIBILITY);
  }, [setVisibility, actions.hideTopBar, actions.hideMobileNav]);

  useEffect(() => {
    setWidgetsChrome({
      showWidgetsToggle: actions.showWidgetsToggle ?? false,
      widgetsCollapsed: actions.widgetsCollapsed ?? true,
    });
    return () => setWidgetsChrome({ showWidgetsToggle: false, widgetsCollapsed: true });
  }, [
    setWidgetsChrome,
    actions.showWidgetsToggle,
    actions.widgetsCollapsed,
  ]);
}
