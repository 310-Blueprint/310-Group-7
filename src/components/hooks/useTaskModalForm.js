import { useState } from 'react'
import { isTaskStatus } from '../../lib/taskBoard'

// Validate the same fields as the backend
function validateTask(values) {
  const errors = {}

  if (!values.title.trim()) {
    errors.title = 'Task title is required'
  }

  if (!isTaskStatus(values.status)) {
    errors.status = 'Please select a valid status'
  }

  return errors
}

//add/edit form values, validation, and asynchronous submission.
export default function useTaskModalForm({ taskToEdit, onSubmit }) {
  const isEditing = Boolean(taskToEdit)
  const [values, setValues] = useState(() => ({
    title: taskToEdit?.title ?? '',
    description: taskToEdit?.description ?? '',
    dueDate: taskToEdit?.dueDate ?? '',
    status: taskToEdit?.status ?? 'todo',
  }))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function changeField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // Do not send multiple requests while one save is in progress.
    if (isSubmitting) {
      return
    }

    const newErrors = validateTask(values)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) 
      {
        return
      }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit?.({
        ...(isEditing ? { id: taskToEdit.id } : {}),
        title: values.title.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate || null,
        status: values.status,
      })
    } catch (error) {
      console.error('Failed to save task', error)
      setSubmitError('Could not save the task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  let submitButtonLabel = 'Submit'
  if (isSubmitting) {
    submitButtonLabel = 'Saving...'
  } else if (isEditing) {
    submitButtonLabel = 'Save Changes'
  }

  return {
    values,
    errors,
    isEditing,
    isSubmitting,
    submitError,
    submitButtonLabel,
    changeField,
    handleSubmit,
  }
}
