/* Шың — КТ симуляторы: нақты емтихандағыдай толық тест (ағылшын 50 → ТГО 20 → алгоритм 30 → ДҚ 20),
   ресми уақытпен; нәтиже 150 балдық шкалада бөлімдер бойынша, шекті 75 және болжаммен салыстыру. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var ORDER = ["english", "fundamentals", "algo", "db"];
  Shyn.launchKTSim = function () {
    var ex = Shyn.composeExam(ORDER), sec = Shyn.examSeconds(ex.qs);
    Shyn.ask("КТ симуляторы: " + ex.qs.length + " сұрақ, " + Math.round(sec / 60) + " минут. Нақты емтихандағыдай: телефонсыз, үзіліссіз, бір отырыста. Бастаймыз ба?", "Бастау", "Кейін",
      function () { Shyn.startTest("ktsim:" + Date.now(), "КТ симуляторы (" + ex.picked.join(", ") + ")", ex.qs, { mode: "exam", seconds: sec, fresh: true }); }, function () {});
  };
  // Нәтиже бетіне: 3+ пәні бар тест болса — 150 балдық шкала
  Shyn.resultExtra = function (R) {
    var subj = R.rec && R.rec.subj; if (!subj || Object.keys(subj).length < 3) return "";
    var P = Shyn.Predict ? Shyn.Predict.points() : { english: 50, fundamentals: 30, algo: 30, db: 40 };
    var total = 0, max = 0;
    var rows = ORDER.filter(function (k) { return subj[k]; }).map(function (k) {
      var x = subj[k], pts = x.max ? x.got / x.max * P[k] : 0; total += pts; max += P[k];
      return '<div class="pred__row"><span class="pred__name">' + esc(Shyn.SUBJECT[k].short) + '</span>' + Shyn.bar(Math.round(pts / P[k] * 100), Shyn.tone(Math.round(pts / P[k] * 100))) +
        '<span class="pred__pts"><b>' + Math.round(pts) + '</b> / ' + P[k] + '</span><span class="pred__n muted">' + x.got + "/" + x.max + ' тестте</span></div>';
    }).join("");
    var pass = Math.round(75 * max / 150), t = Math.round(total);
    var pr = Shyn.Predict ? Math.round(Shyn.Predict.compute().total) : null;
    return '<section class="block pred"><div class="pred__head"><h2>КТ шкаласы бойынша</h2></div>' +
      '<div class="pred__top"><div class="pred__big ' + (t >= pass ? "is-ok" : "is-no") + '"><span>' + t + '</span><small>/ ' + max + '</small></div>' +
      '<p class="pred__verdict">' + (t >= pass ? "Шекті балдан (" + pass + ") өттің! Осы деңгейді ұстап тұр." : "Шекті балға (" + pass + ") дейін <b>" + (pass - t) + "</b> балл жетпеді.") +
      (pr !== null ? '<br><span class="muted">Жалпы болжам (барлық жауаптар бойынша): ' + pr + ' балл.</span>' : "") + '</p></div>' +
      '<div class="pred__rows">' + rows + '</div><p class="muted pred__note">ТГО балы 20 сұрақтан 30 балдық шкалаға, ДҚ — 2 балдық сұрақтармен 40-қа есептелді.</p></section>';
  };
})(window);
