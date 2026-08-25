const CACHE = "tohoku-v7p1-public-5";
const ASSETS = ["./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png"];

const FINAL_STYLE = `
<style id="V7P1_WARM_GLASS_FINAL_5">
/* Final override: softer milk-tea translucent glass. */
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
  border:1px solid rgba(255,255,255,.36)!important;
  border-radius:29px!important;
  background:linear-gradient(135deg,rgba(132,107,94,.48),rgba(164,128,106,.42))!important;
  box-shadow:0 12px 30px rgba(55,39,31,.14),inset 0 1px 0 rgba(255,255,255,.28)!important;
  -webkit-backdrop-filter:blur(30px) saturate(1.30)!important;
  backdrop-filter:blur(30px) saturate(1.30)!important;
  overflow:hidden!important;
}
.bottom-nav:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  pointer-events:none!important;
  border-radius:inherit!important;
  background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 54%)!important;
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
  color:rgba(255,252,248,.94)!important;
  font-size:10px!important;
  line-height:1.1!important;
  text-shadow:0 1px 2px rgba(60,40,31,.18)!important;
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
  background:linear-gradient(135deg,rgba(255,247,235,.20),rgba(255,255,255,.08))!important;
  color:#fffaf4!important;
  box-shadow:0 5px 14px rgba(55,37,29,.10),inset 0 1px 0 rgba(255,255,255,.22)!important;
  -webkit-backdrop-filter:blur(15px)!important;
  backdrop-filter:blur(15px)!important;
  transform:translateY(-1px)!important;
}
#tab-trip:checked~.bottom-nav label[for="tab-trip"]{
  color:#ffe4ad!important;
  background:linear-gradient(135deg,rgba(203,151,99,.24),rgba(255,235,205,.14))!important;
}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"]:after,
#tab-transport:checked~.bottom-nav label[for="tab-transport"]:after,
#tab-trip:checked~.bottom-nav label[for="tab-trip"]:after,
#tab-budget:checked~.bottom-nav label[for="tab-budget"]:after,
#tab-todos:checked~.bottom-nav label[for="tab-todos"]:after{display:none!important;}
</style>`;

function injectFinalStyle(html) {
  return html.replace(/<style id="V7P1_(?:SMOKED|WARM)_GLASS_FINAL_\d+">[\s\S]*?<\/style>/g, '')
             .replace('</head>', `${FINAL_STYLE}\n</head>`);
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
