/* Шың — видеосабақтар мен материалдар кітапханасы.
   Файлдар интернетке жүктелмейді: пайдаланушы өз компьютеріндегі папканы таңдайды,
   сайт оны браузердің ішінде оқып, каталог құрады. Прогресс localStorage-та. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var view = document.getElementById("view");
  var PKEY = "shyn_media";
  var P; try { P = JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { P = {}; }
  P.w = P.w || {}; P.pos = P.pos || {};
  function save() { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} }

  var VIDEO = /\.(mp4|webm|m4v|mov|ogv)$/i, AUDIO = /\.(mp3|m4a|wav|ogg|aac|mpeg)$/i, IMG = /\.(png|jpe?g|gif|webp)$/i, PDF = /\.pdf$/i, DOC = /\.(pptx?|docx?|rtf|txt|xlsx?)$/i;
  var LIB = null; // { root, lessons: [], cats: [] }
  var CUR = { cat: null, lesson: null, file: null };
  var supportsPicker = "showDirectoryPicker" in global;

  /* ---------- IndexedDB: таңдалған папканы есте сақтау ---------- */
  function idb(fn) {
    return new Promise(function (res, rej) {
      if (!global.indexedDB) return rej(new Error("no idb"));
      var r = indexedDB.open("shyn-media", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("h"); };
      r.onsuccess = function () { var tx = r.result.transaction("h", "readwrite"); var st = tx.objectStore("h"); fn(st, res, rej); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function saveHandle(h) { return idb(function (st, res) { st.put(h, "root"); res(); }).catch(function () {}); }
  function loadHandle() { return idb(function (st, res) { var q = st.get("root"); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); }; }).catch(function () { return null; }); }

  /* ---------- Атауларды тазалау және табиғи сұрыптау ---------- */
  function num(s) { var m = String(s).match(/^\s*(\d+)(?:[.,]\s*(\d+))?/); return m ? [+m[1], m[2] ? +m[2] : 0] : [1e6, 0]; }
  function natCmp(a, b) { var x = num(a), y = num(b); return x[0] - y[0] || x[1] - y[1] || a.localeCompare(b, "kk"); }
  function clean(s) {
    return String(s).replace(/\.[a-z0-9]{2,4}$/i, "").replace(/^\s*\d+(?:[.,]\d+)?\s*[.,\-–]?\s*/, "").replace(/_/g, " ").replace(/[\s(]*\b(?:360|480|720|1080)p\)?\s*$/i, "").replace(/\s{2,}/g, " ").trim() || String(s);
  }
  function kind(name) { return VIDEO.test(name) ? "video" : AUDIO.test(name) ? "audio" : PDF.test(name) ? "pdf" : IMG.test(name) ? "img" : DOC.test(name) ? "doc" : null; }
  function subjOf(path) {
    var p = path.toUpperCase();
    if (/АЛГОРИТМ|ALGOR/.test(p)) return "algo";
    if (/\/БД|БД\/|ДЕРЕКТЕР|DATABASE|SQL|\bБД\b/.test(p)) return "db";
    if (/ТГО|СЫНИ|АНАЛИТИК|МАТЕМ/.test(p)) return "tgo";
    if (/M094|М094|АҚПАРАТТЫҚ ТЕХ/.test(p)) return "it";
    if (/АҒЫЛШЫН|АНГЛ|ENGLISH|VOCABULARY|READING|LISTENING|ТЫҢДАЛЫМ|ОҚЫЛЫМ|ГРАММАТИК/.test(p)) return "eng";
    return "gen";
  }
  var SUBJ = { algo: "Алгоритмдер", db: "Деректер қоры", it: "Алгоритм және ДҚ", tgo: "ТГО", eng: "Ағылшын тілі", gen: "Жалпы" };

  /* ---------- Каталог және папканы сканерлеу ----------
     Курс каталогы (data/media-catalog.js) сайтқа енгізілген: папка қосылмаса да барлық сабақ көрінеді.
     Папка қосылғанда файлдар жолы бойынша каталогпен сәйкестендіріледі. */
  var COURSE = "МАГИСТРАТУРАҒА ДАЙЫНДЫҚ";
  function loadCatalog() {
    if (Shyn.mediaCatalog) return Promise.resolve(Shyn.mediaCatalog);
    return new Promise(function (res) {
      var sc = document.createElement("script"); sc.src = "data/media-catalog.js" + (global.SHYN_BUILD ? "?v=" + global.SHYN_BUILD : "");
      sc.onload = function () { res(Shyn.mediaCatalog || null); }; sc.onerror = function () { res(null); };
      document.head.appendChild(sc);
    });
  }
  function catalogFiles(cat) {
    var out = []; if (!cat) return out;
    Object.keys(cat.d).forEach(function (dir) { cat.d[dir].forEach(function (n) { if (kind(n)) out.push({ path: dir + "/" + n, name: n, off: true }); }); });
    return out;
  }
  // Таңдалған папка қай деңгейде болса да, жолды курс түбіріне келтіреміз
  function normPath(rootName, path, tops) {
    var i = path.indexOf(COURSE + "/");
    if (i === 0) return path.slice(COURSE.length + 1);
    if (rootName === COURSE) return path;
    if (tops[rootName]) return rootName + "/" + path; // курстың ішкі папкасы таңдалды
    return path;
  }
  async function scanHandle(dir) {
    var files = [];
    async function walk(h, path, depth) {
      if (depth > 8) return;
      for await (var entry of h.values()) {
        if (entry.kind === "directory") { if (!/^\.|^__MACOSX$/.test(entry.name)) await walk(entry, path ? path + "/" + entry.name : entry.name, depth + 1); }
        else if (kind(entry.name)) files.push({ path: path ? path + "/" + entry.name : entry.name, name: entry.name, h: entry });
      }
    }
    await walk(dir, "", 0);
    return merge(dir.name, files);
  }
  function scanList(fileList) {
    var files = [], root = "";
    Array.prototype.forEach.call(fileList, function (f) {
      var rp = f.webkitRelativePath || f.name, parts = rp.split("/");
      if (!root) root = parts.length > 1 ? parts[0] : "Папка";
      if (kind(f.name)) files.push({ path: parts.slice(1).join("/") || f.name, name: f.name, f: f });
    });
    return merge(root, files);
  }
  function merge(rootName, found) {
    var cat = Shyn.mediaCatalog, base = catalogFiles(cat), tops = {}, byPath = {};
    base.forEach(function (x) { tops[x.path.split("/")[0]] = 1; byPath[x.path] = x; });
    var linked = 0;
    found.forEach(function (x) {
      x.path = normPath(rootName, x.path, tops);
      var b = byPath[x.path];
      if (b) { b.h = x.h; b.f = x.f; b.off = false; linked++; }
      else { x.off = false; base.push(x); byPath[x.path] = x; }
    });
    var lib = build(COURSE, base);
    lib.connected = rootName; lib.found = found.length; lib.linked = linked;
    return lib;
  }
  function build(rootName, files) {
    // Сабақ = файлдар тұрған папка; «ТЕСТ …» ішкі папкасы өз сабағына қосылады. Каталог = бірінші деңгейдегі папка.
    var lessons = {};
    files.forEach(function (x) {
      var parts = x.path.split("/").slice(0, -1);
      if (parts.length > 1 && /^ТЕСТ(\s|$)/i.test(parts[parts.length - 1])) { parts = parts.slice(0, -1); x.test = true; }
      var dir = parts.join("/");
      var L = lessons[dir] || (lessons[dir] = { id: dir || "_root", dir: dir, parts: parts, items: [] });
      x.kind = kind(x.name); L.items.push(x);
    });
    var list = Object.keys(lessons).map(function (k) { return lessons[k]; });
    list.forEach(function (L) {
      var t = L.parts[0];
      L.cat = t || rootName;
      L.sub = L.parts.slice(1);
      L.title = L.sub.length ? clean(L.sub[L.sub.length - 1]) : clean(L.cat);
      L.group = L.sub.length > 1 ? clean(L.sub[0]) : "";
      L.items.sort(function (a, b) { var o = { video: 0, audio: 1, pdf: 2, doc: 3, img: 4 }; return o[a.kind] - o[b.kind] || (a.test ? 1 : 0) - (b.test ? 1 : 0) || natCmp(a.name, b.name); });
      L.videos = L.items.filter(function (i) { return i.kind === "video" || i.kind === "audio"; });
      L.subj = subjOf(L.dir);
    });
    list.sort(function (a, b) {
      var n = Math.max(a.parts.length, b.parts.length);
      for (var i = 0; i < n; i++) { var x = a.parts[i], y = b.parts[i]; if (x === y) continue; if (x == null) return -1; if (y == null) return 1; return natCmp(x, y); }
      return 0;
    });
    var cats = [], cmap = {};
    list.forEach(function (L) {
      var c = cmap[L.cat] || (cmap[L.cat] = { id: L.cat, name: clean(L.cat), from: "", lessons: [], subj: subjOf(L.cat) });
      if (!c.lessons.length) cats.push(c);
      c.lessons.push(L);
    });
    var hasVid = function (c) { return c.lessons.some(function (L) { return L.videos.length; }) ? 0 : 1; };
    cats.sort(function (a, b) { return hasVid(a) - hasVid(b) || natCmp(a.id, b.id); });
    return { root: rootName, lessons: list, cats: cats, files: files.length };
  }
  function vname(v) { var n = clean(v.name); return v.test ? (/^(тест|тапсырма|nn|с)$/i.test(n) ? "Тест талдауы" : "Тест талдауы: " + n) : n; }
  async function fileOf(item) { return item.f || item.h.getFile(); }
  function key(item) { return "c/" + item.path; }
  // Ескі прогресс кілттері («папка/жол») жаңа түрге көшіріледі
  if (!P.v) {
    var W = {}, POS = {};
    Object.keys(P.w).forEach(function (k) { W[mig(k)] = P.w[k]; });
    Object.keys(P.pos).forEach(function (k) { POS[mig(k)] = P.pos[k]; });
    P.w = W; P.pos = POS; P.v = 2; save();
  }
  function mig(k) { var p = k.split("/").slice(1).join("/"); var i = p.indexOf("МАГИСТРАТУРАҒА ДАЙЫНДЫҚ/"); return "c/" + (i === 0 ? p.slice(24) : p); }

  /* ---------- Прогресс ---------- */
  function stat(lessons) {
    var t = 0, w = 0;
    lessons.forEach(function (L) { L.videos.forEach(function (v) { t++; if (P.w[key(v)]) w++; }); });
    return { t: t, w: w, pct: t ? Math.round(w / t * 100) : 0 };
  }
  function markWatched(item) {
    var k = key(item); if (P.w[k]) return;
    P.w[k] = Date.now(); save();
    if (Shyn.Game) Shyn.Game.event("video", 1, 15);
  }

  /* ---------- Беттер ---------- */
  Shyn.route("media", async function (args) {
    if (!LIB) {
      view.innerHTML = head("Каталог жүктелуде…");
      await loadCatalog();
      try { var h = await loadHandle(); if (h && h.queryPermission && (await h.queryPermission({ mode: "read" })) === "granted") LIB = await scanHandle(h); } catch (e) {}
      if (!LIB) LIB = merge("", []);
      if (Shyn._route !== "media") return;
    }
    var c = args[0] ? decodeURIComponent(args[0]) : null;
    var l = args[1] ? decodeURIComponent(args[1]) : null;
    if (c && l) return drawLesson(c, l, args[2] ? +args[2] : 0);
    if (c) return drawCat(c);
    drawHome();
  });

  function head(sub) {
    return '<header class="page-head"><h1>Видеосабақтар</h1><p class="muted">' + sub + '</p></header>';
  }
  /* Папканы қосу блогы: басты бетте және ашылмаған видеоның орнында көрсетіледі */
  function connectBox(compact) {
    return '<section class="mpick' + (compact ? " mpick--c" : "") + '"><div class="mpick__t">' +
      '<h2>' + (compact ? "Бұл видео компьютеріңіздегі папкада" : "Видеоларды ашу үшін папканы қосыңыз") + '</h2>' +
      (compact ? "" : '<p class="muted">Курс видеолары (10 ГБ-тан астам) интернетке жүктелмейді: олар сіздің компьютеріңізден ойнатылады. Каталог пен прогресс сайтта тұрады.</p>') +
      '<ol><li>Батырманы басыңыз.</li><li>Жұмыс үстеліндегі <b>МАГИСТРАТУРА</b> папкасын (немесе ішіндегі «МАГИСТРАТУРАҒА ДАЙЫНДЫҚ») таңдаңыз.</li><li>Браузер сұраса, «Көруге рұқсат беру» басыңыз.</li></ol>' +
      '<div class="labform__btns">' +
        (supportsPicker ? '<button class="btn btn--gold" data-mc="reopen" hidden></button><button class="btn btn--gold" data-mc="pick">Папканы таңдау</button>' : "") +
        '<label class="btn btn--line">' + (supportsPicker ? "Басқа тәсіл" : "Папканы таңдау") + '<input type="file" data-mc="dir" webkitdirectory directory multiple hidden></label>' +
      '</div><p class="muted small" data-mc="msg">' + (supportsPicker ? "Chrome, Edge не Яндекс браузерінде папка бір рет таңдалады, келесіде өздігінен ашылады." :
        "Бұл браузерде папканы әр жолы қайта таңдау керек. Телефонда видеолар ашылмауы мүмкін — компьютерде Chrome не Edge қолданыңыз.") + '</p></div>' +
      (compact ? "" : '<div class="mpick__ill" aria-hidden="true"><span></span><span></span><span></span></div>') + '</section>';
  }
  async function bindConnect(root) {
    var msg = function (t) { var m = root.querySelector('[data-mc="msg"]'); if (m) m.textContent = t; };
    var done = function (lib) {
      if (!lib.linked && !lib.found) { msg("Бұл папкада видео не құжат табылмады. МАГИСТРАТУРА папкасын таңдаңыз."); return; }
      LIB = lib;
      U.toast(lib.linked ? lib.linked + " файл курс каталогымен байланысты" : lib.found + " файл табылды");
      Shyn._keepScroll = true; Shyn.render();
    };
    var h = await loadHandle(), re = root.querySelector('[data-mc="reopen"]');
    if (h && re) { re.hidden = false; re.textContent = "«" + h.name + "» папкасын ашу"; var pk = root.querySelector('[data-mc="pick"]'); if (pk) { pk.classList.remove("btn--gold"); pk.classList.add("btn--line"); pk.textContent = "Басқа папка"; } }
    if (re) re.addEventListener("click", async function () {
      try {
        var ok = (await h.queryPermission({ mode: "read" })) === "granted" || (await h.requestPermission({ mode: "read" })) === "granted";
        if (!ok) return msg("Рұқсат берілмеді. «Басқа папка» батырмасымен қайта таңдаңыз.");
        msg("Папка оқылуда…"); done(await scanHandle(h));
      } catch (e) { msg("Папка табылмады: оны көшірген не өшірген болуыңыз мүмкін. Қайта таңдаңыз."); }
    });
    var pick = root.querySelector('[data-mc="pick"]');
    if (pick) pick.addEventListener("click", async function () {
      try { var d = await global.showDirectoryPicker({ id: "shyn-media", mode: "read" }); msg("Папка оқылуда… (бірнеше секунд)"); var lib = await scanHandle(d); saveHandle(d); done(lib); }
      catch (e) { if (e.name !== "AbortError") msg("Папканы ашу мүмкін болмады: " + e.message); }
    });
    var inp = root.querySelector('[data-mc="dir"]');
    inp.addEventListener("change", function () { if (!this.files.length) return; msg("Папка оқылуда…"); done(scanList(this.files)); });
    Shyn._mediaFiles = function (list) { done(scanList(list)); }; // тест үшін: File тізімін тікелей беру
  }
  function catCard(c) {
    var s = stat(c.lessons), docs = c.lessons.reduce(function (n, L) { return n + L.items.length - L.videos.length; }, 0);
    return '<a class="mcat mcat--' + c.subj + '" href="#/media/' + encodeURIComponent(c.id) + '"><span class="mcat__k">' + SUBJ[c.subj] + (c.from ? ' · ' + esc(c.from) : "") + '</span><h3>' + esc(c.name) + '</h3>' +
      '<p>' + c.lessons.length + ' тақырып · ' + s.t + ' видео/аудио' + (docs ? ' · ' + docs + ' материал' : "") + '</p>' +
      '<span class="gbar"><i style="width:' + s.pct + '%"></i></span><small>' + (s.t ? s.w + ' / ' + s.t + ' көрілді' : 'тек материалдар') + '</small></a>';
  }
  function drawHome() {
    var s = stat(LIB.lessons), last = P.last && LIB.lessons.filter(function (L) { return L.id === P.last.l; })[0];
    var f = { all: "Барлығы", tgo: SUBJ.tgo, eng: SUBJ.eng, it: SUBJ.it, gen: SUBJ.gen };
    var sf = CUR.f || "all";
    view.innerHTML = head(LIB.cats.length + " каталог · " + LIB.lessons.length + " тақырып · " + s.t + " видео/аудио" + (LIB.connected ? " · «" + esc(LIB.connected) + "» папкасы қосылған" : "")) +
      (LIB.connected ? "" : connectBox(false)) +
      '<section class="mtop"><div class="mtop__p"><span class="gbar"><i style="width:' + s.pct + '%"></i></span><small>Жалпы прогресс: <b>' + s.w + '</b> / ' + s.t + ' (' + s.pct + '%)</small></div>' +
        (last ? '<a class="btn btn--gold" href="#/media/' + encodeURIComponent(last.cat) + '/' + encodeURIComponent(last.id) + '/' + (P.last.i || 0) + '">Жалғастыру: ' + esc(last.title) + '</a>' : "") +
        (LIB.connected ? '<button class="btn btn--ghost" id="mChange">Басқа папка</button>' : "") + '</section>' +
      '<div class="seg seg--wrap" role="group">' + Object.keys(f).map(function (k) { return '<button data-mf="' + k + '" class="' + (sf === k ? "is-on" : "") + '">' + f[k] + '</button>'; }).join("") + '</div>' +
      '<input class="field msearch" id="mQ" type="search" placeholder="Тақырыпты іздеу: Дейкстра, Present Perfect, пайыз…">' +
      '<div id="mRes"></div>' +
      '<section class="mcats" id="mCats">' + LIB.cats.filter(function (c) { return sf === "all" || c.subj === sf || (sf === "it" && /algo|db/.test(c.subj)) || c.lessons.some(function (L) { return L.subj === sf || (sf === "it" && /algo|db/.test(L.subj)); }); }).map(catCard).join("") + '</section>';
    U.on("[data-mf]", "click", function (e, el) { CUR.f = el.getAttribute("data-mf"); drawHome(); }, view);
    var ch = U.$("#mChange"); if (ch) ch.addEventListener("click", function () { LIB = merge("", []); drawHome(); });
    if (!LIB.connected) bindConnect(view.querySelector(".mpick"));
    U.$("#mQ").addEventListener("input", function () {
      var q = this.value.trim().toLowerCase(), box = U.$("#mRes");
      if (q.length < 2) { box.innerHTML = ""; U.$("#mCats").hidden = false; return; }
      var hits = LIB.lessons.filter(function (L) { return (L.dir + " " + L.items.map(function (i) { return i.name; }).join(" ")).toLowerCase().indexOf(q) >= 0; }).slice(0, 40);
      U.$("#mCats").hidden = true;
      box.innerHTML = hits.length ? '<ul class="mlist">' + hits.map(lessonRow).join("") + '</ul>' : '<p class="empty">«' + esc(q) + '» бойынша тақырып табылмады.</p>';
    });
  }
  function lessonRow(L) {
    var s = stat([L]), done = s.t && s.w === s.t;
    var icons = { video: 0, audio: 0, pdf: 0, img: 0, doc: 0 }; L.items.forEach(function (i) { icons[i.kind]++; });
    return '<li class="' + (done ? "is-done" : "") + '"><a href="#/media/' + encodeURIComponent(L.cat) + '/' + encodeURIComponent(L.id) + '"><span class="mrow__chk" aria-hidden="true"></span><span class="mrow__t"><b>' + esc(L.title) + '</b>' +
      (L.group ? '<small>' + esc(L.group) + '</small>' : "") + '</span><span class="mrow__m">' +
      (icons.video ? '<i class="mi mi--v">' + icons.video + ' видео</i>' : "") + (icons.audio ? '<i class="mi mi--a">' + icons.audio + ' аудио</i>' : "") +
      (icons.pdf ? '<i class="mi">' + icons.pdf + ' PDF</i>' : "") + (icons.doc ? '<i class="mi">' + icons.doc + ' құжат</i>' : "") + (icons.img ? '<i class="mi">' + icons.img + ' сурет</i>' : "") + '</span></a></li>';
  }
  function drawCat(cid) {
    var c = LIB.cats.filter(function (x) { return x.id === cid; })[0]; if (!c) return Shyn.go("#/media");
    var s = stat(c.lessons), groups = [], gm = {};
    c.lessons.forEach(function (L) { var g = L.group || ""; if (!gm[g]) { gm[g] = []; groups.push(g); } gm[g].push(L); });
    view.innerHTML = '<p class="crumbs"><a href="#/media">Видеосабақтар</a> / ' + esc(c.name) + '</p>' +
      '<header class="page-head"><h1>' + esc(c.name) + '</h1><p class="muted">' + c.lessons.length + ' тақырып · ' + s.w + ' / ' + s.t + ' көрілді</p></header>' +
      '<span class="gbar mcatbar"><i style="width:' + s.pct + '%"></i></span>' +
      groups.map(function (g) { return (g ? '<h2 class="mgroup">' + esc(g) + ' <small>' + stat(gm[g]).w + ' / ' + stat(gm[g]).t + '</small></h2>' : "") + '<ul class="mlist">' + gm[g].map(lessonRow).join("") + '</ul>'; }).join("");
  }
  var urls = [];
  function revoke() { urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; }
  async function drawLesson(cid, lid, idx) {
    revoke();
    var c = LIB.cats.filter(function (x) { return x.id === cid; })[0], L = c && c.lessons.filter(function (x) { return x.id === lid; })[0];
    if (!L) return Shyn.go("#/media");
    var pos = c.lessons.indexOf(L), prev = c.lessons[pos - 1], next = c.lessons[pos + 1];
    var V = L.videos, cur = V[idx] || null, others = L.items.filter(function (i) { return i.kind !== "video" && i.kind !== "audio"; });
    P.last = { l: L.id, i: idx }; save();
    view.innerHTML = '<p class="crumbs"><a href="#/media">Видеосабақтар</a> / <a href="#/media/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a>' + (L.group ? ' / ' + esc(L.group) : "") + '</p>' +
      '<header class="page-head"><h1>' + esc(L.title) + '</h1></header>' +
      '<div class="mlesson"><div class="mlesson__main">' +
        (cur && cur.off ? connectBox(true) : cur ? '<div class="mplayer"><' + (cur.kind === "video" ? "video" : "audio") + ' id="mPlay" controls preload="metadata" playsinline></' + (cur.kind === "video" ? "video" : "audio") + '></div>' +
          '<div class="mctl"><span class="mctl__t">' + esc(vname(cur)) + '</span><span class="sp"></span>' +
          [1, 1.25, 1.5, 1.75, 2].map(function (r) { return '<button class="chip" data-rate="' + r + '">' + r + '×</button>'; }).join("") +
          '<label class="check"><input type="checkbox" id="mDone"' + (P.w[key(cur)] ? " checked" : "") + '> Көрдім</label></div>' : '<p class="labnote">Бұл тақырыпта видео жоқ — төмендегі материалдарды қараңыз.</p>') +
        '<div id="mDocs"></div></div>' +
        '<aside class="mlesson__side">' +
          (V.length > 1 ? '<h2>Осы тақырыптың видеолары</h2><ol class="mvlist">' + V.map(function (v, i) { return '<li class="' + (i === idx ? "is-on" : "") + (P.w[key(v)] ? " is-done" : "") + '"><a href="#/media/' + encodeURIComponent(c.id) + '/' + encodeURIComponent(L.id) + '/' + i + '">' + esc(vname(v)) + '</a></li>'; }).join("") + '</ol>' : "") +
          (others.length ? '<h2>Материалдар</h2><ul class="mdocs">' + others.map(function (o, i) { return '<li><button class="linkbtn" data-doc="' + i + '"><i class="mi">' + (o.kind === "pdf" ? "PDF" : o.kind === "img" ? "Сурет" : o.name.split(".").pop().toUpperCase()) + '</i> ' + esc(clean(o.name)) + '</button></li>'; }).join("") + '</ul>' : "") +
          '<div class="mnav">' + (prev ? '<a class="btn btn--line" href="#/media/' + encodeURIComponent(c.id) + '/' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + '</a>' : "") +
          (next ? '<a class="btn btn--gold" href="#/media/' + encodeURIComponent(c.id) + '/' + encodeURIComponent(next.id) + '">' + esc(next.title) + ' →</a>' : "") + '</div>' +
        '</aside></div>';
    if (cur && cur.off) bindConnect(view.querySelector(".mpick"));
    else if (cur) {
      var el = U.$("#mPlay"), f = await fileOf(cur), u = URL.createObjectURL(f); urls.push(u); el.src = u;
      var k = key(cur), rate = +(P.rate || 1);
      el.addEventListener("loadedmetadata", function () { if (P.pos[k] && P.pos[k] < el.duration - 5) el.currentTime = P.pos[k]; el.playbackRate = rate; });
      var lastSave = 0;
      el.addEventListener("timeupdate", function () {
        if (Date.now() - lastSave > 4000) { P.pos[k] = Math.floor(el.currentTime); save(); lastSave = Date.now(); }
        if (el.duration && el.currentTime / el.duration > 0.9 && !P.w[k]) { markWatched(cur); var d = U.$("#mDone"); if (d) d.checked = true; }
      });
      el.addEventListener("ended", function () {
        markWatched(cur); delete P.pos[k]; save();
        var nx = V[idx + 1] ? "#/media/" + encodeURIComponent(c.id) + "/" + encodeURIComponent(L.id) + "/" + (idx + 1) : next && next.videos.length ? "#/media/" + encodeURIComponent(c.id) + "/" + encodeURIComponent(next.id) : null;
        if (nx) { U.toast("Келесі видео 3 секундтан кейін басталады"); setTimeout(function () { if (location.hash.indexOf("#/media/") === 0 && U.$("#mPlay") === el) location.hash = nx; }, 3000); }
      });
      U.on("[data-rate]", "click", function (e, b) { el.playbackRate = +b.getAttribute("data-rate"); P.rate = el.playbackRate; save(); U.$$("[data-rate]").forEach(function (x) { x.classList.toggle("is-on", x === b); }); }, view);
      U.$$("[data-rate]").forEach(function (x) { x.classList.toggle("is-on", +x.getAttribute("data-rate") === rate); });
      U.$("#mDone").addEventListener("change", function () { if (this.checked) markWatched(cur); else { delete P.w[k]; save(); } });
    }
    U.on("[data-doc]", "click", async function (e, b) {
      var o = others[+b.getAttribute("data-doc")];
      if (o.off) { U.toast("Материалды ашу үшін алдымен папканы қосыңыз"); var mp = view.querySelector(".mpick"); if (mp) mp.scrollIntoView({ block: "center" }); else { U.$("#mDocs").innerHTML = connectBox(true); bindConnect(U.$("#mDocs").querySelector(".mpick")); } return; }
      var f = await fileOf(o), u = URL.createObjectURL(f); urls.push(u);
      var box = U.$("#mDocs");
      if (o.kind === "pdf") box.innerHTML = '<div class="mdocv"><div class="mdocv__h"><b>' + esc(clean(o.name)) + '</b><a class="btn btn--line" href="' + u + '" target="_blank" rel="noopener">Жаңа бетте ашу</a></div><iframe src="' + u + '" title="' + esc(o.name) + '"></iframe></div>';
      else if (o.kind === "img") box.innerHTML = '<div class="mdocv"><div class="mdocv__h"><b>' + esc(clean(o.name)) + '</b></div><img src="' + u + '" alt="' + esc(clean(o.name)) + '"></div>';
      else box.innerHTML = '<div class="mdocv"><div class="mdocv__h"><b>' + esc(o.name) + '</b><a class="btn btn--gold" href="' + u + '" download="' + esc(o.name) + '">Компьютерде ашу</a></div><p class="muted">Бұл файл түрін (' + esc(o.name.split(".").pop()) + ') браузер көрсете алмайды — PowerPoint не Word-та ашылады.</p></div>';
      if (o.kind === "img") { var imgs = others.filter(function (x) { return x.kind === "img"; }); if (imgs.length > 1) { /* галерея: келесі суреттер */ var rest = await Promise.all(imgs.filter(function (x) { return x !== o; }).slice(0, 30).map(async function (x) { var uu = URL.createObjectURL(await fileOf(x)); urls.push(uu); return '<img src="' + uu + '" alt="' + esc(clean(x.name)) + '" loading="lazy">'; })); box.querySelector(".mdocv").insertAdjacentHTML("beforeend", rest.join("")); } }
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }, view);
  }

  Shyn.mediaSummary = function () { return LIB ? stat(LIB.lessons) : null; };
})(window);
