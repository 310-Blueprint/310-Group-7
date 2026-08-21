import { useState } from 'react'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import Sidebar from '../components/Sidebar'
import StatusColumn from '../components/StatusColumn'
import ApplicationModal from '../components/ApplicationModal'
import { INITIAL_COLUMNS } from './dashboardData'

const BEAVER_POSITION = 'pointer-events-none absolute left-[35%] top-14 w-31'

function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  function handleAddApplication(application){
    const newApplication = {
      id: `${application.company}-${application.role}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),...application,
    }

    setColumns((prevColumns) => prevColumns.map((column) => column.title === 'To apply' ? { ...column, applications: [...column.applications, newApplication]} : column,),)
    setIsModalOpen(false)
  }
  return (
    <main className="h-screen min-w-[75rem] overflow-hidden bg-brand-bg p-4 text-brand-black">
      <div className="mx-auto flex h-full max-w-[100rem] gap-5">
        <Sidebar />

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
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-brand-black px-9 py-4 text-base text-white"
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
            {columns.map((column) => (
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

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit= {handleAddApplication}
          
      />
    </main>
  )
}

export default DashboardPage