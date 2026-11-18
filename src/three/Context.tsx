import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Html, Lightformer, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { Ctx, useScene, type SceneCtx } from './ctx';
import { layoutFor } from './layout';
import { hostMaterial, makeMaterials } from './materials';
import { Particles } from './Particles';
import { FieldLines } from './Overlays';
import { useGlow } from './Models';
import { phaseOffsetsDeg, rng } from '../utils/physics';

const PITCH = 0.16;
const STRIP = 0.1;
const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

/** Flat film patch (substrate + A/B/C electrodes) with its own dust and field-line overlay. */
function FlatPatch({ w, d, clear = false, dust = true, countScale = 1 }: { w: number; d: number; clear?: boolean; dust?: boolean; countScale?: number }) {
  const parent = useScene();
  const phaseMode = useStore((s) => s.phaseMode);
  const nGroups = phaseOffsetsDeg(phaseMode).length;
  const n = Math.floor(w / PITCH);
  const xs = useMemo(() => Array.from({ length: n }, (_, i) => -w / 2 + PITCH * (i + 0.5)), [n, w]);
  const ctx = useMemo<SceneCtx>(() => ({
    ...parent,
    k: 0,
    layout: {
      dim: { halfW: w / 2, halfD: d / 2, pitch: PITCH, stripW: STRIP }, topY: 0.045, topIndex: 0, labelX: 0,
      parts: { film: { id: 'film', base: [0, 0, 0], ex: [0, 0, 0], side: 1, t: 0.02, stackIndex: 0, labelY: 0 } },
    },
  }), [parent, w, d]);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.01, 0]} material={clear ? parent.mats.dielectric : parent.mats.substrate}><boxGeometry args={[w, 0.02, d]} /></mesh>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0]} material={parent.mats.copper[i % nGroups]}><boxGeometry args={[STRIP, 0.02, d * 0.94]} /></mesh>
      ))}
      <mesh position={[0, 0.045, 0]} material={parent.mats.dielectric}><boxGeometry args={[w, 0.012, d]} /></mesh>
      <Ctx.Provider value={ctx}>
        <FieldLines />
        {dust && <Particles countScale={countScale} sizeScale={0.8} leave />}
      </Ctx.Provider>
    </group>
  );
}

/** Vertical strips following a cylindrical suit segment; glow follows the A/B/C pattern around the arc. */
function WrapStrips({ r, h, arc, n, position, rotation }: { r: number; h: number; arc: number; n: number; position: [number, number, number]; rotation?: [number, number, number] }) {
  const { mats } = useScene();
  const phaseMode = useStore((s) => s.phaseMode);
  const ng = phaseOffsetsDeg(phaseMode).length;
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: n }, (_, i) => {
        const th = -arc / 2 + (arc * i) / Math.max(1, n - 1);
        return (
          <mesh key={i} position={[r * Math.sin(th), 0, r * Math.cos(th)]} rotation={[0, th, 0]} material={mats.copper[i % ng]}>
            <boxGeometry args={[(r * arc) / n * 0.38, h, 0.012]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Tag({ children, pos, onClick }: { children: ReactNode; pos: [number, number, number]; onClick: () => void }) {
  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'auto' }}>
      <button type="button" onClick={onClick} className="ls-label" style={{ transform: 'translate(-50%,-100%)' }} title="Open the layered film model">
        <span className="ls-label-n">{children}</span>
        <span className="ls-label-t">illustrative placement · click to inspect layers</span>
      </button>
    </Html>
  );
}

const openDetail = () => useStore.setState({ context: false, page: 'assembly', explode: 1, energized: false, dustOn: false });

/** Flat strips across a flat suit face (chest, etc.). */
function FrontStrips({ w, h, n, position }: { w: number; h: number; n: number; position: [number, number, number] }) {
  const { mats } = useScene();
  const ng = phaseOffsetsDeg(useStore((s) => s.phaseMode)).length;
  return (
    <group position={position}>
      <mesh material={mats.dielectric}><boxGeometry args={[w * 1.04, h * 1.04, 0.01]} /></mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[-w / 2 + (w * (i + 0.5)) / n, 0, 0.007]} material={mats.copper[i % ng]}><boxGeometry args={[(w / n) * 0.35, h, 0.008]} /></mesh>
      ))}
    </group>
  );
}

/** One pressurised module: ribbed hull, portholes, conical end cap, stilts. Reference: long dark blue-grey surface habitat. */
function Module({ x, len, cap, hull, dark, glass, rib }: { x: number; len: number; cap: -1 | 1; hull: THREE.Material; dark: THREE.Material; glass: THREE.Material; rib: THREE.Material }) {
  const R = 1.5, Y = 1.8;
  const ribs = useMemo(() => Array.from({ length: Math.floor(len / 0.95) }, (_, i) => -len / 2 + 0.5 + i * 0.95), [len]);
  const ports = useMemo(() => [-len * 0.28, 0, len * 0.28], [len]);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={hull}><cylinderGeometry args={[R, R, len, 56]} /></mesh>
      {ribs.map((rx) => <mesh key={rx} position={[rx, Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={rib}><cylinderGeometry args={[R + 0.025, R + 0.025, 0.07, 56]} /></mesh>)}
      {/* conical end cap with hatch */}
      <group position={[cap * (len / 2 + 0.42), Y, 0]} rotation={[0, 0, (-cap * Math.PI) / 2]}>
        <mesh castShadow material={hull}><cylinderGeometry args={[0.55, R, 0.85, 48]} /></mesh>
        <mesh position={[0, 0.45, 0]} material={dark}><cylinderGeometry args={[0.42, 0.42, 0.08, 32]} /></mesh>
        <mesh position={[0, 0.5, 0]} material={rib}><torusGeometry args={[0.28, 0.04, 8, 24]} /></mesh>
      </group>
      {ports.map((px) => (
        <group key={px} position={[px, Y + 0.3, R - 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={dark}><cylinderGeometry args={[0.24, 0.24, 0.08, 28]} /></mesh>
          <mesh position={[0, 0.045, 0]} material={glass}><cylinderGeometry args={[0.17, 0.17, 0.03, 28]} /></mesh>
        </group>
      ))}
      {[-len * 0.38, len * 0.38].flatMap((lx) => [-1, 1].map((z) => (
        <group key={`${lx}${z}`} position={[lx, 0.14, z * 1.05]}>
          <mesh castShadow material={dark}><cylinderGeometry args={[0.07, 0.07, 0.5, 8]} /></mesh>
          <mesh position={[0, -0.25, 0]} material={dark}><cylinderGeometry args={[0.22, 0.28, 0.06, 16]} /></mesh>
        </group>
      )))}
    </group>
  );
}

function Habitat({ radiator, solar }: { radiator: THREE.Material; solar: THREE.Material }) {
  const hull = useMemo(() => std({ color: '#5b6672', metalness: 0.35, roughness: 0.55 }), []);
  const rib = useMemo(() => std({ color: '#7d8894', metalness: 0.4, roughness: 0.5 }), []);
  const dark = useMemo(() => std({ color: '#1d2228', metalness: 0.5, roughness: 0.6 }), []);
  const light = useMemo(() => std({ color: '#d9d6cf', metalness: 0.2, roughness: 0.55 }), []);
  const glass = useMemo(() => std({ color: '#0a1b2b', metalness: 0.9, roughness: 0.1, emissive: '#16506b', emissiveIntensity: 0.3 }), []);
  const steps = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
  return (
    <group>
      <Module x={-2.7} len={5.2} cap={-1} hull={hull} dark={dark} glass={glass} rib={rib} />
      <Module x={3.5} len={4.2} cap={1} hull={hull} dark={dark} glass={glass} rib={rib} />
      {/* connecting hub */}
      <mesh position={[0.4, 1.8, 0]} castShadow receiveShadow material={dark}><boxGeometry args={[1.5, 2.3, 2.3]} /></mesh>
      {/* airlock box on stilts + stairs */}
      <group position={[0.4, 0, 2.5]}>
        {[-0.7, 0.7].flatMap((x) => [-0.55, 0.55].map((z) => <mesh key={`${x}${z}`} position={[x, 0.3, z]} material={dark}><cylinderGeometry args={[0.05, 0.05, 0.6, 8]} /></mesh>))}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow material={light}><boxGeometry args={[1.8, 1.6, 1.5]} /></mesh>
        <mesh position={[0, 1.2, 0.76]} material={dark}><boxGeometry args={[0.8, 1.15, 0.04]} /></mesh>
        {steps.map((i) => <mesh key={i} position={[0, 0.6 - i * 0.09, 1.0 + i * 0.22]} castShadow material={rib}><boxGeometry args={[0.75, 0.04, 0.22]} /></mesh>)}
      </group>
      {/* antenna dish on module B */}
      <group position={[4.2, 3.3, -0.3]}>
        <mesh position={[0, 0.3, 0]} material={dark}><cylinderGeometry args={[0.04, 0.04, 0.6, 8]} /></mesh>
        <mesh position={[0, 0.75, 0]} rotation={[-0.6, 0.5, 0]} castShadow material={light}><sphereGeometry args={[0.55, 24, 12, 0, Math.PI * 2, 0, 0.95]} /></mesh>
      </group>

      {/* roof radiator on struts (module A) */}
      {[-1.2, 1.2].flatMap((x) => [-0.7, 0.7].map((z) => <mesh key={`${x}${z}`} position={[-2.7 + x, 3.4, z]} material={dark}><cylinderGeometry args={[0.04, 0.04, 0.4, 8]} /></mesh>))}
      <mesh position={[-2.7, 3.63, 0]} castShadow receiveShadow material={radiator}><boxGeometry args={[3.2, 0.08, 1.9]} /></mesh>
      <group position={[-2.7, 3.67, 0]}><FlatPatch w={3} d={1.7} countScale={0.7} /></group>
      <Tag pos={[-2.7, 4.2, 0]} onClick={openDetail}>Habitat radiator — LunaShield film (concept)</Tag>

      {/* solar array on a stand */}
      <group position={[-9, 0, 0.5]}>
        {[-1, 1].map((x) => <mesh key={x} position={[x, 0.6, 0]} material={dark}><cylinderGeometry args={[0.05, 0.05, 1.2, 8]} /></mesh>)}
        <group position={[0, 1.4, 0]} rotation={[-0.38, 0, 0]}>
          <mesh castShadow receiveShadow material={solar}><boxGeometry args={[3.2, 0.08, 1.9]} /></mesh>
          <group position={[0, 0.04, 0]}><FlatPatch w={3} d={1.7} clear countScale={0.7} /></group>
        </group>
        <Tag pos={[0, 2.6, 0]} onClick={openDetail}>Solar array — film over solar glass (concept)</Tag>
      </group>

      <Rover />
      <Lander />
    </group>
  );
}

function Rover() {
  const body = useMemo(() => std({ color: '#e4e2dc', roughness: 0.6, metalness: 0.15 }), []);
  const tyre = useMemo(() => std({ color: '#2a2d31', roughness: 0.8 }), []);
  const hub = useMemo(() => std({ color: '#9aa1a8', metalness: 0.7, roughness: 0.4 }), []);
  return (
    <group position={[-4.6, 0, 5.2]} rotation={[0, 0.55, 0]}>
      <mesh position={[0, 0.62, 0]} castShadow material={body}><boxGeometry args={[1.5, 0.4, 0.9]} /></mesh>
      <mesh position={[-0.55, 1.15, 0]} castShadow material={body}><boxGeometry args={[0.12, 0.9, 0.8]} /></mesh>
      <mesh position={[0.35, 0.95, 0]} castShadow material={body}><boxGeometry args={[0.6, 0.3, 0.8]} /></mesh>
      {[[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]].map(([x, z], i) => (
        <group key={i} position={[x, 0.32, z * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow material={tyre}><cylinderGeometry args={[0.32, 0.32, 0.2, 20]} /></mesh>
          <mesh position={[0, z > 0 ? 0.11 : -0.11, 0]} material={hub}><cylinderGeometry args={[0.16, 0.16, 0.02, 16]} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Lander() {
  const body = useMemo(() => std({ color: '#e9e7e1', roughness: 0.5, metalness: 0.2 }), []);
  const gold = useMemo(() => std({ color: '#c79b2c', metalness: 0.9, roughness: 0.35 }), []);
  return (
    <group position={[13, 0, -13]} scale={1.5}>
      <mesh position={[0, 2.5, 0]} castShadow material={body}><cylinderGeometry args={[0.8, 0.9, 1.5, 24]} /></mesh>
      <mesh position={[0, 3.7, 0]} castShadow material={body}><cylinderGeometry args={[0.15, 0.8, 1.0, 24]} /></mesh>
      <mesh position={[0, 1.5, 0]} material={gold}><cylinderGeometry args={[0.7, 0.5, 0.5, 20]} /></mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2 + 0.78) * 1.0, 0.85, Math.sin((i * Math.PI) / 2 + 0.78) * 1.0]} rotation={[Math.sin((i * Math.PI) / 2 + 0.78) * 0.4, 0, -Math.cos((i * Math.PI) / 2 + 0.78) * 0.4]} material={gold}>
          <cylinderGeometry args={[0.03, 0.04, 1.8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** Apollo/Artemis-style suit (reference photo): large dark visor, chest control box with hoses, big backpack, knee pads, gloves, boots. */
function Astronaut() {
  const suit = useMemo(() => std({ color: '#e6e5e1', metalness: 0.05, roughness: 0.9 }), []);
  const trim = useMemo(() => std({ color: '#9a9ea4', metalness: 0.35, roughness: 0.6 }), []);
  const glove = useMemo(() => std({ color: '#3b3f46', roughness: 0.8 }), []);
  const sole = useMemo(() => std({ color: '#4a4339', roughness: 0.9 }), []);
  const visor = useMemo(() => std({ color: '#2a1d10', metalness: 1, roughness: 0.04, envMapIntensity: 1.8 }), []);
  const blue = useMemo(() => std({ color: '#26308f', roughness: 0.5 }), []);
  const red = useMemo(() => std({ color: '#b01c1c', roughness: 0.5 }), []);
  const hose = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 1.5, 0.22), new THREE.Vector3(0.28, 1.34, 0.26), new THREE.Vector3(0.38, 1.42, 0.2), new THREE.Vector3(0.34, 1.62, 0.12)]), []);
  const hoseR = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-0.12, 1.5, 0.22), new THREE.Vector3(-0.28, 1.34, 0.26), new THREE.Vector3(-0.38, 1.42, 0.2), new THREE.Vector3(-0.34, 1.62, 0.12)]), []);
  const leg = (x: number) => (
    <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, 0.2, 0.05]} castShadow material={suit}><boxGeometry args={[0.28, 0.22, 0.46]} /></mesh>
      <mesh position={[0, 0.06, 0.05]} material={sole}><boxGeometry args={[0.3, 0.06, 0.5]} /></mesh>
      <mesh position={[0, 0.58, 0]} castShadow material={suit}><capsuleGeometry args={[0.145, 0.38, 6, 14]} /></mesh>
      <mesh position={[0, 0.78, 0.14]} castShadow material={trim}><boxGeometry args={[0.2, 0.2, 0.06]} /></mesh>
      <mesh position={[0, 1.07, 0]} castShadow material={suit}><capsuleGeometry args={[0.16, 0.3, 6, 14]} /></mesh>
      <mesh position={[x > 0 ? 0.04 : -0.04, 1.02, 0.15]} castShadow material={trim}><boxGeometry args={[0.18, 0.3, 0.05]} /></mesh>
      <WrapStrips r={0.168} h={0.28} arc={1.9} n={7} position={[0, 1.07, 0]} />
    </group>
  );
  const arm = (side: 1 | -1) => (
    <group key={side} position={[side * 0.42, 1.78, 0]} rotation={[0.3, 0, side * -0.18]}>
      <mesh castShadow material={suit}><sphereGeometry args={[0.15, 16, 12]} /></mesh>
      <mesh position={[0, -0.26, 0]} castShadow material={suit}><capsuleGeometry args={[0.11, 0.28, 6, 12]} /></mesh>
      <WrapStrips r={0.118} h={0.26} arc={1.9} n={6} position={[0, -0.26, 0]} />
      <mesh position={[0, -0.5, 0]} material={trim}><cylinderGeometry args={[0.1, 0.1, 0.05, 14]} /></mesh>
      <group position={[0, -0.52, 0]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow material={suit}><capsuleGeometry args={[0.1, 0.22, 6, 12]} /></mesh>
        <mesh position={[0, -0.42, 0]} material={trim}><cylinderGeometry args={[0.085, 0.085, 0.05, 14]} /></mesh>
        <mesh position={[0, -0.52, 0.02]} castShadow material={glove}><boxGeometry args={[0.13, 0.17, 0.09]} /></mesh>
        <mesh position={[0, -0.65, 0.04]} castShadow material={glove}><capsuleGeometry args={[0.04, 0.08, 4, 8]} /></mesh>
      </group>
    </group>
  );
  return (
    <group position={[2.4, 0, 5.0]} rotation={[0, 0.5, 0]} scale={0.8}>
      {leg(-0.17)}{leg(0.17)}
      <mesh position={[0, 1.26, 0]} castShadow material={suit}><boxGeometry args={[0.5, 0.2, 0.34]} /></mesh>
      <mesh position={[0, 1.58, 0]} castShadow material={suit}><boxGeometry args={[0.62, 0.62, 0.42]} /></mesh>
      <mesh position={[0, 1.88, 0]} castShadow material={suit}><boxGeometry args={[0.7, 0.1, 0.44]} /></mesh>
      <mesh position={[0, 1.67, 0.23]} castShadow material={suit}><boxGeometry args={[0.32, 0.22, 0.1]} /></mesh>
      {[[-0.09, 1.56, blue], [0.09, 1.56, blue], [-0.09, 1.45, red], [0.09, 1.45, red]].map(([x, y, m], i) => (
        <mesh key={i} position={[x as number, y as number, 0.27]} rotation={[Math.PI / 2, 0, 0]} material={m as THREE.Material}><cylinderGeometry args={[0.04, 0.04, 0.06, 14]} /></mesh>
      ))}
      <mesh castShadow material={suit}><tubeGeometry args={[hose, 24, 0.022, 8, false]} /></mesh>
      <mesh castShadow material={suit}><tubeGeometry args={[hoseR, 24, 0.022, 8, false]} /></mesh>
      <FrontStrips w={0.46} h={0.4} n={12} position={[0, 1.42, 0.215]} />
      {arm(1)}{arm(-1)}
      <mesh position={[0, 2.0, 0]} material={trim}><cylinderGeometry args={[0.2, 0.22, 0.08, 18]} /></mesh>
      <mesh position={[0, 2.2, 0]} castShadow material={suit}><sphereGeometry args={[0.3, 32, 24]} /></mesh>
      <mesh position={[0, 2.2, 0.075]} scale={[0.95, 0.82, 0.78]} material={visor}><sphereGeometry args={[0.3, 32, 24]} /></mesh>
      <mesh position={[0, 1.66, -0.4]} castShadow material={suit}><boxGeometry args={[0.58, 0.82, 0.36]} /></mesh>
      <mesh position={[0, 2.12, -0.38]} castShadow material={suit}><boxGeometry args={[0.46, 0.2, 0.3]} /></mesh>
      <Tag pos={[0, 2.9, 0]} onClick={openDetail}>Astronaut suit — film on suit surfaces (concept)</Tag>
    </group>
  );
}

function Terrain() {
  const rocks = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 220 }, () => {
      let x = 0, z = 0;
      do { const a = r() * Math.PI * 2, d = 4 + r() * 42; x = Math.cos(a) * d; z = Math.sin(a) * d; }
      while ((x > -12 && x < 8 && z > -3.5 && z < 7) || Math.hypot(x - 13, z + 13) < 3);
      return { x, z, s: 0.05 + Math.pow(r(), 3) * 0.55, ry: r() * 6, sy: 0.4 + r() * 0.5 };
    });
  }, []);
  useFrame(() => {
    const m = rocks.current;
    if (!m || m.userData.done) return;
    const o = new THREE.Object3D();
    data.forEach((d, i) => { o.position.set(d.x, d.s * d.sy * 0.4, d.z); o.rotation.set(0, d.ry, 0); o.scale.set(d.s, d.s * d.sy, d.s * 0.8); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.instanceMatrix.needsUpdate = true; m.userData.done = true;
  });
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[70, 96]} /><meshStandardMaterial color="#7d7a75" roughness={1} metalness={0} /></mesh>
      {[[-12, 10, 4], [14, -9, 5.5], [9, 14, 3]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0.01, z]}>
          <mesh rotation-x={-Math.PI / 2}><circleGeometry args={[r, 48]} /><meshStandardMaterial color="#68655f" roughness={1} /></mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} scale={[1, 1, 0.15]}><torusGeometry args={[r, 0.18, 8, 48]} /><meshStandardMaterial color="#8f8c86" roughness={1} /></mesh>
        </group>
      ))}
      <instancedMesh ref={rocks} args={[undefined, undefined, 220]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#6f6c67" roughness={1} />
      </instancedMesh>
    </>
  );
}

function GlowDriver() {
  const phaseMode = useStore((s) => s.phaseMode);
  useGlow(false, phaseMode, phaseOffsetsDeg(phaseMode).length);
  return null;
}

/** Lunar showcase: habitat with roof radiator + solar array, and an astronaut, all carrying (illustrative) LunaShield film. */
export function ContextScene() {
  const mats = useMemo(() => makeMaterials('radiator'), []);
  const radiator = useMemo(() => hostMaterial('radiator'), []);
  const solar = useMemo(() => hostMaterial('solar'), []);
  const layout = useMemo(() => layoutFor('professional', true), []);
  const ex = useRef(0);
  const clock = useRef({ t: 0 });
  const lastReset = useRef(useStore.getState().resetKey);

  useFrame((_, dtRaw) => {
    const s = useStore.getState();
    const dt = Math.min(dtRaw, 0.05);
    if (s.resetKey !== lastReset.current) { lastReset.current = s.resetKey; clock.current.t = 0; }
    if (s.playing) clock.current.t += dt * s.speed;
  });
  const ctx = useMemo<SceneCtx>(() => ({ cfg: 'professional', layout, mats, k: 0, ex, clock, interactive: true }), [layout, mats]);

  return (
    <Ctx.Provider value={ctx}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[-14, 9, 8]} intensity={3.4} color="#fff6ea" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={12} shadow-camera-bottom={-10} shadow-camera-far={50} shadow-bias={-0.0003} />
      <directionalLight position={[10, 4, -8]} intensity={0.45} color="#7fb6ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[-10, 8, 6]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[8, 3, -6]} scale={[8, 4, 1]} color="#7fb6ff" />
      </Environment>
      <Stars radius={120} depth={40} count={3500} factor={4} fade={false} speed={0} />
      {/* Earth, for context */}
      <mesh position={[30, 26, -80]}><sphereGeometry args={[5, 32, 24]} /><meshStandardMaterial color="#2c6bb0" emissive="#123a66" emissiveIntensity={0.9} roughness={0.8} /></mesh>
      <GlowDriver />
      <Terrain />
      <Habitat radiator={radiator} solar={solar} />
      <Astronaut />
    </Ctx.Provider>
  );
}
