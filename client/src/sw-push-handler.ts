/**
 * Service Worker push event handler.
 * Injected into the Workbox-generated SW by vite-plugin-pwa's injectManifest mode
 * OR registered via addEventListener in the SW context.
 *
 * This file is NOT bundled into the main app — it runs in the SW scope.
 * Declare self as ServiceWorkerGlobalScope to satisfy TypeScript.
 */

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let payload: { title?: string; body?: string; ticketId?: number; ticket_no?: string; type?: string } = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Resolver', body: event.data.text() };
  }

  const title = payload.title ?? 'Resolver';
  const options = {
    body: payload.body ?? '',
    icon: '/pwa-192.svg',
    badge: '/pwa-192.svg',
    tag: `ticket-${payload.ticketId ?? 'general'}`,
    renotify: true,
    data: { ticketId: payload.ticketId, url: '/technician' },
  } as NotificationOptions;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) ?? '/technician';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes('/technician') || c.url.includes('/tech/mobile'));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});
