import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clearingEfficiency } from '../../utils/physics';
import { coverage, otsu, roiLuma, segment, trialsToCsv, type Roi, type Trial } from '../../utils/image';
import { download } from '../../utils/summary';
import { Notice, SrOnly } from '../ui';

interface Img { w: number; h: number; data: Uint8ClampedArray; url: string }
const MAXW = 640;

function loadImage(file: File): Promise<Img> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, MAXW / im.width);
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      const g = c.getContext('2d')!;
      g.drawImage(im, 0, 0, c.width, c.height);
      res({ w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data, url });
    };
    im.onerror = rej;
    im.src = url;
  });
}

/** Per-image analysis state: ROI-cropped luminance, threshold mask and manual edits (1 = force particle, 2 = force clear). */
function Panel({ title, img, roi, thr, bright, edits, onEdit, onArea }: { title: string; img: Img | null; roi: Roi; thr: number | null; bright: boolean; edits: Map<number, 1 | 2>; onEdit: (i: number, v: 1 | 2 | 0) => void; onArea: (a: number | null, auto: number | null) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [brush, setBrush] = useState<0 | 1 | 2>(0);
  const drawing = useRef(false);

  const compute = useCallback(() => {
    if (!img) return null;
    const lum = roiLuma(img.data, img.w, roi);
    const t = thr ?? otsu(lum);
    const mask = segment(lum, t, bright);
    edits.forEach((v, i) => { if (i < mask.length) mask[i] = v === 1 ? 1 : 0; });
    return { lum, mask, t };
  }, [img, roi, thr, bright, edits]);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const r = compute();
    c.width = roi.w; c.height = roi.h;
    const g = c.getContext('2d')!;
    if (!img || !r) { g.clearRect(0, 0, c.width, c.height); onArea(null, null); return; }
    const out = g.createImageData(roi.w, roi.h);
    for (let i = 0; i < r.lum.length; i++) {
      const v = r.lum[i];
      out.data[i * 4] = v; out.data[i * 4 + 1] = v; out.data[i * 4 + 2] = v; out.data[i * 4 + 3] = 255;
      if (r.mask[i]) { out.data[i * 4] = 34; out.data[i * 4 + 1] = 211; out.data[i * 4 + 2] = 238; }
    }
    g.putImageData(out, 0, 0);
    onArea(coverage(r.mask), r.t);
  }, [compute, img, roi, onArea]);

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!brush || !drawing.current) return;
    const c = cv.current!;
    const rect = c.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * roi.w), y = Math.floor(((e.clientY - rect.top) / rect.height) * roi.h);
    const R = 4;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < roi.w && yy < roi.h && dx * dx + dy * dy <= R * R) onEdit(yy * roi.w + xx, brush);
    }
  };

  return (
    <div>
      <p className="lbl mb-1">{title}</p>
      <div className="flex min-h-40 items-center justify-center rounded border border-line bg-black">
        {img ? <canvas ref={cv} className="max-h-72 w-full object-contain" style={{ cursor: brush ? 'crosshair' : 'default', touchAction: 'none' }} role="img" aria-label={`${title} segmentation overlay`}
          onPointerDown={(e) => { drawing.current = true; (e.target as Element).setPointerCapture(e.pointerId); paint(e); }} onPointerMove={paint} onPointerUp={() => { drawing.current = false; }} />
          : <span className="p-6 text-[12px] text-mute">No image</span>}
      </div>
      <div className="mt-1 flex gap-1 text-[11px]">
        <span className="lbl mr-1 self-center">Manual correction</span>
        {([[0, 'Off'], [1, 'Add particle'], [2, 'Erase']] as const).map(([v, l]) => <button key={v} className={`btn !px-2 !py-0.5 ${brush === v ? 'btn-on' : ''}`} onClick={() => setBrush(v)}>{l}</button>)}
      </div>
    </div>
  );
}

export function ImageAnalysis() {
  const [before, setBefore] = useState<Img | null>(null);
  const [after, setAfter] = useState<Img | null>(null);
  // ROI as % of the BEFORE image; same crop applied to both (images must share framing)
  const [rp, setRp] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [thr, setThr] = useState<number | null>(null);
  const [bright, setBright] = useState(true);
  const [aI, setAI] = useState<number | null>(null);
  const [aR, setAR] = useState<number | null>(null);
  const [auto, setAuto] = useState<number | null>(null);
  const [editsB] = useState(() => new Map<number, 1 | 2>());
  const [editsA] = useState(() => new Map<number, 1 | 2>());
  const [, bump] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [meta, setMeta] = useState({ label: '', control: false, rh: '', temp: '', time: '', power: '', notes: '' });

  const ref = before ?? after;
  const roi: Roi = useMemo(() => ref ? {
    x: Math.floor((rp.x / 100) * ref.w), y: Math.floor((rp.y / 100) * ref.h),
    w: Math.max(8, Math.min(ref.w - Math.floor((rp.x / 100) * ref.w), Math.floor((rp.w / 100) * ref.w))),
    h: Math.max(8, Math.min(ref.h - Math.floor((rp.y / 100) * ref.h), Math.floor((rp.h / 100) * ref.h))),
  } : { x: 0, y: 0, w: 8, h: 8 }, [ref, rp]);

  const sizeMismatch = before && after && (before.w !== after.w || before.h !== after.h);
  const eff = aI !== null && aR !== null ? clearingEfficiency(aI, aR) : null;
  const onB = useCallback((a: number | null, t: number | null) => { setAI(a); setAuto(t); }, []);
  const onA = useCallback((a: number | null) => setAR(a), []);
  const edit = (m: Map<number, 1 | 2>) => (i: number, v: 0 | 1 | 2) => { if (v) m.set(i, v); else m.delete(i); bump((n) => n + 1); };
  const pick = (set: (i: Img) => void) => async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { set(await loadImage(f)); editsB.clear(); editsA.clear(); } };

  const addTrial = () => {
    if (aI === null || aR === null) return;
    const n = (v: string) => (v === '' ? undefined : Number(v));
    setTrials((t) => [...t, { id: t.length + 1, label: meta.label || `Trial ${t.length + 1}`, control: meta.control, aInitial: aI, aRemaining: aR, humidityPct: n(meta.rh), tempC: n(meta.temp), timeToClearS: n(meta.time), inputPowerW: n(meta.power), notes: meta.notes }]);
  };
  const energized = trials.filter((t) => !t.control).map((t) => clearingEfficiency(t.aInitial, t.aRemaining)).filter((v): v is number => v !== null);
  const mean = energized.length ? energized.reduce((s, v) => s + v, 0) / energized.length : null;
  const sd = energized.length > 1 && mean !== null ? Math.sqrt(energized.reduce((s, v) => s + (v - mean) ** 2, 0) / (energized.length - 1)) : null;

  const report = () => download('lunashield-trial-report.md', [
    '# LunaShield demonstrator — trial report', '', '> Image thresholding gives area coverage, not mass; results are biased by lighting, shadows and particle overlap. Not lunar regolith, not vacuum.', '',
    `Trials recorded: ${trials.length} (energized: ${energized.length}; minimum recommended: 5)`,
    mean !== null ? `Mean clearing efficiency (energized): ${mean.toFixed(1)}%${sd !== null ? ` ± ${sd.toFixed(1)} (sample SD)` : ''}` : 'No energized trial data recorded.', '',
    '```csv', trialsToCsv(trials, clearingEfficiency), '```',
  ].join('\n'));

  const rangeP = (k: 'x' | 'y' | 'w' | 'h', max: number) => (
    <label className="block text-[11px]"><span className="lbl">ROI {k.toUpperCase()} — {rp[k]}%</span><input type="range" min={k === 'w' || k === 'h' ? 5 : 0} max={max} value={rp[k]} onChange={(e) => setRp({ ...rp, [k]: +e.target.value })} /></label>
  );

  return (
    <div className="space-y-4 text-[13px]">
      <Notice>Image thresholding is <b>not</b> a mass measurement. It can be biased by lighting, shadows and particle overlap. Use fixed camera and fixed lighting. Nothing is pre-populated.</Notice>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="card block p-3"><span className="lbl">Before image (initial coverage)</span><input type="file" accept="image/*" onChange={pick(setBefore)} className="mt-1 block w-full text-[12px]" /></label>
        <label className="card block p-3"><span className="lbl">After image (final coverage)</span><input type="file" accept="image/*" onChange={pick(setAfter)} className="mt-1 block w-full text-[12px]" /></label>
      </div>
      {sizeMismatch && <Notice tone="red">The two images have different dimensions. Use identical framing so the same ROI covers the same region.</Notice>}
      <div className="card grid gap-3 p-3 md:grid-cols-6">
        {rangeP('x', 95)}{rangeP('y', 95)}{rangeP('w', 100)}{rangeP('h', 100)}
        <label className="block text-[11px]"><span className="lbl">Threshold — {thr ?? `auto (Otsu ${auto ?? '–'})`}</span><input type="range" min={0} max={255} value={thr ?? auto ?? 128} onChange={(e) => setThr(+e.target.value)} /></label>
        <div className="flex flex-col gap-1 text-[11px]">
          <label className="flex items-center gap-1"><input type="checkbox" checked={bright} onChange={(e) => setBright(e.target.checked)} />Particles brighter</label>
          <button className="btn !py-0.5" onClick={() => setThr(null)}>Auto threshold</button>
        </div>
      </div>
      <p className="text-[11px] text-mute">Brightness/contrast is normalised identically inside the ROI of each image (1st–99th percentile stretch) before the same threshold is applied.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Before — mask overlay (cyan = particle)" img={before} roi={roi} thr={thr} bright={bright} edits={editsB} onEdit={edit(editsB)} onArea={onB} />
        <Panel title="After — mask overlay (cyan = particle)" img={after} roi={roi} thr={thr} bright={bright} edits={editsA} onEdit={edit(editsA)} onArea={onA as never} />
      </div>
      <div className="card p-3" role="status" aria-live="polite">
        <p className="lbl">Result</p>
        {eff === null ? <p className="text-mute">No experimental data recorded.</p> : (
          <p><b>A_initial</b> {aI} px · <b>A_remaining</b> {aR} px · <b>η = (A_i − A_r)/A_i × 100%</b> = <span className="text-cyan text-lg font-bold">{eff.toFixed(1)}%</span> <span className="badge b-mute">image-derived area, uncertain</span></p>
        )}
        <SrOnly>{eff === null ? 'No experimental data recorded.' : `Clearing efficiency ${eff.toFixed(1)} percent.`}</SrOnly>
      </div>
      <div className="card grid gap-2 p-3 md:grid-cols-4">
        <input placeholder="Trial label" value={meta.label} onChange={(e) => setMeta({ ...meta, label: e.target.value })} aria-label="Trial label" />
        <input placeholder="RH %" type="number" value={meta.rh} onChange={(e) => setMeta({ ...meta, rh: e.target.value })} aria-label="Relative humidity" />
        <input placeholder="Temp °C" type="number" value={meta.temp} onChange={(e) => setMeta({ ...meta, temp: e.target.value })} aria-label="Temperature" />
        <input placeholder="Time to clear (s)" type="number" value={meta.time} onChange={(e) => setMeta({ ...meta, time: e.target.value })} aria-label="Time to clear" />
        <input placeholder="Input power W (measured)" type="number" value={meta.power} onChange={(e) => setMeta({ ...meta, power: e.target.value })} aria-label="Measured input power" />
        <input placeholder="Notes (direction, damage, visible discharge)" value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} aria-label="Notes" className="md:col-span-2" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={meta.control} onChange={(e) => setMeta({ ...meta, control: e.target.checked })} />No-field control trial</label>
        <button className="btn btn-primary justify-center md:col-span-2" disabled={eff === null} onClick={addTrial}>Add trial to record</button>
        <button className="btn justify-center" disabled={!trials.length} onClick={() => download('lunashield-trials.csv', trialsToCsv(trials, clearingEfficiency), 'text/csv')}>Export CSV</button>
        <button className="btn justify-center" disabled={!trials.length} onClick={report}>Export trial report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12.5px]">
          <caption className="mb-1 text-left text-mute">Trial record {mean !== null && `— mean η (energized, n=${energized.length}) ${mean.toFixed(1)}%${sd !== null ? ` ± ${sd.toFixed(1)}` : ''}`}{energized.length > 0 && energized.length < 5 && ' — fewer than 5 energized trials: not repeatability-grade'}</caption>
          <thead><tr className="text-left text-mute"><th>#</th><th>Label</th><th>Control</th><th>A_i</th><th>A_r</th><th>η %</th><th>RH</th><th>T °C</th><th>t (s)</th><th>P (W)</th><th /></tr></thead>
          <tbody>
            {trials.length === 0 && <tr><td colSpan={11} className="py-3 text-mute">No experimental data recorded.</td></tr>}
            {trials.map((t) => (
              <tr key={t.id} className="border-t border-line"><td>{t.id}</td><td>{t.label}</td><td>{t.control ? 'yes' : 'no'}</td><td>{t.aInitial}</td><td>{t.aRemaining}</td><td>{clearingEfficiency(t.aInitial, t.aRemaining)?.toFixed(1) ?? '—'}</td><td>{t.humidityPct ?? '—'}</td><td>{t.tempC ?? '—'}</td><td>{t.timeToClearS ?? '—'}</td><td>{t.inputPowerW ?? '—'}</td>
                <td><button className="btn !px-2 !py-0.5" onClick={() => setTrials(trials.filter((x) => x !== t))}>remove</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
