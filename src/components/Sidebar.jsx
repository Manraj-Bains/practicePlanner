import {
  GOALS,
  EXPERIENCE,
  RECOVERY_TOLERANCE,
  PRIORITY_LIFT,
  SESSION_LENGTH,
  WEAK_AREAS,
} from '../lib/planEngine'

const nav = [
  { id: 'dash', label: 'Block builder', active: true },
  { id: 'programs', label: 'Programs', active: false },
  { id: 'history', label: 'History', active: false },
]

const selectCls =
  'w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs text-stone-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30'
const labelCls = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500'

export function Sidebar({ form, onChange, onGenerate }) {
  const setField = (key, v) => onChange({ ...form, [key]: v })

  const toggleWeak = (key) => {
    const set = new Set(form.weakAreas)
    if (set.has(key)) set.delete(key)
    else set.add(key)
    onChange({ ...form, weakAreas: Array.from(set) })
  }

  return (
    <aside className="flex h-dvh w-[17.5rem] shrink-0 flex-col border-r border-stone-200/90 bg-white">
      <div className="border-b border-stone-100 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-600">PracticePlanner</p>
        <p className="mt-1 text-sm font-semibold text-stone-900">Mesocycle console</p>
      </div>

      <nav className="border-b border-stone-100 px-2 py-3" aria-label="Main">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.id}>
              <span
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  item.active ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Block constraints</p>
        <form
          className="flex flex-1 flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault()
            onGenerate()
          }}
        >
          <div>
            <label className={labelCls} htmlFor="sb-goal">
              Goal
            </label>
            <select
              id="sb-goal"
              className={selectCls}
              value={form.goal}
              onChange={(e) => setField('goal', e.target.value)}
            >
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-exp">
              Experience
            </label>
            <select
              id="sb-exp"
              className={selectCls}
              value={form.experience}
              onChange={(e) => setField('experience', e.target.value)}
            >
              {EXPERIENCE.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-days">
              Days / week
            </label>
            <select
              id="sb-days"
              className={selectCls}
              value={form.trainingDays}
              onChange={(e) => setField('trainingDays', Number(e.target.value))}
            >
              {[3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-rec">
              Recovery tolerance
            </label>
            <select
              id="sb-rec"
              className={selectCls}
              value={form.recoveryTolerance}
              onChange={(e) => setField('recoveryTolerance', e.target.value)}
            >
              {RECOVERY_TOLERANCE.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-pri">
              Priority lift
            </label>
            <select
              id="sb-pri"
              className={selectCls}
              value={form.priorityLift}
              onChange={(e) => setField('priorityLift', e.target.value)}
            >
              {PRIORITY_LIFT.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-len">
              Session length
            </label>
            <select
              id="sb-len"
              className={selectCls}
              value={form.sessionLength}
              onChange={(e) => setField('sessionLength', Number(e.target.value))}
            >
              {SESSION_LENGTH.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="sb-plateau">
              Plateau status
            </label>
            <select
              id="sb-plateau"
              className={selectCls}
              value={form.plateau ? 'yes' : 'no'}
              onChange={(e) => setField('plateau', e.target.value === 'yes')}
            >
              <option value="no">No — progressing</option>
              <option value="yes">Yes — stalled</option>
            </select>
          </div>

          <fieldset className="min-w-0">
            <legend className={labelCls}>Weak muscle groups</legend>
            <div className="mt-1 flex flex-wrap gap-1">
              {WEAK_AREAS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`cursor-pointer rounded-md border px-2 py-1 text-[11px] font-medium ${
                    form.weakAreas.includes(key)
                      ? 'border-teal-300 bg-teal-50 text-teal-900'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.weakAreas.includes(key)}
                    onChange={() => toggleWeak(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto border-t border-stone-100 pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              Build 4-week block
            </button>
          </div>
        </form>
      </div>
    </aside>
  )
}
