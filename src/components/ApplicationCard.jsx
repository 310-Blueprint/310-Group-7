function ApplicationCard({
  company,
  location,
  role,
  dueDate,
  logo,
}) {
  const initials = company
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

  return (
    <article className="rounded-2xl bg-white px-4 py-3.5 text-brand-black shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {logo ? (
          <img
            src={logo}
            alt={`${company} logo`}
            className="size-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-input-bg text-xs font-bold text-brand-black/60"
            aria-label={`${company} logo placeholder`}
          >
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight">{company}</h3>
          <p className="mt-0.5 truncate text-xs text-brand-black/65">{location}</p>
        </div>
      </div>

      <p className="mt-3 truncate text-xs font-medium">{role}</p>

      <footer className="mt-2 text-[0.6875rem] text-brand-black/55">
        <span>Due {dueDate}</span>
      </footer>
    </article>
  )
}

export default ApplicationCard
