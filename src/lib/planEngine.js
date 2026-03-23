/**
 * Mesocycle / training-block planner — front-end only, rule-based.
 * Outputs are consistent and input-driven so the UI can present real structure.
 */

export const GOALS = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'powerbuilding', label: 'Powerbuilding' },
]

export const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const RECOVERY_TOLERANCE = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const PRIORITY_LIFT = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'bench', label: 'Bench' },
  { value: 'squat', label: 'Squat' },
  { value: 'deadlift', label: 'Deadlift' },
]

export const SESSION_LENGTH = [
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
]

export const WEAK_AREAS = [
  { key: 'chest', label: 'Chest' },
  { key: 'legs', label: 'Legs' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'arms', label: 'Arms' },
]

export const MUSCLE_KEYS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']

const RECOVERY_IDX = { low: 0, medium: 1, high: 2 }

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function roundSets(n) {
  return Math.max(4, Math.round(n))
}

/**
 * Decide split architecture from constraints.
 */
export function resolveSplit(inputs) {
  const { goal, trainingDays, recoveryTolerance, priorityLift } = inputs
  const rec = recoveryTolerance

  /** @type {Array<{ type: string, label: string, rationale: string, days: string[] }>} */
  const candidates = []

  if (trainingDays === 3) {
    if (goal === 'strength' && rec !== 'low') {
      candidates.push({
        type: 'full_body',
        label: 'Full body (A/B/C)',
        rationale:
          'Three strength exposures with pattern variation — each day hits squat, hinge, press, and pull at manageable volume.',
        days: ['Full A — squat bias', 'Full B — hinge bias', 'Full C — press bias'],
      })
    }
    candidates.push({
      type: 'ppl',
      label: 'Push / pull / legs',
      rationale:
        'Maximizes quality per pattern with a full recovery day between similar muscle groups across the week.',
      days: ['Push', 'Pull', 'Legs'],
    })
  }

  if (trainingDays === 4) {
    if (goal === 'powerbuilding') {
      candidates.push({
        type: 'powerbuilding',
        label: 'Powerbuilding 4-day',
        rationale:
          'Heavy compounds early in the week, hypertrophy density later — keeps neural work and volume separated.',
        days: ['Strength upper', 'Strength lower', 'Hypertrophy upper', 'Hypertrophy lower'],
      })
    }
    candidates.push({
      type: 'upper_lower',
      label: 'Upper / lower',
      rationale:
        'Doubles frequency on each half of the body — strong fit for progressive overload without daily systemic smash.',
      days: ['Upper', 'Lower', 'Upper', 'Lower'],
    })
  }

  if (trainingDays === 5) {
    candidates.push({
      type: 'ppl_plus',
      label: 'PPL + upper focus',
      rationale:
        'Adds a fourth upper slot so shoulders and pressing can recover while back work stays distributed.',
      days: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
    })
    if (goal === 'powerbuilding') {
      candidates.push({
        type: 'powerbuilding',
        label: 'Powerbuilding 5-day',
        rationale:
          'Alternates heavy and pump sessions across the week so intensity and volume do not collide daily.',
        days: ['Heavy upper', 'Heavy lower', 'Pump push', 'Pump pull', 'Legs + core'],
      })
    }
  }

  if (trainingDays === 6) {
    candidates.push({
      type: 'ppl',
      label: 'Push / pull / legs ×2',
      rationale:
        'High-frequency hypertrophy block — each pattern twice weekly with staggered emphasis (heavy / volume).',
      days: ['Push Hvy', 'Pull Hvy', 'Legs Hvy', 'Push Vol', 'Pull Vol', 'Legs Vol'],
    })
  }

  let pick = candidates[0]
  if (priorityLift === 'bench' && candidates.some((c) => c.type === 'ppl_plus')) {
    pick = candidates.find((c) => c.type === 'ppl_plus') || pick
  }
  if (priorityLift === 'squat' && trainingDays === 4) {
    pick = candidates.find((c) => c.type === 'upper_lower') || pick
  }
  if (priorityLift === 'deadlift' && trainingDays === 3) {
    pick = candidates.find((c) => c.type === 'ppl') || pick
  }
  if (goal === 'powerbuilding' && trainingDays === 4) {
    pick = candidates.find((c) => c.type === 'powerbuilding') || pick
  }
  if (goal === 'powerbuilding' && trainingDays === 5) {
    pick = candidates.find((c) => c.type === 'powerbuilding') || pick
  }

  return {
    type: pick.type,
    displayLabel: pick.label,
    rationale: pick.rationale,
    sessionLabels: pick.days,
  }
}

const EXERCISE_STYLE = {
  strength: {
    compound: (lift) => `${lift} — top set RPE 8 + 2 back-offs 4–6 reps`,
    accessory: 'Accessory — 3×6–8 controlled',
  },
  hypertrophy: {
    compound: (lift) => `${lift} — 3–4×8–12, 1–2 RIR last sets`,
    accessory: 'Accessory — 3×12–15 metabolic',
  },
  powerbuilding: {
    compound: (lift) => `${lift} — heavy 5×3–5 then back-off 2×8`,
    accessory: 'Pump slot — 2×15–20 short rest',
  },
}

function liftLabel(priority) {
  if (priority === 'bench') return 'Bench press'
  if (priority === 'squat') return 'Squat'
  if (priority === 'deadlift') return 'Deadlift'
  return null
}

function sessionExercises(splitType, sessionName, inputs) {
  const g = inputs.goal
  const style = EXERCISE_STYLE[g] || EXERCISE_STYLE.hypertrophy
  const priName = liftLabel(inputs.priorityLift)
  const weak = new Set(inputs.weakAreas)

  const lines = []
  const add = (s) => lines.push(s)

  const compoundBench = style.compound('Bench press')
  const compoundSquat = style.compound('Squat')
  const compoundHinge = style.compound('Deadlift / hinge')

  if (splitType === 'full_body') {
    if (sessionName.includes('squat')) {
      add(compoundSquat)
      add(style.compound('Overhead press'))
      add('Row variation — 4×6–10')
    } else if (sessionName.includes('hinge')) {
      add(compoundHinge)
      add('Secondary squat pattern — 3×5–8')
      add('Horizontal press — 3×6–10')
    } else {
      add(compoundBench)
      add('Single-leg or split squat — 3×8–12')
      add('Lat emphasis pull — 4×8–12')
    }
  } else if (splitType === 'upper_lower') {
    if (sessionName === 'Upper') {
      add(inputs.priorityLift === 'deadlift' ? 'Press priority — 5×4–8' : compoundBench)
      add('Row / pulldown superset — 4×8–12')
      add(style.accessory)
    } else {
      add(inputs.priorityLift === 'squat' ? compoundSquat : compoundHinge)
      add('Unilateral leg — 3×8–12')
      add('Core brace — 3×10–15')
    }
  } else if (splitType === 'powerbuilding') {
    if (/heavy|strength/i.test(sessionName)) {
      add(priName ? style.compound(priName) : compoundBench)
      add('Secondary compound — 4×4–6')
      add('Low-volume pull — 3×5–8')
    } else if (/leg/i.test(sessionName)) {
      add(compoundSquat)
      add('Leg press / hack — 3×10–15')
      add('Isolation finisher — 3×12–20')
    } else {
      add('Primary machine / DB work — 4×10–15')
      add('Isolation stack — 3×12–20')
      add('Weak-point finisher — 2×AMRAP light')
    }
  } else if (splitType === 'ppl_plus' && sessionName === 'Upper') {
    add('Horizontal press — 4×6–10')
    add('Vertical pull — 4×8–12')
    add('Shoulder + arm density — 5×10–15')
  } else if (splitType === 'ppl_plus' && sessionName === 'Lower') {
    add(inputs.priorityLift === 'squat' ? compoundSquat : 'Squat pattern — 4×6–10')
    add('Hamstring + quad superset — 4×10–15')
    add('Core brace — 3×12–15')
  } else if (sessionName.toLowerCase().includes('push')) {
    if (inputs.priorityLift === 'bench') add(compoundBench)
    else add('Primary press — 4×6–12')
    add('Incline or dumbbell press — 3×8–12')
    if (weak.has('shoulders')) add('Weak slot: rear-delt row — 4×12–15')
    if (weak.has('chest')) add('Weak slot: 2-count pause press — 3×6–8')
    add('Triceps density — 2×12–20')
  } else if (sessionName.toLowerCase().includes('pull')) {
    add(compoundHinge)
    add('Vertical pull — 4×6–12')
    if (weak.has('back')) add('Weak slot: chest-supported row — 4×10–12')
    if (weak.has('arms')) add('Weak slot: curl + pushdown — 3×12–15')
    add('Face pull / cuff — 3×15–20')
  } else if (sessionName.toLowerCase().includes('leg')) {
    if (inputs.priorityLift === 'squat') add(compoundSquat)
    else add('Squat or leg press — 4×6–12')
    add('Hinge / RDL — 3×8–12')
    if (weak.has('legs')) add('Weak slot: split squat or leg ext — 3×10–15')
    add('Calves + core — 3×12–20')
  } else {
    add('Primary compound — RPE 7–9')
    add('Secondary compound — moderate reps')
    add(style.accessory)
  }

  if (lines.length < 3) {
    add('Conditioning or steps — 10–20 min optional')
  }
  return lines
}

export function buildWeeklyPlan(inputs, split) {
  return split.sessionLabels.map((focus, idx) => ({
    day: idx + 1,
    focus,
    exercises: sessionExercises(split.type, focus, inputs),
  }))
}

/**
 * Weekly hard-set targets by muscle (training sets / week, illustrative but internally consistent).
 */
export function computeVolumeAllocation(inputs, split) {
  const days = inputs.trainingDays
  const goal = inputs.goal
  const len = inputs.sessionLength
  const rec = inputs.recoveryTolerance
  const weakN = inputs.weakAreas.length

  const base = {
    chest: 10,
    back: 12,
    legs: 12,
    shoulders: 8,
    arms: 6,
    core: 6,
  }

  const goalScale =
    goal === 'strength' ? 0.82 : goal === 'powerbuilding' ? 1.05 : 1
  const splitBias = {
    full_body: { chest: 1.05, back: 1.05, legs: 1.1, shoulders: 0.92, arms: 0.85, core: 1.1 },
    ppl: { chest: 1.12, back: 1.15, legs: 1.12, shoulders: 1.02, arms: 1, core: 0.95 },
    ppl_plus: { chest: 1.2, back: 1.12, legs: 1.05, shoulders: 1.08, arms: 1.05, core: 0.9 },
    upper_lower: { chest: 1.05, back: 1.08, legs: 1.08, shoulders: 1, arms: 0.95, core: 1 },
    powerbuilding: { chest: 1.1, back: 1.02, legs: 1.05, shoulders: 1.05, arms: 1.08, core: 0.9 },
  }
  const bias = splitBias[split.type] || splitBias.ppl

  const freqFactor = 0.88 + days * 0.04
  const sessionFactor = len === 45 ? 0.88 : len === 90 ? 1.12 : 1
  const recoveryFactor = rec === 'low' ? 0.9 : rec === 'high' ? 1.06 : 1

  const out = {}
  for (const m of MUSCLE_KEYS) {
    let v = base[m] * goalScale * (bias[m] || 1) * freqFactor * sessionFactor * recoveryFactor
    if (inputs.weakAreas.includes(m)) v += 3
    if (m === 'arms' && inputs.weakAreas.includes('arms')) v += 2
    out[m] = roundSets(v + weakN * 0.35)
  }

  if (inputs.priorityLift === 'bench') out.chest = roundSets(out.chest + 3)
  if (inputs.priorityLift === 'squat') out.legs = roundSets(out.legs + 4)
  if (inputs.priorityLift === 'deadlift') {
    out.back = roundSets(out.back + 3)
    out.legs = roundSets(out.legs + 2)
  }

  if (inputs.plateau) {
    for (const m of MUSCLE_KEYS) out[m] = roundSets(out[m] * 1.06)
  }

  return out
}

export function assignProgressionMethod(inputs) {
  const { goal, experience, plateau } = inputs
  if (plateau && goal !== 'strength') {
    return {
      id: 'volume_progression',
      label: 'Volume progression',
      detail:
        'Add one hard set on lagging patterns before reloading weight. Keep top sets at the same load for 2 weeks while sets climb, then retest a heavier triple.',
    }
  }
  if (goal === 'strength' && (experience === 'advanced' || experience === 'intermediate')) {
    return {
      id: 'top_set_backoff',
      label: 'Top set + back-offs',
      detail:
        'One heavy single or triple @ RPE 8, then 2–4 back-off sets at ~80–85% for clean reps. Progress the top set when back-offs are fast.',
    }
  }
  if (goal === 'hypertrophy' && experience === 'beginner') {
    return {
      id: 'double_progression',
      label: 'Double progression',
      detail:
        'Pick a rep band (e.g. 8–12). When you hit 12 on all sets with 1 RIR, add the smallest load jump and return to the bottom of the band.',
    }
  }
  if (goal === 'powerbuilding') {
    return {
      id: 'mixed_wave',
      label: 'Load + volume waves',
      detail:
        'Odd weeks: heavy compounds 5×3–5. Even weeks: same lifts 4×6–8 with one fewer set on accessories to absorb fatigue.',
    }
  }
  return {
    id: 'load_progression',
    label: 'Linear load progression',
    detail:
      'Add load in micro-steps when all prescribed sets stay 1–2 RIR. If a rep falls off, hold load and fix bar speed before moving again.',
  }
}

/**
 * 4-week block: Base → Build → Overreach → Deload, modulated by recovery + frequency.
 */
export function buildMesocycleStructure(inputs) {
  const rec = inputs.recoveryTolerance
  const days = inputs.trainingDays
  const plateau = inputs.plateau

  const overreachScale = rec === 'high' ? 1.08 : rec === 'medium' ? 1 : 0.92
  const deloadDepth = rec === 'low' ? 0.55 : rec === 'medium' ? 0.62 : 0.68
  const freqPenalty = days >= 6 ? 0.06 : 0

  const peak = clamp(1.02 * overreachScale - freqPenalty - (plateau ? 0.04 : 0), 0.85, 1.12)

  const weeks = [
    {
      week: 1,
      phase: 'base',
      label: 'Base',
      volumePct: 78,
      intensityCue: 'RPE 7 — groove patterns, stop sets with speed',
      prescription: 'Technique-first exposures; leave 2–3 reps in tank on compounds.',
    },
    {
      week: 2,
      phase: 'build',
      label: 'Build',
      volumePct: 92,
      intensityCue: 'RPE 7.5–8 — chase rep quality, not failure',
      prescription: 'Add one working set on priority muscles or +2.5–5 lb on mains if recovery is green.',
    },
    {
      week: 3,
      phase: 'overreach',
      label: 'Overreach',
      volumePct: Math.round(100 * peak),
      intensityCue: rec === 'low' ? 'RPE 8 cap — no grinders' : 'RPE 8–9 on one top set per pattern',
      prescription:
        rec === 'low'
          ? 'Micro PR attempts only on priority lift; hold accessories steady to protect joints.'
          : 'Push density: +1 set on two sessions OR +5 lb on top sets if sleep and appetite are stable.',
    },
    {
      week: 4,
      phase: 'deload',
      label: 'Deload',
      volumePct: Math.round(100 * deloadDepth),
      intensityCue: 'RPE 6–7 — crisp bar speed only',
      prescription:
        'Halve accessories, keep compounds light and fast. Re-test a conservative top set in week 1 of the next block.',
    },
  ]

  const loadCurve = weeks.map((w) => w.volumePct)
  const stimulusTrend = weeks.map((_, i) => 42 + i * 11 + (inputs.goal === 'strength' ? 4 : 0))
  const fatigueTrend = weeks.map((w, i) => {
    const base = 28 + i * 14 + days * 2.2
    const recOff = rec === 'high' ? -6 : rec === 'low' ? 8 : 0
    const wk = w.phase === 'deload' ? base * 0.45 : base
    return Math.round(wk + recOff)
  })

  return { weeks, loadCurve, stimulusTrend, fatigueTrend }
}

export function weeklyEmphasisDistribution(split) {
  const labels = split.sessionLabels
  const counts = {}
  for (const L of labels) {
    const key = L.split(' ')[0]
    counts[key] = (counts[key] || 0) + 1
  }
  const total = labels.length
  return Object.entries(counts).map(([label, n]) => ({
    label,
    pct: Math.round((n / total) * 100),
    sessions: n,
  }))
}

export function buildWeakPointStrategy(inputs, split) {
  const weak = inputs.weakAreas
  if (weak.length === 0) {
    return [
      {
        muscle: 'General',
        tactic:
          'No weak tags selected — keep one “technique” slot weekly (tempo or pause) on your priority lift to build long-term headroom.',
      },
    ]
  }
  const map = {
    chest: `Schedule chest bias after a rest day in this ${split.displayLabel} block — use a pause or 1½-rep bench on the first push session only.`,
    legs: `Place quad-dominant work early in leg days; add a hamstring slot the session before heavy hinge work to balance knee stress.`,
    back: `Split vertical and horizontal pulls across two different days so the scapular rhythm stays fresh (${split.sessionLabels.join(' → ')}).`,
    shoulders: `Pair overhead volume with upper traps off-days; finish two sessions with cuff + rear-delt work for 8–12 total weekly sets.`,
    arms: `Bookend arm work right after compounds on push/pull days — 15 minutes max, supersets, stop before grip fails.`,
  }
  return weak.map((k) => ({
    muscle: WEAK_AREAS.find((w) => w.key === k)?.label || k,
    tactic: map[k] || 'Add a second exposure at low RPE mid-week.',
  }))
}

function sustainabilityScore(inputs, fatigueIndex) {
  const rec = RECOVERY_IDX[inputs.recoveryTolerance] ?? 1
  const demand = inputs.trainingDays * 14 + (inputs.goal === 'strength' ? 10 : 0) + (inputs.sessionLength / 15)
  const margin = rec * 22 - demand * 0.35
  return clamp(Math.round(58 + margin - fatigueIndex * 0.12), 32, 94)
}

export function fingerprintInputs(inputs) {
  return JSON.stringify({
    goal: inputs.goal,
    experience: inputs.experience,
    days: inputs.trainingDays,
    recovery: inputs.recoveryTolerance,
    priority: inputs.priorityLift,
    weak: [...inputs.weakAreas].sort(),
    session: inputs.sessionLength,
    plateau: inputs.plateau,
  })
}

export function analyzeBlock(inputs, split, volumeByMuscle, lastFingerprint, currentFingerprint) {
  const repeated = lastFingerprint !== null && lastFingerprint === currentFingerprint

  let fatigueIndex =
    inputs.trainingDays * 11 +
    (inputs.goal === 'strength' ? 12 : inputs.goal === 'powerbuilding' ? 8 : 6) +
    (inputs.experience === 'advanced' ? 10 : inputs.experience === 'intermediate' ? 5 : 0) +
    inputs.weakAreas.length * 3 +
    (inputs.sessionLength >= 90 ? 6 : 0) +
    (inputs.recoveryTolerance === 'low' ? 14 : inputs.recoveryTolerance === 'high' ? -6 : 0)

  if (inputs.plateau) fatigueIndex += 4

  const sustain = sustainabilityScore(inputs, fatigueIndex)
  const sustainable = sustain >= 52

  let status = 'progressing'
  if (!sustainable || fatigueIndex >= 96 || (inputs.trainingDays >= 6 && inputs.recoveryTolerance === 'low')) {
    status = 'overtraining'
  } else if (repeated || inputs.plateau) {
    status = 'plateau'
  }

  const recoveryFit =
    inputs.recoveryTolerance === 'high' && inputs.trainingDays <= 4
      ? 'High tolerance is under-used — you can run week 3 closer to true overreach.'
      : inputs.recoveryTolerance === 'low' && inputs.trainingDays >= 5
        ? 'Low recovery with 5–6 exposures is tight. We shortened week 3 peaks and deepened the deload.'
        : inputs.recoveryTolerance === 'medium'
          ? 'Recovery profile matches a classic meso — progress week-to-week using RPE caps in the table.'
          : 'Recovery settings align with frequency; watch session length on leg days first.'

  const totalVol = MUSCLE_KEYS.reduce((s, m) => s + volumeByMuscle[m], 0)
  const recommendations = []

  recommendations.push({
    key: 'block',
    title: `${split.displayLabel} — ${inputs.trainingDays}d / ${inputs.sessionLength}m`,
    body: `${inputs.goal === 'strength' ? 'Strength' : inputs.goal === 'powerbuilding' ? 'Powerbuilding' : 'Hypertrophy'} focus with ~${totalVol} indexed hard sets / week across muscle groups. Priority: ${inputs.priorityLift}.`,
  })

  if (inputs.plateau) {
    recommendations.push({
      key: 'plateau',
      title: 'Plateau mode',
      body: `You flagged a plateau — we biased ${assignProgressionMethod(inputs).label.toLowerCase()} and nudged weekly volume ~6%. Change one exercise order or tempo on ${split.sessionLabels[0]} before expecting new PRs.`,
    })
  }

  if (status === 'overtraining') {
    recommendations.push({
      key: 'pull_volume',
      title: 'Pull volume back',
      body: `Fatigue index ${fatigueIndex} with ${inputs.recoveryTolerance} recovery — drop one accessory tier on the longest session or move weak-point work to a non-compound day.`,
    })
  } else if (inputs.trainingDays === 3 && inputs.goal === 'hypertrophy') {
    recommendations.push({
      key: 'density',
      title: 'Density option',
      body: 'Three-day hypertrophy responds well to myo-rep or cluster finishers on the last isolation — keep total time inside your session cap.',
    })
  } else if (inputs.goal === 'powerbuilding' && inputs.sessionLength === 45) {
    recommendations.push({
      key: 'time',
      title: 'Time guard',
      body: '45-minute powerbuilding days should alternate heavy and pump work — do not stack two heavy compounds without a quick warm-up primer set.',
    })
  }

  if (inputs.priorityLift !== 'balanced') {
    const lift = inputs.priorityLift
    recommendations.push({
      key: 'priority',
      title: `Bias ${lift}`,
      body: `Place ${lift} first after warm-ups on its primary day; secondary lifts stay 75–85% of top-set effort to protect weekly stimulus.`,
    })
  }

  if (repeated && !inputs.plateau) {
    recommendations.push({
      key: 'repeat',
      title: 'Same profile re-run',
      body: 'Inputs unchanged — treat this as a compliance check. Log RPE on week 2 top sets; if all ≤7.5, advance week 3 prescription as written.',
    })
  }

  return {
    status,
    fatigueScore: fatigueIndex,
    sustainable,
    sustainabilityScore: sustain,
    recoveryFit,
    stimulusIndex: Math.round(clamp(48 + totalVol * 0.35 - fatigueIndex * 0.2, 30, 92)),
    recommendations,
  }
}

export function buildPlanResult(inputs, lastFingerprint) {
  const fp = fingerprintInputs(inputs)
  const split = resolveSplit(inputs)
  const weeklyPlan = buildWeeklyPlan(inputs, split)
  const volumeByMuscle = computeVolumeAllocation(inputs, split)
  const mesocycle = buildMesocycleStructure(inputs)
  const progressionMethod = assignProgressionMethod(inputs)
  const emphasis = weeklyEmphasisDistribution(split)
  const weakStrategy = buildWeakPointStrategy(inputs, split)
  const analysis = analyzeBlock(inputs, split, volumeByMuscle, lastFingerprint, fp)

  return {
    fingerprint: fp,
    split,
    weeklyPlan,
    volumeByMuscle,
    mesocycle,
    progressionMethod,
    weeklyEmphasis: emphasis,
    weakStrategy,
    analysis,
    generatedAt: new Date().toISOString(),
  }
}
