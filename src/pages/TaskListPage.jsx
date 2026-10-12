import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'

import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../components/PageShell'
import TaskModal from '../components/TaskModal'
import TaskColumn from '../components/TaskColumn'
import TaskCard from '../components/TaskCard'
import { fetchTasksByColumn } from '../lib/tasks'

// Define the task columns, including their unique IDs,
// display names, and background colours.
const TASK_COLUMNS = [
  { id: 'todo', title: 'To Do', tone: 'bg-brand-blue' },
  { id: 'in_progress', title: 'In Progress', tone: 'bg-brand-pink' },
  { id: 'completed', title: 'Completed', tone: 'bg-brand-green' },
]

// Due Soon is a view-only column, not a task status.
const DUE_SOON_COLUMN = {
  id: 'due_soon',
  title: 'Due Soon',
  tone: 'bg-brand-yellow',
}

const DUE_SOON_DAYS = 7

// Create an empty array for every task column.
// Tasks will be loaded from Supabase.
const EMPTY_TASKS = Object.fromEntries(
  TASK_COLUMNS.map((column) => [column.id, []]),
)

// Find which column contains a particular task.
// The ID may also refer to a column itself.
function findContainer(tasks, id) {
  if (Object.hasOwn(tasks, id)) return id

  return Object.keys(tasks).find((columnId) =>
    tasks[columnId].some((task) => task.id === id),
  )
}

// Find tasks due soon.
// Completed tasks and tasks without a due date are excluded.
function getDueSoonTasks(tasks) {
  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + DUE_SOON_DAYS)

  return Object.values(tasks)
    .flat()
    .filter((task) => {
      if (!task.dueDate || task.status === 'completed') {
        return false
      }

      // Date input values use YYYY-MM-DD format.
      const [year, month, day] = task.dueDate
        .split('-')
        .map(Number)

      const dueDate = new Date(year, month - 1, day)

      return dueDate >= today && dueDate <= cutoff
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

function TaskListPage() {
  const [tasks, setTasks] = useState(EMPTY_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Due Soon is calculated from the existing tasks.
  const dueSoonTasks = getDueSoonTasks(tasks)

  // Retrieve the user's saved tasks when the page opens.
  useEffect(() => {
    let cancelled = false

    fetchTasksByColumn(TASK_COLUMNS)
      .then((grouped) => {
        if (!cancelled) {
          setTasks(grouped)
          setLoadError(null)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to load tasks', error)
          setLoadError(error)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    // Prevent requests from updating state after leaving the page.
    return () => {
      cancelled = true
    }
  }, [])

  // Configure drag-and-drop for pointer and keyboard input.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Create a new task in the selected column.
  function handleAddTask(task) {
    const status = TASK_COLUMNS.some(
      (column) => column.id === task.status,
    )
    // Default to the "To Do" column if an invalid status is provided.
      ? task.status
      : 'todo'

    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      status,
    }

    // Update the task state while preserving existing tasks.
    setTasks((prev) => ({
      ...prev,
      [status]: [...prev[status], newTask],
    }))

    setIsModalOpen(false)
  }

  // Find the task being edited and open the modal.
  function handleEditTask(taskId) {
    const column = findContainer(tasks, taskId)
    if (!column) {
      return
    }

    const task = tasks[column].find(
      (item) => item.id === taskId,
    )

    if (!task) {
      return
    }

    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Save edits to an existing task.
  function handleUpdateTask(updatedTask) {
    setTasks((prev) => {
      const sourceColumn = findContainer(prev, updatedTask.id)

      if (!sourceColumn) {
        return prev
      }

      const originalTask = prev[sourceColumn].find(
        (task) => task.id === updatedTask.id,
      )

      if (!originalTask) {
        return prev
      }

      const destinationColumn = Object.hasOwn(
        prev,
        updatedTask.status,
      )
        ? updatedTask.status
        : sourceColumn

      const task = {
        ...originalTask,
        ...updatedTask,
        status: destinationColumn,
      }

      // Update the task in its current column.
      if (sourceColumn === destinationColumn) {
        return {
          ...prev,
          [sourceColumn]: prev[sourceColumn].map((item) =>
            item.id === task.id ? task : item,
          ),
        }
      }

      // Move the task if the user changed its status.
      return {
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (item) => item.id !== task.id,
        ),
        [destinationColumn]: [
          ...prev[destinationColumn],
          task,
        ],
      }
    })

    setIsModalOpen(false)
    setEditingTask(null)
  }

  function handleDeleteTask(taskId) {
    setTasks((prev) => {
      const column = findContainer(prev, taskId)
      if (!column) return prev

      return {
        ...prev,
        [column]: prev[column].filter(
          (task) => task.id !== taskId,
        ),
      }
    })
  }

  // Record the currently dragged task for the drag overlay.
  function handleDragStart(event) {
    const { active } = event

    const container = findContainer(tasks, active.id)

    if (!container) return

    const draggedTask = tasks[container].find(
      (task) => task.id === active.id,
    )

    setActiveTask(draggedTask ?? null)
  }

  // Move or reorder a task when dragging finishes.
  function handleDragEnd(event) {
    const { active, over } = event

    setActiveTask(null)

    // If dropped outside all columns, do nothing.
    if (!over) return

    // Due Soon column is read-only and cannot receive dragged tasks.
    if (over.id === DUE_SOON_COLUMN.id) return

    setTasks((prev) => {
      const sourceColumn = findContainer(prev, active.id)
      const destinationColumn = findContainer(prev, over.id)

      // Only real task columns are valid destinations.
      if (
        !sourceColumn ||
        !destinationColumn ||
        !TASK_COLUMNS.some(
          (column) => column.id === destinationColumn,
        )
      ) {
        return prev
      }

      const sourceTasks = prev[sourceColumn]
      const destinationTasks = prev[destinationColumn]

      const sourceIndex = sourceTasks.findIndex(
        (task) => task.id === active.id,
      )

      if (sourceIndex === -1) return prev

      const draggedTask = sourceTasks[sourceIndex]

      // Reorder tasks within the same column.
      if (sourceColumn === destinationColumn) {
        const destinationIndex = destinationTasks.findIndex(
          (task) => task.id === over.id,
        )

        if (destinationIndex === -1) return prev

        if (sourceIndex === destinationIndex) return prev

        return {
          ...prev,
          [sourceColumn]: arrayMove(
            sourceTasks,
            sourceIndex,
            destinationIndex,
          ),
        }
      }

      // Move a task to another column and update its status.
      const updatedTask = {
        ...draggedTask,
        status: destinationColumn,
      }

      // Remove the task from its original column.
      const remainingSourceTasks = sourceTasks.filter(
        (task) => task.id !== active.id,
      )

      const destinationIndex = destinationTasks.findIndex(
        (task) => task.id === over.id,
      )

      // Append to the end if dropped onto the column itself.
      const insertIndex =
        destinationIndex === -1
          ? destinationTasks.length
          : destinationIndex

      const updatedDestinationTasks = [...destinationTasks]

      updatedDestinationTasks.splice(
        insertIndex,
        0,
        updatedTask,
      )

      return {
        ...prev,
        [sourceColumn]: remainingSourceTasks,
        [destinationColumn]: updatedDestinationTasks,
      }
    })
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hello, Stranger<span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-base">
            Welcome to your task dashboard
          </p>

          {isLoading && (
            <p
              role="status"
              className="mt-1 text-xs text-brand-black/60"
            >
              Loading your tasks…
            </p>
          )}

          {loadError && (
            <p
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              Couldn't load tasks. Try refreshing.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isLoading || Boolean(loadError)}
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          className={`w-full transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${PRIMARY_PILL_CLASSES}`}
        >
          + Add task
        </button>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TASK_COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tone={column.tone}
              tasks={tasks[column.id]}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          ))}

          {/* Automatic, read-only Due Soon column */}
          <TaskColumn
            id={DUE_SOON_COLUMN.id}
            title={DUE_SOON_COLUMN.title}
            tone={DUE_SOON_COLUMN.tone}
            tasks={dueSoonTasks}
            readOnly
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 cursor-grabbing">
              <TaskCard {...activeTask} />
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
        className="pointer-events-none absolute -bottom-2 right-[25%] z-20 hidden w-44 xl:block"
      />

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          taskToEdit={editingTask}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={
            editingTask ? handleUpdateTask : handleAddTask
          }
        />
      )}
    </PageShell>
  )
}

export default TaskListPage
