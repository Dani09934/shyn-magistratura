/* Шың — қосымша мүмкіндіктер:
   1) Тыңдалым: аудиосы жоқ тыңдалым мәтінін браузердің ағылшын дауысымен оқу (транскрипт әдепкіде жабық).
   2) Статистика: толық сынақтардың пән бойынша динамикасы (алдыңғысымен салыстыру). */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var synth = global.speechSynthesis;

  /* ===== 1. Тыңдалым дауысы ===== */
  var RATE_KEY = "shyn_tts_rate", rate = 0.95;
  try { rate = parseFloat(localStorage.getItem(RATE_KEY)) || 0.95; } catch (e) {}
  function voice() {
    if (!synth) return null;
    var v = synth.getVoices().filter(function (x) { return /^en(-|_|$)/i.test(x.lang); });
    var pref = ["en-GB", "en-US"];
    for (var i = 0; i < pref.length; i++) { var m = v.filter(function (x) { return x.lang.replace("_", "-") === pref[i]; }); if (m.length) return m.filter(function (x) { return /natural|google|samantha|daniel|serena/i.test(x.name); })[0] || m[0]; }
    return v[0] || null;
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
  function plain(t) { return String(t || "").replace(/<[^>]+>/g, " ").replace(/\*\*|__|`/g, "").replace(/\s+/g, " ").trim(); }
  var playingId = null;
  Shyn.tts = {
    ok: function () { return !!(synth && global.SpeechSynthesisUtterance); },
    stop: function () { if (synth) synth.cancel(); playingId = null; U.$$(".tts__play").forEach(function (b) { b.classList.remove("is-on"); b.textContent = "▶ Тыңдау"; }); },
    html: function (id) {
      return '<div class="tts" data-tts="' + esc(id) + '"><button class="btn btn--primary tts__play" type="button">▶ Тыңдау</button>' +
        '<label class="tts__rate">Жылдамдық <select>' + [[0.8, "баяу"], [0.95, "қалыпты"], [1.1, "жылдам"]].map(function (r) {
          return '<option value="' + r[0] + '"' + (Math.abs(r[0] - rate) < 0.01 ? " selected" : "") + '>' + r[1] + '</option>'; }).join("") + '</select></label>' +
        '<span class="tts__hint">Алдымен тыңдап, жауап беріңіз; транскриптті кейін ашып тексеріңіз.</span></div>';
    },
    bind: function (root, q) {
      var box = root && root.querySelector('[data-tts="' + q.id + '"]'); if (!box) return;
      var btn = box.querySelector(".tts__play"), sel = box.querySelector("select");
      sel.addEventListener("change", function () { rate = parseFloat(sel.value); try { localStorage.setItem(RATE_KEY, rate); } catch (e) {} });
      btn.addEventListener("click", function () {
        if (playingId === q.id) { Shyn.tts.stop(); return; }
        Shyn.tts.stop();
        var u = new SpeechSynthesisUtterance(plain(q.passage)), v = voice();
        u.lang = v ? v.lang : "en-GB"; if (v) u.voice = v; u.rate = rate;
        u.onend = u.onerror = function () { if (playingId === q.id) Shyn.tts.stop(); };
        playingId = q.id; btn.classList.add("is-on"); btn.textContent = "■ Тоқтату";
        synth.speak(u);
      });
    }
  };
  global.addEventListener("hashchange", function () { if (Shyn.tts) Shyn.tts.stop(); });

  /* ===== 2. Толық сынақтардың пән бойынша динамикасы ===== */
  var SUBJ = [["english", "Ағылшын", "#2b6cb0"], ["fundamentals", "ТГО", "#b7791f"], ["algo", "Алгоритм", "#2f855a"], ["db", "ДҚ", "#9b2c2c"]];
  function isFull(r) { return r.subj && Object.keys(r.subj).length >= 3 && r.max >= 60; }
  Shyn.examDynHTML = function (H) {
    var E = H.filter(isFull).slice(-8);
    if (!E.length) return '<section class="block dyn"><h2>Толық сынақтар динамикасы</h2><p class="muted">Әзірге толық сынақ (барлық пән бірге) тапсырылмаған. «Емтихан режимі» немесе 15 күндік жоспардың 1-күні — осы жерде әр пәннің өсуін көрсетеді.</p></section>';
    var last = E[E.length - 1], prev = E[E.length - 2];
    function pct(r, s) { var x = r.subj[s]; return x && x.max ? Math.round(x.got / x.max * 100) : null; }
    var cards = SUBJ.map(function (s) {
      var a = pct(last, s[0]); if (a === null) return "";
      var b = prev ? pct(prev, s[0]) : null, d = b === null ? null : a - b;
      return '<div class="dyn__c"><span class="dyn__dot" style="background:' + s[2] + '"></span><b>' + s[1] + '</b><span class="dyn__v">' + a + '%</span>' +
        (d === null ? '<small class="muted">алғашқы</small>' : '<small class="' + (d > 0 ? "up" : d < 0 ? "down" : "") + '">' + (d > 0 ? "▲ +" : d < 0 ? "▼ " : "") + d + '</small>') + '</div>';
    }).join("");
    var chart = "";
    if (E.length > 1) {
      var W = 640, Ht = 180, px = function (i) { return 34 + i * (W - 50) / (E.length - 1); }, py = function (p) { return 10 + (100 - p) * (Ht - 30) / 100; };
      chart = '<svg class="chart dyn__chart" viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="Толық сынақтардағы пән нәтижелері">' +
        [0, 50, 100].map(function (g) { return '<line x1="34" x2="' + (W - 16) + '" y1="' + py(g) + '" y2="' + py(g) + '" class="chart__grid"/><text x="0" y="' + (py(g) + 4) + '" class="chart__lbl">' + g + '%</text>'; }).join("") +
        SUBJ.map(function (s) {
          var pts = E.map(function (r, i) { var v = pct(r, s[0]); return v === null ? null : [px(i), py(v)]; }).filter(Boolean);
          if (pts.length < 2) return "";
          return '<path d="' + pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + '" fill="none" stroke="' + s[2] + '" stroke-width="2.5"/>' +
            pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + s[2] + '"/>'; }).join("");
        }).join("") + '</svg>';
    }
    var tot = Math.round(last.got / last.max * 100), totPrev = prev ? Math.round(prev.got / prev.max * 100) : null;
    return '<section class="block dyn"><div class="dyn__head"><h2>Толық сынақтар динамикасы</h2><span class="muted">' + E.length + ' сынақ · соңғысы ' + tot + '%' +
      (totPrev === null ? "" : ' (' + (tot - totPrev >= 0 ? "+" : "") + (tot - totPrev) + ')') + '</span></div><div class="dyn__cards">' + cards + '</div>' + chart +
      '<p class="muted dyn__note">Өсу баяу пәнге келесі күндердің тапсырмаларында көбірек уақыт бөліңіз.</p></section>';
  };
})(window);
