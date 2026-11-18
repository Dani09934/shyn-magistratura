/* Шың — болжам: КТ-да 150 балдан шамамен қанша жинайсыз.
   Әр пән бойынша соңғы жауаптардың дәлдігі (жаңалары салмақтырақ) × пәннің ресми баллы.
   Дерек аз болса, болжам «кездейсоқ таңдау» деңгейіне жақын тартылады — бірнеше дұрыс жауаптан асыра бағаламау үшін. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, Store = Shyn.Store, esc = U.esc;

  // КТ құрылымы (ғылыми-педагогикалық магистратура): ағылшын 50 сұрақ, ТГО 20, алгоритм 30, ДҚ 20 (2 балдан)
  var DEFAULT = { english: 50, fundamentals: 30, algo: 30, db: 40 };
  var ORDER = ["english", "fundamentals", "algo", "db"];
  var PASS = 75, TOTAL = 150;
  var PRIOR = 0.3, K = 8; // дерек жоқта ~30% (болжап белгілеу деңгейі), K — «виртуалды» сұрақ саны

  function points() {
    var p = Store.settings.examPoints || {}, out = {};
    ORDER.forEach(function (s) { out[s] = typeof p[s] === "number" && p[s] >= 0 ? p[s] : DEFAULT[s]; });
    return out;
  }
  function recency(at) {
    var days = (Date.now() - (at || 0)) / 864e5;
    return days <= 7 ? 1 : days <= 21 ? 0.6 : 0.3;
  }
  function value(state) { return state === "correct" ? 1 : state === "partial" ? 0.5 : 0; }

  function compute() {
    var P = points(), by = {};
    ORDER.forEach(function (s) { by[s] = { subject: s, w: 0, v: 0, n: 0 }; });
    Shyn.allQuestions().forEach(function (q) {
      var b = by[q._subject], x = Store.learning(q.id);
      if (!b || !x || q.missing) return;
      var w = recency(x.lastAt) * Shyn.Score.max(q);
      b.w += w; b.v += w * value(x.lastState); b.n++;
    });
    var total = 0;
    var rows = ORDER.map(function (s) {
      var b = by[s], p = (b.v + K * PRIOR) / (b.w + K);
      var pts = P[s] * p;
      total += pts;
      return { subject: s, name: Shyn.SUBJECT[s].short, pct: Math.round(p * 100), pts: pts, max: P[s], lost: P[s] - pts, n: b.n };
    });
    var maxTotal = ORDER.reduce(function (a, s) { return a + P[s]; }, 0);
    var answered = rows.reduce(function (a, r) { return a + r.n; }, 0);
    var worst = rows.slice().sort(function (a, b) { return b.lost - a.lost; })[0];
    return { rows: rows, total: total, maxTotal: maxTotal, pass: Math.round(PASS * maxTotal / TOTAL), answered: answered, worst: worst };
  }
  Shyn.Predict = { compute: compute, points: points, DEFAULT: DEFAULT };

  function weakestTopic(subject) {
    var qs = Shyn.allQuestions().filter(function (q) { return q._subject === subject && !q.missing; });
    var t = Store.topicStats(qs)[0];
    return t ? t.topic : null;
  }

  Shyn.predictHTML = function (where) {
    var r = compute();
    var total = Math.round(r.total), passOk = total >= r.pass;
    var lowData = r.answered < 40;
    var mark = Math.round(r.pass / r.maxTotal * 100), fill = Math.min(100, Math.round(r.total / r.maxTotal * 100));
    var rowsHTML = r.rows.map(function (x) {
      return '<div class="pred__row"><span class="pred__name">' + esc(x.name) + '</span>' + Shyn.bar(x.pct, Shyn.tone(x.pct)) +
        '<span class="pred__pts"><b>' + Math.round(x.pts) + '</b> / ' + x.max + '</span>' +
        '<span class="pred__n muted">' + (x.n ? x.n + " сұрақ" : "дерек жоқ") + '</span></div>';
    }).join("");
    var w = r.worst;
    var tip = w && w.lost >= 1
      ? '<p class="pred__tip">Ең көп балл жоғалтатын жер: <b>' + esc(w.name) + '</b> — шамамен ' + Math.round(w.lost) + ' балл. ' +
        '<button class="btn btn--line btn--sm" data-pred-train="' + w.subject + '">Осы пәнді жаттықтыру</button></p>'
      : "";
    return '<section class="block pred" id="pred">' +
      '<div class="pred__head"><h2>Болжам: ' + r.maxTotal + ' балдан</h2>' +
        '<button class="linkbtn" data-pred-edit>Балдарды өзгерту</button></div>' +
      '<div class="pred__top"><div class="pred__big ' + (passOk ? "is-ok" : "is-no") + '"><span>' + total + '</span><small>/ ' + r.maxTotal + '</small></div>' +
        '<div class="pred__gauge"><div class="pred__track"><span style="width:' + fill + '%"></span><i style="left:' + mark + '%" title="Шекті балл"></i></div>' +
        '<p class="pred__verdict">' + (passOk
          ? "Шекті балдан (" + r.pass + ") өтіп тұрсыз. Қорды кеңейтіп, аралықты ұлғайтыңыз."
          : "Шекті балға (" + r.pass + ") дейін шамамен <b>" + (r.pass - total) + "</b> балл жетпейді.") + '</p></div></div>' +
      '<div class="pred__rows">' + rowsHTML + '</div>' + tip +
      '<p class="muted pred__note">' + (lowData
        ? "Дерек әлі аз (" + r.answered + " сұрақ) — болжам шамамен. Бір толық нұсқа тапсырсаңыз, дәлірек болады."
        : "Соңғы жауаптарыңыздың дәлдігі бойынша есептелді, жаңа жауаптар көбірек ескеріледі.") + '</p>' +
      '</section>';
  };

  function editModal() {
    var P = points();
    Shyn.modal('<h2 class="modal__title">Пәндердің баллы</h2><p class="muted">КТ-дағы әр бөлімнің ең жоғары баллы. Болжам осы бойынша есептеледі.</p>' +
      '<div class="pred__form">' + ORDER.map(function (s) {
        return '<label><span>' + esc(Shyn.SUBJECT[s].short) + '</span><input class="field" type="number" min="0" max="150" step="1" data-pt="' + s + '" value="' + P[s] + '"></label>';
      }).join("") + '</div>' +
      '<div class="inline"><button class="btn btn--gold" id="predSave">Сақтау</button><button class="btn btn--line" id="predReset">Әдепкі (50 · 30 · 30 · 40)</button></div>');
    U.$("#predSave").addEventListener("click", function () {
      var o = {};
      U.$$("[data-pt]").forEach(function (el) { var v = Math.max(0, Math.round(+el.value || 0)); o[el.getAttribute("data-pt")] = v; });
      Store.set("examPoints", o); Shyn.closeModal(); Shyn.go(location.hash || "#/");
    });
    U.$("#predReset").addEventListener("click", function () { Store.set("examPoints", null); Shyn.closeModal(); Shyn.go(location.hash || "#/"); });
  }

  Shyn.predictBind = function (root) {
    root = root || document;
    U.on("[data-pred-edit]", "click", editModal, root);
    U.on("[data-pred-train]", "click", function (e, el) {
      var t = weakestTopic(el.getAttribute("data-pred-train"));
      if (t) Shyn.launchTopic(t); else Shyn.go("#/variants");
    }, root);
  };
})(window);
