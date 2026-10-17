import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TaskListPage from './TaskListPage'
import {
  deleteTask,
  fetchTasksByColumn,
  insertTask,
  updateTask,
} from '../../lib/tasks'
import { TASK_COLUMNS } from '../../lib/taskBoard'

const authMock = vi.hoisted(() => ({ user: { id: 'user-1' } }))

vi.mock('../../context/useAuth', () => ({
  default: () => authMock,
}))

vi.mock('../../lib/tasks', () => ({
  fetchTasksByColumn: vi.fn(),
  insertTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskPositions: vi.fn(),
  persistTaskMove: vi.fn(),
}))

vi.mock('../../components/layout/PageShell', () => ({
  default: ({ children }) => <main>{children}</main>,
  BEAVER_POSITION: 'beaver-position',
  PRIMARY_PILL_CLASSES: 'pill-classes',
}))

vi.mock('../../components/tasks/TaskBoard', () => ({
  default: ({ tasks, dueSoonTasks, onEditTask, onDeleteTask }) => (
    <div role="region" aria-label="Task board">
      {Object.entries(tasks).map(([status, items]) => (
        <section key={status} aria-label={status}>
          {items.map((task) => (
            <div key={task.id}>
              <span>{task.title}</span>
              <button type="button" onClick={() => onEditTask(task.id)}>
                Edit {task.title}
              </button>
              <button type="button" onClick={() => onDeleteTask(task.id)}>
                Delete {task.title}
              </button>
            </div>
          ))}
        </section>
      ))}
      <section aria-label="Due Soon">
        {dueSoonTasks.map((task) => (
          <p key={task.id}>{task.title}</p>
        ))}
      </section>
    </div>
  ),
}))

vi.mock('../../components/tasks/TaskModal', () => ({
  default: ({ isOpen, taskToEdit, onClose, onSubmit }) =>
    isOpen ? (
      <div
        role="dialog"
        aria-label={taskToEdit ? 'Edit task' : 'Add task'}
        data-task-id={taskToEdit?.id}
      >
        <button
          type="button"
          onClick={() =>
            onSubmit(
              taskToEdit
                ? { ...taskToEdit, title: 'Updated portfolio' }
                : NEW_TASK
            )
          }
        >
          Save task
        </button>
        <button type="button" onClick={onClose}>
          Close task modal
        </button>
      </div>
    ) : null,
}))

const TODO = {
  id: 'task-1',
  title: 'Prepare portfolio',
  description: 'Polish the project samples',
  dueDate: '2026-10-20',
  status: 'todo',
  position: 0,
}

const IN_PROGRESS = {
  id: 'task-2',
  title: 'Submit references',
  description: '',
  dueDate: '2026-10-19',
  status: 'in_progress',
  position: 0,
}

const COMPLETED = {
  id: 'task-3',
  title: 'Completed task',
  description: '',
  dueDate: '2026-10-18',
  status: 'completed',
  position: 0,
}

const TASKS = {
  todo: [TODO],
  in_progress: [IN_PROGRESS],
  completed: [COMPLETED],
}

const NEW_TASK = {
  title: 'Book a mentor session',
  description: 'Ask about portfolio feedback',
  dueDate: '2026-10-24',
  status: 'todo',
}

const SAVED_TASK = {
  ...NEW_TASK,
  id: 'task-4',
  position: 1,
}

const LOADING = /Loading your tasks/i

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

async function renderLoadedTaskList() {
  const user = userEvent.setup()
  render(<TaskListPage />)
  await waitFor(() =>
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
  )
  return user
}

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-17T09:00:00'))
    authMock.user = { id: 'user-1' }
    fetchTasksByColumn.mockResolvedValue(TASKS)
    insertTask.mockResolvedValue(SAVED_TASK)
    updateTask.mockImplementation(async (id, changes) => ({
      ...TODO,
      ...changes,
      id,
    }))
    deleteTask.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows a loading state and disables adding until tasks load', async () => {
    // Hold the fetch open to check the initial loading UI, then resolve it and
    // verify the task appears and adding becomes available.
    const pending = deferred()
    fetchTasksByColumn.mockReturnValueOnce(pending.promise)

    render(<TaskListPage />)

    expect(screen.getByText(LOADING)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add task' })).toBeDisabled()

    pending.resolve(TASKS)

    await waitFor(() =>
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    )
    expect(
      within(screen.getByRole('region', { name: 'todo' })).getByText(
        'Prepare portfolio'
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add task' })).toBeEnabled()
  })

  it('shows a load error and keeps adding disabled when fetching fails', async () => {
    // Reject the initial fetch and verify the page reports the failure without
    // enabling actions that depend on loaded task data.
    fetchTasksByColumn.mockRejectedValueOnce(new Error('Network down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<TaskListPage />)

    expect(
      await screen.findByRole('alert', { name: '' })
    ).toHaveTextContent("Couldn't load tasks. Try refreshing.")
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add task' })).toBeDisabled()
  })

  it('loads and displays tasks in their columns and the sorted Due Soon list', async () => {
    // Load fixtures across all statuses and confirm Due Soon is date-ordered
    // while excluding completed tasks.
    await renderLoadedTaskList()

    expect(fetchTasksByColumn).toHaveBeenCalledTimes(1)
    expect(fetchTasksByColumn).toHaveBeenCalledWith(TASK_COLUMNS)
    expect(screen.getByRole('heading', { name: 'Hello, Busy Beaver' }))
      .toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'todo' })).getByText(
        'Prepare portfolio'
      )
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'in_progress' })).getByText(
        'Submit references'
      )
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'completed' })).getByText(
        'Completed task'
      )
    ).toBeInTheDocument()

    const dueSoon = within(screen.getByRole('region', { name: 'Due Soon' }))
    expect(
      dueSoon.getAllByText(/Submit references|Prepare portfolio/).map(
        (task) => task.textContent
      )
    ).toEqual(['Submit references', 'Prepare portfolio'])
    expect(dueSoon.queryByText('Completed task')).not.toBeInTheDocument()
  })

  it('opens the add modal, submits a new task, and closes the modal', async () => {
    // Open the add flow, submit the modal's task fixture, and check persistence,
    // board update, and modal dismissal.
    const user = await renderLoadedTaskList()

    await user.click(screen.getByRole('button', { name: '+ Add task' }))

    expect(screen.getByRole('dialog', { name: 'Add task' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save task' }))

    await waitFor(() =>
      expect(insertTask).toHaveBeenCalledWith({
        ...NEW_TASK,
        position: 1,
      })
    )
    expect(
      within(screen.getByRole('region', { name: 'todo' })).getByText(
        'Book a mentor session'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the selected task for editing and saves the edit', async () => {
    // Select a task to populate edit mode, save a changed title, and verify the
    // update request and resulting board content.
    const user = await renderLoadedTaskList()

    await user.click(
      screen.getByRole('button', { name: 'Edit Prepare portfolio' })
    )

    expect(screen.getByRole('dialog', { name: 'Edit task' })).toHaveAttribute(
      'data-task-id',
      TODO.id
    )
    await user.click(screen.getByRole('button', { name: 'Save task' }))

    await waitFor(() =>
      expect(updateTask).toHaveBeenCalledWith(TODO.id, {
        title: 'Updated portfolio',
        description: TODO.description,
        dueDate: TODO.dueDate,
        status: TODO.status,
      })
    )
    expect(
      within(screen.getByRole('region', { name: 'todo' })).getByText(
        'Updated portfolio'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the modal without submitting when cancelled', async () => {
    // Dismiss the add modal and ensure cancelling does not call the save API.
    const user = await renderLoadedTaskList()

    await user.click(screen.getByRole('button', { name: '+ Add task' }))
    await user.click(screen.getByRole('button', { name: 'Close task modal' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(insertTask).not.toHaveBeenCalled()
  })

  it('shows a save error when deleting a task fails', async () => {
    // Simulate a rejected delete request and verify the error is shown while
    // the task remains on the board.
    deleteTask.mockRejectedValueOnce(new Error('Network down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = await renderLoadedTaskList()

    await user.click(
      screen.getByRole('button', { name: 'Delete Prepare portfolio' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete task. Please try again.'
    )
    expect(
      within(screen.getByRole('region', { name: 'todo' })).getByText(
        'Prepare portfolio'
      )
    ).toBeInTheDocument()
  })

  it('reloads tasks when the authenticated user changes', async () => {
    // Keep the second user's fetch pending to verify the keyed page resets its
    // task state and shows loading before the new response arrives.
    const pending = deferred()
    fetchTasksByColumn
      .mockReturnValueOnce(Promise.resolve(TASKS))
      .mockReturnValueOnce(pending.promise)

    const { rerender } = render(<TaskListPage />)
    await waitFor(() =>
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    )

    authMock.user = { id: 'user-2' }
    rerender(<TaskListPage />)
    await waitFor(() => expect(fetchTasksByColumn).toHaveBeenCalledTimes(2))

    expect(screen.getByText(LOADING)).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'todo' })).queryByText(
        'Prepare portfolio'
      )
    ).not.toBeInTheDocument()

    pending.resolve(TASKS)
    await waitFor(() =>
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    )
  })
})