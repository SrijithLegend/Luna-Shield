import type { ConfigData, LayerInfo, Tagged } from './types';

const TBD: Tagged = { value: null, unit: 'µm', tag: 'UNVERIFIED' };
const TBDmm: Tagged = { value: null, unit: 'mm', tag: 'UNVERIFIED' };
const q = 'supplier quote required' as const;

const layers: LayerInfo[] = [
  {
    id: 'frame', name: 'Clear base / test frame', kind: 'frame', materialId: 'demo-frame', inStack: false,
    purpose: 'Holds the coupon flat or curved.', tradeoffs: 'None significant.', thickness: TBDmm,
    cost: { text: 'Within mounting estimate', status: 'estimate' }, validation: ['Visual inspection'],
  },
  {
    id: 'substrate', name: 'Flexible polyimide coupon (100 × 100 mm)', kind: 'substrate', materialId: 'demo-substrate', inStack: true,
    purpose: 'Flexible carrier for the A/B/C electrodes.', tradeoffs: 'Copper fatigue; laminate construction needs testing.',
    thickness: TBD, cost: { text: '₹2,000–2,200 planning amount (quote required)', status: q },
    validation: ['Bench bend test: continuity before/after'],
  },
  {
    id: 'electrodes', name: 'Copper A/B/C electrode traces', kind: 'electrodes', materialId: 'demo-copper', inStack: true,
    purpose: 'Three electrode groups for a conceptual travelling-field sequence. Geometry is parameterized, not final.',
    tradeoffs: 'Edge-field concentration; cracking under bending. Do not finalize width/gap/pitch from a kV/mm calculation.',
    thickness: TBD, cost: { text: 'Included in coupon quote', status: q },
    validation: ['Continuity', 'Design review by a qualified engineer'],
  },
  {
    id: 'cover', name: 'Transparent cover film', kind: 'cover', materialId: 'demo-cover', inStack: true,
    purpose: 'Insulating cover and particle barrier; allows visual observation.',
    tradeoffs: 'Not flight-qualified; dielectric performance must be checked.',
    thickness: TBD, cost: { text: 'Included in coupon quote (construction to be specified)', status: q },
    validation: ['Dielectric performance check in a qualified lab'],
  },
  {
    id: 'connector', name: 'Edge connector tail', kind: 'connector', materialId: 'demo-connector', inStack: false,
    purpose: 'Interface tail from the coupon.', tradeoffs: 'Creepage/breakdown at termination.', thickness: TBDmm,
    cost: { text: 'Within low-voltage components estimate', status: 'estimate' }, validation: ['Design review by a qualified engineer'],
  },
  {
    id: 'hv', name: 'Candidate HV modules ×3 — UNVERIFIED CANDIDATE', kind: 'hvmodule', materialId: 'demo-hv', inStack: false,
    purpose: 'Candidate HV source only. Not an approved EDS driver; switching its low-voltage input does not make it one.',
    tradeoffs: 'Capacitive-load behaviour, current limit, discharge behaviour and corona unknown.',
    thickness: TBDmm, cost: { text: '₹1,350 (₹450 × 3, listing price)', status: 'estimate' },
    validation: ['Datasheet / manufacturer confirmation', 'Qualified-lab characterization under capacitive load'],
  },
  {
    id: 'arduino', name: 'Arduino Uno R3 (low-voltage control only)', kind: 'arduino', materialId: 'demo-arduino', inStack: false,
    purpose: 'Timing/control logic. It does not supply electrode voltage.', tradeoffs: 'Cannot drive HV electrodes directly.',
    thickness: TBDmm, cost: { text: '₹0 incremental (existing board)', status: 'estimate' }, validation: ['None'],
  },
  {
    id: 'enclosure', name: 'Clear test enclosure', kind: 'enclosure', materialId: 'demo-enclosure', inStack: false,
    purpose: 'Contains particles; keeps the test area closed. Not a vacuum chamber.', tradeoffs: 'Not representative of lunar vacuum.',
    thickness: TBDmm, cost: { text: '₹200–350 planning amount', status: 'estimate' }, validation: ['None'],
  },
  {
    id: 'particles', name: 'Test particles, camera and lighting', kind: 'particles', materialId: 'demo-particles', inStack: false,
    purpose: 'Characterized safe particles; fixed camera and lighting for repeatable imaging.',
    tradeoffs: 'Spheres are not representative of angular lunar regolith.',
    thickness: TBDmm, cost: { text: '₹150–250 particles + lighting in wiring/mounting line', status: 'estimate' },
    validation: ['Supplier SDS and size distribution'],
  },
];

export const demonstrator: ConfigData = {
  id: 'demonstrator',
  name: 'LunaShield Demonstrator',
  tagline: 'Small, low-cost benchtop flexible EDS to show the principle and directional particle transport.',
  disclaimer: 'Not a lunar environment test and not a scaled-down flight product. Particles are not lunar regolith; the enclosure is not a vacuum chamber.',
  layers,
  phaseModes: [3],
  architecture: [
    { label: 'Arduino Uno (low-voltage control only)', note: 'Does not supply electrode voltage' },
    { label: 'Isolated low-voltage interface' },
    { label: 'Candidate HV modules / verified lab driver', note: 'UNVERIFIED CANDIDATE — enclosed, current-limited, supervised lab use only' },
    { label: 'Flexible A/B/C electrode coupon' },
    { label: 'Controlled test particles' },
  ],
  feedback: [{ label: 'Camera + humidity sensor' }, { label: 'Trial record' }, { label: 'Image analysis' }],
  keyFacts: [
    { label: 'Coupon size', value: '100 × 100 mm', tag: 'ASSUMPTION' },
    { label: 'Budget target', value: 'Below ₹5,000 — target only, not verified', tag: 'TARGET' },
    { label: 'Candidate module output (listing)', value: '4.5 ± 1.0 kV DC, ≤1 W input — listing claims', tag: 'UNVERIFIED' },
    { label: 'Experimental results', value: 'No experimental data recorded', tag: 'UNVERIFIED' },
  ],
};
