import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import SortableTaskCard from './SortableTaskCard'
import TaskCard from './TaskCard'

function TaskColumn({
  id,
  title,
  tone,
  tasks,
  onDeleteTask,
  onEditTask,
  readOnly = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: readOnly,
    data: {
      type: 'column',
      readOnly,
    },
  })

  return (
    <section
      ref={setNodeRef}
      className={`${tone} flex min-h-56 flex-col rounded-[1.35rem] p-4`}
    >
      <header className="mb-7 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-base font-medium">
          <span className="size-2 rounded-full bg-white" />
          {title}
        </h2>

        <span className="min-w-8 rounded-full bg-white/70 px-2 py-1 text-center text-xs">
          {tasks.length}
        </span>
      </header>

      <div
        className={`min-h-24 flex-1 space-y-3 overflow-y-auto rounded-xl transition-colors ${
          isOver && !readOnly ? 'bg-white/15' : ''
        }`}
      >
        {readOnly ? (
          tasks.map((task) => <TaskCard key={task.id} {...task} />)
        ) : (
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  )
}

export default TaskColumn
