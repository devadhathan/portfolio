'use client';

import { AnimatePresence, AnimatePresenceProps } from 'framer-motion';
import { ReactNode } from 'react';

interface SafeAnimatePresenceProps extends AnimatePresenceProps {
  children?: ReactNode;
}

/**
 * Wrapper around AnimatePresence for consistent API.
 * The underlying unmountHoistable bug is fixed via a direct React DOM patch.
 */
export function SafeAnimatePresence({ children, ...props }: SafeAnimatePresenceProps) {
  return <AnimatePresence {...props}>{children}</AnimatePresence>;
}
