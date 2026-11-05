/* Шың — ядро: пространство имён, загрузка данных, утилиты, хранилище, балл, формулалар, ЖИ.
   Ванильный JS, құрастырусыз: index.html файлын браузерде ашу жеткілікті. */
(function (global) {
  "use strict";

  /* ================= Деректер ================= */
  var Shyn = global.Shyn = global.Shyn || {};
  Shyn.sets = {};
  Shyn.cards = Shyn.cards || [];
  Shyn.sorting = Shyn.sorting || { groups: [], legend: [] };
  Shyn.synonyms = Shyn.synonyms || [];
  var readyCbs = [], pending = 0, isReady = false;

  Shyn.addSet = function (set) {
    set.questions.forEach(function (q) { q._set = set.key; q._subject = set.subject; q._variant = set.variant; });
    Shyn.sets[set.key] = set;
  };
  Shyn.setFiles = function (files) {
    pending = files.length;
    if (!pending) return fire();
    files.forEach(function (f) {
      var s = document.createElement("script");
      s.src = "data/sets/" + f + ".js" + (global.SHYN_BUILD ? "?v=" + global.SHYN_BUILD : "");
      s.onload = s.onerror = function () { if (--pending === 0) fire(); };
      document.head.appendChild(s);
    });
  };
  function fire() { isReady = true; readyCbs.forEach(function (cb) { cb(); }); readyCbs = []; }
  Shyn.onReady = function (cb) { if (isReady) cb(); else readyCbs.push(cb); };

  Shyn.SUBJECT = {
    algo: { name: "Алгоритмдер және деректер құрылымы", short: "Алгоритмдер", mark: "A" },
    db: { name: "Деректер қоры", short: "Деректер қоры", mark: "D" },
    english: { name: "Ағылшын тілі", short: "Ағылшын тілі", mark: "E" },
    fundamentals: { name: "Оқуға дайындығын анықтау тесті", short: "Оқуға дайындық", mark: "F" }
  };
  Shyn.SUBJECT_ORDER = ["algo", "db", "english", "fundamentals"];
  Shyn.SOURCE = {
    tc: { name: "Тест орталығы", hint: "Сынақ тестілеуінің нақты сұрақтары, кілті ресми нәтижелер бойынша тексерілген" },
    ai: { name: "Жаттығу", hint: "Тест спецификациясы бойынша құрастырылған жаттығу нұсқасы — нақты емтиханнан емес" },
    col: { name: "Жинақ", hint: "Түлектер тегін таратқан жинақтардан (ТГО-98%, 90%-ТГО, ТГО 30-нұсқа, 200 grammar). Математика есептерінің кілті тексеріліп, түсіндірме жазылған" }
  };

  Shyn.allSets = function () {
    return Object.keys(Shyn.sets).map(function (k) { return Shyn.sets[k]; })
      .sort(function (a, b) { return a.variant - b.variant || Shyn.SUBJECT_ORDER.indexOf(a.subject) - Shyn.SUBJECT_ORDER.indexOf(b.subject); });
  };
  Shyn.allQuestions = function () {
    var out = [];
    Shyn.allSets().forEach(function (s) {
      s.questions.forEach(function (q) { q._set = s.key; q._subject = s.subject; q._variant = s.variant; out.push(q); });
    });
    return out;
  };
  Shyn.variants = function () {
    var m = {};
    Shyn.allSets().forEach(function (s) { (m[s.variant] = m[s.variant] || []).push(s); });
    return Object.keys(m).map(Number).sort(function (a, b) { return a - b; })
      .map(function (v) { return { n: v, sets: m[v] }; });
  };
  Shyn.questionById = function (id) {
    var all = Shyn.allQuestions();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  };

  /* ================= Утилиталар ================= */
  var U = Shyn.U = {};
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  U.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s;
  };
  U.dayKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  };
  U.plural = function (n, word) { return n + " " + word; }; // қазақ тілінде сан есімнен кейін көпше жалғау жалғанбайды
  U.MONTHS = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
  U.fmtDate = function (ts) { var d = new Date(ts); return d.getDate() + " " + U.MONTHS[d.getMonth()] + ", " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  U.on = function (sel, ev, fn, root) { U.$$(sel, root).forEach(function (el) { el.addEventListener(ev, function (e) { fn.call(el, e, el); }); }); };
  U.toast = function (text) {
    var t = document.getElementById("toast");
    t.textContent = text; t.classList.add("show");
    clearTimeout(U._tt); U._tt = setTimeout(function () { t.classList.remove("show"); }, 2600);
  };

  /* ================= Хранилище (localStorage) ================= */
  var KEY = "shyn_v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  var st = load();
  function norm() {
    ["sessions", "best", "wrong", "settings", "learning", "cards", "words", "days"].forEach(function (k) { st[k] = st[k] || {}; });
    st.history = st.history || [];
  }
  norm();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var LADDER = [72, 168, 504, 1080, 2160, 4320]; // 3к, 7к, 21к, 45к, 90к, 180к (сағат)
  function hoursForStreak(n) {
    if (n <= 0) return 4;
    if (n <= LADDER.length) return LADDER[n - 1];
    return Math.round(LADDER[LADDER.length - 1] * Math.pow(1.4, n - LADDER.length));
  }
  function hoursForReason(r) { return r === "careless" ? 8 : r === "confused" ? 24 : 4; }

  var Store = Shyn.Store = {
    get settings() { return st.settings; },
    set: function (k, v) { st.settings[k] = v; save(); },

    getSession: function (k) { return st.sessions[k] || null; },
    saveSession: function (k, v) { st.sessions[k] = v; save(); },
    clearSession: function (k) { delete st.sessions[k]; save(); },
    openSessions: function () {
      return Object.keys(st.sessions).map(function (k) { var s = st.sessions[k]; s._key = k; return s; })
        .filter(function (s) { return s.answers && Object.keys(s.answers).length && s.meta; })
        .sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
    },

    getBest: function (k) { return st.best[k] || null; },
    recordResult: function (r) {
      var b = st.best[r.key];
      if (!b || r.got > b.got) st.best[r.key] = { got: r.got, max: r.max, at: Date.now() };
      st.history.push(r); if (st.history.length > 300) st.history.shift();
      // Жауаптардың толық көшірмесін тек соңғы 80 тест үшін сақтаймыз (браузер жадын үнемдеу)
      for (var i = 0; i < st.history.length - 80; i++) { delete st.history[i].qs; delete st.history[i].ans; delete st.history[i].fl; }
      save();
    },
    history: function () { return st.history.slice(); },

    // Қателер дәптері: әр қате сұрақ үшін соңғы таңдау, қанша рет қателескені және қашан
    markWrong: function (id, isWrong, sel) {
      var w = st.wrong[id];
      if (isWrong) {
        var o = w && typeof w === "object" ? w : { n: 0, first: Date.now() };
        o.n = (o.n || 0) + 1; o.at = Date.now(); if (sel && sel.length) o.sel = sel.slice();
        st.wrong[id] = o;
      } else if (w) {
        delete st.wrong[id];
        var d = U.dayKey(); st.fixed = st.fixed || {}; st.fixed[d] = (st.fixed[d] || 0) + 1;
      }
      save();
    },
    wrongInfo: function (id) { var w = st.wrong[id]; return w ? (typeof w === "object" ? w : { n: 1 }) : null; },
    dismissWrong: function (id) { delete st.wrong[id]; save(); },
    fixedSince: function (days) {
      var f = st.fixed || {}, n = 0, d = new Date();
      for (var i = 0; i < days; i++) { n += f[U.dayKey(d)] || 0; d.setDate(d.getDate() - 1); }
      return n;
    },
    wrongIds: function () { return Object.keys(st.wrong); },
    clearWrong: function () { st.wrong = {}; save(); },

    logActivity: function (n) { var d = U.dayKey(); st.days[d] = (st.days[d] || 0) + (n || 1); save(); },
    days: function () { return st.days; },
    streak: function () {
      var n = 0, d = new Date();
      if (!st.days[U.dayKey(d)]) d.setDate(d.getDate() - 1); // бүгін әлі оқымаса, кешегіден санаймыз
      while (st.days[U.dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },

    recordLearning: function (q, res, conf, reason) {
      if (!q || q.missing) return;
      var x = st.learning[q.id] || { attempts: 0, correct: 0, streak: 0 };
      x.attempts++; x.topic = q.topic || "Тақырыпсыз"; x.lastState = res.state; x.lastAt = Date.now();
      x.conf = conf || ""; x.reason = res.state === "correct" ? "" : (reason || x.reason || "");
      var h;
      if (res.state === "correct") {
        x.correct++;
        if (conf === "guess") { x.streak = 0; h = 6; }
        else { x.streak++; h = hoursForStreak(x.streak); if (conf === "doubt") h = Math.round(h / 2); }
      } else {
        x.streak = Math.max(0, x.streak - 1);
        h = res.state === "partial" ? 12 : hoursForReason(x.reason);
      }
      x.dueAt = Date.now() + h * 3600000;
      st.learning[q.id] = x; save();
      Store.logActivity(1);
    },
    updateMeta: function (id, conf, reason) {
      var x = st.learning[id]; if (!x) return;
      if (conf) x.conf = conf;
      if (reason) { x.reason = reason; if (x.lastState !== "correct") x.dueAt = Date.now() + hoursForReason(reason) * 3600000; }
      save();
    },
    learning: function (id) { return st.learning[id] || null; },
    dueIds: function () { var now = Date.now(); return Object.keys(st.learning).filter(function (id) { return st.learning[id].dueAt <= now; }); },
    topicStats: function (qs) {
      var out = {};
      qs.forEach(function (q) {
        var x = st.learning[q.id]; if (q.missing || !x) return;
        var k = q.topic || "Тақырыпсыз", t = out[k] || (out[k] = { topic: k, attempts: 0, correct: 0, confWrong: 0 });
        t.attempts++; if (x.lastState === "correct") t.correct++;
        else if (x.conf === "sure") t.confWrong++;
      });
      return Object.keys(out).map(function (k) { var t = out[k]; t.pct = Math.round(t.correct / t.attempts * 100); return t; })
        .sort(function (a, b) { return a.pct - b.pct || b.attempts - a.attempts; });
    },
    reasonStats: function (qs) {
      var out = { unknown: 0, confused: 0, careless: 0, none: 0 }, total = 0;
      qs.forEach(function (q) {
        var x = st.learning[q.id]; if (q.missing || !x || x.lastState === "correct") return;
        total++; out[out.hasOwnProperty(x.reason) && x.reason ? x.reason : "none"]++;
      });
      if (!total) return null;
      return Object.keys(out).filter(function (k) { return out[k]; })
        .map(function (k) { return { reason: k, count: out[k], pct: Math.round(out[k] / total * 100) }; })
        .sort(function (a, b) { return b.count - a.count; });
    },
    learnedCount: function () { return Object.keys(st.learning).length; },

    cardStatus: function (id) { return st.cards[id] || null; },
    setCard: function (id, s) { st.cards[id] = s; save(); Store.logActivity(1); },
    clearCards: function (ids) { ids.forEach(function (id) { delete st.cards[id]; }); save(); },

    word: function (en) { return st.words[en] || (st.words[en] = { status: "", ok: 0, bad: 0 }); },
    saveWords: function () { save(); },
    clearWords: function () { st.words = {}; save(); },

    exportAll: function () { return JSON.stringify({ app: "shyn", version: 1, at: Date.now(), data: st }, null, 1); },
    importAll: function (text) {
      var o = JSON.parse(text);
      if (!o || o.app !== "shyn" || !o.data) throw new Error("Бұл Шың прогресінің файлы емес");
      st = o.data; norm(); save();
    },
    resetAll: function () { var keep = { theme: st.settings.theme }; st = { settings: keep }; norm(); save(); }
  };

  /* ================= Балл есептеу (ресми ереже) =================
     multi:false — бір дұрыс жауап: дұрыс → 1 балл, әйтпесе 0.
     multi:true — бір не бірнеше (≤3) дұрыс жауап, ең көбі 2 балл:
       • қате таңдау ≥ 2 → 0;
       • барлық дұрыс жиын қатесіз → 2;
       • дұрыс ≥ max(k−1, 1) және қате ≤ 1 → 1;
       • қалғаны → 0.
     Сондықтан алгоритмдер 30×1 = 30, деректер қоры 20×2 = 40. */
  Shyn.Score = {
    max: function (q) { return q.missing ? 0 : q.multi ? 2 : 1; },
    question: function (q, sel) {
      sel = sel || [];
      if (q.missing) return { points: 0, max: 0, state: "missing" };
      var cs = {}; q.correct.forEach(function (c) { cs[c] = 1; });
      var hits = sel.filter(function (x) { return cs[x]; }).length, wrong = sel.length - hits, k = q.correct.length;
      if (!q.multi) {
        if (!sel.length) return { points: 0, max: 1, state: "empty" };
        return wrong === 0 && hits === k ? { points: 1, max: 1, state: "correct" } : { points: 0, max: 1, state: "wrong" };
      }
      if (!sel.length) return { points: 0, max: 2, state: "empty" };
      if (wrong >= 2) return { points: 0, max: 2, state: "wrong" };
      if (wrong === 0 && hits === k) return { points: 2, max: 2, state: "correct" };
      if (hits >= Math.max(k - 1, 1)) return { points: 1, max: 2, state: "partial" };
      return { points: 0, max: 2, state: "wrong" };
    },
    test: function (qs, answers) {
      var r = { got: 0, max: 0, correct: 0, partial: 0, wrong: 0, empty: 0 };
      qs.forEach(function (q) {
        if (q.missing) return;
        var x = Shyn.Score.question(q, answers[q.id]);
        r.got += x.points; r.max += x.max;
        if (x.state === "empty") r.empty++; else r[x.state]++;
      });
      return r;
    }
  };

  /* ================= Формулалар (TeX-тің шағын бөлігі, офлайн) ================= */
  var SYM = { Theta: "Θ", theta: "θ", alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", lambda: "λ", mu: "μ", pi: "π", sigma: "σ", Sigma: "Σ", omega: "ω", Omega: "Ω",
    le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", infty: "∞", times: "×", cdot: "·", pm: "±", rightarrow: "→", to: "→", leftarrow: "←",
    in: "∈", notin: "∉", cup: "∪", cap: "∩", sum: "∑", prod: "∏", log: "log", ldots: "…", dots: "…", lfloor: "⌊", rfloor: "⌋", lceil: "⌈", rceil: "⌉" };
  function grp(s, i) {
    if (s[i] !== "{") return null;
    for (var d = 0, j = i; j < s.length; j++) { if (s[j] === "{") d++; else if (s[j] === "}" && --d === 0) return { v: s.slice(i + 1, j), end: j + 1 }; }
    return null;
  }
  function tex(src) {
    src = String(src || "").trim(); var out = "", i = 0;
    while (i < src.length) {
      if (src.slice(i, i + 5) === "\\frac") { var a = grp(src, i + 5), b = a && grp(src, a.end); if (a && b) { out += '<span class="mfrac"><span>' + tex(a.v) + "</span><span>" + tex(b.v) + "</span></span>"; i = b.end; continue; } }
      if (src.slice(i, i + 5) === "\\sqrt") { var r = grp(src, i + 5); if (r) { out += '<span class="msqrt">√<span>' + tex(r.v) + "</span></span>"; i = r.end; continue; } }
      if (src[i] === "\\") {
        var m = src.slice(i + 1).match(/^[A-Za-z]+/);
        if (m) { var nm = m[0]; out += SYM[nm] != null ? SYM[nm] : (nm === "mathrm" || nm === "text" || nm === "left" || nm === "right" ? "" : "\\" + nm); i += nm.length + 1; continue; }
        if (i + 1 < src.length) { out += U.esc(src[i + 1]); i += 2; continue; }
      }
      if (src[i] === "^" || src[i] === "_") {
        var tag = src[i] === "^" ? "sup" : "sub", g = grp(src, i + 1), val = g ? g.v : src[i + 1];
        if (val != null) { out += "<" + tag + ">" + tex(val) + "</" + tag + ">"; i = g ? g.end : i + 2; continue; }
      }
      if (src[i] === "{") { var bare = grp(src, i); if (bare) { out += tex(bare.v); i = bare.end; continue; } }
      out += U.esc(src[i]); i++;
    }
    return out.replace(/~/g, " ");
  }
  Shyn.fmt = function (text) {
    var s = String(text == null ? "" : text), re = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, last = 0, m, out = "";
    while ((m = re.exec(s))) {
      out += U.esc(s.slice(last, m.index));
      out += '<span class="math' + (m[1] != null ? " math--block" : "") + '">' + tex(m[1] != null ? m[1] : m[2]) + "</span>";
      last = re.lastIndex;
    }
    return (out + U.esc(s.slice(last))).replace(/\n/g, "<br>");
  };
  Shyn.code = function (c) { return c ? '<pre class="code"><code>' + U.esc(c) + "</code></pre>" : ""; };

  /* ================= ЖИ түсіндірмесі (міндетті емес, Groq) =================
     Кілт кодта жоқ — ол тек пайдаланушының браузерінде сақталады. */
  Shyn.AI = {
    defaultModel: "openai/gpt-oss-120b",
    hasKey: function () { return !!(Store.settings.aiKey || "").trim(); },
    explain: function (q, focus) {
      var subj = (Shyn.SUBJECT[q._subject] || {}).name || "";
      var opts = q.opts.map(function (o) { return o.l + ") " + o.t + (o.code ? "\n" + o.code : ""); }).join("\n");
      var prompt = "Сен «" + subj + "» пәнінің оқытушысысың. Магистратураға түсушіге қазақ тілінде, қарапайым сөзбен, қысқа (4–7 сөйлем) түсіндір.\n\n" +
        "Сұрақ: " + q.q + (q.code ? "\n" + q.code : "") + "\n\nНұсқалар:\n" + opts + "\n\nДұрыс жауап: " + q.correct.join(", ") +
        ".\n\nДұрыс нұсқаның НЕГЕ дұрыс екенін және қалғандарының неге қате екенін түсіндір. Жауап даулы болса, соны атап өт. " +
        "Формулаларды TeX түрінде \\( және \\) арасына жаз." + (focus ? "\n\nҚосымша мақсат: " + focus : "");
      return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + Store.settings.aiKey.trim() },
        body: JSON.stringify({ model: (Store.settings.aiModel || "").trim() || Shyn.AI.defaultModel, messages: [{ role: "user", content: prompt }], temperature: 0.3 })
      }).then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error("API қатесі (" + r.status + "): " + t.slice(0, 160)); });
        return r.json();
      }).then(function (d) {
        var m = (d.choices && d.choices[0] && d.choices[0].message) || {};
        return m.content || m.reasoning || "Бос жауап келді.";
      });
    }
  };
})(window);
