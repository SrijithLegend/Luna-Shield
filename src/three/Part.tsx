import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { CONFIGS } from '../data';
import { useScene } from './ctx';
import { bendGeometry, partPos } from './layout';

/** Box that is bent about z to follow the surface curvature. */
export function BentBox({ w, t, d, cx = 0, k, mat, segX = 48 }: { w: number; t: number; d: number; cx?: number; k: number; mat: THREE.Material; segX?: number }) {
  const g = useMemo(() => {
    const geo = new THREE.BoxGeometry(w, t, d, segX, 1, 1);
    geo.translate(cx, 0, 0);
    return bendGeometry(geo, k);
  }, [w, t, d, cx, k, segX]);
  useEffect(() => () => g.dispose(), [g]);
  return <mesh geometry={g} material={mat} castShadow receiveShadow />;
}

/**
 * Selectable, hideable, explodable part with a leader-line label.
 * Position = base + explode × offset (eased value held in scene ctx).
 */
export function Part({ id, children, anchor }: { id: string; children: ReactNode; anchor?: [number, number, number] }) {
  const { cfg, layout, ex, interactive } = useScene();
  const p = layout.parts[id];
  const g = useRef<THREE.Group>(null);
  const hover = useRef(false);
  const hl = useRef(0);
  const line = useRef<any>(null);
  const selected = useStore((s) => s.selected === id);
  const labels = useStore((s) => s.labels);
  const hiddenFlag = useStore((s) => s.hidden.includes(id) || (!!s.isolated && s.isolated !== id));
  const select = useStore((s) => s.select);
  const info = CONFIGS[cfg].layers.find((l) => l.id === id);
  const reduced = useStore((s) => s.reducedMotion);

  const lx = p.side * layout.labelX;
  const ly = p.labelY;
  const labelPt = useMemo(() => new THREE.Vector3(lx, ly, 0), [lx, ly]);
  const startPt = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    const [x, y, z] = partPos(p, ex.current);
    o.position.set(x, y, z);
    o.visible = !hiddenFlag;
    const target = selected ? 1 : hover.current ? 0.55 : 0;
    hl.current += (target - hl.current) * Math.min(1, dt * (reduced ? 60 : 10));
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && 'emissive' in m && !m.userData.noHL) {
        if (m.userData.baseEI === undefined) { m.userData.baseEI = m.emissiveIntensity; m.userData.baseE = m.emissive.clone(); }
        if (hl.current > 0.01) { m.emissive.set('#22d3ee'); m.emissiveIntensity = hl.current * 0.35; }
        else { m.emissive.copy(m.userData.baseE); m.emissiveIntensity = m.userData.baseEI; }
      }
    });
    if (line.current) {
      const a = anchor ?? [0, 0, 0];
      startPt.set(x + (anchor ? a[0] : p.side * (p.stackIndex >= 0 ? layout.dim.halfW : 0)), y + a[1], z + a[2]);
      line.current.geometry.setPositions([startPt.x, startPt.y, startPt.z, labelPt.x, labelPt.y, labelPt.z]);
      line.current.visible = !hiddenFlag && labels;
    }
  });

  return (
    <>
      <group
        ref={g}
        onClick={interactive ? (e) => { e.stopPropagation(); select(selected ? null : id); } : undefined}
        onPointerOver={interactive ? (e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = 'pointer'; } : undefined}
        onPointerOut={interactive ? () => { hover.current = false; document.body.style.cursor = ''; } : undefined}
      >
        {children}
      </group>
      {labels && !hiddenFlag && (
        <>
          <Line ref={line} points={[[0, 0, 0], [1, 0, 0]]} color={selected ? '#22d3ee' : '#5b6b7b'} lineWidth={1} transparent opacity={0.7} />
          <Html position={[lx, ly, 0]} style={{ pointerEvents: interactive ? 'auto' : 'none' }} zIndexRange={[20, 0]}
            center={false} transform={false} className="ls-label-wrap">
            <button
              type="button"
              onClick={() => select(selected ? null : id)}
              className={`ls-label ${p.side === -1 ? 'ls-label-left' : ''} ${selected ? 'ls-label-on' : ''}`}
            >
              <span className="ls-label-n">{info?.name ?? id}</span>
              <span className="ls-label-t">{info?.thickness.value != null ? `${info.thickness.value} ${info.thickness.unit} · ${info.thickness.tag}` : ''}</span>
            </button>
          </Html>
        </>
      )}
    </>
  );
}
