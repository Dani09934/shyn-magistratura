/* Шың — емтиханға дейінгі 15 күндік интенсив жоспар.
   Күн емтихан күнінен саналады (баптауларда белгіленсе), әйтпесе «Бастау» басылған күннен.
   Тест тапсырмалары тарихтағы нәтиже бойынша өздігінен белгіленеді, басқалары басқанда. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, esc = U.esc;
  var KEY = "shyn_plan";
  var P; try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { P = {}; }
  P.done = P.done || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  /* 15 күндік интенсив — ҰТО спецификациясы бойынша (алгоритм: 30 сұрақ/60 мин, ДҚ: 20 сұрақ/50 мин, бір не бірнеше жауап).
     Тапсырма түрлері: full, eng, tgo, weak:<пәндер>, mist:20|sure, cheat:<бөлім>, set:<жинақ кілті>,
     t:<пән>:<тақырып regex> — сол тақырыптардан 25 сұрақ (алдымен әлсіз/қате/жаңа). */
  var DAYS = [
    { t: "Бастапқы нүкте", why: "Бір толық сынақ КТ форматында: ағылшын 50, ДҚ 20, алгоритм 30. Қай тақырыптан ұпай кететінін көресің.",
      tasks: [["full", "Толық сынақ: барлық пән, таймермен"], ["cheat:exam", "Шпаргалка: емтихан форматы және спецификация"]] },
    { t: "C тілі: типтер, операторлар, енгізу-шығару", why: "Алгоритм спецификациясының 1–2 тақырыбы (6 сұрақ): типтер, өрнектер, тармақ, цикл, printf форматтары, ығысу операторлары.",
      tasks: [["cheat:algo", "Шпаргалка: C тілі және алгоритмдер"], ["t:algo:C\\/C\\+\\+|Кодты трассир|Алгоритм негіз", "Алгоритм: C тілі және трассировка, 25 сұрақ"], ["t:english:Шақтар", "Ағылшын: шақтар, 25 сұрақ"]] },
    { t: "ДҚ: реляциялық модель, алгебра, тұтастық", why: "ДҚ спецификациясының 1–4 тақырыбы (5 сұрақ): реляциялық алгебра мен есептеулер, тұтастық түрлері, ДҚБЖ архитектурасы.",
      tasks: [["cheat:sql", "Шпаргалка: SQL және ДҚ теориясы"], ["t:db:Реляциялық|ДҚБЖ", "ДҚ: реляциялық модель, архитектура, 25 сұрақ"], ["t:english:Оқылым", "Ағылшын: оқылым, 25 сұрақ"]] },
    { t: "Массив, жол, функция, рекурсия", why: "Алгоритм спецификациясының 3–4 тақырыбы (6 сұрақ): массивті өңдеу, string, функция параметрлері, void, overload, рекурсия.",
      tasks: [["t:algo:Жолдар|Рекурсия|C\\/C\\+\\+", "Алгоритм: массив, жол, функция, рекурсия, 25 сұрақ"], ["t:english:Ырықсыз|Модаль", "Ағылшын: ырықсыз етіс, модальдар, 25 сұрақ"], ["mist:20", "Қателер дәптері: ең қауіпті 20"]] },
    { t: "ДҚ: ER-модель, ФТ, кілттер, байланыстар", why: "ДҚ спецификациясы: ER-диаграмма, функционалдық тәуелділік, әлеуетті және бастапқы кілт, 1:1/1:N/M:N, сыртқы кілт (3 сұрақ).",
      tasks: [["t:db:ER|Нормализация|Реляциялық", "ДҚ: ER, ФТ, кілттер, 25 сұрақ"], ["t:english:Шартты", "Ағылшын: шартты сөйлем, wish, 25 сұрақ"]] },
    { t: "Сұрыптау, іздеу, күрделілік", why: "Алгоритм спецификациясының 5–6 тақырыбы (6 сұрақ): 10 сұрыптау әдісі, екілік іздеу, O(1)…O(n!).",
      tasks: [["t:algo:Сұрыптау|Іздеу|күрделіл", "Алгоритм: сұрыптау, іздеу, күрделілік, 25 сұрақ"], ["t:english:Инфинитив|Сын есім", "Ағылшын: инфинитив/герундий, шырай, 25 сұрақ"]] },
    { t: "Аралық сынақ", why: "Бір апта өтті: екінші толық сынақ және апта бойы жинақталған қателер.",
      tasks: [["full", "Толық сынақ №2"], ["mist:20", "Қателер дәптері: ең қауіпті 20"]] },
    { t: "SQL: SELECT, сүзгі, агрегат, топтау", why: "ДҚ спецификациясының ең көп бөлігі (6 сұрақ): WHERE, LIKE, IN, BETWEEN, NULL, агрегаттар, GROUP BY, HAVING, ORDER BY, бірнеше кесте.",
      tasks: [["t:db:SQL", "ДҚ: SQL сұраныстары, 25 сұрақ"], ["t:english:Артикль|Предлог|Есімдік", "Ағылшын: артикль, предлог, есімдік, 25 сұрақ"]] },
    { t: "Сызықтық құрылымдар және хештеу", why: "Алгоритм спецификациясының 7–8 тақырыбы (6 сұрақ, көбі C деңгейі): стек, кезек, тізімдер; хеш-кесте, соқтығыс: тізбек, сызықтық/квадраттық зондтау, қос хеш.",
      tasks: [["t:algo:Деректер құрылым|Хештеу", "Алгоритм: стек, кезек, тізім, хеш, 25 сұрақ"], ["t:english:Лексика|сөйлем құрылысы", "Ағылшын: лексика және сөйлем құрылысы, 25 сұрақ"]] },
    { t: "Ішкі және байланысқан SQL, DDL/DML", why: "ДҚ спецификациясының C деңгейі (2 сұрақ): ішкі сұраныстар, EXISTS, корреляцияланған сұраныс; CREATE, INSERT, UPDATE, DELETE.",
      tasks: [["t:db:SQL|Индекс|Транзакц", "ДҚ: ішкі сұраныс, DDL/DML, 25 сұрақ"], ["eng", "Ағылшын: толық нұсқа, 50 сұрақ"]] },
    { t: "Ағаштар және үймелер", why: "Алгоритм спецификациясының 9 тақырыбы (3 сұрақ, 2-еуі C): BST, AVL, қызыл-қара ағаш, өрнек ағашы, екілік үйме.",
      tasks: [["t:algo:Ағаштар", "Алгоритм: ағаштар мен үймелер, 25 сұрақ"], ["t:db:Нормализация|ER", "ДҚ: нормализация және жобалау, 25 сұрақ"]] },
    { t: "Графтар және динамикалық бағдарламалау", why: "Алгоритм спецификациясының 10 тақырыбы (3 сұрақ): BFS, DFS, Дейкстра, Беллман–Форд, Флойд, Прим, Краскал; қапшық есебі.",
      tasks: [["t:algo:Графтар|Рекурсия", "Алгоритм: графтар, ДБ, 25 сұрақ"], ["set:v92-algo", "Интенсив: спецификацияда бар, қорда аз тақырыптар (алгоритм)"], ["set:v92-db", "Интенсив: спецификацияда бар, қорда аз тақырыптар (ДҚ)"]] },
    { t: "Бас репетиция", why: "Үшінші толық сынақ — нақты емтихандай: бір отырыста, телефонсыз. 1-күнмен салыстыр.",
      tasks: [["full", "Толық сынақ №3"], ["eng", "Ағылшын: тағы бір толық нұсқа"]] },
    { t: "Қателерді жабу", why: "Барлық қателер мен әлсіз тақырыптар. Жаңа тақырып ашпа.",
      tasks: [["mist:20", "Қателер дәптері: ең қауіпті 20"], ["weak:algo,db", "Алгоритм + ДҚ: әлсіз тақырыптар 25"], ["weak:english", "Ағылшын: әлсіз тақырыптар 20"]] },
    { t: "Жеңіл қайталау", why: "Емтихан алдындағы күн: тек шпаргалкалар мен сенімді болып қателескен сұрақтар. Ерте ұйықта.",
      tasks: [["mist:sure", "Сенімді болып қателескендер"], ["cheat:trap", "Шпаргалка: жиі кездесетін тұзақтар"], ["cheat:exam", "Емтихан күнгі ережелер"]] }
  ];
  var N = DAYS.length;

  function dayKey(d) { return U.dayKey(d || new Date()); }
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
  // Қай күн: 1..N; 0 — әлі басталмады; N+1 — емтихан күні, N+2 — өтіп кетті
  function current() {
    var ex = Store.settings.examDate, today = dayKey();
    if (ex) {
      var left = daysBetween(today, ex);
      if (left <= 0) return { day: left === 0 ? N + 1 : N + 2, left: left, mode: "exam" };
      if (left <= N) return { day: N + 1 - left, left: left, mode: "exam" };
      if (P.start) return { day: Math.min(N, daysBetween(P.start, today) + 1), left: left, mode: "manual" };
      return { day: 0, left: left, mode: "exam" };
    }
    if (P.start) return { day: Math.min(N, daysBetween(P.start, today) + 1), left: null, mode: "manual" };
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
  function topicPool(sub, rx, n) {
    var re = new RegExp(rx, "i");
    var reading = /Оқылым/.test(rx);
    var all = pool([sub]).filter(function (q) { return (reading || (!q.passage && !q.audio)) && (re.test(q.topic || "") || re.test(q.topicFine || "")); });
    if (reading) { // мәтінді сұрақтарды мәтінімен бірге, ретімен береміз: кездейсоқ 2–3 мәтін
      var byP = {}, order = [];
      all.forEach(function (q) { var k = q._set + "|" + (q.passage || q.id).slice(0, 60); if (!byP[k]) { byP[k] = []; order.push(k); } byP[k].push(q); });
      var out = []; U.shuffle(order).forEach(function (k) { if (out.length < n) out = out.concat(byP[k]); });
      return out;
    }
    var due = {}; Store.dueIds().forEach(function (id) { due[id] = 1; });
    var wrong = {}; Store.wrongIds().forEach(function (id) { wrong[id] = 1; });
    return all.map(function (q) { var L = Store.learning(q.id); return { q: q, s: (wrong[q.id] ? 60 : 0) + (due[q.id] ? 40 : 0) + (L ? 0 : 25) + Math.random() * 20 }; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, n).map(function (x) { return x.q; });
  }
  function run(d, i) {
    var k = DAYS[d - 1].tasks[i][0], label = "Жоспар · " + d + "-күн · " + DAYS[d - 1].tasks[i][1], id = scope(d, i), m;
    if ((m = k.match(/^cheat:(.+)$/))) { P.done[id] = Date.now(); save(); Shyn.go("#/cheats/" + m[1]); return; }
    if (k === "full") {
      var ex = Shyn.composeExam(["english", "fundamentals", "algo", "db"]);
      return Shyn.startTest(id, label + " (" + ex.picked.join(", ") + ")", ex.qs, { mode: "exam", secPerQ: 72 });
    }
    if (k === "eng") { var e = randomSet("english"); return Shyn.startTest(id, label + " · нұсқа " + e.variant, e.questions, { mode: "exam", secPerQ: 60 }); }
    if (k === "tgo") { var t = randomSet("fundamentals"); return Shyn.startTest(id, label + " · нұсқа " + t.variant, t.questions, { mode: "practice" }); }
    if ((m = k.match(/^t:(\w+):(.+)$/))) {
      var tq = topicPool(m[1], m[2], 25);
      if (!tq.length) { U.toast("Бұл тақырыпта сұрақ табылмады"); return; }
      return Shyn.startTest(id, label, tq, { mode: "practice" });
    }
    if ((m = k.match(/^set:(.+)$/))) {
      var st = Shyn.sets[m[1]]; if (!st) { U.toast("Жинақ жүктелмеді"); return; }
      return Shyn.startTest(id, label, st.questions, { mode: "practice" });
    }
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
    if (Store.settings.examDate && mode !== "manual") { var x = new Date(Store.settings.examDate + "T12:00:00"); x.setDate(x.getDate() - (N + 1 - d)); date = x.getDate() + " " + U.MONTHS[x.getMonth()]; }
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
    var head = '<header class="page-head"><h1>15 күндік интенсив</h1><p class="muted">Күніне 2–3 сағат. Тақырыптар ҰТО-ның М094 спецификациясы бойынша реттелген: алгоритм — 30 сұрақ (60 мин), деректер қоры — 20 сұрақ (50 мин, бір не бірнеше жауап), ағылшын — 50 сұрақ. Тест тапсырмалары аяқталғанда өздігінен белгіленеді.</p></header>';
    var intro;
    if (c.day === 0) {
      intro = '<section class="block pstart"><div><h2>' + (c.left ? "Емтиханға " + c.left + " күн қалды" : "Жоспар әлі басталған жоқ") + '</h2>' +
        '<p class="muted">' + (c.left ? "Жоспар емтиханға 15 күн қалғанда өздігінен басталады. Қазір бастасаң, бүгін 1-күн болады." : "Баптауларда емтихан күнін белгілесең, жоспар соған қарай күндерге бөлінеді. Немесе дәл қазір бастай аласың.") + '</p></div>' +
        '<div class="inline"><button class="btn btn--primary" id="pGo">Бүгін бастау</button>' + (Store.settings.examDate ? "" : '<a class="btn btn--line" href="#/settings">Емтихан күнін белгілеу</a>') + '</div></section>';
    } else if (c.day > N) {
      intro = '<section class="block pstart"><div><h2>' + (c.day === N + 1 ? "Емтихан бүгін. Сәттілік!" : "Емтихан күні өтіп кетті") + '</h2><p class="muted">' +
        (c.day === N + 1 ? "Таңертең тек шпаргалканы 10 минут қара. Жеке куәлігіңді ұмытпа." : "Жаңа күнді баптауларда белгіле немесе жоспарды қайта баста.") + '</p></div>' +
        '<div class="inline"><a class="btn btn--line" href="#/cheats/exam">Емтихан күнгі ережелер</a>' + (c.day === N + 2 ? '<button class="btn btn--primary" id="pGo">Қайта бастау</button>' : "") + '</div></section>';
    } else intro = "";
    var cur = c.day >= 1 && c.day <= N ? c.day : 0;
    var list = '<ol class="pdays">' + DAYS.map(function (x, i) { return dayHTML(i + 1, cur, c.mode, i + 1 === cur || (!cur && i === 0)); }).join("") + '</ol>';
    view.innerHTML = head + intro + list + (P.start && c.mode === "manual" ? '<p class="muted small pfoot">Жоспар ' + (function (x) { return x.getDate() + " " + U.MONTHS[x.getMonth()]; })(new Date(P.start + "T12:00:00")) + ' басталған. <button class="linkbtn" id="pReset">Басынан бастау</button></p>' : "");
    var go = U.$("#pGo"); if (go) go.addEventListener("click", function () { P.start = dayKey(); P.done = {}; save(); Shyn._keepScroll = true; Shyn.render(); });
    var rs = U.$("#pReset"); if (rs) rs.addEventListener("click", function () { Shyn.ask("Жоспар 1-күннен қайта басталады. Жалғастырасыз ба?", "Басынан бастау", "Болдырмау", function () { P.start = dayKey(); P.done = {}; save(); Shyn.render(); }); });
    U.on("[data-run]", "click", function (e, el) { var a = el.getAttribute("data-run").split(":"); run(+a[0], +a[1]); }, view);
  });

  // Басты бетке шағын блок: бүгінгі күн және келесі тапсырма
  Shyn.planHTML = function () {
    var c = current();
    if (c.day < 1 || c.day > N) {
      if (c.day === 0 && !c.left) return '<section class="block pmini pmini--cta"><div><h2>15 күндік интенсив</h2><p class="muted">М094 спецификациясы бойынша күн сайынғы жоспар: алгоритм, деректер қоры, ағылшын және үш толық сынақ.</p></div><div class="inline"><button class="btn btn--primary" id="pmStart">Бүгін бастау</button><a class="btn btn--line" href="#/plan">Жоспарды көру</a></div></section>';
      if (c.day === 0 && c.left && c.left <= 30) return '<section class="block pmini"><div><h2>Емтиханға ' + c.left + ' күн</h2><p class="muted">15 күндік интенсив ' + (c.left - N) + ' күннен кейін басталады. Қазір де бастауға болады.</p></div><a class="btn btn--line" href="#/plan">Жоспарды көру</a></section>';
      return "";
    }
    var D = DAYS[c.day - 1], next = -1;
    D.tasks.forEach(function (x, i) { if (next < 0 && !isDone(c.day, i)) next = i; });
    return '<section class="block pmini"><div><h2>' + c.day + '-күн / ' + N + ' · ' + esc(D.t) + '</h2><p class="muted">' +
      (next < 0 ? "Бүгінгі жоспар орындалды. Ертең жалғастыр." : "Келесі: " + esc(D.tasks[next][1])) + '</p></div>' +
      '<div class="inline">' + (next >= 0 ? '<button class="btn btn--primary" data-prun="' + c.day + ':' + next + '">Бастау</button>' : "") + '<a class="btn btn--line" href="#/plan">Жоспар</a></div></section>';
  };
  Shyn.planBind = function (root) {
    var st = root.querySelector("#pmStart"); if (st) st.addEventListener("click", function () { P.start = dayKey(); P.done = {}; save(); Shyn.go("#/plan"); });
    U.on("[data-prun]", "click", function (e, el) { var a = el.getAttribute("data-prun").split(":"); run(+a[0], +a[1]); }, root);
  };
})(window);
