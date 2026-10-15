import { DndContext, DragOverlay } from '@dnd-kit/core'
import TaskColumn from './TaskColumn'
import TaskCard from './TaskCard'
import { DUE_SOON_COLUMN, TASK_COLUMNS } from '../../lib/taskBoard'
import useTaskDragAndDrop from '../../hooks/useTaskDragAndDrop'

// Renders the task columns
function TaskBoard({
  tasks,
  dueSoonTasks,
  setTasks,
  setSaveError,
  onEditTask,
  onDeleteTask,
}) {
  const drag = useTaskDragAndDrop({ tasks, setTasks, setSaveError })

  return (
    <DndContext
      sensors={drag.sensors}
      collisionDetection={drag.collisionDetection}
      onDragStart={drag.onDragStart}
      onDragEnd={drag.onDragEnd}
      onDragCancel={drag.onDragCancel}
    >
      <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_COLUMNS.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tone={column.tone}
            tasks={tasks[column.id]}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        ))}

        {/* Automatic, read-only Due Soon column. */}
        <TaskColumn
          id={DUE_SOON_COLUMN.id}
          title={DUE_SOON_COLUMN.title}
          tone={DUE_SOON_COLUMN.tone}
          tasks={dueSoonTasks}
          readOnly
        />
      </div>
      {/* The drag hook owns placement and persistence. */}
      <DragOverlay>
        {drag.activeTask ? (
          <div className="rotate-2 cursor-grabbing">
            <TaskCard {...drag.activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default TaskBoard
