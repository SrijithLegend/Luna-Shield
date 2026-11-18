import { lazy, Suspense, useMemo } from 'react';
import { CONFIGS, MATERIALS } from '../data';
import { DEMO_BOM, computeBom, formatLakh, PHASES } from '../data/cost-model';
import { Notice, SimNotice } from '../components/ui';
import { PlayBar } from '../components/controls/SimControls';
import { StaticFallback } from '../components/layout/Fallback';
import { hasWebGL } from '../components/layout/Stage';

const Mini = lazy(() => import('../three/Experience').then((m) => ({ default: m.MiniExperience })));

const ROWS: { k: string; pro: string; demo: string }[] = [
  { k: 'Purpose', pro: 'Proposed flexible, large-area EDS for radiators, optical windows, camera covers and solar surfaces.', demo: 'Small low-cost flexible EDS proof of concept to show the principle and directional particle transport on a benchtop.' },
  { k: 'Status', pro: 'Development concept; no validated unit exists.', demo: 'Concept for a benchtop build; no experimental data recorded.' },
  { k: 'Size', pro: 'Large-area (host-dependent) — TBD', demo: '100 × 100 mm coupon (ASSUMPTION)' },
  { k: 'Substrate / dielectric', pro: 'Polyimide 50 µm / encapsulation 25 µm (starting concept values, ASSUMPTION)', demo: 'Polyimide flex PCB / PET or polyimide cover (thickness TBD)' },
  { k: 'Drive electronics', pro: 'Custom/qualified multi-phase HV electronics — architecture TBD', demo: 'Candidate HV modules (UNVERIFIED) or verified lab driver; Arduino for low-voltage control only' },
  { k: 'Drive level', pro: '~1–3 kV target (peak vs peak-to-peak TBD)', demo: 'TBD — requires measurement / qualified-lab characterization' },
  { k: 'Environment', pro: 'Lunar surface intent; requires thermal-vacuum, UV, bend-cycle, outgassing, etc.', demo: 'Ambient benchtop in a closed enclosure — not vacuum, not lunar' },
  { k: 'Test particles', pro: 'Representative, irregular particles (illustrative scene)', demo: 'Characterized glass microspheres / safe particles — not lunar regolith' },
  { k: 'Can show', pro: 'What a product concept could look like and what must be proven', demo: 'Repeatable principle demonstration with measurable before/after coverage' },
  { k: 'Cannot show', pro: 'Any measured performance, qualification or readiness', demo: 'Lunar qualification, vacuum/radiation behaviour, commercial readiness or a scaled-down flight product' },
];

export default function ConfigurationsPage() {
  const bom = useMemo(() => computeBom(DEMO_BOM), []);
  const ok = useMemo(hasWebGL, []);
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Professional vs Demonstrator</h1>
      <p className="mb-4 max-w-3xl text-mute">Two materially different builds with different purposes. The demonstrator proves a principle on a bench; it does not prove the professional product.</p>
      <div className="mb-3"><PlayBar /></div>
      <div className="grid gap-4 md:grid-cols-2">
        {(['professional', 'demonstrator'] as const).map((c) => (
          <div key={c} className="bento overflow-hidden">
            <div className="h-80 bg-ink">
              {ok ? <Suspense fallback={<div className="grid h-full place-items-center text-sm text-mute">Loading…</div>}><Mini cfg={c} /></Suspense> : <StaticFallback reason="WebGL unavailable." />}
            </div>
            <div className="p-3"><h2 className="text-lg font-semibold">{CONFIGS[c].name}</h2><p className="text-[15px] text-mute">{CONFIGS[c].tagline}</p></div>
          </div>
        ))}
      </div>
      <p className="mt-2"><SimNotice /></p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <caption className="sr-only">Comparison of Professional and Demonstrator configurations</caption>
          <thead><tr className="text-left"><th className="w-40 border-b border-line py-2 text-mute" /><th className="border-b border-line py-2">Professional LunaShield</th><th className="border-b border-line py-2">Demonstrator</th></tr></thead>
          <tbody>
            {ROWS.map((r) => <tr key={r.k} className="align-top"><th scope="row" className="border-b border-line py-2 pr-3 text-left font-medium text-mute">{r.k}</th><td className="border-b border-line py-2 pr-4">{r.pro}</td><td className="border-b border-line py-2">{r.demo}</td></tr>)}
            <tr className="align-top"><th scope="row" className="py-2 pr-3 text-left font-medium text-mute">Components</th><td className="py-2 pr-4">{CONFIGS.professional.layers.map((l) => l.name).join(' · ')}</td><td className="py-2">{CONFIGS.demonstrator.layers.map((l) => l.name).join(' · ')}</td></tr>
            <tr className="align-top"><th scope="row" className="py-2 pr-3 text-left font-medium text-mute">Cost (planning)</th>
              <td className="py-2 pr-4">{PHASES.map((p) => `${p.phase} ${formatLakh(p.lakh)}`).join(' · ')} — FOUNDER ESTIMATE</td>
              <td className="py-2">₹{bom.min.toLocaleString('en-IN')}–{bom.max.toLocaleString('en-IN')} indicative — {bom.status}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-2">
        <Notice tone="red">The demonstrator does not replicate lunar conditions, does not use lunar regolith, is not vacuum- or radiation-qualified, and is not proof of commercial readiness.</Notice>
        <Notice>HV module (demonstrator): {MATERIALS['demo-hv'].name}. Listing claims only.</Notice>
      </div>
    </div>
  );
}
