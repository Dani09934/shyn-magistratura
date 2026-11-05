/* Шың — басты экранға орнату (PWA): service worker тіркеу, «Орнату» батырмасы және iPhone үшін нұсқаулық. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U;
  var view = document.getElementById("view");
  var deferred = null;
  var ua = navigator.userAgent || "";
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  function standalone() { return (global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
  function dismissed() { try { return localStorage.getItem("shyn_install_dismissed") === "1"; } catch (e) { return false; } }
  function setDismissed() { try { localStorage.setItem("shyn_install_dismissed", "1"); } catch (e) {} }

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    var hadController = !!navigator.serviceWorker.controller;
    global.addEventListener("load", function () { navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) { try { reg.update(); } catch (e) {} }).catch(function () {}); });
    // Сайттың жаңа нұсқасы орнатылса: тест/сабақ жүріп жатпаса — бетті жаңартамыз, әйтпесе хабарлаймыз
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController) { hadController = true; return; }
      var r = document.body.getAttribute("data-route");
      if (r === "quiz" || r === "lesson") U.toast("Сайттың жаңа нұсқасы жүктелді — тестті аяқтаған соң бетті жаңартыңыз");
      else location.reload();
    });
  }
  global.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; refresh(); });
  global.addEventListener("appinstalled", function () { deferred = null; U.toast("Шың басты экранға орнатылды"); refresh(); });

  Shyn.install = function () {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (r) { if (r.outcome === "accepted") setDismissed(); deferred = null; refresh(); });
    } else Shyn.go("#/install");
  };

  function refresh() {
    var hide = standalone();
    U.$$('[data-r="install"]').forEach(function (a) { a.hidden = hide; });
    var bn = document.getElementById("installBanner");
    if (bn) bn.hidden = hide || dismissed() || document.body.getAttribute("data-route") !== "home" || !(deferred || isIOS || isAndroid);
  }
  Shyn.pwaRefresh = refresh;

  // Басты беттегі шағын баннер (телефонда)
  var banner = document.createElement("div");
  banner.id = "installBanner"; banner.className = "ibanner"; banner.hidden = true;
  banner.innerHTML = '<img src="icons/icon-192.png" alt="" width="40" height="40"><div><b>Шыңды басты экранға қосыңыз</b><span>Қолданба сияқты бір басумен ашылады, интернетсіз де жұмыс істейді.</span></div>' +
    '<button class="btn btn--gold" id="ibGo">Орнату</button><button class="ibanner__x" id="ibX" aria-label="Жабу">×</button>';
  document.body.appendChild(banner);
  banner.querySelector("#ibGo").addEventListener("click", function () { Shyn.install(); });
  banner.querySelector("#ibX").addEventListener("click", function () { setDismissed(); refresh(); });
  global.addEventListener("hashchange", function () { setTimeout(refresh, 0); });
  Shyn.onReady(function () { setTimeout(refresh, 0); });

  // Нұсқаулық беті
  Shyn.route("install", function () {
    var done = standalone();
    var step = function (n, t) { return '<li><span class="istep__n">' + n + '</span><span>' + t + '</span></li>'; };
    view.innerHTML =
      '<header class="page-head"><h1>Басты экранға орнату</h1><p class="muted">Шыңды телефонға немесе компьютерге қолданба ретінде қосыңыз: белгішесі басты экранда тұрады, толық экранда ашылады, ал бір рет ашылған сұрақтар интернетсіз де жұмыс істейді.</p></header>' +
      '<section class="iinst">' +
        '<div class="iinst__icon"><img src="icons/icon-512.png" alt="Шың белгішесі" width="120" height="120"><b>Шың</b></div>' +
        '<div class="iinst__main">' +
          (done ? '<p class="iok">Шың осы құрылғыда қолданба ретінде ашылып тұр — бәрі дайын.</p>'
            : deferred ? '<p>Браузер орнатуға дайын. Бір батырманы басыңыз:</p><button class="btn btn--gold btn--big" id="instNow">Орнату</button>'
            : '<p class="muted">Орнату батырмасы шықпаса, төмендегі нұсқаулықты орындаңыз.</p>') +
        '</div></section>' +
      '<section class="block idev' + (isIOS ? " is-mine" : "") + '"><h2>iPhone және iPad (Safari)</h2><ol class="isteps">' +
        step(1, "Сайтты <b>Safari</b> браузерінде ашыңыз (Chrome-да да болады — мәзірдегі «Бөлісу»).") +
        step(2, "Төмендегі <b>Бөлісу</b> батырмасын басыңыз — жоғары қараған көрсеткісі бар шаршы.") +
        step(3, "Тізімнен <b>«На экран Домой» / «Add to Home Screen» / «Басты экранға»</b> пунктін таңдаңыз.") +
        step(4, "Атауы «Шың» болып тұрады — <b>«Добавить» / «Add»</b> батырмасын басыңыз.") + '</ol></section>' +
      '<section class="block idev' + (isAndroid ? " is-mine" : "") + '"><h2>Android (Chrome, Samsung Internet)</h2><ol class="isteps">' +
        step(1, "Сайтты <b>Chrome</b> браузерінде ашыңыз.") +
        step(2, "Жоғарғы оң жақтағы <b>⋮</b> мәзірін басыңыз.") +
        step(3, "<b>«Установить приложение» / «Install app»</b> немесе <b>«Добавить на гл. экран»</b> таңдаңыз.") +
        step(4, "Растаңыз — Шың белгішесі басты экранға шығады.") + '</ol></section>' +
      '<section class="block idev' + (!isIOS && !isAndroid ? " is-mine" : "") + '"><h2>Компьютер (Chrome, Edge)</h2><ol class="isteps">' +
        step(1, "Мекенжай жолының оң жағындағы <b>орнату белгішесін</b> (⊕ немесе экран мен көрсеткі) басыңыз.") +
        step(2, "Немесе мәзір → <b>«Сохранить и поделиться» → «Установить страницу как приложение»</b>.") +
        step(3, "Шың жеке терезеде ашылады және «Пуск» мәзірінде / Dock-та тұрады.") + '</ol></section>' +
      '<p class="muted">Прогресс (статистика, курс, тарих) әр құрылғының өзінде сақталады. Сайт пен орнатылған қолданба бір құрылғыда ортақ прогресті пайдаланады.</p>';
    var b = U.$("#instNow"); if (b) b.addEventListener("click", Shyn.install);
  });
})(window);
