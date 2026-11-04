/* Шың — емтиханға дейінгі 7 күндік жоспар.
   Күн емтихан күнінен саналады (баптауларда белгіленсе), әйтпесе «Бастау» басылған күннен.
   Тест тапсырмалары тарихтағы нәтиже бойынша өздігінен белгіленеді, басқалары басқанда. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, esc = U.esc;
  var KEY = "shyn_plan";
  var P; try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { P = {}; }
  P.done = P.done || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  var DAYS = [
    { t: "Бастапқы нүкте", why: "Бір толық нұсқа емтихан режимінде: қай пәннен қанша ұпай жоғалтатыныңды көресің.",
      tasks: [["full", "Толық сынақ: барлық пән, таймермен"], ["cheat:exam", "Шпаргалка: емтихан форматы"]] },
    { t: "Әлсіз тақырыптар", why: "Кешегі нәтижеден ең әлсіз тақырыптар мен қателер.",
      tasks: [["weak:all", "Әлсіз тақырыптар: 20 сұрақ"], ["mist:20", "Қателер дәптері: ең қауіпті 20"]] },
    { t: "Алгоритмдер мен деректер қоры", why: "Бейіндік пәндер: тақырыптар бойынша жаттығу және кестелер.",
      tasks: [["weak:algo,db", "Алгоритм + ДҚ: 25 сұрақ"], ["cheat:algo", "Шпаргалка: алгоритмдер"], ["cheat:sql", "Шпаргалка: SQL"]] },
    { t: "Ағылшын тілі", why: "КТ форматындағы 50 сұрақ және грамматика қателері.",
      tasks: [["eng", "Ағылшын: толық нұсқа, 50 сұрақ"], ["weak:english", "Ағылшын: әлсіз тақырыптар 20"], ["cheat:eng", "Шпаргалка: грамматика"]] },
    { t: "ТГО: сыни және аналитикалық ойлау", why: "Математика мен мәтінмен жұмыс: бір нұсқа және ережелер.",
      tasks: [["tgo", "ТГО: бір толық нұсқа"], ["weak:fundamentals", "ТГО: әлсіз тақырыптар 20"], ["cheat:tgo", "Шпаргалка: ТГО формулалары"]] },
    { t: "Бас репетиция", why: "Екінші толық сынақ. Бірінші күнмен салыстыр.",
      tasks: [["full", "Толық сынақ №2"], ["mist:20", "Қателер дәптері: ең қауіпті 20"]] },
    { t: "Жеңіл қайталау", why: "Жаңа тақырып ашпа. Сенімді болып қателескен сұрақтарды қарап, ерте ұйықта.",
      tasks: [["mist:sure", "Сенімді болып қателескендер"], ["cheat:trap", "Шпаргалка: жиі кездесетін тұзақтар"], ["cheat:exam", "Емтихан күнгі ережелер"]] }
  ];

  function dayKey(d) { return U.dayKey(d || new Date()); }
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
  // Қай күн: 1..7; 0 — әлі басталмады; 8 — емтихан күні не өтіп кетті
  function current() {
    var ex = Store.settings.examDate, today = dayKey();
    if (ex) {
      var left = daysBetween(today, ex);
      if (left <= 0) return { day: left === 0 ? 8 : 9, left: left, mode: "exam" };
      if (left <= 7) return { day: 8 - left, left: left, mode: "exam" };
      if (P.start) return { day: Math.min(7, daysBetween(P.start, today) + 1), left: left, mode: "manual" };
      return { day: 0, left: left, mode: "exam" };
    }
    if (P.start) return { day: Math.min(7, daysBetween(P.start, today) + 1), left: null, mode: "manual" };
    return { day: 0, left: null, mode: "none" };
  }
  function scope(d, i) { return "plan:" + (P.start || Store.settings.examDate || "x") + ":d" + d + ":" + i; }
  function isDone(d, i) {
    var id = scope(d, i); if (P.done[id]) return true;
    var k = DAYS[d - 1].tasks[i][0];
    if (/^cheat/.test(k)) return false;
    return Store.history().some(function (r) { return r.key === id; });
  }

  /* ---------- Сұрақтар жинау ---------- */
  function pool(subs) {
    return Shyn.allQuestions().filter(function (q) { return !q.missing && (!subs || subs.indexOf(q._subject) >= 0); });
  }
  function weak(subs, n) {
    var all = pool(subs), due = {}; Store.dueIds().forEach(function (id) { due[id] = 1; });
    var wrong = {}; Store.wrongIds().forEach(function (id) { wrong[id] = 1; });
    var bad = {}; Store.topicStats(all).forEach(function (t) { if (t.pct < 75) bad[t.topic] = 100 - t.pct; });
    var scored = all.map(function (q) {
      var L = Store.learning(q.id), s = (due[q.id] ? 50 : 0) + (wrong[q.id] ? 40 : 0) + (bad[q.topic] || 0) * 0.5 + (L ? 0 : 5) + Math.random() * 10;
      return { q: q, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
    // бір тақырыптан 6-дан артық алмаймыз — әртүрлі болсын
    var per = {}, out = [];
    scored.forEach(function (x) { if (out.length >= n) return; if (x.q.passage || x.q.audio) return; var t = x.q.topic; if ((per[t] = (per[t] || 0) + 1) <= 6) out.push(x.q); });
    return out;
  }
  function randomSet(sub) {
    var sets = Shyn.allSets().filter(function (s) { return s.subject === sub && s.questions.length >= 20; });
    var tried = {}; Store.history().forEach(function (r) { tried[r.key] = 1; });
    var fresh = sets.filter(function (s) { return !tried[s.key]; });
    var list = fresh.length ? fresh : sets;
    return list[Math.floor(Math.random() * list.length)];
  }
  function run(d, i) {
    var k = DAYS[d - 1].tasks[i][0], label = "Жоспар · " + d + "-күн · " + DAYS[d - 1].tasks[i][1], id = scope(d, i), m;
    if ((m = k.match(/^cheat:(.+)$/))) { P.done[id] = Date.now(); save(); Shyn.go("#/cheats/" + m[1]); return; }
    if (k === "full") {
      var qs = [], names = [];
      ["english", "algo", "db", "fundamentals"].forEach(function (s) { var set = randomSet(s); if (set) { qs = qs.concat(set.questions); names.push(Shyn.SUBJECT[s].short + " " + set.variant); } });
      return Shyn.startTest(id, label + " (" + names.join(", ") + ")", qs, { mode: "exam", secPerQ: 72 });
    }
    if (k === "eng") { var e = randomSet("english"); return Shyn.startTest(id, label + " · нұсқа " + e.variant, e.questions, { mode: "exam", secPerQ: 60 }); }
    if (k === "tgo") { var t = randomSet("fundamentals"); return Shyn.startTest(id, label + " · нұсқа " + t.variant, t.questions, { mode: "practice" }); }
    if ((m = k.match(/^weak:(.+)$/))) {
      var subs = m[1] === "all" ? null : m[1].split(","), n = subs && subs.length > 1 ? 25 : 20;
      return Shyn.startTest(id, label, weak(subs, n), { mode: "practice" });
    }
    if ((m = k.match(/^mist:(.+)$/))) {
      var list = Shyn.mistakesTop ? Shyn.mistakesTop(m[1] === "sure" ? 15 : 20, m[1] === "sure") : [];
      if (!list.length) { // қате жоқ болса — әлсіз тақырыптармен ауыстырамыз
        U.toast(m[1] === "sure" ? "Сенімді қате жоқ. Әлсіз тақырыптардан 15 сұрақ берілді" : "Қателер дәптері бос. Әлсіз тақырыптардан 20 сұрақ берілді");
        list = weak(null, m[1] === "sure" ? 15 : 20);
      }
      return Shyn.startTest(id, label, list, { mode: "practice" });
    }
  }

  /* ---------- Көрініс ---------- */
  function dayHTML(d, cur, mode, open) {
    var D = DAYS[d - 1], done = D.tasks.filter(function (x, i) { return isDone(d, i); }).length, all = D.tasks.length;
    var st = d < cur ? (done === all ? "done" : "missed") : d === cur ? "today" : "next";
    var date = "";
    if (Store.settings.examDate && mode !== "manual") { var x = new Date(Store.settings.examDate + "T12:00:00"); x.setDate(x.getDate() - (8 - d)); date = x.getDate() + " " + U.MONTHS[x.getMonth()]; }
    return '<li class="pday pday--' + st + '"><details' + (open ? " open" : "") + '><summary><span class="pday__n">' + d + '</span>' +
      '<span class="pday__t"><b>' + esc(D.t) + '</b><small>' + (date ? date + ", " : "") + done + " / " + all + ' орындалды</small></span>' +
      '<span class="pday__st">' + (st === "done" ? "Дайын" : st === "today" ? "Бүгін" : st === "missed" ? "Қалып қойды" : "") + '</span></summary>' +
      '<p class="muted pday__why">' + esc(D.why) + '</p><ul class="ptasks">' + D.tasks.map(function (x, i) {
        var ok = isDone(d, i);
        return '<li class="' + (ok ? "is-done" : "") + '"><span class="ptask__chk" aria-hidden="true">' + (ok ? "✓" : "") + '</span><span class="ptask__t">' + esc(x[1]) + '</span>' +
          '<button class="btn btn--sm ' + (ok ? "btn--ghost" : d === cur ? "btn--primary" : "btn--line") + '" data-run="' + d + ':' + i + '">' + (ok ? "Қайталау" : /^cheat/.test(x[0]) ? "Ашу" : "Бастау") + '</button></li>';
      }).join("") + '</ul></details></li>';
  }
  Shyn.route("plan", function () {
    var view = document.getElementById("view"), c = current();
    var head = '<header class="page-head"><h1>Емтиханға дейінгі 7 күн</h1><p class="muted">Күніне 1–2 сағат. Әр күннің бір мақсаты бар, тест тапсырмалары аяқталғанда өздігінен белгіленеді.</p></header>';
    var intro;
    if (c.day === 0) {
      intro = '<section class="block pstart"><div><h2>' + (c.left ? "Емтиханға " + c.left + " күн қалды" : "Жоспар әлі басталған жоқ") + '</h2>' +
        '<p class="muted">' + (c.left ? "Жоспар емтиханға 7 күн қалғанда өздігінен басталады. Қазір бастасаң, бүгін 1-күн болады." : "Баптауларда емтихан күнін белгілесең, жоспар соған қарай күндерге бөлінеді. Немесе дәл қазір бастай аласың.") + '</p></div>' +
        '<div class="inline"><button class="btn btn--primary" id="pGo">Бүгін бастау</button>' + (Store.settings.examDate ? "" : '<a class="btn btn--line" href="#/settings">Емтихан күнін белгілеу</a>') + '</div></section>';
    } else if (c.day >= 8) {
      intro = '<section class="block pstart"><div><h2>' + (c.day === 8 ? "Емтихан бүгін. Сәттілік!" : "Емтихан күні өтіп кетті") + '</h2><p class="muted">' +
        (c.day === 8 ? "Таңертең тек шпаргалканы 10 минут қара. Жеке куәлігіңді ұмытпа." : "Жаңа күнді баптауларда белгіле немесе жоспарды қайта баста.") + '</p></div>' +
        '<div class="inline"><a class="btn btn--line" href="#/cheats/exam">Емтихан күнгі ережелер</a>' + (c.day === 9 ? '<button class="btn btn--primary" id="pGo">Қайта бастау</button>' : "") + '</div></section>';
    } else intro = "";
    var cur = c.day >= 1 && c.day <= 7 ? c.day : 0;
    var list = '<ol class="pdays">' + DAYS.map(function (x, i) { return dayHTML(i + 1, cur, c.mode, i + 1 === cur || (!cur && i === 0)); }).join("") + '</ol>';
    view.innerHTML = head + intro + list + (P.start && c.mode === "manual" ? '<p class="muted small pfoot">Жоспар ' + (function (x) { return x.getDate() + " " + U.MONTHS[x.getMonth()]; })(new Date(P.start + "T12:00:00")) + ' басталған. <button class="linkbtn" id="pReset">Басынан бастау</button></p>' : "");
    var go = U.$("#pGo"); if (go) go.addEventListener("click", function () { P.start = dayKey(); P.done = {}; save(); Shyn._keepScroll = true; Shyn.render(); });
    var rs = U.$("#pReset"); if (rs) rs.addEventListener("click", function () { Shyn.ask("Жоспар 1-күннен қайта басталады. Жалғастырасыз ба?", "Басынан бастау", "Болдырмау", function () { P.start = dayKey(); P.done = {}; save(); Shyn.render(); }); });
    U.on("[data-run]", "click", function (e, el) { var a = el.getAttribute("data-run").split(":"); run(+a[0], +a[1]); }, view);
  });

  // Басты бетке шағын блок: бүгінгі күн және келесі тапсырма
  Shyn.planHTML = function () {
    var c = current();
    if (c.day < 1 || c.day > 7) {
      if (c.day === 0 && c.left && c.left <= 14) return '<section class="block pmini"><div><h2>Емтиханға ' + c.left + ' күн</h2><p class="muted">7 күндік жоспар ' + (c.left - 7) + ' күннен кейін басталады.</p></div><a class="btn btn--line" href="#/plan">Жоспарды көру</a></section>';
      return "";
    }
    var D = DAYS[c.day - 1], next = -1;
    D.tasks.forEach(function (x, i) { if (next < 0 && !isDone(c.day, i)) next = i; });
    return '<section class="block pmini"><div><h2>' + c.day + '-күн / 7 · ' + esc(D.t) + '</h2><p class="muted">' +
      (next < 0 ? "Бүгінгі жоспар орындалды. Ертең жалғастыр." : "Келесі: " + esc(D.tasks[next][1])) + '</p></div>' +
      '<div class="inline">' + (next >= 0 ? '<button class="btn btn--primary" data-prun="' + c.day + ':' + next + '">Бастау</button>' : "") + '<a class="btn btn--line" href="#/plan">Жоспар</a></div></section>';
  };
  Shyn.planBind = function (root) {
    U.on("[data-prun]", "click", function (e, el) { var a = el.getAttribute("data-prun").split(":"); run(+a[0], +a[1]); }, root);
  };
})(window);
