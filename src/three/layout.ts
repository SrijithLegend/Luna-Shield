import * as THREE from 'three';
import type { ConfigId } from '../data';
import type { Curvature } from '../state/store';

export const CURV: Record<Curvature, number> = { flat: 0, mild: 0.18, curved: 0.42 };
export const GAP = 0.55; // exploded spacing per stack index

/** Map a point (u along sheet, h along local normal) to world x,y for a sheet bent about the z axis. */
export function bendXY(u: number, h: number, k: number): [number, number] {
  if (!k) return [u, h];
  const a = k * u;
  return [Math.sin(a) / k - h * Math.sin(a), (1 - Math.cos(a)) / k + h * Math.cos(a)];
}

export function bendGeometry<T extends THREE.BufferGeometry>(g: T, k: number): T {
  if (!k) return g;
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const [x, y] = bendXY(p.getX(i), p.getY(i), k);
    p.setXY(i, x, y);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

export interface Dim { halfW: number; halfD: number; pitch: number; stripW: number }
export interface PartLayout {
  id: string;
  base: [number, number, number];
  ex: [number, number, number];
  side: -1 | 1;
  /** drawn thickness (stack parts) */
  t: number;
  stackIndex: number; // -1 for non-stack
  labelY: number;
}
export interface Layout { dim: Dim; parts: Record<string, PartLayout>; topY: number; topIndex: number; labelX: number }

type Spec = { id: string; t: number };

export function layoutFor(cfg: ConfigId, exag: boolean): Layout {
  const m = exag ? 1 : 0.12;
  const pro = cfg === 'professional';
  const dim: Dim = pro ? { halfW: 2, halfD: 1.5, pitch: 0.16, stripW: 0.1 } : { halfW: 1.5, halfD: 1.5, pitch: 0.3, stripW: 0.2 };
  const stack: Spec[] = pro
    ? [{ id: 'host', t: 0.14 }, { id: 'adhesive', t: 0.02 * m }, { id: 'substrate', t: 0.05 * m }, { id: 'electrodes', t: 0.03 * m }, { id: 'dielectric', t: 0.04 * m }]
    : [{ id: 'frame', t: 0.1 }, { id: 'substrate', t: 0.05 * m }, { id: 'electrodes', t: 0.03 * m }, { id: 'cover', t: 0.03 * m }];
  const parts: Record<string, PartLayout> = {};
  let y = 0;
  stack.forEach((s, i) => {
    // electrodes sit on the substrate top; the next layer starts above them
    const base: [number, number, number] = [0, y + s.t / 2, 0];
    parts[s.id] = { id: s.id, base, ex: [0, i * GAP, 0], side: -1, t: s.t, stackIndex: i, labelY: 0 };
    y += s.t;
  });
  const topY = y;
  const topIndex = stack.length - 1;
  const E = (id: string, base: [number, number, number], ex: [number, number, number], side: -1 | 1 = 1) => {
    parts[id] = { id, base, ex, side, t: 0, stackIndex: -1, labelY: 0 };
  };
  const hw = dim.halfW;
  if (pro) {
    E('connector', [hw + 0.2, topY - 0.05, 0], [0.5, 1.4, 0]);
    E('driver', [hw + 1.5, 0.3, 0], [1.2, 0.1, 0]);
    E('lv', [hw + 1.5, 0.3, 0.85], [1.2, 0.1, 0.9]);
    E('sensor', [-1.2, 0.2, hw - 0.2], [-0.9, 1.6, 1.0]);
  } else {
    E('connector', [hw + 0.45, topY - 0.02, 0], [0.5, 1.2, 0]);
    E('hv', [hw + 1.6, 0.2, 0], [1.0, 0.4, 0]);
    E('arduino', [-hw - 1.6, 0.06, 0], [-1.0, 0.3, 0], 1);
    E('enclosure', [0, 0.85, 0], [0, 2.4, 0], -1);
    E('particles', [-1.15, 2.0, -1.15], [-0.6, 1.2, -0.6], -1);
  }
  // label placement: stack + left-side labels in a left column, everything else on the right, evenly spaced
  const left = Object.values(parts).filter((p) => p.side === -1);
  const right = Object.values(parts).filter((p) => p.side === 1);
  const place = (arr: PartLayout[]) => arr.forEach((p, i) => (p.labelY = 1.7 - i * 0.62 - (arr.length > 5 ? 0 : 0)));
  place(left); place(right);
  return { dim, parts, topY, topIndex, labelX: hw + 3.4 };
}

/** world position of a part at explode amount e (0..1) */
export function partPos(p: PartLayout, e: number): [number, number, number] {
  return [p.base[0] + p.ex[0] * e, p.base[1] + p.ex[1] * e, p.base[2] + p.ex[2] * e];
}
