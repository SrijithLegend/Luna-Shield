/** Image-analysis helpers. Thresholding gives AREA coverage, not mass; biased by lighting, shadows and particle overlap. */

export interface Roi { x: number; y: number; w: number; h: number }

/** Luminance 0..255 */
export const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Normalise brightness/contrast consistently: stretch ROI luminance to 0..255 using 1st/99th percentiles.
 * Returns luminance array for the ROI.
 */
export function roiLuma(data: Uint8ClampedArray, width: number, roi: Roi): Float32Array {
  const out = new Float32Array(roi.w * roi.h);
  for (let y = 0; y < roi.h; y++)
    for (let x = 0; x < roi.w; x++) {
      const i = ((roi.y + y) * width + (roi.x + x)) * 4;
      out[y * roi.w + x] = luma(data[i], data[i + 1], data[i + 2]);
    }
  const sorted = Float32Array.from(out).sort();
  const lo = sorted[Math.floor(sorted.length * 0.01)] ?? 0;
  const hi = sorted[Math.floor(sorted.length * 0.99)] ?? 255;
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < out.length; i++) out[i] = Math.min(255, Math.max(0, ((out[i] - lo) / span) * 255));
  return out;
}

/** Segment: particle = brighter than threshold (light particles on dark substrate) or darker (invert). */
export function segment(lum: Float32Array, threshold: number, particlesBrighter = true): Uint8Array {
  const m = new Uint8Array(lum.length);
  for (let i = 0; i < lum.length; i++) m[i] = (particlesBrighter ? lum[i] > threshold : lum[i] < threshold) ? 1 : 0;
  return m;
}

/** Fraction of pixels flagged as particle, as an area (pixel count). */
export const coverage = (mask: Uint8Array) => mask.reduce((s, v) => s + v, 0);

/** Otsu threshold on normalised luminance — a starting point only; the user can override. */
export function otsu(lum: Float32Array): number {
  const hist = new Array(256).fill(0);
  for (const v of lum) hist[Math.min(255, Math.max(0, Math.round(v)))]++;
  const total = lum.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, bestT = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const between = wB * wF * (sumB / wB - (sum - sumB) / wF) ** 2;
    if (between > best) { best = between; bestT = t; }
  }
  return bestT;
}

export interface Trial {
  id: number;
  label: string;
  control: boolean;
  aInitial: number;
  aRemaining: number;
  humidityPct?: number;
  tempC?: number;
  timeToClearS?: number;
  inputPowerW?: number;
  notes?: string;
}

export function trialsToCsv(trials: Trial[], eff: (a: number, b: number) => number | null): string {
  const head = ['id', 'label', 'control', 'A_initial_px', 'A_remaining_px', 'clearing_efficiency_pct', 'humidity_pct', 'temp_C', 'time_to_clear_s', 'input_power_W_measured', 'notes'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = trials.map((t) => [t.id, t.label, t.control, t.aInitial, t.aRemaining, eff(t.aInitial, t.aRemaining)?.toFixed(2) ?? '', t.humidityPct ?? '', t.tempC ?? '', t.timeToClearS ?? '', t.inputPowerW ?? '', t.notes ?? ''].map(esc).join(','));
  return [head.join(','), ...rows].join('\n');
}
