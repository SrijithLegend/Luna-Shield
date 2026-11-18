import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type CameraControlsImpl from 'camera-controls';
import type { ConfigId } from '../data';
import { useStore } from '../state/store';
import { CHAPTER_VIEWS, CONTEXT_VIEWS, PAGE_VIEWS, viewToPose } from './camera';
import { Scene } from './Scene';
import { ContextScene } from './Context';

function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const page = useStore((s) => s.page);
  const chapter = useStore((s) => s.chapter);
  const cfg = useStore((s) => s.config);
  const nonce = useStore((s) => s.camNonce);
  const ctxMode = useStore((s) => s.context);
  const reduced = useStore((s) => s.reducedMotion);
  const cinematic = useStore((s) => s.cinematic);
  const touched = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const view = page === 'overview' || page === 'principle' ? (page === 'overview' ? (ctxMode ? CONTEXT_VIEWS : CHAPTER_VIEWS)[chapter] ?? PAGE_VIEWS.overview : PAGE_VIEWS.principle) : PAGE_VIEWS[page];
    const { pos, target } = viewToPose(view, page === 'overview' && ctxMode ? 'professional' : cfg);
    touched.current = false;
    void c.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2], !reduced);
  }, [page, chapter, cfg, nonce, reduced, ctxMode]);

  // gentle cinematic drift; stops as soon as the user interacts (never spin while inspecting)
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const onStart = () => { touched.current = true; };
    c.addEventListener('controlstart', onStart);
    return () => c.removeEventListener('controlstart', onStart);
  }, []);
  useEffect(() => {
    if (!cinematic || reduced) return;
    let raf = 0;
    const tick = () => { if (!touched.current) void ref.current?.rotate(0.0014, 0, false); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cinematic, reduced]);

  return <CameraControls ref={ref} makeDefault minDistance={2.5} maxDistance={40} smoothTime={0.35} draggingSmoothTime={0.12} maxPolarAngle={Math.PI * 0.52} />;
}

function Post() {
  const cinematic = useStore((s) => s.cinematic);
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={cinematic ? 0.7 : 0.4} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={cinematic ? 0.8 : 0.55} />
    </EffectComposer>
  );
}

function MainScene() {
  const cfg = useStore((s) => s.config);
  const page = useStore((s) => s.page);
  const ctx = useStore((s) => s.context);
  return page === 'overview' && ctx ? <ContextScene /> : <Scene cfg={cfg} />;
}

/** Main interactive 3D view. */
export default function Experience() {
  const cfg = useStore((s) => s.config);
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 32, near: 0.1, far: 80, position: [7, 4, 9] }} gl={{ antialias: true, powerPreference: 'high-performance' }} aria-label="Interactive 3D model of the LunaShield assembly. Use the component list for keyboard access.">
      <Suspense fallback={null}>
        <MainScene />
        <CameraRig />
        <Post />
      </Suspense>
    </Canvas>
  );
}

/** Read-only thumbnail scene for the side-by-side comparison. */
export function MiniExperience({ cfg }: { cfg: ConfigId }) {
  return (
    <Canvas dpr={[1, 1.25]} camera={{ fov: 32, near: 0.1, far: 80, position: cfg === 'professional' ? [7, 6, 11] : [7, 6, 11] }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <Scene cfg={cfg} interactive={false} />
        <MiniRig cfg={cfg} />
      </Suspense>
    </Canvas>
  );
}

function MiniRig({ cfg }: { cfg: ConfigId }) {
  const ref = useRef<CameraControlsImpl>(null);
  useEffect(() => {
    const { pos, target } = viewToPose({ az: 35, el: 28, dist: 13.5, target: [0.9, 0.3, 0] }, cfg);
    void ref.current?.setLookAt(...pos, ...target, false);
  }, [cfg]);
  return <CameraControls ref={ref} makeDefault minDistance={4} maxDistance={24} />;
}
