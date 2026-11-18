/* Шың — «Бүгін»: бір ғана күнделікті тізім.
   15 күндік жоспардан алгоритм, ДҚ және ТГО тапсырмалары (ТГО математикасы — аналитикамен ауыстырылады, баптауда өзгертуге болады),
   ағылшын — «Жедел» режимнен, плюс қайталау. Емтиханның алдыңғы күні мен өз күні — чек-лист. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, Store = Shyn.Store;
  var MATH = /пайыз|теңде|теңсізд|геометр|сандар|салыстыр|статист|мәтін есеп|ықтимал|математика/i;
  var CHK_KEY = "shyn_today_chk";
  var CHK; try { CHK = JSON.parse(localStorage.getItem(CHK_KEY)) || {}; } catch (e) { CHK = {}; }
  function saveChk() { try { localStorage.setItem(CHK_KEY, JSON.stringify(CHK)); } catch (e) {} }
  function noMath() { return Store.settings.tgoNoMath !== false; } // әдепкі: ТГО математикасыз
  function daysTo(ex) { return Math.round((new Date(ex + "T12:00:00") - new Date(U.dayKey() + "T12:00:00")) / 864e5); }
  var SUBJ = { algo: "Алгоритм", db: "ДҚ", fundamentals: "ТГО", english: "Ағылшын", all: "Барлығы", rev: "Қайталау" };

  function subjOf(k) {
    var m = k.match(/^t:(\w+):/) || k.match(/^weak:(\w+)/);
    if (m) return m[1] === "all" ? "all" : m[1].split(",")[0];
    if (k === "eng") return "english"; if (k === "tgo") return "fundamentals";
    if (/^cheat:sql/.test(k)) return "db"; if (/^cheat:algo/.test(k)) return "algo"; if (/^cheat:ana|^cheat:tgo/.test(k)) return "fundamentals";
    if (/^set:v\d+-(\w+)/.test(k)) return k.match(/^set:v\d+-(\w+)/)[1];
    return "all";
  }
  function items() {
    var out = [], P = Shyn.planToday ? Shyn.planToday() : { items: [] };
    P.items.forEach(function (x) {
      var s = subjOf(x.k);
      if (s === "english" || /^t:english|^weak:english|^eng$/.test(x.k)) return; // ағылшын — «Жедел» режимнен
      var it = { sub: s, label: x.label, done: x.done, run: function () { Shyn.planRun(x.d, x.i); } };
      if (s === "fundamentals" && noMath() && (MATH.test(x.k + " " + x.label) || x.k === "tgo" || /^weak:fundamentals/.test(x.k))) {
        it.label = "ТГО: аналитика, 20 сұрақ (математиканың орнына)";
        it.run = function () { Shyn.launchAnalytics(x.id, "Жоспар · " + x.d + "-күн · ТГО: аналитика"); };
      }
      out.push(it);
    });
    var hasFull = P.items.some(function (x) { return x.k === "full"; });
    if (Shyn.expressToday) Shyn.expressToday().forEach(function (x) {
      if (x.k === "diag" && hasFull) return; // толық сынақтың ағылшын бөлімі диагностиканың орнына жүреді
      out.push({ sub: "english", label: x.t, done: x.done, run: function () { Shyn.expressRun(x); } });
    });
    var due = Store.dueIds().length, wrong = Store.wrongIds().length;
    if (due || wrong) out.push({ sub: "rev", label: due ? "Аралықпен қайталау: " + due + " сұрақ" : "Қателер дәптері: " + wrong + " сұрақ", done: false, run: function () { if (due) Shyn.launchAdaptive("due"); else Shyn.launchMistakes(); } });
    return { list: out, plan: P };
  }

  var EVE = [
    ["docs", "Жеке куәлік және тестке тіркелу қағазы (рұқсатнама) — сөмкеге салынды"],
    ["route", "Тест орталығының мекенжайы мен жолы белгілі, 7:15-те сол жерде боламын"],
    ["clothes", "Киім, су, қалам — дайын (телефон, шпаргалка, смарт-сағатты кіргізбейді)"],
    ["review", "Тек қателер дәптерін қарадым, жаңа тақырып ашпадым"],
    ["alarm", "Оятқыш 6:00-ге қойылды, 22:00-де ұйықтаймын, кешке экран жоқ"]
  ];
  var MORN = [
    ["wake", "6:00-де тұрдым, жуындым, жеңіл таңғы ас іштім"],
    ["docs2", "Куәлік пен рұқсатнама қолымда"],
    ["leave", "7:00-де шықтым — кешігуге жол жоқ"],
    ["calm", "Тактика: алдымен білетіндерім, қиынын белгілеп, соңында ораламын; бос сұрақ қалдырмаймын"]
  ];
  function checklist(title, lead, L, extra) {
    return '<section class="block today today--exam"><h2>' + title + '</h2><p class="muted">' + lead + '</p><ul class="today__chk">' + L.map(function (x) {
      return '<li><label><input type="checkbox" data-chk="' + x[0] + '"' + (CHK[x[0]] ? " checked" : "") + '> ' + esc(x[1]) + '</label></li>';
    }).join("") + '</ul>' + (extra || "") + '</section>';
  }

  Shyn.todayHTML = function () {
    var ex = Store.settings.examDate;
    if (!ex) return '<section class="block today"><h2>Бүгін</h2><p>Емтихан күнін белгілеңіз — жоспар соған қарай сығылады.</p>' +
      '<div class="inline"><input class="field" type="date" id="tdDate" value="2026-11-28"><button class="btn btn--gold" id="tdSave">Сақтау</button></div></section>';
    var left = daysTo(ex);
    if (left < 0) return "";
    if (left === 0) return checklist("Бүгін — емтихан! Сәттілік!", "Сен дайынсың. Асықпа, әр сұрақты соңына дейін оқы.", MORN);
    if (left === 1) return checklist("Ертең — емтихан", "Бүгін жаңа тақырып жоқ. Қателерді қарап, ерте демал.", EVE,
      '<div class="inline"><button class="btn btn--line" data-tdrev>Қателер дәптері</button><a class="btn btn--line" href="#/cheats/exam">Емтихан тактикасы</a></div>');
    var R = items(), L = R.list, done = L.filter(function (x) { return x.done; }).length, first = -1;
    L.forEach(function (x, i) { if (first < 0 && !x.done) first = i; });
    var P = R.plan, sub = P && P.c && P.c.day >= 1 ? (P.c.from && P.c.from < P.c.day ? P.c.from + "–" : "") + P.c.day + "-күн / " + P.N + " · " + esc(P.title || "") : "";
    var startPlan = P && P.c && P.c.day === 0 ? '<p class="muted">15 күндік жоспар әлі басталмаған. <button class="linkbtn" id="tdPlan">Бүгін бастау</button></p>' : "";
    Shyn._todayItems = L;
    return '<section class="block today"><div class="today__h"><div><h2>Бүгін</h2><p class="muted">Емтиханға ' + left + ' күн' + (sub ? " · " + sub : "") + '</p></div>' +
      '<div class="today__n"><b>' + done + ' / ' + L.length + '</b><span>орындалды</span></div></div>' + startPlan +
      '<ol class="today__list">' + L.map(function (x, i) {
        return '<li class="' + (x.done ? "is-done" : "") + '"><span class="gchk" aria-hidden="true"></span><span class="today__tag today__tag--' + x.sub + '">' + SUBJ[x.sub] + '</span>' +
          '<span class="today__t">' + esc(x.label) + '</span>' +
          (x.done ? '<span class="tone-ok small">✓</span>' : '<button class="btn btn--sm btn--' + (i === first ? "gold" : "line") + '" data-td="' + i + '">Бастау</button>') + '</li>';
      }).join("") + '</ol>' +
      '<p class="muted small today__f"><a href="#/map">Пән картасы</a> · <a href="#/plan">15 күндік жоспар</a> · <a href="#/express">Ағылшын: жедел</a>' +
      ' · <label class="today__nm"><input type="checkbox" id="tdMath"' + (noMath() ? " checked" : "") + '> ТГО математикасыз</label></p></section>';
  };
  Shyn.todayBind = function (root) {
    var sv = root.querySelector("#tdSave"); if (sv) sv.addEventListener("click", function () { var v = root.querySelector("#tdDate").value; if (v) { Store.set("examDate", v); Shyn.go("#/"); } });
    var tp = root.querySelector("#tdPlan"); if (tp) tp.addEventListener("click", function () { Shyn.planStart(); Shyn.go("#/"); });
    var nm = root.querySelector("#tdMath"); if (nm) nm.addEventListener("change", function () { Store.set("tgoNoMath", nm.checked); Shyn._keepScroll = true; Shyn.go("#/"); });
    U.on("[data-td]", "click", function (e, el) { var x = (Shyn._todayItems || [])[+el.getAttribute("data-td")]; if (x) x.run(); }, root);
    U.on("[data-chk]", "change", function (e, el) { CHK[el.getAttribute("data-chk")] = el.checked; saveChk(); }, root);
    var rv = root.querySelector("[data-tdrev]"); if (rv) rv.addEventListener("click", function () { Shyn.go("#/mistakes"); });
  };
})(window);
