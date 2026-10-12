import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
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
import {
  fetchTasksByColumn,
  insertTask,
  updateTask,
  deleteTask,
  updateTaskPositions,
} from '../lib/tasks'

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

// Use the pointer to choose the actual column or task under the cursor.
// Prefer task cards when the pointer overlaps both a card and its column.
function detectTaskCollision(args) {
  if (args.pointerCoordinates) {
    const collisions = pointerWithin(args)
    const cardCollisions = collisions.filter(
      ({ id }) => !TASK_COLUMNS.some((column) => column.id === id),
    )

    return cardCollisions.length > 0 ? cardCollisions : collisions
  }

  // Fall back to closest corners for keyboard dragging.
  return closestCorners(args)
}

function TaskListPage() {
  const [tasks, setTasks] = useState(EMPTY_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const isSavingPositions = useRef(false)
  const [saveError, setSaveError] = useState(null)

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
  async function handleAddTask(task) {
    const status = TASK_COLUMNS.some(
      (column) => column.id === task.status,
    )
      // Default to the "To Do" column if an invalid status is provided.
      ? task.status
      : 'todo'

    // New tasks are placed at the end of their selected column.
    const position = tasks[status].length

    const newTask = await insertTask({
      ...task,
      status,
      position,
    })

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
  async function handleUpdateTask(updatedTask) {
    const sourceColumn = findContainer(tasks, updatedTask.id)

    if (!sourceColumn) {
      throw new Error('Task not found')
    }

    const originalTask = tasks[sourceColumn].find(
      (task) => task.id === updatedTask.id,
    )

    if (!originalTask) {
      throw new Error('Task not found')
    }

  
    const destinationColumn = TASK_COLUMNS.some(
      (column) => column.id === updatedTask.status,
    )
      ? updatedTask.status
      : sourceColumn

    // Prepare the changes that will be saved to Supabase.
    const changes = {
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.dueDate,
      status: destinationColumn,
    }

    // If the task changes columns, place it at the end of
    // the destination column.
    if (sourceColumn !== destinationColumn) {
      changes.position = Math.max(
        -1,
        ...tasks[destinationColumn].map(
          (task, index) => task.position ?? index,
        ),
      ) + 1
    }

    // Wait for Supabase to save the edits.
    const savedTask = await updateTask(updatedTask.id, changes)

    setTasks((prev) => {
      const currentColumn = findContainer(prev, savedTask.id)

      if (!currentColumn) {
        return prev
      }

      // Update the task without moving it if the status is unchanged.
      if (currentColumn === savedTask.status) {
        return {
          ...prev,
          [currentColumn]: prev[currentColumn].map((task) =>
            task.id === savedTask.id ? savedTask : task,
          ),
        }
      }

      // Move the task if the user changed its status.
      return {
        ...prev,
        [currentColumn]: prev[currentColumn].filter(
          (task) => task.id !== savedTask.id,
        ),
        [savedTask.status]: [
          ...prev[savedTask.status],
          savedTask,
        ],
      }
    })

    setIsModalOpen(false)
    setEditingTask(null)
  }

  async function handleDeleteTask(taskId) {
    const column = findContainer(tasks, taskId)

    if (!column) {
      return
    }

    setSaveError(null)

    try {
      // Delete the task from Supabase first.
      await deleteTask(taskId)

      // Remove the task from React after deletion succeeds.
      setTasks((prev) => {
        const currentColumn = findContainer(prev, taskId)

        if (!currentColumn) return prev

        return {
          ...prev,
          [currentColumn]: prev[currentColumn].filter(
            (task) => task.id !== taskId,
          ),
        }
      })
    } catch (error) {
      console.error('Failed to delete task', error)
      setSaveError('Could not delete task. Please try again.')
    }
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
  async function handleDragEnd(event) {
    const { active, over } = event

    setActiveTask(null)

    // Prevent another drag while a previous move is saving.
    if (isSavingPositions.current) return

    // If dropped outside all columns, do nothing.
    if (!over) {
      return
    }

    // Due Soon column is read-only and cannot receive dragged tasks.
    if (over.id === DUE_SOON_COLUMN.id) {
      return
    }
    const sourceColumn = findContainer(tasks, active.id)
    const destinationColumn = findContainer(tasks, over.id)

    // Only real task columns are valid destinations.
    if (
      !sourceColumn ||
      !destinationColumn ||
      !TASK_COLUMNS.some(
        (column) => column.id === destinationColumn,
      )
    ) {
      return
    }

    const sourceTasks = tasks[sourceColumn]
    const destinationTasks = tasks[destinationColumn]

    const sourceIndex = sourceTasks.findIndex(
      (task) => task.id === active.id,
    )

    if (sourceIndex === -1) return

    const draggedTask = sourceTasks[sourceIndex]
    let updatedTasks

    // Reorder tasks within the same column.
    if (sourceColumn === destinationColumn) {
      // Dropping in blank space in this column moves the task to the end.
      const destinationIndex = over.id === sourceColumn
        ? destinationTasks.length - 1
        : destinationTasks.findIndex((task) => task.id === over.id)

      if (destinationIndex === -1) return
      if (sourceIndex === destinationIndex) return

      updatedTasks = {
        ...tasks,
        [sourceColumn]: arrayMove(
          sourceTasks,
          sourceIndex,
          destinationIndex,
        ),
      }
    } else {
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

      // Calculate the pointer's position when the drag finishes.
      const pointerY =
        typeof event.activatorEvent?.clientY === 'number'
          ? event.activatorEvent.clientY + event.delta.y
          : null

      // Check if the nearest target is the last task.
      const isLastTask =
        destinationIndex === destinationTasks.length - 1

      // Insert after the last task if dropped below its midpoint.
      const droppedAtBottom =
        isLastTask &&
        pointerY !== null &&
        pointerY > over.rect.top + over.rect.height / 2

      // Append to the bottom when dropped onto the column itself
      // or below the last task. Otherwise, insert before the target.
      const insertIndex =
        destinationIndex === -1 || droppedAtBottom
          ? destinationTasks.length
          : destinationIndex


      const updatedDestinationTasks = [...destinationTasks]

      updatedDestinationTasks.splice(
        insertIndex,
        0,
        updatedTask,
      )

      updatedTasks = {
        ...tasks,
        [sourceColumn]: remainingSourceTasks,
        [destinationColumn]: updatedDestinationTasks,
      }
    }
    setTasks(updatedTasks)
    setSaveError(null)
    isSavingPositions.current = true

    try {
      if (sourceColumn === destinationColumn) {
        // Save the new ordering within one column.
        await updateTaskPositions(
          sourceColumn,
          updatedTasks[sourceColumn],
        )
      } else {
        // Save both the original and destination columns.
        await Promise.all([
          updateTaskPositions(
            sourceColumn,
            updatedTasks[sourceColumn],
          ),
          updateTaskPositions(
            destinationColumn,
            updatedTasks[destinationColumn],
          ),
        ])
      }
    } catch (error) {
      console.error('Failed to save task position', error)

      setSaveError(
        'Could not save task movement. Please try again.',
      )

      // Restore the last saved state from Supabase.
      try {
        const savedTasks = await fetchTasksByColumn(TASK_COLUMNS)
        setTasks(savedTasks)
      } catch (fetchError) {
        console.error('Failed to reload tasks', fetchError)
        setTasks(tasks)
      }
    } finally {
      isSavingPositions.current = false
    }
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
        collisionDetection={detectTaskCollision}
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
