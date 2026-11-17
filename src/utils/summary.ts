import { CONFIGS, MATERIALS } from '../data';
import { COST_ASSUMPTIONS, DEMO_BOM, PHASES, PROPOSED_ASK_LAKH, computeBom, formatLakh, reconcileFunding } from '../data/cost-model';
import { ESTABLISHED, HYPOTHESES, PROHIBITED } from '../data/evidence';
import { UNKNOWNS } from '../data/roadmap';
import { SIM_NOTICE } from '../data/evidence';
import { fmtValue } from './physics';

export function buildSummary(): string {
  const L: string[] = [];
  L.push('# LunaShield — technical summary (concept visualization)', '', '> Concept visualization — not a flight-qualified product. ' + SIM_NOTICE, '');
  for (const c of Object.values(CONFIGS)) {
    L.push(`## ${c.name}`, c.tagline, '', `_${c.disclaimer}_`, '', '| Component | Candidate | Thickness | Evidence | Cost status |', '|---|---|---|---|---|');
    for (const l of c.layers) {
      const m = MATERIALS[l.materialId];
      L.push(`| ${l.name} | ${m.name} | ${fmtValue(l.thickness.value, l.thickness.unit)}${l.thickness.value !== null ? ` (${l.thickness.tag})` : ''} | ${m.evidence} | ${l.cost.status} |`);
    }
    L.push('', '**Key facts**', ...c.keyFacts.map((k) => `- ${k.label}: ${k.value} [${k.tag}]`), '');
  }
  L.push('## Professional cost planning (FOUNDER ESTIMATE — not supplier quotes)', ...PHASES.map((p) => `- ${p.phase}: ${formatLakh(p.lakh)} — ${p.scope}`));
  const r = reconcileFunding();
  L.push(`- Proposed ask: ${formatLakh(PROPOSED_ASK_LAKH)}`, `- **Reconciliation: P1 + P2 = ${formatLakh(r.p1p2Lakh)}, which exceeds the ask by ${formatLakh(r.gapLakh)}. Founder-approved allocation / deferral explanation required.**`, '');
  const t = computeBom(DEMO_BOM);
  L.push('## Demonstrator indicative BOM (planning amounts)', ...DEMO_BOM.map((b) => `- ${b.item}: ₹${b.min}${b.max !== b.min ? '–' + b.max : ''} — ${b.note}`), `- **Indicative total: ₹${t.min}–${t.max} — ${t.status}**`, '', '### Cost assumptions', ...COST_ASSUMPTIONS.map((a) => `- ${a}`), '');
  L.push('## Evidence', ...ESTABLISHED.map((c) => `- [${c.tag}] ${c.text}`), '', '## Hypotheses (not validated)', ...HYPOTHESES.map((c) => `- [${c.tag}] ${c.text}`), '', '## Prohibited claims until supported', ...PROHIBITED.map((p) => `- ${p}`), '', '## Known unknowns', ...UNKNOWNS.map((u) => `- ${u}`), '');
  return L.join('\n');
}

export function download(name: string, text: string, type = 'text/markdown') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const exportSummary = () => download('lunashield-technical-summary.md', buildSummary());
