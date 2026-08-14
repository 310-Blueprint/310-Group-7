import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import StatusColumn from '../components/StatusColumn'
import { INITIAL_COLUMNS } from './dashboardData'

const BEAVER_POSITION = 'pointer-events-none absolute left-[35%] top-14 w-31'

function DashboardPage() {
  return (
    <main className="h-screen min-w-[75rem] overflow-hidden bg-brand-bg p-4 text-brand-black">
      <div className="mx-auto flex h-full max-w-[100rem] gap-5">
        <aside
          className="w-58 shrink-0 rounded-[2.5rem] bg-brand-black px-7 py-9 text-white"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-white">
              <span className="size-3 rounded-full bg-input-bg" />
            </span>
            <span className="text-3xl font-bold">Pipeline</span>
          </div>
        </aside>

        <section className="relative isolate flex min-w-0 flex-1 flex-col pl-2">
          <header className="mb-7 flex items-start justify-between px-2 pt-9">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Hello, Stranger<span aria-hidden="true">✦</span>
              </h1>
              <p className="mt-1 text-base">Welcome to your internship dashboard</p>
            </div>
            <button
              type="button"
              className="cursor-default rounded-full bg-brand-black px-9 py-4 text-base text-white"
            >
              + Add application
            </button>
          </header>

          <img
            src={beaver}
            alt=""
            aria-hidden="true"
            className={`${BEAVER_POSITION} z-0`}
          />

          <div className="relative z-10 grid flex-1 grid-cols-4 gap-4 overflow-hidden">
            {INITIAL_COLUMNS.map((column) => (
              <StatusColumn key={column.title} {...column} />
            ))}
          </div>

          <img
            src={beaverArms}
            alt=""
            aria-hidden="true"
            className={`${BEAVER_POSITION} z-20`}
          />

          <img
            src={grassDouble}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 right-[25%] z-20 w-44 translate-x-1/2 opacity-80"
          />
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
