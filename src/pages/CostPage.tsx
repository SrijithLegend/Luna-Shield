import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BUDGET_CAP_INR, COST_ASSUMPTIONS, DEMO_BOM, PHASES, PROPOSED_ASK_LAKH, computeBom, formatLakh, reconcileFunding, type BomInput, type PhaseCost, type PriceStatus } from '../data/cost-model';
import { Notice, Section, Tag } from '../components/ui';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const STATUSES: PriceStatus[] = ['estimate', 'quote', 'actual'];

export function PhaseCosts() {
  const [planning, setPlanning] = useState(false);
  const [phases, setPhases] = useState<PhaseCost[]>(PHASES);
  const [ask, setAsk] = useState(PROPOSED_ASK_LAKH);
  const [contingency, setContingency] = useState<string>('');
  const rec = reconcileFunding(phases, ask);
  const edited = phases.some((p, i) => p.lakh !== PHASES[i].lakh) || ask !== PROPOSED_ASK_LAKH;
  return (
    <Section title="Professional LunaShield — phase cost planning" right={<label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={planning} onChange={(e) => setPlanning(e.target.checked)} />Planning mode (edit)</label>}>
      <div role="alert" className={`mb-4 flex gap-3 rounded-md border p-3 ${rec.reconciled ? 'border-green/50 bg-green/5' : 'border-red/60 bg-red/10'}`}>
        <AlertTriangle className={rec.reconciled ? 'text-green' : 'text-red'} size={20} />
        <div className="text-[13px] leading-snug">
          <p className="font-semibold">{rec.reconciled ? 'P1 + P2 fits within the proposed ask.' : `Funding mismatch: P1 + P2 = ${formatLakh(rec.p1p2Lakh)} exceeds the proposed ask of ${formatLakh(rec.askLakh)} by ${formatLakh(rec.gapLakh)}.`}</p>
          {!rec.reconciled && <p className="mt-1 text-text/80">A founder-approved explanation is required: what the ask funds, what is deferred, and what is expected from grants, partners or follow-on capital. The numbers are intentionally not adjusted to add up.</p>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px]">
          <caption className="sr-only">Phase cost planning estimates in lakh rupees</caption>
          <thead><tr className="text-left text-mute"><th className="py-2">Phase</th><th>Planning estimate</th><th>Scope</th><th>Status</th></tr></thead>
          <tbody>
            {phases.map((p, i) => (
              <tr key={p.id} className="border-t border-line align-top">
                <td className="py-2 font-semibold">{p.phase}</td>
                <td className="w-52 py-2 pr-3">
                  {planning ? <span className="flex items-center gap-1"><span>₹</span><input aria-label={`${p.phase} lakh`} type="number" min={0} value={p.lakh} onChange={(e) => setPhases(phases.map((q, j) => (j === i ? { ...q, lakh: Math.max(0, +e.target.value || 0) } : q)))} /><span className="text-[11px] text-mute">lakh</span></span> : <b>{formatLakh(p.lakh)}</b>}
                  {planning && <span className="mt-1 block text-[10.5px] text-amber">user-entered planning assumption</span>}
                </td>
                <td className="py-2 pr-3">{p.scope}</td>
                <td className="py-2">
                  {planning ? <select aria-label={`${p.phase} status`} value={p.status} onChange={(e) => setPhases(phases.map((q, j) => (j === i ? { ...q, status: e.target.value as PriceStatus } : q)))}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select> : <span className="badge b-amber">{p.status}</span>}
                </td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-2 font-semibold">Ask</td>
              <td className="py-2 pr-3">{planning ? <span className="flex items-center gap-1"><span>₹</span><input aria-label="Proposed ask lakh" type="number" min={0} value={ask} onChange={(e) => setAsk(Math.max(0, +e.target.value || 0))} /><span className="text-[11px] text-mute">lakh</span></span> : <b>{formatLakh(ask)}</b>}</td>
              <td className="py-2 pr-3">Current proposed 18-month financing target; exact allocation must be reconciled</td>
              <td className="py-2"><span className="badge b-amber">proposal</span></td>
            </tr>
            <tr className="border-t border-line"><td className="py-2 font-semibold">Contingency</td><td className="py-2 pr-3"><input aria-label="Contingency (only when provided)" placeholder="not provided" value={contingency} onChange={(e) => setContingency(e.target.value)} disabled={!planning} /></td><td className="py-2 text-mute" colSpan={2}>Shown only when provided. {contingency && <span className="text-amber">user-entered planning assumption</span>}</td></tr>
          </tbody>
        </table>
      </div>
      {edited && <p className="mt-2 text-[12px] text-amber">Values edited — all edits are user-entered planning assumptions, not supplier quotes.</p>}
      <p className="mt-2 text-[11.5px] text-mute">Status per line: estimate / quote / actual. No supplier quotes or customer revenue are represented.</p>
    </Section>
  );
}

export function BomCalculator() {
  const [inputs, setInputs] = useState<Record<string, BomInput>>({});
  const [adapter, setAdapter] = useState(false);
  const items = useMemo(() => (adapter ? [...DEMO_BOM, { id: 'adapter', item: '12 V adapter (add only if you do not already have one)', min: 0, max: 0, note: 'Enter a quote' }] : DEMO_BOM), [adapter]);
  const t = computeBom(items, inputs);
  const set = (id: string, p: BomInput) => setInputs((s) => ({ ...s, [id]: { ...s[id], ...p } }));
  const tone = t.status === 'UNDER ₹5,000' ? 'border-green/60 bg-green/10 text-green' : t.status === 'OVER ₹5,000' ? 'border-red/60 bg-red/10 text-red' : 'border-amber/60 bg-amber/10 text-amber';
  const entered = Object.values(inputs).filter((i) => typeof i.entered === 'number').length;
  return (
    <Section title="Demonstrator budget calculator (target < ₹5,000 — not a verified quote)">
      <div className={`mb-4 rounded-md border p-3 ${tone}`} role="status" aria-live="polite">
        <p className="text-[11px] font-bold uppercase tracking-widest">{t.status}</p>
        <p className="text-xl font-bold">{t.min === t.max ? inr(t.min) : `${inr(t.min)} – ${inr(t.max)}`}</p>
        {t.status === 'OVER ₹5,000' && <p className="text-[13px]">Overrun: at least {inr(t.overrun)} above the {inr(BUDGET_CAP_INR)} target.</p>}
        {t.status === 'NOT VERIFIED' && <p className="text-[13px]">Not yet verified under {inr(BUDGET_CAP_INR)}. {t.max > BUDGET_CAP_INR ? `The upper planning range exceeds the cap by ${inr(t.max - BUDGET_CAP_INR)}. ` : ''}Status becomes UNDER only when every non-reused item has an entered quote/actual and the total is below the cap. ({entered} entered)</p>}
        {t.status === 'UNDER ₹5,000' && <p className="text-[13px]">Entered values total below the target. Candidate HV modules remain unverified.</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px]">
          <caption className="sr-only">Demonstrator bill of materials with planning amounts and editable entered values</caption>
          <thead><tr className="text-left text-mute"><th className="py-2">Item</th><th>Planning amount</th><th>Reuse (₹0)</th><th className="w-36">Entered quote / actual (₹)</th><th>Note</th></tr></thead>
          <tbody>
            {items.map((b) => {
              const inp = inputs[b.id] ?? {};
              return (
                <tr key={b.id} className={`border-t border-line align-top ${inp.reused ? 'opacity-50' : ''}`}>
                  <td className="py-2 pr-3">{b.item}{b.id === 'hv' && <span className="ml-2 badge b-red">UNVERIFIED CANDIDATE</span>}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{b.min === b.max ? inr(b.min) : `${inr(b.min)}–${inr(b.max)}`} <span className="badge b-amber ml-1">estimate</span></td>
                  <td className="py-2 pr-3"><input type="checkbox" aria-label={`Reuse ${b.item}`} checked={!!inp.reused} onChange={(e) => set(b.id, { reused: e.target.checked })} /></td>
                  <td className="py-2 pr-3"><input type="number" min={0} aria-label={`Entered value for ${b.item}`} value={inp.entered ?? ''} disabled={inp.reused} onChange={(e) => set(b.id, { entered: e.target.value === '' ? null : +e.target.value })} />{typeof inp.entered === 'number' && <span className="mt-0.5 block text-[10.5px] text-amber">user-entered planning assumption</span>}</td>
                  <td className="py-2 text-mute">{b.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px]">
        <label className="flex items-center gap-2"><input type="checkbox" checked={adapter} onChange={(e) => setAdapter(e.target.checked)} />I need to buy a 12 V adapter</label>
        <button className="btn !py-1" onClick={() => setInputs({})}>Reset to planning defaults</button>
      </div>
      <details className="card mt-4 p-3 text-[13px]" open>
        <summary className="cursor-pointer font-semibold">Assumptions</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">{COST_ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
      </details>
    </Section>
  );
}

export function BusinessCase() {
  return (
    <Section title="Business case (market assumptions)">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-4 text-[13px]">
          <p className="lbl mb-1">Proposed customer surfaces <Tag tag="ASSUMPTION" /></p>
          <ul className="list-disc space-y-1 pl-5"><li>Thermal radiators</li><li>Optical windows and camera covers</li><li>Solar-array surfaces</li></ul>
        </div>
        <div className="card p-4 text-[13px]">
          <p className="lbl mb-1">Integration model <Tag tag="ASSUMPTION" /></p>
          <p>Flexible film retrofit or integrated at build, plus driver electronics and a mission interface. Final stack and drive scheme chosen per host surface and mission.</p>
        </div>
        <div className="card p-4 text-[13px]">
          <p className="lbl mb-1">Terrestrial solar-panel cleaning as a bridge market <Tag tag="UNVERIFIED" /></p>
          <p>A hypothesis only. No market sizing or customer evidence is represented here.</p>
        </div>
        <div className="card p-4 text-[13px]">
          <p className="lbl mb-1">Differentiation <Tag tag="FOUNDER ESTIMATE" /></p>
          <p>EDS is not a LunaShield invention, and flexible EDS research already exists. The proposed differentiation — a durable, manufacturable, integrator-ready flexible system — is a development thesis, not a proven moat. No customer revenue or supplier quotes are represented.</p>
        </div>
      </div>
    </Section>
  );
}

export default function CostPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Cost &amp; BOM</h1>
      <p className="mb-5 max-w-3xl text-mute">All figures are planning estimates — not supplier quotes, not actuals.</p>
      <PhaseCosts />
      <BomCalculator />
      <BusinessCase />
      <Notice>Contingency for P0–P2 is shown only if provided. This page never makes the numbers add up silently.</Notice>
    </div>
  );
}
