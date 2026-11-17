import { CONFIGS } from '../../data';
import { useStore } from '../../state/store';
import { ArchitectureDiagram } from '../data-panels/Architecture';
import { Notice } from '../ui';

/** Non-WebGL / error fallback: static technical diagram + component list. */
export function StaticFallback({ reason }: { reason: string }) {
  const cfg = useStore((s) => s.config);
  const data = CONFIGS[cfg];
  return (
    <div className="h-full w-full overflow-y-auto p-6 scroll-thin">
      <Notice>{reason} Showing a static technical diagram instead of the interactive 3D model.</Notice>
      <h2 className="mt-4 text-lg font-semibold">{data.name} — stack (bottom → top)</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{data.layers.map((l) => <li key={l.id}><b>{l.name}</b> — {l.purpose}</li>)}</ol>
      <div className="mt-6"><ArchitectureDiagram cfg={cfg} /></div>
    </div>
  );
}
