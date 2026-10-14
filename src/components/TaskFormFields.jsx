import { TASK_COLUMNS } from '../lib/taskBoard'

// Shared input rendering and inline validation messages.
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
      <label htmlFor={inputId} className="font-medium text-brand-bg">
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
        <span className="px-2 text-sm text-red-300">{error}</span>
      )}
    </div>
  )
}

export default function TaskFormFields({ values, errors, onFieldChange }) {
  return (
    <>
      <ModalField
        label="Task Title"
        placeholder="e.g. Write Google cover letter"
        value={values.title}
        onChange={(event) => onFieldChange('title', event.target.value)}
        error={errors.title}
        required
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="task-description" className="font-medium text-brand-bg">
          Description
        </label>
        <textarea
          id="task-description"
          placeholder="Additional details (optional)"
          value={values.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          rows={3}
          className="min-w-0 resize-y rounded-2xl bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
        />
      </div>

      <ModalField
        label="Due Date"
        type="date"
        value={values.dueDate}
        onChange={(event) => onFieldChange('dueDate', event.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="task-status" className="font-medium text-brand-bg">
          Status *
        </label>
        <select
          id="task-status"
          value={values.status}
          onChange={(event) => onFieldChange('status', event.target.value)}
          aria-invalid={Boolean(errors.status)}
          className="min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5"
        >
          {TASK_COLUMNS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
        {errors.status && (
          <span className="px-2 text-sm text-red-300">{errors.status}</span>
        )}
      </div>
    </>
  )
}
