import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { ConfigId } from '../data';
import { useStore } from '../state/store';
import { Ctx } from './ctx';
import { CURV, layoutFor } from './layout';
import { makeMaterials } from './materials';
import { DemonstratorModel, ProfessionalModel } from './Models';
import { Particles } from './Particles';
import { Annotations, FieldLines } from './Overlays';

const CUT = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

/** One configuration's scene. All time/explode state is deterministic: same settings → same scene. */
export function Scene({ cfg, interactive = true }: { cfg: ConfigId; interactive?: boolean }) {
  const host = useStore((s) => s.host);
  const exag = useStore((s) => s.thickExag);
  const curvature = useStore((s) => s.curvature);
  const cutaway = useStore((s) => s.cutaway);
  const reduced = useStore((s) => s.reducedMotion);
  const gl = useThree((s) => s.gl);
  const k = CURV[curvature];

  const layout = useMemo(() => layoutFor(cfg, exag), [cfg, exag]);
  const mats = useMemo(() => makeMaterials(host), [host]);
  const ex = useRef(0);
  const clock = useRef({ t: 0 });
  const lastReset = useRef(useStore.getState().resetKey);

  useEffect(() => {
    gl.localClippingEnabled = true;
    gl.clippingPlanes = cutaway ? [CUT] : [];
    return () => { gl.clippingPlanes = []; };
  }, [gl, cutaway]);

  useFrame((_, dtRaw) => {
    const s = useStore.getState();
    const dt = Math.min(dtRaw, 0.05);
    if (s.resetKey !== lastReset.current) { lastReset.current = s.resetKey; clock.current.t = 0; }
    if (s.playing) clock.current.t += dt * s.speed;
    ex.current = reduced ? s.explode : ex.current + (s.explode - ex.current) * Math.min(1, dt * 4.5);
  });

  const ctx = useMemo(() => ({ cfg, layout, mats, k, ex, clock, interactive }), [cfg, layout, mats, k, interactive]);

  return (
    <Ctx.Provider value={ctx}>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', 16, 34]} />
      <Stars radius={60} depth={30} count={1500} factor={3} fade speed={0} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 9, 6]} intensity={2.2} color="#fff3e6" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 3, -5]} intensity={1.6} color="#22d3ee" />
      <pointLight position={[0, 3, -4]} intensity={8} color="#38bdf8" distance={14} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={3} position={[-6, 2, -3]} scale={[1.5, 6, 1]} color="#22d3ee" />
        <Lightformer form="rect" intensity={1.2} position={[6, 1, 3]} scale={[1.5, 5, 1]} />
      </Environment>

      {cfg === 'professional' ? <ProfessionalModel /> : <DemonstratorModel />}
      <Particles />
      <FieldLines />
      <Annotations />

      <ContactShadows position={[0, -0.02, 0]} opacity={0.55} scale={18} blur={2.4} far={5} resolution={512} frames={interactive ? Infinity : 1} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#2e2d2b" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.035, 0]}>
        <ringGeometry args={[8.9, 9, 96]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>
    </Ctx.Provider>
  );
}
