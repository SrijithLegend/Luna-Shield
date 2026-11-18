import { Component, lazy, Suspense, useMemo, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '../../state/store';
import { CHAPTERS, TOUR, applyChapter, applyTourStep } from '../../data/story';
import { CONFIGS } from '../../data';
import { ComponentList, InfoPanel } from '../data-panels/InfoPanel';
import { ConfigSwitch, PlayBar, SimControls } from '../controls/SimControls';
import { ExplodeControls, ModePicker } from '../controls/ViewControls';
import { Field, Notice, SimNotice, Seg, Tag } from '../ui';
import { StaticFallback } from './Fallback';
import { periodMs, phaseSpacingMs } from '../../utils/physics';

const Experience = lazy(() => import('../../three/Experience'));

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

class Boundary extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? <StaticFallback reason="The 3D scene failed to start." /> : this.props.children; }
}

export function Canvas3D() {
  const ok = useMemo(hasWebGL, []);
  if (!ok) return <StaticFallback reason="WebGL is not available in this browser." />;
  return (
    <Boundary>
      <Suspense fallback={<div className="grid h-full place-items-center text-sm text-mute">Loading 3D scene…</div>}>
        <Experience />
      </Suspense>
    </Boundary>
  );
}

const Overlay = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`pointer-events-none absolute z-10 ${className}`}><div className="pointer-events-auto">{children}</div></div>
);

function Hero() {
  const go = useStore((s) => s.go);
  const apply = useStore((s) => s.applyMode);
  return (
    <Overlay className="left-8 top-8 max-w-xl">
      <p className="lbl text-cyan">Concept visualization</p>
      <h1 className="mt-1 text-6xl font-black tracking-[0.12em] text-text md:text-7xl">LUNASHIELD</h1>
      <p className="mt-1 text-xl font-light text-text/90">Flexible Electrodynamic Dust Shield</p>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute">An active surface-integrated approach to moving dust away from critical lunar hardware.</p>
      <div className="mt-5 flex gap-3">
        <button className="btn btn-primary" onClick={() => go('assembly')}>Explore the system</button>
        <button className="btn" onClick={() => { go('simulation'); apply('transport'); }}>Run the simulation</button>
      </div>
      <div className="mt-4"><Notice>Concept visualization — not a flight-qualified product.</Notice></div>
    </Overlay>
  );
}

function ContextToggle() {
  const ctx = useStore((s) => s.context);
  const set = useStore((s) => s.set);
  return (
    <Overlay className="right-5 top-5 w-64">
      <Seg label="Scene view" value={ctx ? 'ctx' : 'detail'} onChange={(v) => set({ context: v === 'ctx', camNonce: useStore.getState().camNonce + 1 })}
        options={[{ v: 'ctx', l: 'Moon context' }, { v: 'detail', l: 'Layer detail' }]} />
    </Overlay>
  );
}

function ChapterRail() {
  const chapter = useStore((s) => s.chapter);
  const cinematic = useStore((s) => s.cinematic);
  const ch = CHAPTERS[chapter];
  return (
    <>
      <Overlay className="bottom-5 left-6 max-w-xl">
        <div className="card p-5">
          <p className="lbl text-cyan">Chapter {ch.n}</p>
          <h3 className="text-xl font-semibold">{ch.title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-text/85">{ch.text}</p>
          {!cinematic && <div className="mt-2"><SimNotice /></div>}
        </div>
      </Overlay>
      <Overlay className="bottom-5 right-6 left-[36rem] hidden lg:block">
        <nav aria-label="Chapters" className="flex gap-1.5">
          {CHAPTERS.map((c, i) => (
            <button key={c.n} onClick={() => applyChapter(i)} aria-current={chapter === i ? 'step' : undefined}
              className={`card flex-1 px-2 py-2 text-left transition-colors ${chapter === i ? '!border-cyan' : 'hover:!border-mute'}`}>
              <span className={`block text-[11.5px] font-bold ${chapter === i ? 'text-cyan' : 'text-mute'}`}>{c.n}</span>
              <span className="block text-[13px] leading-tight">{c.title}</span>
              <span className={`mt-1.5 block h-0.5 rounded ${chapter === i ? 'bg-cyan' : 'bg-line'}`} />
            </button>
          ))}
        </nav>
      </Overlay>
    </>
  );
}

function PrincipleCard() {
  const { phaseMode, freq } = useStore();
  return (
    <Overlay className="left-6 top-6 w-[31rem] max-h-[calc(100%-3rem)] overflow-y-auto scroll-thin">
      <div className="card space-y-4 p-5 text-[15px] leading-relaxed">
        <h2 className="text-lg font-semibold">How an electrodynamic dust shield works</h2>
        <p>Patterned electrodes are driven with time-varying potentials. The resulting field changes across the surface and over time, and can exert forces on particles that move them away from the surface.</p>
        <div className="rounded border border-line bg-panel2 p-2 font-mono text-[15px]">F = qE <span className="text-mute">— charged particle: force = charge × field</span></div>
        <p>A neutral but polarizable particle in a <em>non-uniform</em> field can also feel a net dielectrophoretic force. Not all lunar dust is uniformly charged, and not every particle follows the same trajectory: charge, dielectric properties, size, shape, adhesion, surface geometry and waveform all matter.</p>
        <div>
          <p className="lbl mb-1">Travelling field (conceptual three-phase)</p>
          <p>Groups A / B / C are driven at 0°, 120°, 240°. At {freq} Hz one cycle is {periodMs(freq).toFixed(1)} ms; adjacent phases are {phaseSpacingMs(freq, 3).toFixed(1)} ms apart. The <em>pattern</em> propagates along the surface — watch the glow move A → B → C.</p>
        </div>
        <ul className="list-disc space-y-1.5 pl-4 text-[14px]">
          <li><b>1-phase</b>: a single electrode group switched together — no travelling pattern (as on the Blue Ghost thermal-radiator EDS).</li>
          <li><b>2-phase</b>: two groups in anti-phase — an alternating, non-travelling pattern (as on the Blue Ghost glass EDS).</li>
          <li><b>3-phase</b>: three time-shifted groups — a conceptual travelling wave.</li>
        </ul>
        <div className="flex flex-wrap gap-1.5"><Tag tag="NASA DEMONSTRATED" /><Tag tag="PUBLISHED RESEARCH" /></div>
        <p className="text-[13.5px] text-mute">NASA demonstrated EDS on the lunar surface on Firefly Blue Ghost Mission 1 (March 2025). This three-phase scene is <b>not</b> a replica of Blue Ghost. Field lines are an overlay — the field is not visible to the naked eye.</p>
        <ConfigSwitch />
        <PlayBar />
        <Field label={`Phase mode (current: ${phaseMode}-phase)`}>
          <Seg label="Phase mode" value={phaseMode} onChange={(v) => useStore.getState().set({ phaseMode: v })} options={[1, 2, 3].map((v) => ({ v: v as 1 | 2 | 3, l: `${v}-phase` }))} />
        </Field>
        <SimNotice />
      </div>
    </Overlay>
  );
}

function ControlColumn({ children, side }: { children: ReactNode; side: 'left' | 'right' }) {
  return (
    <Overlay className={`${side === 'left' ? 'left-5' : 'right-5'} top-5 w-[22.5rem] max-h-[calc(100%-2.5rem)] overflow-y-auto scroll-thin`}>
      <div className="space-y-4">{children}</div>
    </Overlay>
  );
}

function Panels() {
  const page = useStore((s) => s.page);
  const selected = useStore((s) => s.selected);
  const pres = useStore((s) => s.presentation);
  const cinematic = useStore((s) => s.cinematic);
  const cfg = useStore((s) => s.config);

  if (pres) return null;
  if (page === 'overview') {
    return (
      <>
        {!cinematic && <Hero />}
        <ChapterRail />
        {selected ? <ControlColumn side="right"><InfoPanel /></ControlColumn> : !cinematic && <ContextToggle />}
      </>
    );
  }
  if (cinematic) return null;
  if (page === 'principle') return <><PrincipleCard />{selected && <ControlColumn side="right"><InfoPanel /></ControlColumn>}</>;
  if (page === 'assembly') {
    return (
      <>
        <ControlColumn side="left">
          <div className="card space-y-4 p-3"><ConfigSwitch /><ModePicker /></div>
          <ComponentList />
          <div className="card p-3"><ExplodeControls /></div>
        </ControlColumn>
        <ControlColumn side="right"><InfoPanel /><div className="card p-3 text-[13.5px] text-mute">{CONFIGS[cfg].disclaimer}</div></ControlColumn>
      </>
    );
  }
  // simulation lab
  return (
    <>
      <ControlColumn side="left"><div className="card p-3"><SimControls /></div></ControlColumn>
      <ControlColumn side="right"><div className="card p-3"><ModePicker /></div><InfoPanel /></ControlColumn>
    </>
  );
}

export function TourBar() {
  const { tourStep, set } = useStore();
  const auto = useStore((s) => s.playing);
  useEffect(() => {
    if (tourStep === null) return;
    const id = setTimeout(() => { if (tourStep < TOUR.length - 1) applyTourStep(tourStep + 1); }, TOUR[tourStep].secs * 1000);
    return () => clearTimeout(id);
  }, [tourStep]);
  if (tourStep === null) return null;
  const st = TOUR[tourStep];
  const exit = () => set({ presentation: false, cinematic: false, tourStep: null });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div className="card pointer-events-auto w-full max-w-3xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="lbl text-cyan">Guided presentation · {tourStep + 1}/{TOUR.length}</p>
            <h3 className="text-lg font-semibold">{st.title}</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-text/90">{st.text}</p>
          </div>
          <button className="btn !p-1.5" onClick={exit} aria-label="Exit presentation"><X size={14} /></button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button className="btn !p-1.5" disabled={tourStep === 0} onClick={() => applyTourStep(tourStep - 1)} aria-label="Previous step"><ChevronLeft size={14} /></button>
          <div className="flex flex-1 gap-1">{TOUR.map((_, i) => <button key={i} aria-label={`Step ${i + 1}`} onClick={() => applyTourStep(i)} className={`h-1 flex-1 rounded ${i <= tourStep ? 'bg-cyan' : 'bg-line'}`} />)}</div>
          <button className="btn !p-1.5" disabled={tourStep === TOUR.length - 1} onClick={() => applyTourStep(tourStep + 1)} aria-label="Next step"><ChevronRight size={14} /></button>
          <button className="btn !p-1.5" onClick={() => set({ playing: !auto })} aria-label={auto ? 'Pause animation' : 'Play animation'}>{auto ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>
        <p className="mt-2 text-[12px] text-mute">Concept visualization — not a flight-qualified product. Presentation does not imply lunar qualification of the demonstrator or an existing validated professional product.</p>
      </div>
    </div>
  );
}

/** Persistent 3D stage with page-specific overlays. */
export function Stage() {
  const cinematic = useStore((s) => s.cinematic);
  return (
    <div className="relative h-full w-full bg-ink">
      <Canvas3D />
      {cinematic && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black to-transparent" />}
      <Panels />
      <div className="pointer-events-none absolute bottom-1 right-3 z-10 text-[11.5px] text-mute/70">Concept visualization · particle trajectories illustrative</div>
    </div>
  );
}
