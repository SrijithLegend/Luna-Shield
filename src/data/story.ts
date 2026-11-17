import { useStore, type Page, type SimState, type ViewState } from '../state/store';

type Patch = Partial<SimState & ViewState>;

export interface Chapter { n: string; title: string; text: string; patch: Patch }

const base: Patch = { failureView: false, selected: null, hidden: [], isolated: null, animMode: 'assembly', playing: true };

export const CHAPTERS: Chapter[] = [
  { n: '01', title: 'The problem', text: 'Lunar dust can contaminate exposed hardware such as radiators, optical windows, camera covers and solar surfaces. Here a protected surface is shown carrying an illustrative dust load.',
    patch: { ...base, config: 'professional', explode: 0, energized: false, dustOn: true, loading: 'high', fieldLines: false, trails: false, curvature: 'flat' } },
  { n: '02', title: 'The principle', text: 'Patterned electrodes driven with time-shifted waveforms make an electric field that varies across the surface and in time. NASA demonstrated EDS on the Moon in March 2025; this three-phase view is a conceptual illustration, not a Blue Ghost replica.',
    patch: { ...base, config: 'professional', explode: 0, energized: true, dustOn: false, fieldLines: true, phaseMode: 3, curvature: 'flat' } },
  { n: '03', title: 'The flexible stack', text: 'A proposed layer stack: dielectric encapsulation, copper electrodes, polyimide substrate, bonding layer, host. Thickness is greatly exaggerated; select any layer to inspect it.',
    patch: { ...base, config: 'professional', explode: 1, energized: false, dustOn: false, fieldLines: false, labels: true, curvature: 'flat' } },
  { n: '04', title: 'The power system', text: 'Concept chain: spacecraft bus → protection → HV conversion → waveform and phase control → electrode array. A converter alone does not create a controlled multi-phase waveform. Architecture is TBD.',
    patch: { ...base, config: 'professional', explode: 0.55, energized: true, dustOn: false, fieldLines: false, curvature: 'flat' } },
  { n: '05', title: 'Dust transport', text: 'Particles hop and translate in response to the travelling pattern. Behaviour varies with charge, size and adhesion; some stay attached. This is an illustrative model, not a measurement.',
    patch: { ...base, config: 'professional', explode: 0, energized: true, dustOn: true, loading: 'medium', trails: true, fieldLines: true, phaseMode: 3, curvature: 'flat', animMode: 'transport' } },
  { n: '06', title: 'Professional system', text: 'Proposed flexible, large-area film for radiators, optical covers and solar surfaces, plus HV driver and controller. A development concept — no validated professional unit exists.',
    patch: { ...base, config: 'professional', explode: 0.25, energized: true, dustOn: true, loading: 'low', trails: false, curvature: 'mild' } },
  { n: '07', title: 'Demonstrator', text: 'A small benchtop coupon to show the principle and directional particle transport. Not lunar regolith, not vacuum, not a flight product. HV modules are UNVERIFIED CANDIDATES.',
    patch: { ...base, config: 'demonstrator', explode: 0.2, energized: true, dustOn: true, loading: 'medium', trails: false, curvature: 'flat', fieldLines: true } },
  { n: '08', title: 'What must be proven', text: 'Copper cracking, dielectric breakdown, delamination and adhesive failure are annotated risk scenarios, not measured predictions. Each needs bench, environmental and host-integration testing.',
    patch: { ...base, config: 'professional', explode: 0.6, energized: false, dustOn: false, fieldLines: false, failureView: true, animMode: 'failure', curvature: 'flat' } },
];

export function applyChapter(i: number) {
  const c = CHAPTERS[i];
  if (!c) return;
  const prev = useStore.getState();
  useStore.setState({ ...c.patch, chapter: i, resetKey: prev.resetKey + (c.patch.config && c.patch.config !== prev.config ? 1 : 0), page: 'overview' });
}

export interface TourStep { title: string; text: string; page: Page; chapter?: number; secs: number; patch?: Patch }

export const TOUR: TourStep[] = [
  { title: '1 · Problem', text: 'Lunar dust contaminates critical exposed hardware: radiators, optical windows, camera covers and solar surfaces.', page: 'overview', chapter: 0, secs: 25 },
  { title: '2 · Principle', text: 'An electrodynamic dust shield uses patterned electrodes and time-varying potentials to make an electric field that moves in space and time. EDS is not a LunaShield invention: NASA demonstrated it on the lunar surface in March 2025.', page: 'overview', chapter: 1, secs: 35 },
  { title: '3 · Assembly', text: 'Revealed layer by layer: dielectric, copper electrodes, polyimide substrate, bond layer, host. Layer thickness is exaggerated and every value is a candidate, not a specification.', page: 'assembly', chapter: 2, secs: 35, patch: { explode: 1, energized: false, dustOn: false } },
  { title: '4 · Operation', text: 'Electrode groups A/B/C are driven in sequence so the field pattern propagates. Particles respond illustratively — variable, not identical, and some stay put.', page: 'simulation', chapter: 4, secs: 40, patch: { explode: 0, energized: true, dustOn: true, trails: true } },
  { title: '5 · Two builds', text: 'Professional: a proposed flight-oriented film. Demonstrator: a low-cost benchtop proof of principle that proves neither lunar qualification nor commercial readiness.', page: 'configurations', secs: 35 },
  { title: '6 · Engineering challenge', text: 'Durability under bending, dielectric integrity, adhesion, thermal/UV/vacuum performance and manufacturing yield — all unproven for LunaShield today.', page: 'overview', chapter: 7, secs: 30 },
  { title: '7 · Validation plan', text: 'Stage-gated: benchtop principle, flexible coupon, environmental screening, host integration, then mission-specific qualification. No TRL is assigned.', page: 'validation', secs: 30 },
  { title: '8 · Business case', text: 'Proposed customer surfaces and integration model. Market assumptions are marked as assumptions; the planning costs shown do not reconcile with the proposed ask.', page: 'cost', secs: 30 },
];

export function applyTourStep(i: number) {
  const st = TOUR[i];
  if (!st) return;
  const s = useStore.getState();
  if (st.chapter !== undefined) {
    const c = CHAPTERS[st.chapter];
    useStore.setState({ ...c.patch, chapter: st.chapter, resetKey: s.resetKey + (c.patch.config && c.patch.config !== s.config ? 1 : 0) });
  }
  useStore.setState({ ...(st.patch ?? {}), page: st.page, tourStep: i, camNonce: s.camNonce + 1 });
}
