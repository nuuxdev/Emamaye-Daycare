// To disable all workbox logging during development
self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener("push", function (event) {
    const data = JSON.parse(event.data.text() || "{}");
    event.waitUntil(
        self.registration.showNotification(data.title || "Emamaye Daycare", {
            body: data.body || "",
            icon: "/emamaye-192.png",
            badge: "/emamaye-favicon.png",
            vibrate: [100, 50, 100],
            data: {
                link: data.link || "/",
            },
        })
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            const link = event.notification.data.link || "/";
            let matchingClient = null;
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === link) {
                    matchingClient = client;
                    break;
                }
            }
            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return self.clients.openWindow(link);
            }
        })
    );
});
