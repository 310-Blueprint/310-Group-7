const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const UPCOMING_WINDOW_DAYS = 2
const FINISHED_STATUSES = new Set(['offer', 'rejected'])

function toDayNumber(year, month, day) {
  return Date.UTC(year, month, day) / MILLISECONDS_PER_DAY
}

function parseDueDate(value) {
  if (typeof value !== 'string') return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  return toDayNumber(year, month, day)
}

export function getUpcomingDeadlineReminders(applications, today = new Date()) {
  const todayNumber = toDayNumber(today.getFullYear(), today.getMonth(), today.getDate())

  return applications
    .filter((application) => !FINISHED_STATUSES.has(application.status))
    .map((application) => {
      const dueDayNumber = parseDueDate(application.dueDate)
      if (dueDayNumber === null) return null

      return {
        ...application,
        daysUntilDue: dueDayNumber - todayNumber,
      }
    })
    .filter(
      (application) =>
        application !== null &&
        application.daysUntilDue >= 0 &&
        application.daysUntilDue <= UPCOMING_WINDOW_DAYS,
    )
    .sort(
      (first, second) =>
        first.daysUntilDue - second.daysUntilDue ||
        first.company.localeCompare(second.company),
    )
}

export function describeDeadline(daysUntilDue) {
  if (daysUntilDue === 0) return 'due today'
  if (daysUntilDue === 1) return 'due tomorrow'
  return `due in ${daysUntilDue} days`
}
