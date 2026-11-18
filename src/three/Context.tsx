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
            <boxGeometry args={[(r * arc) / n * 0.55, h, 0.012]} />
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

function Habitat({ radiator, solar }: { radiator: THREE.Material; solar: THREE.Material }) {
  const hull = useMemo(() => std({ color: '#d4d8dc', metalness: 0.55, roughness: 0.42 }), []);
  const dark = useMemo(() => std({ color: '#23272d', metalness: 0.5, roughness: 0.6 }), []);
  const win = useMemo(() => std({ color: '#0a1b2b', metalness: 0.9, roughness: 0.1, emissive: '#16506b', emissiveIntensity: 0.35 }), []);
  const open = () => useStore.setState({ context: false, page: 'assembly', explode: 1, energized: false, dustOn: false });
  return (
    <group>
      {/* pressure hull */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 1.65, 0]} castShadow receiveShadow material={hull}><cylinderGeometry args={[1.5, 1.5, 5.5, 48]} /></mesh>
      {[-2.75, 2.75].map((x) => <mesh key={x} position={[x, 1.65, 0]} scale={[0.55, 1, 1]} castShadow material={hull}><sphereGeometry args={[1.5, 32, 24]} /></mesh>)}
      {[-1.8, -0.6, 0.6, 1.8].map((x) => <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x, 1.65, 0]} material={dark}><cylinderGeometry args={[1.515, 1.515, 0.05, 48]} /></mesh>)}
      {[-1.2, 0, 1.2].map((x) => <mesh key={x} position={[x, 1.85, 1.46]} rotation={[Math.PI / 2, 0, 0]} material={win}><cylinderGeometry args={[0.22, 0.22, 0.06, 24]} /></mesh>)}
      <mesh position={[3.35, 1.0, 0.0]} castShadow material={dark}><boxGeometry args={[0.7, 1.7, 1.1]} /></mesh>
      {[[-2.2, 0.55], [2.2, 0.55], [-2.2, -0.55], [2.2, -0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z * 2]} castShadow material={dark}><cylinderGeometry args={[0.3, 0.4, 0.4, 16]} /></mesh>
      ))}
      {/* roof radiator on struts */}
      {[-1.2, 1.2].flatMap((x) => [-0.7, 0.7].map((z) => <mesh key={`${x}${z}`} position={[x, 3.15, z]} material={dark}><cylinderGeometry args={[0.04, 0.04, 0.4, 8]} /></mesh>))}
      <mesh position={[0, 3.36, 0]} castShadow receiveShadow material={radiator}><boxGeometry args={[3.2, 0.08, 1.9]} /></mesh>
      <group position={[0, 3.4, 0]}><FlatPatch w={3} d={1.7} countScale={0.7} /></group>
      <Tag pos={[0, 3.9, 0]} onClick={open}>Habitat radiator — LunaShield film (concept)</Tag>

      {/* solar array on a stand */}
      <group position={[-6, 0, 0.3]}>
        {[-1, 1].map((x) => <mesh key={x} position={[x, 0.6, 0]} material={dark}><cylinderGeometry args={[0.05, 0.05, 1.2, 8]} /></mesh>)}
        <group position={[0, 1.4, 0]} rotation={[-0.38, 0, 0]}>
          <mesh castShadow receiveShadow material={solar}><boxGeometry args={[3.2, 0.08, 1.9]} /></mesh>
          <group position={[0, 0.04, 0]}><FlatPatch w={3} d={1.7} clear countScale={0.7} /></group>
        </group>
        <Tag pos={[0, 2.5, 0]} onClick={open}>Solar array — film over solar glass (concept)</Tag>
      </group>
    </group>
  );
}

function Astronaut() {
  const suit = useMemo(() => std({ color: '#e9eaec', metalness: 0.05, roughness: 0.85 }), []);
  const joint = useMemo(() => std({ color: '#8a8f96', metalness: 0.4, roughness: 0.6 }), []);
  const visor = useMemo(() => std({ color: '#d9a62a', metalness: 1, roughness: 0.08, envMapIntensity: 1.6 }), []);
  const open = () => useStore.setState({ context: false, page: 'assembly', explode: 1, energized: false, dustOn: false });
  const leg = (x: number) => (
    <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, 0.09, 0.05]} castShadow material={joint}><boxGeometry args={[0.26, 0.18, 0.5]} /></mesh>
      <mesh position={[0, 0.48, 0]} castShadow material={suit}><capsuleGeometry args={[0.13, 0.5, 6, 14]} /></mesh>
      <mesh position={[0, 0.98, 0]} castShadow material={suit}><capsuleGeometry args={[0.15, 0.36, 6, 14]} /></mesh>
      <WrapStrips r={0.158} h={0.34} arc={2.4} n={8} position={[0, 0.98, 0]} />
    </group>
  );
  const arm = (side: 1 | -1) => (
    <group key={side} position={[side * 0.42, 1.55, 0.02]} rotation={[0.35, 0, side * -0.18]}>
      <mesh position={[0, -0.28, 0]} castShadow material={suit}><capsuleGeometry args={[0.1, 0.4, 6, 12]} /></mesh>
      <WrapStrips r={0.108} h={0.32} arc={2.4} n={7} position={[0, -0.28, 0]} />
      <mesh position={[0, -0.7, 0.04]} castShadow material={suit}><capsuleGeometry args={[0.09, 0.3, 6, 12]} /></mesh>
      <mesh position={[0, -0.95, 0.06]} castShadow material={joint}><sphereGeometry args={[0.11, 14, 12]} /></mesh>
    </group>
  );
  return (
    <group position={[3.6, 0, 2.6]} rotation={[0, -0.7, 0]} scale={1.0}>
      {leg(-0.17)}{leg(0.17)}
      <mesh position={[0, 1.42, 0]} castShadow material={suit}><capsuleGeometry args={[0.3, 0.42, 8, 20]} /></mesh>
      <WrapStrips r={0.308} h={0.55} arc={2.5} n={14} position={[0, 1.42, 0]} />
      <mesh position={[0, 1.15, 0]} material={joint}><cylinderGeometry args={[0.32, 0.32, 0.07, 20]} /></mesh>
      {arm(1)}{arm(-1)}
      <mesh position={[0, 1.88, 0]} castShadow material={joint}><cylinderGeometry args={[0.17, 0.19, 0.08, 16]} /></mesh>
      <mesh position={[0, 2.05, 0]} castShadow material={suit}><sphereGeometry args={[0.27, 28, 20]} /></mesh>
      <mesh position={[0, 2.05, 0.085]} scale={[1, 0.78, 0.72]} castShadow material={visor}><sphereGeometry args={[0.215, 28, 20]} /></mesh>
      <mesh position={[0, 1.5, -0.37]} castShadow material={suit}><boxGeometry args={[0.52, 0.66, 0.3]} /></mesh>
      <Tag pos={[0, 2.7, 0]} onClick={open}>Astronaut suit — film on suit surfaces (concept)</Tag>
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
      while (Math.abs(x + 1.5) < 9 && Math.abs(z) < 4 || Math.hypot(x - 3.6, z - 2.6) < 1.2);
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
