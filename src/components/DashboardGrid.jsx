import { Card } from './Card'
import { Badge } from './Badge'
import { MUSCLE_KEYS } from '../lib/planEngine'
import { VolumeByMuscleChart } from './charts/VolumeByMuscleChart'
import { MesocycleLoadCurve } from './charts/MesocycleLoadCurve'
import { StimulusFatigueChart } from './charts/StimulusFatigueChart'
import { WeeklyEmphasisChart } from './charts/WeeklyEmphasisChart'

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

const MUSCLE_LABEL = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
}

function SnapshotCard({ label, value, sub }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-1.5 text-base font-semibold tracking-tight text-stone-900">{value}</p>
      {sub ? <p className="mt-1 text-xs leading-snug text-stone-500">{sub}</p> : null}
    </Card>
  )
}

export function DashboardGrid({ result, form }) {
  const hasPlan = Boolean(result)
  const analysis = result?.analysis
  const weeklyPlan = result?.weeklyPlan
  const split = result?.split
  const volumeByMuscle = result?.volumeByMuscle
  const meso = result?.mesocycle
  const progression = result?.progressionMethod
  const emphasis = result?.weeklyEmphasis
  const weakStrategy = result?.weakStrategy

  const weekLabels = hasPlan ? meso.weeks.map((w) => `W${w.week}`) : []

  return (
    <div className="mx-auto grid max-w-[1680px] grid-cols-12 gap-4">
      {/* Athlete / block snapshot */}
      <div className="col-span-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SnapshotCard
          label="Recommended split"
          value={hasPlan ? split.displayLabel : '—'}
          sub={hasPlan ? split.type.replace(/_/g, ' ') : 'Build to select architecture'}
        />
        <SnapshotCard
          label="Progression method"
          value={hasPlan ? progression.label : '—'}
          sub={hasPlan ? progression.id.replace(/_/g, ' ') : 'Assigned from goal + level'}
        />
        <SnapshotCard
          label="Recovery fit"
          value={hasPlan ? (analysis.sustainable ? 'Sustainable' : 'Aggressive') : '—'}
          sub={hasPlan ? `Score ${analysis.sustainabilityScore}/100` : 'Modeled from inputs'}
        />
        <SnapshotCard
          label="Stimulus index"
          value={hasPlan ? String(analysis.stimulusIndex) : '—'}
          sub="Weekly volume × priority bias"
        />
        <SnapshotCard
          label="Fatigue risk"
          value={hasPlan ? String(analysis.fatigueScore) : '—'}
          sub={hasPlan ? STATUS_LABEL[analysis.status] : 'Post-build model'}
        />
        <SnapshotCard
          label="Plateau flag"
          value={form.plateau ? 'Yes' : 'No'}
          sub={form.plateau ? 'Volume + progression adjusted' : 'Standard overload'}
        />
      </div>

      {/* Split rationale + weekly sessions */}
      <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Recommended split</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">
              Constraints drive split choice (full body, upper/lower, PPL, or powerbuilding). Build a block to lock the
              architecture.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{split.rationale}</p>
          )}
        </Card>

        <Card className="flex min-h-[280px] flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Weekly session blueprint</h2>
            {hasPlan ? <Badge variant="neutral">{weeklyPlan.length} sessions</Badge> : <span className="text-xs text-stone-400">Pending</span>}
          </div>
          {!hasPlan ? (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/60 py-14 text-center">
              <p className="text-sm font-medium text-stone-700">No block generated</p>
              <p className="mt-2 max-w-sm text-xs text-stone-500">
                Use <span className="font-semibold text-stone-800">Build 4-week block</span> after setting goal, recovery,
                and session length.
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
              {weeklyPlan.map((day) => (
                <li
                  key={day.day}
                  className="rounded-xl border border-stone-100 bg-stone-50/70 p-4 transition hover:border-stone-200"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-teal-700">Session {day.day}</span>
                    <span className="text-sm font-semibold text-stone-900">{day.focus}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-stone-600">
                    {day.exercises.map((ex) => (
                      <li key={ex} className="flex gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-teal-500/80" aria-hidden />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Progression + recovery stack */}
      <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Progression method</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">Double progression, load waves, or top-set schemes appear here.</p>
          ) : (
            <>
              <p className="mt-2 text-base font-semibold text-stone-900">{progression.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{progression.detail}</p>
            </>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Fatigue & recovery</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">Sustainability and recovery fit calculate after you build.</p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={STATUS_BADGE[analysis.status]}>{STATUS_LABEL[analysis.status]}</Badge>
                <Badge variant={analysis.sustainable ? 'progressing' : 'overtraining'}>
                  {analysis.sustainable ? 'Sustainable' : 'Check volume'}
                </Badge>
              </div>
              <p className="mt-3 text-xs font-medium text-stone-800">Recovery fit</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{analysis.recoveryFit}</p>
              <p className="mt-4 text-xs font-medium text-stone-800">Stimulus vs fatigue</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                Stimulus index {analysis.stimulusIndex} balances ~
                {MUSCLE_KEYS.reduce((s, m) => s + volumeByMuscle[m], 0)} indexed sets against fatigue {analysis.fatigueScore}.
              </p>
            </>
          )}
        </Card>
        <Card className="flex flex-1 flex-col p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Block recommendations</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">Specific cues populate from your split, time cap, and flags.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analysis.recommendations.map((r) => (
                <li key={r.key} className="border-l-2 border-teal-500 pl-3">
                  <p className="text-sm font-semibold text-stone-900">{r.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Volume allocation */}
      <div className="col-span-12">
        <Card className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Weekly volume allocation</h2>
              <p className="mt-1 text-xs text-stone-500">Target hard sets per muscle (scaled by frequency, session length, recovery)</p>
            </div>
          </div>
          {!hasPlan ? (
            <p className="mt-6 text-sm text-stone-500">Volume targets appear once the block is built.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
              <VolumeByMuscleChart volumeByMuscle={volumeByMuscle} />
              <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-stone-100">
                <table className="w-full min-w-[280px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/80 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                      <th className="px-3 py-2">Muscle</th>
                      <th className="px-3 py-2">Hard sets / wk</th>
                      <th className="px-3 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MUSCLE_KEYS.map((m) => (
                      <tr key={m} className="border-b border-stone-50">
                        <td className="px-3 py-2 font-medium text-stone-800">{MUSCLE_LABEL[m]}</td>
                        <td className="px-3 py-2 tabular-nums text-stone-700">{volumeByMuscle[m]}</td>
                        <td className="px-3 py-2 text-stone-500">
                          {form.weakAreas.includes(m)
                            ? '+ weak-point bias'
                            : form.priorityLift === 'bench' && m === 'chest'
                              ? 'Priority lift'
                              : form.priorityLift === 'squat' && m === 'legs'
                                ? 'Priority lift'
                                : form.priorityLift === 'deadlift' && (m === 'back' || m === 'legs')
                                  ? 'Priority lift'
                                  : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Charts row */}
      <div className="col-span-12 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Mesocycle load curve</h2>
          <p className="mt-1 text-xs text-stone-500">Planned block load % — Base → Build → Overreach → Deload</p>
          {!hasPlan ? (
            <div className="mt-10 flex h-36 items-center justify-center rounded-xl bg-stone-50 text-sm text-stone-400">Build a block</div>
          ) : (
            <div key={result.generatedAt} className="pp-fade-up mt-2">
              <MesocycleLoadCurve weeks={meso.weeks} loadCurve={meso.loadCurve} />
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Stimulus vs fatigue trend</h2>
          <p className="mt-1 text-xs text-stone-500">Modeled weekly demand — deload should pull fatigue below stimulus</p>
          {!hasPlan ? (
            <div className="mt-10 flex h-36 items-center justify-center rounded-xl bg-stone-50 text-sm text-stone-400">Build a block</div>
          ) : (
            <div key={`${result.generatedAt}-sf`} className="pp-fade-up mt-2">
              <StimulusFatigueChart
                stimulusTrend={meso.stimulusTrend}
                fatigueTrend={meso.fatigueTrend}
                weekLabels={weekLabels}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="col-span-12">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Weekly emphasis distribution</h2>
          <p className="mt-1 text-xs text-stone-500">How session labels distribute across the microcycle</p>
          {!hasPlan ? (
            <div className="mt-8 flex h-24 items-center justify-center rounded-xl bg-stone-50 text-sm text-stone-400">Build a block</div>
          ) : (
            <div className="pp-fade-up mt-4 max-w-lg">
              <WeeklyEmphasisChart emphasis={emphasis} />
            </div>
          )}
        </Card>
      </div>

      {/* Weak-point strategy | Mesocycle structure */}
      <div className="col-span-12 md:col-span-6">
        <Card className="h-full p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Weak-point strategy</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">Tactics anchor to your split order and session length.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {weakStrategy.map((w, i) => (
                <li key={`${w.muscle}-${i}`} className="rounded-lg border border-stone-100 bg-stone-50/80 p-3">
                  <p className="text-sm font-semibold text-stone-900">{w.muscle}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{w.tactic}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Card className="h-full p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">4-week mesocycle structure</h2>
          {!hasPlan ? (
            <p className="mt-3 text-sm text-stone-500">Phases adapt to recovery tolerance and weekly frequency.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {meso.weeks.map((w) => (
                <li key={w.week} className="flex gap-3 border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                  <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-teal-600 text-[10px] font-bold leading-tight text-white">
                    W{w.week}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-stone-900">{w.label}</p>
                      <Badge variant="neutral">{w.volumePct}% volume</Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium text-teal-800">{w.intensityCue}</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">{w.prescription}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  )
}
