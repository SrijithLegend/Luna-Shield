import { useState } from 'react';
import { ArchitectureDiagram } from '../components/data-panels/Architecture';
import { Notice, Section, Seg, Tag } from '../components/ui';
import { CONFIGS } from '../data';
import { useStore } from '../state/store';

export default function ElectricalPage() {
  const cur = useStore((s) => s.config);
  const [tab, setTab] = useState(cur);
  const d = CONFIGS[tab];
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Electrical architecture</h1>
      <p className="mb-4 max-w-3xl text-mute">Block-level signal and power chain. This is a concept diagram — no circuit, wiring or component values are specified.</p>
      <div className="mb-4 w-72"><Seg label="Configuration" value={tab} onChange={setTab} options={[{ v: 'professional', l: 'Professional' }, { v: 'demonstrator', l: 'Demonstrator' }]} /></div>
      <ArchitectureDiagram cfg={tab} />
      {tab === 'professional' ? (
        <>
          <Section title="Conceptual targets from the current deck">
            <table className="w-full text-[13px]"><tbody>
              {d.keyFacts.map((k) => (
                <tr key={k.label} className="border-b border-line"><td className="w-56 py-2 pr-3 text-mute">{k.label}</td><td className="py-2">{k.value}</td><td className="py-2 text-right"><Tag tag={k.tag} /></td></tr>
              ))}
            </tbody></table>
          </Section>
          <div className="space-y-2">
            <Notice>A converter plus a waveform-generation stage is required. A flyback transformer alone does not create a controlled three-phase EDS waveform.</Notice>
            <Notice>ZVS + flyback is <b>not</b> a completed or validated design. Driver topology is TBD.</Notice>
            <Notice tone="cyan">NASA's Blue Ghost glass EDS used a two-phase mode and its thermal-radiator EDS a one-phase mode. The three-phase scene here is a conceptual travelling-wave configuration, not a replica.</Notice>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Notice tone="red"><b>The Arduino does not supply electrode voltage.</b> It is a low-voltage timing/control board only.</Notice>
          <Notice>The candidate ion-generator modules do not become an approved EDS driver merely because their low-voltage inputs can be switched. A unipolar switched-envelope drive is a different implementation from a bipolar square-wave EDS driver and must be labelled as such.</Notice>
          <Notice tone="red">Safety: this app gives no exposed-kilovolt wiring instructions. Any HV test must be done by a qualified supervisor with enclosed, current-limited equipment, rated probes, interlocks and a documented discharge procedure. Wiring and clearances require qualified engineering review.</Notice>
        </div>
      )}
    </div>
  );
}
