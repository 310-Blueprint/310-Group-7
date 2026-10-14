import { supabase } from './supabaseClient'

function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    dueDate: row.due_date,
    status: row.status,
    position: row.position,
  }
}

// Fetch the signed-in user's tasks and group them by column.
export async function fetchTasksByColumn(columns) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) { 
    throw error
  }

  return columns.reduce((grouped, column) => {
    grouped[column.id] = data
      .filter((row) => row.status === column.id)
      .map(toTask)

    return grouped
  }, {})
}

// Insert a new task into the database.
export async function insertTask({
  title,
  description,
  dueDate,
  status,
  position,
}) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      due_date: dueDate || null,
      status,
      position,
    })
    .select()
    .single()

  if (error) { 
    throw error
  }

  return toTask(data)
}

// Update an existing task's information.
export async function updateTask(id, changes) {
  const updates = {}

  if (Object.hasOwn(changes, 'title')) {
    updates.title = changes.title
  }

  if (Object.hasOwn(changes, 'description')) {
    updates.description = changes.description || null
  }

  if (Object.hasOwn(changes, 'dueDate')) {
    updates.due_date = changes.dueDate || null
  }

  if (Object.hasOwn(changes, 'status')) {
    updates.status = changes.status
  }

  if (Object.hasOwn(changes, 'position')) {
    updates.position = changes.position
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) { 
    throw error
  }

  return toTask(data)
}

// Delete a task using its unique ID.
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) { 
    throw error
  }
}

// Save the order and status of tasks after dragging.
export async function updateTaskPositions(status, tasks) {
  const results = await Promise.all(
    tasks.map((task, index) =>
      supabase
        .from('tasks')
        .update({
          status,
          position: index,
        })
        .eq('id', task.id),
    ),
  )

  const failed = results.find((result) => result.error)

  if (failed) { 
    throw failed.error
  }
}
// Persist both affected columns after dropping a task.
export async function persistTaskMove({ sourceColumn, destinationColumn, updatedTasks }) {
  const columns = sourceColumn === destinationColumn
    ? [sourceColumn]
    : [sourceColumn, destinationColumn]

  await Promise.all(
    columns.map((column) => updateTaskPositions(column, updatedTasks[column])),
  )
}
