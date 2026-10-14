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

function getSentNotifications(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}')
  } catch {
    return {}
  }
}

function showDesktopNotification(application) {
  new Notification(
    `${application.company} application ${describeDeadline(application.daysUntilDue)}`,
    {
      body: application.role,
      tag: `application-deadline-${application.id}`,
    },
  )
}

function showNewDeadlineNotifications(reminders, userId) {
  const storageKey = `pipeline-deadline-notifications:${userId ?? 'unknown-user'}`
  const todayKey = getLocalDateKey()
  const sentNotifications = getSentNotifications(storageKey)
  let changed = false

  reminders.forEach((application) => {
    const reminderKey = getReminderKey(application)
    if (sentNotifications[reminderKey] === todayKey) return

    try {
      showDesktopNotification(application)
      sentNotifications[reminderKey] = todayKey
      changed = true
    } catch (error) {
      console.error('Desktop notification could not be shown', error)
    }
  })

  if (!changed) return

  try {
    localStorage.setItem(storageKey, JSON.stringify(sentNotifications))
  } catch (error) {
    console.error('Desktop notification history could not be saved', error)
  }
}

export default function useDeadlineNotifications(reminders, userId) {
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
    showNewDeadlineNotifications(visibleReminders, userId)
  }, [permission, userId, visibleReminders])

  function dismissReminder(application) {
    setDismissedReminders((currentReminders) => {
      const nextReminders = new Set(currentReminders)
      nextReminders.add(getReminderKey(application))

      try {
        localStorage.setItem(
          `pipeline-dismissed-deadlines:${userId}`,
          JSON.stringify([...nextReminders]),
        )
      } catch (error) {
        console.error('Dismissed deadline could not be saved', error)
      }

      return nextReminders
    })
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

  return {
    dismissReminder,
    enableAlerts,
    permission,
    permissionError,
    pushStatus,
    visibleReminders,
  }
}
