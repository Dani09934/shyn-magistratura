/* Шың — қосымша экрандар: карточкалар, сұрыптау, синонимдер, сұрақтар қоры, статистика, баптаулар. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, esc = U.esc;
  var view = document.getElementById("view");

  /* ================= Карточкалар ================= */
  var C = { subjects: null, topic: "", onlyNew: false, shuffle: false, deck: [], pos: 0, flipped: false };
  function buildDeck() {
    var list = Shyn.cards.filter(function (c) {
      return C.subjects.indexOf(c.subject) >= 0 && (!C.topic || c.topic === C.topic) && !(C.onlyNew && Store.cardStatus(c.id) === "know");
    });
    C.deck = C.shuffle ? U.shuffle(list) : list; C.pos = Math.min(C.pos, Math.max(0, C.deck.length - 1)); C.flipped = false;
  }
  Shyn.route("cards", function () {
    var subs = []; Shyn.cards.forEach(function (c) { if (subs.indexOf(c.subject) < 0) subs.push(c.subject); });
    if (!C.subjects) { C.subjects = subs.slice(); buildDeck(); }
    var pool = Shyn.cards.filter(function (c) { return C.subjects.indexOf(c.subject) >= 0; });
    var know = pool.filter(function (c) { return Store.cardStatus(c.id) === "know"; }).length;
    var topics = []; pool.forEach(function (c) { if (topics.indexOf(c.topic) < 0) topics.push(c.topic); });
    var c = C.deck[C.pos], st = c && Store.cardStatus(c.id);
    view.innerHTML =
      '<header class="page-head"><h1>Есте сақтау карточкалары</h1><p class="muted">Сұрақты оқып, жауапты есіңізге түсіріңіз, сосын карточканы аударып, өзіңізді бағалаңыз.</p></header>' +
      '<div class="toolbar">' + subs.map(function (s) {
        return '<button class="chip' + (C.subjects.indexOf(s) >= 0 ? " is-on" : "") + '" data-cs="' + s + '">' + Shyn.SUBJECT[s].short + '</button>'; }).join("") +
        '<select class="field" id="cTopic"><option value="">Барлық тақырып</option>' + topics.sort().map(function (t) { return '<option' + (t === C.topic ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("") + '</select>' +
        '<label class="check"><input type="checkbox" id="cNew"' + (C.onlyNew ? " checked" : "") + '> Тек білмейтіндерім</label>' +
        '<label class="check"><input type="checkbox" id="cShuf"' + (C.shuffle ? " checked" : "") + '> Араластыру</label></div>' +
      '<div class="deckbar"><span>Барлығы <b>' + pool.length + '</b></span><span>Білемін <b>' + know + '</b></span>' + Shyn.bar(pool.length ? know / pool.length * 100 : 0, "good") +
        '<button class="link" id="cReset">Прогресті тазалау</button></div>' +
      (c ? '<div class="stage"><p class="muted">Карточка ' + (C.pos + 1) + " / " + C.deck.length + " · " + esc(c.topic) + (st ? " · " + (st === "know" ? "білемін" : "қайталау керек") : "") + '</p>' +
        '<button class="flash' + (C.flipped ? " is-flipped" : "") + '" id="flash" aria-label="Карточканы аудару">' +
          '<span class="flash__in"><span class="flash__face flash__face--front"><small>' + Shyn.SUBJECT[c.subject].short + '</small><span>' + Shyn.fmt(c.front) + '</span><em>Аудару үшін басыңыз немесе Space</em></span>' +
          '<span class="flash__face flash__face--back"><small>Жауап</small><span>' + Shyn.fmt(c.back) + '</span></span></span></button>' +
        '<div class="inline inline--center"><button class="btn btn--ghost" id="cPrev">Алдыңғы</button>' +
          '<button class="btn btn--no" id="cNo">Білмеймін</button><button class="btn btn--ok" id="cYes">Білемін</button>' +
          '<button class="btn btn--ghost" id="cNext">Келесі</button></div></div>'
        : '<p class="empty">Сүзгілерге сәйкес карточка жоқ. «Тек білмейтіндерім» белгісін алып көріңіз.</p>');
    U.on("[data-cs]", "click", function (e, el) { var s = el.getAttribute("data-cs"), i = C.subjects.indexOf(s); if (i >= 0) C.subjects.splice(i, 1); else C.subjects.push(s); C.topic = ""; C.pos = 0; buildDeck(); Shyn.render(); }, view);
    U.$("#cTopic").addEventListener("change", function (e) { C.topic = e.target.value; C.pos = 0; buildDeck(); Shyn.render(); });
    U.$("#cNew").addEventListener("change", function (e) { C.onlyNew = e.target.checked; C.pos = 0; buildDeck(); Shyn.render(); });
    U.$("#cShuf").addEventListener("change", function (e) { C.shuffle = e.target.checked; C.pos = 0; buildDeck(); Shyn.render(); });
    U.$("#cReset").addEventListener("click", function () { Shyn.ask("Карточкалар бойынша прогресті тазалайсыз ба?", "Тазалау", "Болдырмау", function () { Store.clearCards(Shyn.cards.map(function (x) { return x.id; })); buildDeck(); Shyn.render(); }); });
    if (!c) return;
    U.$("#flash").addEventListener("click", flip);
    U.$("#cPrev").addEventListener("click", function () { move(-1); });
    U.$("#cNext").addEventListener("click", function () { move(1); });
    U.$("#cNo").addEventListener("click", function () { judge("unknown"); });
    U.$("#cYes").addEventListener("click", function () { judge("know"); });
  });
  function flip() { C.flipped = !C.flipped; var f = U.$("#flash"); if (f) f.classList.toggle("is-flipped", C.flipped); }
  function move(d) { if (!C.deck.length) return; C.pos = (C.pos + d + C.deck.length) % C.deck.length; C.flipped = false; Shyn._keepScroll = true; Shyn.render(); }
  function judge(s) {
    var c = C.deck[C.pos]; if (!c) return;
    Store.setCard(c.id, s);
    if (C.onlyNew && s === "know") { buildDeck(); Shyn._keepScroll = true; Shyn.render(); } else move(1);
  }

  /* ================= Сұрыптау күрделілігі ================= */
  var SO = { quiz: false };
  function tier(v) { return /n²|n\^2|n2/.test(v) ? "bad" : /log/.test(v) && /n log|n\(log/.test(v) ? "mid" : "good"; }
  Shyn.route("sorting", function () {
    var D = Shyn.sorting;
    var legend = (D.legend || []).map(function (l) { return '<li><i class="t t--' + l.tier + '"></i><b>' + esc(l.label) + '</b> <span class="muted">' + esc(l.examples) + '</span></li>'; }).join("");
    var groups = D.groups.map(function (g) {
      var rows = g.items.map(function (it, i) {
        function cell(v) { return '<td><button class="bigo t--' + tier(v) + '"' + (SO.quiz ? ' data-hide' : "") + '>' + esc(v) + '</button></td>'; }
        return '<tr><th scope="row"><span class="algo">' + esc(it.name) + '</span><span class="muted">' + esc(it.en) + '</span></th>' +
          cell(it.best) + cell(it.avg) + cell(it.worst) + '<td><button class="bigo"' + (SO.quiz ? " data-hide" : "") + '>' + esc(it.space) + '</button></td>' +
          '<td>' + (it.stable ? "иә" : "жоқ") + '</td><td>' + (it.inplace ? "иә" : "жоқ") + '</td>' +
          '<td><details><summary>Неге?</summary><p>' + Shyn.fmt(it.note) + '</p></details></td></tr>';
      }).join("");
      return '<section class="block"><h2>' + esc(g.title) + '</h2><p class="muted">' + esc(g.subtitle) + '</p>' +
        '<div class="tablewrap"><table class="sort"><thead><tr><th>Алгоритм</th><th>Ең жақсы</th><th>Орташа</th><th>Ең нашар</th><th>Жад</th><th>Тұрақты</th><th>Орнында</th><th>Түсіндірме</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    }).join("");
    view.innerHTML = '<header class="page-head"><h1>Сұрыптау күрделілігі</h1><p class="muted">Ең жақсы, орташа және ең нашар жағдай, қосымша жад, тұрақтылық. Өзін-өзі тексеру режимінде мәндер жасырылады.</p></header>' +
      '<div class="toolbar"><label class="check"><input type="checkbox" id="soQuiz"' + (SO.quiz ? " checked" : "") + '> Өзін-өзі тексеру</label>' +
      (SO.quiz ? '<span class="muted">Жасырын ұяшықты басып, жауапты ашыңыз.</span>' : "") + '</div>' +
      '<ul class="legendlist">' + legend + '</ul>' + groups;
    U.$("#soQuiz").addEventListener("change", function (e) { SO.quiz = e.target.checked; Shyn._keepScroll = true; Shyn.render(); });
    U.on("[data-hide]", "click", function (e, el) { el.removeAttribute("data-hide"); el.classList.add("is-shown"); }, view);
  });

  /* ================= Синонимдер ================= */
  var SY = { mode: "cards", onlyNew: false, deck: [], pos: 0, flipped: false, q: null, score: { ok: 0, all: 0 } };
  function synDeck() {
    SY.deck = Shyn.synonyms.map(function (w, i) { return i; }).filter(function (i) { return !(SY.onlyNew && Store.word(Shyn.synonyms[i].en).status === "know"); });
    SY.pos = Math.min(SY.pos, Math.max(0, SY.deck.length - 1)); SY.flipped = false;
  }
  function synQuestion() {
    var W = Shyn.synonyms;
    var pool = W.map(function (w, i) { var s = Store.word(w.en); return { i: i, wt: 1 + s.bad * 2 + (s.status === "know" ? 0 : 1) }; });
    var tot = pool.reduce(function (a, p) { return a + p.wt; }, 0), r = Math.random() * tot, idx = 0;
    for (var k = 0; k < pool.length; k++) { r -= pool[k].wt; if (r <= 0) { idx = pool[k].i; break; } }
    var w = W[idx], right = w.syn[Math.floor(Math.random() * w.syn.length)];
    var opts = [right];
    U.shuffle(W.map(function (_, i) { return i; }).filter(function (i) { return i !== idx; })).forEach(function (j) {
      if (opts.length >= 4) return;
      var cand = W[j].syn.filter(function (s) { return w.syn.indexOf(s) < 0 && opts.indexOf(s) < 0; });
      if (cand.length) opts.push(cand[Math.floor(Math.random() * cand.length)]);
    });
    SY.q = { idx: idx, right: right, opts: U.shuffle(opts), answered: null };
  }
  Shyn.route("synonyms", function () {
    if (!SY.deck.length && !SY.onlyNew) synDeck();
    var W = Shyn.synonyms, know = W.filter(function (w) { return Store.word(w.en).status === "know"; }).length;
    var body = "";
    if (SY.mode === "cards") {
      var w = W[SY.deck[SY.pos]];
      body = w ? '<div class="stage"><p class="muted">Сөз ' + (SY.pos + 1) + " / " + SY.deck.length + '</p>' +
        '<button class="flash' + (SY.flipped ? " is-flipped" : "") + '" id="sFlash"><span class="flash__in">' +
          '<span class="flash__face flash__face--front"><small>English</small><span class="big">' + esc(w.en) + '</span><em>Синонимдерін еске түсіріңіз, сосын аударыңыз</em></span>' +
          '<span class="flash__face flash__face--back"><small>' + esc(w.kz) + '</small><span class="syns">' + w.syn.map(function (s) { return "<i>" + esc(s) + "</i>"; }).join("") + '</span></span></span></button>' +
        '<div class="inline inline--center"><button class="btn btn--ghost" id="sPrev">Алдыңғы</button><button class="btn btn--no" id="sNo">Білмеймін</button><button class="btn btn--ok" id="sYes">Білемін</button><button class="btn btn--ghost" id="sNext">Келесі</button></div></div>'
        : '<p class="empty">Барлық сөзді білесіз. «Тек білмейтіндерім» белгісін алыңыз.</p>';
    } else {
      if (!SY.q) synQuestion();
      var qw = W[SY.q.idx];
      body = '<div class="stage stage--quiz"><p class="muted">Дұрыс: ' + SY.score.ok + " / " + SY.score.all + '</p>' +
        '<p class="syq">Қай сөз <b>' + esc(qw.en) + '</b> (' + esc(qw.kz) + ') сөзінің синонимі?</p><div class="opts opts--2">' +
        SY.q.opts.map(function (o) {
          var cls = "opt"; if (SY.q.answered) { if (o === SY.q.right) cls += " is-ok"; else if (o === SY.q.answered) cls += " is-no"; }
          return '<button class="' + cls + '" data-syn="' + esc(o) + '"' + (SY.q.answered ? " disabled" : "") + '><span class="opt__t">' + esc(o) + '</span></button>'; }).join("") + '</div>' +
        (SY.q.answered ? '<p class="muted">Барлық синонимдер: ' + qw.syn.map(esc).join(", ") + '</p><button class="btn btn--primary" id="synNext">Келесі сұрақ</button>' : "") + '</div>';
    }
    view.innerHTML = '<header class="page-head"><h1>Ағылшын синонимдері</h1><p class="muted">' + W.length + ' сөз: карточкалар және таңдау тесті. Қате жауап берген сөздер тестте жиірек шығады.</p></header>' +
      '<div class="toolbar"><div class="seg"><button data-sm="cards" class="' + (SY.mode === "cards" ? "is-on" : "") + '">Карточкалар</button><button data-sm="quiz" class="' + (SY.mode === "quiz" ? "is-on" : "") + '">Тест</button></div>' +
      (SY.mode === "cards" ? '<label class="check"><input type="checkbox" id="sNew"' + (SY.onlyNew ? " checked" : "") + '> Тек білмейтіндерім</label><button class="btn btn--ghost" id="sShuf">Араластыру</button>' : "") +
      '<span class="sp"></span><span class="muted">Білемін: ' + know + " / " + W.length + '</span></div>' + body;
    U.on("[data-sm]", "click", function (e, el) { SY.mode = el.getAttribute("data-sm"); Shyn._keepScroll = true; Shyn.render(); }, view);
    if (SY.mode === "cards") {
      var n = U.$("#sNew"); if (n) n.addEventListener("change", function (e) { SY.onlyNew = e.target.checked; SY.pos = 0; synDeck(); Shyn.render(); });
      U.$("#sShuf").addEventListener("click", function () { SY.deck = U.shuffle(SY.deck); SY.pos = 0; SY.flipped = false; Shyn.render(); });
      if (!U.$("#sFlash")) return;
      U.$("#sFlash").addEventListener("click", function () { SY.flipped = !SY.flipped; U.$("#sFlash").classList.toggle("is-flipped", SY.flipped); });
      function mv(d) { SY.pos = (SY.pos + d + SY.deck.length) % SY.deck.length; SY.flipped = false; Shyn._keepScroll = true; Shyn.render(); }
      function jd(s) { var w = W[SY.deck[SY.pos]], x = Store.word(w.en); x.status = s; Store.saveWords(); Store.logActivity(1); if (SY.onlyNew && s === "know") { synDeck(); Shyn._keepScroll = true; Shyn.render(); } else mv(1); }
      U.$("#sPrev").addEventListener("click", function () { mv(-1); });
      U.$("#sNext").addEventListener("click", function () { mv(1); });
      U.$("#sNo").addEventListener("click", function () { jd("unknown"); });
      U.$("#sYes").addEventListener("click", function () { jd("know"); });
    } else {
      U.on("[data-syn]", "click", function (e, el) {
        if (SY.q.answered) return;
        var a = el.getAttribute("data-syn"), ok = a === SY.q.right, x = Store.word(W[SY.q.idx].en);
        SY.q.answered = a; SY.score.all++; if (ok) { SY.score.ok++; x.ok++; } else x.bad++;
        Store.saveWords(); Store.logActivity(1); Shyn._keepScroll = true; Shyn.render();
      }, view);
      var nx = U.$("#synNext"); if (nx) nx.addEventListener("click", function () { synQuestion(); Shyn._keepScroll = true; Shyn.render(); });
    }
  });
  Shyn.cardKeys = function (e) {
    var r = document.body.getAttribute("data-route");
    if ((r !== "cards" && r !== "synonyms") || /input|select|textarea/i.test(e.target.tagName)) return;
    var f = U.$("#flash") || U.$("#sFlash"); if (!f) return;
    if (e.key === " ") { e.preventDefault(); f.click(); }
    else if (e.key === "ArrowRight") (U.$("#cNext") || U.$("#sNext")).click();
    else if (e.key === "ArrowLeft") (U.$("#cPrev") || U.$("#sPrev")).click();
  };
  document.addEventListener("keydown", Shyn.cardKeys);

  /* ================= Сұрақтар қоры (іздеу) ================= */
  var B = { q: "", subject: "", topic: "", status: "", limit: 30 };
  Shyn.route("bank", function () {
    var all = Shyn.allQuestions().filter(function (q) { return !q.missing; });
    view.innerHTML = '<header class="page-head"><h1>Сұрақтар қоры</h1><p class="muted">Барлық нұсқалардағы ' + all.length + ' сұрақ бойынша іздеу. Табылған сұрақтардан бірден жаттығу құрастыруға болады.</p></header>' +
      '<div class="toolbar toolbar--wrap"><input type="search" class="field toolbar__search" id="bQ" placeholder="Сөз немесе тіркес, мысалы: хеш-кесте" value="' + esc(B.q) + '">' +
      '<select class="field" id="bS"><option value="">Барлық пән</option>' + Shyn.SUBJECT_ORDER.map(function (s) { return '<option value="' + s + '"' + (B.subject === s ? " selected" : "") + '>' + Shyn.SUBJECT[s].short + '</option>'; }).join("") + '</select>' +
      '<select class="field" id="bT"><option value="">Барлық тақырып</option>' + Shyn.topicOptions() + '</select>' +
      '<select class="field" id="bSt"><option value="">Кез келген күй</option><option value="new">Әлі шығарылмаған</option><option value="wrong">Қателескен</option><option value="right">Дұрыс шығарылған</option><option value="flag">Даулы жауаптар</option></select></div>' +
      '<div class="inline"><span class="count-line" id="bCount"></span><button class="btn btn--primary" id="bGo">Табылғандардан жаттығу (20-ға дейін)</button></div>' +
      '<div id="bList" class="bank"></div><div class="inline inline--center"><button class="btn btn--ghost" id="bMore" hidden>Тағы көрсету</button></div>';
    U.$("#bT").value = B.topic; U.$("#bSt").value = B.status;
    var found = [];
    function run() {
      var s = B.q.trim().toLowerCase(), wrong = {}; Store.wrongIds().forEach(function (id) { wrong[id] = 1; });
      found = all.filter(function (q) {
        if (B.subject && q._subject !== B.subject) return false;
        if (B.topic && q.topic !== B.topic) return false;
        var L = Store.learning(q.id);
        if (B.status === "new" && L) return false;
        if (B.status === "wrong" && !wrong[q.id]) return false;
        if (B.status === "right" && !(L && L.lastState === "correct")) return false;
        if (B.status === "flag" && !q.disputed) return false;
        if (s) { var t = (q.q + " " + q.opts.map(function (o) { return o.t; }).join(" ") + " " + q.topic + " " + (q.code || "")).toLowerCase(); if (t.indexOf(s) < 0) return false; }
        return true;
      });
      U.$("#bCount").textContent = "Табылды: " + found.length;
      U.$("#bList").innerHTML = found.slice(0, B.limit).map(function (q) {
        return '<details class="bq"><summary><span class="bq__src">' + Shyn.SUBJECT[q._subject].short + " " + q._variant + "/" + q.n + '</span><span class="bq__q">' + Shyn.fmt(q.q.length > 220 ? q.q.slice(0, 220) + "…" : q.q) + '</span><span class="tag">' + esc(q.topic) + '</span></summary>' +
          (q.q.length > 220 ? '<div class="q__text">' + Shyn.fmt(q.q) + '</div>' : "") + Shyn.code(q.code) +
          '<ul class="rv__opts">' + q.opts.map(function (o) { var ok = q.correct.indexOf(o.l) >= 0; return '<li class="' + (ok ? "is-ok" : "") + '"><b>' + o.l + '</b> ' + Shyn.fmt(o.t) + Shyn.code(o.code) + '</li>'; }).join("") + '</ul>' +
          '<div class="explain__t">' + Shyn.fmt(q.ex) + '</div></details>';
      }).join("") || '<p class="empty">Ештеңе табылмады. Сөзді қысқартып немесе сүзгіні алып көріңіз.</p>';
      U.$("#bMore").hidden = found.length <= B.limit;
    }
    var deb; U.$("#bQ").addEventListener("input", function (e) { B.q = e.target.value; B.limit = 30; clearTimeout(deb); deb = setTimeout(run, 180); });
    U.$("#bS").addEventListener("change", function (e) { B.subject = e.target.value; B.limit = 30; run(); });
    U.$("#bT").addEventListener("change", function (e) { B.topic = e.target.value; B.limit = 30; run(); });
    U.$("#bSt").addEventListener("change", function (e) { B.status = e.target.value; B.limit = 30; run(); });
    U.$("#bMore").addEventListener("click", function () { B.limit += 30; run(); });
    U.$("#bGo").addEventListener("click", function () {
      if (!found.length) { U.toast("Алдымен сұрақтарды табыңыз"); return; }
      Shyn.startTest("bank:" + Date.now(), "Қордан іріктеме" + (B.q ? ": «" + B.q + "»" : B.topic ? ": " + B.topic : ""), U.shuffle(found).slice(0, 20), { mode: "practice" });
    });
    run();
  });

  /* ================= Статистика ================= */
  Shyn.route("stats", function () {
    var all = Shyn.allQuestions().filter(function (q) { return !q.missing; }), H = Store.history();
    var topics = Store.topicStats(all), reasons = Store.reasonStats(all);
    // соңғы 26 апта жылу картасы
    var days = Store.days(), cells = "", start = new Date(); start.setDate(start.getDate() - 7 * 26 + 1 - ((start.getDay() + 6) % 7));
    for (var d = new Date(start), i = 0; d <= new Date(); d.setDate(d.getDate() + 1), i++) {
      var n = days[U.dayKey(d)] || 0, lv = n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : 3;
      cells += '<span class="day lv' + lv + '" title="' + d.getDate() + " " + U.MONTHS[d.getMonth()] + ": " + n + ' әрекет"></span>';
    }
    var activeDays = Object.keys(days).length, totalAct = Object.keys(days).reduce(function (a, k) { return a + days[k]; }, 0);
    // нәтиже графигі
    var pts = H.slice(-30), chart = "";
    if (pts.length > 1) {
      var Wd = 640, Ht = 200, px = function (i) { return 28 + i * (Wd - 44) / (pts.length - 1); }, py = function (p) { return 12 + (100 - p) * (Ht - 36) / 100; };
      var line = pts.map(function (r, i) { return (i ? "L" : "M") + px(i).toFixed(1) + " " + py(r.max ? r.got / r.max * 100 : 0).toFixed(1); }).join(" ");
      chart = '<svg class="chart" viewBox="0 0 ' + Wd + " " + Ht + '" role="img" aria-label="Соңғы тесттердің пайыздық нәтижесі">' +
        [0, 50, 80, 100].map(function (g) { return '<line x1="28" x2="' + (Wd - 16) + '" y1="' + py(g) + '" y2="' + py(g) + '" class="chart__grid"/><text x="0" y="' + (py(g) + 4) + '" class="chart__lbl">' + g + '%</text>'; }).join("") +
        '<path d="' + line + '" class="chart__line"/>' +
        pts.map(function (r, i) { var p = r.max ? Math.round(r.got / r.max * 100) : 0; return '<circle cx="' + px(i) + '" cy="' + py(p) + '" r="4" class="chart__dot chart__dot--' + Shyn.tone(p) + '"><title>' + esc(r.title) + ": " + p + "%</title></circle>"; }).join("") + '</svg>';
    }
    // пәндер бойынша дәлдік
    var subj = {};
    all.forEach(function (q) { var L = Store.learning(q.id); if (!L) return; var s = subj[q._subject] || (subj[q._subject] = { a: 0, c: 0, seen: 0, total: 0 }); s.a++; if (L.lastState === "correct") s.c++; });
    all.forEach(function (q) { var s = subj[q._subject]; if (s) s.total++; });
    var RN = { unknown: "білмедім", confused: "шатастырдым", careless: "асығыстық", none: "белгісіз" };
    view.innerHTML = '<header class="page-head"><h1>Статистика</h1><p class="muted">Барлық деректер тек осы браузерде сақталады.</p></header>' +
      '<div class="kpis"><div><b>' + Store.learnedCount() + '</b><span>сұрақ шығарылды (' + all.length + ' ішінен)</span></div><div><b>' + H.length + '</b><span>тест аяқталды</span></div>' +
      '<div><b>' + Store.streak() + '</b><span>күн қатарынан</span></div><div><b>' + Store.wrongIds().length + '</b><span>сұрақ қателер тізімінде</span></div></div>' +
      '<section class="block"><h2>Белсенділік</h2><p class="muted">Соңғы 26 апта · ' + activeDays + ' белсенді күн · ' + totalAct + ' әрекет</p><div class="heat">' + cells + '</div></section>' +
      '<section class="block"><h2>Нәтижелер динамикасы</h2>' + (chart || '<p class="muted">Кемінде екі тест аяқталғанда график пайда болады.</p>') + '</section>' +
      (Object.keys(subj).length ? '<section class="block"><h2>Пәндер бойынша</h2><div class="weaks">' + Object.keys(subj).map(function (k) {
        var s = subj[k], p = Math.round(s.c / s.a * 100);
        return '<div class="weak"><span class="weak__name">' + Shyn.SUBJECT[k].short + ' <span class="muted">· ' + s.a + " / " + s.total + ' шығарылды</span></span>' + Shyn.bar(p, Shyn.tone(p)) + '<span class="weak__pct">' + p + '%</span></div>'; }).join("") + '</div></section>' : "") +
      '<section class="block block--split"><div><h2>Тақырыптар профилі</h2>' + (topics.length ? '<div class="weaks">' + topics.map(function (t) {
        return '<button class="weak" data-topic="' + esc(t.topic) + '"><span class="weak__name">' + esc(t.topic) + (t.confWrong ? ' <span class="muted">· сенімді қате: ' + t.confWrong + '</span>' : "") + '</span>' + Shyn.bar(t.pct, Shyn.tone(t.pct)) + '<span class="weak__pct">' + t.correct + "/" + t.attempts + '</span></button>'; }).join("") + '</div>' : '<p class="muted">Әзірге дерек жоқ.</p>') + '</div>' +
      '<div><h2>Қателердің себептері</h2>' + (reasons ? '<div class="weaks">' + reasons.map(function (r) {
        return '<div class="weak"><span class="weak__name">' + RN[r.reason] + '</span>' + Shyn.bar(r.pct, r.reason === "unknown" ? "low" : r.reason === "confused" ? "mid" : "good") + '<span class="weak__pct">' + r.count + '</span></div>'; }).join("") + '</div><p class="muted">Себепті түсіндірме астындағы батырмалармен белгілеңіз — қайталау аралығы соған қарай таңдалады.</p>' : '<p class="muted">Қате жоқ немесе әлі тест тапсырылмаған.</p>') + '</div></section>' +
      '<section class="block"><h2>Тесттер тарихы</h2>' + (H.length ? '<div class="tablewrap"><table class="hist"><thead><tr><th>Күні</th><th>Тест</th><th>Режим</th><th>Балл</th><th>Уақыт</th></tr></thead><tbody>' +
        H.slice().reverse().slice(0, 40).map(function (r) { var p = r.max ? Math.round(r.got / r.max * 100) : 0;
          return '<tr><td>' + U.fmtDate(r.at) + '</td><td>' + esc(r.title) + '</td><td>' + (r.mode === "exam" ? "емтихан" : "жаттығу") + '</td><td><b class="tone-' + Shyn.tone(p) + '">' + r.got + " / " + r.max + '</b> (' + p + '%)</td><td>' + U.fmtTime(r.dur || 0) + '</td></tr>'; }).join("") +
        '</tbody></table></div>' : '<p class="muted">Тарих бос.</p>') + '</section>';
    U.on("[data-topic]", "click", function (e, el) { Shyn.launchTopic(el.getAttribute("data-topic")); }, view);
  });

  /* ================= Баптаулар ================= */
  Shyn.openAIModal = function () {
    Shyn.modal('<h2 class="modal__title">ЖИ түсіндірмесі</h2>' +
      '<p class="muted">Әр сұрақта дайын түсіндірме бар. ЖИ қосымша, кеңірек талдау береді. Ол үшін тегін <a href="https://console.groq.com/keys" target="_blank" rel="noopener">Groq кілті</a> керек. Кілт тек осы браузерде сақталады және тек api.groq.com мекенжайына жіберіледі.</p>' +
      '<label class="lbl">Groq API кілті<input class="field" id="aiKey" type="password" autocomplete="off" placeholder="gsk_…" value="' + esc(Store.settings.aiKey || "") + '"></label>' +
      '<label class="lbl">Модель<input class="field" id="aiModel" placeholder="' + Shyn.AI.defaultModel + '" value="' + esc(Store.settings.aiModel || "") + '"></label>' +
      '<p class="muted">Бос қалдырсаңыз, ' + Shyn.AI.defaultModel + ' қолданылады. Сұрау лимиті үлкенірек модель: llama-3.1-8b-instant.</p>' +
      '<div class="modal__actions"><button class="btn btn--primary" id="aiSave">Сақтау</button><button class="btn btn--ghost" data-close>Болдырмау</button></div>');
    U.$("#aiSave").addEventListener("click", function () { Store.set("aiKey", U.$("#aiKey").value.trim()); Store.set("aiModel", U.$("#aiModel").value.trim()); Shyn.closeModal(); U.toast("ЖИ баптаулары сақталды"); });
  };
  Shyn.route("settings", function () {
    var s = Store.settings;
    view.innerHTML = '<header class="page-head"><h1>Баптаулар</h1></header>' +
      '<section class="block settings">' +
        '<div class="set"><div><h3>Емтихан күні</h3><p class="muted">Басты бетте емтиханға дейінгі кері санақ көрсетіледі.</p></div><input type="date" class="field" id="sDate" value="' + esc(s.examDate || "") + '"></div>' +
        '<div class="set"><div><h3>Тақырып</h3><p class="muted">«Жүйелік» — құрылғы баптауына қарай.</p></div><div class="seg">' + [["auto", "Жүйелік"], ["light", "Жарық"], ["dark", "Қараңғы"]].map(function (t) {
          return '<button data-th="' + t[0] + '" class="' + ((s.theme || "auto") === t[0] ? "is-on" : "") + '">' + t[1] + '</button>'; }).join("") + '</div></div>' +
        '<div class="set"><div><h3>Қаріп өлшемі</h3><p class="muted">Ұзын сұрақтарды оқуға ыңғайлы болу үшін.</p></div><div class="seg">' + [[0.92, "Кіші"], [1, "Қалыпты"], [1.1, "Үлкен"], [1.22, "Өте үлкен"]].map(function (f) {
          return '<button data-fs="' + f[0] + '" class="' + ((s.fontScale || 1) == f[0] ? "is-on" : "") + '">' + f[1] + '</button>'; }).join("") + '</div></div>' +
        '<div class="set"><div><h3>ЖИ түсіндірмесі</h3><p class="muted">' + (Shyn.AI.hasKey() ? "Кілт сақталған." : "Кілт енгізілмеген — ЖИ батырмасы осы терезені ашады.") + '</p></div><button class="btn btn--line" id="sAI">Баптау</button></div>' +
        '<div class="set"><div><h3>Прогресс файлы</h3><p class="muted">Басқа құрылғыға немесе браузерге көшіру үшін экспорттап, сол жерде импорттаңыз.</p></div><div class="inline"><button class="btn btn--line" id="sExp">Экспорт</button><label class="btn btn--line">Импорт<input type="file" accept="application/json,.json" id="sImp" hidden></label></div></div>' +
        '<div class="set set--danger"><div><h3>Барлық прогресті өшіру</h3><p class="muted">Нәтижелер, қателер, карточкалар және тарих өшіріледі. Қайтару мүмкін емес.</p></div><button class="btn btn--no" id="sReset">Өшіру</button></div>' +
      '</section>' +
      '<section class="block"><h2>Жоба туралы</h2><p class="muted">Шың — магистратураға кешенді тестілеуге дайындалуға арналған офлайн жаттықтырғыш. Интернетсіз де, тіркелусіз де жұмыс істейді: прогресс тек сіздің браузеріңізде. Балл ресми ереже бойынша есептеледі: алгоритмдерде бір жауап — 1 балл, деректер қорында толық дұрыс жиын — 2 балл, ішінара — 1 балл.</p></section>';
    U.$("#sDate").addEventListener("change", function (e) { Store.set("examDate", e.target.value); U.toast(e.target.value ? "Емтихан күні сақталды" : "Емтихан күні өшірілді"); });
    U.on("[data-th]", "click", function (e, el) { Store.set("theme", el.getAttribute("data-th")); Shyn.applyTheme(); Shyn._keepScroll = true; Shyn.render(); }, view);
    U.on("[data-fs]", "click", function (e, el) { Store.set("fontScale", +el.getAttribute("data-fs")); Shyn.applyTheme(); Shyn._keepScroll = true; Shyn.render(); }, view);
    U.$("#sAI").addEventListener("click", Shyn.openAIModal);
    U.$("#sExp").addEventListener("click", function () {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([Store.exportAll()], { type: "application/json" }));
      a.download = "shyn-progress-" + U.dayKey() + ".json"; document.body.appendChild(a); a.click(); a.remove();
    });
    U.$("#sImp").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { try { Store.importAll(r.result); Shyn.applyTheme(); U.toast("Прогресс импортталды"); Shyn.render(); } catch (err) { U.toast("Импорт сәтсіз: " + err.message); } };
      r.readAsText(f);
    });
    U.$("#sReset").addEventListener("click", function () { Shyn.ask("Барлық прогресті өшіресіз бе? Бұл әрекетті қайтару мүмкін емес.", "Өшіру", "Болдырмау", function () { Store.resetAll(); U.toast("Прогресс өшірілді"); Shyn.render(); }); });
  });
})(window);
