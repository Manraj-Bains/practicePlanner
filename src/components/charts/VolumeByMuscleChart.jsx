import { MUSCLE_KEYS } from '../../lib/planEngine'

const LABELS = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
}

export function VolumeByMuscleChart({ volumeByMuscle }) {
  const values = MUSCLE_KEYS.map((k) => volumeByMuscle[k] || 0)
  const max = Math.max(1, ...values)
  const barH = 14
  const gap = 10
  const W = 400
  const H = MUSCLE_KEYS.length * (barH + gap) + 24
  const labelW = 72
  const barW = W - labelW - 40

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-md text-teal-600" role="img" aria-label="Weekly hard sets by muscle group">
      <text x={0} y={12} className="fill-stone-400 text-[9px] font-semibold uppercase tracking-wide">
        Indexed hard sets / week
      </text>
      {MUSCLE_KEYS.map((key, i) => {
        const v = volumeByMuscle[key] || 0
        const w = (v / max) * barW
        const y = 22 + i * (barH + gap)
        return (
          <g key={key}>
            <text x={0} y={y + barH - 3} className="fill-stone-600 text-[11px] font-medium">
              {LABELS[key]}
            </text>
            <rect x={labelW} y={y} width={barW} height={barH} rx={4} className="fill-stone-100" />
            <rect x={labelW} y={y} width={w} height={barH} rx={4} className="fill-teal-500/90" />
            <text x={labelW + barW + 6} y={y + barH - 2} className="fill-stone-500 text-[10px] font-semibold tabular-nums">
              {v}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
