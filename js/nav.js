/* Шың — навигация: 5 бөлім, әр бөлімнің ішкі қойындылары. Барлық беттің үстіне бір ғана қойынды жолағы шығады. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn;
  /* Құрылым «пәндер бойынша»: Басты (бүгін, жоспар) · Пәндер (әр пәннің ішінде бәрі) · Тесттер · Прогресс.
     tabs[i] = [href, атау, [қосымша сәйкес келетін hash-тар]]; sub[href] — 2-деңгей; sub2[href] — 3-деңгей. */
  var SUBJ_SUB = {
    algo: [["#/map/algo", "Құрылым"], ["#/explain/algo", "Сабақтар"], ["#/cheats/algo", "Шпаргалка", ["#/cheats/trap", "#/sorting"]], ["#/formulas/algo", "Формулалар"], ["#/terms/algo", "Терминдер", ["#/terms/prog"]], ["#/lab", "Зертхана"], ["#/cards/algo", "Карточкалар"]],
    db: [["#/map/db", "Құрылым"], ["#/explain/db", "Сабақтар"], ["#/cheats/sql", "Шпаргалка"], ["#/formulas/db", "Формулалар"], ["#/terms/db", "Терминдер"], ["#/lab/sql", "Зертхана", ["#/lab/join", "#/lab/nf"]], ["#/cards/db", "Карточкалар"]],
    english: [["#/map/english", "Құрылым"], ["#/express", "Жедел", ["#/eng/intensive"]], ["#/listen", "Тыңдалым"], ["#/eng", "Грамматика", ["#/eng/t", "#/eng/l", "#/eng/review"]], ["#/eng/table", "Шақтар", ["#/eng/build", "#/eng/game"]], ["#/eng/verbs", "Сөздер", ["#/eng/pron", "#/synonyms"]], ["#/explain/english", "Сабақтар"]],
    fundamentals: [["#/map/fundamentals", "Құрылым"], ["#/explain/fundamentals", "Сабақтар"], ["#/cheats/ana", "Шпаргалка", ["#/cheats/tgo"]], ["#/formulas/fundamentals", "Формулалар"], ["#/cards/fundamentals", "Карточкалар"]]
  };
  var SECTIONS = [
    { id: "home", name: "Басты", href: "#/", routes: ["home", "plan"],
      tabs: [["#/", "Бүгін"], ["#/plan", "Жоспар"]] },
    { id: "subj", name: "Пәндер", href: "#/map/algo",
      routes: ["map", "explain", "terms", "formulas", "cheats", "cards", "sorting", "lab", "media", "express", "listen", "eng", "lesson", "synonyms"],
      tabs: [["#/map/algo", "Алгоритм", SUBJ_SUB.algo.slice(1).map(function (t) { return t[0]; }).concat(["#/lab/sort", "#/lab/search", "#/lab/ds", "#/lab/hash", "#/lab/tree", "#/lab/graph", "#/lab/cheat", "#/sorting", "#/cheats/trap", "#/terms/prog", "#/explain", "#/cheats", "#/formulas", "#/terms", "#/cards", "#/map"])],
             ["#/map/db", "ДҚ", SUBJ_SUB.db.slice(1).map(function (t) { return t[0]; }).concat(["#/lab/join", "#/lab/nf"])],
             ["#/map/english", "Ағылшын", ["#/express", "#/listen", "#/eng", "#/synonyms", "#/explain/english", "#/eng/intensive"]],
             ["#/map/fundamentals", "ТГО", SUBJ_SUB.fundamentals.slice(1).map(function (t) { return t[0]; }).concat(["#/cheats/tgo"])],
             ["#/media", "Видео"]],
      sub: { "#/map/algo": SUBJ_SUB.algo, "#/map/db": SUBJ_SUB.db, "#/map/english": SUBJ_SUB.english, "#/map/fundamentals": SUBJ_SUB.fundamentals },
      sub2: {
        "#/eng": [["#/eng", "Оқу жолы", ["#/eng/t", "#/eng/l"]], ["#/eng/review", "Қайталау"]],
        "#/eng/table": [["#/eng/table", "12 шақ кестесі"], ["#/eng/build", "Шақ құрастырғыш"], ["#/eng/game", "Шақ жарысы"]],
        "#/eng/verbs": [["#/eng/verbs", "Етістіктер"], ["#/eng/pron", "Есімдіктер"], ["#/synonyms", "Синонимдер"]],
        "#/express": [["#/express", "Жедел жоспар"], ["#/eng/intensive", "21 күндік интенсив"]],
        "#/cheats/algo": [["#/cheats/algo", "Формулалар мен кестелер"], ["#/cheats/trap", "Жиі тұзақтар"], ["#/sorting", "Сұрыптау күрделілігі"]],
        "#/cheats/ana": [["#/cheats/ana", "Аналитикалық ойлау"], ["#/cheats/tgo", "Математика"]]
      } },
    { id: "tests", name: "Тесттер", href: "#/variants", routes: ["variants", "mistakes", "blitz", "bank", "hard"],
      tabs: [["#/variants", "Нұсқалар"], ["#/mistakes", "Қателер"], ["#/blitz", "Блиц"], ["#/hard", "Қиын есептер"], ["#/bank", "Сұрақтар қоры"]] },
    { id: "me", name: "Прогресс", href: "#/stats", routes: ["stats", "history", "me", "settings", "install", "more"],
      tabs: [["#/stats", "Статистика", ["#/history"]], ["#/me", "Жетістіктер"], ["#/settings", "Баптаулар", ["#/install"]]],
      sub: { "#/stats": [["#/stats", "Көрсеткіштер"], ["#/history", "Тесттер тарихы"]] } }
  ];
  // Сабақ беттері (#/explain/<id>) өз пәнінің қойындысында жанып тұрсын
  Shyn.onReady && Shyn.onReady(function () {
    var map = { algo: 0, db: 1, english: 2, fundamentals: 3 }, tabs = SECTIONS[1].tabs;
    (Shyn.feynman || []).forEach(function (t) { var i = map[t.s]; if (i !== undefined) tabs[i][2].push("#/explain/" + t.id); });
    var subs = { algo: SUBJ_SUB.algo[1], db: SUBJ_SUB.db[1], english: SUBJ_SUB.english[6], fundamentals: SUBJ_SUB.fundamentals[1] };
    (Shyn.feynman || []).forEach(function (t) { var s = subs[t.s]; if (s) (s[2] = s[2] || []).push("#/explain/" + t.id); });
  });
  Shyn.SECTIONS = SECTIONS;
  function sectionOf(route) { for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].routes.indexOf(route) >= 0) return SECTIONS[i]; return null; }
  function match(hash, tab) {
    var list = [tab[0]].concat(tab[2] || []);
    var best = -1;
    list.forEach(function (h) {
      if (hash === h || hash.indexOf(h + "/") === 0) best = Math.max(best, h.length);
    });
    return best;
  }
  function activeTab(sec, hash) {
    var best = null, score = -1;
    (sec.tabs || []).forEach(function (t) { var s = match(hash, t); if (s > score) { score = s; best = t; } });
    return best;
  }
  function bar(items, active, cls) {
    return '<nav class="' + cls + '" aria-label="Бөлім қойындылары">' + items.map(function (t) {
      return '<a href="' + t[0] + '"' + (active && active[0] === t[0] ? ' class="is-on" aria-current="page"' : "") + '>' + t[1] + '</a>';
    }).join("") + '</nav>';
  }
  Shyn.Nav = {
    section: sectionOf,
    // Бет салынғаннан кейін шақырылады: бөлім қойындыларын беттің басына қояды
    decorate: function (route) {
      var hash = (location.hash || "#/").split("?")[0];
      if (hash === "#" || hash === "") hash = "#/";
      var sec = sectionOf(route);
      document.querySelectorAll("[data-sec]").forEach(function (a) { a.classList.toggle("is-active", !!sec && a.getAttribute("data-sec") === sec.id); });
      if (!sec || !sec.tabs || route === "lesson") return;
      var view = document.getElementById("view"); if (!view || view.querySelector(".secnav")) return;
      var t = activeTab(sec, hash);
      var html = bar(sec.tabs, t, "secnav");
      if (t && sec.sub && sec.sub[t[0]]) {
        var st = null, sc = -1; sec.sub[t[0]].forEach(function (x) { var s = match(hash, x); if (s > sc) { sc = s; st = x; } });
        html += bar(sec.sub[t[0]], sc >= 0 ? st : null, "subnav");
        if (st && sc >= 0 && sec.sub2 && sec.sub2[st[0]]) {
          var s2 = null, c2 = -1; sec.sub2[st[0]].forEach(function (x) { var s = match(hash, x); if (s > c2) { c2 = s; s2 = x; } });
          html += bar(sec.sub2[st[0]], c2 >= 0 ? s2 : null, "subnav subnav--2");
        }
      }
      view.insertAdjacentHTML("afterbegin", html);
      if (Shyn._swipeDir) { var d = Shyn._swipeDir; Shyn._swipeDir = null; view.classList.remove("view-in-r", "view-in-l"); void view.offsetWidth; view.classList.add("view-in-" + d); }
      var on = view.querySelector(".secnav .is-on"); if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
    }
  };
  /* ===== Бүкіл сайт бойынша сырғыту (телефон) =====
     Солға — келесі, оңға — алдыңғы. Реті: беттің өз сілтемелері (data-swipe-next/prev) → бөлім қойындылары →
     бөлімнің шетінде көрші бөлім. Тест (#qwrap), карточкалар (#flash), сабақ өз сырғытуын қолданады. */
  var ORDER_ROUTES = { quiz: 1, lesson: 1 };
  function neighbors() {
    var hash = (location.hash || "#/").split("?")[0]; if (hash === "#" || hash === "") hash = "#/";
    var v = document.getElementById("view");
    var n = v && v.querySelector("[data-swipe-next]"), pv = v && v.querySelector("[data-swipe-prev]");
    if (n || pv) return { next: n && n.getAttribute("href"), prev: pv && pv.getAttribute("href") };
    var sec = sectionOf(Shyn._route), si = SECTIONS.indexOf(sec);
    if (si < 0) return {};
    var tabs = sec.tabs || [[sec.href]], cur = activeTab(sec, hash) || tabs[0], ti = tabs.indexOf(cur);
    var nextSec = SECTIONS[si + 1], prevSec = SECTIONS[si - 1];
    var lastOf = function (s) { return s.tabs ? s.tabs[s.tabs.length - 1][0] : s.href; };
    return {
      next: ti < tabs.length - 1 ? tabs[ti + 1][0] : (nextSec ? nextSec.href : null),
      prev: ti > 0 ? tabs[ti - 1][0] : (prevSec ? lastOf(prevSec) : null)
    };
  }
  Shyn.Nav.neighbors = neighbors;
  (function () {
    if (!("ontouchstart" in global)) return;
    var x0, y0, t0, ok = false;
    document.addEventListener("touchstart", function (e) {
      ok = false;
      if (e.touches.length !== 1 || ORDER_ROUTES[Shyn._route] || document.querySelector(".modal.is-open, .modal[open], .modal:not([hidden])")) return;
      var v = document.getElementById("view"); if (!v || !v.contains(e.target)) return;
      for (var n = e.target; n && n !== v; n = n.parentElement) {
        if (n.id === "qwrap" || n.id === "flash" || n.hasAttribute("data-noswipe") || /^(TEXTAREA|INPUT|SELECT|AUDIO|VIDEO|CANVAS)$/.test(n.tagName)) return;
        if (n.scrollWidth > n.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(n).overflowX)) return;
      }
      ok = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (!ok) return; ok = false;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (Date.now() - t0 > 700 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      if (global.getSelection && String(global.getSelection()).length) return;
      var nb = neighbors(), to = dx < 0 ? nb.next : nb.prev;
      if (!to) return;
      Shyn._swipeDir = dx < 0 ? "r" : "l";
      Shyn.go(to);
    }, { passive: true });
  })();

  // Бет өзін-өзі қайта салса (мысалы, зертхана не блиц), қойындыларды қайта қоямыз
  var view = document.getElementById("view");
  if (view && global.MutationObserver) {
    new MutationObserver(function () { if (Shyn._route && !view.querySelector(".secnav")) Shyn.Nav.decorate(Shyn._route); }).observe(view, { childList: true });
  }
})(window);
