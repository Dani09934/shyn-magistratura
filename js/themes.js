/* Шың — безендіру: түс схемалары, режим (жарық/қараңғы/OLED), қаріп, бұрыштар, анимация.
   Таңдау бірден қолданылады; ұнамаса — басқасын басу жеткілікті. Барлығы Store.settings ішінде сақталады. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, Store = Shyn.Store, U = Shyn.U, esc = U.esc;
  var root = document.documentElement;

  // sw: [бүйір мәзір, негізгі түс, алтын, фон, бет] — кішкентай алдын ала көрініс үшін
  var THEMES = [
    { id: "dala", name: "Дала түні", desc: "Сия көк, бірюза, киіз алтыны", sw: ["#15233F", "#0B6E79", "#D6981C", "#E9EFF2", "#FFFFFF"] },
    { id: "koktem", name: "Көктем", desc: "Жасыл шалғын, жұмсақ әрі тыныш", sw: ["#17301F", "#2E7D4F", "#C99A1E", "#EAF1EA", "#FFFFFF"] },
    { id: "aspan", name: "Аспан", desc: "Ашық көк, сергек әрі таза", sw: ["#0F2452", "#2160D0", "#F0A400", "#E8EEF8", "#FFFFFF"] },
    { id: "anar", name: "Анар", desc: "Анар қызылы мен жылы алтын", sw: ["#3A1620", "#A62E48", "#D9962B", "#F5ECEC", "#FFFFFF"] },
    { id: "kulgin", name: "Күлгін кеш", desc: "Күлгін түн, жұмсақ контраст", sw: ["#221A44", "#6447C2", "#E2A23A", "#EEEBF7", "#FFFFFF"] },
    { id: "kum", name: "Құм (оқу)", desc: "Сепия — ұзақ оқығанда көз шаршамайды", sw: ["#3A2E1E", "#8A5420", "#B5872A", "#EFE6D6", "#FBF6EC"] },
    { id: "kontrast", name: "Жоғары контраст", desc: "Ақ-қара, мәтін барынша анық", sw: ["#000000", "#0040A8", "#9A5B00", "#FFFFFF", "#FFFFFF"] }
  ];
  var MODES = [["auto", "Жүйелік"], ["light", "Жарық"], ["dark", "Қараңғы"], ["oled", "Қара (OLED)"]];
  var FONTS = [["onest", "Onest", "Заманауи, әдепкі"], ["serif", "PT Serif", "Кітап сияқты, оқуға"], ["system", "Жүйелік", "Ең жылдам жүктеледі"]];
  var SIZES = [[0.92, "Кіші"], [1, "Қалыпты"], [1.1, "Үлкен"], [1.22, "Өте үлкен"]];
  var SHAPES = [["round", "Дөңгелек"], ["normal", "Қалыпты"], ["sharp", "Тік"]];
  var MOTION = [["on", "Қосулы"], ["reduce", "Азайту"]];
  Shyn.THEMES = THEMES;

  function get(k, d) { var v = Store.settings[k]; return v === undefined || v === null || v === "" ? d : v; }
  function themeById(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return THEMES[0]; }

  var serifLoaded = false;
  function loadSerif() {
    if (serifLoaded) return; serifLoaded = true;
    var l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(l);
  }

  Shyn.applyDesign = function () {
    var pal = themeById(get("palette", "dala")).id, mode = get("theme", "auto");
    var dark = mode === "dark" || mode === "oled" || (mode === "auto" && global.matchMedia("(prefers-color-scheme: dark)").matches);
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.setAttribute("data-palette", pal);
    if (mode === "oled") root.setAttribute("data-oled", ""); else root.removeAttribute("data-oled");
    var font = get("font", "onest"); root.setAttribute("data-font", font); if (font === "serif") loadSerif();
    root.setAttribute("data-shape", get("shape", "normal"));
    root.setAttribute("data-motion", get("motion", "on"));
    root.style.setProperty("--fs", get("fontScale", 1));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--rail").trim() || "#15233F");
    var b = document.getElementById("themeBtn"); if (b) b.setAttribute("aria-label", "Безендіру: " + themeById(pal).name);
  };

  function seg(key, list, cur) {
    return '<div class="seg">' + list.map(function (x) {
      return '<button type="button" data-dset="' + key + '" data-val="' + x[0] + '" class="' + (String(cur) === String(x[0]) ? "is-on" : "") + '"' +
        (x[2] ? ' title="' + esc(x[2]) + '"' : "") + '>' + esc(x[1]) + '</button>'; }).join("") + '</div>';
  }

  Shyn.designPanelHTML = function () {
    var pal = themeById(get("palette", "dala")).id;
    var cards = THEMES.map(function (t) {
      var s = t.sw, on = t.id === pal;
      return '<button type="button" class="dtheme' + (on ? " is-on" : "") + '" data-pal="' + t.id + '" aria-pressed="' + on + '">' +
        '<span class="dtheme__pv" style="background:' + s[3] + '" aria-hidden="true">' +
          '<span class="dtheme__rail" style="background:' + s[0] + '"><i style="background:' + s[2] + '"></i><i></i><i></i></span>' +
          '<span class="dtheme__card" style="background:' + s[4] + '"><i style="background:' + s[0] + '"></i><i></i><b style="background:' + s[1] + '"></b></span>' +
        '</span><span class="dtheme__t"><b>' + esc(t.name) + (on ? ' <span class="dtheme__ok">✓</span>' : "") + '</b><small>' + esc(t.desc) + '</small></span></button>';
    }).join("");
    return '<div class="dpanel">' +
      '<div class="dpanel__h"><h3>Түс схемасы</h3><button type="button" class="btn btn--line btn--sm" data-drand>Кездейсоқ</button></div>' +
      '<div class="dthemes">' + cards + '</div>' +
      '<div class="dgrid">' +
        '<div class="drow"><h3>Режим</h3>' + seg("theme", MODES, get("theme", "auto")) + '</div>' +
        '<div class="drow"><h3>Қаріп</h3>' + seg("font", FONTS, get("font", "onest")) + '</div>' +
        '<div class="drow"><h3>Қаріп өлшемі</h3>' + seg("fontScale", SIZES, get("fontScale", 1)) + '</div>' +
        '<div class="drow"><h3>Бұрыштар</h3>' + seg("shape", SHAPES, get("shape", "normal")) + '</div>' +
        '<div class="drow"><h3>Анимация</h3>' + seg("motion", MOTION, get("motion", "on")) + '</div>' +
      '</div>' +
      '<div class="dpanel__f"><p class="muted">Таңдау бірден қолданылады және осы құрылғыда сақталады. Ұнамаса — басқасын басыңыз.</p>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-dreset>Әдепкіге қайтару</button></div></div>';
  };

  // Панельді кез келген контейнерге қосу (модаль немесе баптаулар беті)
  Shyn.bindDesignPanel = function (box) {
    if (!box || box._dBound) return; box._dBound = true;
    function redraw() { var p = box.querySelector(".dpanel"); if (p) p.outerHTML = Shyn.designPanelHTML(); }
    box.addEventListener("click", function (e) {
      var el = e.target.closest("[data-pal],[data-dset],[data-drand],[data-dreset]"); if (!el || !box.contains(el)) return;
      if (el.hasAttribute("data-pal")) {
        Store.set("palette", el.getAttribute("data-pal"));
        U.toast("«" + themeById(el.getAttribute("data-pal")).name + "» схемасы қосылды");
      } else if (el.hasAttribute("data-dset")) {
        var k = el.getAttribute("data-dset"), v = el.getAttribute("data-val");
        Store.set(k, k === "fontScale" ? +v : v);
      } else if (el.hasAttribute("data-drand")) {
        var cur = get("palette", "dala"), pool = THEMES.filter(function (t) { return t.id !== cur; });
        var t = pool[Math.floor(Math.random() * pool.length)]; Store.set("palette", t.id); U.toast("«" + t.name + "» — ұнамаса, тағы басыңыз");
      } else if (el.hasAttribute("data-dreset")) {
        ["palette", "font", "shape", "motion"].forEach(function (k) { Store.set(k, ""); });
        Store.set("theme", "auto"); Store.set("fontScale", 1); U.toast("Әдепкі безендіру қайтарылды");
      }
      Shyn.applyDesign(); redraw();
    });
  };

  Shyn.openDesign = function () {
    Shyn.modal('<h2 class="modal__title">Безендіру</h2>' + Shyn.designPanelHTML() +
      '<div class="modal__actions"><button class="btn btn--primary" data-close>Дайын</button></div>');
    Shyn.bindDesignPanel(document.getElementById("modalBody"));
  };

  Shyn.applyDesign();
  global.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", Shyn.applyDesign);
})(window);
