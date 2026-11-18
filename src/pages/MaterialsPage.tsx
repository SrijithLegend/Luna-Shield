import { useState } from 'react';
import { MATERIALS } from '../data';
import { CONFIGS } from '../data';
import { useStore } from '../state/store';
import { CostBadge, EvidenceBadge, Notice, Section, Seg } from '../components/ui';
import type { MaterialInfo } from '../data/types';

function MaterialCard({ m, thickness }: { m: MaterialInfo; thickness?: string }) {
  return (
    <article className="card space-y-2 p-4 text-[15px]">
      <header>
        <h3 className="text-[17px] font-semibold leading-tight">{m.name}</h3>
        <p className="text-mute">{m.family}</p>
      </header>
      <div className="flex flex-wrap gap-1.5"><EvidenceBadge level={m.evidence} /><CostBadge status={m.costStatus} /></div>
      <p><span className="lbl">Role</span><br />{m.role}</p>
      <p><span className="lbl">Why considered</span><br />{m.why}</p>
      {thickness && <p><span className="lbl">Thickness</span><br />{thickness}</p>}
      <div><span className="lbl">Main failure modes</span><ul className="list-disc pl-4">{m.failureModes.map((f) => <li key={f} className="text-[#f3b0b0]">{f}</li>)}</ul></div>
      <div><span className="lbl">Environmental qualification needed</span><ul className="list-disc pl-4">{m.qualification.map((f) => <li key={f}>{f}</li>)}</ul></div>
      <p><span className="lbl">Alternatives</span><br />{m.alternatives.join(' · ')}</p>
      <p><span className="lbl">Appearance in scene</span><br />{m.appearance}</p>
    </article>
  );
}

export default function MaterialsPage() {
  const cur = useStore((s) => s.config);
  const [tab, setTab] = useState(cur);
  const prefix = tab === 'professional' ? 'prof-' : 'demo-';
  const list = Object.values(MATERIALS).filter((m) => m.id.startsWith(prefix));
  const thick = (id: string) => {
    const l = CONFIGS[tab].layers.find((x) => x.materialId === id);
    if (!l) return undefined;
    return l.thickness.value === null ? 'TBD — requires measurement / supplier confirmation' : `${l.thickness.value} ${l.thickness.unit} (${l.thickness.tag})`;
  };
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Materials</h1>
      <p className="mb-4 max-w-3xl text-mute">Candidate materials and subsystems. These are candidates and starting points — not flight specifications. Every evidence badge states how well the choice is supported today.</p>
      <div className="mb-4 w-72"><Seg label="Configuration" value={tab} onChange={setTab} options={[{ v: 'professional', l: 'Professional' }, { v: 'demonstrator', l: 'Demonstrator' }]} /></div>
      {tab === 'demonstrator' && <div className="mb-4"><Notice>The candidate HV modules are <b>unverified</b>: listing claims only, not a datasheet. Test particles are not lunar regolith; the enclosure is not a vacuum chamber.</Notice></div>}
      <Section title={`${CONFIGS[tab].name} — ${list.length} materials / subsystems`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((m) => <MaterialCard key={m.id} m={m} thickness={thick(m.id)} />)}</div>
      </Section>
    </div>
  );
}
