import { Pause, Play, RotateCcw } from 'lucide-react';
import { useStore } from '../../state/store';
import { CONFIGS } from '../../data';
import { phaseSpacingMs, periodMs } from '../../utils/physics';
import { Field, Seg, SimNotice, Toggle } from '../ui';
import { simStats } from '../../three/Particles';
import { useEffect, useState } from 'react';

export function ConfigSwitch() {
  const cfg = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);
  return (
    <Seg label="Configuration" value={cfg} onChange={setConfig}
      options={[{ v: 'professional', l: 'Professional' }, { v: 'demonstrator', l: 'Demonstrator' }]} />
  );
}

export function PlayBar() {
  const s = useStore();
  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={() => s.set({ playing: !s.playing })} aria-label={s.playing ? 'Pause simulation' : 'Play simulation'}>
        {s.playing ? <Pause size={14} /> : <Play size={14} />}{s.playing ? 'Pause' : 'Play'}
      </button>
      <button className="btn" onClick={s.reset} aria-label="Reset simulation"><RotateCcw size={14} />Reset</button>
      <div className="w-40"><Seg label="Speed" value={s.speed} onChange={(v) => s.set({ speed: v })} options={[0.25, 0.5, 1, 2].map((v) => ({ v, l: `${v}×` }))} /></div>
    </div>
  );
}

function Remaining() {
  const [r, setR] = useState(1);
  useEffect(() => { const id = setInterval(() => setR(simStats.remaining), 250); return () => clearInterval(id); }, []);
  return <span>{Math.round(r * 100)}% of displayed particles still on surface (illustrative, not a measurement)</span>;
}

export function SimControls() {
  const s = useStore();
  const data = CONFIGS[s.config];
  const modes = data.phaseModes;
  const hz = s.freq;
  return (
    <div className="space-y-3 text-sm">
      <ConfigSwitch />
      <PlayBar />
      <Field label={`Frequency — ${hz} Hz (illustrative)`} hint="Changes animation timing only. 10 Hz is an initial target, not a settled optimum.">
        <input type="range" min={1} max={30} step={1} value={hz} onChange={(e) => s.set({ freq: +e.target.value })} aria-label="Frequency" />
      </Field>
      <p className="text-[11px] text-mute">Period {periodMs(hz).toFixed(1)} ms · {s.phaseMode === 3 ? `phase spacing ≈ ${phaseSpacingMs(hz, 3).toFixed(1)} ms` : 'no phase-shifted travel in this mode'}</p>
      <Field label="Phase mode" hint="Conceptual only. 1-phase and 2-phase are non-travelling patterns; only 3-phase shows a propagating field pattern. Blue Ghost: glass EDS two-phase, radiator EDS one-phase — this 3-phase view is not a Blue Ghost replica.">
        <Seg label="Phase mode" value={s.phaseMode} onChange={(v) => s.set({ phaseMode: v })}
          options={([1, 2, 3] as const).map((v) => ({ v, l: `${v}-phase` })).filter((o) => modes.includes(o.v))} />
      </Field>
      {s.config === 'demonstrator' && <p className="text-[11px] text-mute">Demonstrator is shown with a conceptual 3-phase A/B/C sequence only if the electrical architecture supports it (to be verified).</p>}
      <Field label={`Illustrative field intensity — ${Math.round(s.voltage * 100)}%`} hint="Display parameter — not a validated field solver. Not a kV/mm value.">
        <input type="range" min={0} max={1} step={0.01} value={s.voltage} onChange={(e) => s.set({ voltage: +e.target.value })} aria-label="Illustrative field intensity" />
      </Field>
      <p className="text-[11px] text-amber">display parameter — not a validated field solver</p>
      <Field label="Dust loading"><Seg label="Dust loading" value={s.loading} onChange={(v) => s.set({ loading: v })} options={[{ v: 'low', l: 'Low' }, { v: 'medium', l: 'Med' }, { v: 'high', l: 'High' }]} /></Field>
      <Field label="Particle size"><Seg label="Particle size" value={s.psize} onChange={(v) => s.set({ psize: v })} options={[{ v: 'small', l: 'Small' }, { v: 'medium', l: 'Med' }, { v: 'large', l: 'Large' }]} /></Field>
      <Field label="Particle response (conceptual response model)" hint="Charged: moves with charge sign. Polarizable: weaker hop transport. Mixed: illustrative population.">
        <Seg label="Particle response" value={s.response} onChange={(v) => s.set({ response: v })} options={[{ v: 'charged', l: 'Charged' }, { v: 'polarizable', l: 'Polariz.' }, { v: 'mixed', l: 'Mixed' }]} />
      </Field>
      <Toggle on={s.idealized} onChange={(v) => s.set({ idealized: v })} label={s.idealized ? 'Illustrative idealized transport' : 'Variable particle response'} hint="Idealized: all particles respond identically. Variable: size, adhesion and charge differ per particle." />
      <Field label="Surface curvature"><Seg label="Surface curvature" value={s.curvature} onChange={(v) => s.set({ curvature: v })} options={[{ v: 'flat', l: 'Flat' }, { v: 'mild', l: 'Mild' }, { v: 'curved', l: 'Curved' }]} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Toggle on={s.energized} onChange={(v) => s.set({ energized: v })} label="Energize" />
        <Toggle on={s.dustOn} onChange={(v) => s.set({ dustOn: v })} label="Dust" />
        <Toggle on={s.fieldLines} onChange={(v) => s.set({ fieldLines: v })} label="Field lines" hint="Overlay visualization. The electric field is not visible to the naked eye." />
        <Toggle on={s.trails} onChange={(v) => s.set({ trails: v })} label="Trails" />
        <Toggle on={s.dustLabels} onChange={(v) => s.set({ dustLabels: v })} label="Dust labels" />
        <Toggle on={s.reimpact} onChange={(v) => s.set({ reimpact: v })} label="Re-impact" hint="Vacuum does not guarantee particles disappear permanently." />
        <Toggle on={s.explode > 0.5} onChange={(v) => s.set({ explode: v ? 1 : 0 })} label="Exploded" />
        <Toggle on={s.labels} onChange={(v) => s.set({ labels: v })} label="Labels" />
      </div>
      <p className="text-[11px] text-mute"><Remaining /></p>
      <p className="text-[11px] text-mute">Field lines are a visualization overlay — the electric field cannot be seen directly.</p>
      <SimNotice />
    </div>
  );
}
