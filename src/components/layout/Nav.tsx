import { Clapperboard, Film, Presentation, Settings2 } from 'lucide-react';
import { useStore, type Page } from '../../state/store';
import { applyTourStep } from '../../data/story';
import { exportSummary } from '../../utils/summary';

export const PAGES: { id: Page; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'principle', label: 'How EDS Works' },
  { id: 'assembly', label: 'Exploded Assembly' },
  { id: 'materials', label: 'Materials' },
  { id: 'electrical', label: 'Electrical Architecture' },
  { id: 'simulation', label: 'Simulation Lab' },
  { id: 'configurations', label: 'Configurations' },
  { id: 'cost', label: 'Cost & BOM' },
  { id: 'validation', label: 'Validation Roadmap' },
  { id: 'evidence', label: 'Evidence & Assumptions' },
];

export function Nav() {
  const { page, go, cinematic, presentation, set, reducedMotion } = useStore();
  return (
    <header className="z-30 flex shrink-0 items-center gap-3 border-b border-line bg-ink/90 px-4 py-2 backdrop-blur" role="banner">
      <button className="flex items-center gap-2" onClick={() => go('overview')} aria-label="LunaShield home">
        <span className="inline-block h-5 w-5 rounded-full border-2 border-cyan shadow-[0_0_10px_rgba(34,211,238,.6)]" aria-hidden />
        <span className="text-[15px] font-bold tracking-[0.18em]">LUNASHIELD</span>
      </button>
      <nav aria-label="Primary" className="scroll-thin flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
        {PAGES.map((p, i) => (
          <button key={p.id} onClick={() => go(p.id)} aria-current={page === p.id ? 'page' : undefined}
            className={`whitespace-nowrap rounded px-2.5 py-1.5 text-[12.5px] transition-colors ${page === p.id ? 'bg-cyan/10 text-cyan' : 'text-mute hover:text-text'}`}>
            <span className="mr-1 opacity-50">{String(i + 1).padStart(2, '0')}</span>{p.label}
          </button>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-1.5">
        <button className={`btn !px-2 ${cinematic ? 'btn-on' : ''}`} aria-pressed={cinematic} title="Cinematic presentation view vs engineering view" onClick={() => set({ cinematic: !cinematic })}>
          {cinematic ? <Film size={14} /> : <Settings2 size={14} />}<span className="hidden xl:inline">{cinematic ? 'Cinematic' : 'Engineering'}</span>
        </button>
        <button className={`btn !px-2 ${reducedMotion ? 'btn-on' : ''}`} aria-pressed={reducedMotion} title="Reduced motion" onClick={() => set({ reducedMotion: !reducedMotion, playing: reducedMotion })}>
          <span className="text-[11px]">RM</span>
        </button>
        <button className="btn !px-2" title="Download technical summary (Markdown)" onClick={exportSummary}><span className="text-[11px]">Export</span></button>
        <button className="btn btn-primary" onClick={() => { set({ presentation: true, cinematic: true }); applyTourStep(0); }}>
          <Presentation size={14} />Present
        </button>
        <Clapperboard className="hidden" />
      </div>
    </header>
  );
}
