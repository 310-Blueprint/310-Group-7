// Each `id` is stored in the database as the application's `status`, so it must
// match a value allowed by the `applications_status_check` constraint. `title`
// is display-only and can be renamed freely.
export const COLUMNS = [
  { id: 'to_apply', title: 'To apply', tone: 'bg-brand-blue' },
  { id: 'applied', title: 'Applied / Waiting', tone: 'bg-brand-pink' },
  { id: 'interview', title: 'Interview', tone: 'bg-brand-green' },
  { id: 'offer', title: 'Offer', tone: 'bg-brand-yellow' },
]

export function groupByStatus(applications, columns) {
  return Object.fromEntries(
    columns.map((column) => [
      column.id,
      applications.filter((application) => application.status === column.id),
    ])
  )
}
