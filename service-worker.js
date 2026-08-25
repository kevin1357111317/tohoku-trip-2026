const CACHE = "tohoku-v7p1-public-3";
const ASSETS = ["./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png"];

const FINAL_STYLE = `
<style id="V7P1_SMOKED_GLASS_FINAL_3">
/* Final override: must remain after every legacy bottom-nav rule. */
.bottom-nav{
  position:fixed!important;
  left:50%!important;
  right:auto!important;
  bottom:calc(10px + env(safe-area-inset-bottom))!important;
  width:min(calc(100% - 20px),892px)!important;
  transform:translateX(-50%)!important;
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  gap:4px!important;
  padding:6px!important;
  border:1px solid rgba(255,255,255,.20)!important;
  border-radius:29px!important;
  background:linear-gradient(135deg,rgba(35,30,28,.91),rgba(76,55,46,.84))!important;
  box-shadow:0 16px 42px rgba(35,26,22,.34),inset 0 1px 0 rgba(255,255,255,.14)!important;
  -webkit-backdrop-filter:blur(24px) saturate(1.18)!important;
  backdrop-filter:blur(24px) saturate(1.18)!important;
  overflow:hidden!important;
}
.bottom-nav:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  pointer-events:none!important;
  border-radius:inherit!important;
  background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,0) 48%)!important;
}
.bottom-nav label{
  position:relative!important;
  z-index:1!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  min-height:52px!important;
  padding:6px 2px!important;
  border-radius:22px!important;
  background:transparent!important;
  color:rgba(255,248,239,.78)!important;
  font-size:10px!important;
  line-height:1.1!important;
}
.bottom-nav label svg,.bottom-nav svg{
  width:22px!important;
  height:22px!important;
  margin:0 auto 2px!important;
  stroke:currentColor!important;
  fill:none!important;
}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"],
#tab-transport:checked~.bottom-nav label[for="tab-transport"],
#tab-trip:checked~.bottom-nav label[for="tab-trip"],
#tab-budget:checked~.bottom-nav label[for="tab-budget"],
#tab-todos:checked~.bottom-nav label[for="tab-todos"]{
  background:linear-gradient(135deg,rgba(255,239,216,.18),rgba(255,255,255,.07))!important;
  color:#fff7ec!important;
  box-shadow:0 7px 18px rgba(16,11,9,.24),inset 0 1px 0 rgba(255,255,255,.14)!important;
  -webkit-backdrop-filter:blur(12px)!important;
  backdrop-filter:blur(12px)!important;
  transform:translateY(-1px)!important;
}
#tab-trip:checked~.bottom-nav label[for="tab-trip"]{
  color:#ffe1a3!important;
  background:linear-gradient(135deg,rgba(181,122,78,.40),rgba(255,224,174,.13))!important;
}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"]:after,
#tab-transport:checked~.bottom-nav label[for="tab-transport"]:after,
#tab-trip:checked~.bottom-nav label[for="tab-trip"]:after,
#tab-budget:checked~.bottom-nav label[for="tab-budget"]:after,
#tab-todos:checked~.bottom-nav label[for="tab-todos"]:after{display:none!important;}
</style>`;

function injectFinalStyle(html) {
  if (html.includes('V7P1_SMOKED_GLASS_FINAL_3')) return html;
  return html.replace('</head>', `${FINAL_STYLE}\n</head>`);
}

async function patchedNavigation(request) {
  try {
    const network = await fetch(request, { cache: "no-store" });
    const type = network.headers.get("content-type") || "";
    if (!network.ok || !type.includes("text/html")) return network;

    const html = await network.text();
    const patched = injectFinalStyle(html);
    const headers = new Headers(network.headers);
    headers.delete("content-length");
    const response = new Response(patched, {
      status: network.status,
      statusText: network.statusText,
      headers
    });
    const cache = await caches.open(CACHE);
    await cache.put("./index.html", response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match("./index.html");
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(windows.map(client => client.navigate(client.url).catch(() => null)));
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(patchedNavigation(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
