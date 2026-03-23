const STYLES = {
  progressing: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  plateau: 'bg-amber-50 text-amber-900 ring-amber-600/20',
  overtraining: 'bg-rose-50 text-rose-900 ring-rose-600/20',
  neutral: 'bg-stone-100 text-stone-700 ring-stone-500/15',
}

export function Badge({ variant = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[variant] ?? STYLES.neutral}`}
    >
      {children}
    </span>
  )
}
