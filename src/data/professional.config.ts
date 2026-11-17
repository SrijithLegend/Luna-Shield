import type { ConfigData, LayerInfo, Tagged } from './types';

const TBD: Tagged = { value: null, unit: 'µm', tag: 'UNVERIFIED' };

const layers: LayerInfo[] = [
  {
    id: 'host', name: 'Host surface coupon', kind: 'host', materialId: 'prof-host', inStack: false,
    purpose: 'The protected hardware: radiator, optical cover or solar glass (selectable in the scene).',
    tradeoffs: 'Each host changes thermal, optical and integration requirements.',
    thickness: { ...TBD, unit: 'mm' },
    cost: { text: 'Mission-dependent', status: 'not quoted' },
    validation: ['Host-system impact measurement', 'Thermal performance', 'EMC'],
  },
  {
    id: 'adhesive', name: 'Bonding / interface layer', kind: 'adhesive', materialId: 'prof-adhesive', inStack: true,
    purpose: 'Attaches the flexible film to the host surface.',
    tradeoffs: 'Outgassing, peel, thermal cycling, contamination, differential expansion.',
    thickness: TBD,
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Outgassing', 'Peel / adhesion', 'Thermal cycling', 'Thermal-vacuum'],
  },
  {
    id: 'substrate', name: 'Flexible polymer substrate', kind: 'substrate', materialId: 'prof-substrate', inStack: true,
    purpose: 'Mechanical support and electrical insulation under the electrodes.',
    tradeoffs: 'Flex fatigue, thermal-expansion mismatch, bonding.',
    thickness: { value: 50, unit: 'µm', tag: 'ASSUMPTION' },
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Bend-cycle', 'Thermal cycling', 'Thermal-vacuum'],
  },
  {
    id: 'electrodes', name: 'Copper electrode pattern (A/B/C)', kind: 'electrodes', materialId: 'prof-copper', inStack: true,
    purpose: 'Creates the spatially varying, time-varying electric field. Pitch is configurable; no final design is fixed.',
    tradeoffs: 'Copper fatigue, cracking, trace geometry, edge-field concentration.',
    thickness: TBD,
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Continuity before/after bending', 'Dust removal before/after bending', 'Partial-discharge screening'],
  },
  {
    id: 'dielectric', name: 'Dielectric encapsulation', kind: 'dielectric', materialId: 'prof-dielectric', inStack: true,
    purpose: 'Insulates and protects the electrodes; helps prevent electrical breakdown.',
    tradeoffs: 'Dielectric strength, adhesion, outgassing, UV/thermal ageing, surface charging.',
    thickness: { value: 25, unit: 'µm', tag: 'ASSUMPTION' },
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Dielectric withstand', 'UV', 'Thermal cycling', 'Adhesion', 'Bend-cycle'],
  },
  {
    id: 'connector', name: 'Edge connector / electrical interface', kind: 'connector', materialId: 'prof-connector', inStack: false,
    purpose: 'Carries drive signals from the driver onto the film.',
    tradeoffs: 'Creepage and breakdown at the termination; strain relief.',
    thickness: { ...TBD, unit: 'mm' },
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Isolation / creepage review (qualified engineers)', 'Vibration', 'Thermal cycling'],
  },
  {
    id: 'driver', name: 'HV driver electronics enclosure', kind: 'driver', materialId: 'prof-driver', inStack: false,
    purpose: 'HV conversion plus waveform generation and phase control. Architecture TBD; no topology is validated.',
    tradeoffs: 'Mass, efficiency, isolation, EMI, breakdown, qualification.',
    thickness: { ...TBD, unit: 'mm' },
    cost: { text: 'TBD — requires supplier confirmation', status: 'supplier quote required' },
    validation: ['Electrical safety review', 'EMC', 'Thermal-vacuum'],
  },
  {
    id: 'lv', name: 'Low-voltage input connector', kind: 'lvconnector', materialId: 'prof-lv', inStack: false,
    purpose: 'Interface to the spacecraft bus. 28 V DC is an assumption and is mission-dependent.',
    tradeoffs: 'Mission-interface mismatch.',
    thickness: { ...TBD, unit: 'mm' },
    cost: { text: 'Not quoted', status: 'not quoted' },
    validation: ['Interface control document review'],
  },
  {
    id: 'sensor', name: 'Obscuration sensor (optional)', kind: 'sensor', materialId: 'prof-sensor', inStack: false,
    purpose: 'Optional concept: detect contamination and schedule cleaning.',
    tradeoffs: 'False positives, sensor contamination, power.',
    thickness: { ...TBD, unit: 'mm' },
    cost: { text: 'Not quoted', status: 'not quoted' },
    validation: ['Calibration against known contamination'],
  },
];

export const professional: ConfigData = {
  id: 'professional',
  name: 'Professional LunaShield',
  tagline: 'Proposed flexible, large-area EDS for radiators, optical windows, camera covers and solar surfaces.',
  disclaimer: 'Development concept. No LunaShield professional unit exists as a validated product. Final stack and drive scheme must be selected for the target host and mission.',
  layers,
  phaseModes: [1, 2, 3],
  architecture: [
    { label: 'Spacecraft low-voltage bus', note: '28 V DC — ASSUMPTION, mission-dependent' },
    { label: 'Input protection + power conditioning' },
    { label: 'High-voltage conversion', note: 'Target around 1–3 kV; distinguish peak from peak-to-peak — TARGET' },
    { label: 'Waveform generation + phase control', note: 'A converter alone does not create a controlled multi-phase waveform' },
    { label: 'Flexible electrode array' },
    { label: 'Time-varying electric field' },
    { label: 'Dust lift / transport' },
  ],
  feedback: [
    { label: 'Obscuration sensor' }, { label: 'Controller' }, { label: 'Duty scheduler' }, { label: 'Driver enable / operating mode' },
  ],
  keyFacts: [
    { label: 'Substrate thickness', value: '50 µm starting concept value', tag: 'ASSUMPTION' },
    { label: 'Dielectric thickness', value: '25 µm starting concept value', tag: 'ASSUMPTION' },
    { label: 'Total stack thickness', value: 'TBD — requires measurement / supplier confirmation (target concept <0.1 mm only if layer geometry supports it)', tag: 'TARGET' },
    { label: 'Areal mass', value: '~300 g/m²', tag: 'ESTIMATE' },
    { label: 'Input bus', value: '28 V DC', tag: 'ASSUMPTION' },
    { label: 'Electrode drive', value: '~1–3 kV (peak vs peak-to-peak to be specified)', tag: 'TARGET' },
    { label: 'Frequency', value: '~10 Hz initial target, not a settled optimum', tag: 'TARGET' },
    { label: 'Current', value: 'Microamp-class is a design intent; no validated LunaShield measurement exists', tag: 'TARGET' },
  ],
};
