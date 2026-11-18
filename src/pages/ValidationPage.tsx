import { useState } from 'react';
import { ROADMAP, PROTOCOL, UNKNOWNS } from '../data/roadmap';
import { ImageAnalysis } from '../components/data-panels/ImageAnalysis';
import { Notice, Section, Seg } from '../components/ui';
import { MATERIALS } from '../data';

type Tab = 'roadmap' | 'protocol' | 'image';

export function Protocol() {
  const [done, setDone] = useState<boolean[]>(() => PROTOCOL.map(() => false));
  return (
    <div className="space-y-4">
      <Notice tone="red">Any HV step must be performed only by a qualified supervisor using enclosed, current-limited equipment, rated probes, interlocks and a documented discharge procedure. This checklist gives no HV wiring instructions.</Notice>
      <ol className="space-y-2">
        {PROTOCOL.map((p, i) => (
          <li key={p} className="card flex items-start gap-3 p-3 text-[15px]">
            <input id={`pr-${i}`} type="checkbox" checked={done[i]} onChange={(e) => setDone(done.map((d, j) => (j === i ? e.target.checked : d)))} className="mt-1" />
            <label htmlFor={`pr-${i}`}><span className="mr-2 text-mute">{i + 1}.</span>{p}</label>
          </li>
        ))}
      </ol>
      <p className="text-[13.5px] text-mute">{done.filter(Boolean).length} / {PROTOCOL.length} steps ticked in this session (not saved).</p>
      <Section title="Metrics">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
          <li>Initial dust-covered area; remaining dust-covered area</li>
          <li>Clearing efficiency η = ((A_initial − A_remaining) / A_initial) × 100%</li>
          <li>Time to clear; repeatability across trials</li>
          <li>Relative humidity; ambient temperature</li>
          <li>Input electrical power — measured, not inferred from an unverified output rating</li>
          <li>Observed particle transport direction</li>
          <li>Any electrode damage or visible discharge</li>
        </ul>
      </Section>
      <Section title="Candidate HV module — required before it is represented as usable">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px]">{MATERIALS['demo-hv'].qualification.map((q) => <li key={q}>{q}</li>)}</ul>
      </Section>
    </div>
  );
}

export default function ValidationPage() {
  const [tab, setTab] = useState<Tab>('roadmap');
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Validation roadmap</h1>
      <p className="mb-4 max-w-3xl text-mute">A stage-gated plan. None of these tests has been performed. No TRL is assigned because no formal assessment has been completed.</p>
      <div className="mb-5 w-full max-w-xl"><Seg<Tab> label="View" value={tab} onChange={setTab} options={[{ v: 'roadmap', l: 'Stage gates' }, { v: 'protocol', l: 'Demo protocol' }, { v: 'image', l: 'Image analysis' }]} /></div>
      {tab === 'roadmap' && (
        <>
          <ol className="relative space-y-4 border-l border-line pl-6">
            {ROADMAP.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border border-amber bg-ink text-[8px] text-amber" aria-hidden>●</span>
                <div className="card p-5">
                  <div className="flex items-center gap-2"><span className="badge b-amber">Stage {s.id}</span><span className="badge b-mute">not started</span></div>
                  <h3 className="mt-1 text-[15px] font-semibold">{s.title}</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px]">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  {s.note && <p className="mt-2 text-[13.5px] text-amber">{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>
          <Section title="Known unknowns"><ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px]">{UNKNOWNS.map((u) => <li key={u}>{u}</li>)}</ul></Section>
        </>
      )}
      {tab === 'protocol' && <Protocol />}
      {tab === 'image' && <ImageAnalysis />}
    </div>
  );
}
