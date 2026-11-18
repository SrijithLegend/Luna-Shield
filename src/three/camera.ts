import type { ConfigId } from '../data';
import type { Page } from '../state/store';

export interface View { az: number; el: number; dist: number; target: [number, number, number] }

const V = (az: number, el: number, dist: number, target: [number, number, number]): View => ({ az, el, dist, target });

/** Chapter camera bookmarks (index = chapter). */
export const CHAPTER_VIEWS: View[] = [
  V(22, 34, 7.2, [0, 0.2, 0]),      // 01 problem
  V(8, 64, 6.8, [0, 0.2, 0]),       // 02 principle
  V(58, 12, 10.5, [0.6, 1.0, 0]),   // 03 flexible stack
  V(72, 24, 9.5, [2.2, 0.4, 0]),    // 04 power system
  V(24, 38, 7.6, [0, 0.2, 0]),      // 05 dust transport
  V(38, 20, 10.5, [0.9, 0.6, 0]),   // 06 professional
  V(36, 28, 11.5, [0.3, 0.6, 0]),   // 07 demonstrator
  V(52, 20, 9.5, [0.6, 0.6, 0]),    // 08 what must be proven
];

/** Chapter views for the lunar showcase (habitat + astronaut). */
export const CONTEXT_VIEWS: View[] = [
  V(24, 13, 21, [-1.5, 1.6, 1.5]),    // 01 problem — wide, dusty
  V(14, 24, 9, [-2.7, 3.6, 0]),       // 02 principle — roof radiator film
  V(58, 12, 10.5, [0.6, 1.0, 0]),
  V(72, 24, 9.5, [2.2, 0.4, 0]),
  V(26, 26, 10, [-2.7, 3.4, 0]),      // 05 transport
  V(20, 8, 8, [2.4, 1.2, 5.0]),       // 06 astronaut
  V(36, 28, 11.5, [0.3, 0.6, 0]),
  V(52, 20, 9.5, [0.6, 0.6, 0]),
];

export const PAGE_VIEWS: Record<Page, View> = {
  overview: V(35, 22, 11.5, [0.9, 0.4, 0]),
  principle: V(10, 58, 7.2, [0, 0.2, 0]),
  assembly: V(55, 15, 11.5, [1.0, 1.0, 0]),
  materials: V(40, 20, 11, [0.9, 0.5, 0]),
  electrical: V(70, 24, 10, [2.2, 0.4, 0]),
  simulation: V(30, 36, 9, [0.4, 0.3, 0]),
  configurations: V(35, 25, 11, [0.6, 0.5, 0]),
  cost: V(35, 22, 11, [0.9, 0.4, 0]),
  validation: V(35, 22, 11, [0.9, 0.4, 0]),
  evidence: V(35, 22, 11, [0.9, 0.4, 0]),
};

export function viewToPose(v: View, cfg: ConfigId) {
  const [tx, ty, tz] = v.target;
  // demonstrator has electronics on both sides, so centre the target
  const cx = cfg === 'demonstrator' ? tx * 0.35 : tx;
  const az = (v.az * Math.PI) / 180, el = (v.el * Math.PI) / 180;
  const d = cfg === 'demonstrator' ? v.dist * 1.08 : v.dist;
  return {
    pos: [cx + d * Math.cos(el) * Math.sin(az), ty + d * Math.sin(el), tz + d * Math.cos(el) * Math.cos(az)] as [number, number, number],
    target: [cx, ty, tz] as [number, number, number],
  };
}
