import { useRef, useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { fetchTasksByColumn, persistTaskMove } from '../../lib/tasks'
import {
  DUE_SOON_COLUMN,
  TASK_COLUMNS,
  findTaskColumn,
  isTaskStatus,
} from '../../lib/taskBoard'
import { celebrateCompletedTask } from '../../lib/taskCelebration'

// Prefer the column beneath the pointer, then a task inside that column.
// In particular, the empty space in In Progress must remain droppable.
function detectTaskCollision(args) {
  if (!args.pointerCoordinates) {
    return closestCorners(args).filter(({ id }) => id !== DUE_SOON_COLUMN.id)
  }

  const collisions = pointerWithin(args)
  const column = collisions.find(({ id }) => isTaskStatus(id))
  if (!column) return []

  const task = collisions.find(({ id }) => {
    const container = args.droppableContainers.find((item) => item.id === id)
    return container?.data.current?.type === 'task' &&
      container.data.current.status === column.id
  })

  return [task ?? column]
}

// Keep in-memory positions consistent with the order being persisted.
function withPositions(taskList) {
  return taskList.map((task, index) => ({ ...task, position: index }))
}

function reorderInColumn(tasks, column, activeId, overId) {
  const cards = tasks[column]
  const from = cards.findIndex((task) => task.id === activeId)
  const to = overId === column
    ? cards.length - 1
    : cards.findIndex((task) => task.id === overId)

  if (from === -1 || to === -1 || from === to) return null

  return {
    ...tasks,
    [column]: withPositions(arrayMove(cards, from, to)),
  }
}

function getInsertionIndex(cards, event, column) {
  const { over, activatorEvent, delta } = event
  if (over.id === column) return cards.length

  const index = cards.findIndex((task) => task.id === over.id)
  if (index === -1) return cards.length

  // Dropping below the final card's midpoint appends instead of inserting above.
  const pointerY = typeof activatorEvent?.clientY === 'number'
    ? activatorEvent.clientY + delta.y
    : null
  const belowLastCard = index === cards.length - 1 &&
    pointerY !== null && pointerY > over.rect.top + over.rect.height / 2

  return belowLastCard ? cards.length : index
}

function moveBetweenColumns(tasks, event, sourceColumn, destinationColumn) {
  const { active } = event
  const dragged = tasks[sourceColumn].find((task) => task.id === active.id)
  if (!dragged) return null

  const source = tasks[sourceColumn].filter((task) => task.id !== active.id)
  const destination = [...tasks[destinationColumn]]
  const index = getInsertionIndex(destination, event, destinationColumn)
  destination.splice(index, 0, { ...dragged, status: destinationColumn })

  return {
    ...tasks,
    [sourceColumn]: withPositions(source),
    [destinationColumn]: withPositions(destination),
  }
}

// Calculate the next board state
export function getTaskDragMove(tasks, event) {
  const { active, over } = event
  if (!over || over.id === DUE_SOON_COLUMN.id) return null

  const sourceColumn = findTaskColumn(tasks, active.id)
  const destinationColumn = findTaskColumn(tasks, over.id)
  if (!sourceColumn || !isTaskStatus(destinationColumn)) return null

  const updatedTasks = sourceColumn === destinationColumn
    ? reorderInColumn(tasks, sourceColumn, active.id, over.id)
    : moveBetweenColumns(tasks, event, sourceColumn, destinationColumn)

  return updatedTasks ? { sourceColumn, destinationColumn, updatedTasks } : null
}

// Drag and drop hook for the task board
export default function useTaskDragAndDrop({ tasks, setTasks, setSaveError }) {
  const [activeTask, setActiveTask] = useState(null)
  const isSaving = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart({ active }) {
    const column = findTaskColumn(tasks, active.id)
    const task = tasks[column]?.find((item) => item.id === active.id)
    setActiveTask(task ?? null)
  }

  async function handleDragEnd(event) {
    setActiveTask(null)
    if (isSaving.current) return

    const move = getTaskDragMove(tasks, event)
    if (!move) return

    const previousTasks = tasks
    setTasks(move.updatedTasks)
    setSaveError(null)
    isSaving.current = true

    try {
      await persistTaskMove(move)
      if (move.sourceColumn !== 'completed' && move.destinationColumn === 'completed') {
        celebrateCompletedTask()
      }
    } catch (error) {
      console.error('Failed to save task position', error)
      setSaveError('Could not save task movement. Please try again.')
      try {
        setTasks(await fetchTasksByColumn(TASK_COLUMNS))
      } catch (fetchError) {
        console.error('Failed to reload tasks', fetchError)
        setTasks(previousTasks)
      }
    } finally {
      isSaving.current = false
    }
  }

  return {
    sensors,
    collisionDetection: detectTaskCollision,
    activeTask,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragCancel: () => setActiveTask(null),
  }
}
