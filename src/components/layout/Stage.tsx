import { Component, lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { CHAPTERS, TOUR, applyChapter, applyTourStep } from '../../data/story';
import { CONFIGS } from '../../data';
import { ComponentList, InfoPanel } from '../data-panels/InfoPanel';
import { ConfigSwitch, PlayBar, SimControls } from '../controls/SimControls';
import { ExplodeControls, ModePicker } from '../controls/ViewControls';
import { Field, Notice, Seg, SimNotice, Tag } from '../ui';
import { StaticFallback } from './Fallback';
import { periodMs, phaseSpacingMs } from '../../utils/physics';
import { simStats } from '../../three/Particles';

const Experience = lazy(() => import('../../three/Experience'));

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

class Boundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: Error) { return { err: e?.message ?? 'unknown error' }; }
  componentDidCatch(e: Error) { console.error('[LunaShield 3D]', e); useStore.setState({ sceneError: e?.message ?? 'unknown error' }); }
  render() { return this.state.err ? <StaticFallback reason={`The 3D scene failed to start (${this.state.err}).`} /> : this.props.children; }
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

/* ------------------------------------------------------------------ bento primitives */

/** A bento tile: rounded, padded, internally scrollable. */
export function Tile({ children, className = '', label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <section className={`bento ${className}`}>
      {label && <p className="lbl mb-3">{label}</p>}
      {children}
    </section>
  );
}

function Stat({ k, v, tag }: { k: string; v: ReactNode; tag?: ReactNode }) {
  return (
    <div className="bento !p-4">
      <p className="lbl">{k}</p>
      <p className="display mt-2 text-[28px]">{v}</p>
      {tag && <div className="mt-2">{tag}</div>}
    </div>
  );
}

function LiveStats() {
  const { freq, phaseMode } = useStore();
  const [r, setR] = useState(1);
  useEffect(() => { const id = setInterval(() => setR(simStats.remaining), 400); return () => clearInterval(id); }, []);
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat k="Cycle period" v={`${periodMs(freq).toFixed(0)} ms`} tag={<span className="badge b-amber">{freq} Hz · illustrative</span>} />
      <Stat k="Phase spacing" v={phaseMode === 3 ? `${phaseSpacingMs(freq, 3).toFixed(1)} ms` : '—'} tag={<span className="badge b-mute">{phaseMode}-phase mode</span>} />
      <Stat k="Dust on surface" v={`${Math.round(r * 100)}%`} tag={<span className="badge b-amber">illustrative</span>} />
    </div>
  );
}

function ConceptStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat k="Drive (concept)" v="~1–3 kV" tag={<Tag tag="TARGET" />} />
      <Stat k="Frequency" v="~10 Hz" tag={<Tag tag="TARGET" />} />
      <Stat k="Areal mass" v="~300 g/m²" tag={<Tag tag="FOUNDER ESTIMATE" />} />
    </div>
  );
}

/** Responsive bento grid: [left | centre (canvas + stats) | right]. Below xl it stacks, canvas first. */
function Bento({ left, right, stats }: { left: ReactNode; right: ReactNode; stats: ReactNode }) {
  return (
    <div className="h-full overflow-y-auto p-3 scroll-thin xl:overflow-hidden">
      <div className="grid gap-3 xl:h-full xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)_minmax(0,21rem)]">
        <div className="order-2 flex min-h-0 flex-col gap-3 xl:order-1 xl:overflow-y-auto scroll-thin">{left}</div>
        <div className="order-1 grid min-h-0 gap-3 xl:order-2 xl:grid-rows-[minmax(0,1fr)_auto]">
          <div className="bento relative !p-0 h-[62vh] xl:h-full"><Canvas3D /><div className="pointer-events-none absolute bottom-2 right-4 text-[12px] text-mute/80">Concept visualization · trajectories illustrative</div></div>
          <div className="hidden md:block">{stats}</div>
        </div>
        <div className="order-3 flex min-h-0 flex-col gap-3 xl:overflow-y-auto scroll-thin">{right}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ tiles per page */

function HeroTile() {
  const go = useStore((s) => s.go);
  const apply = useStore((s) => s.applyMode);
  return (
    <Tile className="!p-7">
      <p className="lbl text-cyan">Concept visualization</p>
      <h1 className="display mt-3 text-[56px] xl:text-[64px]">LUNA<br />SHIELD</h1>
      <p className="mt-3 text-[18px] font-medium text-text/90">Flexible Electrodynamic Dust Shield</p>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">An active surface-integrated approach to moving dust away from critical lunar hardware.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn btn-primary" onClick={() => go('assembly')}>Explore the system</button>
        <button className="btn" onClick={() => { go('simulation'); apply('transport'); }}>Run the simulation</button>
      </div>
    </Tile>
  );
}

function ChapterTile() {
  const chapter = useStore((s) => s.chapter);
  const ch = CHAPTERS[chapter];
  return (
    <Tile label={`Chapter ${ch.n}`}>
      <h2 className="display text-[26px]">{ch.title}</h2>
      <p className="mt-3 text-[15px] leading-[1.65] text-text/85">{ch.text}</p>
    </Tile>
  );
}

function ChapterList() {
  const chapter = useStore((s) => s.chapter);
  return (
    <Tile label="Chapters">
      <nav aria-label="Chapters" className="flex flex-col gap-1.5">
        {CHAPTERS.map((c, i) => (
          <button key={c.n} onClick={() => applyChapter(i)} aria-current={chapter === i ? 'step' : undefined}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${chapter === i ? 'border-cyan bg-cyan/10' : 'border-line hover:border-mute'}`}>
            <span className={`w-6 text-[13px] font-bold ${chapter === i ? 'text-cyan' : 'text-mute'}`}>{c.n}</span>
            <span className="text-[15px] font-medium">{c.title}</span>
          </button>
        ))}
      </nav>
    </Tile>
  );
}

function ContextToggle() {
  const ctx = useStore((s) => s.context);
  const set = useStore((s) => s.set);
  return (
    <Tile label="Scene view">
      <Seg label="Scene view" value={ctx ? 'ctx' : 'detail'} onChange={(v) => set({ context: v === 'ctx', camNonce: useStore.getState().camNonce + 1 })}
        options={[{ v: 'ctx', l: 'Moon context' }, { v: 'detail', l: 'Layer detail' }]} />
      <p className="mt-3 text-[13.5px] text-mute">Click a glowing film patch label in the Moon scene to inspect its layers.</p>
    </Tile>
  );
}

function Inspector() {
  return <div className="min-h-0 shrink-0"><InfoPanel /></div>;
}

function PrincipleTiles() {
  const { phaseMode, freq } = useStore();
  return (
    <>
      <Tile label="How it works">
        <h2 className="display text-[26px]">Moving dust with a moving field</h2>
        <p className="mt-3 text-[15px] leading-[1.65]">Patterned electrodes are driven with time-varying potentials. The field changes across the surface and over time, and can exert forces that move particles away.</p>
        <div className="mt-4 rounded-xl border border-line bg-panel2 p-4 font-mono text-[15px]">F = qE <span className="block pt-1 font-sans text-[13px] text-mute">charged particle: force = charge × field</span></div>
        <p className="mt-4 text-[15px] leading-[1.65]">A neutral but polarizable particle in a <em>non-uniform</em> field can feel a net dielectrophoretic force. Not all lunar dust is uniformly charged and not every particle follows the same path.</p>
      </Tile>
      <Tile label="Travelling field">
        <p className="text-[15px] leading-[1.65]">Groups A / B / C are driven at 0°, 120°, 240°. At {freq} Hz one cycle is {periodMs(freq).toFixed(1)} ms; adjacent phases are {phaseSpacingMs(freq, 3).toFixed(1)} ms apart. The <em>pattern</em> propagates A → B → C.</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed">
          <li><b>1-phase</b>: one group switched together — no travelling pattern (as on the Blue Ghost radiator EDS).</li>
          <li><b>2-phase</b>: two anti-phase groups — alternating, non-travelling (as on the Blue Ghost glass EDS).</li>
          <li><b>3-phase</b>: three time-shifted groups — a conceptual travelling wave.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2"><Tag tag="NASA DEMONSTRATED" /><Tag tag="PUBLISHED RESEARCH" /></div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-mute">Current view: {phaseMode}-phase. This scene is <b>not</b> a Blue Ghost replica. Field lines are an overlay — the field is not visible to the naked eye.</p>
      </Tile>
    </>
  );
}

function PrincipleControls() {
  const { phaseMode } = useStore();
  return (
    <Tile label="Controls">
      <div className="space-y-4">
        <ConfigSwitch />
        <PlayBar />
        <Field label="Phase mode">
          <Seg label="Phase mode" value={phaseMode} onChange={(v) => useStore.getState().set({ phaseMode: v })} options={[1, 2, 3].map((v) => ({ v: v as 1 | 2 | 3, l: `${v}-phase` }))} />
        </Field>
        <SimNotice />
      </div>
    </Tile>
  );
}

function Panels({ page }: { page: string }) {
  const cfg = useStore((s) => s.config);
  const selected = useStore((s) => s.selected);
  if (page === 'overview') {
    return <Bento stats={<ConceptStats />}
      left={<><HeroTile /><ChapterTile /></>}
      right={<><ContextToggle />{selected && <Inspector />}<ChapterList /><Tile><Notice>Concept visualization — not a flight-qualified product.</Notice></Tile></>} />;
  }
  if (page === 'principle') {
    return <Bento stats={<LiveStats />} left={<PrincipleTiles />} right={<><PrincipleControls />{selected && <Inspector />}</>} />;
  }
  if (page === 'assembly') {
    return <Bento stats={<LiveStats />}
      left={<><Tile label="Build"><div className="space-y-4"><ConfigSwitch /><ModePicker /></div></Tile><ComponentList /></>}
      right={<><Inspector /><Tile label="View"><ExplodeControls /></Tile><Tile><p className="text-[14px] leading-relaxed text-mute">{CONFIGS[cfg].disclaimer}</p></Tile></>} />;
  }
  return <Bento stats={<LiveStats />}
    left={<Tile label="Simulation"><SimControls /></Tile>}
    right={<><Tile label="Animation mode"><ModePicker /></Tile><Inspector /></>} />;
}

/** Cinematic: canvas edge to edge with a single caption. */
function Cinematic() {
  const chapter = useStore((s) => s.chapter);
  const pres = useStore((s) => s.presentation);
  const ch = CHAPTERS[chapter];
  return (
    <div className="relative h-full w-full bg-black">
      <Canvas3D />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black to-transparent" />
      {!pres && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-lg">
          <p className="lbl text-cyan">Chapter {ch.n}</p>
          <h2 className="display mt-1 text-[40px]">{ch.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-text/85">{ch.text}</p>
        </div>
      )}
    </div>
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
      <div className="bento pointer-events-auto w-full max-w-3xl !p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="lbl text-cyan">Guided presentation · {tourStep + 1}/{TOUR.length}</p>
            <h3 className="mt-1 text-[22px] font-bold">{st.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-text/90">{st.text}</p>
          </div>
          <button className="btn !p-1.5" onClick={exit} aria-label="Exit presentation"><X size={14} /></button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="btn !p-1.5" disabled={tourStep === 0} onClick={() => applyTourStep(tourStep - 1)} aria-label="Previous step"><ChevronLeft size={14} /></button>
          <div className="flex flex-1 gap-1">{TOUR.map((_, i) => <button key={i} aria-label={`Step ${i + 1}`} onClick={() => applyTourStep(i)} className={`h-1.5 flex-1 rounded ${i <= tourStep ? 'bg-cyan' : 'bg-line'}`} />)}</div>
          <button className="btn !p-1.5" disabled={tourStep === TOUR.length - 1} onClick={() => applyTourStep(tourStep + 1)} aria-label="Next step"><ChevronRight size={14} /></button>
          <button className="btn !p-1.5" onClick={() => set({ playing: !auto })} aria-label={auto ? 'Pause animation' : 'Play animation'}>{auto ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-mute">Concept visualization — not a flight-qualified product. Presentation does not imply lunar qualification of the demonstrator or an existing validated professional product.</p>
      </div>
    </div>
  );
}

/** Persistent 3D stage laid out as a bento grid. */
export function Stage() {
  const page = useStore((s) => s.page);
  const cinematic = useStore((s) => s.cinematic);
  const pres = useStore((s) => s.presentation);
  if (cinematic || pres) return <Cinematic />;
  return <Panels page={page} />;
}
