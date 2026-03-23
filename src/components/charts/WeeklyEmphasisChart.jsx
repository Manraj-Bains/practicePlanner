/**
 * Share of weekly sessions by primary emphasis token (from split labels).
 */
export function WeeklyEmphasisChart({ emphasis }) {
  const W = 400
  const H = 140
  const barY = 48
  const barH = 28
  const maxPct = Math.max(1, ...emphasis.map((e) => e.pct))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full text-teal-600" role="img" aria-label="Weekly session emphasis distribution">
      <text x={0} y={14} className="fill-stone-400" style={{ fontSize: '9px' }} fontWeight="600">
        Session emphasis
      </text>
      {emphasis.map((e, i) => {
        const w = (e.pct / maxPct) * (W - 100)
        const y = barY + i * (barH + 8)
        return (
          <g key={`${e.label}-${i}`}>
            <text x={0} y={y + barH - 8} className="fill-stone-600" style={{ fontSize: '11px' }} fontWeight="500">
              {e.label}
            </text>
            <rect x={72} y={y} width={W - 100} height={barH} rx={6} className="fill-stone-100" />
            <rect x={72} y={y} width={w} height={barH} rx={6} className="fill-teal-500/85" />
            <text x={W - 22} y={y + barH - 8} textAnchor="end" className="fill-stone-500 tabular-nums" style={{ fontSize: '10px' }} fontWeight="600">
              {e.pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
