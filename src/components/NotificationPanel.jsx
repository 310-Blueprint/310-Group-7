import { useEffect, useMemo, useState } from 'react'
import { describeDeadline } from '../lib/notifications'
import { enablePushNotifications } from '../lib/pushNotifications'

function getPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function getLocalDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getReminderKey(application) {
  return `${application.id}:${application.dueDate}`
}

function getDismissedReminders(userId) {
  try {
    const value = localStorage.getItem(`pipeline-dismissed-deadlines:${userId}`)
    return new Set(JSON.parse(value ?? '[]'))
  } catch {
    return new Set()
  }
}

function NotificationPanel({ reminders, userId, className = '' }) {
  const [permission, setPermission] = useState(getPermission)
  const [permissionError, setPermissionError] = useState('')
  const [pushStatus, setPushStatus] = useState('idle')
  const [dismissedReminders, setDismissedReminders] = useState(() =>
    getDismissedReminders(userId),
  )
  const visibleReminders = useMemo(
    () => reminders.filter((application) => !dismissedReminders.has(getReminderKey(application))),
    [dismissedReminders, reminders],
  )

  useEffect(() => {
    if (permission !== 'granted' || visibleReminders.length === 0) return

    const storageKey = `pipeline-deadline-notifications:${userId ?? 'unknown-user'}`
    const todayKey = getLocalDateKey()
    let sentNotifications = {}

    try {
      sentNotifications = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    } catch {
      sentNotifications = {}
    }

    let changed = false

    visibleReminders.forEach((application) => {
      const reminderKey = getReminderKey(application)
      if (sentNotifications[reminderKey] === todayKey) return

      try {
        new Notification(`${application.company} application ${describeDeadline(application.daysUntilDue)}`, {
          body: application.role,
          tag: `application-deadline-${application.id}`,
        })
        sentNotifications[reminderKey] = todayKey
        changed = true
      } catch (error) {
        console.error('Desktop notification could not be shown', error)
      }
    })

    if (changed) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sentNotifications))
      } catch (error) {
        console.error('Desktop notification history could not be saved', error)
      }
    }
  }, [permission, userId, visibleReminders])

  function dismissReminder(application) {
    const nextDismissedReminders = new Set(dismissedReminders)
    nextDismissedReminders.add(getReminderKey(application))
    setDismissedReminders(nextDismissedReminders)

    try {
      localStorage.setItem(
        `pipeline-dismissed-deadlines:${userId}`,
        JSON.stringify([...nextDismissedReminders]),
      )
    } catch (error) {
      console.error('Dismissed deadline could not be saved', error)
    }
  }

  async function enableAlerts() {
    setPermissionError('')
    setPushStatus('loading')

    try {
      const result = await enablePushNotifications(userId)
      setPermission(getPermission())
      setPushStatus(result.status)
    } catch {
      setPermission(getPermission())
      setPushStatus('failed')
      setPermissionError('Background alerts could not be enabled. In-app alerts still work.')
    }
  }

  return (
    <section
      aria-labelledby="deadline-reminders-title"
      className={`relative z-10 rounded-3xl bg-brand-yellow p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id="deadline-reminders-title" className="text-lg font-bold">
            Upcoming deadlines
          </h2>
          {visibleReminders.length > 0 ? (
            <ul className="mt-1 space-y-2 text-sm">
              {visibleReminders.map((application) => (
                <li key={application.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <strong>{application.company}</strong> — {application.role}{' '}
                    {describeDeadline(application.daysUntilDue)}
                  </span>
                  <button
                    type="button"
                    onClick={() => dismissReminder(application)}
                    aria-label={`Mark ${application.company} ${application.role} as done`}
                    className="shrink-0 rounded-full border border-brand-black px-3 py-1 text-xs font-semibold transition hover:bg-brand-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black"
                  >
                    Mark done
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm">No application deadlines in the next two days.</p>
          )}
          {permission === 'denied' && (
            <p className="mt-2 text-xs">Desktop alerts are blocked in your browser settings.</p>
          )}
          {permission === 'unsupported' && (
            <p className="mt-2 text-xs">This browser does not support desktop alerts.</p>
          )}
          {pushStatus === 'subscribed' && (
            <p className="mt-2 text-xs">Background deadline alerts are enabled.</p>
          )}
          {pushStatus === 'local-only' && (
            <p className="mt-2 text-xs">Desktop alerts work while Pipeline is open.</p>
          )}
          {permission === 'granted' && pushStatus === 'idle' && (
            <p className="mt-2 text-xs">Desktop alerts are enabled.</p>
          )}
          {permissionError && <p className="mt-2 text-xs text-red-700">{permissionError}</p>}
        </div>

        {permission === 'default' && (
          <button
            type="button"
            onClick={enableAlerts}
            disabled={pushStatus === 'loading'}
            className="shrink-0 rounded-full bg-brand-black px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black"
          >
            {pushStatus === 'loading' ? 'Enabling…' : 'Enable desktop alerts'}
          </button>
        )}
      </div>
    </section>
  )
}

export default NotificationPanel
