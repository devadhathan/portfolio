'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimateIconProps {
  children: ReactNode;
  animation?: 'pointing' | 'bounce' | 'pulse' | 'shake' | 'rotate';
  className?: string;
  animateOnHover?: boolean;
}

const animationVariants = {
  pointing: {
    hover: {
      x: 4,
      transition: { duration: 0.2, ease: 'easeOut' as const }
    }
  },
  bounce: {
    hover: {
      y: -4,
      transition: { duration: 0.2, ease: 'easeOut' as const }
    }
  },
  pulse: {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2, ease: 'easeOut' as const }
    }
  },
  shake: {
    hover: {
      x: [0, -2, 2, -2, 2, 0],
      transition: { duration: 0.3 }
    }
  },
  rotate: {
    hover: {
      rotate: 15,
      transition: { duration: 0.2, ease: 'easeOut' as const }
    }
  }
};

export function AnimateIcon({ children, animation = 'pointing', className = '', animateOnHover = true }: AnimateIconProps) {
  return (
    <motion.div
      className={className}
      whileHover={animateOnHover ? animationVariants[animation].hover : {}}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </motion.div>
  );
}

