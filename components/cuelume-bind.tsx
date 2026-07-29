'use client';

import { useEffect } from 'react';
import { bind } from 'cuelume';

/** One-time cuelume bind for declarative data-cuelume-* attributes. */
export function CuelumeBind() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
