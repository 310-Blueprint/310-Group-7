import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'

function SortableTaskCard({ task, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      status: task.status,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab touch-none rounded-2xl active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <TaskCard
        {...task}
        onDelete={() => onDelete(task.id)}
        onEdit={() => onEdit(task.id)}
      />
    </div>
  )
}

export default SortableTaskCard
