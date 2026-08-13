import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Shared keyboard focus ring for OS menubar and chrome controls. */
export const focusRing =
  'focus-visible:outline-none focus-visible:!ring-2 focus-visible:!ring-offset-0 focus-visible:!ring-white/90 light:focus-visible:!ring-foreground/45'
