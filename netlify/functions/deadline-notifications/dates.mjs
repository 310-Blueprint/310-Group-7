const TIME_ZONE = 'Pacific/Auckland'
export const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function dateKeyInNewZealand(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`)
  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10)
}

export function describeDeadline(daysUntilDue) {
  if (daysUntilDue === 0) return 'due today'
  if (daysUntilDue === 1) return 'due tomorrow'
  return `due in ${daysUntilDue} days`
}

export function getReminderWindow() {
  const today = dateKeyInNewZealand()
  return { today, finalReminderDate: addDays(today, 2) }
}
