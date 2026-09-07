const CACHE_PREFIX = "photo-mentor-";
const CACHE_NAME = `${CACHE_PREFIX}v16`;
const APP_SHELL = [
  "photography-mentor-agent.html",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-local-summaries.js",
  "knowledge/photography-mentor-taxonomy.js",
  "knowledge/photography-mentor-core.js",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "manifest.webmanifest"
];
const APP_URL = new URL("photography-mentor-agent.html", self.registration.scope);
const APP_SHELL_URLS = new Set(APP_SHELL.map((path) => new URL(path, self.registration.scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    if (requestUrl.pathname !== APP_URL.pathname) return;
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(APP_URL, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(APP_URL))
    );
    return;
  }

  if (!APP_SHELL_URLS.has(requestUrl.href)) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      });
    })
  );
});
