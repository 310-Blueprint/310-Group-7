// One labelled horizontal bar. The visible text carries the data, so the bar
// itself is decorative and hidden from screen readers.
function ChartBar({ label, value, fraction, tone, note }) {
  const clamped = Math.min(Math.max(fraction ?? 0, 0), 1)

  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div aria-hidden="true" className="mt-1.5 h-4 overflow-hidden rounded-full bg-brand-bg">
        <div className={`${tone} h-full rounded-full`} style={{ width: `${clamped * 100}%` }} />
      </div>
      {note && <p className="mt-1 text-xs text-brand-black/70">{note}</p>}
    </li>
  )
}

export default ChartBar
