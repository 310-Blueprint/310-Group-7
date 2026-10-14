import { supabase } from './supabaseClient'

export async function savePushSubscription(userId, subscription) {
  const savedSubscription = subscription.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: savedSubscription.endpoint,
      p256dh: savedSubscription.keys?.p256dh,
      auth: savedSubscription.keys?.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )

  if (error) throw error
}
