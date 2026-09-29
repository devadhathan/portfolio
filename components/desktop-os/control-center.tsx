'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useDesktopOs } from '@/components/desktop-os/desktop-os-provider';
import { allThemes } from '@/contexts/theme-context';
import { WALLPAPER_PRESETS, type WallpaperId } from '@/lib/desktop-os';
import { playAfterActivation } from '@/lib/sound';
import { trackEvent } from '@/lib/analytics';
import { cn, focusRing } from '@/lib/utils';

/** Appearance is the theme set, plus Auto for the system preference. */
const AUTO_THEME = { id: 'system', name: 'Auto', icon: Monitor, color: null } as const;
const APPEARANCE_OPTIONS = [AUTO_THEME, ...allThemes];

/** Small switch — rows in this panel are the only caller. */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-label={label}
      data-cuelume-toggle
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[18px] w-[30px] shrink-0 rounded-full border transition-colors duration-200',
        focusRing,
        checked
          ? 'border-primary/40 bg-primary'
          : 'border-foreground/15 bg-foreground/10 hover:bg-foreground/[0.16]',
      )}
    >
      {/*
        --primary is near-white in dark mode, so a white knob on a checked
        track vanished into a solid white pill. Pair the knob with the track:
        primary-foreground when on, plain foreground when off.
      */}
      <span
        className={cn(
          'absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full shadow-sm transition-[left,background-color] duration-200 ease-out',
          checked ? 'left-[14px] bg-primary-foreground' : 'left-[2px] bg-foreground/70',
        )}
      />
    </button>
  );
}

function SettingRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-[7px]">
      <span className="text-[13px] text-foreground/90">{label}</span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function VolumeRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}) {
  const id = useId();

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 py-[7px]',
        disabled && 'pointer-events-none opacity-45',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-foreground/90">
          {label}
        </label>
        <span className="tabular-nums text-[11px] text-foreground/50">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => {
          const level = Number((e.target as HTMLInputElement).value);
          playAfterActivation('tick', { volume: 0.35 * (level / 100) });
        }}
        className="os-volume-slider w-full"
        style={{ '--os-volume-fill': `${value}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * Menu-extra control panel: wallpaper, appearance, motion and sound.
 * Opens on click, applies instantly, closes on outside click / Escape /
 * picking a wallpaper — never on a toggle, so both can be tried at once.
 */
export function ControlCenter({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelId = useId();
  const {
    isNarrow,
    wallpaperId,
    setWallpaperId,
    shuffleDaily,
    setShuffleDaily,
    soundsEnabled,
    setSoundsEnabled,
    soundVolume,
    setSoundVolumeLevel,
  } = useDesktopOs();
  const { theme, setTheme } = useTheme();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  /** The panel swaps between its main rows and the wallpaper picker in place. */
  const [view, setView] = useState<'main' | 'wallpaper'>('main');
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  /** Sheet wherever the OS is in its narrow layout — phone and tablet alike. */
  const isSheet = isNarrow;

  const activeWallpaper = useMemo(
    () => WALLPAPER_PRESETS.find((preset) => preset.id === wallpaperId) ?? WALLPAPER_PRESETS[0],
    [wallpaperId],
  );
  const activeTheme = theme ?? 'dark';

  const close = useCallback(
    (returnFocus = true) => {
      onOpenChange(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [onOpenChange],
  );

  useEffect(() => setMounted(true), []);

  // Reopening always starts on the main pane.
  useEffect(() => {
    if (!open) setView('main');
  }, [open]);

  /*
   * The panel is portalled to <body>. The menubar carries a backdrop-filter,
   * which makes it the containing block for fixed descendants — the bottom
   * sheet anchored to the 44px bar instead of the viewport. Portalling escapes
   * that, so the panel is positioned from the trigger's measured rect.
   */
  useLayoutEffect(() => {
    if (!open || isSheet) return;
    const measure = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAnchor({
        top: Math.round(rect.bottom + 8),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, isSheet]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  // Focus the wallpaper picker when the panel opens. Keyed on `open` alone —
  // re-running would yank focus back out of whatever row the user tabbed to.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => pickerButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Moving between panes carries focus with it, so the keyboard doesn't get
  // stranded on a button that just unmounted.
  const enteredRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    if (view === 'wallpaper') {
      enteredRef.current = true;
      const frame = requestAnimationFrame(() => backButtonRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    if (!enteredRef.current) return;
    enteredRef.current = false;
    const frame = requestAnimationFrame(() => pickerButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, view]);

  const pickWallpaper = (id: WallpaperId) => {
    trackEvent('wallpaper_changed', { wallpaper: id });
    setWallpaperId(id);
    setView('main');
    close();
  };

  /**
   * Colour crossfade, deliberately not a View Transition. A VT paints the page
   * into snapshots for the duration, and elements with `backdrop-filter` lose
   * their live backdrop while that is up — every glass surface visibly drops
   * its blur and pops back. A plain colour transition leaves compositing alone.
   */
  const pickAppearance = (next: string) => {
    trackEvent('theme_changed', { theme: next });
    const root = document.documentElement;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-crossfade');
      window.setTimeout(() => root.classList.remove('theme-crossfade'), 200);
    }
    setTheme(next);
  };

  return (
    <div className="relative flex items-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Control centre"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-cuelume-hover="tick"
        data-cuelume-press
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex h-8 items-center justify-center rounded-md px-2 text-current transition-colors duration-200',
          focusRing,
          open ? 'bg-white/[0.14]' : 'opacity-80 hover:bg-white/[0.08] hover:opacity-100',
        )}
      >
        {/* SF-style switches glyph, masked so it takes the menubar's colour */}
        <span aria-hidden className="os-control-glyph" />
      </button>

      {open && mounted
        ? createPortal(
        <>
        {isSheet ? (
          <div
            aria-hidden
            className="os-sheet-scrim fixed inset-0 z-[205] bg-black/45"
            onClick={() => close(false)}
          />
        ) : null}
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label="Control centre"
          style={
            isSheet
              ? undefined
              : { top: anchor?.top ?? 52, right: anchor?.right ?? 12 }
          }
          className={cn(
            'os-control-panel fixed z-[210]',
            isSheet
              ? 'os-sheet-in inset-x-0 bottom-0 flex max-h-[50dvh] w-full flex-col rounded-b-none rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
              : 'w-[280px] rounded-xl px-3 pb-3',
          )}
        >
          {isSheet ? (
            <div className="flex shrink-0 justify-center pb-1 pt-2.5" aria-hidden>
              <span className="h-1 w-9 rounded-full bg-foreground/25" />
            </div>
          ) : null}
          <div
            className={cn(
              isSheet && 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            )}
          >
          {view === 'wallpaper' ? (
            /*
              Same panel, same position — the main rows step aside for the
              picker rather than pushing a list into them. The thumbnails only
              exist while this pane is up.
            */
            <div className="os-control-pane">
              <div className="flex items-center gap-1.5 px-1 pb-1 pt-3">
                <button
                  ref={backButtonRef}
                  type="button"
                  aria-label="Back to control centre"
                  data-cuelume-hover="tick"
                  data-cuelume-press
                  onClick={() => setView('main')}
                  className={cn('os-control-back', focusRing)}
                >
                  <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
                </button>
                <h2 className="text-[11px] uppercase tracking-[0.08em] text-foreground/60">
                  Wallpaper
                </h2>
              </div>

              <div className="os-wallpaper-list" role="menu" aria-label="Wallpapers">
                {WALLPAPER_PRESETS.map((preset) => {
                  const active = preset.id === wallpaperId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      data-cuelume-hover="tick"
                      data-cuelume-press
                      onClick={() => pickWallpaper(preset.id)}
                      className={cn(
                        'os-wallpaper-row',
                        active && 'os-wallpaper-row--active',
                        focusRing,
                      )}
                    >
                      <span
                        aria-hidden
                        className="os-wallpaper-swatch"
                        style={{ background: preset.background }}
                      />
                      <span className="min-w-0 flex-1 truncate text-left">{preset.label}</span>
                      {active ? (
                        <Check aria-hidden className="h-3 w-3 shrink-0" strokeWidth={3} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
          <>
          {/* Section 1 — Wallpaper */}
          <section>
            <h2 className="px-1 pt-3 text-[11px] uppercase tracking-[0.08em] text-foreground/60">
              Wallpaper
            </h2>
            <div className="mt-2 px-1">
              <button
                ref={pickerButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-label={`Wallpaper: ${activeWallpaper.label}`}
                data-cuelume-hover="tick"
                data-cuelume-press
                onClick={() => setView('wallpaper')}
                className={cn('os-wallpaper-trigger', focusRing)}
              >
                <span
                  aria-hidden
                  className="os-wallpaper-swatch"
                  style={{ background: activeWallpaper.background }}
                />
                <span className="min-w-0 flex-1 truncate text-left">{activeWallpaper.label}</span>
                <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-foreground/55" />
              </button>
            </div>

            <div className="px-1">
              <SettingRow label="Shuffle daily" checked={shuffleDaily} onChange={setShuffleDaily} />
            </div>
          </section>

          <div className="os-control-divider" />

          {/* Section 2 — Appearance */}
          <section>
            <h2 className="px-1 pt-3 text-[11px] uppercase tracking-[0.08em] text-foreground/60">
              Appearance
            </h2>
            <div className="mt-2 flex w-full rounded-[6px] bg-white/[0.07] p-[2px]">
              {APPEARANCE_OPTIONS.map((option) => {
                const active = activeTheme === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    aria-label={option.name}
                    title={option.name}
                    data-cuelume-hover="tick"
                    data-cuelume-press
                    onClick={() => pickAppearance(option.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center rounded-[4px] py-1.5 transition-colors duration-200',
                      focusRing,
                      active
                        ? 'bg-white/[0.16] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]'
                        : 'text-foreground/70 hover:text-foreground',
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <span
                        aria-hidden
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: option.color ?? 'currentColor' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="px-1 pt-1.5 text-[11px] text-foreground/50">
              {activeTheme === 'system'
                ? 'Following your system'
                : (APPEARANCE_OPTIONS.find((option) => option.id === activeTheme)?.name ?? 'Dark')}
            </p>
          </section>

          <div className="os-control-divider" />

          {/* Section 3 — Sound */}
          <section className="px-1 pb-1">
            <h2 className="pt-3 text-[11px] uppercase tracking-[0.08em] text-foreground/60">
              Sound
            </h2>
            <div className="mt-1">
              <SettingRow
                label="Interface sounds"
                checked={soundsEnabled}
                onChange={setSoundsEnabled}
              />
              <VolumeRow
                label="Volume"
                value={soundVolume}
                disabled={!soundsEnabled}
                onChange={setSoundVolumeLevel}
              />
            </div>
          </section>
          </>
          )}
          </div>
        </div>
        </>,
        document.body,
      )
        : null}
    </div>
  );
}
