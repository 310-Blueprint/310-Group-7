import useTaskModalForm from '../../hooks/useTaskModalForm'
import ModalDialog from '../ui/ModalDialog'
import TaskFormFields from './TaskFormFields'

// Compose the modal from the dialog and form hooks
export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit = null,
}) {
  const form = useTaskModalForm({ taskToEdit, onSubmit })

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={form.isEditing ? 'EDIT TASK' : 'ADD TASK'}
      showCloseButton
    >
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
    </ModalDialog>
  )
}
