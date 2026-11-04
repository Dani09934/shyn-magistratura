/* Шың — service worker: сайтты басты экранға орнатуға және интернетсіз ашуға мүмкіндік береді.
   Бұл файл tools/gen_sw.py арқылы жасалады — қолмен өзгертпеңіз. */
var VERSION = "shyn-5cf6eb82b5";
var PRECACHE = [
"./",
"index.html",
"manifest.webmanifest",
"favicon.svg",
"css/app.css",
"js/app.js",
"js/cheats.js",
"js/core.js",
"js/eng-intensive.js",
"js/english.js",
"js/extras.js",
"js/game.js",
"js/lab-algo.js",
"js/lab-db.js",
"js/media.js",
"js/mistakes.js",
"js/nav.js",
"js/plan.js",
"js/pwa.js",
"data/flashcards.js",
"data/flashcards2.js",
"data/grammar.js",
"data/grammar2.js",
"data/index.js",
"data/media-catalog.js",
"data/sorting.js",
"data/synonyms.js",
"data/sets/v1-algo.js",
"data/sets/v1-db.js",
"data/sets/v1-english.js",
"data/sets/v17-algo.js",
"data/sets/v17-db.js",
"data/sets/v17-english.js",
"data/sets/v18-algo.js",
"data/sets/v18-db.js",
"data/sets/v18-english.js",
"data/sets/v19-algo.js",
"data/sets/v19-db.js",
"data/sets/v19-english.js",
"data/sets/v2-algo.js",
"data/sets/v2-db.js",
"data/sets/v2-english.js",
"data/sets/v20-algo.js",
"data/sets/v20-db.js",
"data/sets/v20-english.js",
"data/sets/v21-algo.js",
"data/sets/v21-db.js",
"data/sets/v21-english.js",
"data/sets/v21-fundamentals.js",
"data/sets/v22-algo.js",
"data/sets/v22-db.js",
"data/sets/v22-english.js",
"data/sets/v22-fundamentals.js",
"data/sets/v23-algo.js",
"data/sets/v23-db.js",
"data/sets/v23-english.js",
"data/sets/v24-algo.js",
"data/sets/v24-db.js",
"data/sets/v24-english.js",
"data/sets/v26-algo.js",
"data/sets/v26-db.js",
"data/sets/v26-english.js",
"data/sets/v27-algo.js",
"data/sets/v27-db.js",
"data/sets/v27-english.js",
"data/sets/v28-algo.js",
"data/sets/v28-db.js",
"data/sets/v29-algo.js",
"data/sets/v29-db.js",
"data/sets/v3-algo.js",
"data/sets/v3-db.js",
"data/sets/v3-english.js",
"data/sets/v30-english.js",
"data/sets/v30-fundamentals.js",
"data/sets/v31-english.js",
"data/sets/v31-fundamentals.js",
"data/sets/v32-english.js",
"data/sets/v32-fundamentals.js",
"data/sets/v33-fundamentals.js",
"data/sets/v34-fundamentals.js",
"data/sets/v35-fundamentals.js",
"data/sets/v36-fundamentals.js",
"data/sets/v38-algo.js",
"data/sets/v38-db.js",
"data/sets/v4-algo.js",
"data/sets/v4-db.js",
"data/sets/v4-english.js",
"data/sets/v40-english.js",
"data/sets/v41-english.js",
"data/sets/v42-english.js",
"data/sets/v43-english.js",
"data/sets/v44-english.js",
"data/sets/v45-english.js",
"data/sets/v46-english.js",
"data/sets/v47-english.js",
"data/sets/v48-english.js",
"data/sets/v49-english.js",
"data/sets/v5-algo.js",
"data/sets/v5-db.js",
"data/sets/v5-english.js",
"data/sets/v50-english.js",
"data/sets/v51-english.js",
"data/sets/v52-english.js",
"data/sets/v53-english.js",
"data/sets/v54-english.js",
"data/sets/v55-english.js",
"data/sets/v56-english.js",
"data/sets/v57-english.js",
"data/sets/v58-english.js",
"data/sets/v59-english.js",
"data/sets/v6-algo.js",
"data/sets/v6-db.js",
"data/sets/v6-english.js",
"data/sets/v61-fundamentals.js",
"data/sets/v62-fundamentals.js",
"data/sets/v63-fundamentals.js",
"data/sets/v64-fundamentals.js",
"data/sets/v65-fundamentals.js",
"data/sets/v66-fundamentals.js",
"data/sets/v67-fundamentals.js",
"data/sets/v68-fundamentals.js",
"data/sets/v69-fundamentals.js",
"data/sets/v7-algo.js",
"data/sets/v7-db.js",
"data/sets/v7-english.js",
"data/sets/v70-fundamentals.js",
"data/sets/v71-fundamentals.js",
"data/sets/v72-fundamentals.js",
"data/sets/v73-fundamentals.js",
"data/sets/v74-fundamentals.js",
"data/sets/v75-fundamentals.js",
"data/sets/v76-fundamentals.js",
"data/sets/v77-fundamentals.js",
"data/sets/v78-fundamentals.js",
"data/sets/v79-fundamentals.js",
"data/sets/v80-fundamentals.js",
"data/sets/v81-fundamentals.js",
"data/sets/v82-fundamentals.js",
"data/sets/v83-fundamentals.js",
"data/sets/v84-fundamentals.js",
"data/sets/v85-fundamentals.js",
"data/sets/v86-fundamentals.js",
"data/sets/v87-fundamentals.js",
"data/sets/v88-fundamentals.js",
"data/sets/v89-fundamentals.js",
"data/sets/v9-algo.js",
"data/sets/v9-db.js",
"data/sets/v9-english.js",
"data/sets/v9-fundamentals.js",
"data/sets/v90-fundamentals.js",
"icons/apple-touch-icon.png",
"icons/favicon-32.png",
"icons/favicon-48.png",
"icons/icon-192-maskable.png",
"icons/icon-192.png",
"icons/icon-512-maskable.png",
"icons/icon-512.png",
"icons/icon.svg",
"icons/og-image.png",
"vendor/sqljs/LICENSE",
"vendor/sqljs/sql-wasm.js",
"vendor/sqljs/sql-wasm.wasm"
];
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
