/**
 * Dock ↔ wallpaper coordination without React.
 * While the magnification wave is active, heavy background loops (bridge water)
 * pause so Chrome can spend the frame on the dock — wave look stays identical.
 */

type Listener = (busy: boolean) => void;

let busy = false;
const listeners = new Set<Listener>();

export function isDockInteractionBusy(): boolean {
  return busy;
}

export function setDockInteractionBusy(next: boolean): void {
  if (busy === next) return;
  busy = next;
  if (typeof document !== 'undefined') {
    if (next) document.documentElement.dataset.osDockBusy = '1';
    else delete document.documentElement.dataset.osDockBusy;
  }
  listeners.forEach((listener) => listener(next));
}

export function subscribeDockInteractionBusy(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
