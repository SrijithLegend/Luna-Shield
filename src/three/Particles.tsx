import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { useScene } from './ctx';
import { bendXY } from './layout';
import { AIR, COUNTS, FLOOR, GONE, ParticleSim, REST, SIZES } from './sim';

/** Live (qualitative) stat shared with the HUD. Not a measurement. */
export const simStats = { remaining: 1 };

const TRACK = 40;
const HIST = 10;
const STATE_TEXT = ['resting on surface', 'airborne (illustrative)', 'left active area', 'landed beyond edge'];

export function Particles() {
  const { cfg, layout, k, ex, clock, interactive } = useScene();
  const { dim, topY, topIndex } = layout;
  const loading = useStore((s) => s.loading);
  const psize = useStore((s) => s.psize);
  const dustOn = useStore((s) => s.dustOn);
  const trails = useStore((s) => s.trails);
  const dustLabels = useStore((s) => s.dustLabels);
  const resetKey = useStore((s) => s.resetKey);
  const select = useStore((s) => s.select);
  const uniform = cfg === 'demonstrator';
  const count = COUNTS[loading];

  const sim = useMemo(() => new ParticleSim(count, 1337, dim.halfW, dim.halfD, uniform), [count, dim.halfW, dim.halfD, uniform]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const last = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => (uniform ? new THREE.SphereGeometry(1, 10, 8) : new THREE.IcosahedronGeometry(1, 0)), [uniform]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: uniform ? '#f3f0e8' : '#b9b2a4', roughness: uniform ? 0.25 : 0.95, metalness: 0 }), [uniform]);

  // trails
  const trailGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const trailPos = useMemo(() => new Float32Array(TRACK * (HIST - 1) * 2 * 3), []);
  const hist = useRef(new Float32Array(TRACK * HIST * 3));
  const histN = useRef(0);
  useEffect(() => { trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3)); }, [trailGeo, trailPos]);

  const labelRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const labelText = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  const frame = useRef(0);

  useEffect(() => { sim.reset(); last.current = 0; histN.current = 0; }, [sim, resetKey]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = useStore.getState();
    const t = clock.current.t;
    let dt = t - last.current;
    if (dt < 0) { dt = 0; }
    last.current = t;
    if (dt > 0) {
      const sub = Math.max(1, Math.ceil(dt / 0.02));
      for (let i = 0; i < sub; i++) {
        sim.step(dt / sub, t - dt + (dt * (i + 1)) / sub, {
          mode: cfg === 'demonstrator' ? 3 : s.phaseMode, hz: s.freq, voltage: s.voltage,
          response: s.response, idealized: s.idealized, reimpact: s.reimpact, halfW: dim.halfW, pitch: dim.pitch, floorDrop: topY,
        }, s.energized);
      }
    }
    if (group.current) group.current.position.y = ex.current * layout.parts[Object.keys(layout.parts).find((id) => layout.parts[id].stackIndex === topIndex)!].ex[1];
    const r0 = SIZES[psize];
    for (let i = 0; i < sim.n; i++) {
      const st = sim.state[i];
      const r = r0 * sim.sizeMul[i];
      if (st === GONE) { dummy.scale.setScalar(0); dummy.position.set(0, -50, 0); }
      else {
        const [wx, wy] = bendXY(sim.u[i], topY + r * 0.8 + sim.h[i], k);
        dummy.position.set(wx, wy, sim.w[i]);
        if (uniform) dummy.scale.setScalar(r);
        else dummy.scale.set(r * (0.8 + sim.jitter[i] * 0.6), r * (0.6 + sim.jitter[(i * 7) % sim.n] * 0.6), r * (0.8 + sim.adhesion[i] * 0.5));
        dummy.rotation.set(sim.jitter[i] * 6, sim.adhesion[i] * 6, 0);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.visible = dustOn;

    frame.current++;
    if (frame.current % 12 === 0 && interactive) simStats.remaining = sim.remaining(dim.halfW);

    // trails: ring buffer sampled each frame the clock moves
    if (trails && dt > 0) {
      const H = hist.current, n = Math.min(TRACK, sim.n);
      const head = histN.current % HIST;
      for (let i = 0; i < n; i++) {
        const [wx, wy] = bendXY(sim.u[i], topY + sim.h[i], k);
        H[(i * HIST + head) * 3] = wx; H[(i * HIST + head) * 3 + 1] = wy; H[(i * HIST + head) * 3 + 2] = sim.w[i];
      }
      histN.current++;
      let o = 0;
      for (let i = 0; i < n; i++) {
        const air = sim.state[i] === AIR;
        for (let j = 0; j < HIST - 1; j++) {
          const a = ((head - j + HIST * 2) % HIST), b = ((head - j - 1 + HIST * 2) % HIST);
          const ok = air && histN.current > j + 1;
          for (let c = 0; c < 3; c++) trailPos[o++] = ok ? H[(i * HIST + a) * 3 + c] : 0;
          for (let c = 0; c < 3; c++) trailPos[o++] = ok ? H[(i * HIST + b) * 3 + c] : 0;
        }
      }
      (trailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    if (dustLabels) {
      // pick one resting, one airborne, one off-panel particle (if any) to annotate
      const picks = [REST, AIR, FLOOR].map((want) => { for (let i = 0; i < sim.n; i++) if (sim.state[i] === want) return i; return -1; });
      picks.forEach((idx, j) => {
        const g = labelRefs[j].current;
        if (!g) return;
        if (idx < 0) { g.visible = false; return; }
        g.visible = true;
        const [wx, wy] = bendXY(sim.u[idx], topY + sim.h[idx] + 0.1, k);
        g.position.set(wx, wy, sim.w[idx]);
        const el = labelText[j].current;
        if (el) el.textContent = `particle ${idx} · ${STATE_TEXT[sim.state[idx]]}`;
      });
    }
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh} args={[geo, mat, count]} castShadow frustumCulled={false}
        onClick={interactive && uniform ? (e) => { e.stopPropagation(); select('particles'); } : undefined}
      />
      {trails && (
        <lineSegments geometry={trailGeo} frustumCulled={false}>
          <lineBasicMaterial color="#22d3ee" transparent opacity={0.45} />
        </lineSegments>
      )}
      {dustLabels && labelRefs.map((r, j) => (
        <group key={j} ref={r}>
          <Html center distanceFactor={undefined} style={{ pointerEvents: 'none', transform: 'translate(0,-18px)' }}>
            <span ref={labelText[j]} className="ls-dust" />
          </Html>
        </group>
      ))}
    </group>
  );
}
