const CACHE = "tohoku-v7p25-public-1";
const ASSETS = ["./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./favicon-32.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({type:"window", includeUncontrolled:true});
    await Promise.all(windows.map(client => client.navigate(client.url).catch(() => null)));
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname === "api.frankfurter.dev") {
    event.respondWith(fetch(event.request, {cache:"no-store"}));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request, {cache:"no-store"});
        if (network.ok) {
          const cache = await caches.open(CACHE);
          cache.put("./index.html", network.clone());
        }
        return network;
      } catch (e) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
