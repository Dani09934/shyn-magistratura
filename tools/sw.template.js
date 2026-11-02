/* Шың — service worker: сайтты басты экранға орнатуға және интернетсіз ашуға мүмкіндік береді.
   Бұл файл tools/gen_sw.py арқылы жасалады — қолмен өзгертпеңіз. */
var VERSION = "shyn-__VERSION__";
var PRECACHE = __FILES__;
var RUNTIME = "shyn-runtime";

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== RUNTIME; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  // Бет өзі: алдымен желі (жаңа нұсқа), желі жоқ болса — кэш
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put("index.html", copy); }); return r;
    }).catch(function () { return caches.match("index.html", { ignoreSearch: true }); }));
    return;
  }
  // Сайттың өз файлдары: кэштен бірден, жоқ болса желіден алып сақтау (аудио да осында)
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (r) {
        if (r.ok && !req.headers.get("range")) { var copy = r.clone(); caches.open(RUNTIME).then(function (c) { c.put(req, copy); }); }
        return r;
      });
    }));
    return;
  }
  // Google қаріптері: кэште болса — бірден, әйтпесе желіден алып сақтау
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(RUNTIME).then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (r) { c.put(req, r.clone()); return r; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
  }
});
