// Emamaye Daycare - Service Worker
// Handles push notifications and caching

// Cache name versioning
const CACHE_NAME = 'emamaye-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Push notification handler
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/emamaye-192.png',
            badge: '/emamaye-favicon.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                link: data.link || '/'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'Emamaye Daycare', options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(event.notification.data.link || '/');
        })
    );
});
