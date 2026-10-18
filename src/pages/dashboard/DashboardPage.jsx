import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import beaver from '../../assets/beaver.png'
import beaverArms from '../../assets/beaverArms.png'
import grassDouble from '../../assets/grassDouble.svg'
import ApplicationCard from '../../components/dashboard/ApplicationCard'
import ApplicationModal from '../../components/dashboard/ApplicationModal'
import NotificationPanel from '../../components/dashboard/NotificationPanel'
import PageGreeting from '../../components/layout/PageGreeting'
import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../../components/layout/PageShell'
import StatusColumn from '../../components/dashboard/StatusColumn'
import {
  deleteApplication,
  fetchApplications,
  insertApplication,
  updateApplicationPositions,
} from '../../lib/applications'
import { getUpcomingDeadlineReminders } from '../../lib/notifications'
import useAuth from '../../context/useAuth'
import { COLUMNS, groupByStatus } from './dashboardData'
import filterIcon from '../../assets/filter-svgrepo-com.svg'
import FilterModal from '../../components/dashboard/FilterModal'
import { celebrateCompletedTask } from '../../lib/celebrationEffect'

const NEW_APPLICATION_COLUMN = COLUMNS[0].id
const OFFER_COLUMN = 'offer'
const EMPTY_ITEMS = COLUMNS.reduce(
  (acc, column) => ({ ...acc, [column.id]: [] }),
  {}
)

function findContainer(items, id) {
  if (id in items) return id
  return Object.keys(items).find((key) =>
    items[key].some((item) => item.id === id)
  )
}

// helper methods to apply filters to jobs on board
function matchesText(value, filter) {
  const searchText = filter.trim().toLowerCase()
  return !searchText || (value ?? '').toLowerCase().includes(searchText)
}

function matchesFilters(application, filters) {
  return (
    matchesText(application.company, filters.company) &&
    matchesText(application.location, filters.location) &&
    matchesText(application.role, filters.role)
  )
}

function filterItems(items, filters) {
  const visibleItems = {}

  for (const column of COLUMNS) {
    const applications = items[column.id].filter((application) =>
      matchesFilters(application, filters)
    )

    if (filters.sortOrder) {
      applications.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()

        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
    }

    visibleItems[column.id] = applications
  }

  return visibleItems
}

function DashboardPage() {
  const { user } = useAuth()
  const [items, setItems] = useState(EMPTY_ITEMS)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeApplication, setActiveApplication] = useState(null)
  const [dragStartContainer, setDragStartContainer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Stored filter values/states
  const [filters, setFilters] = useState({
    company: '',
    location: '',
    role: '',
    sortOrder: '',
  })

  useEffect(() => {
    let cancelled = false

    fetchApplications()
      .then((applications) => {
        if (!cancelled) setItems(groupByStatus(applications, COLUMNS))
      })
      .catch((error) => {
        console.error('Failed to load applications', error)
        if (!cancelled) setLoadError(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const visibleItems = filterItems(items, filters)
  const reminders = useMemo(
    () => getUpcomingDeadlineReminders(Object.values(items).flat()),
    [items]
  )

  function handleDragStart(event) {
    const container = findContainer(items, event.active.id)
    setDragStartContainer(container)
    setActiveApplication(
      items[container]?.find((item) => item.id === event.active.id) ?? null
    )
  }

  function handleDragOver(event) {
    const { active, over } = event
    if (!over) return

    const activeContainer = findContainer(items, active.id)
    const overContainer = findContainer(items, over.id)

    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return

    setItems((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.findIndex((item) => item.id === active.id)
      const overIndex = overItems.findIndex((item) => item.id === over.id)
      const newIndex = overIndex >= 0 ? overIndex : overItems.length

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex),
        ],
      }
    })
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveApplication(null)
    const startContainer = dragStartContainer
    setDragStartContainer(null)
    if (!over) return

    const activeContainer = findContainer(items, active.id)
    const overContainer = findContainer(items, over.id)
    if (!activeContainer || !overContainer) return

    const activeIndex = items[activeContainer].findIndex(
      (item) => item.id === active.id
    )
    const overIndex = items[overContainer].findIndex(
      (item) => item.id === over.id
    )

    let nextItems = items
    if (activeContainer === overContainer && activeIndex !== overIndex) {
      nextItems = {
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }
    }

    if (startContainer && startContainer !== overContainer) {
      nextItems = {
        ...nextItems,
        [overContainer]: nextItems[overContainer].map((application) =>
          application.id === active.id
            ? { ...application, status: overContainer }
            : application
        ),
      }
    }

    if (nextItems !== items) setItems(nextItems)

    updateApplicationPositions(overContainer, nextItems[overContainer]).catch(
      (error) => console.error('Failed to save card position', error)
    )
    if (startContainer && startContainer !== overContainer) {
      updateApplicationPositions(
        startContainer,
        nextItems[startContainer]
      ).catch((error) => console.error('Failed to save card position', error))

      if (overContainer === OFFER_COLUMN) celebrateCompletedTask()
    }
  }

  function handleAddApplication(application) {
    const status = NEW_APPLICATION_COLUMN
    console.log('status:', status, 'keys:', Object.keys(items))
    const position = items[status].length

    insertApplication({ ...application, status, position, userId: user.id })
      .then((created) => {
        setItems((prev) => ({
          ...prev,
          [status]: [...prev[status], created],
        }))
      })
      .catch((error) => console.error('Failed to add application', error))

    setIsModalOpen(false)
  }

  function handleDeleteApplication(id) {
    const column = findContainer(items, id)
    if (!column) return

    setItems((prev) => ({
      ...prev,
      [column]: prev[column].filter((application) => application.id !== id),
    }))

    deleteApplication(id).catch((error) =>
      console.error('Failed to delete application', error)
    )
  }

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <PageGreeting description="Welcome to your internship dashboard">
          {isLoading && (
            <p className="mt-1 text-xs text-brand-black/60">
              Loading your applications…
            </p>
          )}
          {loadError && (
            <p className="mt-1 text-xs text-red-600">
              Couldn't load applications. Try refreshing.
            </p>
          )}
        </PageGreeting>

        <div className="flex items-center gap-2">
          {/*FILTER BUTTON*/}
          <button
            type="button"
            aria-label="Open filters."
            onClick={() => setIsFilterOpen(true)}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-black sm:h-14 sm:w-14 transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black"
          >
            <img src={filterIcon} alt="Filter button." className="size-6" />
          </button>

          {/*ADD APPLICATION BUTTON*/}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`w-full transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black sm:w-auto ${PRIMARY_PILL_CLASSES}`}
          >
            + Add application
          </button>
        </div>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      <NotificationPanel
        key={user?.id}
        reminders={reminders}
        userId={user?.id}
        className="mb-4"
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => (
            <StatusColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tone={column.tone}
              applications={visibleItems[column.id]}
              onDeleteApplication={handleDeleteApplication}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApplication ? (
            <div className="rotate-2">
              <ApplicationCard {...activeApplication} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddApplication}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSubmit={(nextFilters) => {
          setFilters(nextFilters)
          setIsFilterOpen(false)
        }}
      />
    </PageShell>
  )
}

export default DashboardPage
