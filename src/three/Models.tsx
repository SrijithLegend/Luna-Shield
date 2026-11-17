import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from './ctx';
import { BentBox, Part } from './Part';
import { bendXY } from './layout';
import { useStore } from '../state/store';
import { groupDrive, phaseOffsetsDeg } from '../utils/physics';

/** Electrode strips, grouped A/B/C. Each group shares a material that glows with its (illustrative) drive level. */
function Electrodes() {
  const { layout, mats, k, clock } = useScene();
  const { dim, parts } = layout;
  const p = parts.electrodes;
  const phaseMode = useStore((s) => s.phaseMode);
  const cfgPhase = useScene().cfg === 'demonstrator' ? 3 : phaseMode;
  const selected = useStore((s) => s.selected === 'electrodes');
  const energized = useStore((s) => s.energized);
  const freq = useStore((s) => s.freq);
  const voltage = useStore((s) => s.voltage);
  const failure = useStore((s) => s.failureView);
  const anim = useStore((s) => s.animMode);
  const n = Math.floor((dim.halfW * 2) / dim.pitch);
  const nGroups = phaseOffsetsDeg(cfgPhase).length;
  const xs = useMemo(() => Array.from({ length: n }, (_, i) => -dim.halfW + dim.pitch * (i + 0.5)), [n, dim]);

  useFrame(() => {
    for (let g = 0; g < 3; g++) {
      const m = mats.copper[g];
      m.userData.noHL = true;
      if (g >= nGroups) { m.emissiveIntensity = 0; continue; }
      let e = selected ? 0.25 : 0;
      if (energized) {
        const d = groupDrive(g, cfgPhase as 1 | 2 | 3, freq, clock.current.t);
        // positive half = cyan glow, negative half = faint; amplitude is an illustrative display parameter
        e = Math.max(e, (d > 0 ? d : d * 0.12 * -1) * (0.25 + voltage * 1.5));
      }
      m.emissiveIntensity = e;
      m.emissive.set(energized ? (groupDrive(g, cfgPhase as 1 | 2 | 3, freq, clock.current.t) >= 0 ? '#22d3ee' : '#3b5bdb') : '#22d3ee');
    }
  });

  const crackIdx = Math.floor(n * 0.62);
  return (
    <Part id="electrodes" anchor={[0, 0, 0]}>
      {xs.map((x, i) => {
        const strain = anim === 'bending' && (Math.abs(x) > dim.halfW * 0.55);
        const mat = failure && i === crackIdx ? mats.copper[0] : mats.copper[i % nGroups];
        return (
          <group key={i}>
            <BentBox w={dim.stripW} t={p.t} d={dim.halfD * 2 * 0.94} cx={x} k={k} mat={mat} segX={2} />
            {strain && (
              <mesh position={[bendXY(x, p.t, k)[0], bendXY(x, p.t, k)[1] + 0.02, 0]}>
                <boxGeometry args={[dim.stripW * 1.15, 0.01, dim.halfD * 2 * 0.94]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* group tags A/B/C above the first three strips */}
      {['A', 'B', 'C'].slice(0, nGroups).map((tag, g) => {
        const [bx, by] = bendXY(xs[g], 0.25, k);
        return (
          <Html key={tag} position={[bx, by, dim.halfD + 0.15]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <span className="ls-tag">{tag}</span>
          </Html>
        );
      })}
    </Part>
  );
}

function Host() {
  const { layout, mats, k } = useScene();
  const t = layout.parts.host.t;
  return (
    <Part id="host">
      <BentBox w={layout.dim.halfW * 2 + 0.3} t={t} d={layout.dim.halfD * 2 + 0.3} k={k} mat={mats.host} />
    </Part>
  );
}

function Plate({ id, mat }: { id: string; mat: THREE.Material }) {
  const { layout, k } = useScene();
  const { dim } = layout;
  return (
    <Part id={id}>
      <BentBox w={dim.halfW * 2} t={layout.parts[id].t} d={dim.halfD * 2} k={k} mat={mat} />
    </Part>
  );
}

export function ProfessionalModel() {
  const { mats, layout } = useScene();
  const hw = layout.dim.halfW;
  return (
    <>
      <Host />
      <Plate id="adhesive" mat={mats.adhesive} />
      <Plate id="substrate" mat={mats.substrate} />
      <Electrodes />
      <Plate id="dielectric" mat={mats.dielectric} />

      <Part id="connector" anchor={[0, 0, 0]}>
        <mesh material={mats.substrate} position={[-0.25, 0, 0]}><boxGeometry args={[0.6, 0.012, 0.9]} /></mesh>
        <mesh material={mats.connector} position={[0.2, 0.04, 0]} castShadow><boxGeometry args={[0.35, 0.14, 1.0]} /></mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} material={mats.gold} position={[0.38, 0.04, -0.4 + i * 0.115]}><boxGeometry args={[0.05, 0.04, 0.05]} /></mesh>
        ))}
      </Part>

      <Part id="driver">
        <mesh material={mats.aluminium} castShadow receiveShadow><boxGeometry args={[1.2, 0.55, 1.2]} /></mesh>
        {[-0.5, 0.5].flatMap((x) => [-0.5, 0.5].map((z) => (
          <mesh key={`${x}${z}`} material={mats.black} position={[x, 0.29, z]}><cylinderGeometry args={[0.04, 0.04, 0.03, 12]} /></mesh>
        )))}
        {[-0.3, 0, 0.3].map((z) => (
          <mesh key={z} material={mats.black} position={[0, 0.285, z]}><boxGeometry args={[1.0, 0.012, 0.03]} /></mesh>
        ))}
        <mesh material={mats.amber} position={[0.35, 0.285, 0.5]}><boxGeometry args={[0.18, 0.015, 0.06]} /></mesh>
        <Html position={[0.35, 0.45, 0.5]} center style={{ pointerEvents: 'none' }}><span className="ls-warn">HV</span></Html>
      </Part>

      <Part id="lv">
        <mesh material={mats.aluminium} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.16, 0.16, 0.3, 24]} /></mesh>
        <mesh material={mats.gold} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.16]}><cylinderGeometry args={[0.1, 0.1, 0.03, 20]} /></mesh>
      </Part>

      <Part id="sensor">
        <mesh material={mats.black} castShadow><boxGeometry args={[0.4, 0.22, 0.3]} /></mesh>
        <mesh material={mats.glass} position={[0, 0.07, 0.155]}><cylinderGeometry args={[0.06, 0.06, 0.02, 16]} /></mesh>
      </Part>
      {/* silence unused */}
      <group position={[hw, 0, 0]} visible={false} />
    </>
  );
}

function HvModules() {
  const { mats } = useScene();
  return (
    <Part id="hv" anchor={[-0.45, 0, 0]}>
      {[-1.0, 0, 1.0].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh material={mats.black} castShadow><boxGeometry args={[0.75, 0.3, 0.55]} /></mesh>
          <mesh material={mats.amber} position={[0, 0.16, 0]}><boxGeometry args={[0.5, 0.01, 0.3]} /></mesh>
          <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}><span className="ls-warn">UNVERIFIED CANDIDATE</span></Html>
        </group>
      ))}
    </Part>
  );
}

export function DemonstratorModel() {
  const { mats, layout, k } = useScene();
  const { dim } = layout;
  return (
    <>
      <Part id="frame">
        <BentBox w={dim.halfW * 2 + 0.6} t={layout.parts.frame.t} d={dim.halfD * 2 + 0.6} k={k} mat={mats.frame} />
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={mats.frame} position={[sx * (dim.halfW + 0.2), 0.12, sz * (dim.halfD + 0.2)]}><boxGeometry args={[0.15, 0.2, 0.15]} /></mesh>
        )))}
      </Part>
      <Plate id="substrate" mat={mats.substrate} />
      <Electrodes />
      <Plate id="cover" mat={mats.cover} />

      <Part id="connector" anchor={[0, 0, 0]}>
        <mesh material={mats.substrate} position={[-0.2, 0, 0]}><boxGeometry args={[0.8, 0.012, 0.8]} /></mesh>
        <mesh material={mats.connector} position={[0.3, 0.04, 0]} castShadow><boxGeometry args={[0.3, 0.12, 0.9]} /></mesh>
      </Part>

      <HvModules />

      <Part id="arduino" anchor={[0.6, 0, 0]}>
        <mesh material={mats.pcbBlue} castShadow><boxGeometry args={[1.35, 0.06, 1.0]} /></mesh>
        <mesh material={mats.chip} position={[0.1, 0.06, 0]}><boxGeometry args={[0.5, 0.06, 0.18]} /></mesh>
        <mesh material={mats.aluminium} position={[-0.58, 0.1, 0.25]}><boxGeometry args={[0.2, 0.14, 0.25]} /></mesh>
      </Part>

      <Part id="enclosure">
        <mesh material={mats.glass}><boxGeometry args={[dim.halfW * 2 + 1, 1.7, dim.halfD * 2 + 1]} /></mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(dim.halfW * 2 + 1, 1.7, dim.halfD * 2 + 1)]} />
          <lineBasicMaterial color="#7fb7c9" transparent opacity={0.5} />
        </lineSegments>
      </Part>

      <Part id="particles">
        {/* camera + LED lighting rig (fixed camera and fixed lighting for repeatable imaging) */}
        <mesh material={mats.black} castShadow><boxGeometry args={[0.3, 0.2, 0.25]} /></mesh>
        <mesh material={mats.glass} position={[0.1, -0.12, 0.1]} rotation={[Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.05, 16]} /></mesh>
        <mesh material={mats.amber} position={[0.35, 0, 0]}><boxGeometry args={[0.25, 0.04, 0.06]} /></mesh>
      </Part>
    </>
  );
}
