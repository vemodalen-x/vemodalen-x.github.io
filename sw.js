const CACHE_NAME = "photo-mentor-v10";
const APP_SHELL = [
  "./",
  "photography-mentor-agent.html",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "knowledge/photography-mentor-kb.js",
  "knowledge/local-photography-books-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "notes/local-photography-books-summary-2026-07-12.md",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("photography-mentor-agent.html", copy));
          return response;
        })
        .catch(() => caches.match("photography-mentor-agent.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
