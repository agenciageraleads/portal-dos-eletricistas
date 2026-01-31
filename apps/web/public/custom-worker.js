
self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.title;
    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-96x96.png',
        data: data.data || { url: '/' }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
