import { TASK_COLUMNS } from '../../lib/taskBoard'
import ModalField from '../ui/ModalField'

export default function TaskFormFields({ values, errors, onFieldChange }) {
  return (
    <>
      <ModalField
        id="task-title"
        label="Task Title"
        placeholder="e.g. Write Google cover letter"
        value={values.title}
        onChange={(event) => onFieldChange('title', event.target.value)}
        error={errors.title}
        required
      />

      <ModalField
        id="task-description"
        label="Description"
        as="textarea"
        placeholder="Additional details (optional)"
        value={values.description}
        onChange={(event) => onFieldChange('description', event.target.value)}
      />

      <ModalField
        id="task-due-date"
        label="Due Date"
        type="date"
        value={values.dueDate}
        onChange={(event) => onFieldChange('dueDate', event.target.value)}
      />

      <ModalField
        id="task-status"
        label="Status"
        as="select"
        value={values.status}
        onChange={(event) => onFieldChange('status', event.target.value)}
        error={errors.status}
        required
      >
        {TASK_COLUMNS.map((column) => (
          <option key={column.id} value={column.id}>
            {column.title}
          </option>
        ))}
      </ModalField>
    </>
  )
}
