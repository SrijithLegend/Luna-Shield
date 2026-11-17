import { CONFIGS, type ConfigId } from '../../data';
import { SrOnly } from '../ui';

/** SVG block diagram. Text equivalent provided via sr-only list. */
export function ArchitectureDiagram({ cfg }: { cfg: ConfigId }) {
  const d = CONFIGS[cfg];
  const w = 420, bh = 50, gap = 26;
  const H = d.architecture.length * (bh + gap) + 20;
  const fbH = d.feedback.length * 34 + 20;
  const pro = cfg === 'professional';
  const accent = (i: number) => (i === d.architecture.length - 1 ? '#22d3ee' : i === 2 && !pro ? '#f59e0b' : '#2a3744');
  return (
    <figure>
      <SrOnly>{`${d.name} architecture, in order: ${d.architecture.map((a) => a.label + (a.note ? ` (${a.note})` : '')).join('; then ')}. Feedback path: ${d.feedback.map((f) => f.label).join(' to ')}.`}</SrOnly>
      <svg viewBox={`0 0 ${w + 330} ${Math.max(H, fbH + 40)}`} className="w-full max-w-3xl" role="img" aria-label={`${d.name} architecture block diagram`}>
        <defs>
          <marker id={`ar-${cfg}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6b7d8e" /></marker>
        </defs>
        {d.architecture.map((a, i) => {
          const y = 10 + i * (bh + gap);
          return (
            <g key={a.label}>
              <rect x={0} y={y} width={w} height={bh} rx={6} fill="#0d131a" stroke={accent(i)} strokeWidth={i === d.architecture.length - 1 ? 1.6 : 1} />
              <text x={14} y={y + 21} fill="#e6edf3" fontSize={13} fontWeight={600}>{a.label}</text>
              {a.note && <text x={14} y={y + 39} fill={a.note.includes('UNVERIFIED') || a.note.includes('ASSUMPTION') || a.note.includes('TARGET') ? '#f59e0b' : '#8a99a8'} fontSize={10.5}>{a.note.length > 70 ? a.note.slice(0, 68) + '…' : a.note}</text>}
              {i < d.architecture.length - 1 && <line x1={w / 2} y1={y + bh} x2={w / 2} y2={y + bh + gap - 3} stroke="#6b7d8e" markerEnd={`url(#ar-${cfg})`} />}
            </g>
          );
        })}
        <g transform={`translate(${w + 50},10)`}>
          <text x={0} y={10} fill="#8a99a8" fontSize={11} fontWeight={700} letterSpacing={1}>{pro ? 'OPTIONAL FEEDBACK' : 'MEASUREMENT PATH'}</text>
          {d.feedback.map((f, i) => (
            <g key={f.label}>
              <rect x={0} y={22 + i * 34} width={230} height={26} rx={5} fill="#0d131a" stroke="#2a3744" strokeDasharray="4 3" />
              <text x={10} y={39 + i * 34} fill="#cfd8e0" fontSize={11.5}>{f.label}</text>
              {i < d.feedback.length - 1 && <line x1={115} y1={48 + i * 34} x2={115} y2={56 + i * 34} stroke="#6b7d8e" markerEnd={`url(#ar-${cfg})`} />}
            </g>
          ))}
          <text x={0} y={42 + d.feedback.length * 34 + 14} fill="#8a99a8" fontSize={10.5}>{pro ? 'Sensor → controller → scheduler → driver enable' : 'Camera + humidity → trial record → image analysis'}</text>
        </g>
      </svg>
    </figure>
  );
}
