import type { ReactNode } from 'react';
import type { ClaimTag, CostStatus, EvidenceLevel, ValueTag } from '../data/types';
import { SIM_NOTICE } from '../data/evidence';

const evClass: Record<EvidenceLevel, string> = {
  'Established material family': 'b-green',
  'Published EDS candidate': 'b-cyan',
  'LunaShield design hypothesis': 'b-amber',
  'Requires testing': 'b-amber',
  'Flight qualification required': 'b-red',
};
export const EvidenceBadge = ({ level }: { level: EvidenceLevel }) => (
  <span className={`badge ${evClass[level]}`} title="Evidence level">{level}</span>
);

const tagClass: Record<string, string> = {
  'NASA DEMONSTRATED': 'b-green', 'PUBLISHED RESEARCH': 'b-cyan', 'LUNASHIELD TARGET': 'b-amber',
  'FOUNDER ESTIMATE': 'b-amber', UNVERIFIED: 'b-red', 'MEASURED IN OUR TEST': 'b-green',
  ASSUMPTION: 'b-amber', TARGET: 'b-amber', ESTIMATE: 'b-amber',
};
export const Tag = ({ tag }: { tag: ClaimTag | ValueTag }) => <span className={`badge ${tagClass[tag] ?? 'b-mute'}`}>{tag}</span>;

export const CostBadge = ({ status }: { status: CostStatus }) => <span className="badge b-mute">cost: {status}</span>;

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-line pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>{right}
      </div>
      {children}
    </section>
  );
}

export function Notice({ tone = 'amber', children }: { tone?: 'amber' | 'red' | 'cyan'; children: ReactNode }) {
  const c = tone === 'red' ? 'border-red/50 bg-red/5 text-red' : tone === 'cyan' ? 'border-cyan/40 bg-cyan/5 text-cyan' : 'border-amber/50 bg-amber/5 text-amber';
  return <div className={`rounded-md border px-3 py-2 text-[12.5px] leading-snug ${c}`}>{children}</div>;
}

export const SimNotice = () => (
  <p className="pointer-events-none text-[10.5px] leading-snug text-mute" role="note">{SIM_NOTICE}</p>
);

/** Text-equivalent helper for charts / measurements. */
export const SrOnly = ({ children }: { children: ReactNode }) => <p className="sr-only">{children}</p>;

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block" title={hint}>
      <span className="lbl mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {options.map((o) => (
        <button key={String(o.v)} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)} className={`btn flex-1 justify-center !px-2 !py-1 ${value === o.v ? 'btn-on' : ''}`}>{o.l}</button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label, hint, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} title={hint} disabled={disabled} onClick={() => onChange(!on)} className={`btn w-full justify-between !py-1 ${on ? 'btn-on' : ''}`}>
      <span>{label}</span><span className="text-[10px] opacity-70">{on ? 'ON' : 'OFF'}</span>
    </button>
  );
}
