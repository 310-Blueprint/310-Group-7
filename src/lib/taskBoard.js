// Task statuses match the values allowed by the Supabase tasks table.
export const TASK_COLUMNS = [
  { id: 'todo', title: 'To Do', tone: 'bg-brand-blue' },
  { id: 'in_progress', title: 'In Progress', tone: 'bg-brand-pink' },
  { id: 'completed', title: 'Completed', tone: 'bg-brand-green' },
]

export const DUE_SOON_COLUMN = {
  id: 'due_soon',
  title: 'Due Soon',
  tone: 'bg-brand-yellow',
}

//change this for threshold of due soon tasks
const DUE_SOON_DAYS = 7

export function isTaskStatus(status) {
  return TASK_COLUMNS.some((column) => column.id === status)
}

export function createEmptyTasks() {
  return Object.fromEntries(TASK_COLUMNS.map((column) => [column.id, []]))
}

// IDs can belong to a task or to an empty column's drop target.
export function findTaskColumn(tasks, id) {
  if (Object.hasOwn(tasks, id)) return id

  return Object.keys(tasks).find((columnId) =>
    tasks[columnId].some((task) => task.id === id),
  )
}

// Completed tasks and tasks without due dates never appear in Due Soon.
export function getDueSoonTasks(tasks) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + DUE_SOON_DAYS)

  return Object.values(tasks)
    .flat()
    .filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false

      // Parse YYYY-MM-DD as a local calendar date
      const [year, month, day] = task.dueDate.split('-').map(Number)
      const dueDate = new Date(year, month - 1, day)
      return dueDate >= today && dueDate <= cutoff
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
