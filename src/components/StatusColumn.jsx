function StatusColumn({ title, tone, applications }) {
  return (
    <section className={`${tone} flex min-h-0 flex-col rounded-[1.35rem] p-4`}>
      <header className="mb-7 flex items-center justify-between px-1">
        <h2
          className={`flex items-center gap-2 font-medium ${
            title === 'Applied / Waiting' ? 'text-sm' : 'text-base'
          }`}
        >
          <span className="size-2 rounded-full bg-white" />
          {title}
        </h2>
        <span className="min-w-8 rounded-full bg-white/70 px-2 py-1 text-center text-xs">
          {applications.length}
        </span>
      </header>
    </section>
  )
}

export default StatusColumn
