import { useDroppable } from '@dnd-kit/core'
import CalendarEntry from './CalendarEntry'
import CalendarTaskEntry from './CalendarTaskEntry'

function CalendarDay({ id, title, events, tasks, isCurrent}) {
  const { setNodeRef } = useDroppable({ id })
  const sectStyle = {
    border: '1px solid #d6d6d6'
  }

  return (
    <section
      style={sectStyle}
      className={`${isCurrent ? 'bg-[#e6e6e6]' : 'bg-brand-bg'} flex flex-col px-1`}
    >
      <header className="mb-1 flex items-center justify-between px-1">
        <h2 className={`flex items-center gap-2 font-medium text-sm`}>
          {title}
        </h2>
      </header>

      <div ref={setNodeRef} className="min-h-full flex-1 space-y-3 overflow-y-auto">
        {events.map((application) => (
          <CalendarEntry
            key={application.id}
            application={application}
          />
        ))}
        {tasks.map((task) => (
          <CalendarTaskEntry
            key={task.id}
            task={task}
          />
        ))}
      </div>
    </section>
  )
}

export default CalendarDay
