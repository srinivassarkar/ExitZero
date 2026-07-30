const CACHE_NAME = "exitzero-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Prune old exitzero static caches to release space
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith("exitzero-") && cacheName !== "exitzero-state") {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim().then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "CACHE_COMPLETED" });
          });
        });
      })
    ])
  );
  // Schedule daily notification check
  scheduleNextCheck();
});

// Fetch Event (stale-while-revalidate with offline fallback)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip browser extensions or webpack-hot-middleware during dev
  if (event.request.url.includes("chrome-extension") || event.request.url.includes("webpack") || event.request.url.includes("_next/webpack")) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            if (event.request.mode === "navigate") {
              return caches.match("./offline.html");
            }
            throw err;
          });

        if (cachedResponse) {
          event.waitUntil(fetchPromise);
          return cachedResponse;
        }

        return fetchPromise;
      });
    })
  );
});

// Message listener to receive state from client
self.addEventListener("message", (event) => {
  if (event.data) {
    if (event.data.type === "UPDATE_LAST_ACTIVE") {
      const lastActiveDate = event.data.date;
      event.waitUntil(
        caches.open("exitzero-state").then((cache) => {
          return cache.put("/last-active", new Response(lastActiveDate));
        })
      );
    } else if (event.data.type === "UPDATE_NOTIF_TIME") {
      const time = event.data.time;
      event.waitUntil(
        caches.open("exitzero-state").then((cache) => {
          return cache.put("/notif-time", new Response(time)).then(() => {
            scheduleNextCheck();
          });
        })
      );
    }
  }
});

// Daily notification reminder schedule
let checkTimeout = null;

function scheduleNextCheck() {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
    checkTimeout = null;
  }

  caches.open("exitzero-state")
    .then((cache) => cache.match("/notif-time"))
    .then((response) => (response ? response.text() : "21:00"))
    .then((timeStr) => {
      const parts = timeStr.split(":");
      const targetHour = parseInt(parts[0], 10) || 21;
      const targetMin = parseInt(parts[1], 10) || 0;

      const now = new Date();
      const target = new Date();
      target.setHours(targetHour, targetMin, 0, 0);

      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      
      const delay = target.getTime() - now.getTime();

      checkTimeout = setTimeout(() => {
        checkAndNotify();
        scheduleNextCheck();
      }, delay);
    })
    .catch((err) => {
      console.error("Error scheduling reminder check:", err);
      const now = new Date();
      const target = new Date();
      target.setHours(21, 0, 0, 0);
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      checkTimeout = setTimeout(() => {
        checkAndNotify();
        scheduleNextCheck();
      }, target.getTime() - now.getTime());
    });
}

function checkAndNotify() {
  caches.open("exitzero-state")
    .then((cache) => cache.match("/last-active"))
    .then((response) => (response ? response.text() : ""))
    .then((lastActive) => {
      const today = new Date().toLocaleDateString('en-CA');
      if (lastActive !== today) {
        self.registration.showNotification("ExitZero 💻", {
          body: "You haven't hit your streak today. 5 minutes is all it takes.",
          icon: "./icon-192.png",
          badge: "./icon-192.png",
          tag: "daily-reminder",
          data: { url: "/" }
        });
      }
    })
    .catch((err) => {
      console.error("Error running daily reminder check:", err);
    });
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
