/* Шың — терминдер сөздігі: қазақша / орысша / ағылшынша, анықтама және код мысалы.
   Деректер: data/glossary.js (Shyn.glossary). Іздеу үш тілде де, анықтама мәтінінде де жұмыс істейді. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var GROUPS = [["", "Бәрі"], ["db", "Деректер қоры"], ["algo", "Алгоритмдер"], ["prog", "C/C++"]];
  var G = { q: "", s: "" };

  function norm(s) { return String(s || "").toLowerCase().replace(/ё/g, "е").trim(); }
  function list() {
    var all = Shyn.glossary || [], q = norm(G.q);
    return all.filter(function (x) {
      if (G.s && x.s !== G.s) return false;
      if (!q) return true;
      return norm(x.kz + " " + x.ru + " " + x.en + " " + x.d).indexOf(q) >= 0;
    }).sort(function (a, b) {
      // Терминнің өзінде табылғандары — жоғарыда
      if (q) { var ha = norm(a.kz + " " + a.ru + " " + a.en).indexOf(q) >= 0, hb = norm(b.kz + " " + b.ru + " " + b.en).indexOf(q) >= 0; if (ha !== hb) return ha ? -1 : 1; }
      return 0;
    });
  }
  function item(x) {
    var tag = x.s === "db" ? "ДҚ" : x.s === "algo" ? "Алгоритм" : "C/C++";
    return '<article class="term"><div class="term__head"><code class="term__en">' + esc(x.en) + '</code><span class="term__tag">' + tag + '</span></div>' +
      '<div class="term__names"><b>' + esc(x.kz) + '</b><span class="muted"> · ' + esc(x.ru) + '</span></div>' +
      '<p class="term__d">' + esc(x.d) + '</p>' +
      (x.ex ? '<pre class="code term__ex"><code>' + esc(x.ex) + '</code></pre>' : "") + '</article>';
  }
  function draw() {
    var box = U.$("#termList"), n = U.$("#termN"); if (!box) return;
    var L = list();
    n.textContent = L.length + " термин";
    box.innerHTML = L.length ? L.map(item).join("") : '<p class="muted">Ештеңе табылмады. Басқа тілде жазып көріңіз: мысалы, «кесте», «таблица» немесе «table».</p>';
  }
  Shyn.route("terms", function () {
    var view = document.getElementById("view");
    if (!Shyn.glossary) { view.innerHTML = '<header class="page-head"><h1>Терминдер сөздігі</h1><p class="muted">Сөздік жүктелмеді. Бетті жаңартыңыз.</p></header>'; return; }
    view.innerHTML = '<header class="page-head"><h1>Терминдер сөздігі</h1>' +
      '<p class="muted">Кодтағы ағылшын сөздері қазақша және орысша: анықтамасы мен мысалы бар. Кез келген тілде іздеңіз.</p></header>' +
      '<div class="toolbar term__bar"><input class="field term__q" id="termQ" type="search" placeholder="Іздеу: кесте / таблица / table" value="' + esc(G.q) + '" autocomplete="off">' +
      '<div class="seg" role="group" aria-label="Бөлім">' + GROUPS.map(function (g) {
        return '<button data-ts="' + g[0] + '" class="' + (G.s === g[0] ? "is-on" : "") + '">' + g[1] + '</button>';
      }).join("") + '</div><span class="muted" id="termN"></span></div>' +
      '<div class="terms" id="termList"></div>';
    var inp = U.$("#termQ"), tm;
    inp.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(function () { G.q = inp.value; draw(); }, 120); });
    U.on("[data-ts]", "click", function (e, el) {
      G.s = el.getAttribute("data-ts");
      U.$$("[data-ts]").forEach(function (b) { b.classList.toggle("is-on", b === el); });
      draw();
    }, view);
    draw();
  });
})(window);
