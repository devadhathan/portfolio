'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';

import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { osNotificationGlassClass } from '@/components/desktop-os/os-widget-glass';
import { cn } from '@/lib/utils';

const WELCOME_STORAGE_KEY = 'dev-os-welcome-shown';
const DEV_OS_ICON = '/photos/case-study-bg/MY%20ICON.svg';
const BODY_COPY =
  "This is Dev's portfolio desktop. Open Work, Playground, or Ask AI from the dock.";
/** Drag past this (px) or flick faster than this (px/s) to dismiss. */
const DISMISS_OFFSET_X = 96;
const DISMISS_VELOCITY_X = 520;

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function WelcomeCard({
  timestamp,
  onDismiss,
  className,
}: {
  timestamp: string;
  onDismiss?: () => void;
  className?: string;
}) {
  const { wallpaperId } = useDesktopOs();

  return (
    <button
      type="button"
      aria-label="Dismiss welcome notification"
      className={cn(
        osNotificationGlassClass(wallpaperId, { interactive: Boolean(onDismiss) }),
        'text-left',
        className,
      )}
      onClick={onDismiss}
    >
      <div className="os-notification-widget__header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEV_OS_ICON}
          alt=""
          width={44}
          height={44}
          className="os-notification-widget__icon h-11 w-11 shrink-0 rounded-[0.7rem]"
          draggable={false}
        />
        <div className="os-notification-widget__copy min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="os-notification-widget__title line-clamp-2">Welcome to Dev OS</p>
            <time className="os-notification-widget__time shrink-0">{timestamp}</time>
          </div>
          <p className="os-notification-widget__body">{BODY_COPY}</p>
        </div>
      </div>
    </button>
  );
}

/** Floating toast only - desktop viewers; does not open the widgets panel. */
export function DevOsWelcomeToast() {
  const { prefsReady, widgetsOpen, isNarrow } = useDesktopOs();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [timestamp, setTimestamp] = useState('Now');
  const draggedRef = useRef(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(WELCOME_STORAGE_KEY, '1');
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !prefsReady || isNarrow) {
      setVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem(WELCOME_STORAGE_KEY) === '1') return;
    } catch {
      /* private mode */
    }

    setTimestamp(formatTimestamp(new Date()));
    const showTimer = window.setTimeout(() => setVisible(true), 1100);
    return () => window.clearTimeout(showTimer);
  }, [hydrated, prefsReady, isNarrow]);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = window.setTimeout(dismiss, 12000);
    return () => window.clearTimeout(hideTimer);
  }, [visible, dismiss]);

  // Desktop only; hide while widgets panel is open (panel has its own copy).
  const showToast = visible && !widgetsOpen && !isNarrow;

  const onDragStart = useCallback(() => {
    draggedRef.current = false;
  }, []);

  const onDrag = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 8) draggedRef.current = true;
  }, []);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const slidRight = info.offset.x > DISMISS_OFFSET_X || info.velocity.x > DISMISS_VELOCITY_X;
      if (slidRight) dismiss();
    },
    [dismiss],
  );

  const onCardDismiss = useCallback(() => {
    // Don't treat a swipe as a click dismiss.
    if (draggedRef.current) return;
    dismiss();
  }, [dismiss]);

  const motionProps = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { x: '108%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '108%', opacity: 0 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 34, mass: 0.82 },
      };

  return (
    <AnimatePresence>
      {showToast ? (
        <motion.div
          {...motionProps}
          drag={reduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.06, right: 0.92 }}
          dragMomentum={false}
          dragDirectionLock
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          className="pointer-events-auto fixed top-[3.25rem] right-3 z-[195] w-[min(20.5rem,calc(100vw-1.5rem))] touch-pan-y sm:right-5"
          style={{ cursor: reduceMotion ? undefined : 'grab' }}
        >
          <WelcomeCard timestamp={timestamp} onDismiss={onCardDismiss} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** In-panel copy — visible whenever the widgets drawer is open. */
export function DevOsWelcomeWidget() {
  const [timestamp] = useState(() => formatTimestamp(new Date()));

  return <WelcomeCard timestamp={timestamp} />;
}
