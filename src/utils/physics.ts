/** Conceptual travelling-field helpers. Qualitative only — not a field solver. */

export type PhaseMode = 1 | 2 | 3;

/** Phase offsets (degrees) for the electrode groups in a given phase mode. 1-phase: one group; 2-phase: 0/180; 3-phase: 0/120/240. */
export function phaseOffsetsDeg(mode: PhaseMode): number[] {
  if (mode === 1) return [0];
  if (mode === 2) return [0, 180];
  return [0, 120, 240];
}

export const periodMs = (hz: number) => (hz > 0 && Number.isFinite(hz) ? 1000 / hz : NaN);

/** Time spacing between adjacent phases, ms. 10 Hz, 3-phase → ~33.3 ms. */
export function phaseSpacingMs(hz: number, mode: PhaseMode): number {
  const offs = phaseOffsetsDeg(mode);
  if (offs.length < 2) return 0;
  return periodMs(hz) * (offs[1] - offs[0]) / 360;
}

/**
 * Normalised drive level [-1,1] of electrode group `g` at time `tSec`.
 * Square-wave-like (smoothed) so the display resembles a switched drive. Illustrative only.
 */
export function groupDrive(g: number, mode: PhaseMode, hz: number, tSec: number): number {
  const off = phaseOffsetsDeg(mode)[g];
  if (off === undefined) return 0;
  const ph = 2 * Math.PI * (hz * tSec - off / 360);
  return Math.tanh(4 * Math.sin(ph));
}

/**
 * Illustrative field-envelope at surface position x (in electrode-group units; one group-triplet = mode-count units).
 * For 3-phase this is a wave travelling along +x; for 1/2-phase it is a standing (non-travelling) pattern.
 * Returns [-1,1].
 */
export function fieldPattern(x: number, mode: PhaseMode, hz: number, tSec: number): number {
  const n = phaseOffsetsDeg(mode).length;
  const g = ((Math.floor(x) % n) + n) % n;
  return groupDrive(g, mode, hz, tSec);
}

/** Index of the electrode group that is currently the "leading" (max-drive) group, for highlighting. */
export function activeGroup(mode: PhaseMode, hz: number, tSec: number): number {
  const n = phaseOffsetsDeg(mode).length;
  let best = 0, bv = -Infinity;
  for (let g = 0; g < n; g++) { const v = groupDrive(g, mode, hz, tSec); if (v > bv) { bv = v; best = g; } }
  return best;
}

/** Clearing efficiency η = (Ai - Ar)/Ai × 100. Returns null for invalid input. */
export function clearingEfficiency(aInitial: number, aRemaining: number): number | null {
  if (![aInitial, aRemaining].every(Number.isFinite) || aInitial <= 0 || aRemaining < 0) return null;
  return ((aInitial - aRemaining) / aInitial) * 100;
}

/** Render unknown values as TBD, never 0. */
export const TBD_TEXT = 'TBD — requires measurement / supplier confirmation';
export function fmtValue(v: number | null | undefined, unit = ''): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return TBD_TEXT;
  return `${v}${unit ? ' ' + unit : ''}`;
}

/** Deterministic PRNG (mulberry32) for repeatable scenes. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
