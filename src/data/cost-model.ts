export type PriceStatus = 'estimate' | 'quote' | 'actual';

export interface PhaseCost {
  id: string;
  phase: string;
  /** ₹ lakh (1 lakh = 100,000). */
  lakh: number;
  scope: string;
  status: PriceStatus;
}

/** Founder planning figures — NOT supplier quotes. */
export const PHASES: PhaseCost[] = [
  { id: 'P0', phase: 'P0', lakh: 2, status: 'estimate', scope: 'Benchtop proof of principle, coupon fabrication, test access and measurements' },
  { id: 'P1', phase: 'P1', lakh: 38, status: 'estimate', scope: 'Flexible coupon development, thermal-vacuum/UV/bend/adhesion testing, early TRL development' },
  { id: 'P2', phase: 'P2', lakh: 280, status: 'estimate', scope: 'Flight-oriented engineering and hosted-payload / integration / qualification activities' },
];

/** Proposed 18-month financing target (₹ lakh = ₹2.4 crore). */
export const PROPOSED_ASK_LAKH = 240;

export interface FundingReconciliation {
  p1p2Lakh: number;
  askLakh: number;
  /** positive = P1+P2 exceeds the ask */
  gapLakh: number;
  reconciled: boolean;
}

export function reconcileFunding(phases: PhaseCost[] = PHASES, askLakh = PROPOSED_ASK_LAKH): FundingReconciliation {
  const p1p2Lakh = phases.filter((p) => p.id === 'P1' || p.id === 'P2').reduce((s, p) => s + p.lakh, 0);
  const gapLakh = p1p2Lakh - askLakh;
  return { p1p2Lakh, askLakh, gapLakh, reconciled: gapLakh <= 0 };
}

export const lakhToCrore = (lakh: number) => lakh / 100;
export const formatLakh = (lakh: number) => (lakh >= 100 ? `₹${(lakh / 100).toFixed(2)} crore` : `₹${lakh} lakh`);

// ---------------- Demonstrator BOM ----------------

export const BUDGET_CAP_INR = 5000;

export interface BomItem {
  id: string;
  item: string;
  min: number;
  max: number;
  note: string;
  /** Existing item that can be reused at ₹0 incremental cost */
  reusable?: boolean;
}

export const DEMO_BOM: BomItem[] = [
  { id: 'coupon', item: '100 × 100 mm flexible polyimide flex-PCB coupon', min: 2000, max: 2200, note: 'Quote required; specify copper pattern and dielectric construction' },
  { id: 'hv', item: 'Three candidate 12 V negative-ion generator modules', min: 1350, max: 1350, note: '₹450 per listed unit; not yet approved for EDS use' },
  { id: 'arduino', item: 'Arduino Uno R3', min: 0, max: 0, note: 'Reuse existing board (₹0 incremental)', reusable: true },
  { id: 'lv', item: 'Low-voltage opto-isolated control components / connectors', min: 200, max: 300, note: 'Estimate; depends on module enable behaviour' },
  { id: 'enclosure', item: 'Clear test enclosure', min: 200, max: 350, note: 'Estimate; must contain particles' },
  { id: 'hygro', item: 'Small hygrometer', min: 150, max: 200, note: 'Estimate' },
  { id: 'desiccant', item: 'Desiccant', min: 100, max: 100, note: 'Estimate; only if needed' },
  { id: 'particles', item: 'Characterized glass microspheres / safe test particles', min: 150, max: 250, note: 'Supplier/SDS required; do not use uncharacterized fly ash' },
  { id: 'misc', item: 'Wires, mounting, fasteners, LED lighting', min: 200, max: 300, note: 'Estimate' },
  { id: 'contingency', item: 'Contingency', min: 200, max: 200, note: 'Estimate' },
];

export interface BomInput {
  /** user-entered quote/actual; overrides the planning range */
  entered?: number | null;
  /** treat as already owned (₹0) */
  reused?: boolean;
}

export type BudgetStatus = 'UNDER ₹5,000' | 'OVER ₹5,000' | 'NOT VERIFIED';

export interface BomTotals {
  min: number;
  max: number;
  /** true only when every non-reused item has a user-entered value */
  allEntered: boolean;
  status: BudgetStatus;
  /** amount above cap (only when status is OVER, based on min when partial) */
  overrun: number;
}

const valid = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;

/**
 * Total the BOM. Status is UNDER only when all billable items carry user-entered values
 * whose sum is below the cap. If even the minimum exceeds the cap, status is OVER.
 */
export function computeBom(items: BomItem[], inputs: Record<string, BomInput> = {}, cap = BUDGET_CAP_INR): BomTotals {
  let min = 0, max = 0, allEntered = true;
  for (const it of items) {
    const inp = inputs[it.id] ?? {};
    if (inp.reused) continue;
    if (valid(inp.entered)) { min += inp.entered; max += inp.entered; continue; }
    min += it.min; max += it.max;
    if (!(it.min === 0 && it.max === 0)) allEntered = false;
  }
  let status: BudgetStatus = 'NOT VERIFIED';
  if (min > cap) status = 'OVER ₹5,000';
  else if (allEntered && max < cap) status = 'UNDER ₹5,000';
  return { min, max, allEntered, status, overrun: Math.max(0, min - cap) };
}

export const COST_ASSUMPTIONS = [
  'All figures are founder planning estimates, not supplier quotes or actuals.',
  'Existing Arduino Uno and existing computer/phone are reused at ₹0 incremental cost.',
  'A 12 V adapter is assumed to be available; if it must be purchased, add it.',
  'Candidate HV modules are unverified and may need replacement by a lab driver, which could exceed the ₹5,000 cap.',
  'No contingency is shown for P0–P2 phases because none has been provided.',
  'The ₹5,000 figure is a budget target, not a verified procurement quote.',
];
