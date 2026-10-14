export async function fetchApplicationsDueSoon(supabase, today, finalReminderDate) {
  const { data, error } = await supabase
    .from('applications')
    .select('id,user_id,company_name,role,due_date,status')
    .gte('due_date', today)
    .lte('due_date', finalReminderDate)
    .not('status', 'in', '(offer,rejected)')

  if (error) throw error
  return data ?? []
}

export async function fetchPushSubscriptions(supabase, applications) {
  if (applications.length === 0) return []

  const userIds = [...new Set(applications.map((application) => application.user_id))]
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth')
    .in('user_id', userIds)

  if (error) throw error
  return data ?? []
}

export async function fetchDeliveriesForToday(supabase, applications, today) {
  if (applications.length === 0) return []

  const applicationIds = applications.map((application) => application.id)
  const { data, error } = await supabase
    .from('push_notification_deliveries')
    .select('application_id,push_subscription_id')
    .eq('reminder_date', today)
    .in('application_id', applicationIds)

  if (error) throw error
  return data ?? []
}

export async function recordDeliveries(supabase, deliveries) {
  if (deliveries.length === 0) return

  const { error } = await supabase.from('push_notification_deliveries').upsert(deliveries, {
    onConflict: 'application_id,push_subscription_id,reminder_date',
    ignoreDuplicates: true,
  })

  if (error) throw error
}

export async function removeExpiredSubscriptions(supabase, subscriptionIds) {
  const uniqueIds = [...new Set(subscriptionIds)]
  if (uniqueIds.length === 0) return 0

  const { error } = await supabase.from('push_subscriptions').delete().in('id', uniqueIds)
  if (error) throw error
  return uniqueIds.length
}
