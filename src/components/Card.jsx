export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm shadow-stone-900/5 ${className}`}
    >
      {children}
    </div>
  )
}
