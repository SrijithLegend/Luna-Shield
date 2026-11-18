import { ESTABLISHED, HYPOTHESES, NOTE_SOURCES, PROHIBITED, SOURCES } from '../data/evidence';
import { UNKNOWNS } from '../data/roadmap';
import { Notice, Section, Tag } from '../components/ui';

export default function EvidencePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-3xl font-bold">Evidence &amp; assumptions</h1>
      <p className="mb-4 max-w-3xl text-mute">Every key claim is tagged. “MEASURED IN OUR TEST” appears only after data is entered — none has been recorded.</p>
      <div className="mb-6 flex flex-wrap gap-2"><Tag tag="NASA DEMONSTRATED" /><Tag tag="PUBLISHED RESEARCH" /><Tag tag="LUNASHIELD TARGET" /><Tag tag="FOUNDER ESTIMATE" /><Tag tag="UNVERIFIED" /><Tag tag="MEASURED IN OUR TEST" /></div>
      <Section title="Established / externally demonstrated">
        <ul className="space-y-2">{ESTABLISHED.map((c) => <li key={c.text} className="card flex items-start gap-3 p-3 text-[15px]"><Tag tag={c.tag} /><span>{c.text}{c.source && <a className="ml-2 text-cyan underline" href={c.source} target="_blank" rel="noreferrer">source</a>}</span></li>)}</ul>
      </Section>
      <Section title="LunaShield hypotheses — not yet validated">
        <ul className="space-y-2">{HYPOTHESES.map((c) => <li key={c.text} className="card flex items-start gap-3 p-3 text-[15px]"><Tag tag={c.tag} /><span>{c.text}</span></li>)}</ul>
      </Section>
      <Section title="Prohibited claims until supported">
        <Notice tone="red"><ul className="list-disc space-y-1.5 pl-5">{PROHIBITED.map((p) => <li key={p}>“{p}”</li>)}</ul></Notice>
      </Section>
      <Section title="Known unknowns">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px]">{UNKNOWNS.map((u) => <li key={u}>{u}</li>)}</ul>
      </Section>
      <Section title="Honesty about this visualization">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
          <li>The 3D scene is a conceptual visualization — not a finite-element electrostatic solver, CFD model or experimental result.</li>
          <li>Field lines are an overlay. The electric field is not visible to the naked eye. No kV/mm values are displayed because no field is calculated.</li>
          <li>The voltage slider changes an illustrative display parameter, not a validated field solution.</li>
          <li>Particle trajectories come from a simplified conceptual response model and are not experimental measurements.</li>
          <li>The demonstrator is not lunar-regolith representative, vacuum-qualified, radiation-qualified or flight-qualified.</li>
          <li>The three-phase scene is not a replica of NASA’s Blue Ghost (two-phase glass EDS, one-phase radiator EDS).</li>
          <li>No TRL, test outcome, supplier quote, part certification or material property is asserted beyond what is tagged.</li>
        </ul>
      </Section>
      <Section title="Source references">
        <ol className="list-decimal space-y-1.5 pl-5 text-[15px]">{SOURCES.map((s) => <li key={s.n}><a className="text-cyan underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ol>
        <p className="mt-2 text-[13.5px] text-mute">{NOTE_SOURCES} Visual/editorial reference: Subject Zero Science (<a className="underline" href="https://www.youtube.com/@subjectzeroscience" target="_blank" rel="noreferrer">channel</a>) — editorial approach only, no assets copied.</p>
      </Section>
    </div>
  );
}
