self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Pipeline deadline reminder',
    body: 'An application deadline is coming up.',
    url: '/',
  }
  const message = event.data ? event.data.json() : fallback

  event.waitUntil(
    self.registration.showNotification(message.title ?? fallback.title, {
      body: message.body ?? fallback.body,
      tag: message.tag,
      data: { url: message.url ?? fallback.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = new URL(event.notification.data?.url ?? '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existingWindow = windows.find((windowClient) => windowClient.url === targetUrl)
      return existingWindow ? existingWindow.focus() : self.clients.openWindow(targetUrl)
    }),
  )
})
