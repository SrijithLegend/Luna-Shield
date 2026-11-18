import { X } from 'lucide-react';
import { CONFIGS, MATERIALS } from '../../data';
import { useStore } from '../../state/store';
import { fmtValue } from '../../utils/physics';
import { CostBadge, EvidenceBadge, Tag } from '../ui';

const swatch: Record<string, string> = {
  host: 'linear-gradient(135deg,#9aa2ab,#5d646c)', adhesive: 'linear-gradient(135deg,#dff0f5,#9fc3cf)',
  substrate: 'linear-gradient(135deg,#e29b2a,#8a4f0c)', electrodes: 'linear-gradient(135deg,#d48a4a,#7a4318)',
  dielectric: 'linear-gradient(135deg,#f2fafc,#b6d5dd)', cover: 'linear-gradient(135deg,#f2fafc,#b6d5dd)',
  connector: 'linear-gradient(135deg,#2c2f35,#0f1013)', driver: 'linear-gradient(135deg,#c3cad2,#7b848e)',
  lvconnector: 'linear-gradient(135deg,#c3cad2,#7b848e)', sensor: 'linear-gradient(135deg,#2c2f35,#0f1013)',
  frame: 'linear-gradient(135deg,#e5f1f6,#a9c8d3)', hvmodule: 'linear-gradient(135deg,#2c2f35,#f59e0b)',
  arduino: 'linear-gradient(135deg,#1c6db3,#0b3a63)', enclosure: 'linear-gradient(135deg,#e5f1f6,#a9c8d3)', particles: 'radial-gradient(circle,#f3f0e8,#9d978a)',
};

export function InfoPanel() {
  const { selected, config, select, isolated, hidden, set, toggleHidden } = useStore();
  const layer = selected ? CONFIGS[config].layers.find((l) => l.id === selected) : undefined;
  if (!layer) {
    return (
      <div className="card p-5 text-sm text-mute">
        <p className="lbl mb-1">Component inspector</p>
        Select a layer or component in the 3D scene, a label, or the list to see its function, candidate material, trade-offs, risks, confidence level and cost basis.
      </div>
    );
  }
  const m = MATERIALS[layer.materialId];
  return (
    <div className="card max-h-full space-y-4 overflow-y-auto p-4 text-[15px] scroll-thin" aria-live="polite">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded border border-line" style={{ background: swatch[layer.kind] }} title={`Rendered appearance: ${m.appearance}`} />
          <div>
            <h3 className="text-[17px] font-semibold leading-tight">{layer.name}</h3>
            <p className="text-mute">{m.family}</p>
          </div>
        </div>
        <button className="btn !p-1" onClick={() => select(null)} aria-label="Close panel"><X size={14} /></button>
      </div>
      <div className="flex flex-wrap gap-1.5"><EvidenceBadge level={m.evidence} /><CostBadge status={layer.cost.status} /></div>
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1" onClick={() => set({ isolated: isolated === layer.id ? null : layer.id })}>{isolated === layer.id ? 'Show all' : 'Isolate selected'}</button>
        <button className="btn !py-1" onClick={() => toggleHidden(layer.id)}>{hidden.includes(layer.id) ? 'Unhide' : 'Hide selected'}</button>
      </div>
      <Row k="Role in this build" v={layer.purpose} />
      <Row k="Candidate composition" v={m.name} />
      <Row k="Nominal thickness" v={<span>{fmtValue(layer.thickness.value, layer.thickness.unit)} {layer.thickness.value !== null && <Tag tag={layer.thickness.tag} />}</span>} />
      <Row k="Material appearance" v={m.appearance} />
      <Row k="Why it is being considered" v={m.why} />
      <Row k="Trade-offs" v={layer.tradeoffs} />
      <List k="Known weaknesses / failure modes" items={m.failureModes} tone="red" />
      <List k="Alternatives" items={m.alternatives} />
      <Row k="Cost basis" v={`${layer.cost.text} (${layer.cost.status})`} />
      <List k="Environmental qualification needed" items={m.qualification} />
      <List k="Required validation tests" items={layer.validation} />
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div><p className="lbl">{k}</p><p className="mt-0.5 leading-relaxed">{v}</p></div>
);
const List = ({ k, items, tone }: { k: string; items: string[]; tone?: 'red' }) => (
  <div>
    <p className="lbl">{k}</p>
    <ul className="mt-0.5 list-disc space-y-1 pl-4 leading-relaxed">{items.map((i) => <li key={i} className={tone === 'red' ? 'text-[#f3b0b0]' : ''}>{i}</li>)}</ul>
  </div>
);

/** Keyboard-accessible alternative to clicking in the 3D scene. */
export function ComponentList() {
  const { config, selected, select, hidden } = useStore();
  return (
    <nav aria-label="Components" className="card p-2">
      <p className="lbl px-2 py-1">Components</p>
      <ul>
        {CONFIGS[config].layers.map((l, i) => (
          <li key={l.id}>
            <button onClick={() => select(selected === l.id ? null : l.id)} aria-pressed={selected === l.id}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[14px] hover:bg-panel2 ${selected === l.id ? 'bg-cyan/10 text-cyan' : ''} ${hidden.includes(l.id) ? 'opacity-40' : ''}`}>
              <span className="w-4 text-mute">{i + 1}</span>{l.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
