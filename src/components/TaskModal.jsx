import { useEffect, useRef, useState } from 'react'

const TASK_STATUSES = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

function ModalField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) {
  const inputId = `task-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-medium text-brand-bg"
      >
        {label} {required && '*'}
      </label>

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className="min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5"
      />

      {error && (
        <span className="px-2 text-sm text-red-300">
          {error}
        </span>
      )}
    </div>
  )
}

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit = null }) {
  const dialogRef = useRef(null)

  const [title, setTitle] = useState(taskToEdit?.title ?? '')
  const [description, setDescription] = useState(taskToEdit?.description ?? '',)
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ?? '',)
  const [status, setStatus] = useState(taskToEdit?.status ?? 'todo',)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const isEditing = Boolean(taskToEdit)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function handleNativeClose() {
      onClose?.()
    }

    dialog.addEventListener('close', handleNativeClose)

    return () => {
      dialog.removeEventListener('close', handleNativeClose)
    }
  }, [onClose])

  function validate() {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Task title is required'
    }

    if (!TASK_STATUSES.some((item) => item.id === status)) {
      newErrors.status = 'Please select a valid status'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Prevent multiple submissions while saving.
    if (isSubmitting) { 
      return 
    }

    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) { 
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Wait for the parent page to finish saving the task.
      await onSubmit?.({
        ...(isEditing ? { id: taskToEdit.id } : {}),
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        status,
      })
    } catch (error) {
      console.error('Failed to save task', error)
      setSubmitError('Could not save the task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="task-modal-title"
      className="h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-white/55"
    >
      <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:p-6">
        {/* closes the popup when the user clicks outside of the modal content area. */}
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
                {isEditing ? 'EDIT TASK' : 'ADD TASK'}
                </h2>
            </div>
            {/* X-button to close the popup */}
            <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close task form"
                className="absolute right-4 top-11 z-30 flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:right-5 sm:top-14"
            >
                <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
                >
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
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4 sm:gap-5"
            >
              <ModalField
                label="Task Title"
                placeholder="e.g. Write Google cover letter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="task-description"
                  className="font-medium text-brand-bg"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  placeholder="Additional details (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="min-w-0 resize-y rounded-2xl bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
                />
              </div>

              <ModalField
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="task-status"
                  className="font-medium text-brand-bg"
                >
                  Status *
                </label>

                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-invalid={Boolean(errors.status)}
                  className="min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5"
                >
                  {TASK_STATUSES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                {errors.status && (
                  <span className="px-2 text-sm text-red-300">
                    {errors.status}
                  </span>
                )}
              </div>

              
              {/* Display an error if Supabase fails to save the task. */}
              {submitError && (
                <p
                  role="alert"
                  className="text-center text-sm text-red-300"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full self-center rounded-full bg-brand-yellow px-6 py-3.5 text-lg font-bold text-brand-black transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[60%]"
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Submit'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </dialog>
  )
}
