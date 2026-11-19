self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const materiTujuan = event.notification.data?.materi || "";
  const targetUrl = materiTujuan
    ? `./index.html?materi=${encodeURIComponent(materiTujuan)}`
    : "./index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (materiTujuan) {
            client.postMessage({ type: "BUKA_MATERI", materi: materiTujuan });
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    judul: "💬 Sahabat Digital",
    isi: "Ada pengingat baru untukmu. Yuk buka Sahabat Digital.",
    materi: "cyberbullying"
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      payload = { ...payload, ...dataJson };
    } catch {
      payload.isi = event.data.text() || payload.isi;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.judul, {
      body: payload.isi,
      icon: "https://cdn-icons-png.flaticon.com/512/2343/2343697.png",
      tag: "sahabat-digital-push-" + Date.now(),
      renotify: true,
      data: { materi: payload.materi || "cyberbullying" }
    })
  );
});
