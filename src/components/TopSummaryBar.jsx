import { Badge } from './Badge'

const STATUS_LABEL = {
  progressing: 'On track',
  plateau: 'Plateau mode',
  overtraining: 'Unsustainable load',
}

const STATUS_BADGE = {
  progressing: 'progressing',
  plateau: 'plateau',
  overtraining: 'overtraining',
}

const GOAL_SHORT = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerbuilding: 'Powerbuilding',
}

const EXP_SHORT = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const REC_SHORT = {
  low: 'Low recovery',
  medium: 'Med recovery',
  high: 'High recovery',
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function TopSummaryBar({ form, result }) {
  const status = result?.analysis?.status
  const fatigue = result?.analysis?.fatigueScore
  const sustain = result?.analysis?.sustainabilityScore

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200/90 bg-white px-4 py-2.5 sm:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-600">
        <span className="truncate font-semibold text-stone-900">
          {result ? result.split.displayLabel : 'No block loaded'}
        </span>
        <span className="hidden sm:inline">
          <span className="text-stone-400">Goal</span>{' '}
          <span className="font-semibold text-stone-800">{GOAL_SHORT[form.goal]}</span>
        </span>
        <span className="hidden md:inline">
          <span className="text-stone-400">Level</span>{' '}
          <span className="font-semibold text-stone-800">{EXP_SHORT[form.experience]}</span>
        </span>
        <span>
          <span className="text-stone-400">Freq</span>{' '}
          <span className="font-semibold text-stone-800">{form.trainingDays}d</span>
        </span>
        <span className="hidden lg:inline text-xs">
          <span className="text-stone-400">{REC_SHORT[form.recoveryTolerance]}</span>
          <span className="mx-1 text-stone-300">·</span>
          <span className="text-stone-500">{form.sessionLength} min sessions</span>
        </span>
        {result && (
          <>
            <span className="hidden xl:inline text-xs text-stone-500">
              Fatigue {fatigue} · Sustain {sustain}
            </span>
            <span className="hidden xl:inline text-xs text-stone-400">{formatTime(result.generatedAt)}</span>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {result ? (
          <Badge variant={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
        ) : (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">Build a block</span>
        )}
      </div>
    </header>
  )
}
