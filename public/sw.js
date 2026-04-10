// Emamaye Daycare - Service Worker
// Handles push notifications and caching

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event
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
            },
            actions: data.actions || []
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'Emamaye Daycare', options)
        );
    }
});

// Notification click handler (body click or action button click)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Determine target URL from action or from notification data
    let targetUrl = event.notification.data.link || '/';
    if (event.action) {
        targetUrl = event.action; // action value is the URL
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Try to navigate an existing window
            for (const client of clientList) {
                if ('navigate' in client) {
                    return client.navigate(targetUrl).then(() => client.focus());
                }
            }
            // Otherwise open a new window
            return clients.openWindow(targetUrl);
        })
    );
});
