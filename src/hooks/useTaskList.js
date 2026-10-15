import { useEffect, useState } from 'react'
import {
  fetchTasksByColumn,
  insertTask,
  updateTask,
  deleteTask,
} from '../lib/tasks'
import {
  TASK_COLUMNS,
  createEmptyTasks,
  findTaskColumn,
  getDueSoonTasks,
  isTaskStatus,
} from '../lib/taskBoard'
import { celebrateCompletedTask } from '../lib/celebrationEffect'

// Owns task data and the add/edit modal.
export default function useTaskList() {
  const [tasks, setTasks] = useState(createEmptyTasks)
  const [editingTask, setEditingTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)

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
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function openAddModal() {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  function openEditModal(taskId) {
    const column = findTaskColumn(tasks, taskId)
    const task = tasks[column]?.find((item) => item.id === taskId)
    if (!task) return

    setEditingTask(task)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  async function addTask(task) {
    const status = isTaskStatus(task.status) ? task.status : 'todo'
    const position =
      Math.max(
        -1,
        ...tasks[status].map((item, index) => item.position ?? index)
      ) + 1

    const saved = await insertTask({ ...task, status, position })
    setTasks((prev) => ({
      ...prev,
      [status]: [...prev[status], saved],
    }))
    closeModal()
  }

  async function editTask(updatedTask) {
    const sourceColumn = findTaskColumn(tasks, updatedTask.id)
    const exists = tasks[sourceColumn]?.some(
      (task) => task.id === updatedTask.id
    )
    if (!exists) throw new Error('Task not found')

    const destinationColumn = isTaskStatus(updatedTask.status)
      ? updatedTask.status
      : sourceColumn

    const changes = {
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.dueDate,
      status: destinationColumn,
    }

    // Preserve the existing order unless the edit changes the task status.
    if (sourceColumn !== destinationColumn) {
      changes.position =
        Math.max(
          -1,
          ...tasks[destinationColumn].map(
            (task, index) => task.position ?? index
          )
        ) + 1
    }

    const saved = await updateTask(updatedTask.id, changes)
    setTasks((prev) => replaceSavedTask(prev, saved))

    if (sourceColumn !== 'completed' && saved.status === 'completed') {
      celebrateCompletedTask()
    }
    closeModal()
  }

  async function removeTask(taskId) {
    if (!findTaskColumn(tasks, taskId)) return
    setSaveError(null)

    try {
      await deleteTask(taskId)
      setTasks((prev) => {
        const column = findTaskColumn(prev, taskId)
        if (!column) return prev
        return {
          ...prev,
          [column]: prev[column].filter((task) => task.id !== taskId),
        }
      })
    } catch (error) {
      console.error('Failed to delete task', error)
      setSaveError('Could not delete task. Please try again.')
    }
  }

  return {
    tasks,
    setTasks,
    dueSoonTasks: getDueSoonTasks(tasks),
    isLoading,
    loadError,
    saveError,
    setSaveError,
    isModalOpen,
    editingTask,
    openAddModal,
    openEditModal,
    closeModal,
    addTask,
    editTask,
    removeTask,
  }
}

// Replace one saved row in-place or move it to its newly saved column.
function replaceSavedTask(tasks, saved) {
  const sourceColumn = findTaskColumn(tasks, saved.id)
  if (!sourceColumn) return tasks

  if (sourceColumn === saved.status) {
    return {
      ...tasks,
      [sourceColumn]: tasks[sourceColumn].map((task) =>
        task.id === saved.id ? saved : task
      ),
    }
  }

  return {
    ...tasks,
    [sourceColumn]: tasks[sourceColumn].filter((task) => task.id !== saved.id),
    [saved.status]: [...tasks[saved.status], saved],
  }
}
