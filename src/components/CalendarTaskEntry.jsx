function CalendarTaskEntry({ task }) {
  const status = (
    task.status.charAt(0).toUpperCase() + task.status.slice(1)
  ).replace('_', ' ')
  const cols = new Map([
    ['todo', 'border-sky-300'],
    ['in_progress', 'border-red-300'],
  ])

  const svgcols = new Map([
    ['todo', 'stroke-sky-400'],
    ['in_progress', 'stroke-red-400'],
  ])

  return (
    <div
      className={`rounded-[0.5rem] bg-white px-2 py-1 text-brand-black border-1 ${cols.get(task.status)}`}
    >
      <p className="truncate text-xs font-medium select-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`mr-1 inline-block align-[-3px] ${svgcols.get(task.status)}`}
        >
          <rect x="1" y="1" width="14" height="14" rx="3" />
        </svg>
        {status} - {task.title}
      </p>
    </div>
  )
}

export default CalendarTaskEntry
