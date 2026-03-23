import { useCallback, useState } from 'react'
import { buildPlanResult } from './lib/planEngine'
import { Sidebar } from './components/Sidebar'
import { TopSummaryBar } from './components/TopSummaryBar'
import { DashboardGrid } from './components/DashboardGrid'

const defaultForm = {
  goal: 'hypertrophy',
  experience: 'intermediate',
  trainingDays: 4,
  recoveryTolerance: 'medium',
  priorityLift: 'balanced',
  weakAreas: [],
  sessionLength: 60,
  plateau: false,
}

function App() {
  const [form, setForm] = useState(defaultForm)
  const [planResult, setPlanResult] = useState(null)
  const [lastSubmittedFingerprint, setLastSubmittedFingerprint] = useState(null)

  const handleGenerate = useCallback(() => {
    const next = buildPlanResult(form, lastSubmittedFingerprint)
    setPlanResult(next)
    setLastSubmittedFingerprint(next.fingerprint)
  }, [form, lastSubmittedFingerprint])

  return (
    <div className="flex h-dvh overflow-hidden bg-stone-100">
      <Sidebar form={form} onChange={setForm} onGenerate={handleGenerate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopSummaryBar form={form} result={planResult} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" aria-label="Dashboard">
          <DashboardGrid result={planResult} form={form} />
        </main>
      </div>
    </div>
  )
}

export default App
