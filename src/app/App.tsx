import { lazy, Suspense, useEffect } from 'react';
import { useStore, type Page } from '../state/store';
import { Nav } from '../components/layout/Nav';
import { Stage, TourBar } from '../components/layout/Stage';

const MaterialsPage = lazy(() => import('../pages/MaterialsPage'));
const ElectricalPage = lazy(() => import('../pages/ElectricalPage'));
const ConfigurationsPage = lazy(() => import('../pages/ConfigurationsPage'));
const CostPage = lazy(() => import('../pages/CostPage'));
const ValidationPage = lazy(() => import('../pages/ValidationPage'));
const EvidencePage = lazy(() => import('../pages/EvidencePage'));

const STAGE_PAGES: Page[] = ['overview', 'principle', 'assembly', 'simulation'];

function PageBody({ page }: { page: Page }) {
  switch (page) {
    case 'materials': return <MaterialsPage />;
    case 'electrical': return <ElectricalPage />;
    case 'configurations': return <ConfigurationsPage />;
    case 'cost': return <CostPage />;
    case 'validation': return <ValidationPage />;
    case 'evidence': return <EvidencePage />;
    default: return null;
  }
}

export default function App() {
  const page = useStore((s) => s.page);
  const pres = useStore((s) => s.presentation);
  const reduced = useStore((s) => s.reducedMotion);
  const set = useStore((s) => s.set);

  useEffect(() => { if (reduced) set({ playing: false }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') useStore.getState().set({ selected: null, presentation: false, tourStep: null, cinematic: false }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`flex h-full flex-col ${reduced ? 'reduced' : ''}`}>
      {!pres && <Nav />}
      <main className="relative min-h-0 flex-1" id="main">
        {STAGE_PAGES.includes(page) ? (
          <Stage />
        ) : (
          <div className="h-full overflow-y-auto scroll-thin">
            <Suspense fallback={<div className="p-8 text-mute">Loading…</div>}><PageBody page={page} /></Suspense>
            <footer className="mx-auto max-w-7xl px-6 pb-8 text-[11px] text-mute">Concept visualization — not a flight-qualified product. Visualization is qualitative. Particle trajectories are illustrative and are not experimental measurements.</footer>
          </div>
        )}
        <TourBar />
      </main>
    </div>
  );
}
