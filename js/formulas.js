/* Шың — «Формулалар» (бір беттік анықтамалық, іздеу және басып шығару) және «Қиын есептер» (қадамдық шешімдер, тест режимі). */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;

  // [бөлім, [[атауы, формула/ереже, түсініктеме], ...]]
  var F = [
    ["ТГО · Арифметика және пайыз", "fundamentals", [
      ["a-ның p%-ы", "a · p / 100", "20-ның 15%-ы = 3"],
      ["p%-ға арттыру / кеміту", "a · (1 + p/100) / a · (1 − p/100)", "Тізбекті өзгерістер көбейтіледі: +20%, −20% → 0,96"],
      ["Өзгеріс пайызы", "(жаңа − ескі) / ескі · 100%", "80 → 100: +25%; 100 → 80: −20%"],
      ["Күрделі пайыз", "S = P · (1 + r)ⁿ", "100 000 · 1,1² = 121 000"],
      ["Ерітінді / қоспа", "зат = масса · концентрация", "Су қосқанда заттың массасы өзгермейді"],
      ["Пропорция", "a : b = c : d → a·d = b·c", "Кері пропорция: x₁·y₁ = x₂·y₂ (жұмысшы · күн)"],
      ["ЕҮОБ · ЕКОЕ", "ЕҮОБ(a, b) · ЕКОЕ(a, b) = a · b", "Жай көбейткіштерге жіктеп: ЕҮОБ — кіші дәрежелер, ЕКОЕ — үлкен дәрежелер"],
      ["Бөлгіштер саны", "n = p₁^a · p₂^b → (a + 1)(b + 1)", "72 = 2³·3² → 4 · 3 = 12"],
      ["Бөлінгіштік белгілері", "2 — соңғы цифр жұп; 3, 9 — цифрлар қосындысы; 4 — соңғы екі цифр; 5 — 0 не 5; 11 — тақ/жұп орындардағы цифрлар айырмасы", ""],
      ["Соңғы цифр циклі", "2: 2,4,8,6 · 3: 3,9,7,1 · 7: 7,9,3,1 · 8: 8,4,2,6 · 4, 9: екі мүше", "Дәреже көрсеткішін 4-ке бөлгендегі қалдық бойынша"]]],
    ["ТГО · Алгебра", "fundamentals", [
      ["Қысқаша көбейту", "(a ± b)² = a² ± 2ab + b²;  a² − b² = (a − b)(a + b)", "(a ± b)³ = a³ ± 3a²b + 3ab² ± b³;  a³ ± b³ = (a ± b)(a² ∓ ab + b²)"],
      ["Дәреже", "aᵐ · aⁿ = aᵐ⁺ⁿ;  aᵐ / aⁿ = aᵐ⁻ⁿ;  (aᵐ)ⁿ = aᵐⁿ;  a⁻ⁿ = 1/aⁿ;  a⁰ = 1", "(0,2)⁻² = 5² = 25"],
      ["Түбір", "√(ab) = √a · √b;  √(a²) = |a|;  a^(m/n) = ⁿ√(aᵐ)", ""],
      ["Квадрат теңдеу", "D = b² − 4ac;  x = (−b ± √D) / 2a", "D > 0 — 2 түбір, D = 0 — 1, D < 0 — жоқ"],
      ["Виет теоремасы", "x₁ + x₂ = −b/a;  x₁ · x₂ = c/a", "Көбейтіндісі 20, қосындысы 9 → 4 және 5"],
      ["Модуль", "|x − a| < r ⇔ a − r < x < a + r;  |x − a| > r ⇔ x < a − r не x > a + r", ""],
      ["x + 1/x түрі", "x² + 1/x² = (x + 1/x)² − 2", "x + 1/x = 3 → 7"],
      ["Арифметикалық прогрессия", "aₙ = a₁ + (n − 1)d;  Sₙ = (a₁ + aₙ)/2 · n", "1 + 2 + … + n = n(n + 1)/2"],
      ["Геометриялық прогрессия", "bₙ = b₁ · qⁿ⁻¹;  Sₙ = b₁(qⁿ − 1)/(q − 1)", "Шексіз кемімелі: S = b₁ / (1 − q), |q| < 1"]]],
    ["ТГО · Мәтін есептер", "fundamentals", [
      ["Қозғалыс", "s = v · t", "Қарсы: v₁ + v₂; қуғыншы: v₁ − v₂; ағыспен: v + u, қарсы: v − u"],
      ["Орташа жылдамдық", "v = барлық жол / барлық уақыт", "Тең екі бөлік: 2v₁v₂ / (v₁ + v₂), жай орта емес!"],
      ["Бірлескен жұмыс", "1/T = 1/T₁ + 1/T₂ (− 1/T₃ — босататын құбыр)", "6 және 9 сағ, босатқыш 18 → 4,5 сағ"],
      ["Жас есептері", "x жылдан кейін бәріне +x; жас айырмасы тұрақты", ""],
      ["Сағат бұрышы", "|30·h − 5,5·m|", "3:40 → |90 − 220| = 130°"]]],
    ["ТГО · Геометрия", "fundamentals", [
      ["Үшбұрыш", "S = ½ah = ½ab·sin C;  Герон: √(p(p−a)(p−b)(p−c))", "Бұрыштар қосындысы 180°; 13–14–15 → 84"],
      ["Пифагор", "c² = a² + b²", "Үштіктер: 3–4–5, 5–12–13, 8–15–17, 7–24–25"],
      ["Тіктөртбұрыш, шаршы", "S = ab, P = 2(a + b);  шаршы d = a√2", ""],
      ["Ромб, параллелограмм", "ромб S = d₁d₂/2;  параллелограмм S = a·h", "Ромб диагональдары тік бұрышпен қиылысып, тең бөлінеді"],
      ["Трапеция", "S = (a + b)/2 · h", "Орта сызық = (a + b)/2"],
      ["Шеңбер, дөңгелек", "C = 2πr = πd;  S = πr²;  доға = πr·α/180", "Іштей сызылған шеңбер (шаршыда): r = a/2"],
      ["Көпбұрыш", "бұрыштар қосындысы 180°(n − 2);  диагональдар n(n − 3)/2", "Дұрыс алтыбұрыш: бұрышы 120°"],
      ["Көлем", "параллелепипед abc;  текше a³;  цилиндр πr²h;  конус ⅓πr²h;  шар ⁴⁄₃πr³", "Өлшем k есе → аудан k², көлем k³ есе"]]],
    ["ТГО · Статистика, комбинаторика, ықтималдық", "fundamentals", [
      ["Орта мән", "(x₁ + … + xₙ) / n", "Жаңа элемент: жаңа қосынды − ескі қосынды"],
      ["Медиана", "реттелген қатардың ортасы; жұп санда — екі ортаңғының ортасы", "Алдымен реттеу!"],
      ["Мода, құлаш", "мода — ең жиі; құлаш = max − min", ""],
      ["Орын ауыстыру", "Pₙ = n!", "0! = 1;  4! = 24;  5! = 120"],
      ["Орналастыру (рет маңызды)", "A(n, k) = n! / (n − k)!", "5-тен 2 лауазым: 20"],
      ["Теру (рет маңызды емес)", "C(n, k) = n! / (k!(n − k)!)", "C(5, 2) = 10;  C(n, k) = C(n, n − k)"],
      ["Ықтималдық", "P = m / n;  P(емес A) = 1 − P(A)", "Тәуелсіз «және» — көбейту; үйлесімсіз «немесе» — қосу"]]],
    ["ТГО · Өлшем бірліктері", "fundamentals", [
      ["Масса", "1 т = 10 ц = 1000 кг;  1 кг = 1000 г", ""],
      ["Ұзындық, аудан", "1 км = 1000 м;  1 м² = 10 000 см²;  1 га = 10 000 м²;  1 км² = 100 га", ""],
      ["Көлем", "1 л = 1 дм³ = 1000 см³;  1 м³ = 1000 л", ""],
      ["Уақыт, жылдамдық", "1 сағ = 60 мин = 3600 с;  1 м/с = 3,6 км/сағ", "72 км/сағ = 20 м/с"],
      ["Масштаб", "1 : 1 000 000 → 1 см = 10 км", ""]]],
    ["Алгоритмдер · Күрделілік", "algo", [
      ["Кластар (баяулау ретімен)", "O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)", ""],
      ["Цикл ережелері", "кірістірілген — көбейту;  қатар — қосу (үлкені);  i *= 2 немесе i /= 2 — log n", "for i, for j < i → n(n − 1)/2 = O(n²)"],
      ["Мастер-теорема", "T(n) = aT(n/b) + f(n), c = log_b a", "f < nᶜ → O(nᶜ);  f = nᶜ → O(nᶜ log n);  f > nᶜ → O(f)"],
      ["Жиі рекурренттер", "T(n/2) + 1 → log n;  2T(n/2) + n → n log n;  T(n−1) + n → n²;  2T(n−1) + 1 → 2ⁿ", ""],
      ["Екілік іздеу", "салыстыру ≤ ⌈log₂(n + 1)⌉", "10⁶ → 20"]]],
    ["Алгоритмдер · Сұрыптау", "algo", [
      ["Көпіршікті / таңдау / кірістіру", "O(n²);  ең жақсы: көпіршікті (жалаушамен) және кірістіру — O(n)", "Тұрақсыз: таңдау"],
      ["Біріктіру (merge)", "әрқашан O(n log n), жад O(n), тұрақты", ""],
      ["Жылдам (quick)", "орташа O(n log n), нашар O(n²), орнында, тұрақсыз", ""],
      ["Пирамидалық (heap)", "әрқашан O(n log n), жад O(1), тұрақсыз", "Үйме құру — O(n)"],
      ["Санау / разряд / блокты", "O(n + k) / O(d(n + k)) / орташа O(n + k)", "Салыстырусыз, тек белгілі мәндер ауқымында"]]],
    ["Алгоритмдер · Құрылымдар", "algo", [
      ["Стек / кезек", "push, pop, peek — O(1) · LIFO;  enqueue, dequeue — O(1) · FIFO", ""],
      ["Массив / тізім", "массив: a[i] O(1), кірістіру O(n);  тізім: басына O(1), іздеу O(n)", "a[i][j] адресі: i · бағандар + j"],
      ["Хеш-кесте", "α = n / m;  тізбек — орташа O(1 + α)", "Сызықтық: h + i;  квадраттық: h + i²;  қос: h₁ + i·h₂"],
      ["Екілік ағаш", "биіктігі h-тағы түйіндер ≤ 2ʰ⁺¹ − 1;  n түйін — n − 1 қыр", "Толық ағаш: жапырақтар = ішкі түйіндер + 1"],
      ["Үйме (0-ден индекс)", "ұрпақтар 2i + 1, 2i + 2;  атасы (i − 1)/2", "1-ден: 2i, 2i + 1; атасы i/2"],
      ["BST / AVL / қызыл-қара", "BST: O(h) (нашар O(n));  AVL: |hₗ − hᵣ| ≤ 1;  ҚҚ: h ≤ 2log₂(n + 1)", "In-order BST — сұрыпталған рет"]]],
    ["Алгоритмдер · Графтар", "algo", [
      ["Қырлар саны", "бағытталмаған толық граф: n(n − 1)/2;  дәрежелер қосындысы = 2E", "Ағаш: E = V − 1"],
      ["BFS / DFS", "O(V + E) тізіммен, O(V²) матрицамен", "BFS — кезек, DFS — стек"],
      ["Дейкстра", "O((V + E) log V) үймемен;  теріс салмақсыз", ""],
      ["Беллман–Форд", "V − 1 өту, O(V · E);  теріс цикл анықтайды", ""],
      ["Флойд–Уоршелл", "d[i][j] = min(d[i][j], d[i][k] + d[k][j]);  O(V³)", "Барлық жұптар"],
      ["Прим / Краскал", "O(E log V) / O(E log E);  MST-те V − 1 қыр", ""]]],
    ["Алгоритмдер · C тілі", "algo", [
      ["Бүтін бөлу", "7/2 = 3;  7 % 2 = 1;  −7/2 = −3;  7.0/2 = 3.5", ""],
      ["Ығысу, биттік", "x << k = x·2ᵏ;  x >> k = x/2ᵏ;  & | ^ ~", "12 & 10 = 8;  12 | 10 = 14;  12 ^ 10 = 6"],
      ["i++ / ++i", "i++ — алдымен мәні, сосын +1;  ++i — алдымен +1", ""],
      ["printf", "%d int · %f double · %c char · %s жол · %x 16-лық · %p адрес · %.2f", ""],
      ["sizeof (типтік)", "char 1 · short 2 · int 4 · float 4 · double 8 · көрсеткіш 8 (64-бит)", "char s[] = \"hi\" → sizeof 3, strlen 2"],
      ["Көрсеткіш", "a[i] ≡ *(a + i);  &x — адрес;  *p — мән", "*p + 1 ≠ *(p + 1)"]]],
    ["Деректер қоры · SQL", "db", [
      ["Сұраныс құрылымы", "SELECT … FROM … JOIN … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT", "Орындалу: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY"],
      ["Сүзгілер", "= <> < > · BETWEEN a AND b · IN (…) · LIKE 'A%' / '_b%' · IS NULL", "% — кез келген жол, _ — бір символ"],
      ["Агрегаттар", "COUNT(*) — барлық жол;  COUNT(баған), SUM, AVG, MIN, MAX — NULL-сыз", ""],
      ["JOIN", "INNER — сәйкестер;  LEFT/RIGHT — бір жағы толық;  FULL — екеуі;  CROSS — m · n", ""],
      ["Жиындар", "UNION (қайталаусыз) · UNION ALL · INTERSECT · EXCEPT", ""],
      ["Ішкі сұраныс", "IN · EXISTS · ANY · ALL;  NOT IN + NULL → бос нәтиже", "> ALL(…) — ең үлкенінен үлкен"],
      ["DDL / DML / DCL / TCL", "CREATE ALTER DROP TRUNCATE / INSERT UPDATE DELETE SELECT / GRANT REVOKE / COMMIT ROLLBACK SAVEPOINT", ""]]],
    ["Деректер қоры · Теория", "db", [
      ["Реляциялық алгебра", "σ таңдау · π проекция · × декарт · ⋈ біріктіру · ∪ ∩ − · ÷ бөлу · ρ атау", "Негізгілері: σ, π, ∪, −, ×, ρ"],
      ["Армстронг аксиомалары", "рефлексивтілік · толықтыру · транзитивтілік", "X⁺ тұйықталуы барлық атрибутты берсе — X суперкілт"],
      ["Қалыпты формалар", "1НФ атомар · 2НФ толық кілтке тәуелді · 3НФ транзитивтіліксіз · БКНФ — әр детерминант кілт", "«Кілт, бүкіл кілт және кілттен басқа ештеңе»"],
      ["Тұтастық", "нысан (PK) · домендік (тип, CHECK, NOT NULL) · сілтемелік (FK) · семантикалық (триггер, CHECK)", ""],
      ["ACID", "Atomicity · Consistency · Isolation · Durability", ""],
      ["Оқшаулау деңгейлері", "READ UNCOMMITTED → READ COMMITTED (лас оқу жоқ) → REPEATABLE READ (+ қайталанбайтын) → SERIALIZABLE (+ фантом)", ""],
      ["SQL Server", "бет 8 КБ · экстент 8 бет = 64 КБ · .mdf .ndf .ldf · master model msdb tempdb", ""],
      ["Жобалау кезеңдері", "концептуалдық (ER) → логикалық (кестелер, НФ) → физикалық (индекс, файлдар)", ""]]],
    ["Ағылшын · Шақтар", "english", [
      ["Present Simple / Continuous", "V(s) / am·is·are + V-ing", "always, usually / now, at the moment"],
      ["Past Simple / Continuous", "V2 / was·were + V-ing", "yesterday, ago / at 5 yesterday, while"],
      ["Present Perfect / Continuous", "have·has + V3 / have·has been + V-ing", "already, yet, ever, since, for"],
      ["Past Perfect / Continuous", "had + V3 / had been + V-ing", "before, by the time, after"],
      ["Future Simple / going to", "will + V / am·is·are going to + V", "шешім, болжам / жоспар, белгі"],
      ["Future Continuous / Perfect", "will be + V-ing / will have + V3", "this time tomorrow / by + уақыт"],
      ["Passive", "be (керек шақта) + V3", "is made · was made · has been made · will be made · is being made · can be made"]]],
    ["Ағылшын · Грамматика ережелері", "english", [
      ["Шартты сөйлемдер", "0: if Present, Present · 1: if Present, will V · 2: if Past, would V · 3: if had V3, would have V3", "If I were you…"],
      ["I wish", "қазірге: wish + Past · өткенге: wish + had V3 · басқаға өтініш: wish + would", ""],
      ["Төлеу сөз", "am → was · will → would · can → could · did/have done → had done", "tomorrow → the next day, here → there"],
      ["Модальдар", "must (міндет) · have to (сырттан) · should (кеңес) · mustn't (тыйым) · don't have to (қажет емес)", "Өткенге болжам: must / can't / should have V3"],
      ["-ing / to", "enjoy, finish, avoid, mind + -ing · want, decide, hope, plan + to · предлогтан кейін -ing", "remember/stop/try/regret — мағына өзгереді"],
      ["Шырай", "1 буын: -er / the -est · көп буын: more / the most · good–better–best, bad–worse–worst", "as … as; the more …, the better …"],
      ["Артикль", "a/an — алғаш, кез келген · the — белгілі, жалғыз, шырай, реттік сан, өзен/теңіз/тау жотасы", "an — дауысты дыбыс алдында (an hour)"],
      ["Предлог (уақыт)", "at сағат, түн · on күн, дата · in ай, жыл, маусым", "next/last/every — предлогсыз"]]]
  ];

  function formulasView(view, q) {
    var subj = Shyn._fmlSubj || "all";
    var tabs = [["all", "Барлығы"], ["fundamentals", "ТГО"], ["algo", "Алгоритм"], ["db", "ДҚ"], ["english", "Ағылшын"]];
    var re = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
    var html = F.filter(function (sec) { return subj === "all" || sec[1] === subj; }).map(function (sec) {
      var rows = sec[2].filter(function (r) { return !re || re.test(r.join(" ")) || re.test(sec[0]); });
      if (!rows.length) return "";
      return '<section class="fml-sec"><h2>' + esc(sec[0]) + '</h2><div class="fml-tbl">' + rows.map(function (r) {
        return '<div class="fml-row"><div class="fml-name">' + esc(r[0]) + '</div><div class="fml-body"><code class="fml-f">' + esc(r[1]) + '</code>' + (r[2] ? '<span class="fml-note">' + esc(r[2]) + '</span>' : "") + '</div></div>';
      }).join("") + '</div></section>';
    }).join("");
    view.innerHTML = '<header class="page-head"><h1>Формулалар</h1><p class="muted">Емтиханға керек барлық формула мен ереже бір бетте. Басып шығарып, емтихан алдында қайталауға ыңғайлы.</p></header>' +
      '<div class="fml-bar"><div class="chips" role="tablist">' + tabs.map(function (t) {
        return '<button class="chip' + (t[0] === subj ? " is-on" : "") + '" data-fs="' + t[0] + '">' + t[1] + '</button>';
      }).join("") + '</div><div class="inline"><input class="fml-search" id="fmlQ" type="search" placeholder="Іздеу: медиана, JOIN, пайыз…" value="' + esc(q || "") + '"><button class="btn btn--line" id="fmlPrint">Басып шығару</button></div></div>' +
      (html || '<p class="muted">Ештеңе табылмады.</p>');
    U.on("[data-fs]", "click", function (e, el) { Shyn._fmlSubj = el.getAttribute("data-fs"); formulasView(view, U.$("#fmlQ").value.trim()); });
    var inp = U.$("#fmlQ"), tm;
    inp.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(function () { var v = inp.value.trim(), pos = inp.selectionStart; formulasView(view, v); var n = U.$("#fmlQ"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) {} }, 250); });
    U.$("#fmlPrint").addEventListener("click", function () { document.body.classList.add("print-fml"); global.print(); setTimeout(function () { document.body.classList.remove("print-fml"); }, 500); });
  }

  var HARD = [["fundamentals", "ТГО математикасы"], ["algo", "Алгоритмдер (C деңгейі)"], ["db", "Деректер қоры (C деңгейі)"]];
  function hardView(view) {
    var subj = Shyn._hardSubj || "fundamentals";
    var set = Shyn.sets["v94-" + subj];
    var qs = set ? set.questions : [];
    view.innerHTML = '<header class="page-head"><h1>Қиын есептер жинағы</h1><p class="muted">Емтихандағы C деңгейіне сай есептер. Алдымен өзің шығар, сосын «Шешімін көру» бас — әр есептің қадамдық шешімі бар. Тест ретінде де тапсыруға болады.</p></header>' +
      '<div class="fml-bar"><div class="chips">' + HARD.map(function (h) {
        var n = Shyn.sets["v94-" + h[0]] ? Shyn.sets["v94-" + h[0]].questions.length : 0;
        return '<button class="chip' + (h[0] === subj ? " is-on" : "") + '" data-hs="' + h[0] + '">' + h[1] + ' · ' + n + '</button>';
      }).join("") + '</div><button class="btn btn--primary" id="hardGo"' + (qs.length ? "" : " disabled") + '>Тест ретінде тапсыру</button></div>' +
      '<ol class="hard">' + qs.map(function (q, i) {
        var parts = String(q.ex).split("Шешімі: ");
        return '<li class="hard__item"><div class="hard__top"><span class="hard__n">' + (i + 1) + '</span><span class="tag">' + esc(q.topicFine || q.topic) + '</span>' + (q.multi ? '<span class="tag">бір не бірнеше жауап</span>' : "") + '</div>' +
          '<div class="hard__q">' + Shyn.fmt(q.q) + '</div>' + Shyn.code(q.code) +
          '<ul class="hard__opts">' + q.opts.map(function (o) { return '<li><b>' + o.l + ')</b> ' + esc(o.t) + '</li>'; }).join("") + '</ul>' +
          '<details class="hard__sol"><summary>Шешімін көру</summary><p class="hard__ans">' + esc(parts[0].replace(/\.\s*$/, "")) + '</p>' + (parts[1] ? '<p>' + esc(parts[1]).replace(/ (\d\)) /g, '<br>$1 ') + '</p>' : "") + '</details></li>';
      }).join("") + '</ol>';
    U.on("[data-hs]", "click", function (e, el) { Shyn._hardSubj = el.getAttribute("data-hs"); hardView(view); });
    var go = U.$("#hardGo");
    if (go) go.addEventListener("click", function () { Shyn.startTest("hard:" + subj + ":" + Date.now(), "Қиын есептер · " + HARD.filter(function (h) { return h[0] === subj; })[0][1], qs, { mode: "practice" }); });
  }

  Shyn.formulas = F;
  Shyn.route("formulas", function (args) { if (args && /^(algo|db|english|fundamentals|all)$/.test(args[0] || "")) Shyn._fmlSubj = args[0]; formulasView(document.getElementById("view"), ""); });
  Shyn.route("hard", function () { hardView(document.getElementById("view")); });
})(window);
