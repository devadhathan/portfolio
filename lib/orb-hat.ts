'use client';

import { useCallback, useEffect, useState } from 'react';

export const ORB_HAT_STORAGE_KEY = 'portfolio:orb-hat-emoji';
/** @deprecated migrated to ORB_HAT_STORAGE_KEY */
const LEGACY_FACE_KEY = 'portfolio:orb-face-emoji';
export const ORB_HAT_EVENT = 'portfolio:orb-hat';

export const ORB_HAT_PRESETS = [
  '🎩',
  '🧢',
  '👑',
  '👒',
  '🎓',
  '⛑️',
  '🤠',
  '🎄',
  '🎃',
  '🪖',
  '👮',
  '🧙',
  '🎅',
  '🎀',
  '🕶️',
  '🎧',
] as const;

function readStoredHat(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ORB_HAT_STORAGE_KEY) ?? localStorage.getItem(LEGACY_FACE_KEY);
    const trimmed = raw?.trim() ?? '';
    return trimmed || null;
  } catch {
    return null;
  }
}

export function getOrbHatEmoji(): string | null {
  return readStoredHat();
}

export function setOrbHatEmoji(emoji: string | null) {
  if (typeof window === 'undefined') return;
  const next = emoji?.trim() || null;
  try {
    if (next) {
      localStorage.setItem(ORB_HAT_STORAGE_KEY, next);
      localStorage.removeItem(LEGACY_FACE_KEY);
    } else {
      localStorage.removeItem(ORB_HAT_STORAGE_KEY);
      localStorage.removeItem(LEGACY_FACE_KEY);
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(ORB_HAT_EVENT, { detail: next }));
}

/** First grapheme cluster so multi-codepoint emoji still works as one hat. */
export function normalizeOrbHatEmoji(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const chars = Array.from(trimmed);
  return chars[0] ?? null;
}

export function useOrbHatEmoji() {
  const [hat, setHat] = useState<string | null>(null);

  useEffect(() => {
    setHat(readStoredHat());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail;
      setHat(detail ?? readStoredHat());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORB_HAT_STORAGE_KEY || event.key === LEGACY_FACE_KEY) {
        setHat(readStoredHat());
      }
    };
    window.addEventListener(ORB_HAT_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ORB_HAT_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const update = useCallback((emoji: string | null) => {
    const next = emoji ? normalizeOrbHatEmoji(emoji) : null;
    setOrbHatEmoji(next);
    setHat(next);
  }, []);

  return [hat, update] as const;
}

/** @deprecated use useOrbHatEmoji */
export const useOrbFaceEmoji = useOrbHatEmoji;
