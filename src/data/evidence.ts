import type { ClaimTag } from './types';

export interface Claim { text: string; tag: ClaimTag; source?: string }

export const ESTABLISHED: Claim[] = [
  { text: 'NASA demonstrated an EDS on the lunar surface during Firefly Blue Ghost Mission 1 in March 2025.', tag: 'NASA DEMONSTRATED', source: 'https://www.nasa.gov/image-article/nasas-dust-shield-successfully-repels-lunar-regolith-on-moon/' },
  { text: 'NASA’s EDS principle uses high-voltage square waves across electrodes to create an electric field varying in space and time.', tag: 'NASA DEMONSTRATED', source: 'https://ntrs.nasa.gov/citations/20250009407' },
  { text: 'The Blue Ghost glass EDS used in-plane interdigitated electrodes in two-phase mode.', tag: 'NASA DEMONSTRATED', source: 'https://ntrs.nasa.gov/citations/20250009407' },
  { text: 'The Blue Ghost thermal-radiator EDS used out-of-plane grid electrodes in one-phase mode.', tag: 'NASA DEMONSTRATED', source: 'https://ntrs.nasa.gov/citations/20250009407' },
  { text: 'Published flexible-EDS work has evaluated copper electrodes on polyimide and CMrGO-based approaches.', tag: 'PUBLISHED RESEARCH', source: 'https://doi.org/10.1016/j.actaastro.2026.02.023' },
  { text: 'Published flexible-EDS results show electrode geometry, coating, bending durability and micro-discharges are meaningful engineering variables.', tag: 'PUBLISHED RESEARCH', source: 'https://doi.org/10.1002/admi.70667' },
];

export const HYPOTHESES: Claim[] = [
  { text: 'A flexible, thin, retrofit-friendly product can reduce integration burden.', tag: 'LUNASHIELD TARGET' },
  { text: 'A manufacturable stack can survive required bend cycles and lunar environmental conditions.', tag: 'LUNASHIELD TARGET' },
  { text: 'A selected film/driver combination can achieve useful clearing efficiency at acceptable power.', tag: 'LUNASHIELD TARGET' },
  { text: 'A sensor/controller can schedule cleaning efficiently.', tag: 'LUNASHIELD TARGET' },
  { text: 'Terrestrial solar-panel cleaning could be a bridge market.', tag: 'UNVERIFIED' },
  { text: 'EDS is not a LunaShield invention; the differentiation (a durable, manufacturable, integrator-ready flexible system) is a development thesis, not a proven moat.', tag: 'FOUNDER ESTIMATE' },
];

export const PROHIBITED = [
  'LunaShield removes 90%+ of lunar dust',
  'LunaShield is flight-ready',
  'LunaShield is vacuum-qualified',
  'LunaShield has no requalification burden',
  'The demo replicates lunar conditions',
  'The demo uses lunar regolith (unless it actually does)',
  'The low-cost ionizer module is a validated EDS driver',
  'The simulation predicts actual particle trajectories',
];

export const SOURCES = [
  { n: 1, title: 'NASA — Electrodynamic Dust Shield on the surface of the Moon (2025)', url: 'https://ntrs.nasa.gov/citations/20250009407' },
  { n: 2, title: 'NASA — NASA’s Dust Shield Successfully Repels Lunar Regolith on Moon (27 March 2025)', url: 'https://www.nasa.gov/image-article/nasas-dust-shield-successfully-repels-lunar-regolith-on-moon/' },
  { n: 3, title: 'NASA NTRS — EDS on the Moon!', url: 'https://ntrs.nasa.gov/citations/20250006102' },
  { n: 4, title: 'Flexible electrodynamic dust shields for lunar missions, Acta Astronautica 244', url: 'https://doi.org/10.1016/j.actaastro.2026.02.023' },
  { n: 5, title: 'Thermoplastic Dielectric Coatings for Flexible Electrodynamic Dust Shields, Adv. Mater. Interfaces', url: 'https://doi.org/10.1002/admi.70667' },
  { n: 6, title: 'NASA — CLPS EDS Payload Thermal Design and Analysis', url: 'https://ntrs.nasa.gov/citations/20250005380' },
];

export const NOTE_SOURCES = 'Source summaries were taken from the project brief; read each source before relying on a specific claim.';

export const SIM_NOTICE = 'Visualization is qualitative. Particle trajectories are illustrative and are not experimental measurements.';
