/**
 * Planned block load (% of peak week) — tied to engine mesocycle.volumePct series.
 */
export function MesocycleLoadCurve({ weeks, loadCurve }) {
  const pad = { l: 40, r: 16, t: 16, b: 36 }
  const W = 480
  const H = 200
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const n = loadCurve.length
  const maxY = Math.max(...loadCurve, 1)
  const minY = Math.min(...loadCurve) * 0.85
  const yRange = Math.max(maxY - minY, 1)

  const xAt = (i) => pad.l + (iw * i) / Math.max(1, n - 1)
  const yAt = (v) => pad.t + ih - (ih * (v - minY)) / yRange

  const pts = loadCurve.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')
  const area = `M ${xAt(0)},${pad.t + ih} L ${loadCurve.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ')} L ${xAt(n - 1)},${pad.t + ih} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full text-teal-600" role="img" aria-label="Mesocycle planned volume curve">
      <defs>
        <linearGradient id="meso-load-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(13 148 136)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(13 148 136)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={pad.l} y1={pad.t + ih} x2={W - pad.r} y2={pad.t + ih} stroke="rgb(231 229 228)" strokeWidth="1" />
      <path d={area} fill="url(#meso-load-fill)" />
      <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts} />
      {loadCurve.map((v, i) => (
        <g key={weeks[i].week}>
          <circle cx={xAt(i)} cy={yAt(v)} r="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <text x={xAt(i)} y={H - 10} textAnchor="middle" className="fill-stone-500" style={{ fontSize: '10px' }}>
            {weeks[i].label}
          </text>
        </g>
      ))}
      <text x={4} y={14} className="fill-stone-400" style={{ fontSize: '9px' }} fontWeight="600">
        Block load %
      </text>
    </svg>
  )
}
