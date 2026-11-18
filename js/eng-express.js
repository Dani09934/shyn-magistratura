/* Шың — ағылшын: КТ-ға жедел режим және тыңдалым тренажері.
   #/express — диагностика (50 сұрақ КТ форматында), бөлімдер бойынша нәтиже, емтиханға дейінгі күнделікті жоспар.
   #/listen  — тыңдалым тренажері: 1) сұрақтарды алдын ала оқу, 2) тыңдау (жылдамдық бейімделеді), 3) жауап,
               4) сөйлем бойынша талдау (жауап тұрған сөйлем белгіленеді), 5) диктант. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, Store = Shyn.Store;
  var synth = global.speechSynthesis;
  var KEY = "shyn_express";
  var S; try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  S.done = S.done || {}; S.rate = S.rate || 0.8; S.listen = S.listen || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function today() { return U.dayKey(); }
  function examDay() { return Store.settings.examDate || "2026-11-29"; }
  function daysLeft() { return Math.round((new Date(examDay() + "T12:00:00") - new Date(today() + "T12:00:00")) / 864e5); }
  function md(dk) { var d = new Date(dk + "T12:00:00"); return d.getDate() + " " + U.MONTHS[d.getMonth()]; }
  function addDays(dk, n) { var d = new Date(dk + "T12:00:00"); d.setDate(d.getDate() + n); return U.dayKey(d); }
  // Диагностика орнына толық сынақ (ағылшын бар, кемінде 3 пән) те есептеледі
  function diagDone() { return Store.history().some(function (r) { return r.key === "express:diag" || (r.subj && r.subj.english && Object.keys(r.subj).length >= 3); }); }
  function ran(scope) { return Store.history().some(function (r) { return r.key === scope; }); }
  function view() { return document.getElementById("view"); }

  /* ================= Дауыс ================= */
  function voice() {
    if (!synth) return null;
    var v = synth.getVoices().filter(function (x) { return /^en(-|_|$)/i.test(x.lang); });
    var gb = v.filter(function (x) { return /en[-_]GB/i.test(x.lang); }), us = v.filter(function (x) { return /en[-_]US/i.test(x.lang); });
    var pool = gb.length ? gb : us.length ? us : v;
    return pool.filter(function (x) { return /natural|google|online/i.test(x.name); })[0] || pool[0] || null;
  }
  function speak(text, rate, onend) {
    if (!synth) { U.toast("Бұл браузерде дауыс жоқ — Chrome, Edge немесе Brave қолданыңыз"); return; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text), v = voice();
    u.lang = v ? v.lang : "en-GB"; if (v) u.voice = v; u.rate = rate || S.rate;
    u.onend = u.onerror = function () { if (onend) onend(); };
    synth.speak(u);
  }
  function stop() { if (synth) synth.cancel(); }
  global.addEventListener("hashchange", stop);
  function plain(t) { return String(t || "").replace(/<[^>]+>/g, " ").replace(/\*\*|__|`/g, "").replace(/\s+/g, " ").trim(); }
  function sentences(t) {
    return plain(t).replace(/([.!?])\s+(?=["“A-Z0-9])/g, "$1\u0001").split("\u0001").map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 1; });
  }

  /* ================= Деректер ================= */
  // Тыңдалым мәтіндері: бір тақырыпта екі мәтін болуы мүмкін — сондықтан мәтіннің өзі бойынша топтаймыз
  var LC = null;
  function groupsL() {
    if (LC) return LC;
    var d = Shyn._engData ? Shyn._engData() : null; if (!d) return [];
    var m = {}, out = [];
    d.groups.L.forEach(function (g) {
      g.qs.forEach(function (q) {
        if (!q.passage) return;
        var p = plain(q.passage), k = q._set + "|" + p.slice(0, 60);
        if (!m[k]) { m[k] = { key: k.replace(/[^\w|]+/g, "_").slice(0, 70), title: g.title, variant: g.variant, qs: [] }; out.push(m[k]); }
        m[k].qs.push(q);
      });
    });
    out = out.filter(function (g) { return g.qs.length >= 3; });
    var seen = {}; out.forEach(function (g) { var n = (seen[g.title + g.variant] = (seen[g.title + g.variant] || 0) + 1); if (n > 1) g.title += " (" + n + ")"; });
    LC = out; return out;
  }
  function groupByKey(k) { return groupsL().filter(function (g) { return g.key === k; })[0]; }
  function groupStat(g) {
    var a = 0, c = 0; g.qs.forEach(function (q) { var x = Store.learning(q.id); if (x) { a++; if (x.lastState === "correct") c++; } });
    return { a: a, c: c, pct: a ? Math.round(c / a * 100) : null };
  }
  function nextListen() {
    var G = groupsL(); if (!G.length) return null;
    var fresh = G.filter(function (g) { return !S.listen[g.key]; });
    return fresh[0] || G.slice().sort(function (a, b) { return (S.listen[a.key].pct || 0) - (S.listen[b.key].pct || 0); })[0];
  }
  function secStats() {
    var d = Shyn._engData ? Shyn._engData() : null; if (!d) return null;
    var out = { L: { a: 0, c: 0 }, G: { a: 0, c: 0 }, R: { a: 0, c: 0 } };
    d.all.forEach(function (q) {
      var x = Store.learning(q.id); if (!x) return;
      var s = Shyn._engSec(q); out[s].a++; if (x.lastState === "correct") out[s].c++;
    });
    ["L", "G", "R"].forEach(function (k) { out[k].pct = out[k].a ? Math.round(out[k].c / out[k].a * 100) : null; });
    return out;
  }
  function weakGrammar() {
    var d = Shyn._engData ? Shyn._engData() : null; if (!d) return [];
    return Store.topicStats(d.G).filter(function (t) { return t.attempts >= 2 && t.pct < 75; }).slice(0, 5);
  }
  function grammarSet() {
    var d = Shyn._engData(), weak = {}; weakGrammar().forEach(function (t) { weak[t.topic] = 1; });
    var w = U.shuffle(d.G.filter(function (q) { var x = Store.learning(q.id); return weak[q.topic] && (!x || x.lastState !== "correct"); })).slice(0, 10);
    var ids = {}; w.forEach(function (q) { ids[q.id] = 1; });
    var rest = Shyn._engPickG(18).filter(function (q) { return !ids[q.id]; });
    return w.concat(rest).slice(0, 18);
  }

  /* ================= Жедел жоспар ================= */
  var NAMES = { L: "Тыңдалым", G: "Лексика-грамматика", R: "Оқылым" };
  function dayType(dk) {
    var ex = examDay();
    if (dk >= ex) return "exam";
    if (dk === addDays(ex, -1)) return "review";
    if (dk === addDays(ex, -6) || dk === addDays(ex, -2)) return "mock";
    return "study";
  }
  function tasks(dk) {
    var t = dayType(dk), T = [];
    if (!diagDone()) T.push({ k: "diag", t: "Диагностика: 50 сұрақ КТ форматында", m: "Таймермен, 50 минут. Әлсіз жерлеріңді анықтайды — жоспар соған бейімделеді", done: false });
    if (t === "mock") T.push({ k: "mock", t: "Толық пробник: 50 сұрақ", m: "8:00-де, нақты емтихандағыдай таймермен", scope: "express:mock:" + dk });
    else if (t === "review") T.push({ k: "mist", t: "Тек қайталау: ағылшын қателері", m: "Жаңа тақырып жоқ. Ертерек жат", scope: "express:mist:" + dk });
    else if (t === "study") {
      T.push({ k: "L", t: "Тыңдалым тренажері: 1 мәтін", m: "~25 мин · сұрақтарды алдын ала оқу → тыңдау (" + S.rate.toFixed(2) + "×) → жауап → талдау → диктант", done: !!(S.done[dk] || {}).L });
      T.push({ k: "G", t: "Лексика-грамматика: 18 сұрақ", m: "~20 мин · алдымен әлсіз тақырыптарыңнан", scope: "express:g:" + dk });
      T.push({ k: "R", t: "Оқылым: 1 мәтін уақытпен", m: "~15 мин · 8 сұрақ, 10 минут", scope: "express:r:" + dk });
    }
    T.forEach(function (x) { if (x.scope) x.done = ran(x.scope); });
    return T;
  }
  function launch(x) {
    if (x.k === "diag") return Shyn.startTest("express:diag", "Жедел · Диагностика (ағылшын, 50 сұрақ)", Shyn._engMock(), { mode: "exam", secPerQ: 60, fresh: true });
    if (x.k === "mock") return Shyn.startTest(x.scope, "Жедел · Толық пробник (ағылшын)", Shyn._engMock(), { mode: "exam", secPerQ: 60 });
    if (x.k === "G") return Shyn.startTest(x.scope, "Жедел · Лексика-грамматика", grammarSet(), { mode: "practice" });
    if (x.k === "R") { var g = Shyn._engNext("R"); if (!g) return U.toast("Мәтін табылмады"); return Shyn.startTest(x.scope, "Жедел · Оқылым: " + g.title, g.qs, { mode: "exam", seconds: 600 }); }
    if (x.k === "L") { var l = nextListen(); if (!l) return U.toast("Тыңдалым мәтіні табылмады"); S.pendingDay = today(); save(); return Shyn.go("#/listen/" + encodeURIComponent(l.key)); }
    if (x.k === "mist") {
      var qs = Store.wrongIds().map(function (id) { return Shyn.questionById(id); }).filter(function (q) { return q && q._subject === "english"; });
      if (!qs.length) { U.toast("Ағылшын бойынша қате жоқ — керемет! Ерте демал."); S.done[today()] = Object.assign(S.done[today()] || {}, { mist: 1 }); save(); return; }
      return Shyn.startTest(x.scope, "Жедел · Ағылшын қателері", qs.slice(0, 30), { mode: "practice" });
    }
  }

  Shyn.expressToday = function () { return tasks(today()); };
  Shyn.expressRun = launch;
  Shyn.route("express", function () {
    var v = view(), left = daysLeft(), st = secStats(), dk = today();
    var T = tasks(dk), done = T.filter(function (x) { return x.done; }).length;
    var secHTML = st ? '<div class="xp-secs">' + ["L", "G", "R"].map(function (k) {
      var p = st[k].pct;
      return '<div class="xp-sec"><b>' + NAMES[k] + '</b>' + Shyn.bar(p || 0, Shyn.tone(p || 0)) + '<span>' + (p === null ? "дерек жоқ" : p + "% · " + st[k].a + " сұрақ") + '</span></div>';
    }).join("") + '</div>' : "";
    var weak = weakGrammar();
    var weakHTML = weak.length ? '<p class="muted">Әлсіз грамматика тақырыптары: ' + weak.map(function (t) { return "<b>" + esc(t.topic) + "</b> (" + t.pct + "%)"; }).join(", ") + '. Грамматика тапсырмасы алдымен соларды береді.</p>' : "";
    var strip = "";
    for (var i = 0; i <= Math.max(0, left); i++) {
      var d = addDays(dk, i), t = dayType(d);
      strip += '<span class="xp-day xp-day--' + t + (i === 0 ? " is-today" : "") + '" title="' + md(d) + '">' + new Date(d + "T12:00:00").getDate() + '<small>' + (t === "mock" ? "пробник" : t === "review" ? "қайталау" : t === "exam" ? "ТЕСТ" : "") + '</small></span>';
    }
    v.innerHTML = '<header class="page-head"><h1>Ағылшын: жедел режим</h1><p class="muted">Емтиханға дейін ' + (left > 0 ? left + " күн" : "уақыт қалмады") + '. Күніне ~1 сағат: тыңдалым 25 мин, грамматика 20 мин, оқылым 15 мин.</p></header>' +
      '<section class="xp-strip">' + strip + '</section>' +
      '<section class="block etoday"><div class="etoday__h"><div><span class="muted">' + md(dk) + '</span><h2>Бүгін</h2></div><div class="etoday__p"><b>' + done + ' / ' + T.length + '</b></div></div>' +
      (T.length ? '<ol class="etasks">' + T.map(function (x, i) {
        return '<li class="' + (x.done ? "is-done" : "") + '"><span class="gchk" aria-hidden="true"></span><span class="etasks__t"><b>' + esc(x.t) + '</b><small>' + esc(x.m) + '</small></span>' +
          (x.done ? '<span class="tone-ok small">Орындалды</span>' : '<button class="btn btn--' + (i === T.findIndex(function (y) { return !y.done; }) ? "gold" : "line") + '" data-xt="' + i + '">Бастау</button>') + '</li>';
      }).join("") + '</ol>' : '<p>Бүгін — емтихан күні. Сәттілік!</p>') + '</section>' +
      '<section class="block"><h2>Бөлімдер бойынша</h2>' + secHTML + weakHTML +
      '<div class="inline"><a class="btn btn--line" href="#/listen">Тыңдалым тренажері</a><button class="btn btn--line" id="xpDiag">Диагностиканы қайта тапсыру</button></div></section>' +
      '<section class="block xp-tips"><h2>Тыңдалымда балл жинау тәсілдері</h2><ol>' +
        '<li>Аудио басталғанша сұрақтарды оқып, <b>кілт сөздердің</b> астын сыз: аттар, сандар, күндер, жерлер.</li>' +
        '<li>Сұрақтар мәтін ретімен келеді. Бір жауапты өткізіп алсаң — тоқтама, келесісін тыңда.</li>' +
        '<li>Мәтінде синоним айтылады: сұрақта <i>cheap</i>, аудиода <i>not expensive</i>.</li>' +
        '<li><i>but, however, actually</i> сөздерінен кейін жауап жиі өзгереді — тұзақ сол жерде.</li>' +
        '<li>Бір сұраққа 30 секундтан артық тоқталма; жауапсыз қалдырма — бәрібір бір нұсқаны белгіле.</li></ol></section>';
    U.on("[data-xt]", "click", function (e, el) { launch(T[+el.getAttribute("data-xt")]); }, v);
    U.$("#xpDiag").addEventListener("click", function () { launch({ k: "diag" }); });
  });

  /* ================= Тыңдалым тренажері ================= */
  var R = null; // ағымдағы мәтін күйі
  function listView(v) {
    var G = groupsL(), nx = nextListen();
    var doneN = G.filter(function (g) { return S.listen[g.key]; }).length;
    v.innerHTML = '<header class="page-head"><h1>Тыңдалым тренажері</h1><p class="muted">Әр мәтін 5 қадам: сұрақтарды алдын ала оқу → тыңдау → жауап → сөйлем бойынша талдау → диктант. Жылдамдық нәтижеңе қарай өседі: қазір <b>' + S.rate.toFixed(2) + '×</b>.</p></header>' +
      (nx ? '<div class="inline"><a class="btn btn--gold" href="#/listen/' + encodeURIComponent(nx.key) + '">Келесі мәтін: ' + esc(nx.title) + '</a><span class="muted">' + doneN + ' / ' + G.length + ' мәтін өтілді</span></div>' : "") +
      '<div class="xl-grid">' + G.map(function (g) {
        var r = S.listen[g.key], st = groupStat(g);
        return '<a class="xl-card' + (r ? " is-done" : "") + '" href="#/listen/' + encodeURIComponent(g.key) + '"><b>' + esc(g.title) + '</b><small>Нұсқа ' + g.variant + ' · ' + g.qs.length + ' сұрақ</small>' +
          '<span>' + (r ? "Нәтиже: " + r.pct + "% · " + r.rate.toFixed(2) + "×" : st.a ? "Тестте: " + st.pct + "%" : "Өтілмеген") + '</span></a>';
      }).join("") + '</div>';
  }
  function stepsBar(n) {
    var L = ["Сұрақтар", "Тыңдау", "Жауап", "Талдау", "Диктант"];
    return '<ol class="xl-steps">' + L.map(function (t, i) { return '<li class="' + (i + 1 === n ? "is-on" : i + 1 < n ? "is-done" : "") + '"><span>' + (i + 1) + '</span>' + t + '</li>'; }).join("") + '</ol>';
  }
  function head(g) {
    return '<nav class="fy-crumbs"><a href="#/listen">Тыңдалым тренажері</a> / Нұсқа ' + g.variant + '</nav><header class="page-head"><h1>' + esc(g.title) + '</h1></header>' + stepsBar(R.step);
  }
  function rateSel() {
    return '<label class="tts__rate">Жылдамдық <select id="xlRate">' + [0.7, 0.8, 0.9, 1, 1.1, 1.2].map(function (r) {
      return '<option value="' + r + '"' + (Math.abs(r - R.rate) < 0.01 ? " selected" : "") + '>' + r.toFixed(1) + '×</option>'; }).join("") + '</select></label>';
  }
  function bindRate() { var s = U.$("#xlRate"); if (s) s.addEventListener("change", function () { R.rate = parseFloat(s.value); }); }

  // Жауап тұрған сөйлемді табу: сұрақ пен дұрыс нұсқаның мағыналы сөздері сөйлеммен қаншалықты сәйкес келеді
  var STOP = "the a an and or but to of in on at for with is are was were be been it this that he she they we you i his her their our my your what which who when where why how does did do will would can could has have had not no yes from by as so if than then there here about into out up".split(" ");
  function words(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(function (w) { return w.length > 2 && STOP.indexOf(w) < 0; }); }
  function locate(q, sents) {
    var ans = q.opts.filter(function (o) { return q.correct.indexOf(o.l) >= 0; }).map(function (o) { return o.t; }).join(" ");
    var aw = words(ans), qw = words(q.q), best = -1, bs = 0;
    sents.forEach(function (s, i) {
      var sw = words(s), score = 0;
      aw.forEach(function (w) { if (sw.indexOf(w) >= 0) score += 3; });
      qw.forEach(function (w) { if (sw.indexOf(w) >= 0) score += 1; });
      if (ans && s.toLowerCase().indexOf(ans.toLowerCase()) >= 0) score += 4;
      if (score > bs) { bs = score; best = i; }
    });
    return bs >= 3 ? best : -1;
  }

  function render() {
    var v = view(), g = R.g;
    if (R.step === 1) {
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>1. Алдымен сұрақтарды оқы</h2><p class="muted">Не тыңдау керегін біл: кілт сөздерді белгіле (аттар, сандар, жерлер). 40 секунд.</p>' +
        '<ol class="xl-pre">' + g.qs.map(function (q) { return '<li>' + esc(q.q) + '<small>' + q.opts.map(function (o) { return o.l + ") " + esc(o.t); }).join(" · ") + '</small></li>'; }).join("") + '</ol>' +
        '<div class="inline"><button class="btn btn--gold" id="xlNext">Дайынмын — тыңдау <span id="xlT">40</span></button></div></section>';
      var t = 40, el = U.$("#xlT");
      R.timer = setInterval(function () { t--; if (el) el.textContent = t; if (t <= 0) { clearInterval(R.timer); go(2); } }, 1000);
      U.$("#xlNext").addEventListener("click", function () { clearInterval(R.timer); go(2); });
    } else if (R.step === 2) {
      var q0 = g.qs[0];
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>2. Тыңда</h2><p class="muted">Транскриптке қарама. Нақты емтиханда мәтін бір-екі рет айтылады — сен де екі реттен артық тыңдама.</p>' +
        (q0.audio ? '<div class="audio"><audio controls src="' + encodeURI(q0.audio) + '"></audio></div>' : '<div class="inline"><button class="btn btn--primary" id="xlPlay">▶ Тыңдау</button>' + rateSel() + '<span class="muted" id="xlCnt">Тыңдалды: ' + R.plays + ' рет</span></div>') +
        (!q0.audio && !voice() ? '<p class="warn">Бұл браузерде ағылшын дауысы табылмады — мәтінді орыс дауысы оқуы мүмкін. Шешімі: Windows Параметрлері → Уақыт және тіл → Сөйлеу → «Дауыстар қосу» → English (United States/United Kingdom). Немесе тренажерді Microsoft Edge-те ашыңыз — онда сапалы ағылшын дауыстары бар.</p>' : "") +
        '<div class="inline"><button class="btn btn--gold" id="xlNext">Сұрақтарға жауап беру →</button></div></section>';
      bindRate();
      var pb = U.$("#xlPlay");
      if (pb) pb.addEventListener("click", function () {
        if (pb.classList.contains("is-on")) { stop(); pb.classList.remove("is-on"); pb.textContent = "▶ Тыңдау"; return; }
        pb.classList.add("is-on"); pb.textContent = "■ Тоқтату";
        speak(plain(q0.passage), R.rate, function () { pb.classList.remove("is-on"); pb.textContent = "▶ Қайта тыңдау"; R.plays++; var c = U.$("#xlCnt"); if (c) c.textContent = "Тыңдалды: " + R.plays + " рет"; });
      });
      U.$("#xlNext").addEventListener("click", function () { stop(); go(3); });
    } else if (R.step === 3) {
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>3. Жауап бер</h2>' +
        g.qs.map(function (q, i) {
          return '<div class="xl-q"><p><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</p><div class="xl-opts">' + q.opts.map(function (o) {
            return '<label><input type="radio" name="xq' + i + '" value="' + o.l + '"' + (R.ans[q.id] === o.l ? " checked" : "") + '> <b>' + o.l + ')</b> ' + esc(o.t) + '</label>'; }).join("") + '</div></div>';
        }).join("") +
        '<div class="inline"><button class="btn btn--gold" id="xlCheck">Тексеру</button></div></section>';
      U.$$(".xl-q input").forEach(function (inp) { inp.addEventListener("change", function () { R.ans[g.qs[+inp.name.slice(2)].id] = inp.value; }); });
      U.$("#xlCheck").addEventListener("click", function () {
        var miss = g.qs.filter(function (q) { return !R.ans[q.id]; }).length;
        if (miss && !R.confirmEmpty) { R.confirmEmpty = true; U.toast(miss + " сұрақ жауапсыз. Емтиханда бос қалдырма — тағы бір рет басыңыз"); return; }
        check(); go(4);
      });
    } else if (R.step === 4) {
      var sents = R.sents, mark = {};
      g.qs.forEach(function (q, i) { var k = locate(q, sents); if (k >= 0) (mark[k] = mark[k] || []).push(i + 1); });
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>4. Талдау: ' + R.score + ' / ' + g.qs.length + ' (' + R.pct + '%)</h2>' +
        '<p class="muted">' + R.rateMsg + '</p>' +
        '<ol class="xl-res">' + g.qs.map(function (q, i) {
          var ok = R.ans[q.id] && q.correct.indexOf(R.ans[q.id]) >= 0, right = q.opts.filter(function (o) { return q.correct.indexOf(o.l) >= 0; })[0];
          return '<li class="' + (ok ? "is-ok" : "is-no") + '"><b>' + (i + 1) + '.</b> ' + esc(q.q) + ' — <b>' + esc(right ? right.l + ") " + right.t : q.correct.join(",")) + '</b>' + (ok ? "" : ' <span class="muted">(сенікі: ' + esc(R.ans[q.id] || "—") + ')</span>') + '</li>';
        }).join("") + '</ol>' +
        '<h3>Мәтін сөйлем бойынша</h3><p class="muted">▶ — сол сөйлемді қайта тыңдау. Нөмірлер — жауап тұрған сөйлем.</p>' + rateSel() +
        '<div class="xl-sents">' + sents.map(function (s, i) {
          return '<div class="xl-sent' + (mark[i] ? " is-key" : "") + '"><button class="xl-play" data-si="' + i + '" aria-label="Тыңдау">▶</button><span>' + esc(s) + '</span>' + (mark[i] ? '<em>' + mark[i].map(function (n) { return n + "-сұрақ"; }).join(", ") + '</em>' : "") + '</div>';
        }).join("") + '</div>' +
        '<div class="inline"><button class="btn btn--gold" id="xlNext">5. Диктант →</button><button class="btn btn--line" id="xlSkip">Диктантсыз аяқтау</button></div></section>';
      bindRate();
      U.on("[data-si]", "click", function (e, b) { speak(sents[+b.getAttribute("data-si")], R.rate); }, v);
      U.$("#xlNext").addEventListener("click", function () { stop(); go(5); });
      U.$("#xlSkip").addEventListener("click", function () { stop(); finish(); });
    } else if (R.step === 5) {
      var D = R.dict;
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>5. Диктант: ' + (D.i + 1) + ' / ' + D.list.length + '</h2>' +
        '<p class="muted">Сөйлемді тыңда да, естігеніңді жаз. Тыныс белгілері мен бас әріп есептелмейді.</p>' +
        '<div class="inline"><button class="btn btn--primary" id="xlD">▶ Тыңдау</button><button class="btn btn--line" id="xlDs">▶ Баяу</button></div>' +
        '<textarea class="field xl-in" id="xlIn" rows="2" autocomplete="off" spellcheck="false" placeholder="Естігеніңді жаз…"></textarea>' +
        '<div id="xlOut"></div><div class="inline"><button class="btn btn--gold" id="xlChk">Тексеру</button></div></section>';
      var s = D.list[D.i];
      U.$("#xlD").addEventListener("click", function () { speak(s, R.rate); });
      U.$("#xlDs").addEventListener("click", function () { speak(s, 0.7); });
      speak(s, R.rate);
      var chk = U.$("#xlChk");
      chk.addEventListener("click", function () {
        if (chk.getAttribute("data-next")) { D.i++; if (D.i >= D.list.length) finish(); else render(); return; }
        var res = diff(s, U.$("#xlIn").value); D.ok += res.ok; D.total += res.total;
        U.$("#xlOut").innerHTML = '<p class="xl-diff">' + res.html + '</p><p class="muted">' + res.ok + ' / ' + res.total + ' сөз</p>';
        chk.textContent = D.i + 1 < D.list.length ? "Келесі сөйлем →" : "Аяқтау"; chk.setAttribute("data-next", "1");
      });
    } else if (R.step === 6) {
      var nx = nextListen();
      v.innerHTML = head(g) + '<section class="block xl-box"><h2>Мәтін аяқталды</h2><p><b>' + R.score + ' / ' + g.qs.length + '</b> дұрыс (' + R.pct + '%)' +
        (R.dict.total ? ' · диктант: ' + Math.round(R.dict.ok / R.dict.total * 100) + '%' : "") + '</p><p class="muted">' + R.rateMsg + '</p>' +
        '<div class="inline">' + (nx && nx.key !== g.key ? '<a class="btn btn--gold" href="#/listen/' + encodeURIComponent(nx.key) + '">Келесі мәтін</a>' : "") +
        '<a class="btn btn--line" href="#/express">Жедел жоспарға оралу</a><a class="btn btn--line" href="#/listen">Барлық мәтіндер</a></div></section>';
    }
  }
  function go(n) { R.step = n; Shyn._keepScroll = false; render(); global.scrollTo(0, 0); }
  function check() {
    var g = R.g, ok = 0;
    g.qs.forEach(function (q) {
      var sel = R.ans[q.id] ? [R.ans[q.id]] : [], r = Shyn.Score.question(q, sel);
      if (r.state === "correct") ok++;
      Store.recordLearning(q, r, "sure"); Store.markWrong(q.id, r.state !== "correct", sel);
    });
    R.score = ok; R.pct = Math.round(ok / g.qs.length * 100);
    var old = S.rate;
    if (R.pct >= 75) S.rate = Math.min(1.2, Math.round((S.rate + 0.1) * 100) / 100);
    else if (R.pct < 50) S.rate = Math.max(0.7, Math.round((S.rate - 0.05) * 100) / 100);
    R.rateMsg = S.rate > old ? "Жақсы! Келесі мәтін жылдамырақ болады: " + S.rate.toFixed(2) + "×." :
      S.rate < old ? "Қиын болды — келесі мәтін баяуырақ: " + S.rate.toFixed(2) + "×. Талдауда әр сөйлемді қайта тыңда." :
      "Жылдамдық сол күйінде: " + S.rate.toFixed(2) + "×. 75%-дан асса, жылдамдайды.";
    S.listen[g.key] = { pct: R.pct, rate: R.rate, at: Date.now() };
    var dk = S.pendingDay || today(); S.done[dk] = Object.assign(S.done[dk] || {}, { L: 1 }); S.pendingDay = null;
    save();
    if (Shyn.Game && Shyn.Game.addXP) Shyn.Game.addXP(5 + ok * 2, true);
  }
  function diff(target, typed) {
    var norm = function (s) { return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean); };
    var T = norm(target), Y = norm(typed), used = {}, ok = 0;
    var html = T.map(function (w) {
      var j = -1; for (var k = 0; k < Y.length; k++) if (!used[k] && Y[k] === w) { j = k; break; }
      if (j >= 0) { used[j] = 1; ok++; return '<span class="xl-w is-ok">' + esc(w) + '</span>'; }
      return '<span class="xl-w is-no">' + esc(w) + '</span>';
    }).join(" ");
    return { ok: ok, total: T.length, html: html };
  }
  function finish() { stop(); R.step = 6; render(); global.scrollTo(0, 0); }

  Shyn.route("listen", function (args) {
    stop(); if (R && R.timer) clearInterval(R.timer);
    var v = view(), key = args && args[0] ? decodeURIComponent(args.join("/")) : "";
    var g = key && groupByKey(key);
    if (!g) { R = null; listView(v); return; }
    if (!R || R.g.key !== g.key) {
      var sents = sentences(g.qs[0].passage);
      var pool = sents.filter(function (s) { var n = s.split(/\s+/).length; return n >= 5 && n <= 16; });
      R = { g: g, step: 1, ans: {}, plays: 0, rate: S.rate, sents: sents, dict: { list: U.shuffle(pool).slice(0, 4), i: 0, ok: 0, total: 0 } };
      if (!R.dict.list.length) R.dict.list = sents.slice(0, 3);
    }
    render();
  });
})(window);
