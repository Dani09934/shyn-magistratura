/* Шың — «Пән картасы»: әр пәннің КТ-дағы құрылымы бір бетте.
   Әр блок: КТ-да неше сұрақ (М094 спецификациясы), сенің дәлдігің, шамамен жоғалтатын балл, сабақтар, терминдер, жаттығу.
   Сұрақ бірінші сәйкес келген блокқа жатады (pr — тексеру реті: нақтырағы бірінші). */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, Store = Shyn.Store;

  var SPEC = {
    algo: { name: "Алгоритмдер және деректер құрылымы", head: "30 сұрақ · 60 минут · 30 балл", rule: "5 нұсқадан бір дұрыс жауап, дұрыс — 1 балл. Деңгейі: жеңіл A — 9, орташа B — 12, күрделі C — 9. Бір сұраққа ~2 минут.", pts: 1, terms: "algo",
      blocks: [
        { t: "Алгоритмдік тіл, типтер, өрнектер, циклдар", n: 3, pr: 9, rx: /алгоритм негіз|цикл|деректер тип|типтер|өрнек|алгоритмдік тіл|айнымал|тұрақты|c\/c\+\+|c\+\+|бағдарламалау|синтаксис|java/i, fy: ["cpptrace"] },
        { t: "Операторлар, бағдарлама құрылымы, енгізу-шығару", n: 3, pr: 8, rx: /оператор|бағдарлама құрылым|енгізу|шығару|препроцессор|кітапхан|трассиров|функциялар$|файл/i, fy: ["cpptrace"] },
        { t: "Массив, жол, символдарды өңдеу", n: 3, pr: 7, rx: /(^|\| )жолдар|массив|символ|жолдық|көрсеткіш/i, fy: ["ptr"] },
        { t: "Функциялар және рекурсия", n: 3, pr: 6, rx: /функци|рекурс|рекуррент|динамикалық бағдар|ашкөз|алгоритмдік әдіс/i, fy: ["rec", "dp", "greedy"] },
        { t: "Сұрыптау және іздеу", n: 3, pr: 4, rx: /сұрыпта|(^|\| )іздеу|сызықтық іздеу|екілік іздеу$|екілік іздеу \(/i, fy: ["sort", "simplesort", "shellcount", "bsearch"] },
        { t: "Алгоритм күрделілігі", n: 3, pr: 5, rx: /күрделіл|асимпт|тиімділ|амалдар құны/i, fy: ["bigo"] },
        { t: "Сызықтық құрылымдар: тізім, стек, кезек", n: 3, pr: 3, rx: /деректер құрылым|стек|кезек|тізім|дек\b|динамикалық кесте/i, fy: ["stackq", "list"] },
        { t: "Хеш-кестелер", n: 3, pr: 2, rx: /хеш/i, fy: ["hash", "collide"] },
        { t: "Ағаштар және үймелер", n: 3, pr: 1, rx: /ағаш|үйме|heap|avl|қызыл-қара/i, fy: ["bst", "heap", "trav"] },
        { t: "Графтар", n: 3, pr: 0, rx: /граф|дейкстр|прим|крускал|флойд/i, fy: ["graph", "short", "mst", "floyd"] }
      ] },
    db: { name: "Деректер қоры", head: "20 сұрақ · 50 минут · 40 балл", rule: "Жауап бір немесе бірнешеу (≤3). Қатесіз — 2 балл, бір қате — 1, екі қате — 0. Деңгейі: A — 5, B — 9, C — 6. Бір сұраққа ~2,5 минут.", pts: 2, terms: "db",
      blocks: [
        { t: "SQL: сүзгі, агрегат, сұрыптау, топтау, бірнеше кесте, DDL/DML", n: 7, pr: 6, rx: /sql|трассиров|ddl|dml|join|group by|select|предикат|көрініс/i, fy: ["join", "group", "sqlorder", "null", "sqlcmd"] },
        { t: "Ішкі және байланысқан сұраныстар (C деңгейі)", n: 2, pr: 0, rx: /ішкі сұраныс|байланысқан|exists|\bany\b|\ball\b/i, fy: ["sub"] },
        { t: "Деректер тұтастығы, сыртқы кілт", n: 2, pr: 1, rx: /тұтастық|шектеу|сыртқы кілт/i, fy: ["keys", "sqlcmd"] },
        { t: "Нормализация (0–3НФ), денормализация (C)", n: 2, pr: 2, rx: /нормал|қалыпты форм|денормал|аномал/i, fy: ["nf", "fd"] },
        { t: "Реляциялық модель", n: 1, pr: 5, rx: /реляциялық модель|деректер модел|атрибут/i, fy: ["keys"] },
        { t: "ДҚБЖ архитектурасы, SQL Server (C)", n: 2, pr: 7, rx: /архитектур|дқбж|sql server|клиент|үлестірілген|репликац/i, fy: [] },
        { t: "Реляциялық алгебра", n: 1, pr: 3, rx: /алгебра|жиындарға|қиылысу/i, fy: ["relalg"] },
        { t: "ER-модель, байланыстар, жобалау кезеңдері", n: 2, pr: 4, rx: /\ber\b|er-|мән-байланыс|байланыс|мәнділік|жобалау/i, fy: ["er"] },
        { t: "Функционалдық тәуелділік, кілттер", n: 1, pr: 2.5, rx: /функционалдық|кілт/i, fy: ["fd", "keys"] },
        { t: "Транзакциялар, индекстер (спецификацияда аз, бірақ кездеседі)", n: 0, pr: 1.5, rx: /транзакц|бұғат|индекс|оңтайланд|acid|оқшаулау/i, fy: ["acid", "isol", "idx", "view"] }
      ] },
    english: { name: "Ағылшын тілі", head: "50 сұрақ · 50 балл", rule: "Бір дұрыс жауап, 1 балл. Үш бөлім: тыңдалым 16 (2 мәтін × 8), лексика-грамматика 18, оқылым 16 (2 мәтін × 8). Бір сұраққа ~1 минут.", pts: 1, terms: null,
      blocks: [
        { t: "Тыңдалым: 2 мәтін", n: 16, pr: 0, rx: /^тыңдалым/i, fy: [], link: ["#/listen", "Тыңдалым тренажері"] },
        { t: "Оқылым: 2 мәтін", n: 16, pr: 1, rx: /^оқылым/i, fy: ["reading"] },
        { t: "Шақтар", n: 4, pr: 3, rx: /^шақтар/i, fy: ["pp"], approx: 1 },
        { t: "Ырықсыз етіс", n: 2, pr: 3, rx: /^ырықсыз/i, fy: ["pass"], approx: 1 },
        { t: "Модаль етістіктер", n: 2, pr: 3, rx: /^модаль/i, fy: ["modal"], approx: 1 },
        { t: "Шартты сөйлем, рай", n: 2, pr: 3, rx: /^шартты/i, fy: ["cond"], approx: 1 },
        { t: "Инфинитив, герундий, есімше", n: 2, pr: 3, rx: /^инфинитив/i, fy: ["gerinf"], approx: 1 },
        { t: "Артикль, зат есім", n: 1, pr: 3, rx: /^артикль/i, fy: ["art"], approx: 1 },
        { t: "Предлогтар", n: 1, pr: 3, rx: /^предлог/i, fy: ["prep"], approx: 1 },
        { t: "Сын есім, үстеу, шырай", n: 1, pr: 3, rx: /^сын есім/i, fy: [], approx: 1 },
        { t: "Есімдіктер, сан есімдер, лексика, сөйлем құрылысы", n: 3, pr: 4, rx: /./, fy: ["reported"], approx: 1 }
      ] },
    fundamentals: { name: "Оқуға дайындығын анықтау тесті (ТГО)", head: "20 сұрақ · 30 балл", rule: "Аналитикалық ойлау (мәтінмен жұмыс) және математикалық сауаттылық. Бөлімдер арасындағы нақты бөлініс бұл жерде белгісіз — ресми нұсқаулықпен тексеріңіз. Бір сұрақ ~1,5 балл.", pts: 1.5, terms: null,
      blocks: [
        { t: "Мәтіннің тақырыбы, мақсаты, стилі", n: null, pr: 1, rx: /аналитикалық ойлау: (тақырып|мақсат|стиль)/i, fy: ["anatopic"] },
        { t: "Мәтіндегі факт, ой желісі, мәтінмен жұмыс", n: null, pr: 2, rx: /аналитикалық ойлау: (мәтіндегі факт|ой желісі|мәтінмен|факт)/i, fy: ["anafact"] },
        { t: "Сөз мағынасы, бос орынды толтыру", n: null, pr: 3, rx: /аналитикалық ойлау: (сөз мағынасы|бос орын)/i, fy: [] },
        { t: "Сыни ойлау: қорытынды, дәлел, болжам, логикалық қате", n: null, pr: 0, rx: /аналитикалық ойлау: (қорытынды|дәлел|себеп|жасырын|логикалық|силлогизм)/i, fy: [] },
        { t: "Математика: пайыз, үлес", n: null, pr: 4, rx: /математика: пайыз/i, fy: ["pct"], math: 1 },
        { t: "Математика: мәтін есептер, салыстыру, логика", n: null, pr: 5, rx: /математика: (мәтін|шамалар|сандар)/i, fy: ["compare", "word"], math: 1 },
        { t: "Математика: статистика, кесте, диаграмма", n: null, pr: 6, rx: /математика: статист/i, fy: ["stat", "prob"], math: 1 },
        { t: "Математика: теңдеу, геометрия", n: null, pr: 7, rx: /математика: (теңдеу|геометр)/i, fy: ["geom"], math: 1 }
      ] }
  };
  var ORDER = ["algo", "db", "english", "fundamentals"];
  var cache = {};
  function assign(sub) {
    if (cache[sub]) return cache[sub];
    var S = SPEC[sub], B = S.blocks.map(function (b) { return { b: b, qs: [] }; });
    var byPr = B.slice().sort(function (a, b) { return a.b.pr - b.b.pr; });
    Shyn.allQuestions().forEach(function (q) {
      if (q._subject !== sub || q.missing) return;
      var s = (q.topic || "") + " | " + (q.topicFine || "");
      for (var i = 0; i < byPr.length; i++) if (byPr[i].b.rx.test(s)) { byPr[i].qs.push(q); return; }
    });
    return (cache[sub] = B);
  }
  function stat(qs) {
    var a = 0, v = 0; qs.forEach(function (q) { var x = Store.learning(q.id); if (x) { a++; v += x.lastState === "correct" ? 1 : x.lastState === "partial" ? 0.5 : 0; } });
    return { a: a, pct: a ? Math.round(v / a * 100) : null };
  }
  function practice(sub, i) {
    var x = assign(sub)[i], wrong = {}; Store.wrongIds().forEach(function (id) { wrong[id] = 1; });
    var pool = x.qs.filter(function (q) { return sub === "english" || (!q.passage && !q.audio); });
    if (sub === "english" && /тыңдалым|оқылым/i.test(x.b.t)) { // мәтін бойынша: бір мәтіннің барлық сұрақтары
      var g = Shyn._engNext && Shyn._engNext(/тыңдалым/i.test(x.b.t) ? "L" : "R");
      if (g) return Shyn.startTest("map:" + sub + ":" + i + ":" + Date.now(), "Пән картасы · " + x.b.t, g.qs, { mode: "practice" });
    }
    var rank = function (q) { var l = Store.learning(q.id); return (wrong[q.id] ? 3 : !l ? 2 : l.lastState !== "correct" ? 2 : 0) + Math.random(); };
    var qs = pool.slice().sort(function (a, b) { return rank(b) - rank(a); }).slice(0, 15);
    if (!qs.length) { U.toast("Бұл блокта сұрақ жоқ"); return; }
    Shyn.startTest("map:" + sub + ":" + i + ":" + Date.now(), "Пән картасы · " + x.b.t, qs, { mode: "practice" });
  }

  Shyn.route("map", function (args) {
    var sub = args && SPEC[args[0]] ? args[0] : "algo", S = SPEC[sub], B = assign(sub), v = document.getElementById("view");
    var fyById = {}; (Shyn.feynman || []).forEach(function (t) { fyById[t.id] = t; });
    var rows = B.map(function (x, i) {
      var st = stat(x.qs), n = x.b.n;
      var loss = n && st.pct !== null ? n * S.pts * (1 - st.pct / 100) : n ? n * S.pts * 0.7 : null;
      return { i: i, x: x, st: st, loss: loss };
    });
    var prio = rows.filter(function (r) { return r.loss; }).sort(function (a, b) { return b.loss - a.loss; }).slice(0, 3);
    v.innerHTML = '<header class="page-head"><h1>Пән картасы</h1><p class="muted">Әр пән КТ-да қалай құрылған, қай тақырыптан неше сұрақ келеді және сен қай жерде балл жоғалтасың.</p></header>' +
      '<div class="seg map__tabs" role="tablist">' + ORDER.map(function (k) { return '<a role="tab" class="' + (k === sub ? "is-on" : "") + '" href="#/map/' + k + '">' + esc(SPEC[k].name.split(" ")[0] === "Оқуға" ? "ТГО" : SPEC[k].name.split(" ")[0]) + '</a>'; }).join("") + '</div>' +
      '<section class="block map__head"><h2>' + esc(S.name) + '</h2><p class="map__big">' + esc(S.head) + '</p><p>' + esc(S.rule) + '</p>' +
        (prio.length ? '<p class="map__prio"><b>Ең алдымен:</b> ' + prio.map(function (r) { return '<button class="linkbtn" data-mgo="' + r.i + '">' + esc(r.x.b.t) + '</button> (~' + r.loss.toFixed(1) + ' балл)'; }).join(", ") + '</p>' : "") +
        (S.terms ? '<a class="btn btn--line btn--sm" href="#/terms/' + S.terms + '">Терминдер сөздігі</a> ' : "") + '<a class="btn btn--line btn--sm" href="#/cheats/spec">Спецификация</a></section>' +
      '<div class="map__list">' + rows.map(function (r) {
        var b = r.x.b, st = r.st, p = st.pct;
        var fy = (b.fy || []).map(function (id) { return fyById[id] ? '<a class="chip" href="#/explain/' + id + '">' + esc(fyById[id].t) + '</a>' : ""; }).join("");
        return '<article class="map__b' + (b.math && Store.settings.tgoNoMath !== false ? " is-dim" : "") + '" id="mb' + r.i + '">' +
          '<div class="map__bh"><h3>' + esc(b.t) + '</h3><span class="map__n">' + (b.n === null ? "КТ-да: ?" : b.n === 0 ? "КТ-да: сирек" : "КТ-да: " + (b.approx ? "≈" : "") + b.n + " сұрақ") + '</span></div>' +
          '<div class="map__st">' + Shyn.bar(p || 0, Shyn.tone(p || 0)) + '<span>' + (p === null ? "әлі шешілмеген" : p + "% · " + st.a + " сұрақ") + '</span>' +
            (r.loss ? '<span class="map__loss">~' + r.loss.toFixed(1) + ' балл жоғалту</span>' : "") + '</div>' +
          (fy || b.link ? '<div class="map__fy">' + fy + (b.link ? '<a class="chip" href="' + b.link[0] + '">' + esc(b.link[1]) + '</a>' : "") + '</div>' : "") +
          '<div class="map__f"><span class="muted small">Қорда ' + r.x.qs.length + ' сұрақ</span>' + (r.x.qs.length ? '<button class="btn btn--sm btn--line" data-mp="' + r.i + '">Жаттығу · 15</button>' : "") + '</div></article>';
      }).join("") + '</div>' +
      (sub === "english" ? '<p class="muted small">≈ — лексика-грамматика бөлімінің 18 сұрағының тақырыптар бойынша шамамен бөлінісі (нақты нұсқада өзгеруі мүмкін).</p>' : "") +
      (sub === "fundamentals" ? '<p class="muted small">Сұр блоктар — математика («ТГО математикасыз» режимі қосулы). Басты беттегі «Бүгін» тізімінде өзгертуге болады.</p>' : "");
    U.on("[data-mp]", "click", function (e, el) { practice(sub, +el.getAttribute("data-mp")); }, v);
    U.on("[data-mgo]", "click", function (e, el) { var t = document.getElementById("mb" + el.getAttribute("data-mgo")); if (t) { t.scrollIntoView({ behavior: "smooth", block: "center" }); t.classList.add("is-flash"); setTimeout(function () { t.classList.remove("is-flash"); }, 1600); } }, v);
  });
})(window);
