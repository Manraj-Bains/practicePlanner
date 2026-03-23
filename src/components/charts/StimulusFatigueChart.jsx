/**
 * Dual series: planned stimulus vs modeled fatigue (arbitrary index, internally consistent).
 */
export function StimulusFatigueChart({ stimulusTrend, fatigueTrend, weekLabels }) {
  const pad = { l: 42, r: 20, t: 18, b: 34 }
  const W = 480
  const H = 200
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const n = stimulusTrend.length
  const all = [...stimulusTrend, ...fatigueTrend]
  const maxY = Math.max(...all, 1)
  const minY = Math.min(...all) * 0.9
  const yRange = Math.max(maxY - minY, 1)

  const xAt = (i) => pad.l + (iw * i) / Math.max(1, n - 1)
  const yAt = (v) => pad.t + ih - (ih * (v - minY)) / yRange

  const line = (arr) => arr.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="Stimulus versus fatigue across the mesocycle">
      <line x1={pad.l} y1={pad.t + ih} x2={W - pad.r} y2={pad.t + ih} stroke="rgb(231 229 228)" strokeWidth="1" />
      <polyline
        fill="none"
        stroke="rgb(13 148 136)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line(stimulusTrend)}
      />
      <polyline
        fill="none"
        stroke="rgb(244 63 94)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line(fatigueTrend)}
      />
      {stimulusTrend.map((v, i) => (
        <circle key={`s-${i}`} cx={xAt(i)} cy={yAt(v)} r="3.5" fill="rgb(13 148 136)" />
      ))}
      {fatigueTrend.map((v, i) => (
        <circle key={`f-${i}`} cx={xAt(i)} cy={yAt(fatigueTrend[i])} r="3" fill="rgb(244 63 94)" />
      ))}
      {(weekLabels || []).map((lab, i) => (
        <text key={`${lab}-${i}`} x={xAt(i)} y={H - 8} textAnchor="middle" className="fill-stone-500" style={{ fontSize: '9px' }}>
          {lab}
        </text>
      ))}
      <g style={{ fontSize: '9px' }} className="fill-stone-500">
        <rect x={W - 150} y={8} width="8" height="8" rx="2" className="fill-teal-600" />
        <text x={W - 136} y={15}>
          Stimulus index
        </text>
        <rect x={W - 150} y={22} width="8" height="2" rx="0" className="fill-rose-500" />
        <text x={W - 136} y={28}>
          Fatigue index
        </text>
      </g>
    </svg>
  )
}
