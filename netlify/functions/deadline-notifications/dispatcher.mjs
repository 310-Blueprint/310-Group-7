import { DAY_IN_MILLISECONDS, describeDeadline } from './dates.mjs'

function deliveryKey(applicationId, subscriptionId) {
  return `${applicationId}:${subscriptionId}`
}

function groupSubscriptionsByUser(subscriptions) {
  const subscriptionsByUser = new Map()

  subscriptions.forEach((subscription) => {
    const userSubscriptions = subscriptionsByUser.get(subscription.user_id) ?? []
    userSubscriptions.push(subscription)
    subscriptionsByUser.set(subscription.user_id, userSubscriptions)
  })

  return subscriptionsByUser
}

function createDeliveryJobs(applications, subscriptions, deliveries) {
  const deliveredToday = new Set(
    deliveries.map((delivery) =>
      deliveryKey(delivery.application_id, delivery.push_subscription_id),
    ),
  )
  const subscriptionsByUser = groupSubscriptionsByUser(subscriptions)

  return applications.flatMap((application) => {
    const userSubscriptions = subscriptionsByUser.get(application.user_id) ?? []
    return userSubscriptions
      .filter((subscription) => !deliveredToday.has(deliveryKey(application.id, subscription.id)))
      .map((subscription) => ({ application, subscription }))
  })
}

function createPushSubscription(subscription) {
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  }
}

function createPayload(application, today) {
  const daysUntilDue = Math.round(
    (Date.parse(application.due_date) - Date.parse(today)) / DAY_IN_MILLISECONDS,
  )

  return JSON.stringify({
    title: `${application.company_name} application ${describeDeadline(daysUntilDue)}`,
    body: application.role,
    tag: `application-deadline-${application.id}`,
    url: '/',
  })
}

async function deliverNotification(sendNotification, job, today) {
  const { application, subscription } = job

  try {
    await sendNotification(
      createPushSubscription(subscription),
      createPayload(application, today),
      { TTL: 24 * 60 * 60, urgency: 'high' },
    )

    return {
      delivery: {
        application_id: application.id,
        push_subscription_id: subscription.id,
        reminder_date: today,
      },
    }
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      return { expiredSubscriptionId: subscription.id }
    }

    console.error('Failed to send deadline notification', error)
    return {}
  }
}

export async function dispatchNotifications({
  applications,
  deliveries,
  sendNotification,
  subscriptions,
  today,
}) {
  const jobs = createDeliveryJobs(applications, subscriptions, deliveries)
  const outcomes = await Promise.all(
    jobs.map((job) => deliverNotification(sendNotification, job, today)),
  )

  return {
    successfulDeliveries: outcomes.flatMap((outcome) =>
      outcome.delivery ? [outcome.delivery] : [],
    ),
    expiredSubscriptionIds: outcomes.flatMap((outcome) =>
      outcome.expiredSubscriptionId ? [outcome.expiredSubscriptionId] : [],
    ),
  }
}
