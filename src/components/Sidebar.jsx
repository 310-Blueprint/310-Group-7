import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    label: 'Documents',
    to: '/documents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
        <path
          d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6.5 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 items-center justify-between gap-4 rounded-[1.75rem] bg-brand-black px-5 py-4 text-white md:w-52 md:flex-col md:items-stretch md:justify-start md:rounded-[2.5rem] md:px-5 md:py-8 lg:w-58 lg:px-7 lg:py-9">
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
          <span className="size-3 rounded-full bg-input-bg" />
        </span>
        <span className="text-xl font-bold sm:text-2xl lg:text-3xl">Pipeline</span>
      </div>

      <nav className="flex gap-1 md:mt-10 md:flex-col">
        {NAV_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full px-3 py-2.5 text-sm transition-colors sm:px-4 md:gap-3 md:py-3 md:text-base ${
                isActive ? 'bg-white text-brand-black' : 'text-white hover:bg-white/10'
              }`
            }
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
