/* Шың — қабық, роутер және негізгі экрандар (басты бет, нұсқалар, тест, нәтиже). */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, Score = Shyn.Score, esc = U.esc;
  var view = document.getElementById("view");

  /* ================= Күй ================= */
  var S = Shyn.state = {
    mode: "practice",       // practice | exam
    shuffleQ: false, shuffleO: false,
    test: null,             // {scope, title, questions, mode}
    answers: {}, conf: {}, reasons: {}, flags: {}, checked: {},
    index: 0, startedAt: 0, remaining: 0, timer: null,
    filter: { subjects: null, sources: null, langs: null },
    review: "all", lastResult: null
  };

  var REASONS = { unknown: "білмедім", confused: "шатастырдым", careless: "асығыстық" };
  var CONF = { sure: "Сенімдімін", doubt: "Күмәндімін", guess: "Болжадым" };
  Shyn.REASONS = REASONS;

  /* ================= Роутер ================= */
  var routes = {};
  Shyn.route = function (name, fn) { routes[name] = fn; };
  Shyn.go = function (hash) { if (location.hash === hash) render(); else location.hash = hash; };
  function render() {
    var h = (location.hash || "#/").slice(2).split("/");
    var name = h[0] || "home";
    if (name !== "quiz") stopTimer();
    if (name === "quiz" && !S.test) name = "home";
    if (name === "result" && !S.lastResult) name = "home";
    var fn = routes[name] || routes.home;
    U.$$(".navlink").forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("data-r") === (name === "lesson" ? "eng" : name)); });
    document.body.setAttribute("data-route", name);
    fn(h.slice(1));
    if (!Shyn._keepScroll) global.scrollTo(0, 0);
    Shyn._keepScroll = false;
    var main = document.getElementById("view"); if (main) main.focus({ preventScroll: true });
  }
  Shyn.render = render;
  global.addEventListener("hashchange", render);

  /* ================= Тема және қаріп ================= */
  function applyTheme() {
    var t = Store.settings.theme || "auto";
    var dark = t === "dark" || (t === "auto" && global.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.documentElement.style.setProperty("--fs", (Store.settings.fontScale || 1));
    var b = document.getElementById("themeBtn"); if (b) b.setAttribute("aria-label", dark ? "Жарық тақырып" : "Қараңғы тақырып");
  }
  Shyn.applyTheme = applyTheme;
  document.getElementById("themeBtn").addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    Store.set("theme", dark ? "light" : "dark"); applyTheme();
  });

  /* ================= Модаль ================= */
  var modal = document.getElementById("modal"), modalBody = document.getElementById("modalBody");
  Shyn.modal = function (html) {
    modalBody.innerHTML = html; modal.hidden = false;
    U.on("[data-close]", "click", Shyn.closeModal, modal);
    var f = modalBody.querySelector("input,button,select"); if (f) f.focus();
  };
  Shyn.closeModal = function () { modal.hidden = true; };
  // Браузердің confirm() орнына — бет ішіндегі сұрақ терезесі
  Shyn.ask = function (text, yes, no, onYes, onNo) {
    Shyn.modal('<h2 class="modal__title">' + U.esc(text) + '</h2>' +
      '<div class="modal__actions"><button class="btn btn--primary" id="askYes">' + yes + '</button><button class="btn btn--ghost" id="askNo">' + no + '</button></div>');
    U.$("#askYes").addEventListener("click", function () { Shyn.closeModal(); onYes && onYes(); });
    U.$("#askNo").addEventListener("click", function () { Shyn.closeModal(); onNo && onNo(); });
  };
  modal.querySelector(".modal__scrim").addEventListener("click", Shyn.closeModal);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) Shyn.closeModal(); });

  /* ================= Көмекші бөліктер ================= */
  function ring(pct, size, cls) {
    var r = (size - 6) / 2, c = 2 * Math.PI * r, off = c * (1 - (pct || 0) / 100);
    return '<svg class="ring ' + (cls || "") + '" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '" aria-hidden="true">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring__bg"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring__fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>';
  }
  Shyn.ring = ring;
  function bar(pct, cls) { return '<span class="bar ' + (cls || "") + '"><span style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></span>'; }
  Shyn.bar = bar;
  function tone(pct) { return pct >= 80 ? "good" : pct >= 50 ? "mid" : "low"; }
  Shyn.tone = tone;
  function setMax(set) { return set.questions.reduce(function (s, q) { return s + Score.max(q); }, 0); }
  function langLabel(set) { return set.origLang === "en" ? "EN" : set.origLang === "kz" ? "KZ түпнұсқа" : "KZ аударма"; }

  /* ================= Тестті бастау ================= */
  function prepare(list, keepOrder) {
    var qs = S.shuffleQ && !keepOrder ? U.shuffle(list) : list.slice();
    return qs.map(function (q) {
      var c = Object.create(q);
      c._opts = S.shuffleO && !q.missing && !keepOrder ? U.shuffle(q.opts) : q.opts;
      return c;
    });
  }
  function startTest(scope, title, list, opts) {
    opts = opts || {};
    list = list.filter(Boolean);
    if (!list.length) { U.toast("Бұл таңдау бойынша сұрақ жоқ"); return; }
    var mode = opts.mode || S.mode;
    var saved = Store.getSession(scope + "|" + mode);
    var hasSaved = saved && Object.keys(saved.answers || {}).length;
    if (hasSaved && !opts.resume && !opts.fresh) {
      var o2 = function (k) { var c = {}; for (var x in opts) c[x] = opts[x]; c[k] = true; return c; };
      Shyn.ask("Аяқталмаған прогресс бар (" + Object.keys(saved.answers).length + " жауап). Жалғастырасыз ба?", "Жалғастыру", "Басынан бастау",
        function () { startTest(scope, title, list, o2("resume")); }, function () { startTest(scope, title, list, o2("fresh")); });
      return;
    }
    var resume = hasSaved && opts.resume;
    if (resume && saved.meta && saved.meta.order) {
      var byId = {}; list.forEach(function (q) { byId[q.id] = q; });
      var ordered = saved.meta.order.map(function (id) { return byId[id]; }).filter(Boolean);
      S.test = { scope: scope, title: title, mode: mode, questions: ordered.map(function (q) {
        var c = Object.create(q), lo = (saved.meta.optOrder || {})[q.id];
        c._opts = lo ? lo.map(function (l) { return q.opts.filter(function (o) { return o.l === l; })[0]; }).filter(Boolean) : q.opts;
        if (c._opts.length !== q.opts.length) c._opts = q.opts;
        return c; }) };
      S.answers = saved.answers || {}; S.conf = saved.conf || {}; S.reasons = saved.reasons || {};
      S.flags = saved.flags || {}; S.checked = mode === "practice" ? saved.checked || {} : {};
      S.index = saved.index || 0; S.remaining = saved.remaining || 0; S.startedAt = saved.startedAt || Date.now();
    } else {
      if (saved) Store.clearSession(scope + "|" + mode);
      S.test = { scope: scope, title: title, mode: mode, questions: prepare(list) };
      S.answers = {}; S.conf = {}; S.reasons = {}; S.flags = {}; S.checked = {}; S.index = 0;
      S.startedAt = Date.now();
      S.remaining = mode === "exam" ? Math.round(S.test.questions.length * (opts.secPerQ || 72)) : 0;
    }
    S.test.mode = mode;
    Shyn.go("#/quiz");
  }
  Shyn.startTest = startTest;

  function launchSet(key) {
    var set = Shyn.sets[key]; if (!set) return;
    startTest(key, set.title, set.questions);
  }
  function launchVariant(v) {
    var qs = [];
    Shyn.allSets().filter(function (s) { return s.variant === v; }).forEach(function (s) { qs = qs.concat(s.questions); });
    startTest("v" + v + "-all", "Нұсқа " + v + " · толық кешен", qs);
  }
  Shyn.launchMistakes = function () {
    var ids = {}; Store.wrongIds().forEach(function (id) { ids[id] = 1; });
    var qs = Shyn.allQuestions().filter(function (q) { return ids[q.id] && !q.missing; });
    if (!qs.length) { U.toast("Қателер тізімі бос — алдымен тест тапсырыңыз"); return; }
    startTest("mistakes", "Қателермен жұмыс", qs, { mode: "practice" });
  };
  Shyn.launchTopic = function (topic) {
    startTest("topic:" + topic, "Тақырып: " + topic, Shyn.allQuestions().filter(function (q) { return q.topic === topic && !q.missing; }), { mode: "practice" });
  };
  Shyn.launchAdaptive = function (kind) {
    var all = Shyn.allQuestions().filter(function (q) { return !q.missing; });
    var due = {}; Store.dueIds().forEach(function (id) { due[id] = 1; });
    var weak = {}; Store.topicStats(all).slice(0, 4).forEach(function (t) { if (t.pct < 80) weak[t.topic] = 1; });
    var W = { unknown: 30, confused: 20, careless: 10 };
    function prio(q) {
      var s = due[q.id] ? 100 : 0, x = Store.learning(q.id);
      if (x) { s += W[x.reason] || 0; if (x.lastState === "correct" && x.conf === "guess") s += 15; }
      return s + (weak[q.topic] ? 5 : 0);
    }
    var qs = all.filter(function (q) { return kind === "due" ? due[q.id] : due[q.id] || weak[q.topic]; });
    qs.sort(function (a, b) { return prio(b) - prio(a); });
    if (!qs.length) { U.toast("Тарих әлі аз — бір нұсқаны тапсырсаңыз, жеке іріктеме пайда болады"); return; }
    startTest("adaptive:" + kind, kind === "due" ? "Аралықпен қайталау" : "Әлсіз тақырыптар", qs.slice(0, 20), { mode: "practice" });
  };
  Shyn.launchExam = function (subjects, secPerQ) {
    var qs = [], picked = [];
    subjects.forEach(function (sub) {
      var sets = Shyn.allSets().filter(function (s) { return s.subject === sub; });
      if (!sets.length) return;
      var set = sets[Math.floor(Math.random() * sets.length)];
      picked.push(Shyn.SUBJECT[sub].short + " " + set.variant);
      qs = qs.concat(set.questions);
    });
    if (!qs.length) { U.toast("Кемінде бір пәнді таңдаңыз"); return; }
    startTest("exam:" + subjects.join(",") + ":" + Date.now(), "Емтихан · " + picked.join(", "), qs, { mode: "exam", secPerQ: secPerQ });
  };

  /* ================= Басты бет ================= */
  Shyn.route("home", function () {
    var all = Shyn.allQuestions();
    var wrong = Store.wrongIds().length, due = Store.dueIds().length, streak = Store.streak();
    var examDate = Store.settings.examDate, daysLeft = null;
    if (examDate) { daysLeft = Math.ceil((new Date(examDate + "T09:00:00") - Date.now()) / 864e5); }
    var countdown = examDate
      ? (daysLeft > 0 ? '<span class="count">' + daysLeft + '</span><span class="count__label">күн қалды<br>емтиханға</span>'
        : daysLeft === 0 ? '<span class="count__label count__label--big">Емтихан бүгін. Сәттілік!</span>' : '<span class="count__label count__label--big">Емтихан күні өтіп кетті — жаңасын белгілеңіз</span>')
      : '<button class="btn btn--light" id="setDate">Емтихан күнін белгілеу</button>';

    // соңғы 14 күн
    var days = Store.days(), strip = "";
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var n = days[U.dayKey(d)] || 0, lvl = n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : 3;
      strip += '<span class="day lv' + lvl + (i === 0 ? " today" : "") + '" title="' + d.getDate() + " " + U.MONTHS[d.getMonth()] + ": " + n + '"></span>';
    }
    var sessions = Store.openSessions().slice(0, 3).map(function (s) {
      var a = Object.keys(s.answers).length;
      return '<button class="resume" data-resume="' + esc(s._key) + '"><span class="resume__t">' + esc(s.meta.title) + '</span>' +
        '<span class="resume__m">' + (s.meta.mode === "exam" ? "Емтихан" : "Жаттығу") + " · " + a + " / " + s.meta.order.length + ' жауап · ' + U.fmtDate(s.savedAt) + '</span></button>';
    }).join("");

    var stats = Store.topicStats(all).slice(0, 5);
    var weakHTML = stats.length ? stats.map(function (t) {
      return '<button class="weak" data-topic="' + esc(t.topic) + '"><span class="weak__name">' + esc(t.topic) + '</span>' + bar(t.pct, tone(t.pct)) +
        '<span class="weak__pct">' + t.correct + "/" + t.attempts + '</span></button>';
    }).join("") : '<p class="muted">Бір нұсқаны тапсырсаңыз, мұнда ең әлсіз тақырыптарыңыз шығады.</p>';

    var totalQ = all.filter(function (q) { return !q.missing; }).length;
    view.innerHTML =
      '<section class="hero">' +
        '<div class="hero__main"><h1>Магистратураға кешенді тестілеуге дайындық</h1>' +
        '<p class="hero__lead">' + Shyn.variants().length + ' нұсқа, ' + totalQ + ' сұрақ. Әр жауаптың неге дұрыс, ал қалғандарының неге қате екені түсіндірілген.</p>' +
        '<div class="hero__row"><a class="btn btn--gold" href="#/variants">Нұсқаны таңдау</a><button class="btn btn--light" id="examBtn">Емтихан режимі</button></div></div>' +
        '<div class="hero__side"><div class="countdown">' + countdown + '</div>' +
        '<div class="streak"><div class="streak__strip">' + strip + '</div><div class="streak__t">' + (streak ? "Қатарынан " + streak + " күн оқудасыз" : "Бүгін бастап, күн сайын аздап оқыңыз") + '</div></div></div>' +
      '</section>' +
      (sessions ? '<section class="block"><h2>Жалғастыру</h2><div class="resumes">' + sessions + '</div></section>' : "") +
      '<section class="block"><h2>Бүгінгі жаттығу</h2><div class="actions">' +
        action("mistakes", "Қателермен жұмыс", wrong ? wrong + " сұрақта қателескенсіз — соларды қайта шығарыңыз" : "Қате жіберген сұрақтарыңыз осында жиналады", wrong, wrong ? "Бастау" : null) +
        action("due", "Аралықпен қайталау", due ? due + " сұрақты қайталау уақыты келді" : "Дұрыс жауаптар 3, 7, 21 күннен кейін қайта шығады", due, due ? "Қайталау" : null) +
        action("weak", "Әлсіз тақырыптар", "Ең нашар тақырыптардан және қайталауға келген сұрақтардан 20 сұрақ", 0, "Жинау") +
        (Shyn.engSummary ? action("eng", "Ағылшын грамматикасы", "Бүгін " + Shyn.engSummary().xp + " / " + Shyn.engSummary().goal + " XP. Келесі сабақ: " + Shyn.engSummary().next, Shyn.engSummary().due, "Сабаққа өту") : "") +
        action("lab", "Алгоритм және SQL зертханасы", "Сұрыптауды қадам бойынша көру, SQL-ды нақты дерекқорда жазу, қалыпты форманы есептеу", 0, "Зертханаға өту") +
        action("cards", "Есте сақтау карточкалары", Shyn.cards.length + " қысқа факт: анықтамалар, күрделілік, қасиеттер", 0, "Ашу") +
      '</div></section>' +
      '<section class="block block--split"><div><h2>Әлсіз тақырыптар</h2><div class="weaks">' + weakHTML + '</div>' +
        (stats.length ? '<a class="link" href="#/stats">Толық статистика</a>' : "") + '</div>' +
        '<div><h2>Тақырып бойынша жаттығу</h2><p class="muted">Бір тақырыптың барлық нұсқалардағы сұрақтарын жинаңыз.</p>' +
        '<div class="inline"><select id="topicSel" class="field"><option value="">Тақырыпты таңдаңыз</option>' + topicOptions() + '</select>' +
        '<button class="btn btn--primary" id="topicGo">Бастау</button></div></div></section>';

    var sd = U.$("#setDate"); if (sd) sd.addEventListener("click", function () { Shyn.go("#/settings"); });
    U.$("#examBtn").addEventListener("click", openExamModal);
    U.on("[data-resume]", "click", function (e, el) { resumeSession(el.getAttribute("data-resume")); }, view);
    U.on("[data-topic]", "click", function (e, el) { Shyn.launchTopic(el.getAttribute("data-topic")); }, view);
    U.on("[data-act]", "click", function (e, el) {
      var a = el.getAttribute("data-act");
      if (a === "mistakes") Shyn.launchMistakes(); else if (a === "due") Shyn.launchAdaptive("due");
      else if (a === "weak") Shyn.launchAdaptive("weak"); else if (a === "cards") Shyn.go("#/cards"); else if (a === "eng") Shyn.go("#/eng"); else if (a === "lab") Shyn.go("#/lab");
    }, view);
    U.$("#topicGo").addEventListener("click", function () { var t = U.$("#topicSel").value; if (t) Shyn.launchTopic(t); else U.toast("Алдымен тақырыпты таңдаңыз"); });
  });
  function action(key, title, text, count, cta) {
    return '<div class="act"><div class="act__head"><h3>' + title + '</h3>' + (count ? '<span class="pill">' + count + '</span>' : "") + '</div>' +
      '<p>' + text + '</p>' + (cta ? '<button class="btn btn--line" data-act="' + key + '">' + cta + '</button>' : '<button class="btn btn--line" disabled>Әзірге бос</button>') + '</div>';
  }
  function topicOptions() {
    var m = {};
    Shyn.allQuestions().forEach(function (q) { if (q.topic && !q.missing) m[q.topic] = (m[q.topic] || 0) + 1; });
    return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, "kk"); })
      .map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + " (" + m[t] + ")</option>"; }).join("");
  }
  Shyn.topicOptions = topicOptions;
  function resumeSession(key) {
    var s = Store.getSession(key); if (!s || !s.meta) return;
    var qs = s.meta.order.map(function (id) { return Shyn.questionById(id); }).filter(Boolean);
    S.mode = s.meta.mode;
    startTest(s.meta.scope, s.meta.title, qs, { mode: s.meta.mode, resume: true });
  }

  function openExamModal() {
    var rows = Shyn.SUBJECT_ORDER.map(function (sub) {
      var sets = Shyn.allSets().filter(function (s) { return s.subject === sub; });
      if (!sets.length) return "";
      return '<label class="check check--row"><input type="checkbox" class="exSub" value="' + sub + '"' + (sub === "fundamentals" ? "" : " checked") + '>' +
        '<span>' + Shyn.SUBJECT[sub].name + '</span><span class="muted">' + sets.length + ' нұсқа · ' + sets[0].questions.length + ' сұрақ</span></label>';
    }).join("");
    Shyn.modal('<h2 class="modal__title">Емтихан режимі</h2>' +
      '<p class="muted">Әр пән үшін кездейсоқ бір нұсқа алынады. Таймер жүреді, түсіндірмелер тек соңында ашылады.</p>' +
      '<div class="stack">' + rows + '</div>' +
      '<label class="lbl">Бір сұраққа уақыт<select id="exPace" class="field"><option value="72">1,2 минут (стандарт)</option><option value="60">1 минут (қатаң)</option><option value="90">1,5 минут (жайлы)</option></select></label>' +
      '<div class="modal__actions"><button class="btn btn--primary" id="exGo">Емтиханды бастау</button><button class="btn btn--ghost" data-close>Болдырмау</button></div>');
    U.$("#exGo").addEventListener("click", function () {
      var subs = U.$$(".exSub:checked", modalBody).map(function (c) { return c.value; });
      if (!subs.length) { U.toast("Кемінде бір пәнді таңдаңыз"); return; }
      Shyn.closeModal(); Shyn.launchExam(subs, +U.$("#exPace").value);
    });
  }
  Shyn.openExamModal = openExamModal;

  /* ================= Нұсқалар ================= */
  Shyn.route("variants", function () {
    var sets = Shyn.allSets(), F = S.filter;
    var subjects = Shyn.SUBJECT_ORDER.filter(function (s) { return sets.some(function (x) { return x.subject === s; }); });
    if (!F.subjects) F.subjects = subjects.filter(function (s) { return s !== "fundamentals"; });
    if (!F.sources) F.sources = ["tc", "ai"];
    if (!F.langs) F.langs = ["kz", "en"];
    function okSet(s) { return F.subjects.indexOf(s.subject) >= 0 && F.sources.indexOf(s.source) >= 0 && F.langs.indexOf(s.origLang === "en" ? "en" : "kz") >= 0; }
    var list = Shyn.variants().map(function (v) { return { n: v.n, sets: v.sets.filter(okSet) }; }).filter(function (v) { return v.sets.length; });

    function chip(group, val, label, on) { return '<button class="chip' + (on ? " is-on" : "") + '" data-g="' + group + '" data-v="' + val + '" aria-pressed="' + on + '">' + label + '</button>'; }
    var rows = list.map(function (v) {
      var src = v.sets.some(function (s) { return s.source === "tc"; }) ? "tc" : "ai";
      var parts = v.sets.map(function (s) {
        var best = Store.getBest(s.key), max = setMax(s), pct = best ? Math.round(best.got / best.max * 100) : 0;
        return '<button class="subj" data-set="' + s.key + '" title="' + esc(Shyn.SOURCE[s.source].hint) + '">' +
          '<span class="subj__ring">' + ring(pct, 44, best ? tone(pct) : "none") + '<b>' + Shyn.SUBJECT[s.subject].mark + '</b></span>' +
          '<span class="subj__txt"><span class="subj__name">' + Shyn.SUBJECT[s.subject].short + '</span>' +
          '<span class="subj__meta">' + s.questions.length + " сұрақ, " + max + " балл · " + langLabel(s) + '</span>' +
          '<span class="subj__best">' + (best ? "Рекорд: " + best.got + " / " + best.max : "Әлі тапсырылмаған") + '</span></span></button>';
      }).join("");
      return '<article class="variant"><div class="variant__no"><span>Нұсқа</span><b>' + v.n + '</b>' +
        '<span class="src src--' + src + '">' + Shyn.SOURCE[src].name + '</span></div>' +
        '<div class="variant__subj">' + parts + '</div>' +
        '<button class="btn btn--line variant__all" data-variant="' + v.n + '">Толық кешен</button></article>';
    }).join("");

    view.innerHTML =
      '<header class="page-head"><h1>Нұсқалар</h1><p class="muted">Пәнді басыңыз — тест сол бойынша басталады. «Толық кешен» нұсқаның барлық пәндерін қатарынан береді.</p></header>' +
      '<div class="toolbar">' +
        '<div class="seg" role="group" aria-label="Режим"><button class="' + (S.mode === "practice" ? "is-on" : "") + '" data-mode="practice">Жаттығу</button><button class="' + (S.mode === "exam" ? "is-on" : "") + '" data-mode="exam">Емтихан</button></div>' +
        '<span class="muted toolbar__hint">' + (S.mode === "practice" ? "Әр сұрақтан кейін тексеріс пен түсіндірме" : "Таймермен, талдау соңында") + '</span>' +
        '<label class="check"><input type="checkbox" id="shQ"' + (S.shuffleQ ? " checked" : "") + '> Сұрақтарды араластыру</label>' +
        '<label class="check"><input type="checkbox" id="shO"' + (S.shuffleO ? " checked" : "") + '> Жауаптарды араластыру</label>' +
      '</div>' +
      '<div class="filters">' +
        '<div class="filters__g"><span class="filters__l">Пәндер</span>' + subjects.map(function (s) { return chip("subjects", s, Shyn.SUBJECT[s].short, F.subjects.indexOf(s) >= 0); }).join("") + '</div>' +
        '<div class="filters__g"><span class="filters__l">Дереккөз</span>' + chip("sources", "tc", "Тест орталығы", F.sources.indexOf("tc") >= 0) + chip("sources", "ai", "Жаттығу", F.sources.indexOf("ai") >= 0) + '</div>' +
        '<div class="filters__g"><span class="filters__l">Сұрақ тілі</span>' + chip("langs", "kz", "Қазақша", F.langs.indexOf("kz") >= 0) + chip("langs", "en", "Ағылшынша", F.langs.indexOf("en") >= 0) + '</div>' +
      '</div>' +
      '<p class="count-line">Көрсетілді: ' + list.length + ' нұсқа</p>' +
      '<div class="variants">' + (rows || '<p class="empty">Таңдалған сүзгілерге сәйкес нұсқа жоқ. Сүзгінің бірін қосыңыз.</p>') + '</div>';

    U.on("[data-mode]", "click", function (e, el) { S.mode = el.getAttribute("data-mode"); Shyn._keepScroll = true; render(); }, view);
    U.$("#shQ").addEventListener("change", function (e) { S.shuffleQ = e.target.checked; });
    U.$("#shO").addEventListener("change", function (e) { S.shuffleO = e.target.checked; });
    U.on(".chip", "click", function (e, el) {
      var g = F[el.getAttribute("data-g")], v = el.getAttribute("data-v"), i = g.indexOf(v);
      if (i >= 0) g.splice(i, 1); else g.push(v);
      Shyn._keepScroll = true; render();
    }, view);
    U.on("[data-set]", "click", function (e, el) { launchSet(el.getAttribute("data-set")); }, view);
    U.on("[data-variant]", "click", function (e, el) { launchVariant(+el.getAttribute("data-variant")); }, view);
  });

  /* ================= Тест экраны ================= */
  function persist() {
    if (!S.test) return;
    var optOrder = {};
    S.test.questions.forEach(function (q) { optOrder[q.id] = q._opts.map(function (o) { return o.l; }); });
    Store.saveSession(S.test.scope + "|" + S.test.mode, {
      answers: S.answers, conf: S.conf, reasons: S.reasons, flags: S.flags, checked: S.checked,
      index: S.index, remaining: S.remaining, startedAt: S.startedAt, savedAt: Date.now(),
      meta: { title: S.test.title, scope: S.test.scope, mode: S.test.mode, order: S.test.questions.map(function (q) { return q.id; }), optOrder: optOrder }
    });
  }
  function startTimer() {
    stopTimer();
    var el = U.$("#timer"); if (!el) return;
    function tick() {
      if (S.test.mode === "exam") {
        S.remaining--;
        el.textContent = U.fmtTime(S.remaining);
        el.classList.toggle("is-warn", S.remaining <= 300);
        if (S.remaining % 5 === 0) persist();
        if (S.remaining <= 0) { stopTimer(); finish(true); }
      } else el.textContent = U.fmtTime((Date.now() - S.startedAt) / 1000);
    }
    tick(); S.timer = setInterval(tick, 1000);
  }
  function stopTimer() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }

  Shyn.route("quiz", function () {
    var t = S.test;
    view.innerHTML =
      '<div class="quiz">' +
        '<header class="quiz__head"><div class="quiz__title"><h1>' + esc(t.title) + '</h1>' +
          '<span class="muted">' + (t.mode === "exam" ? "Емтихан режимі" : "Жаттығу режимі") + '</span></div>' +
          '<div class="quiz__meta"><span class="timer' + (t.mode === "exam" ? " timer--down" : "") + '" id="timer" role="timer" aria-live="off"></span>' +
          '<span class="live" id="live"></span></div></header>' +
        '<div class="quiz__body"><div id="qwrap" class="quiz__main"></div>' +
        '<aside class="quiz__side"><div class="side__head"><span>Сұрақтар</span><button class="link" id="keysBtn">Пернелер</button></div>' +
          '<div class="grid" id="grid"></div>' +
          '<div class="legend"><span><i class="lg lg--ans"></i>жауап берілді</span><span><i class="lg lg--ok"></i>дұрыс</span><span><i class="lg lg--no"></i>қате</span><span><i class="lg lg--flag"></i>белгіленген</span></div>' +
          '<button class="btn btn--primary btn--block" id="finishBtn">Тестті аяқтау</button>' +
          '<button class="btn btn--ghost btn--block" id="leaveBtn">Кейін жалғастыру</button></aside></div>' +
      '</div>';
    U.$("#finishBtn").addEventListener("click", confirmFinish);
    U.$("#leaveBtn").addEventListener("click", function () { persist(); U.toast("Прогресс сақталды — басты беттен жалғастырасыз"); Shyn.go("#/"); });
    U.$("#keysBtn").addEventListener("click", keysHelp);
    drawGrid(); drawQuestion(); drawLive(); startTimer();
  });
  function keysHelp() {
    Shyn.modal('<h2 class="modal__title">Пернетақта</h2><dl class="keys">' +
      '<dt>A – H</dt><dd>жауапты таңдау</dd><dt>Enter</dt><dd>тексеру / келесі сұрақ</dd><dt>← →</dt><dd>алдыңғы / келесі</dd>' +
      '<dt>F</dt><dd>сұрақты белгілеу</dd><dt>1 2 3</dt><dd>сенімділік: сенімдімін, күмәндімін, болжадым</dd><dt>Esc</dt><dd>терезені жабу</dd></dl>' +
      '<div class="modal__actions"><button class="btn btn--primary" data-close>Түсінікті</button></div>');
  }
  function drawLive() {
    var el = U.$("#live"); if (!el) return;
    var sc = Score.test(S.test.questions, S.answers), n = S.test.questions.length;
    el.textContent = S.test.mode === "practice" ? "Балл: " + practiceScore() + " / " + sc.max : "Жауап: " + (n - sc.empty) + " / " + n;
  }
  function practiceScore() {
    return S.test.questions.reduce(function (s, q) { return s + (S.checked[q.id] ? Score.question(q, S.answers[q.id]).points : 0); }, 0);
  }
  function cellState(q) {
    var c = [];
    if (S.flags[q.id]) c.push("is-flag");
    if (S.test.mode === "practice" && S.checked[q.id]) {
      var r = Score.question(q, S.answers[q.id]); c.push(r.state === "correct" ? "is-ok" : r.state === "partial" ? "is-part" : "is-no");
    } else if ((S.answers[q.id] || []).length) c.push("is-ans");
    return c.join(" ");
  }
  function drawGrid() {
    var g = U.$("#grid"), last = null, html = "";
    S.test.questions.forEach(function (q, i) {
      if (q._subject !== last && new Set(S.test.questions.map(function (x) { return x._subject; })).size > 1) {
        html += '<span class="grid__sec">' + Shyn.SUBJECT[q._subject].short + '</span>'; last = q._subject;
      }
      html += '<button class="cell ' + cellState(q) + (i === S.index ? " is-cur" : "") + '" data-i="' + i + '" aria-label="Сұрақ ' + (i + 1) + '">' + (i + 1) + '</button>';
    });
    g.innerHTML = html;
    U.on(".cell", "click", function (e, el) { goto(+el.getAttribute("data-i")); }, g);
    var cur = g.querySelector(".is-cur"); if (cur && cur.scrollIntoView && global.innerWidth < 900) cur.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function goto(i) {
    S.index = Math.max(0, Math.min(S.test.questions.length - 1, i));
    persist(); drawGrid(); drawQuestion();
  }
  function drawQuestion() {
    var q = S.test.questions[S.index], w = U.$("#qwrap"), n = S.test.questions.length;
    var nav = '<div class="qnav"><button class="btn btn--ghost" id="prevBtn"' + (S.index ? "" : " disabled") + '>Алдыңғы</button>' +
      '<button class="btn btn--ghost" id="flagBtn" aria-pressed="' + !!S.flags[q.id] + '">' + (S.flags[q.id] ? "Белгіні алу" : "Белгілеу") + '</button><span class="sp"></span>' +
      (S.test.mode === "practice" && !S.checked[q.id] && !q.missing ? '<button class="btn btn--primary" id="checkBtn"' + ((S.answers[q.id] || []).length ? "" : " disabled") + '>Тексеру</button>' : "") +
      (S.index < n - 1 ? '<button class="btn btn--dark" id="nextBtn">Келесі</button>' : '<button class="btn btn--gold" id="endBtn">Аяқтау</button>') + '</div>';
    var head = '<div class="q__top"><span class="q__no">' + (S.index + 1) + '<small> / ' + n + '</small></span>' +
      '<span class="q__src">' + Shyn.SUBJECT[q._subject].short + " · нұсқа " + q._variant + " · №" + q.n + '</span></div>';
    if (q.missing) {
      w.innerHTML = '<article class="q">' + head + '<p class="q__text">Бұл сұрақтың мәтіні бастапқы деректерде жоқ.</p>' +
        '<p class="muted">Ресми кілт бойынша жауап: <b>' + esc(q.correct.join(", ") || "—") + '</b>. Сұрақ балл есебіне кірмейді.</p>' + nav + '</article>';
      bindQ(q); return;
    }
    var sel = S.answers[q.id] || [], done = S.test.mode === "practice" && S.checked[q.id];
    var tags = '<span class="tag">' + esc(q.topic || "") + '</span>' +
      '<span class="tag tag--' + (q.multi ? "multi" : "single") + '">' + (q.multi ? "бірнеше жауап" : "бір жауап") + '</span>' +
      (q.extra ? '<span class="tag tag--extra">қосымша</span>' : "") + (q.disputed && done ? '<span class="tag tag--warn">даулы</span>' : "");
    var opts = q._opts.map(function (o) {
      var on = sel.indexOf(o.l) >= 0, c = ["opt"];
      if (on) c.push("is-sel");
      if (done) { var ok = q.correct.indexOf(o.l) >= 0; if (on && ok) c.push("is-ok"); else if (on) c.push("is-no"); else if (ok) c.push("is-miss"); }
      return '<button class="' + c.join(" ") + '" data-l="' + o.l + '" role="' + (q.multi ? "checkbox" : "radio") + '" aria-checked="' + on + '"' + (done ? " disabled" : "") + '>' +
        '<span class="opt__l">' + o.l + '</span><span class="opt__t">' + Shyn.fmt(o.t) + Shyn.code(o.code) + '</span></button>';
    }).join("");
    var conf = '<div class="conf" role="group" aria-label="Сенімділік"><span>Қаншалықты сенімдісіз?</span>' + Object.keys(CONF).map(function (k) {
      return '<button class="conf__b' + (S.conf[q.id] === k ? " is-on" : "") + '" data-conf="' + k + '">' + CONF[k] + '</button>'; }).join("") + '</div>';
    w.innerHTML = '<article class="q">' + head + '<div class="q__tags">' + tags + '</div>' +
      (q.passage ? '<details class="passage" open><summary>Тапсырмаға мәтін</summary><div class="passage__t">' + Shyn.fmt(q.passage) + '</div></details>' : "") +
      (q.audio ? '<div class="audio"><span>Аудиожазба — жауап осы жазба бойынша анықталады</span><audio controls preload="none" src="' + encodeURI(q.audio) + '"></audio></div>' : "") +
      '<div class="q__text">' + Shyn.fmt(q.q) + '</div>' + Shyn.code(q.code) +
      '<p class="q__hint">' + (q.multi ? "Бір немесе бірнеше дұрыс жауапты таңдаңыз (үштен аспайды). Толық жиын — 2 балл, ішінара — 1 балл." : "Бір жауапты таңдаңыз.") + '</p>' +
      '<div class="opts">' + opts + '</div>' + conf + (done ? explainHTML(q) : "") + nav + '</article>';
    bindQ(q);
  }
  function explainHTML(q) {
    var r = Score.question(q, S.answers[q.id]);
    var head = r.state === "correct" ? "Дұрыс" : r.state === "partial" ? "Ішінара дұрыс · " + r.points + " / 2 балл" : "Қате";
    return '<section class="explain explain--' + r.state + '"><h3>' + head + '</h3>' +
      '<p class="explain__ans">Дұрыс жауап: <b>' + esc(q.correct.join(", ")) + '</b>' + (q.derived ? ' <span class="muted">(кілт талдау арқылы анықталған)</span>' : "") + '</p>' +
      '<div class="explain__t">' + Shyn.fmt(q.ex || "Түсіндірме кейін қосылады.") + '</div>' +
      (q.disputed ? '<p class="warn">Даулы жауап. ' + esc(q.dnote || "Ресми кілт осы нұсқаны есептейді, бірақ академиялық тұрғыдан ол қате болуы мүмкін.") + '</p>' : "") +
      (r.state !== "correct" ? reasonHTML(q.id) + aiHTML(q.id) : "") + '</section>';
  }
  function reasonHTML(id) {
    return '<div class="reason"><span>Қатенің себебі:</span>' + Object.keys(REASONS).map(function (k) {
      return '<button class="conf__b' + (S.reasons[id] === k ? " is-on" : "") + '" data-reason="' + k + '" data-qid="' + esc(id) + '">' + REASONS[k] + '</button>'; }).join("") + '</div>';
  }
  function aiHTML(id) { return '<div class="ai"><button class="btn btn--line" data-ai="' + esc(id) + '">ЖИ-ден толығырақ түсіндірме сұрау</button><div class="ai__out" hidden></div></div>'; }
  function bindAI(root) {
    U.on("[data-ai]", "click", function (e, btn) {
      if (!Shyn.AI.hasKey()) { Shyn.openAIModal(); return; }
      var id = btn.getAttribute("data-ai"), q = Shyn.questionById(id), out = btn.nextElementSibling;
      out.hidden = false; out.textContent = "Ойланып жатыр…"; btn.disabled = true;
      Shyn.AI.explain(q, "Ережеге, жиі кездесетін қақпанға назар аудар және соңында жауабы жоқ бір қысқа бақылау сұрағын қос.")
        .then(function (t) { out.innerHTML = Shyn.fmt(t); })
        .catch(function (err) { out.textContent = "Жауап алынбады: " + err.message; })
        .then(function () { btn.disabled = false; });
    }, root);
    U.on("[data-reason]", "click", function (e, b) {
      var id = b.getAttribute("data-qid"), r = b.getAttribute("data-reason");
      S.reasons[id] = r; Store.updateMeta(id, null, r); persist();
      U.$$('[data-qid="' + id + '"][data-reason]', root).forEach(function (x) { x.classList.toggle("is-on", x === b); });
    }, root);
  }
  Shyn.bindAI = bindAI;
  function bindQ(q) {
    var w = U.$("#qwrap");
    U.on(".opt", "click", function (e, el) { select(q, el.getAttribute("data-l")); }, w);
    U.on("[data-conf]", "click", function (e, el) { setConf(q, el.getAttribute("data-conf")); }, w);
    var c = U.$("#checkBtn"); if (c) c.addEventListener("click", function () { check(q); });
    var p = U.$("#prevBtn"); if (p) p.addEventListener("click", function () { goto(S.index - 1); });
    var nx = U.$("#nextBtn"); if (nx) nx.addEventListener("click", function () { goto(S.index + 1); });
    var en = U.$("#endBtn"); if (en) en.addEventListener("click", confirmFinish);
    var f = U.$("#flagBtn"); if (f) f.addEventListener("click", function () { toggleFlag(q); });
    bindAI(w);
  }
  function setConf(q, k) {
    S.conf[q.id] = S.conf[q.id] === k ? "" : k; persist();
    U.$$("[data-conf]", U.$("#qwrap")).forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-conf") === S.conf[q.id]); });
    if (S.checked[q.id]) Store.updateMeta(q.id, S.conf[q.id], null);
  }
  function select(q, l) {
    if (q.missing || (S.test.mode === "practice" && S.checked[q.id])) return;
    var cur = (S.answers[q.id] || []).slice();
    if (q.multi) { var i = cur.indexOf(l); if (i >= 0) cur.splice(i, 1); else cur.push(l); } else cur = [l];
    S.answers[q.id] = cur; persist();
    U.$$(".opt", U.$("#qwrap")).forEach(function (b) {
      var on = cur.indexOf(b.getAttribute("data-l")) >= 0; b.classList.toggle("is-sel", on); b.setAttribute("aria-checked", on);
    });
    var c = U.$("#checkBtn"); if (c) c.disabled = !cur.length;
    drawGrid(); drawLive();
  }
  function toggleFlag(q) { S.flags[q.id] = !S.flags[q.id]; persist(); drawGrid(); var f = U.$("#flagBtn"); if (f) { f.textContent = S.flags[q.id] ? "Белгіні алу" : "Белгілеу"; f.setAttribute("aria-pressed", !!S.flags[q.id]); } }
  function check(q) {
    if (!(S.answers[q.id] || []).length) return;
    S.checked[q.id] = true;
    var r = Score.question(q, S.answers[q.id]);
    Store.markWrong(q.id, r.state !== "correct");
    Store.recordLearning(q, r, S.conf[q.id], S.reasons[q.id]);
    persist(); drawGrid(); drawQuestion(); drawLive();
    var ex = U.$(".explain"); if (ex && ex.scrollIntoView) ex.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  }
  function confirmFinish() {
    var sc = Score.test(S.test.questions, S.answers);
    if (sc.empty > 0) { Shyn.ask("Жауапсыз қалған сұрақ: " + sc.empty + ". Тестті аяқтайсыз ба?", "Аяқтау", "Жалғастыру", function () { finish(false); }); return; }
    finish(false);
  }
  function finish(auto) {
    stopTimer();
    var t = S.test, sc = Score.test(t.questions, S.answers);
    var dur = Math.round((Date.now() - S.startedAt) / 1000);
    t.questions.forEach(function (q) {
      if (q.missing) return;
      var r = Score.question(q, S.answers[q.id]);
      if (r.state === "empty" && t.mode === "practice") return; // жаттығуда ашылмаған сұрақтарды қате деп санамаймыз
      Store.markWrong(q.id, r.state !== "correct");
      if (!(t.mode === "practice" && S.checked[q.id])) Store.recordLearning(q, r, S.conf[q.id], S.reasons[q.id]);
    });
    var subj = {};
    t.questions.forEach(function (q) {
      if (q.missing) return;
      var r = Score.question(q, S.answers[q.id]), x = subj[q._subject] || (subj[q._subject] = { got: 0, max: 0 });
      x.got += r.points; x.max += r.max;
    });
    var rec = { key: t.scope, title: t.title, mode: t.mode, got: sc.got, max: sc.max, at: Date.now(), dur: dur, subj: subj,
      qs: t.questions.map(function (q) { return q.id; }), ans: {}, fl: [],
      sum: { ok: sc.correct, part: sc.partial, no: sc.wrong, empty: sc.empty } };
    t.questions.forEach(function (q) { if (S.answers[q.id] && S.answers[q.id].length) rec.ans[q.id] = S.answers[q.id].slice(); if (S.flags[q.id]) rec.fl.push(q.id); });
    Store.recordResult(rec);
    Store.clearSession(t.scope + "|" + t.mode);
    S.lastResult = { test: t, answers: S.answers, flags: S.flags, auto: auto, rec: rec };
    S.test = null; S.review = "all";
    Shyn.go("#/result");
  }

  /* ================= Нәтиже ================= */
  Shyn.route("result", function () {
    var R = S.lastResult, t = R.test, sc = Score.test(t.questions, R.answers), pct = sc.max ? Math.round(sc.got / sc.max * 100) : 0;
    var total = sc.correct + sc.partial + sc.wrong + sc.empty;
    var segs = [["ok", sc.correct], ["part", sc.partial], ["no", sc.wrong], ["empty", sc.empty]].filter(function (s) { return s[1] > 0; }).map(function (s) {
      return '<span class="seg seg--' + s[0] + '" style="flex-grow:' + s[1] + '"></span>'; }).join("");
    var bySubj = Object.keys(R.rec.subj).length > 1 ? '<div class="subjres">' + Object.keys(R.rec.subj).map(function (k) {
      var x = R.rec.subj[k], p = x.max ? Math.round(x.got / x.max * 100) : 0;
      return '<div class="subjres__r"><span>' + Shyn.SUBJECT[k].short + '</span>' + bar(p, tone(p)) + '<b>' + x.got + " / " + x.max + '</b></div>'; }).join("") + '</div>' : "";
    var verdict = pct >= 80 ? "Өте жақсы нәтиже. Енді қателерді талдап шығыңыз." : pct >= 50 ? "Жаман емес. Төмендегі қателерге назар аударыңыз." : "Бастау осындай болады. Түсіндірмелерді оқып, қателермен жұмыс жасаңыз.";
    view.innerHTML =
      '<section class="result">' +
        '<div class="result__score">' + ring(pct, 168, tone(pct)) + '<div class="result__pct"><b>' + pct + '%</b><span>' + sc.got + " / " + sc.max + ' балл</span></div></div>' +
        '<div class="result__info">' + (R.fromHistory ? '<p class="hist-note"><a class="link" href="#/history">← Тесттер тарихы</a> · ' + U.fmtDate(R.rec.at) + ' · ' + (R.rec.mode === "exam" ? "емтихан" : "жаттығу") + '</p>' : "") + (R.auto ? '<p class="warn">Уақыт бітті — тест автоматты түрде аяқталды.</p>' : "") +
          '<h1>' + esc(t.title) + '</h1><p>' + verdict + '</p>' +
          '<div class="split">' + segs + '</div>' +
          '<ul class="tally"><li><i class="lg lg--ok"></i>' + sc.correct + ' дұрыс</li><li><i class="lg lg--part"></i>' + sc.partial + ' ішінара</li><li><i class="lg lg--no"></i>' + sc.wrong + ' қате</li><li><i class="lg"></i>' + sc.empty + ' жауапсыз</li><li>Уақыт: ' + U.fmtTime(R.rec.dur) + '</li></ul>' +
          bySubj +
          '<div class="inline"><button class="btn btn--primary" id="again">Қайта тапсыру</button>' +
          '<button class="btn btn--line" id="againWrong"' + (sc.wrong + sc.partial + sc.empty ? "" : " disabled") + '>Тек қателерді</button>' +
          '<a class="btn btn--ghost" href="#/">Басты бетке</a></div></div>' +
      '</section>' +
      '<section class="block"><h2>Талдау</h2><div class="toolbar">' +
        '<div class="seg" role="group">' + [["all", "Барлығы"], ["wrong", "Қателер"], ["correct", "Дұрыстар"], ["flag", "Белгіленгендер"]].map(function (f) {
          return '<button data-rf="' + f[0] + '" class="' + (S.review === f[0] ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("") + '</div>' +
        '<input class="field toolbar__search" id="rsearch" type="search" placeholder="Мәтін бойынша іздеу"></div>' +
        '<div id="review">' + t.questions.map(function (q, i) { return reviewItem(q, i, R); }).join("") + '</div></section>';
    U.$("#again").addEventListener("click", function () { S.mode = t.mode; startTest(t.scope, t.title, t.questions.map(base)); });
    U.$("#againWrong").addEventListener("click", function () {
      S.mode = "practice";
      startTest(t.scope + ":wrong", t.title + " · қателер", t.questions.filter(function (q) { return !q.missing && Score.question(q, R.answers[q.id]).state !== "correct"; }).map(base));
    });
    U.on("[data-rf]", "click", function (e, el) { S.review = el.getAttribute("data-rf"); U.$$("[data-rf]").forEach(function (b) { b.classList.toggle("is-on", b === el); }); applyReview(); }, view);
    U.$("#rsearch").addEventListener("input", applyReview);
    bindAI(view); applyReview();
  });
  function base(q) { return Object.getPrototypeOf(q); }
  /* Тарихтағы тестті ашу: сол кездегі жауаптармен талдау беті */
  Shyn.openHistory = function (at) {
    var rec = Store.history().filter(function (r) { return String(r.at) === String(at); })[0];
    if (!rec || !rec.qs) { U.toast("Бұл тесттің жауаптары сақталмаған (ескі жазба)"); return; }
    var qs = rec.qs.map(function (id) { return Shyn.questionById(id); }).filter(Boolean).map(function (q) { var c = Object.create(q); c._opts = q.opts; return c; });
    if (!qs.length) { U.toast("Бұл тесттің сұрақтары табылмады"); return; }
    var fl = {}; (rec.fl || []).forEach(function (id) { fl[id] = true; });
    S.lastResult = { test: { scope: rec.key, title: rec.title, mode: rec.mode, questions: qs }, answers: rec.ans || {}, flags: fl, auto: false, rec: rec, fromHistory: true };
    S.review = "all"; Shyn.go("#/result");
  };
  function applyReview() {
    var s = (U.$("#rsearch").value || "").toLowerCase();
    U.$$(".rv").forEach(function (el) {
      var st = el.getAttribute("data-st"), ok =
        S.review === "all" || (S.review === "wrong" && st !== "correct") || (S.review === "correct" && st === "correct") || (S.review === "flag" && el.getAttribute("data-flag") === "1");
      el.hidden = !(ok && (!s || el.getAttribute("data-text").indexOf(s) >= 0));
    });
  }
  function reviewItem(q, i, R) {
    var sel = R.answers[q.id] || [], r = Score.question(q, sel);
    if (q.missing) return '<article class="rv rv--missing" data-st="missing" data-flag="0" data-text=""><p>' + (i + 1) + '. Сұрақ мәтіні жоқ · кілт бойынша: ' + esc(q.correct.join(", ")) + '</p></article>';
    var opts = q.opts.map(function (o) {
      var ok = q.correct.indexOf(o.l) >= 0, on = sel.indexOf(o.l) >= 0;
      return '<li class="' + (ok ? "is-ok" : on ? "is-no" : "") + '"><b>' + o.l + '</b> ' + Shyn.fmt(o.t) + (ok ? ' <span class="mark">дұрыс</span>' : on ? ' <span class="mark">сіздің таңдауыңыз</span>' : "") + '</li>';
    }).join("");
    var text = (q.q + " " + q.opts.map(function (o) { return o.t; }).join(" ") + " " + (q.topic || "")).toLowerCase();
    return '<article class="rv rv--' + r.state + '" data-st="' + r.state + '" data-flag="' + (R.flags[q.id] ? 1 : 0) + '" data-text="' + esc(text) + '">' +
      '<details><summary><span class="rv__n">' + (i + 1) + '</span><span class="rv__q">' + Shyn.fmt(q.q) + '</span>' +
      '<span class="rv__pts">' + r.points + " / " + r.max + '</span></summary>' +
      Shyn.code(q.code) + '<ul class="rv__opts">' + opts + '</ul>' +
      '<div class="explain__t">' + Shyn.fmt(q.ex) + '</div>' +
      (q.disputed ? '<p class="warn">Даулы жауап. ' + esc(q.dnote || "") + '</p>' : "") +
      (r.state !== "correct" ? reasonHTML(q.id) + aiHTML(q.id) : "") + '</details></article>';
  }

  /* ================= Пернетақта ================= */
  document.addEventListener("keydown", function (e) {
    if (document.body.getAttribute("data-route") !== "quiz" || !S.test || !modal.hidden) return;
    if (/input|select|textarea/i.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    var q = S.test.questions[S.index], k = e.key.toUpperCase();
    if (/^[A-H]$/.test(k) && !q.missing && q._opts.some(function (o) { return o.l === k; })) { select(q, k); e.preventDefault(); }
    else if (k === "F") toggleFlag(q);
    else if (e.key === "1" || e.key === "2" || e.key === "3") setConf(q, ["sure", "doubt", "guess"][+e.key - 1]);
    else if (e.key === "ArrowRight") goto(S.index + 1);
    else if (e.key === "ArrowLeft") goto(S.index - 1);
    else if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
      if (S.test.mode === "practice" && !S.checked[q.id] && (S.answers[q.id] || []).length) check(q); else goto(S.index + 1);
    }
  });

  /* ================= Іске қосу ================= */
  applyTheme();
  global.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  Shyn.onReady(function () { document.body.classList.remove("is-loading"); render(); });
})(window);
