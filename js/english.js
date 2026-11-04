/* Шың — ағылшын грамматикасы курсы: оқу жолы, сабақтар, аралықпен қайталау, шақтар кестесі және «Шақ жарысы» ойыны. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var view = document.getElementById("view");
  var G = Shyn.grammar;
  if (!G) return;

  var IMP = {
    r: { name: "Өте маңызды", hint: "Емтиханда ең жиі кездеседі — алдымен осыны меңгеріңіз" },
    y: { name: "Маңызды", hint: "Жиі кездеседі — негізгілерден кейін" },
    g: { name: "Білген жөн", hint: "Сирек кездеседі — уақыт болса" }
  };
  var ORDER = []; G.units.forEach(function (u) { ORDER = ORDER.concat(u.topics); });
  var MAX_LVL = 3, GOAL_DEFAULT = 30;
  var GAP_DAYS = [0, 1, 3, 7, 14];

  /* ================= Сақтау (браузерде ғана) ================= */
  var KEY = "shyn_eng_v1";
  var E = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  E.topics = E.topics || {}; E.items = E.items || {}; E.days = E.days || {}; E.xp = E.xp || 0; E.game = E.game || { best: 0, plays: 0 };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(E)); } catch (e) {} }
  function today() { return U.dayKey(new Date()); }
  function tState(id) { return E.topics[id] || { lvl: 0, due: 0, done: 0, right: 0, total: 0 }; }
  function goal() { return E.goal || GOAL_DEFAULT; }
  function todayXP() { return E.days[today()] || 0; }
  function addXP(n) { E.xp += n; E.days[today()] = todayXP() + n; save(); }
  function streak() {
    var n = 0, d = new Date();
    if (!E.days[U.dayKey(d)]) d.setDate(d.getDate() - 1);
    while (E.days[U.dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function isDue(id) { var t = tState(id); return t.lvl > 0 && t.due <= Date.now(); }
  function dueTopics() { return ORDER.filter(isDue); }
  function weakItems() { return Object.keys(E.items).filter(function (k) { return E.items[k] > 0; }); }
  function nextTopic() {
    // Алдымен «өте маңызды», сосын «маңызды», сосын қалғаны — бірақ әр топ ішінде курстағы ретімен.
    var pick = null;
    ["r", "y", "g"].some(function (imp) {
      pick = ORDER.filter(function (id) { return G.topics[id].imp === imp && tState(id).lvl === 0; })[0] || null;
      return !!pick;
    });
    if (pick) return pick;
    return ORDER.slice().sort(function (a, b) { return tState(a).lvl - tState(b).lvl; })[0];
  }
  function itemKey(tid, i) { return tid + "#" + i; }

  /* ================= Ортақ бөліктер ================= */
  function crowns(lvl) {
    var s = ""; for (var i = 0; i < MAX_LVL; i++) s += '<i class="' + (i < lvl ? "on" : "") + '"></i>';
    return '<span class="crowns" aria-label="Деңгей ' + lvl + ' / ' + MAX_LVL + '">' + s + '</span>';
  }
  function impBadge(imp) { return '<span class="imp imp--' + imp + '">' + IMP[imp].name + '</span>'; }
  function legend() {
    return '<div class="implegend">' + ["r", "y", "g"].map(function (k) {
      return '<span class="implegend__i"><span class="dot dot--' + k + '"></span><b>' + IMP[k].name + '</b><small>' + IMP[k].hint + '</small></span>';
    }).join("") + '</div>';
  }
  function engNav(active) { return ""; }
  function engNavOld(active) {
    var tabs = [["", "Оқу жолы"], ["review", "Қайталау"], ["table", "12 шақ"], ["build", "Құрастырғыш"], ["pron", "Есімдіктер"], ["verbs", "Етістіктер"], ["game", "Ойын"]];
    return '<nav class="engnav" aria-label="Курс бөлімдері">' + tabs.map(function (t) {
      return '<a href="#/eng' + (t[0] ? "/" + t[0] : "") + '" class="' + (active === t[0] ? "is-on" : "") + '">' + t[1] + '</a>';
    }).join("") + '</nav>';
  }
  function fmtForm(form) {
    return '<dl class="formula">' + Object.keys(form).map(function (k) {
      return '<div><dt>' + esc(k) + '</dt><dd>' + esc(form[k]) + '</dd></div>';
    }).join("") + '</dl>';
  }

  /* ================= Оқу жолы ================= */
  Shyn.route("eng", function (args) {
    var sub = args[0] || "";
    if (sub === "t") return topicPage(args[1]);
    if (sub === "l") return startLesson("topic", args[1]);
    if (sub === "review") return reviewPage();
    if (sub === "table") return tablePage();
    if (sub === "game") return gamePage();
    if (sub === "build") return buildPage();
    if (sub === "pron") return pronPage();
    if (sub === "verbs") return verbsPage();
    if (sub === "intensive" && Shyn.engIntensive) return Shyn.engIntensive();
    pathPage();
  });

  function pathPage() {
    var nxt = nextTopic(), due = dueTopics().length + Math.min(weakItems().length, 1);
    var tx = todayXP(), g = goal(), st = streak();
    var mastered = ORDER.filter(function (id) { return tState(id).lvl >= 1; }).length;
    view.innerHTML =
      '<header class="page-head"><h1>Ағылшын грамматикасы</h1><p class="muted">Негіздерден (есімдіктер, be, сұрақтар) бастап 12 шаққа және емтиханда жиі келетін құрылымдарға дейін. Әр сабақ — қысқа ереже және 8 жаттығу, 3–5 минут.</p></header>' +
      engNav("") +
      '<section class="engstat">' +
        '<div class="engstat__goal"><div class="ring-goal" style="--p:' + Math.min(100, Math.round(tx / g * 100)) + '"><span>' + tx + '<small>/ ' + g + ' XP</small></span></div>' +
          '<div><b>Бүгінгі мақсат</b><p class="muted">' + (tx >= g ? "Орындалды! Ертең де келіңіз." : "Тағы " + (g - tx) + " XP — шамамен " + Math.ceil((g - tx) / 80 * 1) + " сабақ.") + '</p></div></div>' +
        '<div class="engstat__n"><b>' + st + '</b><span>күн қатарынан</span></div>' +
        '<div class="engstat__n"><b>' + mastered + '/' + ORDER.length + '</b><span>тақырып меңгерілді</span></div>' +
        '<div class="engstat__n"><b>' + E.xp + '</b><span>барлық XP</span></div>' +
      '</section>' +
      '<section class="engnext">' +
        '<div><span class="engnext__k">Келесі сабақ</span><h2>' + esc(G.topics[nxt].name) + ' <span class="muted">· ' + esc(G.topics[nxt].kz) + '</span></h2>' + impBadge(G.topics[nxt].imp) + '</div>' +
        '<div class="engnext__btns"><a class="btn btn--gold" href="#/eng/l/' + nxt + '">Сабақты бастау</a>' +
          (due ? '<a class="btn btn--line" href="#/eng/review">Қайталау (' + dueTopics().length + ')</a>' : "") + '</div>' +
      '</section>' +
      legend() +
      G.units.map(function (u, ui) {
        return '<section class="unit"><header class="unit__h"><span class="unit__n">' + (ui + 1) + '-бөлім</span><h2>' + esc(u.title) + '</h2><span class="muted">' + esc(u.sub) + '</span></header>' +
          '<ol class="path">' + u.topics.map(function (id, i) {
            var t = G.topics[id], s = tState(id), due = isDue(id);
            return '<li class="node node--' + t.imp + (s.lvl >= MAX_LVL ? " is-gold" : s.lvl ? " is-done" : "") + (id === nxt ? " is-next" : "") + '" style="--i:' + i + '">' +
              '<a href="#/eng/t/' + id + '" class="node__btn" aria-label="' + esc(t.name) + '">' +
                '<span class="node__disc"><span class="node__ico">' + (s.lvl >= MAX_LVL ? "★" : s.lvl ? s.lvl : (id === nxt ? "▶" : i + 1)) + '</span></span>' +
                '<span class="node__txt"><b>' + esc(t.name) + '</b><small>' + esc(t.kz) + '</small>' + crowns(s.lvl) +
                (due ? '<em class="node__due">қайталау уақыты</em>' : "") + '</span>' +
              '</a></li>';
          }).join("") + '</ol></section>';
      }).join("");
  }

  /* ================= Тақырып беті (ереже) ================= */
  function topicPage(id) {
    var t = G.topics[id]; if (!t) return Shyn.go("#/eng");
    var s = tState(id);
    view.innerHTML =
      '<a class="link" href="#/eng">← Оқу жолына</a>' +
      '<header class="page-head topichead"><h1>' + esc(t.name) + '</h1><p class="muted">' + esc(t.kz) + '</p>' +
        '<div class="topichead__m">' + impBadge(t.imp) + crowns(s.lvl) + (s.total ? '<span class="muted">дәлдік ' + Math.round(s.right / s.total * 100) + '%</span>' : "") + '</div></header>' +
      '<section class="rule rule--' + t.imp + '"><p class="rule__why">' + esc(t.why) + '</p>' +
        '<h2>Қашан қолданылады</h2><ul>' + t.use.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
        '<h2>Формула</h2>' + fmtForm(t.form) +
        '<h2>Белгілері</h2><p class="markers">' + t.markers.map(function (m) { return '<span class="tag">' + esc(m) + '</span>'; }).join(" ") + '</p>' +
        '<h2>Мысалдар</h2><ul class="exs">' + t.ex.map(function (x) { return '<li><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></li>'; }).join("") + '</ul>' +
        '<p class="trap"><b>Тұзақ:</b> ' + esc(t.trap) + '</p>' +
      '</section>' +
      '<div class="lessonbar"><a class="btn btn--gold" href="#/eng/l/' + id + '">' + (s.lvl ? "Деңгейді көтеру" : "Сабақты бастау") + '</a>' +
        '<a class="btn btn--line" href="#/eng/game">Ойынмен бекіту</a></div>';
  }

  /* ================= Сабақ ағыны ================= */
  var L = null;
  function pickItems(list, n) { return U.shuffle(list).slice(0, n); }
  function itemsOf(id) { return G.topics[id].items.map(function (it, i) { return { tid: id, i: i, it: it }; }); }
  function startLesson(kind, id) {
    var q;
    if (kind === "topic") {
      if (!G.topics[id]) return Shyn.go("#/eng");
      q = U.shuffle(itemsOf(id));
    } else {
      // Қайталау: мерзімі келген тақырыптар + бұрын қате жіберілген жаттығулар
      var pool = [];
      dueTopics().forEach(function (tid) { pool = pool.concat(pickItems(itemsOf(tid), 3)); });
      weakItems().forEach(function (k) { var p = k.split("#"); if (G.topics[p[0]] && G.topics[p[0]].items[+p[1]]) pool.push({ tid: p[0], i: +p[1], it: G.topics[p[0]].items[+p[1]] }); });
      if (pool.length < 6) {
        var learned = ORDER.filter(function (tid) { return tState(tid).lvl > 0; });
        (learned.length ? learned : ORDER.slice(0, 4)).forEach(function (tid) { pool = pool.concat(pickItems(itemsOf(tid), 2)); });
      }
      var seen = {}; q = U.shuffle(pool).filter(function (x) { var k = itemKey(x.tid, x.i); if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 10);
    }
    L = { kind: kind, id: id, queue: q, pos: 0, total: q.length, firstTry: {}, wrongOnce: {}, right: 0, xp: 0, state: "ask", sel: null, built: [], startedAt: Date.now() };
    Shyn.go("#/lesson");
  }
  Shyn.route("lesson", function () { if (!L) return Shyn.go("#/eng"); drawLesson(); });

  function current() { return L.queue[L.pos]; }
  function optsFor(cur) {
    if (!cur._order) cur._order = U.shuffle(cur.it.o.map(function (_, i) { return i; }));
    return cur._order;
  }
  function wordsFor(cur) {
    if (!cur._words) { var w = cur.it.w.map(function (x, i) { return { t: x, i: i }; }); do { cur._words = U.shuffle(w); } while (w.length > 2 && cur._words.every(function (x, k) { return x.i === k; })); }
    return cur._words;
  }
  function drawLesson() {
    var cur = current();
    if (!cur) return finishLesson();
    var it = cur.it, t = G.topics[cur.tid], done = L.pos, pct = Math.round(done / (L.queue.length) * 100);
    var body;
    if (it.w) {
      var words = wordsFor(cur);
      body = '<p class="lq__task">Сөздерден сөйлем құраңыз</p>' +
        '<div class="build" id="built">' + (L.built.length ? L.built.map(function (wi) { return '<button class="word is-in" data-out="' + wi + '">' + esc(it.w[wi]) + '</button>'; }).join("") : '<span class="build__ph">Сөздерді ретімен басыңыз</span>') + '</div>' +
        '<div class="bank">' + words.map(function (w) {
          var used = L.built.indexOf(w.i) >= 0;
          return '<button class="word' + (used ? " is-used" : "") + '" data-in="' + w.i + '"' + (used || L.state !== "ask" ? " disabled" : "") + '>' + esc(w.t) + '</button>';
        }).join("") + '</div>';
    } else {
      body = '<p class="lq__task">Бос орынға дұрыс нұсқаны таңдаңыз</p>' +
        '<p class="lq__s">' + esc(it.s).replace("___", '<span class="gap">' + (L.sel !== null ? esc(it.o[L.sel]) : "&nbsp;") + '</span>') + '</p>' +
        '<div class="lopts">' + optsFor(cur).map(function (oi, k) {
          var cls = "lopt";
          if (L.sel === oi) cls += " is-sel";
          if (L.state !== "ask") { if (oi === it.a) cls += " is-ok"; else if (L.sel === oi) cls += " is-no"; }
          return '<button class="' + cls + '" data-o="' + oi + '"' + (L.state !== "ask" ? " disabled" : "") + '><kbd>' + (k + 1) + '</kbd>' + esc(it.o[oi]) + '</button>';
        }).join("") + '</div>';
    }
    var fb = "";
    if (L.state !== "ask") {
      var ok = L.state === "ok";
      var answer = it.w ? it.w.join(" ") : it.s.replace("___", it.o[it.a]);
      fb = '<div class="lfb lfb--' + (ok ? "ok" : "no") + '" role="status"><div><b>' + (ok ? pickPraise() : "Дұрыс жауап:") + '</b>' +
        (ok ? "" : '<p class="lfb__ans">' + esc(answer) + '</p>') + '<p>' + esc(it.e) + '</p></div>' +
        '<button class="btn ' + (ok ? "btn--ok" : "btn--no") + '" id="lNext">Келесі</button></div>';
    }
    view.innerHTML =
      '<div class="lesson">' +
        '<div class="lhead"><button class="lclose" id="lQuit" aria-label="Сабақтан шығу">×</button>' +
          '<div class="lprog" aria-label="Прогресс ' + pct + '%"><span style="width:' + pct + '%"></span></div>' +
          '<span class="lxp">' + L.xp + ' XP</span></div>' +
        '<p class="lq__topic">' + esc(t.name) + ' ' + impBadge(t.imp) + (cur.retry ? ' <span class="tag">қайта</span>' : "") + '</p>' +
        '<div class="lq">' + body + '</div>' +
        (L.state === "ask" ? '<div class="lfoot"><button class="btn btn--ghost" id="lSkip">Өткізіп жіберу</button><button class="btn btn--primary" id="lCheck"' + (canCheck() ? "" : " disabled") + '>Тексеру</button></div>' : fb) +
      '</div>';
    bindLesson();
  }
  var PRAISE = ["Дұрыс!", "Керемет!", "Тамаша!", "Жарайсыз!", "Дәл солай!"];
  function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
  function canCheck() { var it = current().it; return it.w ? L.built.length === it.w.length : L.sel !== null; }
  function bindLesson() {
    U.on("[data-o]", "click", function (e, el) { if (L.state !== "ask") return; L.sel = +el.getAttribute("data-o"); drawLesson(); }, view);
    U.on("[data-in]", "click", function (e, el) { if (L.state !== "ask") return; L.built.push(+el.getAttribute("data-in")); drawLesson(); }, view);
    U.on("[data-out]", "click", function (e, el) { if (L.state !== "ask") return; var v = +el.getAttribute("data-out"); L.built.splice(L.built.indexOf(v), 1); drawLesson(); }, view);
    var c = U.$("#lCheck"); if (c) c.addEventListener("click", check);
    var s = U.$("#lSkip"); if (s) s.addEventListener("click", function () { L.sel = -1; L.built = []; grade(false); });
    var n = U.$("#lNext"); if (n) { n.addEventListener("click", next); n.focus(); }
    U.$("#lQuit").addEventListener("click", function () {
      Shyn.ask("Сабақтан шығасыз ба? Бұл сабақтың прогресі сақталмайды.", "Шығу", "Жалғастыру", function () { L = null; Shyn.go("#/eng"); });
    });
  }
  function check() {
    var cur = current(), it = cur.it;
    var ok = it.w ? L.built.every(function (wi, k) { return it.w[wi] === it.w[k]; }) : L.sel === it.a;
    grade(ok);
  }
  function grade(ok) {
    var cur = current(), k = itemKey(cur.tid, cur.i);
    if (ok) {
      L.right++;
      var gain = cur.retry ? 5 : 10; L.xp += gain;
      if (!cur.retry) L.firstTry[k] = true;
      if (E.items[k]) { E.items[k] = Math.max(0, E.items[k] - 1); if (!E.items[k]) delete E.items[k]; }
    } else {
      E.items[k] = (E.items[k] || 0) + 1;
      if (!L.wrongOnce[k]) { L.wrongOnce[k] = true; L.queue.push({ tid: cur.tid, i: cur.i, it: cur.it, retry: true }); }
    }
    save();
    L.state = ok ? "ok" : "no";
    drawLesson();
  }
  function next() { L.pos++; L.sel = null; L.built = []; L.state = "ask"; drawLesson(); }

  function finishLesson() {
    var first = Object.keys(L.firstTry).length, acc = Math.round(first / L.total * 100);
    var bonus = acc === 100 ? 10 : 0, gain = L.xp + bonus;
    if (Shyn.Game) Shyn.Game.event("lesson", 1, gain);
    var lvlMsg = "";
    var touched = {}; L.queue.forEach(function (x) { touched[x.tid] = true; });
    Object.keys(touched).forEach(function (tid) {
      var s = tState(tid);
      var mine = L.queue.filter(function (x) { return x.tid === tid && !x.retry; });
      var good = mine.filter(function (x) { return L.firstTry[itemKey(x.tid, x.i)]; }).length;
      s.total += mine.length; s.right += good; s.done++;
      var a = mine.length ? good / mine.length : 0;
      if (a >= 0.8 && s.lvl < MAX_LVL) { s.lvl++; if (L.kind === "topic") lvlMsg = "Деңгей көтерілді: " + s.lvl + " / " + MAX_LVL; }
      else if (a < 0.5 && s.lvl > 1 && L.kind === "review") s.lvl--;
      s.due = Date.now() + (GAP_DAYS[Math.min(s.lvl, GAP_DAYS.length - 1)] || 1) * 864e5 * (a >= 0.8 ? 1 : 0.34);
      E.topics[tid] = s;
    });
    addXP(gain);
    var t = L.kind === "topic" ? G.topics[L.id] : null, nxt = nextTopic();
    var mins = Math.max(1, Math.round((Date.now() - L.startedAt) / 60000));
    view.innerHTML =
      '<div class="lesson lesson--done">' +
        '<div class="ldone__badge" aria-hidden="true">' + (acc >= 80 ? "★" : "✓") + '</div>' +
        '<h1>' + (acc >= 80 ? "Сабақ аяқталды!" : "Жақсы бастама!") + '</h1>' +
        (lvlMsg ? '<p class="ldone__lvl">' + lvlMsg + '</p>' : (t && acc < 80 ? '<p class="muted">Деңгей көтерілуі үшін бірінші әрекеттен кемінде 80% дұрыс жауап керек.</p>' : "")) +
        '<div class="ldone__stats"><div><b>+' + gain + '</b><span>XP' + (bonus ? " (+10 мінсіз)" : "") + '</span></div><div><b>' + acc + '%</b><span>бірінші әрекеттен</span></div><div><b>' + mins + '</b><span>мин</span></div></div>' +
        '<p class="muted">Бүгін: ' + todayXP() + ' / ' + goal() + ' XP · ' + streak() + ' күн қатарынан</p>' +
        '<div class="lessonbar">' +
          (t && acc < 80 ? '<a class="btn btn--gold" href="#/eng/l/' + L.id + '">Қайталап өту</a>' : '<a class="btn btn--gold" href="#/eng/l/' + nxt + '">Келесі: ' + esc(G.topics[nxt].name) + '</a>') +
          (t ? '<a class="btn btn--line" href="#/eng/t/' + L.id + '">Ережені қарау</a>' : "") +
          '<a class="btn btn--ghost" href="#/eng">Оқу жолына</a></div>' +
      '</div>';
    L = null;
  }

  /* ================= Қайталау ================= */
  function reviewPage() {
    var due = dueTopics(), weak = weakItems();
    var learned = ORDER.filter(function (id) { return tState(id).lvl > 0; });
    view.innerHTML =
      '<header class="page-head"><h1>Қайталау</h1><p class="muted">Меңгерілген тақырыптар 1, 3, 7 және 14 күннен кейін қайта шығады. Қате жіберген жаттығуларыңыз дұрыс жауап бергенше қайталанады.</p></header>' +
      engNav("review") +
      '<section class="revbox"><div class="revbox__n"><b>' + due.length + '</b><span>тақырыптың мерзімі келді</span></div>' +
        '<div class="revbox__n"><b>' + weak.length + '</b><span>қате жіберілген жаттығу</span></div>' +
        '<button class="btn btn--gold" id="revGo"' + (learned.length || weak.length ? "" : " disabled") + '>10 жаттығуды бастау</button></section>' +
      (learned.length ? "" : '<p class="muted">Алдымен оқу жолынан кемінде бір сабақ өтіңіз — сосын қайталауға тақырыптар жинала бастайды.</p>') +
      '<section class="block"><h2>Тақырыптардың күйі</h2><div class="revlist">' + ORDER.map(function (id) {
        var t = G.topics[id], s = tState(id);
        var when = !s.lvl ? "басталмаған" : s.due <= Date.now() ? "қайталау уақыты" : "қайталау: " + U.fmtDate(s.due);
        return '<a class="revrow" href="#/eng/t/' + id + '"><span class="dot dot--' + t.imp + '"></span><span class="revrow__n">' + esc(t.name) + '</span>' + crowns(s.lvl) +
          '<span class="revrow__w' + (isDue(id) ? " is-due" : "") + '">' + when + '</span></a>';
      }).join("") + '</div></section>';
    var b = U.$("#revGo"); if (b) b.addEventListener("click", function () { startLesson("review"); });
  }

  /* ================= Шақтар кестесі ================= */
  function tablePage() {
    var rows = [["simple", "Simple"], ["continuous", "Continuous"], ["perfect", "Perfect"], ["perfectContinuous", "Perfect Continuous"]];
    var cols = [["present", "Осы шақ · Present"], ["past", "Өткен шақ · Past"], ["future", "Келер шақ · Future"]];
    function cell(time, aspect) {
      var id = ORDER.filter(function (k) { var t = G.topics[k]; return t.tense && t.tense[0] === time && t.tense[1] === aspect; })[0];
      var t = G.topics[id], s = tState(id);
      return '<td><a class="tcell tcell--' + t.imp + '" href="#/eng/t/' + id + '"><b>' + esc(t.name.split(" · ")[0]) + '</b>' +
        '<code>' + esc(t.form["+"]) + '</code><small>' + esc(t.markers.slice(0, 3).join(", ")) + '</small>' + crowns(s.lvl) + '</a></td>';
    }
    view.innerHTML =
      '<header class="page-head"><h1>12 шақтың кестесі</h1><p class="muted">Түс — емтихандағы маңыздылығы. Ұяшықты басып, ережесін ашыңыз.</p></header>' +
      engNav("table") + legend() +
      '<div class="tablewrap"><table class="tenses"><thead><tr><th></th>' + cols.map(function (c) { return '<th scope="col">' + c[1] + '</th>'; }).join("") + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><th scope="row">' + r[1] + '</th>' + cols.map(function (c) { return cell(c[0], r[0]); }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div>' +
      '<section class="block"><h2>Тез еске түсіру</h2><ul class="cheat">' +
        '<li><b>Simple</b> — факт, әдет, жай оқиға.</li><li><b>Continuous</b> (be + -ing) — белгілі бір сәтте жүріп жатқан процесс.</li>' +
        '<li><b>Perfect</b> (have + V3) — белгілі бір сәтке дейін аяқталған, нәтижесі бар.</li><li><b>Perfect Continuous</b> (have been + -ing) — белгілі бір сәтке дейін қанша уақыт созылғаны.</li></ul></section>';
  }

  /* ================= Ойын: Шақ жарысы ================= */
  var GM = null;
  function gamePool(mode) {
    var ids = mode === "tenses" ? ORDER.filter(function (k) { return G.topics[k].tense; }) : mode === "red" ? ORDER.filter(function (k) { return G.topics[k].imp === "r"; }) : ORDER;
    var pool = []; ids.forEach(function (id) { G.topics[id].items.forEach(function (it, i) { if (!it.w) pool.push({ tid: id, i: i, it: it }); }); });
    return pool;
  }
  function gamePage() {
    if (GM && GM.running) return drawGame();
    var last = GM && GM.over ? GM : null;
    view.innerHTML =
      '<header class="page-head"><h1>Шақ жарысы</h1><p class="muted">60 секунд ішінде мүмкіндігінше көп сөйлемді дұрыс толтырыңыз. Қатарынан дұрыс жауап — ұпай көбейткіші, қате — 3 секунд айыпұл.</p></header>' +
      engNav("game") +
      (last ? '<section class="gover"><div class="gover__score"><b>' + last.score + '</b><span>ұпай' + (last.newBest ? " · жаңа рекорд!" : "") + '</span></div>' +
        '<div class="gover__m"><span>Дұрыс: <b>' + last.right + '</b></span><span>Қате: <b>' + last.misses.length + '</b></span><span>Ең ұзын серия: <b>' + last.maxCombo + '</b></span></div>' +
        (last.misses.length ? '<h2>Қателерді талдау</h2><ul class="gmiss">' + last.misses.slice(0, 8).map(function (m) {
          return '<li><b>' + esc(m.it.s.replace("___", m.it.o[m.it.a])) + '</b><span>' + esc(m.it.e) + '</span></li>'; }).join("") + '</ul>' : "") + '</section>' : "") +
      '<section class="gstart"><div class="gbest">Рекорд: <b>' + E.game.best + '</b> · ойналды: ' + E.game.plays + '</div>' +
        '<div class="gmodes" role="radiogroup" aria-label="Сұрақтар жиыны">' +
          [["tenses", "12 шақ"], ["red", "Өте маңыздылар"], ["all", "Барлық тақырып"]].map(function (m, i) {
            return '<label class="gmode"><input type="radio" name="gmode" value="' + m[0] + '"' + ((E.game.mode || "tenses") === m[0] ? " checked" : "") + '><span>' + m[1] + '</span></label>';
          }).join("") + '</div>' +
        '<button class="btn btn--gold btn--big" id="gGo">' + (last ? "Тағы ойнау" : "Бастау") + '</button></section>';
    U.$("#gGo").addEventListener("click", function () {
      var m = (U.$('input[name="gmode"]:checked') || {}).value || "tenses"; E.game.mode = m; save();
      startGame(m);
    });
  }
  function startGame(mode) {
    GM = { running: true, mode: mode, pool: U.shuffle(gamePool(mode)), k: 0, score: 0, combo: 0, maxCombo: 0, right: 0, misses: [], end: Date.now() + 60000, lock: false };
    nextGameQ(); drawGame(); tick();
  }
  function nextGameQ() {
    if (GM.k >= GM.pool.length) { GM.pool = U.shuffle(GM.pool); GM.k = 0; }
    GM.cur = GM.pool[GM.k++]; GM.order = U.shuffle(GM.cur.it.o.map(function (_, i) { return i; })); GM.flash = null;
  }
  function tick() {
    if (!GM || !GM.running) return;
    var left = Math.max(0, GM.end - Date.now());
    var el = U.$("#gTime"), bar = U.$("#gBar");
    if (!el) { GM.running = false; return; } // экраннан кетті
    el.textContent = Math.ceil(left / 1000);
    bar.style.width = (left / 600) + "%";
    if (left <= 0) return endGame();
    GM.timer = setTimeout(tick, 200);
  }
  function drawGame() {
    var it = GM.cur.it, t = G.topics[GM.cur.tid], mult = Math.min(5, 1 + Math.floor(GM.combo / 3));
    view.innerHTML =
      '<div class="game' + (GM.flash ? " is-" + GM.flash : "") + '">' +
        '<div class="ghead"><span class="gscore"><b>' + GM.score + '</b> ұпай</span><span class="gcombo' + (mult > 1 ? " is-hot" : "") + '">×' + mult + '</span><span class="gtime"><b id="gTime">60</b> с</span></div>' +
        '<div class="gbar"><span id="gBar"></span></div>' +
        '<p class="gq__t"><span class="dot dot--' + t.imp + '"></span>' + esc(t.name) + '</p>' +
        '<p class="gq__s">' + esc(it.s).replace("___", '<span class="gap">?</span>') + '</p>' +
        '<div class="gopts">' + GM.order.map(function (oi, k) { return '<button class="gopt" data-g="' + oi + '"><kbd>' + (k + 1) + '</kbd>' + esc(it.o[oi]) + '</button>'; }).join("") + '</div>' +
        '<button class="btn btn--ghost" id="gStop">Аяқтау</button>' +
      '</div>';
    U.on("[data-g]", "click", function (e, el) { answerGame(+el.getAttribute("data-g"), el); }, view);
    U.$("#gStop").addEventListener("click", endGame);
    var left = Math.max(0, GM.end - Date.now());
    U.$("#gTime").textContent = Math.ceil(left / 1000); U.$("#gBar").style.width = (left / 600) + "%";
  }
  function answerGame(oi, el) {
    if (!GM || GM.lock || !GM.running) return;
    var ok = oi === GM.cur.it.a;
    if (ok) {
      GM.combo++; GM.maxCombo = Math.max(GM.maxCombo, GM.combo); GM.right++;
      GM.score += 10 * Math.min(5, 1 + Math.floor((GM.combo - 1) / 3)); GM.end += 1000; GM.flash = "ok";
    } else {
      GM.combo = 0; GM.end -= 3000; GM.flash = "no"; GM.misses.push(GM.cur);
      var k = itemKey(GM.cur.tid, GM.cur.i); E.items[k] = (E.items[k] || 0) + 1; save();
    }
    GM.lock = true;
    el.classList.add(ok ? "is-ok" : "is-no");
    if (!ok) { var r = view.querySelector('[data-g="' + GM.cur.it.a + '"]'); if (r) r.classList.add("is-ok"); }
    setTimeout(function () { if (!GM || !GM.running) return; GM.lock = false; nextGameQ(); drawGame(); }, ok ? 350 : 1100);
  }
  function endGame() {
    if (!GM) return;
    clearTimeout(GM.timer); GM.running = false; GM.over = true;
    E.game.plays++; GM.newBest = GM.score > E.game.best; if (GM.newBest) E.game.best = GM.score;
    var xp = Math.min(30, Math.round(GM.score / 10)); if (xp) addXP(xp); else save();
    gamePage();
  }

  /* ================= Етістік түрлендіргіш (құрастырғыш үшін) ================= */
  var IRR = {}; (G.irregular || []).forEach(function (r) { IRR[r[0]] = { v2: r[1].split(" / ")[0], v3: r[2].split(" / ")[0], kz: r[3] }; });
  var REG = {}; (G.regular || []).forEach(function (r) { REG[r[0]] = r[1]; });
  var DOUBLE = { stop: 1, plan: 1, run: 1, sit: 1, swim: 1, get: 1, put: 1, cut: 1, begin: 1, shop: 1, travel: 1, hit: 1, set: 1, let: 1, shut: 1, win: 1, forget: 1 };
  var V = {
    s3: function (v) { if (v === "have") return "has"; if (v === "be") return "is"; if (/(s|sh|ch|x|z|o)$/.test(v)) return v + "es"; if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ies"; return v + "s"; },
    ing: function (v) { if (v === "be") return "being"; if (/ie$/.test(v)) return v.slice(0, -2) + "ying"; if (/[^aeiouy]e$/.test(v) && v !== "be") return v.slice(0, -1) + "ing"; if (DOUBLE[v]) return v + v.slice(-1) + "ing"; return v + "ing"; },
    ed: function (v) { if (/e$/.test(v)) return v + "d"; if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ied"; if (DOUBLE[v]) return v + v.slice(-1) + "ed"; return v + "ed"; },
    v2: function (v) { return IRR[v] ? IRR[v].v2 : V.ed(v); },
    v3: function (v) { return IRR[v] ? IRR[v].v3 : V.ed(v); }
  };
  var SUBJ = [["I", "мен"], ["you", "сен / сіз"], ["he", "ол (ер)"], ["she", "ол (әйел)"], ["it", "ол (зат)"], ["we", "біз"], ["they", "олар"]];
  var TENSES = [
    ["ps", "Present Simple", "present-simple"], ["pc", "Present Continuous", "present-continuous"], ["pp", "Present Perfect", "present-perfect"], ["ppc", "Present Perfect Continuous", "present-perfect-continuous"],
    ["pas", "Past Simple", "past-simple"], ["pac", "Past Continuous", "past-continuous"], ["pap", "Past Perfect", "past-perfect"], ["papc", "Past Perfect Continuous", "past-perfect-continuous"],
    ["fs", "Future Simple", "future-simple"], ["fc", "Future Continuous", "future-continuous"], ["fp", "Future Perfect", "future-perfect"], ["fpc", "Future Perfect Continuous", "future-perfect-continuous"]
  ];
  function third(s) { return s === "he" || s === "she" || s === "it"; }
  function beP(s) { return s === "I" ? "am" : third(s) ? "is" : "are"; }
  function beW(s) { return s === "I" || third(s) ? "was" : "were"; }
  function hv(s) { return third(s) ? "has" : "have"; }
  function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  var NEG = { am: "am not", is: "isn't", are: "aren't", was: "wasn't", were: "weren't", have: "haven't", has: "hasn't", had: "hadn't", will: "won't", do: "don't", does: "doesn't", did: "didn't" };
  /* Шақ бойынша: [көмекші, қалған бөлігі] — болымды, болымсыз және сұраулы түрлер осыдан құралады */
  function parts(t, s, v, passive) {
    var ing = V.ing(v), v3 = V.v3(v);
    if (passive && v === "be") return null;
    if (passive) {
      var P = { ps: [beP(s), "", v3], pc: [beP(s), "being", v3], pp: [hv(s), "been", v3], pas: [beW(s), "", v3], pac: [beW(s), "being", v3], pap: ["had", "been", v3], fs: ["will", "be", v3], fp: ["will", "have been", v3] }[t];
      return P ? { aux: P[0], mid: P[1], main: P[2] } : null;
    }
    if (v === "be") {
      if (/c$/.test(t)) return null; // be етістігі созылыңқы шақтарда іс жүзінде қолданылмайды
      var B = { ps: [beP(s), "", ""], pas: [beW(s), "", ""] }[t];
      if (B) return { aux: B[0], mid: B[1], main: B[2], beMain: true };
    }
    switch (t) {
      case "ps": return { aux: third(s) ? "does" : "do", main: v, pos: third(s) ? V.s3(v) : v };
      case "pas": return { aux: "did", main: v, pos: V.v2(v) };
      case "pc": return { aux: beP(s), main: ing };
      case "pac": return { aux: beW(s), main: ing };
      case "pp": return { aux: hv(s), main: v3 };
      case "pap": return { aux: "had", main: v3 };
      case "ppc": return { aux: hv(s), mid: "been", main: ing };
      case "papc": return { aux: "had", mid: "been", main: ing };
      case "fs": return { aux: "will", main: v };
      case "fc": return { aux: "will", mid: "be", main: ing };
      case "fp": return { aux: "will", mid: "have", main: v3 };
      case "fpc": return { aux: "will", mid: "have been", main: ing };
    }
  }
  function forms(t, s, v, rest, passive) {
    var p = parts(t, s, v, passive); if (!p) return null;
    var tail = [p.mid, p.main].filter(Boolean).join(" "), r = rest ? " " + rest : "";
    var subj = s === "I" ? "I" : s;
    var pos = p.pos ? subj + " " + p.pos : subj + " " + p.aux + (tail ? " " + tail : "");
    var neg = p.pos ? subj + " " + NEG[p.aux] + " " + p.main : subj + " " + (NEG[p.aux] || p.aux + " not") + (tail ? " " + tail : "");
    var q = cap(p.aux) + " " + (s === "I" ? "I" : s) + (tail ? " " + tail : "");
    return { pos: cap(pos) + r + ".", neg: cap(neg) + r + ".", q: q + r + "?", aux: p.aux, main: p.main, mid: p.mid, simplePos: !!p.pos };
  }
  Shyn.engForms = forms; // тест үшін

  /* ================= Шақ құрастырғыш ================= */
  var B = { s: "she", v: "write", t: "pp", rest: "a letter", passive: false };
  function verbOptions() {
    var all = Object.keys(IRR).map(function (k) { return [k, IRR[k].kz, 1]; }).concat(Object.keys(REG).map(function (k) { return [k, REG[k], 0]; }));
    all.sort(function (a, b) { return a[0].localeCompare(b[0]); });
    return all.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === B.v ? " selected" : "") + '>' + x[0] + ' — ' + esc(x[1]) + (x[2] ? " (бұрыс)" : "") + '</option>'; }).join("");
  }
  function buildPage() {
    view.innerHTML =
      '<header class="page-head"><h1>Шақ құрастырғыш</h1><p class="muted">Бастауышты, етістікті және шақты таңдаңыз — сөйлемнің болымды, болымсыз және сұраулы түрі формуласымен бірге шығады. Ырықсыз етісті де көруге болады.</p></header>' +
      engNav("build") +
      '<section class="bform">' +
        '<div class="bform__f"><span class="lbl">Бастауыш (subject)</span><div class="chips">' + SUBJ.map(function (x) { return '<button class="chip' + (B.s === x[0] ? " is-on" : "") + '" data-bs="' + x[0] + '">' + x[0] + ' <small>' + x[1] + '</small></button>'; }).join("") + '</div></div>' +
        '<label class="bform__f lbl">Етістік<select class="field" id="bV">' + verbOptions() + '</select></label>' +
        '<label class="bform__f lbl">Толықтауыш / жалғасы (міндетті емес)<input class="field" id="bR" value="' + esc(B.rest) + '" placeholder="a letter, to school, every day…"></label>' +
        '<label class="check"><input type="checkbox" id="bP"' + (B.passive ? " checked" : "") + '> Ырықсыз етіс (Passive)</label>' +
      '</section>' +
      '<div id="bOut"></div>';
    U.on("[data-bs]", "click", function (e, el) { B.s = el.getAttribute("data-bs"); U.$$("[data-bs]").forEach(function (b) { b.classList.toggle("is-on", b === el); }); drawBuild(); }, view);
    U.$("#bV").addEventListener("change", function () { B.v = this.value; B.rest = ""; U.$("#bR").value = ""; drawBuild(); });
    U.$("#bR").addEventListener("input", function () { B.rest = this.value.trim(); drawBuild(); });
    U.$("#bP").addEventListener("change", function () { B.passive = this.checked; drawBuild(); });
    drawBuild();
  }
  function drawBuild() {
    var out = U.$("#bOut"); if (!out) return;
    var info = IRR[B.v] ? '<p class="vinfo"><b>' + B.v + '</b> — бұрыс етістік: V2 <b>' + IRR[B.v].v2 + '</b>, V3 <b>' + IRR[B.v].v3 + '</b>, -ing <b>' + V.ing(B.v) + '</b></p>'
      : '<p class="vinfo"><b>' + B.v + '</b> — дұрыс етістік: V2/V3 <b>' + V.ed(B.v) + '</b>, -ing <b>' + V.ing(B.v) + '</b>, he/she/it <b>' + V.s3(B.v) + '</b></p>';
    var groups = [["Осы шақ", 0], ["Өткен шақ", 4], ["Келер шақ", 8]];
    out.innerHTML = info + groups.map(function (g) {
      return '<section class="bgroup"><h2>' + g[0] + '</h2><div class="bcards">' + TENSES.slice(g[1], g[1] + 4).map(function (t) {
        var tp = G.topics[t[2]], f = forms(t[0], B.s, B.v, B.rest, B.passive);
        if (!f) return '<article class="bcard bcard--' + tp.imp + ' is-na"><h3>' + t[1] + '</h3><p class="muted">' + (B.passive ? "Ырықсыз етісте" : "be етістігімен") + ' бұл шақ іс жүзінде қолданылмайды.</p></article>';
        return '<article class="bcard bcard--' + tp.imp + '"><header><h3>' + t[1] + '</h3><a class="link" href="#/eng/t/' + t[2] + '">ереже</a></header>' +
          '<p class="bfx">' + esc(B.passive ? "be (" + t[1] + ") + V3" : tp.form["+"]) + '</p>' +
          '<ul class="bsent"><li><span class="sg sg--p">+</span><span>' + hl(f.pos, f) + '</span></li><li><span class="sg sg--n">−</span><span>' + hl(f.neg, f) + '</span></li><li><span class="sg sg--q">?</span><span>' + hl(f.q, f) + '</span></li></ul>' +
          '<p class="bmk">' + esc(tp.markers.slice(0, 3).join(" · ")) + '</p></article>';
      }).join("") + '</div></section>';
    }).join("");
  }
  function hl(sentence, f) {
    // көмекші етістік пен негізгі етістікті ерекшелеу
    var words = sentence.split(" "), keys = {};
    [f.aux, NEG[f.aux], f.main, f.mid].concat(f.mid ? f.mid.split(" ") : []).forEach(function (k) { if (k) keys[k.toLowerCase()] = 1; });
    if (f.simplePos) keys[(sentence.split(" ")[1] || "").replace(/[.?]$/, "").toLowerCase()] = 1;
    return words.map(function (w) { var c = w.replace(/[.?]$/, ""), end = w.slice(c.length); return keys[c.toLowerCase()] ? '<mark>' + esc(c) + '</mark>' + end : esc(w); }).join(" ");
  }

  /* ================= Есімдіктер кестесі және тренажер ================= */
  var PRON = [["I", "me", "my", "mine", "myself", "мен"], ["you", "you", "your", "yours", "yourself", "сен / сіз"], ["he", "him", "his", "his", "himself", "ол (ер)"], ["she", "her", "her", "hers", "herself", "ол (әйел)"], ["it", "it", "its", "—", "itself", "ол (зат)"], ["we", "us", "our", "ours", "ourselves", "біз"], ["they", "them", "their", "theirs", "themselves", "олар"]];
  var PCOL = [["Subject", "Бастауыш — етістіктің алдында", "I like tea."], ["Object", "Толықтауыш — етістік/предлогтан кейін", "She likes me."], ["Possessive adj.", "Зат есімнің алдында", "my book"], ["Possessive pron.", "Зат есімсіз, жеке", "It's mine."], ["Reflexive", "Өзіне бағытталған әрекет", "I did it myself."]];
  var PD = null;
  function pronPage() {
    view.innerHTML =
      '<header class="page-head"><h1>Есімдіктер</h1><p class="muted">Subject етістіктің алдында тұрады (кім?), object — етістіктен немесе предлогтан кейін (кімді? кімге?). Кестені қарап, төмендегі тренажерде тексеріңіз.</p></header>' +
      engNav("pron") +
      '<div class="tablewrap"><table class="pron"><thead><tr><th></th>' + PCOL.map(function (c) { return '<th scope="col">' + c[0] + '<small>' + c[1] + '</small></th>'; }).join("") + '</tr></thead><tbody>' +
        PRON.map(function (r) { return '<tr><th scope="row">' + r[5] + '</th>' + r.slice(0, 5).map(function (x, i) { return '<td class="pc' + i + '">' + x + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody><tfoot><tr><th>Мысал</th>' + PCOL.map(function (c) { return '<td>' + c[2] + '</td>'; }).join("") + '</tr></tfoot></table></div>' +
      '<section class="block"><h2>Тренажер: қай есімдік қойылады?</h2><div id="pd"></div></section>' +
      '<div class="lessonbar"><a class="btn btn--line" href="#/eng/t/pronouns">Ереже және сабақ</a></div>';
    PD = { n: 0, ok: 0 }; nextPron();
  }
  var PTEMPL = [
    [0, "___ am a student.", 0], [0, "___ lives in Almaty.", 2], [0, "___ are playing football.", 6], [0, "___ is my sister.", 3],
    [1, "Can you help ___?", 0], [1, "I saw ___ at the shop yesterday.", 2], [1, "This present is for ___.", 3], [1, "Please call ___ later.", 5], [1, "Look at ___! They're so funny.", 6],
    [2, "This is ___ car.", 2], [2, "We love ___ teacher.", 5], [2, "The cat is eating ___ food.", 4], [2, "Is this ___ bag, Dana?", 1],
    [3, "This book is not yours, it's ___.", 0], [3, "These seats are ___.", 6], [3, "The red bike is ___ — she bought it last week.", 3],
    [4, "He cut ___ while cooking.", 2], [4, "We enjoyed ___ at the party.", 5], [4, "She made the cake ___.", 3]
  ];
  function nextPron() {
    var el = U.$("#pd"); if (!el) return;
    var t = PTEMPL[Math.floor(Math.random() * PTEMPL.length)], col = t[0], right = PRON[t[2]][col];
    var pool = PRON.map(function (r) { return r[col]; }).filter(function (x) { return x !== "—" && x !== right; });
    var other = [0, 1, 2, 3, 4].filter(function (c) { return c !== col; }).map(function (c) { return PRON[t[2]][c]; }).filter(function (x) { return x !== right && x !== "—"; });
    var opts = U.shuffle([right].concat(U.shuffle(other).slice(0, 2)).concat(U.shuffle(pool).slice(0, 1))).filter(function (x, i, a) { return a.indexOf(x) === i; });
    PD.cur = { t: t, right: right, col: col };
    el.innerHTML = '<p class="pd__s">' + esc(t[1]).replace("___", '<span class="gap">?</span>') + '</p>' +
      '<div class="lopts">' + opts.map(function (o) { return '<button class="lopt" data-p="' + esc(o) + '">' + esc(o) + '</button>'; }).join("") + '</div>' +
      '<p class="muted pd__score">' + PD.ok + ' / ' + PD.n + ' дұрыс</p>';
    U.on("[data-p]", "click", function (e, b) {
      var v = b.getAttribute("data-p"), ok = v === PD.cur.right; PD.n++; if (ok) PD.ok++;
      U.$$("[data-p]").forEach(function (x) { x.disabled = true; if (x.getAttribute("data-p") === PD.cur.right) x.classList.add("is-ok"); });
      if (!ok) b.classList.add("is-no");
      var expl = ok ? "Дұрыс!" : "Дұрыс жауап: " + PD.cur.right;
      el.insertAdjacentHTML("beforeend", '<div class="lfb lfb--' + (ok ? "ok" : "no") + '"><div><b>' + expl + '</b><p>' + esc(PCOL[PD.cur.col][0] + " — " + PCOL[PD.cur.col][1].toLowerCase()) + '.</p></div><button class="btn ' + (ok ? "btn--ok" : "btn--no") + '" id="pdNext">Келесі</button></div>');
      if (ok) addXP(2);
      var sc = el.querySelector(".pd__score"); if (sc) sc.textContent = PD.ok + " / " + PD.n + " дұрыс";
      U.$("#pdNext").addEventListener("click", nextPron); U.$("#pdNext").focus();
    }, el);
  }

  /* ================= Бұрыс етістіктер: кесте және тренажер ================= */
  var VT = { q: "", mode: "table", cur: null, n: 0, ok: 0 };
  function verbsPage() {
    var list = G.irregular.filter(function (r) { var q = VT.q.toLowerCase(); return !q || r.join(" ").toLowerCase().indexOf(q) >= 0; });
    var known = E.verbs || (E.verbs = {});
    view.innerHTML =
      '<header class="page-head"><h1>Бұрыс етістіктер</h1><p class="muted">' + G.irregular.length + ' ең жиі етістік. Кестеден қарап, тренажерде V2 мен V3 түрін жазып жаттаңыз. Үш рет қатарынан дұрыс жазылған етістік «жатталды» деп белгіленеді.</p></header>' +
      engNav("verbs") +
      '<div class="toolbar"><div class="seg" role="group"><button data-vm="table" class="' + (VT.mode === "table" ? "is-on" : "") + '">Кесте</button><button data-vm="train" class="' + (VT.mode === "train" ? "is-on" : "") + '">Тренажер</button></div>' +
        (VT.mode === "table" ? '<input class="field toolbar__search" id="vq" type="search" placeholder="Іздеу: go, жазу…" value="' + esc(VT.q) + '">' : "") +
        '<span class="muted">Жатталды: ' + Object.keys(known).filter(function (k) { return known[k] >= 3; }).length + ' / ' + G.irregular.length + '</span></div>' +
      (VT.mode === "table" ? '<div class="tablewrap"><table class="verbs"><thead><tr><th>V1</th><th>V2 · Past Simple</th><th>V3 · Participle</th><th>Аудармасы</th></tr></thead><tbody>' +
        list.map(function (r) { var k = known[r[0]] >= 3; return '<tr' + (k ? ' class="is-known"' : "") + '><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + esc(r[3]) + (k ? ' <span class="tag">жатталды</span>' : "") + '</td></tr>'; }).join("") +
        '</tbody></table></div>' : '<section class="vtrain" id="vt"></section>');
    U.on("[data-vm]", "click", function (e, el) { VT.mode = el.getAttribute("data-vm"); verbsPage(); }, view);
    var q = U.$("#vq"); if (q) q.addEventListener("input", function () { VT.q = this.value; var pos = this.selectionStart; verbsPage(); var n = U.$("#vq"); n.focus(); n.setSelectionRange(pos, pos); });
    if (VT.mode === "train") nextVerb();
  }
  function nextVerb() {
    var el = U.$("#vt"); if (!el) return;
    var known = E.verbs || {};
    var pool = G.irregular.filter(function (r) { return (known[r[0]] || 0) < 3; }); if (!pool.length) pool = G.irregular;
    var r = pool[Math.floor(Math.random() * pool.length)]; VT.cur = r;
    el.innerHTML = '<p class="vt__k">Аудармасы: <b>' + esc(r[3]) + '</b></p><p class="vt__v1">' + r[0] + '</p>' +
      '<div class="vt__in"><label class="lbl">V2 (Past Simple)<input class="field" id="v2" autocomplete="off" autocapitalize="off" spellcheck="false"></label>' +
      '<label class="lbl">V3 (Participle)<input class="field" id="v3" autocomplete="off" autocapitalize="off" spellcheck="false"></label></div>' +
      '<div class="lfoot"><button class="btn btn--ghost" id="vSkip">Көрсету</button><button class="btn btn--primary" id="vCheck">Тексеру</button></div>' +
      '<p class="muted">' + VT.ok + ' / ' + VT.n + ' дұрыс · Enter — тексеру</p>';
    U.$("#v2").focus();
    U.$("#vCheck").addEventListener("click", checkVerb);
    U.$("#vSkip").addEventListener("click", function () { checkVerb(true); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var n = U.$("#vNext"); if (n) n.click(); else if (document.activeElement && document.activeElement.id === "v2") U.$("#v3").focus(); else checkVerb(); } });
  }
  function checkVerb(giveUp) {
    var r = VT.cur, a2 = (U.$("#v2").value || "").trim().toLowerCase(), a3 = (U.$("#v3").value || "").trim().toLowerCase();
    var ok2 = r[1].split(" / ").indexOf(a2) >= 0, ok3 = r[2].split(" / ").indexOf(a3) >= 0, ok = !giveUp && ok2 && ok3;
    E.verbs = E.verbs || {}; E.verbs[r[0]] = ok ? (E.verbs[r[0]] || 0) + 1 : 0; VT.n++; if (ok) { VT.ok++; addXP(2); } else save();
    var el = U.$("#vt");
    U.$("#v2").classList.add(ok2 && !giveUp ? "is-ok" : "is-no"); U.$("#v3").classList.add(ok3 && !giveUp ? "is-ok" : "is-no");
    U.$("#v2").disabled = U.$("#v3").disabled = true;
    var foot = el.querySelector(".lfoot");
    foot.outerHTML = '<div class="lfb lfb--' + (ok ? "ok" : "no") + '"><div><b>' + (ok ? "Дұрыс!" : "Дұрыс жауап:") + '</b><p class="lfb__ans">' + r[0] + ' — ' + r[1] + ' — ' + r[2] + '</p></div><button class="btn ' + (ok ? "btn--ok" : "btn--no") + '" id="vNext">Келесі</button></div>';
    U.$("#vNext").addEventListener("click", nextVerb); U.$("#vNext").focus();
  }

  /* ================= Пернетақта ================= */
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    var r = document.body.getAttribute("data-route");
    if (r === "lesson" && L) {
      var n = parseInt(e.key, 10);
      if (L.state === "ask" && n >= 1 && n <= 4 && !current().it.w) { var o = optsFor(current())[n - 1]; if (o !== undefined) { L.sel = o; drawLesson(); } }
      else if (e.key === "Enter") { e.preventDefault(); if (L.state === "ask") { if (canCheck()) check(); } else next(); }
    } else if (r === "eng" && GM && GM.running) {
      var g = parseInt(e.key, 10);
      if (g >= 1 && g <= 4) { var oi = GM.order[g - 1], b = view.querySelector('[data-g="' + oi + '"]'); if (b) answerGame(oi, b); }
    }
  });

  Shyn.engSummary = function () { var n = nextTopic(); return { xp: todayXP(), goal: goal(), next: G.topics[n].name, nextId: n, nextImp: G.topics[n].imp, due: dueTopics().length }; };
})(window);
