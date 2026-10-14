/**
 * A component for displaying a single task.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the task.
 * @param {string} props.description - The description of the task.
 * @param {string} props.dueDate - The due date of the task.
 * @param {Function} props.onDelete - A function to call when the task is deleted.
 * @param {Function} props.onEdit - A function to call when the task is edited.
 */
function TaskCard({
  title,
  description,
  dueDate,
  onDelete,
  onEdit,
}) {
  return (
    <article className="rounded-2xl bg-white px-4 py-3.5 text-brand-black shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="break-words text-sm font-bold leading-tight">
          {title}
        </h3>

        {onDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label={`Delete task: ${title}`}
            title="Delete task"
            className="relative z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-black/40 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {(description || onEdit) && (
        <div className="mt-2 flex items-end gap-2">
          {description && (
            <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-xs text-brand-black/65">
              {description}
            </p>
          )}

          {onEdit && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              aria-label={`Edit task: ${title}`}
              title="Edit task"
              className="relative z-10 ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-black/40 transition-colors hover:bg-black/5 hover:text-brand-black focus-visible:outline-2 focus-visible:outline-brand-black"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  d="m15 5 4 4M4 20l4.5-1 11-11a2.12 2.12 0 0 0-3-3l-11 11L4 20Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {dueDate && (
        <p className="mt-3 text-xs text-brand-black/55">
          Due {dueDate}
        </p>
      )}
    </article>
  )
}

export default TaskCard
