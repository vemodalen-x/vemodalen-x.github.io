const CACHE_NAME = "business-learning-studio-v1.0.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./knowledge.html",
  "./coach.html",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./assets/product.css",
  "./assets/vendor/lucide-1.23.0.min.js",
  "./knowledge/business-learning-model.js",
  "./knowledge/business-operating-system.js",
  "./knowledge/business-public-kb.js",
  "./knowledge/business-learning-item-bank.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
