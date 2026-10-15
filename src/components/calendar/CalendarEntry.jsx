function CalendarEntry({ application }) {
  const status = (
    application.status.charAt(0).toUpperCase() + application.status.slice(1)
  ).replace('_', ' ')
  const cols = new Map([
    ['to_apply', 'border-sky-300'],
    ['applied', 'border-red-300'],
    ['interview', 'border-green-300'],
    ['offer', 'border-amber-300'],
  ])

  const svgcols = new Map([
    ['to_apply', 'stroke-sky-400'],
    ['applied', 'stroke-red-400'],
    ['interview', 'stroke-green-400'],
    ['offer', 'stroke-amber-400'],
  ])

  return (
    <div
      className={`rounded-[0.5rem] bg-white px-2 py-1 text-brand-black border-1 ${cols.get(application.status)}`}
    >
      <p className="truncate text-xs font-medium select-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`mr-1 inline-block align-[-3px] ${svgcols.get(application.status)}`}
        >
          <rect x="1" y="1" width="14" height="14" rx="3" />
          <path d="M4 6.25h8M4 9.75h8" strokeLinecap="round" />
        </svg>
        {status} - {application.company}
      </p>
    </div>
  )
}

export default CalendarEntry
