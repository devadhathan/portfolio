/** Shared Framer Motion presets for portfolio transitions. */

export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeSlideUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const blurFadeUp = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 8, filter: 'blur(4px)' },
};

/** Lighter enter for media-heavy cards (videos) — skip filter paint cost. */
export const fadeUpSoft = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const fadeSlide = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const panelSlideRight = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const overlayFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const defaultTransition = {
  duration: 0.38,
  ease: easeOutExpo,
};

export const panelTransition = {
  duration: 0.32,
  ease: easeOutExpo,
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: easeOutExpo },
  },
};

export const navPillTransition = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};
