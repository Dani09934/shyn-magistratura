/* Шың — Қателер дәптері: барлық қателер бір жерде, қауіптілігі бойынша реттелген.
   Емтихан алдындағы соңғы аптаға арналған: сүзгі, тақырып бойынша жаттығу, басып шығаруға конспект. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, esc = U.esc;
  var F = { sub: "", sort: "risk", topic: "", q: "" };
  var RN = { unknown: "білмедім", confused: "шатастырдым", careless: "асығыстық" };

  function collect() {
    var ids = {}; Store.wrongIds().forEach(function (id) { ids[id] = 1; });
    return Shyn.allQuestions().filter(function (q) { return ids[q.id] && !q.missing; }).map(function (q) {
      var w = Store.wrongInfo(q.id) || {}, L = Store.learning(q.id) || {};
      var miss = Math.max(w.n || 1, (L.attempts || 0) - (L.correct || 0));
      // қауіп: сенімді болып қателесу > бірнеше рет қателесу > «білмедім» > жақында
      var risk = (L.conf === "sure" ? 40 : 0) + Math.min(miss, 5) * 12 + (L.reason === "unknown" ? 10 : L.reason === "confused" ? 6 : 0) +
        ((L.dueAt || 0) <= Date.now() ? 8 : 0);
      return { q: q, w: w, L: L, miss: miss, risk: risk, sure: L.conf === "sure" };
    });
  }
  function filtered(items) {
    var s = F.q.trim().toLowerCase();
    var out = items.filter(function (x) {
      if (F.sub && x.q._subject !== F.sub) return false;
      if (F.topic && x.q.topic !== F.topic) return false;
      if (s && (x.q.q + " " + (x.q.topic || "")).toLowerCase().indexOf(s) < 0) return false;
      return true;
    });
    out.sort(F.sort === "recent" ? function (a, b) { return (b.w.at || b.L.lastAt || 0) - (a.w.at || a.L.lastAt || 0); }
      : function (a, b) { return b.risk - a.risk; });
    return out;
  }
  function launch(list, title, scope) {
    if (!list.length) { U.toast("Бұл сүзгі бойынша қате жоқ"); return; }
    Shyn.startTest("mistakes:" + (scope || "list"), title, list.map(function (x) { return x.q; }), { mode: "practice", fresh: true });
  }
  function item(x, i) {
    var q = x.q, sel = x.w.sel || [];
    var opts = q.opts.map(function (o) {
      var ok = q.correct.indexOf(o.l) >= 0, on = sel.indexOf(o.l) >= 0;
      return '<li class="' + (ok ? "is-ok" : on ? "is-no" : "") + '"><b>' + o.l + '</b> ' + Shyn.fmt(o.t) +
        (ok ? ' <span class="mark">дұрыс</span>' : on ? ' <span class="mark">сіздің жауабыңыз</span>' : "") + '</li>';
    }).join("");
    var meta = [Shyn.SUBJECT[q._subject].short, q.topic || "", "нұсқа " + q._variant].filter(Boolean).map(esc).join(", ");
    var tags = (x.sure ? '<span class="tag tag--warn">сенімді болып қателескен</span> ' : "") +
      (x.miss > 1 ? '<span class="tag tag--extra">' + x.miss + ' рет қате</span> ' : "") +
      (RN[x.L.reason] ? '<span class="tag">' + RN[x.L.reason] + '</span>' : "");
    return '<article class="rv mk" data-id="' + esc(q.id) + '"><details><summary><span class="rv__n">' + (i + 1) + '</span>' +
      '<span class="rv__q">' + Shyn.fmt(q.q) + '<span class="mk__meta">' + meta + '</span>' + (tags ? '<span class="mk__tags">' + tags + '</span>' : "") + '</span>' +
      '<span class="rv__pts">' + (x.L.attempts ? (x.L.correct || 0) + "/" + x.L.attempts : "") + '</span></summary>' +
      (q.passage ? '<details class="mk__passage"><summary>Мәтін</summary><div>' + Shyn.fmt(q.passage) + '</div></details>' : "") +
      Shyn.code(q.code) + '<ul class="rv__opts">' + opts + '</ul>' +
      '<div class="explain__t">' + Shyn.fmt(q.ex) + '</div>' +
      '<div class="inline mk__acts"><button class="btn btn--line btn--sm" data-one="' + esc(q.id) + '">Қайта шығару</button>' +
      '<button class="btn btn--ghost btn--sm" data-done="' + esc(q.id) + '">Түсіндім, тізімнен алу</button></div>' +
      '</details></article>';
  }

  Shyn.mistakesTop = function (n, sureOnly) {
    return collect().filter(function (x) { return !sureOnly || x.sure; }).sort(function (a, b) { return b.risk - a.risk; }).slice(0, n).map(function (x) { return x.q; });
  };
  Shyn.route("mistakes", function () {
    var view = document.getElementById("view");
    var all = collect(), list = filtered(all);
    var subs = {}; all.forEach(function (x) { subs[x.q._subject] = (subs[x.q._subject] || 0) + 1; });
    var topics = {}; all.filter(function (x) { return !F.sub || x.q._subject === F.sub; }).forEach(function (x) { var t = x.q.topic || "Тақырыпсыз"; topics[t] = (topics[t] || 0) + 1; });
    var topicList = Object.keys(topics).sort(function (a, b) { return topics[b] - topics[a]; });
    if (F.topic && !topics[F.topic]) F.topic = "";
    var sure = all.filter(function (x) { return x.sure; }).length, repeat = all.filter(function (x) { return x.miss > 1; }).length;
    var fixed = Store.fixedSince(7);

    if (!all.length) {
      view.innerHTML = '<header class="page-head"><h1>Қателер дәптері</h1></header>' +
        '<div class="empty"><p><b>Дәптер әзірге бос.</b></p><p>Кез келген нұсқаны тапсырыңыз: қате жауап берген сұрақтар осында түседі, дұрыс шығарған соң өздігінен өшеді.</p>' +
        '<div class="inline inline--center"><a class="btn btn--primary" href="#/variants">Нұсқаны таңдау</a><a class="btn btn--line" href="#/blitz">Блиц ойнау</a></div></div>' +
        (fixed ? '<p class="muted mk__fixed">Соңғы 7 күнде ' + fixed + ' қате түзетілді.</p>' : "");
      return;
    }
    var chips = '<button class="chip' + (!F.sub ? " is-on" : "") + '" data-sub="">Барлығы · ' + all.length + '</button>' +
      Shyn.SUBJECT_ORDER.filter(function (k) { return subs[k]; }).map(function (k) {
        return '<button class="chip' + (F.sub === k ? " is-on" : "") + '" data-sub="' + k + '">' + Shyn.SUBJECT[k].short + ' · ' + subs[k] + '</button>';
      }).join("");
    var tbar = topicList.slice(0, 8).map(function (t) {
      return '<button class="weak mk__topic' + (F.topic === t ? " is-on" : "") + '" data-tp="' + esc(t) + '"><span class="weak__name">' + esc(t) + '</span><span class="weak__pct">' + topics[t] + '</span></button>';
    }).join("");
    var top = list.slice(0, 20);

    view.innerHTML =
      '<header class="page-head"><h1>Қателер дәптері</h1><p class="muted">Қате жауап берген барлық сұрақ. Дұрыс шығарсаңыз, тізімнен өздігінен өшеді.</p></header>' +
      '<div class="kpis"><div><b>' + all.length + '</b><span>сұрақ дәптерде</span></div>' +
        '<div><b>' + sure + '</b><span>сенімді болып қателескен</span></div>' +
        '<div><b>' + repeat + '</b><span>бірнеше рет қателескен</span></div>' +
        '<div><b>' + fixed + '</b><span>соңғы 7 күнде түзетілді</span></div></div>' +
      '<section class="block mk__go"><div><h2>Ең қауіпті ' + top.length + ' сұрақ</h2>' +
        '<p class="muted">Алдымен сенімді болып қателескендер мен қайталанған қателер. Емтиханда дәл осылар ұпай алады.</p></div>' +
        '<div class="inline"><button class="btn btn--primary" id="mkTop">Шығаруды бастау</button>' +
        '<button class="btn btn--line" id="mkAll">Сүзгідегі барлығы (' + list.length + ')</button>' +
        '<button class="btn btn--ghost" id="mkPrint">Конспект басып шығару</button></div></section>' +
      '<section class="block"><div class="toolbar"><div class="chips">' + chips + '</div>' +
        '<div class="seg" role="group" aria-label="Реттеу"><button data-sort="risk" class="' + (F.sort === "risk" ? "is-on" : "") + '">Қауіптісі алдымен</button>' +
        '<button data-sort="recent" class="' + (F.sort === "recent" ? "is-on" : "") + '">Соңғылары</button></div></div>' +
        (topicList.length > 1 ? '<h3 class="mk__h">Тақырыптар</h3><div class="weaks mk__topics">' + tbar + '</div>' : "") +
        '<div class="toolbar"><input class="field toolbar__search" id="mkQ" type="search" placeholder="Сұрақ мәтіні бойынша іздеу" value="' + esc(F.q) + '">' +
        (F.topic ? '<button class="chip is-on" data-tp="">' + esc(F.topic) + ' ✕</button>' : "") + '</div>' +
        '<div id="mkList">' + (list.length ? list.map(item).join("") : '<p class="empty">Сүзгі бойынша ештеңе табылмады.</p>') + '</div></section>';

    U.on("[data-sub]", "click", function (e, el) { F.sub = el.getAttribute("data-sub"); F.topic = ""; redraw(); }, view);
    U.on("[data-sort]", "click", function (e, el) { F.sort = el.getAttribute("data-sort"); redraw(); }, view);
    U.on("[data-tp]", "click", function (e, el) { var t = el.getAttribute("data-tp"); F.topic = F.topic === t ? "" : t; redraw(); }, view);
    U.on("[data-one]", "click", function (e, el) {
      var id = el.getAttribute("data-one"), x = all.filter(function (y) { return y.q.id === id; });
      launch(x, "Қателер дәптері · 1 сұрақ", "one");
    }, view);
    U.on("[data-done]", "click", function (e, el) {
      Store.dismissWrong(el.getAttribute("data-done")); U.toast("Тізімнен алынды. Аралықпен қайталауда әлі шығады"); redraw();
    }, view);
    U.$("#mkTop").addEventListener("click", function () { launch(top, "Қателер дәптері · ең қауіпті " + top.length, "top"); });
    U.$("#mkAll").addEventListener("click", function () { launch(list, "Қателер дәптері" + (F.topic ? " · " + F.topic : F.sub ? " · " + Shyn.SUBJECT[F.sub].short : "")); });
    U.$("#mkPrint").addEventListener("click", function () {
      U.$$("#mkList details").forEach(function (d) { d.open = true; });
      document.body.classList.add("print-mk"); window.print();
      setTimeout(function () { document.body.classList.remove("print-mk"); }, 500);
    });
    var t; U.$("#mkQ").addEventListener("input", function (e) {
      F.q = e.target.value; clearTimeout(t);
      t = setTimeout(function () { var l = filtered(collect()); U.$("#mkList").innerHTML = l.length ? l.map(item).join("") : '<p class="empty">Сүзгі бойынша ештеңе табылмады.</p>'; }, 200);
    });
    function redraw() { Shyn._keepScroll = true; Shyn.render(); }
  });
})(window);
