const VERSION = "V21P30";
const CACHE = "tohoku-v21p30-public-1";
// Bound the entire response body too, not only receipt of HTTP headers.
async function download(request, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(request, {cache: "no-store", signal: controller.signal});
    const body = await response.arrayBuffer();
    return new Response(body, {status: response.status, statusText: response.statusText, headers: response.headers});
  } finally { clearTimeout(timer); }
}
const OPTIONAL_ASSETS = ["./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    // Install only a matching HTML/worker pair; a partial deployment stays on the old version.
    const response = await download("./index.html");
    if (!response.ok) throw new Error("App download failed");
    const html = await response.clone().text();
    if (!html.includes('<meta name="version" content="' + VERSION + '">')) {
      throw new Error("App version not ready");
    }
    const cache = await caches.open(CACHE);
    await cache.put("./index.html", response);
    // A missing icon must not prevent the app from updating.
    await Promise.all(OPTIONAL_ASSETS.map(async asset => {
      try {
        const assetResponse = await download(asset, 4000);
        if (assetResponse.ok) await cache.put(asset, assetResponse);
      } catch (_) {}
    }));
    // Updates wait until the user taps the update button.
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("tohoku-") && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    // The page reloads once on request; do not forcibly navigate every open tab.
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const network = await download(event.request);
        if (network.ok) {
          try { await cache.put("./index.html", network.clone()); } catch (_) {}
          return network;
        }
        return (await cache.match("./index.html")) || network;
      } catch (_) {
        return (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  const knownAsset = OPTIONAL_ASSETS.some(asset => new URL(asset, self.registration.scope).href === url.href);
  // Exchange-rate and other cross-origin requests go straight to the network so they never delay an update.
  if (url.origin !== self.location.origin || !knownAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await download(event.request);
    if (response.ok) {
      try { await cache.put(event.request, response.clone()); } catch (_) {}
    }
    return response;
  })());
});
