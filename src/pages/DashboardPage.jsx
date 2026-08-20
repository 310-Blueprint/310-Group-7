import { useState } from 'react'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import Sidebar from '../components/Sidebar'
import StatusColumn from '../components/StatusColumn'
import ApplicationModal from '../components/ApplicationModal'
import { INITIAL_COLUMNS } from './dashboardData'

const BEAVER_POSITION = 'pointer-events-none absolute left-[35%] top-14 hidden w-31 xl:block'

function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-brand-bg p-3 text-brand-black sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[100rem] flex-col gap-4 sm:min-h-[calc(100vh-2rem)] md:flex-row md:gap-5">
        <Sidebar />

        <section className="relative isolate flex min-w-0 flex-1 flex-col md:pl-2">
          <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hello, Stranger<span aria-hidden="true">✦</span>
              </h1>
              <p className="mt-1 text-base">Welcome to your internship dashboard</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-full bg-brand-black px-7 py-3.5 text-base text-white transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black sm:w-auto sm:px-9 sm:py-4"
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

          <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            className="pointer-events-none absolute -bottom-2 right-[25%] z-20 hidden w-44 translate-x-1/2 opacity-80 xl:block"
          />
        </section>
      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(application) => {
          console.log(application)
          setIsModalOpen(false)
        }}
      />
    </main>
  )
}

export default DashboardPage
