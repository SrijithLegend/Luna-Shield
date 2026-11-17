import { Eye, Layers, Scissors } from 'lucide-react';
import { useStore, type AnimMode, type HostType } from '../../state/store';
import { CONFIGS } from '../../data';
import { Field, Seg, Toggle } from '../ui';

const MODES: { v: AnimMode; l: string; d: string }[] = [
  { v: 'assembly', l: 'Assembly', d: 'Layers come together' },
  { v: 'exploded', l: 'Exploded', d: 'Components separate' },
  { v: 'energize', l: 'Energize', d: 'Electrode phases animate' },
  { v: 'field', l: 'Field', d: 'Field visualization sweeps across the surface' },
  { v: 'transport', l: 'Dust transport', d: 'Particles respond (illustratively) to the travelling field' },
  { v: 'bending', l: 'Bending', d: 'Coupon bends; conceptual strain-risk zones' },
  { v: 'failure', l: 'Failure modes', d: 'Annotated failure scenarios — not measured predictions' },
  { v: 'host', l: 'Host integration', d: 'Film conforms to the host surface' },
];

export function ModePicker() {
  const mode = useStore((s) => s.animMode);
  const apply = useStore((s) => s.applyMode);
  return (
    <div>
      <p className="lbl mb-1">Animation mode</p>
      <div className="grid grid-cols-2 gap-1.5">
        {MODES.map((m) => (
          <button key={m.v} title={m.d} onClick={() => apply(m.v)} aria-pressed={mode === m.v} className={`btn !justify-center !px-2 !py-1.5 text-[12px] ${mode === m.v ? 'btn-on' : ''}`}>{m.l}</button>
        ))}
      </div>
    </div>
  );
}

export function ExplodeControls() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <Field label={`Assembled ↔ Exploded — ${Math.round(s.explode * 100)}%`}>
        <input type="range" min={0} max={1} step={0.01} value={s.explode} onChange={(e) => s.set({ explode: +e.target.value })} aria-label="Exploded view amount" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn justify-center" onClick={() => s.set({ explode: 1 })}><Layers size={14} />Explode all</button>
        <button className="btn justify-center" onClick={() => s.set({ explode: 0, isolated: null, hidden: [] })}>Reassemble</button>
      </div>
      <Toggle on={s.thickExag} onChange={(v) => s.set({ thickExag: v })} label="Thickness exaggerated" hint="The real film is very thin. When ON, layer thickness is drawn greatly exaggerated and is not to scale." />
      <p className="text-[11px] text-mute">{s.thickExag ? 'Layer thickness greatly exaggerated for visibility — not to scale.' : 'Thickness drawn closer to scale; layers are hard to distinguish when assembled.'}</p>
      <div className="grid grid-cols-2 gap-2">
        <Toggle on={s.cutaway} onChange={(v) => s.set({ cutaway: v })} label="Cutaway" hint="Clips the front half of the model to show the cross-section." />
        <Toggle on={s.labels} onChange={(v) => s.set({ labels: v })} label="Labels" />
      </div>
      <button className="btn w-full justify-center" onClick={() => s.set({ camNonce: s.camNonce + 1 })}><Eye size={14} />Reset camera view</button>
      {s.cutaway && <p className="flex items-center gap-1 text-[11px] text-mute"><Scissors size={12} />Cutaway clips the z &gt; 0 half.</p>}
      {s.config === 'professional' && <HostPicker />}
    </div>
  );
}

export function HostPicker() {
  const host = useStore((s) => s.host);
  const set = useStore((s) => s.set);
  const pro = useStore((s) => s.config === 'professional');
  if (!pro) return null;
  return (
    <Field label="Host surface (selectable)">
      <Seg<HostType> label="Host surface" value={host} onChange={(v) => set({ host: v })} options={[{ v: 'radiator', l: 'Radiator' }, { v: 'optical', l: 'Optical' }, { v: 'solar', l: 'Solar glass' }]} />
    </Field>
  );
}

export function LayerCount() {
  const c = useStore((s) => s.config);
  return <span>{CONFIGS[c].layers.length} components</span>;
}
