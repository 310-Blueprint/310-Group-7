import { supabase } from './supabaseClient'

const COLUMN_BY_FIELD = {
  company: 'company_name',
  location: 'location',
  role: 'role',
  dueDate: 'due_date',
  status: 'status',
  position: 'position',
}

function toApplication(row) {
  return {
    id: row.id,
    company: row.company_name,
    location: row.location,
    role: row.role,
    dueDate: row.due_date,
    status: row.status,
    position: row.position,
  }
}

function toRow(fields) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(
        ([field, value]) => field in COLUMN_BY_FIELD && value !== undefined
      )
      .map(([field, value]) => [COLUMN_BY_FIELD[field], value])
  )
}

export async function fetchApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('position', { ascending: true })

  if (error) throw error

  return data.map(toApplication)
}

export async function insertApplication({ userId, ...fields }) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...toRow(fields), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return toApplication(data)
}

export async function deleteApplication(id) {
  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) throw error
}

export async function updateApplicationPositions(status, applications) {
  const results = await Promise.all(
    applications.map((application, index) =>
      supabase
        .from('applications')
        .update({ status: status, position: index })
        .eq('id', application.id)
    )
  )

  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
}
