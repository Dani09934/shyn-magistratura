/* Шың — ағылшын тілінің КТ форматына сай интенсиві.
   КТ форматы: тыңдалым 16 (2 мәтін × 8), лексика-грамматика 18, оқылым 16 (2 мәтін × 8) — барлығы 50 сұрақ. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, Store = Shyn.Store;
  var view = document.getElementById("view");
  var KEY = "shyn_eint";
  var S; try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  S.days = S.days || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function today() { return U.dayKey(); }
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }

  var SEC = {
    L: { name: "Тыңдалым", n: 16, info: "2 аудиомәтін, әрқайсына 8 сұрақ", tip: "Алдымен сұрақтарды оқып шық — не тыңдау керегін біл. Сандар, аттар, «not», «only» сөздеріне назар аудар. Бір сұраққа тұрып қалма: мәтін әрі қарай жүреді." },
    G: { name: "Лексика-грамматика", n: 18, info: "18 жеке сұрақ: шақтар, етіс, модальдар, артикль, предлог, сөзжасам", tip: "Алдымен уақыт маркерін ізде (since, already, by the time, yesterday). Бос орынның алды-артындағы сөз көбіне жауапты анықтайды: предлог, артикль, -ing/to." },
    R: { name: "Оқылым", n: 16, info: "2 мәтін, әрқайсына 8 сұрақ", tip: "Мәтінді емес, сұрақты бірінші оқы. Жауап мәтіннің ретімен келеді. «Мәтінде айтылмаған» нұсқаны таңдамас бұрын абзацтың кілт сөзін тағы бір тексер." }
  };
  function secOf(q) { var t = q.topic || ""; return /^Тыңдалым/.test(t) ? "L" : /^Оқылым/.test(t) ? "R" : "G"; }
  var cache = null;
  function data() {
    if (cache) return cache;
    var qs = Shyn.allQuestions().filter(function (q) { return q._subject === "english" && !q.missing; });
    var groups = { L: [], R: [] }, gm = {}, G = [];
    qs.forEach(function (q) {
      var s = secOf(q);
      if (s === "G") { G.push(q); return; }
      var k = q._set + "|" + q.topic;
      if (!gm[k]) { gm[k] = { key: k, title: q.topic.replace(/^(Тыңдалым|Оқылым)\s*·\s*/, ""), variant: q._variant, qs: [] }; groups[s].push(gm[k]); }
      gm[k].qs.push(q);
    });
    ["L", "R"].forEach(function (s) { groups[s] = groups[s].filter(function (g) { return g.qs.length >= 4; }).sort(function (a, b) { return a.variant - b.variant; }); });
    cache = { all: qs, G: G, groups: groups };
    return cache;
  }
  function seen(q) { return !!Store.learning(q.id); }
  function stat(list) {
    var a = 0, c = 0; list.forEach(function (q) { var x = Store.learning(q.id); if (x) { a++; if (x.lastState === "correct") c++; } });
    return { a: a, c: c, pct: a ? Math.round(c / a * 100) : null, total: list.length };
  }
  function pickG(n, seed) {
    var D = data().G, due = {}, wrong = {};
    Store.dueIds().forEach(function (id) { due[id] = 1; }); Store.wrongIds().forEach(function (id) { wrong[id] = 1; });
    var rnd = U.shuffle(D);
    var a = rnd.filter(function (q) { return due[q.id] || wrong[q.id]; }), b = rnd.filter(function (q) { return !seen(q); }), c = rnd;
    var out = [], ids = {};
    [a.slice(0, Math.ceil(n / 3)), b, c].forEach(function (L) { L.forEach(function (q) { if (out.length < n && !ids[q.id]) { ids[q.id] = 1; out.push(q); } }); });
    return out;
  }
  function nextGroup(s) {
    var G = data().groups[s]; if (!G.length) return null;
    return G.filter(function (g) { return g.qs.some(function (q) { return !seen(q); }); })[0] || G[Math.floor(Math.random() * G.length)];
  }
  function mock() {
    var d = data(), L = U.shuffle(d.groups.L).slice(0, 2), R = U.shuffle(d.groups.R).slice(0, 2);
    var qs = [].concat(L[0] ? L[0].qs : [], L[1] ? L[1].qs : [], pickG(18), R[0] ? R[0].qs : [], R[1] ? R[1].qs : []);
    return qs;
  }
  function doneTest(scope) { return Store.history().some(function (r) { return r.key === scope; }); }
  function dayNo() { return S.start ? daysBetween(S.start, today()) + 1 : 0; }
  function planLen() {
    var ex = Store.settings.examDate; if (ex) { var left = daysBetween(today(), ex); if (left > 0) return Math.min(Math.max(dayNo() + left - 1, 7), 60); }
    return 21;
  }
  function tasks() {
    var n = dayNo(), d = today(), es = Shyn.engSummary ? Shyn.engSummary() : null, mockDay = n > 0 && n % 7 === 0;
    var dd = S.days[d] || {};
    var T = [];
    T.push({ k: "lesson", t: "Грамматика сабағы" + (es ? ": " + es.next : ""), m: "3–5 минут · ереже + 8 жаттығу", done: es ? es.xp > 0 : false, go: es ? "#/eng/l/" + es.nextId : "#/eng" });
    T.push({ k: "lg", t: "Лексика-грамматика: 18 сұрақ", m: "КТ-ның 2-бөлімі · қателер мен қайталауға келгендер бірінші", scope: "eint:lg:" + d });
    if (mockDay) T.push({ k: "mock", t: "Пробный емтихан: 50 сұрақ", m: "Таймермен · тыңдалым 16, лексика-грамматика 18, оқылым 16", scope: "eint:mock:" + d });
    else {
      T.push({ k: "L", t: "Тыңдалым: 1 мәтін", m: "8 сұрақ · жаңа мәтін", scope: "eint:L:" + d });
      T.push({ k: "R", t: "Оқылым: 1 мәтін", m: "8 сұрақ · жаңа мәтін", scope: "eint:R:" + d });
    }
    T.push({ k: "words", t: "Сөздік қор: 15 синоним немесе етістік", m: "Синонимдер не дұрыс емес етістіктер жаттықтырғышы", go: "#/synonyms", manual: true, done: !!dd.words });
    T.forEach(function (x) { if (x.scope) x.done = doneTest(x.scope); });
    return T;
  }
  Shyn.engInt = function () {
    if (!S.start) return { started: false, left: 0, text: "КТ форматындағы 21 күндік жоспар: грамматика, тыңдалым, оқылым" };
    var T = tasks(), left = T.filter(function (x) { return !x.done; }).length;
    return { started: true, left: left, text: dayNo() + "-күн · бүгін " + (T.length - left) + " / " + T.length + " тапсырма орындалды" + (left ? "" : ". Керемет!") };
  };
  function launch(x) {
    var d = data();
    if (x.k === "lg") return Shyn.startTest(x.scope, "Интенсив · Лексика-грамматика", pickG(18), { mode: "practice" });
    if (x.k === "L" || x.k === "R") {
      var g = nextGroup(x.k); if (!g) return U.toast("Мәтіндер табылмады");
      return Shyn.startTest(x.scope, "Интенсив · " + SEC[x.k].name + ": " + g.title, g.qs, { mode: "practice" });
    }
    if (x.k === "mock") return Shyn.startTest(x.scope, "Интенсив · Пробный емтихан (ағылшын)", mock(), { mode: "exam", secPerQ: 60 });
  }

  Shyn.engIntensive = function () {
    var d = data(), st = { L: stat(d.groups.L.reduce(function (a, g) { return a.concat(g.qs); }, [])), G: stat(d.G), R: stat(d.groups.R.reduce(function (a, g) { return a.concat(g.qs); }, [])) };
    var weakest = ["L", "G", "R"].filter(function (k) { return st[k].pct !== null; }).sort(function (a, b) { return st[a].pct - st[b].pct; })[0];
    var fmt = '<section class="eformat">' + ["L", "G", "R"].map(function (k, i) {
      var s = st[k];
      return '<div class="eformat__b eformat__b--' + k + '"><span class="eformat__n">' + (i + 1) + '-бөлім</span><b>' + SEC[k].name + '</b><span class="eformat__c">' + SEC[k].n + ' сұрақ</span><small>' + SEC[k].info + '</small>' +
        '<span class="gbar"><i style="width:' + (s.pct || 0) + '%"></i></span><small>' + (s.a ? 'Дәлдік: <b>' + s.pct + '%</b> · ' + s.a + ' / ' + s.total + ' сұрақ шығарылды' : 'Әлі шығарылмаған · қорда ' + s.total + ' сұрақ') + '</small>' +
        '<button class="btn btn--line" data-drill="' + k + '">Жаттығу</button></div>';
    }).join("") + '</section>';
    var head = '<header class="page-head"><h1>Ағылшын тілі: КТ интенсиві</h1><p class="muted">Емтихан форматы: 50 сұрақ, бір дұрыс жауап, әрқайсы 1 балл. Жоспар әр күні КТ-ның үш бөлімін де қамтиды, ал әр 7-ші күні — толық пробный емтихан.</p></header>';
    if (!S.start) {
      view.innerHTML = head + '<section class="estart"><div><h2>21 күнде КТ-ға дайын бол</h2><ol><li>Күнделікті 30–40 минут: грамматика сабағы, 18 лексика-грамматика сұрағы, бір тыңдалым және бір оқылым мәтіні.</li><li>Қателер мен ұмытыла бастаған сұрақтар келесі күндері автоматты түрде қайта шығады.</li><li>Әр 7-ші күн — таймермен 50 сұрақтық пробный емтихан, нәтижесі бөлімдер бойынша талданады.</li></ol>' +
        '<button class="btn btn--gold btn--big" id="eStart">Интенсивті бастау</button>' + (Store.settings.examDate ? "" : '<p class="muted small">Кеңес: <a href="#/settings">емтихан күнін</a> белгілесеңіз, жоспар соған дейінгі күндерге бөлінеді.</p>') + '</div></section>' +
        '<h2 class="ehead">Емтихан құрылымы</h2>' + fmt;
      U.$("#eStart").addEventListener("click", function () { S.start = today(); save(); Shyn.engIntensive(); if (Shyn.Game) Shyn.Game.addXP(10, true); });
      bindDrill(); return;
    }
    var n = dayNo(), L = planLen(), T = tasks(), done = T.filter(function (x) { return x.done; }).length;
    if (done === T.length && !(S.days[today()] || {}).all) { S.days[today()] = Object.assign(S.days[today()] || {}, { all: 1 }); save(); if (Shyn.Game) { Shyn.Game.addXP(50); Shyn.Game.confetti(); } }
    var strip = "";
    for (var i = 1; i <= L; i++) {
      var dk = new Date(S.start + "T12:00:00"); dk.setDate(dk.getDate() + i - 1); var k = U.dayKey(dk), info = S.days[k] || {};
      strip += '<span class="eday' + (info.all ? " is-done" : "") + (i === n ? " is-today" : "") + (i % 7 === 0 ? " is-mock" : "") + '" title="' + i + '-күн' + (i % 7 === 0 ? " · пробный" : "") + '">' + i + '</span>';
    }
    view.innerHTML = head +
      '<section class="etoday"><div class="etoday__h"><div><span class="muted">Жоспар: ' + L + ' күн</span><h2>' + n + '-күн' + (n % 7 === 0 ? ' · пробный емтихан' : "") + '</h2></div><div class="etoday__p"><b>' + done + ' / ' + T.length + '</b><span>орындалды</span></div></div>' +
        '<div class="edays">' + strip + '</div>' +
        '<ol class="etasks">' + T.map(function (x, i) {
          return '<li class="' + (x.done ? "is-done" : "") + '"><span class="gchk" aria-hidden="true"></span><span class="etasks__t"><b>' + esc(x.t) + '</b><small>' + esc(x.m) + '</small></span>' +
            (x.done ? '<span class="tone-ok small">Орындалды</span>' : x.go ? '<a class="btn btn--' + (i === T.findIndex(function (y) { return !y.done; }) ? "gold" : "line") + '" href="' + x.go + '"' + (x.manual ? ' data-man="' + x.k + '"' : "") + '>Бастау</a>' : '<button class="btn btn--' + (i === T.findIndex(function (y) { return !y.done; }) ? "gold" : "line") + '" data-task="' + i + '">Бастау</button>') +
            (x.manual && !x.done ? '<button class="btn btn--ghost" data-mark="' + x.k + '">Орындадым</button>' : "") + '</li>';
        }).join("") + '</ol>' +
        (weakest ? '<p class="labnote">Ең әлсіз бөлім — <b>' + SEC[weakest].name + '</b> (' + st[weakest].pct + '%). ' + esc(SEC[weakest].tip) + '</p>' : "") + '</section>' +
      '<h2 class="ehead">Бөлімдер бойынша жаттығу</h2>' + fmt +
      '<section class="block emock"><div><h2>Толық пробный емтихан</h2><p class="muted">50 сұрақ КТ ретімен, таймермен (50 минут). Кез келген күні тапсыруға болады.</p></div><button class="btn btn--gold" id="eMock">Пробныйды бастау</button></section>' +
      '<details class="ereset"><summary>Интенсивті басынан бастау</summary><p class="muted">Күндер санағы бүгіннен басталады. Сұрақтар бойынша прогресс сақталады.</p><button class="btn btn--line" id="eReset">Басынан бастау</button></details>';
    U.on("[data-task]", "click", function (e, el) { launch(T[+el.getAttribute("data-task")]); }, view);
    U.on("[data-mark],[data-man]", "click", function (e, el) {
      var k = el.getAttribute("data-mark") || el.getAttribute("data-man"); var dd = S.days[today()] = S.days[today()] || {};
      dd[k] = 1; save(); if (el.hasAttribute("data-mark")) { if (Shyn.Game) Shyn.Game.addXP(10, true); Shyn.engIntensive(); }
    }, view);
    U.$("#eMock").addEventListener("click", function () { Shyn.startTest("eint:mock:" + today(), "Интенсив · Пробный емтихан (ағылшын)", mock(), { mode: "exam", secPerQ: 60 }); });
    U.$("#eReset").addEventListener("click", function () { S.start = today(); S.days = {}; save(); Shyn.engIntensive(); });
    bindDrill();
  };
  function bindDrill() {
    U.on("[data-drill]", "click", function (e, el) {
      var k = el.getAttribute("data-drill");
      if (k === "G") return Shyn.startTest("eint:drill:G", "Лексика-грамматика: 18 сұрақ", pickG(18), { mode: "practice", fresh: true });
      var g = nextGroup(k); if (!g) return U.toast("Мәтіндер табылмады");
      Shyn.startTest("eint:drill:" + k, SEC[k].name + ": " + g.title, g.qs, { mode: "practice", fresh: true });
    }, view);
  }
})(window);
