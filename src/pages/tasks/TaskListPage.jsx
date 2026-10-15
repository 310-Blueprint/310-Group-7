import beaver from '../../assets/beaver.png'
import beaverArms from '../../assets/beaverArms.png'
import grassDouble from '../../assets/grassDouble.svg'
import PageGreeting from '../../components/layout/PageGreeting'
import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../../components/layout/PageShell'
import TaskBoard from '../../components/tasks/TaskBoard'
import TaskModal from '../../components/tasks/TaskModal'
import { celebrateCompletedTask } from '../../lib/celebrationEffect'
import useAuth from '../../context/useAuth'
import useTaskList from '../../hooks/useTaskList'

// Keep the task state separate for each authenticated account.
function TaskListPage() {
  const { user } = useAuth()
  return <TaskListContent key={user?.id} />
}

// Composes the page
function TaskListContent() {
  const taskList = useTaskList({ onTaskCompleted: celebrateCompletedTask })

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <PageGreeting description="Welcome to your task dashboard">
          {taskList.isLoading && (
            <output className="mt-1 text-xs text-brand-black/60">
              Loading your tasks…
            </output>
          )}
          {taskList.loadError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              Couldn't load tasks. Try refreshing.
            </p>
          )}
          {taskList.saveError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {taskList.saveError}
            </p>
          )}
        </PageGreeting>

        <button
          type="button"
          disabled={taskList.isLoading || Boolean(taskList.loadError)}
          onClick={taskList.openAddModal}
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

      <TaskBoard
        tasks={taskList.tasks}
        dueSoonTasks={taskList.dueSoonTasks}
        setTasks={taskList.setTasks}
        setSaveError={taskList.setSaveError}
        onDeleteTask={taskList.removeTask}
        onEditTask={taskList.openEditModal}
        onTaskCompleted={celebrateCompletedTask}
      />

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

      {taskList.isModalOpen && (
        <TaskModal
          isOpen={taskList.isModalOpen}
          taskToEdit={taskList.editingTask}
          onClose={taskList.closeModal}
          onSubmit={taskList.editingTask ? taskList.editTask : taskList.addTask}
        />
      )}
    </PageShell>
  )
}

export default TaskListPage
