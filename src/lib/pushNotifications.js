import { savePushSubscription } from './pushSubscriptions'

function decodePublicKey(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replaceAll('-', '+').replaceAll('_', '/')
  const bytes = atob(base64)

  return Uint8Array.from(bytes, (character) => character.codePointAt(0))
}

function supportsDesktopNotifications() {
  return 'Notification' in window
}

export function supportsPushNotifications() {
  return (
    supportsDesktopNotifications() &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export async function enablePushNotifications(userId) {
  if (!supportsDesktopNotifications()) return { status: 'unsupported' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { status: permission }
  if (!supportsPushNotifications()) return { status: 'local-only' }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) return { status: 'local-only' }

  const registration = await navigator.serviceWorker.register('/notification-service-worker.js')
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodePublicKey(publicKey),
    })
  }

  await savePushSubscription(userId, subscription)
  return { status: 'subscribed' }
}
