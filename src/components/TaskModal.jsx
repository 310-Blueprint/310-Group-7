import useTaskDialog from './hooks/useTaskDialog'
import useTaskModalForm from './hooks/useTaskModalForm'
import TaskFormFields from './TaskFormFields'

// Compose the modal from the dialog and form hooks
export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit = null }) {
  const dialogRef = useTaskDialog(isOpen, onClose)
  const form = useTaskModalForm({ taskToEdit, onSubmit })

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="task-modal-title"
      className="h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-white/55"
    >
      <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:p-6">
        {/* Close the popup when the user clicks outside the modal. */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className="absolute inset-0 cursor-default bg-transparent"
        />

        <div className="relative w-full max-w-120">
          <div className="relative z-20 flex items-center justify-center">
            <h2
              id="task-modal-title"
              className="text-center text-3xl font-bold tracking-tight text-brand-black sm:text-5xl"
            >
              {form.isEditing ? 'EDIT TASK' : 'ADD TASK'}
            </h2>
          </div>

          {/* X-button to close the popup. */}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close task form"
            className="absolute right-4 top-11 z-30 flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:right-5 sm:top-14"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="relative z-10 -mt-1 rounded-3xl bg-brand-black px-5 pb-6 pt-12 font-sans shadow-2xl sm:-mt-2 sm:rounded-[28px] sm:p-8 sm:pb-9 sm:pt-16">
            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="flex flex-col gap-4 sm:gap-5"
            >
              <TaskFormFields
                values={form.values}
                errors={form.errors}
                onFieldChange={form.changeField}
              />

              {/* Show a Supabase error without discarding the user's input. */}
              {form.submitError && (
                <p role="alert" className="text-center text-sm text-red-300">
                  {form.submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={form.isSubmitting}
                className="mt-2 w-full self-center rounded-full bg-brand-yellow px-6 py-3.5 text-lg font-bold text-brand-black transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[60%]"
              >
                {form.submitButtonLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  )
}
