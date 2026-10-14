import { createNotificationServices } from './deadline-notifications/config.mjs'
import { getReminderWindow } from './deadline-notifications/dates.mjs'
import { dispatchNotifications } from './deadline-notifications/dispatcher.mjs'
import {
  fetchApplicationsDueSoon,
  fetchDeliveriesForToday,
  fetchPushSubscriptions,
  recordDeliveries,
  removeExpiredSubscriptions,
} from './deadline-notifications/repository.mjs'

function createResponse(delivered, removed) {
  return Response.json({ delivered, removed })
}

export default async function sendDeadlineNotifications() {
  const { supabase, sendNotification } = createNotificationServices()
  const { today, finalReminderDate } = getReminderWindow()
  const applications = await fetchApplicationsDueSoon(supabase, today, finalReminderDate)
  const subscriptions = await fetchPushSubscriptions(supabase, applications)
  if (subscriptions.length === 0) return createResponse(0, 0)

  const deliveries = await fetchDeliveriesForToday(supabase, applications, today)
  const results = await dispatchNotifications({
    applications,
    deliveries,
    sendNotification,
    subscriptions,
    today,
  })

  await recordDeliveries(supabase, results.successfulDeliveries)
  const removed = await removeExpiredSubscriptions(
    supabase,
    results.expiredSubscriptionIds,
  )

  return createResponse(results.successfulDeliveries.length, removed)
}

export const config = {
  schedule: '0 20 * * *',
}
