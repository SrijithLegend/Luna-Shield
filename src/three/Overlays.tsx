import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { useScene } from './ctx';
import { bendXY } from './layout';
import { groupDrive, phaseOffsetsDeg } from '../utils/physics';

const SEG = 16;

/**
 * Illustrative field-line overlay: arcs between adjacent electrodes whose opacity follows the
 * difference of the two neighbouring groups' (illustrative) drive. NOT a solved field.
 */
export function FieldLines() {
  const { cfg, layout, k, ex, clock } = useScene();
  const { dim, topY, topIndex, parts } = layout;
  const on = useStore((s) => s.fieldLines);
  const energized = useStore((s) => s.energized);
  const n = Math.floor((dim.halfW * 2) / dim.pitch);
  const topId = Object.keys(parts).find((id) => parts[id].stackIndex === topIndex)!;
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.LineBasicMaterial[]>([]);

  const lines = useMemo(() => {
    const out: THREE.Line[] = [];
    mats.current = [];
    for (let i = 0; i < n - 1; i++) {
      for (const hMul of [1, 1.9]) {
        const x0 = -dim.halfW + dim.pitch * (i + 0.5);
        const x1 = x0 + dim.pitch;
        const pts: THREE.Vector3[] = [];
        for (let j = 0; j <= SEG; j++) {
          const a = (j / SEG) * Math.PI;
          const u = x0 + (x1 - x0) * (0.5 - 0.5 * Math.cos(a));
          const h = Math.sin(a) * dim.pitch * 0.9 * hMul;
          const [wx, wy] = bendXY(u, topY + 0.01 + h, k);
          pts.push(new THREE.Vector3(wx, wy, 0));
        }
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0, depthWrite: false });
        mats.current.push(m);
        const l = new THREE.Line(g, m);
        l.userData = { i, hMul };
        out.push(l);
      }
    }
    return out;
  }, [n, dim, topY, k]);

  useFrame(() => {
    const s = useStore.getState();
    if (group.current) {
      group.current.visible = on;
      group.current.position.y = ex.current * parts[topId].ex[1];
    }
    if (!on) return;
    const mode = (cfg === 'demonstrator' ? 3 : s.phaseMode) as 1 | 2 | 3;
    const ng = phaseOffsetsDeg(mode).length;
    lines.forEach((l, idx) => {
      const { i, hMul } = l.userData as { i: number; hMul: number };
      const a = groupDrive(i % ng, mode, s.freq, clock.current.t);
      const b = groupDrive((i + 1) % ng, mode, s.freq, clock.current.t);
      const strength = energized ? Math.min(1, Math.abs(a - b) / 2) : 0.08;
      mats.current[idx].opacity = strength * (0.25 + s.voltage * 0.7) * (hMul > 1 ? 0.45 : 1);
    });
  });

  return (
    <group ref={group}>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
    </group>
  );
}

/** Failure-mode pins and bending strain-risk legend. Annotated scenarios, not measured predictions. */
export function Annotations() {
  const { layout, k, ex } = useScene();
  const failure = useStore((s) => s.failureView);
  const anim = useStore((s) => s.animMode);
  const pro = useScene().cfg === 'professional';
  const { parts, dim } = layout;
  const pins = useMemo(() => {
    const ids = pro
      ? [
          { id: 'electrodes', text: 'Copper trace crack (annotated scenario)', dz: 0.6 },
          { id: 'dielectric', text: 'Dielectric breakdown site (annotated scenario)', dz: -0.5 },
          { id: 'adhesive', text: 'Adhesive failure (annotated scenario)', dz: 0.9 },
          { id: 'substrate', text: 'Delamination (annotated scenario)', dz: -0.9 },
        ]
      : [
          { id: 'electrodes', text: 'Copper trace crack (annotated scenario)', dz: 0.6 },
          { id: 'cover', text: 'Dielectric breakdown site (annotated scenario)', dz: -0.5 },
          { id: 'substrate', text: 'Delamination (annotated scenario)', dz: -0.9 },
        ];
    return ids.map((p, i) => ({ ...p, i, part: parts[p.id] }));
  }, [pro, parts]);
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    pins.forEach((p, i) => {
      const g = refs.current[i];
      if (!g) return;
      const [x, y, z] = [p.part.base[0] + p.part.ex[0] * ex.current, p.part.base[1] + p.part.ex[1] * ex.current, p.part.base[2] + p.part.ex[2] * ex.current];
      const [wx, wy] = bendXY(dim.halfW * 0.35 + x, p.part.t / 2 + 0.02, k);
      g.position.set(wx, y + wy, z + p.dz);
    });
  });

  if (!failure && anim !== 'bending') return null;
  return (
    <>
      {failure && pins.map((p, i) => (
        <group key={p.id} ref={(el) => { refs.current[i] = el; }}>
          <mesh><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#f87171" /></mesh>
          <Html position={[0.12, 0.12, 0]} style={{ pointerEvents: 'none' }}><span className="ls-fail">{p.text}</span></Html>
        </group>
      ))}
      {anim === 'bending' && (
        <Html position={[0, 1.3, 0]} center style={{ pointerEvents: 'none' }}>
          <span className="ls-fail ls-fail-amber">Amber zones: conceptual strain-risk regions — not a strain calculation</span>
        </Html>
      )}
    </>
  );
}
