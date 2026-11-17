export interface Stage { id: string; title: string; items: string[]; note?: string }

export const ROADMAP: Stage[] = [
  { id: 'P0', title: 'Benchtop principle', items: ['Demonstrate repeatable particle movement', 'Measure clearing fraction, time, power and repeatability', 'Establish safe electrical operation'] },
  { id: 'P1', title: 'Flexible coupon', items: ['Flexible copper/polyimide coupon', 'Measure electrical continuity before/after bending', 'Measure dust removal before/after bending', 'Characterize electrode/dielectric adhesion', 'Record waveform and current under representative load'] },
  { id: 'P2', title: 'Environmental screening', items: ['Thermal-vacuum testing', 'Thermal cycling', 'UV exposure', 'Bend-cycle testing', 'Electrical breakdown / partial-discharge screening', 'Adhesion and outgassing evaluation', 'Contamination and optical/thermal impact testing as applicable'] },
  { id: 'P3', title: 'Host integration', items: ['Integrate on a representative radiator/optical/solar coupon', 'Measure host-system impact', 'Assess EMC, power budget, thermal performance and interface constraints'] },
  { id: 'P4', title: 'Flight-oriented qualification', items: ['Mission-specific design and qualification'], note: 'No TRL is assigned: no formal assessment has been completed.' },
];

export const PROTOCOL = [
  'Confirm enclosure is closed and test area is clear.',
  'Record ambient temperature and relative humidity.',
  'Photograph clean coupon.',
  'Apply a measured quantity of particles using a repeatable method.',
  'Photograph initial dust coverage.',
  'Run a no-field control trial.',
  'Run an energized trial under approved lab supervision.',
  'Photograph final dust coverage.',
  'Repeat at least five times.',
  'Save trial data and images.',
];

export const UNKNOWNS = [
  'Clearing efficiency of any LunaShield film at any power level',
  'Bend-cycle life of the chosen copper/polyimide/dielectric stack',
  'Dielectric breakdown margin and partial-discharge behaviour',
  'Adhesive selection and outgassing',
  'Thermal-vacuum, UV and radiation performance',
  'HV driver topology, mass and efficiency',
  'Output / capacitive-load behaviour of the candidate hobby HV modules',
  'Real stack thickness and areal mass (founder estimate ~300 g/m² is unmeasured)',
  'Funding allocation: P1 + P2 exceeds the proposed ask',
];
