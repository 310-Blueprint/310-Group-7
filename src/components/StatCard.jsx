function StatCard({ label, value, caption, tone = 'bg-white' }) {
  return (
    <div className={`${tone} flex flex-col rounded-[1.35rem] p-4 sm:p-5`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{value}</p>
      {caption && <p className="mt-1 text-xs text-brand-black/70">{caption}</p>}
    </div>
  )
}

export default StatCard
