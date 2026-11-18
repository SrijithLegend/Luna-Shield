import { create } from 'zustand';
import type { ConfigId } from '../data';
import type { PhaseMode } from '../utils/physics';

export type Page =
  | 'overview' | 'principle' | 'assembly' | 'materials' | 'electrical'
  | 'simulation' | 'configurations' | 'cost' | 'validation' | 'evidence';

export type HostType = 'radiator' | 'optical' | 'solar';
export type Curvature = 'flat' | 'mild' | 'curved';
export type AnimMode = 'assembly' | 'exploded' | 'energize' | 'field' | 'transport' | 'bending' | 'failure' | 'host';
export type Loading = 'low' | 'medium' | 'high';
export type PSize = 'small' | 'medium' | 'large';
export type Response = 'charged' | 'polarizable' | 'mixed';

export interface SimState {
  config: ConfigId;
  playing: boolean;
  speed: number;
  freq: number;
  phaseMode: PhaseMode;
  voltage: number; // 0..1 illustrative display parameter
  loading: Loading;
  psize: PSize;
  response: Response;
  curvature: Curvature;
  fieldLines: boolean;
  trails: boolean;
  dustLabels: boolean;
  reimpact: boolean;
  idealized: boolean;
  energized: boolean;
  dustOn: boolean;
}

export interface ViewState {
  page: Page;
  chapter: number;
  selected: string | null;
  hidden: string[];
  isolated: string | null;
  explode: number; // 0..1
  thickExag: boolean;
  labels: boolean;
  cutaway: boolean;
  host: HostType;
  animMode: AnimMode;
  presentation: boolean;
  cinematic: boolean;
  reducedMotion: boolean;
  tourStep: number | null;
  resetKey: number;
  failureView: boolean;
  camNonce: number;
  /** true = lunar habitat + astronaut showcase; false = detailed layer model */
  context: boolean;
  sceneError: string | null;
}

interface Actions {
  set: (p: Partial<SimState & ViewState>) => void;
  select: (id: string | null) => void;
  toggleHidden: (id: string) => void;
  reset: () => void;
  setConfig: (c: ConfigId) => void;
  applyMode: (m: AnimMode) => void;
  go: (p: Page) => void;
}

const prefersReduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const initial: SimState & ViewState = {
  config: 'professional', playing: true, speed: 1, freq: 10, phaseMode: 3, voltage: 0.6,
  loading: 'medium', psize: 'medium', response: 'mixed', curvature: 'flat',
  fieldLines: true, trails: false, dustLabels: false, reimpact: true, idealized: false,
  energized: true, dustOn: true,
  page: 'overview', chapter: 0, selected: null, hidden: [], isolated: null,
  explode: 0, thickExag: true, labels: true, cutaway: false, host: 'radiator', animMode: 'assembly',
  presentation: false, cinematic: false, reducedMotion: prefersReduced, tourStep: null, resetKey: 0, failureView: false, camNonce: 0, context: true, sceneError: null,
};

export const useStore = create<SimState & ViewState & Actions>((set, get) => ({
  ...initial,
  set: (p) => set(p),
  select: (id) => set({ selected: id }),
  toggleHidden: (id) => set((s) => ({ hidden: s.hidden.includes(id) ? s.hidden.filter((h) => h !== id) : [...s.hidden, id] })),
  reset: () => set((s) => ({ resetKey: s.resetKey + 1, playing: true })),
  setConfig: (c) => {
    const phaseMode = c === 'demonstrator' ? 3 : get().phaseMode;
    set((s) => ({ config: c, phaseMode, selected: null, hidden: [], isolated: null, resetKey: s.resetKey + 1 }));
  },
  go: (page) => set({ page }),
  applyMode: (m) => {
    const base = { animMode: m, failureView: false };
    switch (m) {
      case 'assembly': set({ ...base, explode: 0, energized: false, curvature: 'flat' }); break;
      case 'exploded': set({ ...base, explode: 1, energized: false }); break;
      case 'energize': set({ ...base, explode: 0, energized: true, fieldLines: false, dustOn: false }); break;
      case 'field': set({ ...base, explode: 0, energized: true, fieldLines: true, dustOn: false }); break;
      case 'transport': set({ ...base, explode: 0, energized: true, dustOn: true, trails: true }); break;
      case 'bending': set({ ...base, explode: 0, curvature: 'curved', energized: false, dustOn: false }); break;
      case 'failure': set({ ...base, failureView: true, explode: 0.6, energized: false, dustOn: false }); break;
      case 'host': set({ ...base, explode: 0, curvature: 'mild', energized: false, dustOn: false }); break;
    }
  },
}));
