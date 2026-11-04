/* Шың — навигация: 5 бөлім, әр бөлімнің ішкі қойындылары. Барлық беттің үстіне бір ғана қойынды жолағы шығады. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn;
  var SECTIONS = [
    { id: "home", name: "Басты", href: "#/", routes: ["home"] },
    { id: "tests", name: "Тесттер", href: "#/variants", routes: ["variants", "plan", "mistakes", "blitz", "bank"],
      tabs: [["#/variants", "Нұсқалар"], ["#/plan", "7 күн"], ["#/mistakes", "Қателер"], ["#/blitz", "Блиц"], ["#/bank", "Сұрақтар қоры"]] },
    { id: "eng", name: "Ағылшын", href: "#/eng/intensive", routes: ["eng", "lesson", "synonyms"],
      tabs: [["#/eng/intensive", "Интенсив"], ["#/eng", "Грамматика", ["#/eng/t", "#/eng/l"]], ["#/eng/review", "Қайталау"], ["#/eng/table", "Шақтар", ["#/eng/build"]],
             ["#/eng/verbs", "Сөздер", ["#/eng/pron", "#/synonyms"]], ["#/eng/game", "Ойын"]],
      sub: { "#/eng/verbs": [["#/eng/verbs", "Етістіктер"], ["#/eng/pron", "Есімдіктер"], ["#/synonyms", "Синонимдер"]],
             "#/eng/table": [["#/eng/table", "12 шақ кестесі"], ["#/eng/build", "Шақ құрастырғыш"]] } },
    { id: "learn", name: "Оқу", href: "#/media", routes: ["media", "lab", "cheats", "cards", "sorting"],
      tabs: [["#/media", "Видео"], ["#/lab", "Зертхана"], ["#/cheats", "Шпаргалка", ["#/sorting"]], ["#/cards", "Карточкалар"]] },
    { id: "me", name: "Прогресс", href: "#/stats", routes: ["stats", "history", "me", "settings", "install", "more"],
      tabs: [["#/stats", "Статистика"], ["#/history", "Тарих"], ["#/me", "Жетістіктер"], ["#/settings", "Баптаулар", ["#/install"]]] }
  ];
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
        var st = null, sc = -1; sec.sub[t[0]].forEach(function (x) { var s = match(hash, [x[0]]); if (s > sc) { sc = s; st = x; } });
        html += bar(sec.sub[t[0]], st, "subnav");
      }
      view.insertAdjacentHTML("afterbegin", html);
      var on = view.querySelector(".secnav .is-on"); if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
    }
  };
  // Бет өзін-өзі қайта салса (мысалы, зертхана не блиц), қойындыларды қайта қоямыз
  var view = document.getElementById("view");
  if (view && global.MutationObserver) {
    new MutationObserver(function () { if (Shyn._route && !view.querySelector(".secnav")) Shyn.Nav.decorate(Shyn._route); }).observe(view, { childList: true });
  }
})(window);
