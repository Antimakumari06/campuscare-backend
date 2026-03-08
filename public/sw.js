// ================================================================
//  CampusCare — Service Worker (PWA offline support)
// ================================================================

const CACHE_NAME = "campuscare-v1";

const STATIC_FILES = [
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install — cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("CampusCare SW: Caching files");
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache if offline, else network
self.addEventListener("fetch", (event) => {
  // Skip API calls — always go to network for these
  if (event.request.url.includes("localhost:5000") ||
      event.request.url.includes("/complaint") ||
      event.request.url.includes("/complaints") ||
      event.request.url.includes("/admin")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // Offline fallback
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});