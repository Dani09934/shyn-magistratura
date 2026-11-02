/* Шың — Зертхана: алгоритмдер мен деректер құрылымдарын қадам бойынша көрсететін интерактивті құралдар. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var view = document.getElementById("view");
  var LAB = Shyn.LAB = Shyn.LAB || { pages: {} };

  LAB.tabs = [
    ["", "Шолу", ""], ["sort", "Сұрыптау", "a"], ["search", "Екілік іздеу", "a"], ["ds", "Стек · кезек", "a"], ["hash", "Хеш-кесте", "a"],
    ["tree", "Ағаштар", "a"], ["graph", "Графтар", "a"], ["sql", "SQL құмсалғыш", "d"], ["join", "JOIN түрлері", "d"], ["nf", "Нормализация", "d"], ["cheat", "Шпаргалка", "d"]
  ];
  LAB.nav = function (active) {
    return '<nav class="labnav" aria-label="Зертхана бөлімдері">' + LAB.tabs.map(function (t) {
      return '<a href="#/lab' + (t[0] ? "/" + t[0] : "") + '" class="labnav__a labnav__a--' + (t[2] || "o") + (active === t[0] ? " is-on" : "") + '">' + t[1] + '</a>';
    }).join("") + '</nav>';
  };
  LAB.head = function (title, lead, active) {
    return '<header class="page-head"><h1>' + title + '</h1><p class="muted">' + lead + '</p></header>' + LAB.nav(active);
  };
  function nums(str, max) {
    var a = String(str).split(/[\s,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).map(Number).filter(function (x) { return isFinite(x); });
    return a.slice(0, max || 20);
  }
  LAB.nums = nums;

  Shyn.route("lab", function (args) {
    var sub = args[0] || "";
    var fn = LAB.pages[sub] || LAB.pages[""];
    fn(args.slice(1));
  });

  /* ================= Шолу ================= */
  LAB.pages[""] = function () {
    var cards = [
      ["sort", "a", "Сұрыптау визуализаторы", "7 алгоритм қадам бойынша: әр салыстыру, әр алмасу және әр өтуден кейінгі массив — емтихандағы «бірінші өтуден кейін массив қандай?» сұрақтары үшін."],
      ["search", "a", "Екілік іздеу", "low / mid / high қадамдары және салыстырулар саны."],
      ["ds", "a", "Стек, кезек, дек", "push / pop / enqueue / dequeue амалдарын орындап, күйін көріңіз."],
      ["hash", "a", "Хеш-кесте", "Тізбектер әдісі, сызықтық, квадраттық зондтау және қос хештеу: әр кілт қай ұяшыққа түседі."],
      ["tree", "a", "BST және AVL ағаштары", "Кілттерді енгізіп, ағашты, айналдыруларды және in/pre/post-order аралауды көріңіз."],
      ["graph", "a", "Графтар", "BFS, DFS, Дейкстра, Прим, Крускал — қадамдар кестесімен."],
      ["sql", "d", "SQL құмсалғыш", "Браузердің ішіндегі нақты дерекқор: сұранысты жазып, нәтижесін бірден көріңіз. 20 тапсырма тексерісімен."],
      ["join", "d", "JOIN түрлері", "INNER, LEFT, RIGHT, FULL, CROSS — екі кестеде қай жолдар қалатынын көзбен көріңіз."],
      ["nf", "d", "Нормализация калькуляторы", "Функционалдық тәуелділіктерден атрибуттар тұйықталуын, кандидат кілттерді және 2ҚФ / 3ҚФ / BCNF тексерісін есептейді."],
      ["cheat", "d", "Шпаргалка", "Емтихан алдында қарап шығатын қысқа анықтамалар: күрделілік, SQL реті, ACID, оқшаулау деңгейлері, қалыпты формалар."]
    ];
    view.innerHTML = LAB.head("Зертхана", "Теорияны түсіну үшін интерактивті құралдар: алгоритмді қадам бойынша орындап, SQL сұранысын нақты дерекқорда тексеріп, қалыпты форманы есептеп көріңіз.", "") +
      '<section class="labgrid">' + cards.map(function (c) {
        return '<a class="labcard labcard--' + c[1] + '" href="#/lab/' + c[0] + '"><span class="labcard__k">' + (c[1] === "a" ? "Алгоритмдер" : "Деректер қоры") + '</span><h2>' + c[2] + '</h2><p>' + c[3] + '</p></a>';
      }).join("") + '</section>';
  };

  /* ================= Сұрыптау визуализаторы ================= */
  var SORTS = {
    bubble: { name: "Көпіршікті (bubble)", cx: "O(n²)", note: "Көрші элементтер салыстырылып, үлкені оңға «қалқып» шығады. Әр өтуден кейін ең үлкен элемент орнына тұрады." },
    selection: { name: "Таңдау (selection)", cx: "O(n²)", note: "Әр өтуде қалған бөліктен минимумды тауып, бөліктің басымен орын ауыстырады." },
    insertion: { name: "Кірістіру (insertion)", cx: "O(n²), ең жақсы O(n)", note: "Кезекті элементті сол жақтағы сұрыпталған бөлікке өз орнына кірістіреді." },
    shell: { name: "Шелл (shell)", cx: "≈ O(n^1.3)", note: "Кірістіру сұрыптауын қадам (gap = n/2, n/4, …, 1) арқылы алыстағы элементтерге қолданады." },
    merge: { name: "Біріктіру (merge)", cx: "O(n log n)", note: "Массивті екіге бөліп, бөліктерді рекурсивті сұрыптайды да, екі сұрыпталған бөлікті біріктіреді." },
    quick: { name: "Жылдам (quick, Ломуто)", cx: "орташа O(n log n), нашар O(n²)", note: "Тірек — бөліктің соңғы элементі. Одан кішілер солға жиналады, тірек өз орнына қойылады." },
    heap: { name: "Пирамидалық (heap)", cx: "O(n log n)", note: "Алдымен max-үйінді құрады, сосын түбірді (максимум) соңына ауыстырып, үйіндіні қалпына келтіреді." }
  };
  function sortSteps(kind, a0) {
    var a = a0.slice(), st = [], passes = [], c = 0, s = 0, n = a.length, sorted = {};
    function snap(msg, h) { st.push({ a: a.slice(), h: h || {}, msg: msg, c: c, s: s, sorted: Object.keys(sorted).map(Number) }); }
    function pass(label) { passes.push({ label: label, a: a.slice() }); }
    function sw(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; s++; }
    snap("Бастапқы массив", {});
    if (kind === "bubble") {
      for (var i = 0; i < n - 1; i++) {
        var any = false;
        for (var j = 0; j < n - 1 - i; j++) {
          c++; snap("Салыстыру: a[" + j + "]=" + a[j] + " және a[" + (j + 1) + "]=" + a[j + 1], { cmp: [j, j + 1] });
          if (a[j] > a[j + 1]) { sw(j, j + 1); any = true; snap(a[j + 1] + " > " + a[j] + " → орын ауыстырамыз", { swap: [j, j + 1] }); }
        }
        sorted[n - 1 - i] = 1; pass((i + 1) + "-өтуден кейін");
        snap((i + 1) + "-өту аяқталды: " + a[n - 1 - i] + " өз орнында", {});
        if (!any) { snap("Бұл өтуде алмасу болмады — массив сұрыпталған (ерте шығу жалаушасы)", {}); break; }
      }
    } else if (kind === "selection") {
      for (var i2 = 0; i2 < n - 1; i2++) {
        var m = i2;
        for (var j2 = i2 + 1; j2 < n; j2++) { c++; snap("Минимумды іздеу: a[" + j2 + "]=" + a[j2] + " < ағымдағы минимум " + a[m] + " ?", { cmp: [m, j2], mark: [i2] }); if (a[j2] < a[m]) m = j2; }
        if (m !== i2) { sw(i2, m); snap("Минимум " + a[i2] + " → " + i2 + "-позицияға (a[" + m + "]-мен орын ауыстыру)", { swap: [i2, m] }); }
        else snap("Минимум өз орнында тұр — алмасу жоқ", { mark: [i2] });
        sorted[i2] = 1; pass((i2 + 1) + "-өтуден кейін");
      }
    } else if (kind === "insertion") {
      for (var i3 = 1; i3 < n; i3++) {
        var x = a[i3], j3 = i3 - 1;
        snap("Кірістірілетін элемент x = " + x, { mark: [i3] });
        while (j3 >= 0) {
          c++; snap("a[" + j3 + "]=" + a[j3] + " > " + x + " ?", { cmp: [j3, j3 + 1] });
          if (a[j3] > x) { a[j3 + 1] = a[j3]; s++; snap(a[j3] + " оңға жылжиды", { swap: [j3, j3 + 1] }); j3--; } else break;
        }
        a[j3 + 1] = x; snap(x + " → " + (j3 + 1) + "-позицияға қойылды", { mark: [j3 + 1] });
        pass(i3 + "-қадамнан кейін (" + x + " кірістірілді)");
      }
    } else if (kind === "shell") {
      for (var gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        snap("Қадам (gap) = " + gap, {});
        for (var i4 = gap; i4 < n; i4++) {
          var t = a[i4], j4 = i4;
          while (j4 >= gap) {
            c++; snap("a[" + (j4 - gap) + "]=" + a[j4 - gap] + " > " + t + " ? (gap " + gap + ")", { cmp: [j4 - gap, j4] });
            if (a[j4 - gap] > t) { a[j4] = a[j4 - gap]; s++; snap("Жылжыту", { swap: [j4 - gap, j4] }); j4 -= gap; } else break;
          }
          a[j4] = t;
        }
        pass("gap = " + gap + " өтуінен кейін");
      }
    } else if (kind === "merge") {
      var lvl = 0;
      (function ms(lo, hi) {
        if (hi - lo < 1) return;
        var mid = Math.floor((lo + hi) / 2);
        ms(lo, mid); ms(mid + 1, hi);
        var L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1), i = 0, j = 0, k = lo;
        snap("Біріктіру: [" + L.join(", ") + "] және [" + R.join(", ") + "]", { range: [lo, hi] });
        while (i < L.length && j < R.length) { c++; if (L[i] <= R[j]) a[k++] = L[i++]; else a[k++] = R[j++]; s++; }
        while (i < L.length) { a[k++] = L[i++]; s++; } while (j < R.length) { a[k++] = R[j++]; s++; }
        snap("Нәтиже: [" + a.slice(lo, hi + 1).join(", ") + "]", { range: [lo, hi] });
        lvl++; pass(lvl + "-біріктіруден кейін [" + lo + ".." + hi + "]");
      })(0, n - 1);
    } else if (kind === "quick") {
      var pn = 0;
      (function qs(lo, hi) {
        if (lo >= hi) { if (lo === hi) sorted[lo] = 1; return; }
        var p = a[hi], i = lo - 1;
        snap("Бөлік [" + lo + ".." + hi + "], тірек = " + p, { range: [lo, hi], pivot: hi });
        for (var j = lo; j < hi; j++) {
          c++; snap("a[" + j + "]=" + a[j] + " ≤ " + p + " ?", { cmp: [j, hi], range: [lo, hi], pivot: hi });
          if (a[j] <= p) { i++; if (i !== j) { sw(i, j); snap("Иә → a[" + i + "] мен a[" + j + "] орын ауыстырады", { swap: [i, j], range: [lo, hi], pivot: hi }); } }
        }
        sw(i + 1, hi); sorted[i + 1] = 1;
        snap("Тірек " + p + " өз орнына (" + (i + 1) + ") қойылды", { swap: [i + 1, hi], range: [lo, hi] });
        pn++; pass(pn + "-бөлуден кейін (тірек " + p + ")");
        qs(lo, i); qs(i + 2, hi);
      })(0, n - 1);
    } else if (kind === "heap") {
      function sift(i, size) {
        for (;;) {
          var l = 2 * i + 1, r = l + 1, big = i;
          if (l < size) { c++; if (a[l] > a[big]) big = l; }
          if (r < size) { c++; if (a[r] > a[big]) big = r; }
          if (big === i) return;
          snap("Төмен түсіру: a[" + i + "]=" + a[i] + " < ұрпағы a[" + big + "]=" + a[big], { cmp: [i, big] });
          sw(i, big); snap("Орын ауыстыру", { swap: [i, big] }); i = big;
        }
      }
      for (var h = Math.floor(n / 2) - 1; h >= 0; h--) sift(h, n);
      pass("max-үйінді құрылғаннан кейін"); snap("max-үйінді дайын: түбірде максимум " + a[0], {});
      for (var e = n - 1; e > 0; e--) {
        sw(0, e); sorted[e] = 1; snap("Түбір " + a[e] + " → соңына (" + e + ")", { swap: [0, e] });
        sift(0, e); pass((n - e) + "-алудан кейін");
      }
    }
    for (var z = 0; z < n; z++) sorted[z] = 1;
    snap("Массив сұрыпталды", {});
    return { steps: st, passes: passes };
  }
  LAB.sortSteps = sortSteps;
  var SV = { kind: "bubble", input: "5, 1, 4, 2, 8, 3", run: null, i: 0, timer: null, speed: 600 };
  LAB.pages.sort = function () {
    view.innerHTML = LAB.head("Сұрыптау визуализаторы", "Алгоритмді таңдап, массивті енгізіңіз де, қадам бойынша жүргізіңіз. Төменде әр өтуден кейінгі массив тізімі тұрады.", "sort") +
      '<section class="labform">' +
        '<label class="lbl">Алгоритм<select class="field" id="sK">' + Object.keys(SORTS).map(function (k) { return '<option value="' + k + '"' + (SV.kind === k ? " selected" : "") + '>' + SORTS[k].name + '</option>'; }).join("") + '</select></label>' +
        '<label class="lbl">Массив (20 санға дейін)<input class="field" id="sA" value="' + esc(SV.input) + '" inputmode="decimal"></label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="sGo">Құру</button><button class="btn btn--line" id="sRnd">Кездейсоқ</button></div>' +
      '</section>' +
      '<p class="labnote" id="sNote"></p>' +
      '<section class="sviz"><div class="bars" id="sBars"></div>' +
        '<p class="sviz__msg" id="sMsg"></p>' +
        '<div class="sctl"><button class="btn btn--line" id="sFirst" aria-label="Басына">⏮</button><button class="btn btn--line" id="sPrev">◀ Артқа</button>' +
        '<button class="btn btn--gold" id="sPlay">▶ Ойнату</button><button class="btn btn--line" id="sNext">Алға ▶</button><button class="btn btn--line" id="sLast" aria-label="Соңына">⏭</button>' +
        '<label class="sspeed">Жылдамдық<input type="range" id="sSp" min="80" max="1400" step="20" value="' + (1480 - SV.speed) + '"></label></div>' +
        '<div class="scount" id="sCnt"></div></section>' +
      '<section class="block"><h2>Әр өтуден кейінгі массив</h2><div id="sPass"></div></section>';
    U.$("#sGo").addEventListener("click", buildSort);
    U.$("#sK").addEventListener("change", buildSort);
    U.$("#sRnd").addEventListener("click", function () { var n = 6 + Math.floor(Math.random() * 4), a = []; for (var i = 0; i < n; i++) a.push(1 + Math.floor(Math.random() * 30)); U.$("#sA").value = a.join(", "); buildSort(); });
    U.$("#sA").addEventListener("keydown", function (e) { if (e.key === "Enter") buildSort(); });
    U.$("#sPrev").addEventListener("click", function () { stopPlay(); go(SV.i - 1); });
    U.$("#sNext").addEventListener("click", function () { stopPlay(); go(SV.i + 1); });
    U.$("#sFirst").addEventListener("click", function () { stopPlay(); go(0); });
    U.$("#sLast").addEventListener("click", function () { stopPlay(); go(SV.run.steps.length - 1); });
    U.$("#sPlay").addEventListener("click", function () { if (SV.timer) stopPlay(); else play(); });
    U.$("#sSp").addEventListener("input", function () { SV.speed = 1480 - +this.value; });
    buildSort();
  };
  function buildSort() {
    stopPlay();
    SV.kind = U.$("#sK").value; SV.input = U.$("#sA").value;
    var a = nums(SV.input, 20); if (a.length < 2) { U.toast("Кемінде екі сан енгізіңіз"); return; }
    SV.run = sortSteps(SV.kind, a); SV.i = 0;
    U.$("#sNote").innerHTML = '<b>' + SORTS[SV.kind].name + '</b> · ' + SORTS[SV.kind].cx + '. ' + SORTS[SV.kind].note;
    U.$("#sPass").innerHTML = '<ol class="passes">' + SV.run.passes.map(function (p, k) {
      return '<li><span class="passes__l">' + esc(p.label) + '</span><code>' + p.a.join(", ") + '</code></li>'; }).join("") + '</ol>';
    go(0);
  }
  function go(i) {
    if (!SV.run) return;
    SV.i = Math.max(0, Math.min(i, SV.run.steps.length - 1));
    var st = SV.run.steps[SV.i], h = st.h, max = Math.max.apply(null, st.a.map(Math.abs).concat([1]));
    var box = U.$("#sBars"); if (!box) return stopPlay();
    box.style.setProperty("--n", st.a.length);
    box.innerHTML = st.a.map(function (v, k) {
      var cls = "sbar";
      if (st.sorted.indexOf(k) >= 0) cls += " is-sorted";
      if (h.range && (k < h.range[0] || k > h.range[1])) cls += " is-out";
      if (h.cmp && h.cmp.indexOf(k) >= 0) cls += " is-cmp";
      if (h.swap && h.swap.indexOf(k) >= 0) cls += " is-swap";
      if (h.mark && h.mark.indexOf(k) >= 0) cls += " is-mark";
      if (h.pivot === k) cls += " is-pivot";
      return '<div class="' + cls + '"><span class="sbar__f" style="height:' + Math.max(6, Math.abs(v) / max * 100) + '%"></span><b>' + v + '</b><small>' + k + '</small></div>';
    }).join("");
    U.$("#sMsg").textContent = (SV.i + 1) + " / " + SV.run.steps.length + " · " + st.msg;
    U.$("#sCnt").innerHTML = '<span>Салыстыру: <b>' + st.c + '</b></span><span>Алмасу / жылжыту: <b>' + st.s + '</b></span>' +
      '<span class="lg2"><i class="k-cmp"></i>салыстыру <i class="k-swap"></i>алмасу <i class="k-sorted"></i>орнында <i class="k-pivot"></i>тірек</span>';
  }
  function play() { var b = U.$("#sPlay"); if (b) b.textContent = "⏸ Тоқтату"; tick(); }
  function tick() {
    if (!U.$("#sBars")) return stopPlay();
    if (SV.i >= SV.run.steps.length - 1) return stopPlay();
    go(SV.i + 1); SV.timer = setTimeout(tick, SV.speed);
  }
  function stopPlay() { clearTimeout(SV.timer); SV.timer = null; var b = U.$("#sPlay"); if (b) b.textContent = "▶ Ойнату"; }

  /* ================= Екілік іздеу ================= */
  var BS = { arr: "3, 6, 9, 12, 15, 18, 21, 24, 27, 30", x: "21" };
  LAB.pages.search = function () {
    view.innerHTML = LAB.head("Екілік іздеу", "Массив өсу ретімен сұрыпталуы керек. Әр қадамда ортаңғы элемент mid = ⌊(low + high) / 2⌋ ізделетін санмен салыстырылады.", "search") +
      '<section class="labform"><label class="lbl">Сұрыпталған массив<input class="field" id="bA" value="' + esc(BS.arr) + '"></label>' +
        '<label class="lbl">Ізделетін сан<input class="field" id="bX" value="' + esc(BS.x) + '" inputmode="decimal"></label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="bGo">Іздеу</button></div></section><div id="bOut"></div>';
    U.$("#bGo").addEventListener("click", runBS); U.$("#bX").addEventListener("keydown", function (e) { if (e.key === "Enter") runBS(); });
    runBS();
  };
  function runBS() {
    BS.arr = U.$("#bA").value; BS.x = U.$("#bX").value;
    var a = nums(BS.arr, 40).sort(function (p, q) { return p - q; }), x = Number(BS.x), lo = 0, hi = a.length - 1, rows = [], found = -1;
    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2), v = a[mid], dec = v === x ? "табылды" : v < x ? a[mid] + " < " + x + " → оңға: low = " + (mid + 1) : a[mid] + " > " + x + " → солға: high = " + (mid - 1);
      rows.push({ lo: lo, hi: hi, mid: mid, v: v, dec: dec });
      if (v === x) { found = mid; break; }
      if (v < x) lo = mid + 1; else hi = mid - 1;
    }
    U.$("#bOut").innerHTML = '<p class="labnote">Массив: [' + a.join(", ") + '] · n = ' + a.length + ' · ең көп салыстыру ⌈log₂(n+1)⌉ = ' + Math.ceil(Math.log2(a.length + 1)) + '</p>' +
      rows.map(function (r, k) {
        return '<div class="bsrow"><span class="bsrow__n">' + (k + 1) + '</span><div class="cells">' + a.map(function (v, i) {
          var cls = "cellv" + (i < r.lo || i > r.hi ? " is-out" : "") + (i === r.mid ? (r.v === x ? " is-found" : " is-mid") : "");
          return '<span class="' + cls + '"><b>' + v + '</b><small>' + i + (i === r.lo ? " L" : "") + (i === r.hi ? " H" : "") + '</small></span>'; }).join("") + '</div>' +
          '<p>low = ' + r.lo + ', high = ' + r.hi + ', mid = ' + r.mid + ' (a[mid] = ' + r.v + ') · ' + esc(r.dec) + '</p></div>';
      }).join("") +
      '<p class="labres ' + (found >= 0 ? "is-ok" : "is-no") + '">' + (found >= 0 ? x + " табылды: индекс " + found + ", салыстырулар саны — " + rows.length : x + " массивте жоқ (low > high), салыстырулар саны — " + rows.length) +
      '. Сызықтық іздеу ' + (found >= 0 ? (found + 1) : a.length) + ' салыстыру жасар еді.</p>';
  }

  /* ================= Стек, кезек, дек ================= */
  var DS = { kind: "stack", items: [], log: [] };
  LAB.pages.ds = function () {
    var K = { stack: ["Стек (LIFO)", "Соңғы кірген — бірінші шығады. Амалдар тек төбесінде: push, pop, top."], queue: ["Кезек (FIFO)", "Бірінші кірген — бірінші шығады. Соңына қосылады (enqueue), басынан алынады (dequeue)."], deque: ["Дек", "Екі жақты кезек: екі шетінен де қосуға және алуға болады."] };
    view.innerHTML = LAB.head("Стек, кезек, дек", "Мән енгізіп, амалдарды басыңыз — құрылымның күйі мен амалдар тізбегі көрсетіледі. Емтихандағы «push(3), push(6), pop()… төбесінде не қалады?» сұрақтарын осында тексеріңіз.", "ds") +
      '<div class="seg" role="group">' + Object.keys(K).map(function (k) { return '<button data-dk="' + k + '" class="' + (DS.kind === k ? "is-on" : "") + '">' + K[k][0] + '</button>'; }).join("") + '</div>' +
      '<p class="labnote">' + K[DS.kind][1] + '</p>' +
      '<section class="labform labform--row"><label class="lbl">Мән<input class="field" id="dV" value="' + (Math.floor(Math.random() * 90) + 10) + '" inputmode="numeric"></label><div class="labform__btns" id="dBtns">' +
        (DS.kind === "stack" ? '<button class="btn btn--primary" data-op="push">push</button><button class="btn btn--line" data-op="pop">pop</button><button class="btn btn--line" data-op="top">top</button>'
          : DS.kind === "queue" ? '<button class="btn btn--primary" data-op="enqueue">enqueue</button><button class="btn btn--line" data-op="dequeue">dequeue</button><button class="btn btn--line" data-op="front">front</button>'
          : '<button class="btn btn--primary" data-op="push_front">push_front</button><button class="btn btn--primary" data-op="push_back">push_back</button><button class="btn btn--line" data-op="pop_front">pop_front</button><button class="btn btn--line" data-op="pop_back">pop_back</button>') +
        '<button class="btn btn--ghost" data-op="clear">Тазалау</button></div></section>' +
      '<section class="labform"><label class="lbl">Немесе амалдар тізбегі<input class="field" id="dSeq" placeholder="push 3, push 6, push 9, pop, push 1"></label><div class="labform__btns"><button class="btn btn--line" id="dRun">Орындау</button></div></section>' +
      '<section class="dsviz dsviz--' + DS.kind + '" id="dViz"></section><section class="block"><h2>Амалдар тізбегі</h2><ol class="dslog" id="dLog"></ol></section>';
    U.on("[data-dk]", "click", function (e, el) { DS.kind = el.getAttribute("data-dk"); DS.items = []; DS.log = []; LAB.pages.ds(); }, view);
    U.on("[data-op]", "click", function (e, el) { op(el.getAttribute("data-op"), U.$("#dV").value); U.$("#dV").value = Math.floor(Math.random() * 90) + 10; }, view);
    U.$("#dRun").addEventListener("click", function () {
      U.$("#dSeq").value.split(/[,;\n]+/).forEach(function (t) { var p = t.trim().split(/[\s()]+/).filter(Boolean); if (p.length) op(p[0].toLowerCase(), p[1]); });
    });
    drawDS();
  };
  function op(o, v) {
    var it = DS.items, r = "";
    var val = v !== undefined && String(v).trim() !== "" ? String(v).trim() : null;
    var alias = { insert: "enqueue", add: "enqueue", push_back: DS.kind === "deque" ? "push_back" : "push", remove: "dequeue", peek: DS.kind === "stack" ? "top" : "front" };
    if (alias[o] && !(DS.kind === "deque" && o === "push_back")) o = alias[o];
    if (DS.kind === "queue" && o === "push") o = "enqueue";
    if (DS.kind === "queue" && o === "pop") o = "dequeue";
    if (o === "clear") { DS.items = []; DS.log = []; return drawDS(); }
    if (/push|enqueue/.test(o) && val === null) { U.toast("Мән енгізіңіз"); return; }
    if (/push|enqueue/.test(o) && it.length >= 14) { U.toast("Көрнекілік үшін 14 элементпен шектелген"); return; }
    switch (o) {
      case "push": it.push(val); r = val + " төбесіне қосылды"; break;
      case "pop": r = it.length ? it.pop() + " алынды" : "Стек бос — алатын элемент жоқ (underflow)"; break;
      case "top": r = it.length ? "Төбеде: " + it[it.length - 1] : "Стек бос"; break;
      case "enqueue": it.push(val); r = val + " соңына қосылды"; break;
      case "dequeue": r = it.length ? it.shift() + " басынан алынды" : "Кезек бос"; break;
      case "front": r = it.length ? "Басында: " + it[0] : "Кезек бос"; break;
      case "push_front": it.unshift(val); r = val + " басына қосылды"; break;
      case "push_back": it.push(val); r = val + " соңына қосылды"; break;
      case "pop_front": r = it.length ? it.shift() + " басынан алынды" : "Дек бос"; break;
      case "pop_back": r = it.length ? it.pop() + " соңынан алынды" : "Дек бос"; break;
      default: U.toast("Белгісіз амал: " + o); return;
    }
    DS.log.push({ o: o + (/push|enqueue/.test(o) ? "(" + val + ")" : "()"), r: r, st: it.slice() });
    drawDS();
  }
  function drawDS() {
    var v = U.$("#dViz"); if (!v) return;
    var it = DS.items;
    v.innerHTML = it.length ? (DS.kind === "stack" ? '<div class="stack">' + it.slice().reverse().map(function (x, i) { return '<span class="dsel' + (i === 0 ? " is-top" : "") + '">' + esc(x) + (i === 0 ? '<small>top</small>' : "") + '</span>'; }).join("") + '</div>'
      : '<div class="queue">' + it.map(function (x, i) { return '<span class="dsel' + (i === 0 ? " is-front" : "") + (i === it.length - 1 ? " is-rear" : "") + '">' + esc(x) + '<small>' + (i === 0 && i === it.length - 1 ? "front · rear" : i === 0 ? "front" : i === it.length - 1 ? "rear" : "") + '</small></span>'; }).join("") + '</div>')
      : '<p class="muted">Бос. Мән енгізіп, амалды басыңыз.</p>';
    U.$("#dLog").innerHTML = DS.log.map(function (l) { return '<li><code>' + esc(l.o) + '</code> — ' + esc(l.r) + ' <span class="muted">[' + l.st.map(esc).join(", ") + ']</span></li>'; }).join("");
  }

  /* ================= Хеш-кесте ================= */
  var HT = { m: 11, method: "linear", keys: "22, 1, 13, 11, 24, 33, 18, 42, 31", c1: 1, c2: 1 };
  var HM = { chain: "Тізбектер әдісі (chaining)", linear: "Сызықтық зондтау", quad: "Квадраттық зондтау", dbl: "Қос хештеу" };
  LAB.pages.hash = function () {
    view.innerHTML = LAB.head("Хеш-кесте", "h(k) = k mod m. Соқтығысу болғанда таңдалған әдіс бойынша келесі ұяшық ізделеді. Әр кілттің зондтау тізбегі төменде жазылады.", "hash") +
      '<section class="labform">' +
        '<label class="lbl">Әдіс<select class="field" id="hM">' + Object.keys(HM).map(function (k) { return '<option value="' + k + '"' + (HT.method === k ? " selected" : "") + '>' + HM[k] + '</option>'; }).join("") + '</select></label>' +
        '<label class="lbl">Кесте өлшемі m<input class="field" id="hS" type="number" min="3" max="31" value="' + HT.m + '"></label>' +
        '<label class="lbl">Кілттер (ретімен)<input class="field" id="hK" value="' + esc(HT.keys) + '"></label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="hGo">Енгізу</button></div></section>' +
      '<p class="labnote" id="hF"></p><div id="hOut"></div>';
    ["#hM", "#hS"].forEach(function (s) { U.$(s).addEventListener("change", runHash); });
    U.$("#hGo").addEventListener("click", runHash);
    runHash();
  };
  function prevPrime(n) { for (var p = n - 1; p > 1; p--) { var ok = true; for (var d = 2; d * d <= p; d++) if (p % d === 0) { ok = false; break; } if (ok) return p; } return 1; }
  function runHash() {
    HT.method = U.$("#hM").value; HT.m = Math.max(3, Math.min(31, +U.$("#hS").value || 11)); HT.keys = U.$("#hK").value;
    var m = HT.m, keys = nums(HT.keys, 30).map(function (k) { return Math.round(Math.abs(k)); }), R = prevPrime(m);
    var mod = function (x) { return ((x % m) + m) % m; };
    var table = []; for (var i = 0; i < m; i++) table.push(HT.method === "chain" ? [] : null);
    var log = [], coll = 0;
    var formula = { chain: "h(k) = k mod " + m + "; бірдей хештегі кілттер сол ұяшықтың тізіміне қосылады.", linear: "hᵢ(k) = (k mod " + m + " + i) mod " + m + ", i = 0, 1, 2, …", quad: "hᵢ(k) = (k mod " + m + " + i²) mod " + m + ", i = 0, 1, 2, …", dbl: "h₁(k) = k mod " + m + ", h₂(k) = " + R + " − (k mod " + R + "); hᵢ(k) = (h₁ + i·h₂) mod " + m }[HT.method];
    keys.forEach(function (k) {
      var h0 = mod(k), seq = [], placed = -1;
      if (HT.method === "chain") { table[h0].push(k); seq.push(h0); if (table[h0].length > 1) coll++; placed = h0; }
      else {
        var h2 = R - (k % R);
        for (var t = 0; t < m * 2; t++) {
          var idx = HT.method === "linear" ? mod(h0 + t) : HT.method === "quad" ? mod(h0 + t * t) : mod(h0 + t * h2);
          seq.push(idx);
          if (table[idx] === null) { table[idx] = k; placed = idx; break; }
          coll++;
        }
      }
      log.push({ k: k, h0: h0, seq: seq, placed: placed, h2: HT.method === "dbl" ? R - (k % R) : null });
    });
    var filled = HT.method === "chain" ? keys.length : table.filter(function (x) { return x !== null; }).length;
    U.$("#hF").innerHTML = '<b>' + HM[HT.method] + '.</b> ' + formula;
    U.$("#hOut").innerHTML = '<div class="htable">' + table.map(function (c, i) {
      return '<div class="hcell' + (HT.method === "chain" ? (c.length ? " is-full" : "") : (c !== null ? " is-full" : "")) + '"><small>' + i + '</small>' +
        (HT.method === "chain" ? '<span class="hchain">' + (c.length ? c.map(function (x) { return '<b>' + x + '</b>'; }).join('<i>→</i>') : "—") + '</span>' : '<b>' + (c === null ? "—" : c) + '</b>') + '</div>';
    }).join("") + '</div>' +
      '<p class="labnote">Толтыру коэффициенті α = n / m = ' + keys.length + ' / ' + m + ' = ' + (keys.length / m).toFixed(2) + ' · соқтығысу (бос емес ұяшыққа тап болу) саны: ' + coll + '</p>' +
      '<div class="tablewrap"><table class="ltab"><thead><tr><th>Кілт</th><th>k mod ' + m + '</th>' + (HT.method === "dbl" ? '<th>h₂(k)</th>' : "") + '<th>Тексерілген ұяшықтар</th><th>Нәтиже</th></tr></thead><tbody>' +
      log.map(function (l) { return '<tr><td><b>' + l.k + '</b></td><td>' + l.h0 + '</td>' + (HT.method === "dbl" ? '<td>' + l.h2 + '</td>' : "") + '<td>' + l.seq.join(" → ") + '</td><td>' + (l.placed >= 0 ? l.placed + "-ұяшық" + (l.seq.length > 1 && HT.method !== "chain" ? " (" + (l.seq.length - 1) + " соқтығысу)" : "") : '<span class="tone-low">орын табылмады</span>') + '</td></tr>'; }).join("") +
      '</tbody></table></div>' + (filled >= m && HT.method !== "chain" ? '<p class="warn">Кесте толды — ашық адрестеуде α ≤ 1 болуы керек, әдетте α > 0,7 болса кесте үлкейтіледі.</p>' : "");
  }

  /* ================= BST және AVL ================= */
  var TR = { keys: "50, 30, 70, 20, 40, 60, 80", avl: false, root: null, log: [] };
  function nd(k) { return { k: k, l: null, r: null, h: 1 }; }
  function ht(n) { return n ? n.h : 0; }
  function upd(n) { n.h = 1 + Math.max(ht(n.l), ht(n.r)); return n; }
  function rotR(y) { var x = y.l; y.l = x.r; x.r = y; upd(y); return upd(x); }
  function rotL(x) { var y = x.r; x.r = y.l; y.l = x; upd(x); return upd(y); }
  function balance(n, log) {
    upd(n); var b = ht(n.l) - ht(n.r);
    if (b > 1) { if (ht(n.l.l) >= ht(n.l.r)) { log.push("LL жағдайы: " + n.k + " түйінінде оңға айналдыру"); return rotR(n); } log.push("LR жағдайы: " + n.l.k + " солға, сосын " + n.k + " оңға айналдыру"); n.l = rotL(n.l); return rotR(n); }
    if (b < -1) { if (ht(n.r.r) >= ht(n.r.l)) { log.push("RR жағдайы: " + n.k + " түйінінде солға айналдыру"); return rotL(n); } log.push("RL жағдайы: " + n.r.k + " оңға, сосын " + n.k + " солға айналдыру"); n.r = rotR(n.r); return rotL(n); }
    return n;
  }
  function ins(n, k, avl, log) {
    if (!n) return nd(k);
    if (k < n.k) n.l = ins(n.l, k, avl, log); else if (k > n.k) n.r = ins(n.r, k, avl, log); else { log.push(k + " ағашта бар — қайталанбайды"); return n; }
    return avl ? balance(n, log) : upd(n);
  }
  function del(n, k, avl, log) {
    if (!n) { log.push(k + " табылмады"); return n; }
    if (k < n.k) n.l = del(n.l, k, avl, log); else if (k > n.k) n.r = del(n.r, k, avl, log);
    else {
      if (!n.l || !n.r) { log.push(k + " өшірілді (" + (!n.l && !n.r ? "жапырақ" : "бір ұрпағы бар") + ")"); n = n.l || n.r; }
      else { var s = n.r; while (s.l) s = s.l; log.push(k + " өшірілді: орнына in-order мұрагері " + s.k + " қойылды"); n.k = s.k; n.r = del(n.r, s.k, avl, []); }
    }
    if (!n) return n;
    return avl ? balance(n, log) : upd(n);
  }
  function trav(n, kind, out) {
    if (!n) return out;
    if (kind === "pre") out.push(n.k);
    trav(n.l, kind, out);
    if (kind === "in") out.push(n.k);
    trav(n.r, kind, out);
    if (kind === "post") out.push(n.k);
    return out;
  }
  function level(n) { var q = n ? [n] : [], out = []; while (q.length) { var x = q.shift(); out.push(x.k); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return out; }
  LAB.tree = { ins: ins, del: del, trav: trav, level: level };
  LAB.pages.tree = function () {
    view.innerHTML = LAB.head("BST және AVL ағаштары", "Кілттерді ретімен енгізіңіз. AVL режимінде теңгерім бұзылса, айналдыру (LL, RR, LR, RL) автоматты түрде орындалады және жазылады.", "tree") +
      '<section class="labform"><label class="lbl">Кілттер (ретімен)<input class="field" id="tK" value="' + esc(TR.keys) + '"></label>' +
        '<label class="check"><input type="checkbox" id="tA"' + (TR.avl ? " checked" : "") + '> AVL (өзін-өзі теңгерімдейтін)</label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="tGo">Құру</button></div></section>' +
      '<section class="labform labform--row"><label class="lbl">Бір кілт<input class="field" id="tOne" inputmode="numeric" placeholder="45"></label><div class="labform__btns"><button class="btn btn--line" id="tIns">Қосу</button><button class="btn btn--line" id="tDel">Өшіру</button></div></section>' +
      '<div class="tviz" id="tViz"></div><div id="tInfo"></div>';
    U.$("#tGo").addEventListener("click", buildTree); U.$("#tA").addEventListener("change", buildTree);
    U.$("#tIns").addEventListener("click", function () { var k = Number(U.$("#tOne").value); if (!isFinite(k) || U.$("#tOne").value === "") return; var lg = []; TR.root = ins(TR.root, k, TR.avl, lg); TR.log.push("+" + k + (lg.length ? ": " + lg.join("; ") : "")); U.$("#tOne").value = ""; drawTree(); });
    U.$("#tDel").addEventListener("click", function () { var k = Number(U.$("#tOne").value); if (!isFinite(k) || U.$("#tOne").value === "") return; var lg = []; TR.root = del(TR.root, k, TR.avl, lg); TR.log.push("−" + k + ": " + lg.join("; ")); U.$("#tOne").value = ""; drawTree(); });
    buildTree();
  };
  function buildTree() {
    TR.keys = U.$("#tK").value; TR.avl = U.$("#tA").checked; TR.root = null; TR.log = [];
    nums(TR.keys, 31).forEach(function (k) { var lg = []; TR.root = ins(TR.root, k, TR.avl, lg); if (lg.length) TR.log.push("+" + k + ": " + lg.join("; ")); });
    drawTree();
  }
  function drawTree() {
    var r = TR.root, box = U.$("#tViz"); if (!box) return;
    if (!r) { box.innerHTML = '<p class="muted">Ағаш бос.</p>'; U.$("#tInfo").innerHTML = ""; return; }
    var pos = [], i = 0;
    (function lay(n, d) { if (!n) return; lay(n.l, d + 1); n._x = i++; n._y = d; pos.push(n); lay(n.r, d + 1); })(r, 0);
    var W = Math.max(320, i * 52), H = (ht(r)) * 70 + 20, sx = W / i, edges = "", nodes = "";
    pos.forEach(function (n) {
      var x = n._x * sx + sx / 2, y = n._y * 70 + 30;
      [n.l, n.r].forEach(function (c) { if (c) edges += '<line x1="' + x + '" y1="' + y + '" x2="' + (c._x * sx + sx / 2) + '" y2="' + (c._y * 70 + 30) + '"/>'; });
      var b = ht(n.l) - ht(n.r);
      nodes += '<g class="tn' + (Math.abs(b) > 1 ? " is-bad" : "") + '"><circle cx="' + x + '" cy="' + y + '" r="19"/><text x="' + x + '" y="' + (y + 5) + '">' + n.k + '</text>' +
        '<text class="tn__b" x="' + (x + 22) + '" y="' + (y - 14) + '">' + (b > 0 ? "+" + b : b) + '</text></g>';
    });
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Ағаш">' + edges + nodes + '</svg>';
    U.$("#tInfo").innerHTML = '<p class="labnote">Биіктік: <b>' + ht(r) + '</b> · түйіндер: <b>' + pos.length + '</b> · түйін жанындағы сан — теңгерім факторы (сол биіктік − оң биіктік)' + (TR.avl ? "" : ". |фактор| > 1 болса, AVL-де айналдыру керек болар еді (қызылмен белгіленген)") + '.</p>' +
      '<div class="travs">' + [["in", "In-order (сол → түбір → оң) — өсу реті"], ["pre", "Pre-order (түбір → сол → оң)"], ["post", "Post-order (сол → оң → түбір)"], ["lvl", "Деңгей бойынша (BFS)"]].map(function (t) {
        return '<div><span>' + t[1] + '</span><code>' + (t[0] === "lvl" ? level(r) : trav(r, t[0], [])).join(", ") + '</code></div>'; }).join("") + '</div>' +
      (TR.log.length ? '<section class="block"><h2>Амалдар жазбасы</h2><ol class="dslog">' + TR.log.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join("") + '</ol></section>' : "");
  }

  /* ================= Графтар ================= */
  var GR = { edges: "A-B 4\nA-C 2\nB-C 1\nB-D 5\nC-D 8\nC-E 10\nD-E 2\nD-F 6\nE-F 3", directed: false, start: "A", alg: "dijkstra" };
  var GA = { bfs: "BFS — еніне қарай", dfs: "DFS — тереңдікке қарай", dijkstra: "Дейкстра — ең қысқа жолдар", prim: "Прим — ең аз каркас ағашы", kruskal: "Крускал — ең аз каркас ағашы" };
  function parseGraph(txt, directed) {
    var V = [], E = [], adj = {};
    txt.split(/\n|;/).forEach(function (line) {
      var m = line.trim().match(/^([\wА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+)\s*(?:-|->|—|,|\s)\s*([\wА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+)(?:\s+(-?\d+(?:\.\d+)?))?$/);
      if (!m) return;
      var a = m[1], b = m[2], w = m[3] !== undefined ? +m[3] : 1;
      [a, b].forEach(function (v) { if (V.indexOf(v) < 0) { V.push(v); adj[v] = []; } });
      E.push({ a: a, b: b, w: w });
      adj[a].push({ to: b, w: w }); if (!directed) adj[b].push({ to: a, w: w });
    });
    Object.keys(adj).forEach(function (v) { adj[v].sort(function (p, q) { return p.to < q.to ? -1 : 1; }); });
    return { V: V, E: E, adj: adj };
  }
  function runGraph(g, alg, s, directed) {
    var steps = [], hiE = [], order = [];
    if (alg === "bfs" || alg === "dfs") {
      var seen = {}, dist = {};
      if (alg === "bfs") {
        var q = [s]; seen[s] = 1; dist[s] = 0;
        while (q.length) {
          var v = q.shift(); order.push(v);
          var added = [];
          g.adj[v].forEach(function (e) { if (!seen[e.to]) { seen[e.to] = 1; dist[e.to] = dist[v] + 1; q.push(e.to); hiE.push([v, e.to]); added.push(e.to); } });
          steps.push({ t: "Кезектен " + v + " алынды" + (added.length ? "; кезекке қосылды: " + added.join(", ") : ""), q: q.slice() });
        }
        return { order: order, steps: steps, hiE: hiE, extra: "Қашықтықтар (қырлар саны): " + order.map(function (v) { return v + "=" + dist[v]; }).join(", ") };
      }
      (function dfs(v, from) {
        seen[v] = 1; order.push(v); if (from) hiE.push([from, v]);
        steps.push({ t: v + " төбесіне кірдік" + (from ? " (" + from + "-дан)" : "") });
        g.adj[v].forEach(function (e) { if (!seen[e.to]) dfs(e.to, v); });
        steps.push({ t: v + " толық қаралды, артқа қайтамыз" });
      })(s, null);
      return { order: order, steps: steps, hiE: hiE, extra: "" };
    }
    if (alg === "dijkstra") {
      var D = {}, P = {}, done = {}, rows = [];
      g.V.forEach(function (v) { D[v] = Infinity; }); D[s] = 0;
      if (g.E.some(function (e) { return e.w < 0; })) steps.push({ t: "Назар аударыңыз: теріс салмақты қыр бар — Дейкстра дұрыс нәтиже бермеуі мүмкін (Беллман–Форд керек)." });
      for (var it = 0; it < g.V.length; it++) {
        var u = null; g.V.forEach(function (v) { if (!done[v] && D[v] < Infinity && (u === null || D[v] < D[u])) u = v; });
        if (u === null) break;
        done[u] = 1; order.push(u);
        var upd2 = [];
        g.adj[u].forEach(function (e) { if (!done[e.to] && D[u] + e.w < D[e.to]) { D[e.to] = D[u] + e.w; P[e.to] = u; upd2.push(e.to + "=" + D[e.to]); } });
        rows.push({ u: u, D: g.V.map(function (v) { return D[v]; }), done: Object.keys(done) });
        steps.push({ t: u + " бекітілді (қашықтық " + D[u] + ")" + (upd2.length ? "; жаңартылды: " + upd2.join(", ") : "") });
      }
      Object.keys(P).forEach(function (v) { hiE.push([P[v], v]); });
      var paths = g.V.map(function (v) { if (D[v] === Infinity) return v + ": жетпейді"; var p = [v], x = v; while (P[x]) { x = P[x]; p.unshift(x); } return v + ": " + D[v] + " (" + p.join("→") + ")"; });
      return { order: order, steps: steps, hiE: hiE, rows: rows, extra: "Ең қысқа жолдар: " + paths.join("; ") };
    }
    if (alg === "prim") {
      var inT = {}, total = 0; inT[s] = 1; order.push(s);
      while (order.length < g.V.length) {
        var best = null;
        g.E.forEach(function (e) { [[e.a, e.b], [e.b, e.a]].forEach(function (p) { if (inT[p[0]] && !inT[p[1]] && (!best || e.w < best.w)) best = { a: p[0], b: p[1], w: e.w }; }); });
        if (!best) { steps.push({ t: "Граф байланыссыз — қалған төбелерге жету мүмкін емес" }); break; }
        inT[best.b] = 1; order.push(best.b); hiE.push([best.a, best.b]); total += best.w;
        steps.push({ t: "Ағаштан шығатын ең жеңіл қыр: " + best.a + "–" + best.b + " (" + best.w + ")" });
      }
      return { order: order, steps: steps, hiE: hiE, extra: "Каркас ағашының салмағы: " + total };
    }
    if (alg === "kruskal") {
      var par = {}; g.V.forEach(function (v) { par[v] = v; });
      var find = function (x) { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
      var tot = 0, es = g.E.slice().sort(function (p, q) { return p.w - q.w; });
      es.forEach(function (e) {
        var ra = find(e.a), rb = find(e.b);
        if (ra !== rb) { par[ra] = rb; hiE.push([e.a, e.b]); tot += e.w; steps.push({ t: e.a + "–" + e.b + " (" + e.w + ") алынды" }); }
        else steps.push({ t: e.a + "–" + e.b + " (" + e.w + ") өткізілді — цикл құрайды", skip: true });
      });
      return { order: [], steps: steps, hiE: hiE, extra: "Қырлар салмағының өсу реті бойынша қаралды. Каркас ағашының салмағы: " + tot + " (" + hiE.length + " қыр = |V| − 1 = " + (g.V.length - 1) + ")" };
    }
  }
  LAB.graph = { parse: parseGraph, run: runGraph };
  LAB.pages.graph = function () {
    view.innerHTML = LAB.head("Графтар", "Қырларды «A-B 4» түрінде, әр жолға бір қыр жазыңыз (салмақсыз болса — тек «A-B»). Көрші төбелер әліпби ретімен қаралады.", "graph") +
      '<section class="labform labform--graph">' +
        '<label class="lbl">Қырлар<textarea class="field" id="gE" rows="7" spellcheck="false">' + esc(GR.edges) + '</textarea></label>' +
        '<div class="labform__col"><label class="lbl">Алгоритм<select class="field" id="gA">' + Object.keys(GA).map(function (k) { return '<option value="' + k + '"' + (GR.alg === k ? " selected" : "") + '>' + GA[k] + '</option>'; }).join("") + '</select></label>' +
        '<label class="lbl">Бастапқы төбе<input class="field" id="gS" value="' + esc(GR.start) + '"></label>' +
        '<label class="check"><input type="checkbox" id="gD"' + (GR.directed ? " checked" : "") + '> Бағытталған граф</label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="gGo">Орындау</button></div></div></section>' +
      '<div id="gOut"></div>';
    U.$("#gGo").addEventListener("click", drawGraph); ["#gA", "#gD"].forEach(function (s) { U.$(s).addEventListener("change", drawGraph); });
    drawGraph();
  };
  function drawGraph() {
    GR.edges = U.$("#gE").value; GR.alg = U.$("#gA").value; GR.start = U.$("#gS").value.trim(); GR.directed = U.$("#gD").checked;
    var g = parseGraph(GR.edges, GR.directed), out = U.$("#gOut");
    if (!g.V.length) { out.innerHTML = '<p class="warn">Қырлар табылмады. Мысалы: A-B 4</p>'; return; }
    if (g.V.indexOf(GR.start) < 0) GR.start = g.V[0];
    var r = runGraph(g, GR.alg, GR.start, GR.directed);
    var n = g.V.length, R = 120 + n * 8, W = 2 * R + 80, P = {};
    g.V.forEach(function (v, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; P[v] = [W / 2 + R * Math.cos(a), W / 2 + R * Math.sin(a)]; });
    var isHi = function (a, b) { return r.hiE.some(function (h) { return (h[0] === a && h[1] === b) || (!GR.directed && h[0] === b && h[1] === a); }); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + W + '" class="gsvg" role="img" aria-label="Граф"><defs><marker id="arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="garr"/></marker></defs>';
    g.E.forEach(function (e) {
      var a = P[e.a], b = P[e.b], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      svg += '<line class="ge' + (isHi(e.a, e.b) ? " is-hi" : "") + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"' + (GR.directed ? ' marker-end="url(#arr)"' : "") + '/>' +
        '<text class="gw" x="' + mx + '" y="' + (my - 4) + '">' + e.w + '</text>';
    });
    g.V.forEach(function (v) { var k = r.order.indexOf(v); svg += '<g class="gv' + (v === GR.start ? " is-start" : "") + '"><circle cx="' + P[v][0] + '" cy="' + P[v][1] + '" r="18"/><text x="' + P[v][0] + '" y="' + (P[v][1] + 5) + '">' + esc(v) + '</text>' + (k >= 0 ? '<text class="gord" x="' + (P[v][0] + 20) + '" y="' + (P[v][1] - 18) + '">' + (k + 1) + '</text>' : "") + '</g>'; });
    svg += '</svg>';
    out.innerHTML = '<div class="gwrap"><div class="gviz">' + svg + '</div><div class="ginfo">' +
      (r.order.length ? '<p class="labres is-ok">Аралау / бекіту реті: <b>' + r.order.map(esc).join(" → ") + '</b></p>' : "") +
      (r.extra ? '<p class="labnote">' + esc(r.extra) + '</p>' : "") +
      '<ol class="dslog">' + r.steps.map(function (s) { return '<li' + (s.skip ? ' class="muted"' : "") + '>' + esc(s.t) + (s.q ? ' <span class="muted">кезек: [' + s.q.map(esc).join(", ") + ']</span>' : "") + '</li>'; }).join("") + '</ol></div></div>' +
      (r.rows ? '<section class="block"><h2>Дейкстра кестесі</h2><div class="tablewrap"><table class="ltab"><thead><tr><th>Қадам</th><th>Бекітілді</th>' + g.V.map(function (v) { return '<th>' + esc(v) + '</th>'; }).join("") + '</tr></thead><tbody>' +
        r.rows.map(function (row, i) { return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(row.u) + '</b></td>' + row.D.map(function (d, j) { return '<td' + (row.done.indexOf(g.V[j]) >= 0 ? ' class="is-done"' : "") + '>' + (d === Infinity ? "∞" : d) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div></section>' : "");
  }
})(window);
