/* Шың — service worker: сайтты басты экранға орнатуға және интернетсіз ашуға мүмкіндік береді.
   Бұл файл tools/gen_sw.py арқылы жасалады — қолмен өзгертпеңіз.
   Стратегия: алдымен желі (әрқашан жаңа нұсқа), желі жоқ болса ғана кэш. Ескі кэштер толық өшіріледі. */
var VERSION = "shyn-__VERSION__";
var PRECACHE = __FILES__;

self.addEventListener("install", function (e) {
  // Бір файл жүктелмесе де орнату тоқтамайды (баяу мобильді интернет)
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) { return c.add(new Request(u, { cache: "reload" })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("message", function (e) {
  if (e.data === "reset") e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); }));
});
function fromNet(req, key) {
  return fetch(req, { cache: "no-cache" }).then(function (r) {
    if (r && r.ok && r.status === 200 && r.type === "basic") { var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put(key || req, copy); }); }
    return r;
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fromNet(req, "index.html").catch(function () { return caches.match("index.html", { ignoreSearch: true }); }));
    return;
  }
  if (url.origin === self.location.origin) {
    if (req.headers.get("range")) return; // аудио/видео — браузердің өзі
    e.respondWith(fromNet(req).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match(req, { ignoreSearch: true }); });
    }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(VERSION).then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (r) { c.put(req, r.clone()); return r; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
  }
});
