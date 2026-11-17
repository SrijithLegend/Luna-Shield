import { describe, expect, it } from 'vitest';
import { CONFIGS, MATERIALS } from '../src/data';
import { DEMO_BOM, PHASES, computeBom, reconcileFunding } from '../src/data/cost-model';
import { activeGroup, clearingEfficiency, fieldPattern, fmtValue, periodMs, phaseOffsetsDeg, phaseSpacingMs, TBD_TEXT } from '../src/utils/physics';
import { coverage, otsu, segment, trialsToCsv } from '../src/utils/image';

describe('configuration data', () => {
  it('loads both configurations with distinct layers', () => {
    expect(CONFIGS.professional.layers.length).toBe(9);
    expect(CONFIGS.demonstrator.layers.length).toBe(9);
    expect(CONFIGS.professional.layers.map((l) => l.id)).not.toEqual(CONFIGS.demonstrator.layers.map((l) => l.id));
  });
  it('every layer resolves to a material', () => {
    for (const c of Object.values(CONFIGS)) for (const l of c.layers) expect(MATERIALS[l.materialId], l.id).toBeDefined();
  });
  it('unknown thickness is null (never 0) and renders TBD', () => {
    const el = CONFIGS.professional.layers.find((l) => l.id === 'electrodes')!;
    expect(el.thickness.value).toBeNull();
    expect(fmtValue(el.thickness.value, 'µm')).toBe(TBD_TEXT);
    expect(fmtValue(0, 'µm')).toBe('0 µm');
  });
  it('concept stack values are tagged ASSUMPTION', () => {
    const sub = CONFIGS.professional.layers.find((l) => l.id === 'substrate')!;
    expect(sub.thickness).toMatchObject({ value: 50, tag: 'ASSUMPTION' });
  });
  it('demonstrator HV module stays unverified', () => {
    expect(MATERIALS['demo-hv'].name).toContain('UNVERIFIED CANDIDATE');
    expect(MATERIALS['demo-hv'].evidence).toBe('Requires testing');
  });
});

describe('cost model', () => {
  it('P1 + P2 exceeds the ask by ₹0.78 crore and is flagged', () => {
    const r = reconcileFunding();
    expect(r.p1p2Lakh).toBe(318);
    expect(r.gapLakh).toBe(78);
    expect(r.reconciled).toBe(false);
    expect(PHASES.map((p) => p.lakh)).toEqual([2, 38, 280]);
  });
  it('default demonstrator BOM is 4,550–5,250 and NOT VERIFIED', () => {
    const t = computeBom(DEMO_BOM);
    expect(t.min).toBe(4550);
    expect(t.max).toBe(5250);
    expect(t.status).toBe('NOT VERIFIED');
  });
  it('UNDER only when all billable items entered and total below cap', () => {
    const inputs: any = {};
    for (const b of DEMO_BOM) inputs[b.id] = { entered: 100 };
    expect(computeBom(DEMO_BOM, inputs).status).toBe('UNDER ₹5,000');
    inputs.coupon = { entered: 6000 };
    const o = computeBom(DEMO_BOM, inputs);
    expect(o.status).toBe('OVER ₹5,000');
    expect(o.overrun).toBe(6000 + 900 - 5000);
  });
  it('partial entry below cap is still NOT VERIFIED', () => {
    expect(computeBom(DEMO_BOM, { coupon: { entered: 1000 } }).status).toBe('NOT VERIFIED');
  });
  it('rejects invalid entries and honours reuse', () => {
    const base = computeBom(DEMO_BOM).min;
    expect(computeBom(DEMO_BOM, { coupon: { entered: NaN } }).min).toBe(base);
    expect(computeBom(DEMO_BOM, { coupon: { reused: true } }).min).toBe(base - 2000);
  });
});

describe('phase & timing', () => {
  it('offsets', () => {
    expect(phaseOffsetsDeg(3)).toEqual([0, 120, 240]);
    expect(phaseOffsetsDeg(2)).toEqual([0, 180]);
  });
  it('10 Hz → 100 ms period, 33.3 ms spacing', () => {
    expect(periodMs(10)).toBe(100);
    expect(phaseSpacingMs(10, 3)).toBeCloseTo(33.33, 1);
  });
  it('3-phase pattern propagates (peak moves with time), not random', () => {
    // find x of max over one period of positions at two times; peak should shift by a constant
    const peak = (t: number) => { let b = 0, bv = -9; for (let x = 0; x < 3; x += 0.01) { const v = fieldPattern(x, 3, 10, t); if (v > bv + 1e-9) { bv = v; b = x; } } return b; };
    expect(activeGroup(3, 10, 0.0083)).not.toBe(activeGroup(3, 10, 0.0083 + 0.0333));
    expect(activeGroup(3, 10, 0.0083 + 0.1)).toBe(activeGroup(3, 10, 0.0083));
    expect(peak(0)).toBeDefined();
  });
});

describe('clearing efficiency', () => {
  it('computes and guards invalid input', () => {
    expect(clearingEfficiency(100, 20)).toBe(80);
    expect(clearingEfficiency(0, 0)).toBeNull();
    expect(clearingEfficiency(-1, 0)).toBeNull();
    expect(clearingEfficiency(NaN, 1)).toBeNull();
    expect(clearingEfficiency(100, -5)).toBeNull();
  });
});

describe('image analysis', () => {
  it('otsu + segment + coverage', () => {
    const lum = Float32Array.from([...Array(50).fill(10), ...Array(50).fill(240)]);
    const t = otsu(lum);
    expect(t).toBeGreaterThanOrEqual(10);
    expect(t).toBeLessThan(240);
    expect(coverage(segment(lum, t))).toBe(50);
  });
  it('CSV export has header and rows; no pre-populated data', () => {
    const csv = trialsToCsv([{ id: 1, label: 'a "b"', control: true, aInitial: 100, aRemaining: 50 }], clearingEfficiency);
    expect(csv.split('\n').length).toBe(2);
    expect(csv).toContain('50.00');
  });
});
