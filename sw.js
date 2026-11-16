// Almanaque ON - service worker.
// Paginas: sempre busca a versao nova na rede (as noticias mudam a cada minuto);
// sem internet, mostra a ultima versao guardada. Icones e fontes: guardados.
const CACHE = "almanaque-on-v1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const pagina = r.mode === "navigate" || (r.headers.get("accept") || "").includes("text/html");
  if (pagina && u.origin === location.origin) {
    e.respondWith(fetch(r).then(resp => {
      const c = resp.clone(); caches.open(CACHE).then(k => k.put(r, c)); return resp;
    }).catch(() => caches.match(r).then(m => m || caches.match("/"))));
    return;
  }
  if (u.origin === location.origin && u.pathname.startsWith("/icones/") ||
      u.hostname.endsWith("gstatic.com") || u.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(resp => {
      const c = resp.clone(); caches.open(CACHE).then(k => k.put(r, c)); return resp;
    })));
  }
});
