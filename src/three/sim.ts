import { groupDrive, phaseOffsetsDeg, rng, type PhaseMode } from '../utils/physics';

/**
 * Conceptual particle response model.
 * NOT a numerical multiphysics solver. Trajectories are illustrative and use tunable heuristics:
 *  - a particle lifts when its local electrode group's drive rises through a threshold and the
 *    (illustrative) field intensity exceeds the particle's adhesion;
 *  - charged particles move with/against the travelling pattern according to charge sign;
 *  - polarizable particles hop with weaker transport;
 *  - 1- and 2-phase patterns do not travel, so net transport is small and direction is random.
 */
export interface SimParams {
  mode: PhaseMode;
  hz: number;
  voltage: number; // 0..1 illustrative
  response: 'charged' | 'polarizable' | 'mixed';
  idealized: boolean;
  reimpact: boolean;
  halfW: number;
  pitch: number;
  floorDrop: number;
}

export const GRAVITY = 2.2; // display units, not lunar-accurate

export const REST = 0, AIR = 1, GONE = 2, FLOOR = 3;

export class ParticleSim {
  n: number;
  u: Float32Array; h: Float32Array; w: Float32Array;
  vu: Float32Array; vh: Float32Array;
  state: Uint8Array;
  adhesion: Float32Array; charge: Float32Array; sizeMul: Float32Array; jitter: Float32Array;
  prev: Float32Array;
  readonly u0: Float32Array; readonly w0: Float32Array;
  private rand: () => number;
  private seed: number;

  constructor(n: number, seed: number, halfW: number, halfD: number, uniform: boolean) {
    this.n = n; this.seed = seed;
    const f = () => new Float32Array(n);
    this.u = f(); this.h = f(); this.w = f(); this.vu = f(); this.vh = f();
    this.adhesion = f(); this.charge = f(); this.sizeMul = f(); this.jitter = f(); this.prev = f();
    this.u0 = f(); this.w0 = f();
    this.state = new Uint8Array(n);
    this.rand = rng(seed);
    const r = rng(seed ^ 0x9e3779b9);
    for (let i = 0; i < n; i++) {
      this.u0[i] = (r() * 2 - 1) * halfW * 0.96;
      this.w0[i] = (r() * 2 - 1) * halfD * 0.96;
      this.sizeMul[i] = uniform ? 1 : 0.5 + r() * 1.1;
      this.adhesion[i] = 0.1 + r() * 0.9;
      this.charge[i] = r() < 0.5 ? -1 : 1;
      this.jitter[i] = r();
    }
    this.reset();
  }

  reset() {
    this.rand = rng(this.seed + 1);
    for (let i = 0; i < this.n; i++) {
      this.u[i] = this.u0[i]; this.w[i] = this.w0[i]; this.h[i] = 0; this.vu[i] = 0; this.vh[i] = 0;
      this.state[i] = REST; this.prev[i] = -1;
    }
  }

  /** fraction of particles still resting on the active area (illustrative, not a measurement) */
  remaining(halfW: number): number {
    let c = 0;
    for (let i = 0; i < this.n; i++) if (this.state[i] === REST && Math.abs(this.u[i]) <= halfW) c++;
    return c / this.n;
  }

  step(dt: number, t: number, p: SimParams, energized: boolean) {
    const nGroups = phaseOffsetsDeg(p.mode).length;
    for (let i = 0; i < this.n; i++) {
      const s = this.state[i];
      if (s === GONE || s === FLOOR) continue;
      if (s === REST) {
        if (!energized) continue;
        const idx = Math.floor((this.u[i] + p.halfW) / p.pitch);
        const g = ((idx % nGroups) + nGroups) % nGroups;
        const d = groupDrive(g, p.mode, p.hz, t);
        const rising = this.prev[i] < 0.5 && d >= 0.5;
        this.prev[i] = d;
        const kind = p.response === 'mixed' ? (this.jitter[i] < 0.5 ? 'charged' : 'polarizable') : p.response;
        const resp = kind === 'charged' ? 1 : 0.7;
        const strength = p.voltage * resp;
        const adh = p.idealized ? 0.1 : this.adhesion[i] * (0.6 + 0.8 * Math.min(1.6, this.sizeMul[i]) / 1.6);
        if (rising && strength > adh) {
          const v = p.idealized ? 1 : 0.6 + 0.8 * this.rand();
          this.vh[i] = (1.0 + 0.9 * strength) * v;
          let dir = 1;
          if (p.mode === 3) dir = kind === 'charged' ? this.charge[i] : 1;
          else dir = p.idealized ? 1 : this.rand() < 0.5 ? -1 : 1;
          const travel = p.mode === 3 ? 1 : 0.25;
          this.vu[i] = dir * travel * (0.55 + 0.7 * strength) * (p.idealized ? 1 : 0.5 + this.rand());
          this.state[i] = AIR;
        }
        continue;
      }
      // airborne: ballistic
      this.vh[i] -= GRAVITY * dt;
      this.h[i] += this.vh[i] * dt;
      this.u[i] += this.vu[i] * dt;
      const outside = Math.abs(this.u[i]) > p.halfW;
      if (outside && !p.reimpact) { this.state[i] = GONE; continue; }
      const floor = outside ? -p.floorDrop : 0;
      if (this.h[i] <= floor && this.vh[i] < 0) {
        this.h[i] = floor; this.vu[i] = 0; this.vh[i] = 0;
        this.state[i] = outside ? FLOOR : REST;
        this.prev[i] = 1; // avoid instant re-lift
      }
    }
  }
}

export const COUNTS = { low: 140, medium: 360, high: 760 } as const;
export const SIZES = { small: 0.016, medium: 0.026, large: 0.038 } as const;
