import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function requiredEnvironmentValue(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function createNotificationServices() {
  const supabaseUrl = requiredEnvironmentValue('SUPABASE_URL')
  const supabaseSecretKey = requiredEnvironmentValue('SUPABASE_SECRET_KEY')
  const vapidPublicKey = requiredEnvironmentValue('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = requiredEnvironmentValue('VAPID_PRIVATE_KEY')
  const vapidSubject = requiredEnvironmentValue('VAPID_SUBJECT')

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  return {
    supabase: createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    sendNotification: webpush.sendNotification.bind(webpush),
  }
}
