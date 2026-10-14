import { useEffect, useState } from 'react'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import PageShell, { BEAVER_POSITION } from '../components/PageShell'
import {
  fetchApplications,
} from '../lib/applications'
import CalendarDay from '../components/CalendarDay'
import useTaskList from '../components/hooks/useTaskList'

const EMPTY_ITEMS = new Map()

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function groupByDate(applications) {
  return new Map(
    applications
      .filter((application) => application.dueDate != null) // Due dates can be null, filter those apps/tasks out
      .map((application) => [
        new Date(application.dueDate),
        application,
      ]),
  )
}

function getApplicationForDate(applicationsByDate, year, month, day) {
  const results = new Array();
  for (const [date, application] of applicationsByDate) {
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      results.push(application);
    }
  }

  return results
}

function CalendarPage() {
  const [items, setItems] = useState(EMPTY_ITEMS)
  const taskList = useTaskList();
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const tasks = groupByDate(
    Object.entries(taskList.tasks)
      .filter(([key]) => key !== 'completed')
      .flatMap(([, taskItems]) => taskItems),
  )

  useEffect(() => {
    let cancelled = false

    fetchApplications()
      .then((applications) => {
        if (!cancelled) setItems(groupByDate(applications))
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

  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const getDayIndex = (index, days) => index - days * Math.floor(index/days) + 1;
  const getRows = (year, month) =>
    Math.ceil((getFirstDayOfMonth(year, month) + getDaysInMonth(year, month)) / 7);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  const rows = getRows(year, month);

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const daysInPrevMonth = getDaysInMonth(year, prevMonth);
  const daysInNextMonth = (rows * 7) - (daysInMonth + firstDayIndex);

  const borderStyle = {
    border: '0.5px solid #d6d6d6',
  }
  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hello, Stranger<span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-base">Welcome to your calendar</p>
          {isLoading && <p className="mt-1 text-xs text-brand-black/60">Loading your calendar…</p>}
          {loadError && (
            <p className="mt-1 text-xs text-red-600">Couldn't load calendar. Try refreshing.</p>
          )}
        </div>
        <div className="flex flex-col justify-between items-end min-w-2xs mt-auto">
          <h2>{MONTHS[month]} {year}</h2>
          <div>
            <button onClick={handlePrevMonth} className="px-2 bg-gray-300 hover:bg-gray-400 rounded-l">Prev</button>
            <button onClick={handleNextMonth} className="px-2 px-2 bg-gray-300 hover:bg-gray-400 rounded-r">Next</button>
          </div>
        </div>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      <div style={borderStyle} className="relative z-10 grid grid-cols-7 grid-rows-1 gap-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-brand-bg">
            <p style = {{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }} className='font-semibold'>{day}</p>
          </div>
        ))}
      </div>

      <div style={borderStyle} className="relative z-10 grid flex-1 grid-cols-7 grid-rows-${rows} gap-0">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <CalendarDay
            id={(daysInPrevMonth - (firstDayIndex - index) + 1).toString()}
            title={(daysInPrevMonth - (firstDayIndex - index) + 1).toString()}
            events={getApplicationForDate(items, prevYear, prevMonth, (daysInPrevMonth - (firstDayIndex - index) + 1))}
            tasks={[]}
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => (
          <CalendarDay
            id={getDayIndex(index, daysInMonth).toString()}
            title={getDayIndex(index, daysInMonth).toString()}
            events={getApplicationForDate(items, year, month, index + 1)}
            tasks={getApplicationForDate(tasks, year, month, index + 1)}
            isCurrent={
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === index + 1
            }
          />
        ))}

        {Array.from({ length: daysInNextMonth }).map((_, index) => (
          <CalendarDay
            id={(index + 1).toString()}
            title={(index + 1).toString()}
            events={getApplicationForDate(items, nextYear, nextMonth, index + 1)}
            tasks={[]}
          />
        ))}
      </div>

      <img
        src={beaverArms}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-20`}
      />
    </PageShell>
  )
}

export default CalendarPage
