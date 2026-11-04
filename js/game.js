/* Шың — ойын механикасы: XP және деңгейлер, жетістіктер, күнделікті тапсырмалар, күн сұрағы,
   блиц, сериялық «мұз», белсенділік картасы, нәтижемен бөлісу. Барлығы localStorage-та. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, Store = Shyn.Store;
  var view = document.getElementById("view");
  var KEY = "shyn_game";
  var G;
  try { G = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { G = {}; }
  ["ach", "xpDays", "frozen", "c", "labs", "qotd"].forEach(function (k) { G[k] = G[k] || {}; });
  G.xp = G.xp || 0; G.freezes = G.freezes || 0; G.blitzBest = G.blitzBest || 0;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} }
  function today() { return U.dayKey(); }
  function dayOff(n) { var d = new Date(); d.setDate(d.getDate() + n); return U.dayKey(d); }
  function cnt(k) { return G.c[k] || 0; }
  function reduced() { return global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- Деңгейлер: таудың етегінен шыңына дейін ---------- */
  var LEVELS = ["Етек", "Сай", "Беткей", "Қырат", "Белес", "Асу", "Жота", "Құз", "Мұзарт", "Шың"];
  function need(L) { return 75 * L * (L - 1); } // L-деңгейге жету үшін жалпы XP: 0, 150, 450, 900, 1500…
  function levelOf(xp) {
    var L = 1; while (xp >= need(L + 1)) L++;
    var name = L <= 10 ? LEVELS[L - 1] : "Шың " + (L - 9);
    return { n: L, name: name, from: need(L), to: need(L + 1), pct: Math.round((xp - need(L)) / (need(L + 1) - need(L)) * 100) };
  }
  var GOAL = 100; // күнделікті XP мақсаты

  /* ---------- Жетістіктер ---------- */
  var ACH = [
    ["first", "Алғашқы қадам", "Бірінші сұраққа жауап бер", "1", function () { return [cnt("answers"), 1]; }],
    ["a100", "Жүздік", "100 сұраққа жауап бер", "100", function () { return [cnt("answers"), 100]; }],
    ["a500", "Бес жүз", "500 сұраққа жауап бер", "500", function () { return [cnt("answers"), 500]; }],
    ["a1000", "Мыңдық", "1000 сұраққа жауап бер", "1K", function () { return [cnt("answers"), 1000]; }],
    ["test1", "Бірінші жиынтық", "Кез келген жиынтықты соңына дейін тапсыр", "Т", function () { return [cnt("tests"), 1]; }],
    ["test10", "Он жиынтық", "10 жиынтықты аяқта", "10", function () { return [cnt("tests"), 10]; }],
    ["perfect", "Мінсіз", "Жиынтықты 100% нәтижемен тапсыр", "%", function () { return [cnt("perfect"), 1]; }],
    ["s3", "Үш күн қатар", "3 күн қатарынан оқы", "3", function () { return [Store.streak(), 3]; }],
    ["s7", "Апталық серия", "7 күн қатарынан оқы", "7", function () { return [Store.streak(), 7]; }],
    ["s30", "Темір ерік", "30 күн қатарынан оқы", "30", function () { return [Store.streak(), 30]; }],
    ["b10", "Найзағай", "Бір блицте 10 дұрыс жауап", "⚡", function () { return [G.blitzBest, 10]; }],
    ["b20", "Дауыл", "Бір блицте 20 дұрыс жауап", "⚡⚡", function () { return [G.blitzBest, 20]; }],
    ["sql5", "SQL шәкірті", "5 SQL тапсырмасын шеш", "SQL", function () { return [sqlDone(), 5]; }],
    ["sqlall", "SQL шебері", "21 SQL тапсырмасының бәрін шеш", "DB", function () { return [sqlDone(), 21]; }],
    ["lab", "Зерттеуші", "Зертхананың 10 құралының бәрін аш", "Z", function () { return [Object.keys(G.labs).length, 10]; }],
    ["cards50", "Карточкашы", "50 карточканы белгіле", "К", function () { return [cnt("cards"), 50]; }],
    ["lesson5", "Ағылшынша бес сабақ", "Грамматика курсынан 5 сабақ өт", "En", function () { return [cnt("lesson"), 5]; }],
    ["video1", "Бірінші сабақ", "Бір видеосабақты соңына дейін көр", "▶", function () { return [cnt("video"), 1]; }],
    ["video20", "Киносүйер", "20 видеосабақты көр", "▶20", function () { return [cnt("video"), 20]; }],
    ["qotd7", "Күн сұрағы ×7", "7 күн сұрағына жауап бер", "?", function () { return [cnt("qotd"), 7]; }],
    ["chest1", "Алғашқы сандық", "Бір күннің барлық тапсырмасын орында", "★", function () { return [cnt("chests"), 1]; }],
    ["chest7", "Апта батыры", "7 күн барлық тапсырманы орында", "★7", function () { return [cnt("chests"), 7]; }],
    ["night", "Түнгі үкі", "Сағат 23:00-тен кейін жаттығу жаса", "☾", function () { return [cnt("night"), 1]; }],
    ["early", "Ерте тұрған", "Таңғы 7:00-ге дейін жаттығу жаса", "☀", function () { return [cnt("early"), 1]; }],
    ["back", "Қайта оралдым", "3 күннен көп үзілістен кейін қайта кел", "↺", function () { return [cnt("back"), 1]; }],
    ["lvl5", "Асудан өттім", "5-деңгейге жет (Белес)", "L5", function () { return [levelOf(G.xp).n, 5]; }],
    ["lvl10", "Шыңға шықтым", "10-деңгейге жет (Шың)", "▲", function () { return [levelOf(G.xp).n, 10]; }]
  ];
  function sqlDone() { try { return Object.keys(JSON.parse(localStorage.getItem("shyn_sql_done") || "{}")).length; } catch (e) { return 0; } }
  function checkAch() {
    ACH.forEach(function (a) {
      if (G.ach[a[0]]) return;
      var p = a[4]();
      if (p[0] >= p[1]) { G.ach[a[0]] = Date.now(); save(); pop("ach", "Жетістік ашылды", a[1], a[3]); }
    });
  }

  /* ---------- Күнделікті тапсырмалар ---------- */
  var QPOOL = {
    answers: [function (n) { return n + " сұраққа жауап бер"; }, [15, 20, 25], 30],
    correct: [function (n) { return n + " дұрыс жауап жина"; }, [8, 10, 12], 30],
    blitz: [function () { return "Блиц ойнап шық"; }, [1], 25],
    qotd: [function () { return "Күн сұрағына жауап бер"; }, [1], 20],
    cards: [function (n) { return n + " карточканы қара"; }, [10], 20],
    sql: [function () { return "Бір SQL тапсырмасын шеш"; }, [1], 30],
    lesson: [function () { return "Бір ағылшын сабағын өт"; }, [1], 25],
    test: [function () { return "Бір жиынтықты соңына дейін тапсыр"; }, [1], 40],
    labtool: [function (n) { return "Зертханадағы " + n + " құралды аш"; }, [2], 20],
    video: [function () { return "Бір видеосабақты соңына дейін көр"; }, [1], 30]
  };
  function rng(seed) { var x = 0; for (var i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function quests() {
    var d = today();
    if (!G.q || G.q.day !== d) {
      var r = rng("q" + d), keys = Object.keys(QPOOL), pick = [];
      while (pick.length < 3) { var k = keys[Math.floor(r() * keys.length)]; if (pick.indexOf(k) < 0 && !(k === "test" && pick.indexOf("answers") >= 0)) pick.push(k); }
      // Бірінші тапсырма бірден орындалған — бастаған істі аяқтағысы келеді (endowed progress)
      G.q = { day: d, chest: false, list: [{ k: "visit", goal: 1, prog: 1, xp: 10, done: true }].concat(pick.map(function (k) { var opt = QPOOL[k][1]; return { k: k, goal: opt[Math.floor(r() * opt.length)], prog: 0, xp: QPOOL[k][2], done: false }; })) };
      save();
    }
    return G.q;
  }
  function qTitle(x) { return x.k === "visit" ? "Сайтқа кір" : QPOOL[x.k][0](x.goal); }
  function bumpQuest(k, n) {
    var Q = quests(), changed = false;
    Q.list.forEach(function (x) {
      if (x.k !== k || x.done) return;
      x.prog = Math.min(x.goal, x.prog + n); changed = true;
      if (x.prog >= x.goal) { x.done = true; addXP(x.xp, true); pop("quest", "Тапсырма орындалды", qTitle(x) + " · +" + x.xp + " XP", "✓"); }
    });
    if (changed && !Q.chest && Q.list.every(function (x) { return x.done; })) {
      Q.chest = true; G.c.chests = cnt("chests") + 1; addXP(100, true);
      if (G.freezes < 2 && cnt("chests") % 3 === 0) { G.freezes++; }
      pop("chest", "Күннің сандығы ашылды!", "Барлық тапсырма орындалды · +100 XP", "★"); confetti();
    }
    if (changed) save();
  }

  /* ---------- XP ---------- */
  function addXP(n, silent) {
    if (!n) return;
    var before = levelOf(G.xp).n;
    G.xp += n; G.xpDays[today()] = (G.xpDays[today()] || 0) + n;
    var after = levelOf(G.xp);
    if (after.n > before) { pop("lvl", "Жаңа деңгей: " + after.n, after.name + " — " + (after.n >= 10 ? "сен шыңдасың!" : "келесі белеске дейін " + (after.to - G.xp) + " XP"), "▲"); confetti(); }
    var dx = G.xpDays[today()];
    if (dx >= GOAL && dx - n < GOAL) { pop("goal", "Күнделікті мақсат орындалды", GOAL + " XP жиналды. Ертең де кел — серия үзілмесін!", "◎"); if (!silent) confetti(); }
    save(); paintMini();
  }
  function event(kind, n, xp) {
    n = n || 1;
    G.c[kind] = cnt(kind) + n;
    var h = new Date().getHours();
    if (kind === "answers") { if (h >= 23 || h < 4) G.c.night = cnt("night") + 1; if (h >= 4 && h < 7) G.c.early = cnt("early") + 1; }
    if (xp) addXP(xp, true);
    bumpQuest(kind, n);
    save(); checkAch();
  }

  /* ---------- Дүкен API-ін «тыңдау» ---------- */
  var rl = Store.recordLearning;
  Store.recordLearning = function (q, res) {
    rl.apply(Store, arguments);
    if (!q || q.missing) return;
    var ok = res.state === "correct";
    event("answers", 1, ok ? 10 : res.state === "partial" ? 5 : 2);
    if (ok) event("correct", 1);
  };
  var rr = Store.recordResult;
  Store.recordResult = function (r) {
    rr.apply(Store, arguments);
    var pct = r.max ? r.got / r.max : 0;
    if (r.max && r.got === r.max) G.c.perfect = cnt("perfect") + 1;
    G.c.tests = cnt("tests") + 1; bumpQuest("test", 1);
    addXP(20 + (pct >= .7 ? 30 : 0));
    if (pct >= .9) confetti();
    save(); checkAch();
  };
  var sc = Store.setCard;
  Store.setCard = function () { sc.apply(Store, arguments); event("cards", 1, 2); };
  var origStreak = Store.streak;
  Store.streak = function () {
    var n = 0, d = new Date(), days = Store.days();
    var on = function (x) { var k = U.dayKey(x); return days[k] || G.frozen[k]; };
    if (!on(d)) d.setDate(d.getDate() - 1);
    while (on(d)) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };

  /* Ашылғанда: үзіліс, мұз және «қайта оралу» */
  (function onOpen() {
    var days = Store.days(), keys = Object.keys(days).sort(), last = keys.length ? keys[keys.length - 1] : null;
    var y = dayOff(-1), yy = dayOff(-2);
    if (last && !days[y] && !G.frozen[y] && (days[yy] || G.frozen[yy]) && G.freezes > 0) {
      G.frozen[y] = 1; G.freezes--; save();
      setTimeout(function () { pop("freeze", "Серия сақталды", "Кеше оқымадың, бірақ мұз серияңды құтқарды. Қалды: " + G.freezes, "❄"); }, 1200);
    }
    if (last && last !== today()) {
      var gap = Math.round((new Date(today()) - new Date(last)) / 86400000);
      if (gap >= 3) { G.c.back = cnt("back") + 1; G.comeback = { day: today(), gap: gap }; save(); }
    }
    quests();
  })();

  /* ---------- Хабарламалар және конфетти ---------- */
  var stack;
  function pop(kind, title, text, mark) {
    if (!stack) { stack = document.createElement("div"); stack.className = "gpops"; stack.setAttribute("aria-live", "polite"); document.body.appendChild(stack); }
    var el = document.createElement("div"); el.className = "gpop gpop--" + kind;
    el.innerHTML = '<span class="gpop__m">' + esc(mark) + '</span><span><b>' + esc(title) + '</b><small>' + esc(text) + '</small></span>';
    while (stack.children.length >= 3) stack.firstChild.remove();
    stack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () { el.classList.remove("is-in"); setTimeout(function () { el.remove(); }, 400); }, 4200);
  }
  function confetti() {
    if (reduced()) return;
    var c = document.createElement("canvas"); c.className = "confetti"; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    var x = c.getContext("2d"), P = [], cols = ["#D6981C", "#0B6E79", "#3CB2BC", "#F6D48A", "#2B8650", "#E5677A"];
    for (var i = 0; i < 140; i++) P.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function f(t) {
      x.clearRect(0, 0, c.width, c.height);
      P.forEach(function (p) { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (t - t0 < 2600) requestAnimationFrame(f); else c.remove();
    })(t0);
  }

  /* ---------- Күн сұрағы ---------- */
  function simpleQ(q) { return !q.missing && !q.multi && !q.passage && !q.audio && !q.code && q.q.length < 220 && q.opts.every(function (o) { return o.t.length < 90; }); }
  var pool;
  function blitzPool() { if (!pool) pool = Shyn.allQuestions().filter(simpleQ); return pool; }
  function qotd() {
    var P = blitzPool(); if (!P.length) return null;
    var r = rng("d" + today()), q = P[Math.floor(r() * P.length)];
    return q;
  }

  /* ---------- Басты бет блогы ---------- */
  function ring(pct, label) {
    var R = 34, C = 2 * Math.PI * R, off = C * (1 - Math.min(1, pct));
    return '<svg class="gring" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="' + R + '" class="gring__bg"/><circle cx="42" cy="42" r="' + R + '" class="gring__fg" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><span class="gring__t">' + label + '</span>';
  }
  Shyn.Game = {
    state: G, levelOf: levelOf, event: event, addXP: addXP, confetti: confetti, pop: pop, quests: quests, qTitle: qTitle, ACH: ACH,
    lab: function (sub) { if (!sub || G.labs[sub]) return; G.labs[sub] = 1; save(); bumpQuest("labtool", 1); checkAch(); },
    homeHTML: function () {
      var lv = levelOf(G.xp), dx = G.xpDays[today()] || 0, Q = quests(), done = Q.list.filter(function (x) { return x.done; }).length, q = qotd(), st = Store.streak();
      var qd = G.qotd[today()];
      var back = G.comeback && G.comeback.day === today() && !G.comebackSeen ? '<div class="gback"><b>Қайта келгеніңе қуаныштымыз!</b> ' + G.comeback.gap + ' күн үзіліс болды. Бастау үшін ең оңай жол — 60 секундтық блиц: ойнап көр, сосын бір жиынтыққа көшесің. <a class="btn btn--gold" href="#/blitz">Блицті бастау</a></div>' : "";
      return back + '<section class="gday">' +
        '<a class="glevel" href="#/me" aria-label="Жетістіктер мен деңгей">' +
          '<span class="glevel__badge"><b>' + lv.n + '</b></span>' +
          '<span class="glevel__t"><small>Деңгей</small><b>' + esc(lv.name) + '</b><span class="gbar"><i style="width:' + lv.pct + '%"></i></span><small>' + G.xp + ' / ' + lv.to + ' XP · жетістіктер ' + Object.keys(G.ach).length + ' / ' + ACH.length + '</small></span></a>' +
        '<div class="ggoal">' + ring(dx / GOAL, '<b>' + dx + '</b><small>/ ' + GOAL + ' XP</small>') + '<div><b>Бүгінгі мақсат</b><small>' + (dx >= GOAL ? "Орындалды. Керемет!" : "Тағы " + (GOAL - dx) + " XP — шамамен " + Math.ceil((GOAL - dx) / 10) + " дұрыс жауап") + '</small><small class="gstreak">Серия: <b>' + st + '</b> күн' + (G.freezes ? ' · ❄ ' + G.freezes : "") + '</small></div></div>' +
        '<div class="gquests"><div class="gquests__h"><b>Күнделікті тапсырмалар</b><span>' + done + ' / ' + Q.list.length + '</span></div><span class="gbar gbar--q"><i style="width:' + Math.round(done / Q.list.length * 100) + '%"></i></span>' +
          '<ul>' + Q.list.map(function (x) {
            return '<li class="' + (x.done ? "is-done" : "") + '"><span class="gchk" aria-hidden="true"></span><span class="gq__t">' + esc(qTitle(x)) + (x.goal > 1 && !x.done ? ' <small>' + x.prog + '/' + x.goal + '</small>' : "") + '</span><span class="gq__xp">+' + x.xp + '</span></li>';
          }).join("") + '</ul><p class="gchest' + (Q.chest ? " is-open" : "") + '">' + (Q.chest ? "★ Сандық ашылды: +100 XP" : "Бәрін орындасаң — сандық: +100 XP") + '</p></div>' +
      '</section>';
    },
    qotdHTML: function () {
      var q = qotd(), qd = G.qotd[today()]; if (!q) return "";
      return '<section class="block">' +
        (true ? '<div class="gqotd" id="qotd"><div class="gqotd__h"><b>Күн сұрағы</b><span>' + esc(Shyn.SUBJECT[q._subject].short) + ' · ' + esc(q.topic || "") + '</span></div><p class="gqotd__q">' + Shyn.fmt(q.q) + '</p>' +
          '<div class="gqotd__o">' + q.opts.map(function (o) { var cls = qd ? (q.correct.indexOf(o.l) >= 0 ? " is-ok" : qd.sel === o.l ? " is-no" : "") : ""; return '<button class="gopt' + cls + '" data-qo="' + o.l + '"' + (qd ? " disabled" : "") + '><b>' + o.l + '</b>' + Shyn.fmt(o.t) + '</button>'; }).join("") + '</div>' +
          '<div id="qotdEx">' + (qd ? exHTML(q, qd.ok) : '<p class="muted small">Бір рет жауап беруге болады · дұрыс болса +20 XP</p>') + '</div></div>' : "")  +
      '</section>';
    },
    bindHome: function () {
      if (G.comeback && G.comeback.day === today()) { G.comebackSeen = true; save(); }
      var q = qotd(); if (!q) return;
      U.on("[data-qo]", "click", function (e, el) {
        if (G.qotd[today()]) return;
        var sel = el.getAttribute("data-qo"), r = Shyn.Score.question(q, [sel]), ok = r.state === "correct";
        G.qotd[today()] = { sel: sel, ok: ok }; save();
        Store.recordLearning(q, r, "", "");
        G.c.qotd = cnt("qotd") + 1; addXP(ok ? 20 : 5, !ok); bumpQuest("qotd", 1); checkAch();
        if (ok) confetti();
        U.$$("[data-qo]").forEach(function (b) { var l = b.getAttribute("data-qo"); b.disabled = true; if (q.correct.indexOf(l) >= 0) b.classList.add("is-ok"); else if (l === sel) b.classList.add("is-no"); });
        U.$("#qotdEx").innerHTML = exHTML(q, ok);
      }, U.$("#qotd"));
    }
  };
  function exHTML(q, ok) {
    return '<p class="labres ' + (ok ? "is-ok" : "is-no") + '">' + (ok ? "Дұрыс! +20 XP" : "Дұрыс жауап: " + q.correct.join(", ") + ". Ертең жаңа сұрақ келеді.") + '</p>' + (q.ex ? '<p class="gex">' + Shyn.fmt(q.ex) + '</p>' : "");
  }
  function paintMini() {
    var m = document.getElementById("railXP"); if (!m) return;
    var lv = levelOf(G.xp); m.innerHTML = '<span class="rxp__b">' + lv.n + '</span><span class="rxp__t"><b>' + esc(lv.name) + '</b><span class="gbar"><i style="width:' + lv.pct + '%"></i></span></span>';
  }

  /* ---------- Блиц ---------- */
  var B = null;
  Shyn.route("blitz", function () {
    if (B && B.timer) clearInterval(B.timer);
    B = null;
    view.innerHTML = '<header class="page-head"><h1>Блиц</h1><p class="muted">60 секунд ішінде мүмкіндігінше көп сұраққа жауап бер. Қатарынан 3 дұрыс — комбо ×2, 6 дұрыс — ×3. Қате жауап комбоны нөлдейді. Соңында қателеріңнің түсіндірмесін көресің.</p></header>' +
      '<div class="bstart"><div class="bstart__best"><span>Рекорд</span><b>' + G.blitzBest + '</b></div>' +
      '<div class="seg" role="group" id="bSubj"><button data-bs="" class="is-on">Барлығы</button><button data-bs="algo">Алгоритмдер</button><button data-bs="db">Деректер қоры</button><button data-bs="english">Ағылшын</button></div>' +
      '<button class="btn btn--gold btn--big" id="bGo">Бастау</button></div>';
    var subj = "";
    U.on("[data-bs]", "click", function (e, el) { subj = el.getAttribute("data-bs"); U.$$("[data-bs]").forEach(function (b) { b.classList.toggle("is-on", b === el); }); }, view);
    U.$("#bGo").addEventListener("click", function () { startBlitz(subj); });
  });
  function startBlitz(subj) {
    var P = U.shuffle(blitzPool().filter(function (q) { return !subj || q._subject === subj; }).slice());
    B = { P: P, i: 0, score: 0, right: 0, total: 0, combo: 0, maxCombo: 0, left: 60, wrong: [], subj: subj };
    B.timer = setInterval(function () {
      if (!U.$("#bTime")) { clearInterval(B.timer); return; }
      B.left--; U.$("#bTime").textContent = B.left; U.$("#bClock").style.setProperty("--p", B.left / 60);
      if (B.left <= 10) U.$("#bClock").classList.add("is-low");
      if (B.left <= 0) endBlitz();
    }, 1000);
    drawBlitz();
  }
  function drawBlitz() {
    var q = B.P[B.i % B.P.length], mult = B.combo >= 6 ? 3 : B.combo >= 3 ? 2 : 1;
    view.innerHTML = '<section class="blitz"><div class="blitz__top"><div class="bclock" id="bClock" style="--p:' + B.left / 60 + '"><span id="bTime">' + B.left + '</span></div>' +
      '<div class="bscore"><small>Ұпай</small><b id="bScore">' + B.score + '</b></div><div class="bcombo' + (mult > 1 ? " is-hot" : "") + '"><small>Комбо</small><b>×' + mult + '</b><span>' + B.combo + ' қатар</span></div></div>' +
      '<div class="bq"><span class="bq__t">' + esc(Shyn.SUBJECT[q._subject].short) + ' · ' + esc(q.topic || "") + '</span><p>' + Shyn.fmt(q.q) + '</p></div>' +
      '<div class="bopts">' + U.shuffle(q.opts.slice()).map(function (o) { return '<button class="gopt" data-bo="' + o.l + '">' + Shyn.fmt(o.t) + '</button>'; }).join("") + '</div></section>';
    U.on("[data-bo]", "click", function (e, el) {
      if (B.lock) return; B.lock = true;
      var sel = el.getAttribute("data-bo"), r = Shyn.Score.question(q, [sel]), ok = r.state === "correct";
      Store.recordLearning(q, r, "", "");
      B.total++;
      if (ok) { B.right++; B.combo++; B.maxCombo = Math.max(B.maxCombo, B.combo); B.score += (B.combo >= 6 ? 3 : B.combo >= 3 ? 2 : 1); el.classList.add("is-ok"); }
      else { B.combo = 0; B.wrong.push({ q: q, sel: sel }); el.classList.add("is-no"); U.$$("[data-bo]").forEach(function (b) { if (q.correct.indexOf(b.getAttribute("data-bo")) >= 0) b.classList.add("is-ok"); }); }
      setTimeout(function () { B.lock = false; if (B.left > 0) { B.i++; drawBlitz(); } }, ok ? 260 : 900);
    }, view);
  }
  function endBlitz() {
    clearInterval(B.timer); B.timer = null;
    var rec = B.right > G.blitzBest; if (rec) G.blitzBest = B.right;
    G.c.blitz = cnt("blitz") + 1; save();
    addXP(B.right * 3 + (rec ? 20 : 0), true); bumpQuest("blitz", 1); checkAch();
    if (rec && B.right >= 3) confetti();
    view.innerHTML = '<section class="bend"><h1>' + (rec && B.right >= 3 ? "Жаңа рекорд!" : "Блиц аяқталды") + '</h1>' +
      '<div class="kpis bend__k"><div class="kpi"><b>' + B.score + '</b><span>ұпай</span></div><div class="kpi"><b>' + B.right + ' / ' + B.total + '</b><span>дұрыс</span></div><div class="kpi"><b>' + B.maxCombo + '</b><span>ең ұзын комбо</span></div><div class="kpi"><b>' + G.blitzBest + '</b><span>рекорд (дұрыс)</span></div></div>' +
      '<p class="muted">+' + (B.right * 3 + (rec ? 20 : 0)) + ' XP. Барлық жауап аралықпен қайталауға жазылды, қателер қателермен жұмыс бөліміне түседі.</p>' +
      '<div class="labform__btns"><button class="btn btn--gold" id="bAgain">Тағы ойнау</button><button class="btn btn--line" id="bShare">Нәтижемен бөлісу</button><a class="btn btn--ghost" href="#/">Басты бет</a></div>' +
      (B.wrong.length ? '<section class="block"><h2>Қателер және түсіндірме</h2>' + B.wrong.map(function (w) {
        var c = w.q.opts.filter(function (o) { return w.q.correct.indexOf(o.l) >= 0; }).map(function (o) { return o.t; }).join("; ");
        var s = (w.q.opts.filter(function (o) { return o.l === w.sel; })[0] || {}).t || "";
        return '<div class="bwrong"><p class="bwrong__q">' + Shyn.fmt(w.q.q) + '</p><p><span class="tone-no">Сенің жауабың: ' + Shyn.fmt(s) + '</span><br><span class="tone-ok">Дұрыс: ' + Shyn.fmt(c) + '</span></p>' + (w.q.ex ? '<p class="gex">' + Shyn.fmt(w.q.ex) + '</p>' : "") + '</div>';
      }).join("") + '</section>' : "") + '</section>';
    U.$("#bAgain").addEventListener("click", function () { startBlitz(B.subj); });
    U.$("#bShare").addEventListener("click", function () { share("blitz", B); });
  }

  /* ---------- Жетістіктер беті ---------- */
  Shyn.route("me", function () {
    var lv = levelOf(G.xp), days = Store.days(), weeks = 20, cells = "";
    var start = new Date(); start.setDate(start.getDate() - weeks * 7 + 1);
    while ((start.getDay() + 6) % 7 !== 0) start.setDate(start.getDate() - 1);
    for (var x = new Date(start); x <= new Date(); x.setDate(x.getDate() + 1)) {
      var k = U.dayKey(x), v = days[k] || 0, lvl = G.frozen[k] ? "f" : v === 0 ? 0 : v < 10 ? 1 : v < 25 ? 2 : v < 50 ? 3 : 4;
      cells += '<i class="hm hm--' + lvl + '" title="' + U.fmtDate(x.getTime()).split(",")[0] + ': ' + (G.frozen[k] ? "мұз" : v + " әрекет") + '"></i>';
    }
    var activeDays = Object.keys(days).length;
    view.innerHTML = '<header class="page-head"><h1>Жетістіктер</h1><p class="muted">Әр дұрыс жауап — 10 XP, жартылай — 5, қате — 2 (қателескеннің өзі оқу). Жиынтық — +20, 70%-дан жоғары болса тағы +30. Күнделікті тапсырмалар мен блиц қосымша XP береді.</p></header>' +
      '<section class="gme"><div class="glevel glevel--big"><span class="glevel__badge"><b>' + lv.n + '</b></span><span class="glevel__t"><small>Деңгей ' + lv.n + '</small><b>' + esc(lv.name) + '</b><span class="gbar"><i style="width:' + lv.pct + '%"></i></span><small>' + G.xp + ' XP · келесі деңгейге ' + (lv.to - G.xp) + ' XP</small></span></div>' +
        '<ol class="gpath">' + LEVELS.map(function (n, i) { return '<li class="' + (i + 1 < lv.n ? "is-past" : i + 1 === lv.n ? "is-now" : "") + '"><span>' + (i + 1) + '</span>' + n + '</li>'; }).join("") + '</ol></section>' +
      '<div class="kpis"><div class="kpi"><b>' + Store.streak() + '</b><span>күн қатар</span></div><div class="kpi"><b>' + activeDays + '</b><span>белсенді күн</span></div><div class="kpi"><b>' + cnt("answers") + '</b><span>жауап</span></div><div class="kpi"><b>' + G.blitzBest + '</b><span>блиц рекорды</span></div><div class="kpi"><b>❄ ' + G.freezes + '</b><span>серия мұзы</span></div></div>' +
      '<p class="labnote">Серия мұзы бір күн өткізіп алсаң, серияны сақтайды. Әр 3-ші сандық ашылғанда біреуі беріледі (ең көбі 2).</p>' +
      '<section class="block"><h2>Белсенділік картасы</h2><div class="hmwrap"><div class="hmap">' + cells + '</div></div><p class="muted small">Соңғы ' + weeks + ' апта. Күңгірт — оқымаған күн, ашық жасыл — көп оқыған күн, көк — мұз.</p></section>' +
      '<section class="block"><h2>Жетістіктер · ' + Object.keys(G.ach).length + ' / ' + ACH.length + '</h2><div class="gach">' + ACH.map(function (a) {
        var p = a[4](), got = G.ach[a[0]];
        return '<div class="gbadge' + (got ? " is-got" : "") + '"><span class="gbadge__m">' + esc(a[3]) + '</span><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small>' + (got ? '<small class="gbadge__d">' + U.fmtDate(got).split(",")[0] + '</small>' : '<span class="gbar"><i style="width:' + Math.min(100, Math.round(p[0] / p[1] * 100)) + '%"></i></span><small>' + Math.min(p[0], p[1]) + ' / ' + p[1] + '</small>') + '</div>';
      }).join("") + '</div></section>' +
      '<section class="block"><h2>Бөлісу</h2><p class="muted">Прогресіңнің суретін жасап, достарыңа жібер — бірге дайындалу оңайырақ.</p><button class="btn btn--gold" id="meShare">Прогресс суретін жасау</button></section>';
    U.$("#meShare").addEventListener("click", function () { share("me"); });
  });

  /* ---------- Бөлісу суреті ---------- */
  function share(kind, b) {
    var c = document.createElement("canvas"); c.width = 1080; c.height = 1350; var x = c.getContext("2d"), lv = levelOf(G.xp);
    var g = x.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, "#15233F"); g.addColorStop(1, "#0A1222"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    x.strokeStyle = "#D6981C"; x.lineWidth = 8; x.lineJoin = "round"; x.beginPath(); x.moveTo(90, 500); x.lineTo(300, 270); x.lineTo(400, 380); x.lineTo(520, 250); x.lineTo(760, 500); x.stroke();
    x.fillStyle = "#D6981C"; x.beginPath(); x.moveTo(520, 250); x.lineTo(560, 294); x.lineTo(480, 294); x.closePath(); x.fill();
    var F = function (w, s) { return w + " " + s + "px Unbounded, Onest, 'Segoe UI', sans-serif"; };
    x.fillStyle = "#F6D48A"; x.font = F(700, 64); x.fillText("Шың", 90, 150);
    x.fillStyle = "#95A5BA"; x.font = F(500, 34); x.fillText("магистратураға дайындық", 90, 205);
    var rows = kind === "blitz" ? [["Блиц: дұрыс жауап", b.right + " / " + b.total], ["Ұпай", b.score], ["Ең ұзын комбо", b.maxCombo], ["Рекорд", G.blitzBest]]
      : [["Деңгей", lv.n + " · " + lv.name], ["Серия", Store.streak() + " күн"], ["Жауап берілді", cnt("answers")], ["Жетістіктер", Object.keys(G.ach).length + " / " + ACH.length]];
    x.fillStyle = "#FFFFFF"; x.font = F(700, 76); x.fillText(kind === "blitz" ? "60 секундта" : "Менің прогресім", 90, 640);
    rows.forEach(function (r, i) {
      var y = 760 + i * 120; x.fillStyle = "#95A5BA"; x.font = F(500, 38); x.fillText(r[0], 90, y);
      x.fillStyle = "#D6981C"; x.font = F(700, 56); x.textAlign = "right"; x.fillText(String(r[1]), 990, y + 4); x.textAlign = "left";
      x.fillStyle = "#263856"; x.fillRect(90, y + 34, 900, 2);
    });
    x.fillStyle = "#3CB2BC"; x.font = F(600, 36); x.fillText("dani09934.github.io/shyn-magistratura", 90, 1270);
    c.toBlob(function (blob) {
      var file = global.File ? new File([blob], "shyn-progress.png", { type: "image/png" }) : null;
      var text = kind === "blitz" ? "Блицте 60 секундта " + b.right + " дұрыс жауап бердім. Сен қаншасын шешесің?" : "Магистратураға Шыңда дайындалып жүрмін: " + lv.name + " деңгейі, " + Store.streak() + " күн қатар.";
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: text + " https://dani09934.github.io/shyn-magistratura/" }).catch(function () {});
      } else {
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "shyn-progress.png"; document.body.appendChild(a); a.click(); a.remove();
        U.toast("Сурет жүктелді — оны Instagram немесе WhatsApp-қа жібер");
      }
    }, "image/png");
  }
  Shyn.Game.share = share;

  /* ---------- Бүйірлік мәзірдегі шағын деңгей белгісі ---------- */
  function mountRail() {
    var rail = document.querySelector(".rail .brand"); if (!rail || document.getElementById("railXP")) return;
    var a = document.createElement("a"); a.href = "#/me"; a.id = "railXP"; a.className = "rxp"; a.setAttribute("aria-label", "Деңгей және жетістіктер");
    rail.insertAdjacentElement("afterend", a); paintMini();
  }
  mountRail();
  setTimeout(checkAch, 1500);
})(window);
