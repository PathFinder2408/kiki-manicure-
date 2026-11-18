// Service Worker de Kiki Spa / Kiki Admin para notificaciones Push nativas
self.addEventListener("push", (event) => {
  let payload = {
    title: "Nueva Cita Agendada ✨",
    body: "Tienes una nueva reserva en Kiki Spa.",
    url: "/admin",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/admin-icon.jpg",
      badge: "/admin-icon.jpg",
      vibrate: [150, 75, 150],
      data: { url: payload.url || "/admin" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/admin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
