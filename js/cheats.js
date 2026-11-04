/* Шың — шпаргалкалар орталығы: емтихан тактикасы, формулалар, SQL үлгілері, жиі тұзақтар, ағылшын шақтары, мнемоника. */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc;
  var view = document.getElementById("view");
  var KEY = "shyn_cheats";
  var known; try { known = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { known = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(known)); } catch (e) {} }
  var c = function (s) { return "<code>" + esc(s) + "</code>"; };
  var pre = function (s) { return '<pre class="code"><code>' + esc(s) + "</code></pre>"; };

  var CATS = [["exam", "Емтихан тактикасы"], ["algo", "Алгоритм формулалары"], ["sql", "SQL үлгілері"], ["trap", "Жиі тұзақтар"], ["eng", "Ағылшын шақтары"], ["mnem", "Мнемоника"]];
  var C = [
    ["exam", "Балл қалай есептеледі", "<ul><li>Бір дұрыс жауапты сұрақ: дұрыс — <b>1 балл</b>, әйтпесе 0.</li><li>Бірнеше жауапты сұрақ (k дұрыс, k ≤ 3), ең көбі <b>2 балл</b>: барлық дұрысы қатесіз — 2; кемінде max(k−1, 1) дұрыс және ең көбі 1 қате — 1; 2 не одан көп қате — 0.</li><li>Сондықтан алгоритмдер 30 × 1 = 30 балл, деректер қоры 20 × 2 = 40 балл.</li></ul>"],
    ["exam", "Бірнеше жауапты сұраққа тактика", "<ul><li>Сенімді жауаптарды ғана белгіле: бір «күмәнді» артық таңдау балды 2-ден 1-ге түсіреді, екеуі — 0-ге.</li><li>Бір дұрысын ғана білсең де белгіле: k = 1 немесе k = 2 болса, ол 1 балл әкелуі мүмкін.</li><li>Бос қалдыру 0 береді — жауапсыз сұрақ қалдырма.</li></ul>"],
    ["exam", "Уақытты бөлу", "<ul><li>Бірінші өту: бірден білетіндерін шеш, қиындарын белгімен (жалауша) өткізіп жібер.</li><li>Екінші өту: белгіленгендерге қайт. Соңғы 5 минутта бос сұрақ қалмасын.</li><li>Ұзақ код сұрағы — ең соңына: оған бір сұрақтың орнына екі-үш оңай сұрақ шешуге болады.</li></ul>"],
    ["exam", "Нұсқаларды жою әдісі", "<ul><li>Бір-біріне қарама-қайшы екі нұсқаның біреуі ғана дұрыс болуы мүмкін.</li><li>«Әрқашан», «ешқашан», «тек» деген абсолютті сөздері бар нұсқа жиі қате.</li><li>Күрделілік сұрағында алдымен ең нашар жағдай ма, орташа ма — соны анықта.</li></ul>"],

    ["algo", "Мастер-теорема", "<p>" + c("T(n) = a·T(n/b) + f(n)") + ", салыстыру: " + c("n^(log_b a)") + ".</p><ul><li>f(n) кішірек (полиномдық) → " + c("Θ(n^(log_b a))") + "</li><li>f(n) тең → " + c("Θ(n^(log_b a) · log n)") + "</li><li>f(n) үлкенірек (және жүйелілік шарты) → " + c("Θ(f(n))") + "</li></ul>"],
    ["algo", "Жиі кездесетін рекурренттер", "<ul><li>" + c("T(n)=T(n/2)+1") + " → log n (екілік іздеу)</li><li>" + c("T(n)=2T(n/2)+n") + " → n log n (біріктіру)</li><li>" + c("T(n)=2T(n/2)+1") + " → n</li><li>" + c("T(n)=T(n−1)+1") + " → n</li><li>" + c("T(n)=T(n−1)+n") + " → n² (нашар quick sort)</li><li>" + c("T(n)=2T(n−1)+1") + " → 2ⁿ (Ханой мұнарасы)</li></ul>"],
    ["algo", "Қосындылар және логарифмдер", "<ul><li>1 + 2 + … + n = n(n+1)/2</li><li>1 + 2 + 4 + … + 2ᵏ = 2ᵏ⁺¹ − 1</li><li>1 + 1/2 + … + 1/n ≈ ln n</li><li>log_b x = log x / log b; log(xy) = log x + log y</li><li>2¹⁰ = 1024 ≈ 10³, 2²⁰ ≈ 10⁶, log₂ 10⁶ ≈ 20</li></ul>"],
    ["algo", "Ағаштар", "<ul><li>n түйінді ағашта n − 1 қыр бар.</li><li>h биіктіктегі (қырмен саналған) екілік ағашта ең көбі 2ʰ⁺¹ − 1 түйін, h-деңгейде ең көбі 2ʰ түйін.</li><li>n түйінді екілік ағаштың ең аз биіктігі ⌊log₂ n⌋.</li><li>Толық (әр түйінде 0 не 2 ұрпақ) екілік ағашта: жапырақтар = ішкі түйіндер + 1.</li><li>In-order BST кілттерін өсу ретімен береді.</li></ul>"],
    ["algo", "Үйінді массивте", "<ul><li>0-ден индекстеу: ата " + c("(i−1)/2") + ", ұрпақтар " + c("2i+1") + ", " + c("2i+2") + ".</li><li>1-ден индекстеу: ата " + c("i/2") + ", ұрпақтар " + c("2i") + ", " + c("2i+1") + ".</li><li>Үйінді құру — O(n), кірістіру мен түбірді алу — O(log n).</li><li>Жапырақтар — соңғы ⌈n/2⌉ элемент.</li></ul>"],
    ["algo", "Графтар фактілері", "<ul><li>Дәрежелер қосындысы = 2|E| (қол алысу леммасы).</li><li>Толық графтағы қырлар: n(n−1)/2.</li><li>Ағашта |E| = |V| − 1, ең аз каркас ағашында да.</li><li>Сыбайластық матрицасы — O(V²) жад, тізім — O(V + E).</li><li>Топологиялық сұрыптау тек бағытталған ациклдік графта (DAG) бар.</li></ul>"],
    ["algo", "Хештеу формулалары", "<ul><li>Толтыру коэффициенті α = n / m.</li><li>Тізбектер: сәтті іздеудің орташа ұзындығы ≈ 1 + α/2, сәтсізі ≈ α.</li><li>Ашық адрестеу: сәтсіз іздеу ≈ 1 / (1 − α); α → 1 болса күрт баяулайды.</li><li>Кесте өлшемі m үшін жай сан таңдалады.</li></ul>"],
    ["algo", "Салыстырулар саны", "<ul><li>Bubble, ең нашар: n(n−1)/2 салыстыру және сонша алмасу.</li><li>Selection: әрқашан n(n−1)/2 салыстыру, ең көбі n − 1 алмасу.</li><li>Insertion, сұрыпталған массив: n − 1 салыстыру.</li><li>Екілік іздеу, ең нашар: ⌈log₂(n+1)⌉ салыстыру.</li><li>Салыстыруға негізделген кез келген сұрыптау: ең нашарда Ω(n log n).</li></ul>"],
    ["algo", "Инфикстен постфикске", "<p>Операнд → нәтижеге. Оператор → стекке, бірақ алдымен стектен басымдығы үлкен не тең операторларды шығар. «(» — стекке, «)» — «(»-ға дейін шығар.</p>" + pre("(A + B) * C      →  A B + C *\nA + B * C        →  A B C * +\nA * (B + C) / D  →  A B C + * D /")],

    ["sql", "Екінші ең үлкен жалақы", pre("SELECT MAX(salary) FROM employee\nWHERE salary < (SELECT MAX(salary) FROM employee);")],
    ["sql", "Әр топтағы ең үздік", pre("SELECT e.dno, e.fname, e.salary\nFROM employee e\nWHERE e.salary = (SELECT MAX(x.salary)\n                  FROM employee x WHERE x.dno = e.dno);")],
    ["sql", "Қайталанатын мәндер", pre("SELECT city, COUNT(*) AS n\nFROM students\nGROUP BY city\nHAVING COUNT(*) > 1;")],
    ["sql", "Сәйкесі жоқ жолдар (anti-join)", pre("SELECT g.name FROM groups g\nLEFT JOIN students s ON s.group_id = g.id\nWHERE s.id IS NULL;\n-- немесе\nSELECT name FROM groups g\nWHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.group_id = g.id);")],
    ["sql", "COUNT-тың үш түрі", "<ul><li>" + c("COUNT(*)") + " — барлық жолдар, NULL-мен бірге.</li><li>" + c("COUNT(col)") + " — col NULL емес жолдар.</li><li>" + c("COUNT(DISTINCT col)") + " — қайталанбайтын NULL емес мәндер.</li></ul>"],
    ["sql", "LIKE, BETWEEN, IN", "<ul><li>" + c("LIKE 'А%'") + " — А-дан басталады; " + c("'_а%'") + " — екінші әрпі «а».</li><li>" + c("BETWEEN 10 AND 20") + " шеткі мәндерді қамтиды (10 ≤ x ≤ 20).</li><li>" + c("UNION") + " қайталануды алып тастайды, " + c("UNION ALL") + " — жоқ.</li></ul>"],
    ["sql", "CREATE TABLE үлгісі", pre("CREATE TABLE grades (\n  student_id INT REFERENCES students(id) ON DELETE CASCADE,\n  course_id  INT REFERENCES courses(id),\n  score      INT CHECK (score BETWEEN 0 AND 100),\n  PRIMARY KEY (student_id, course_id)\n);")],

    ["trap", "NULL тұзақтары", "<ul><li>" + c("x = NULL") + " ешқашан ақиқат емес — " + c("IS NULL") + " керек.</li><li>" + c("NULL + 1") + " = NULL.</li><li>" + c("NOT IN (… NULL …)") + " бос нәтиже береді: ішкі сұраныста NULL болса, NOT EXISTS қолдан.</li><li>AVG, SUM, MAX NULL-ды елемейді.</li></ul>"],
    ["trap", "WHERE мен HAVING", "<ul><li>WHERE — топтауға дейін жолдарды сүзеді, агрегатты функция онда болмайды.</li><li>HAVING — GROUP BY-дан кейін топтарды сүзеді.</li><li>SELECT-тегі агрегатсыз әр баған GROUP BY-да болуы керек.</li></ul>"],
    ["trap", "Сұрыптау тұзақтары", "<ul><li>Quick sort соңғы элемент тірек болғанда сұрыпталған массивте O(n²).</li><li>Insertion — сұрыпталуға жақын массивте ең жылдам, O(n).</li><li>Тұрақты: bubble, insertion, merge, counting, radix. Тұрақсыз: selection, quick, heap, shell.</li><li>Heap sort жадты O(1) пайдаланады, merge — O(n).</li></ul>"],
    ["trap", "Құрылымдар тұзақтары", "<ul><li>BST ең нашарда O(n) — сұрыпталған кілттерді енгізсе тізбекке айналады. AVL мұны болдырмайды.</li><li>Үйінді сұрыпталған массив емес — тек түбірде максимум (минимум).</li><li>Хеш-кесте O(1) — орташа, ең нашары O(n).</li><li>Стек — DFS, рекурсия; кезек — BFS.</li></ul>"],
    ["trap", "Граф тұзақтары", "<ul><li>Дейкстра теріс салмақпен жұмыс істемейді → Беллман–Форд.</li><li>BFS ең қысқа жолды тек салмақсыз графта береді.</li><li>Прим мен Крускал бірдей салмақты (кейде басқа) каркас ағашын береді.</li></ul>"],
    ["trap", "Кілттер мен қалыпты формалар", "<ul><li>Бастапқы кілт NULL болмайды, сыртқы кілт — бола алады.</li><li>Кандидат кілт — минималды суперкілт.</li><li>Әр BCNF — 3ҚФ, бірақ кері емес (Teacher → Course мысалы).</li><li>Барлық кандидат кілті бір атрибуттан тұратын 1ҚФ кесте автоматты түрде 2ҚФ-та болады.</li></ul>"],

    ["eng", "Present шақтары", "<ul><li>Simple: V1 / V-s — always, usually, every day</li><li>Continuous: am/is/are + V-ing — now, at the moment, look!</li><li>Perfect: have/has + V3 — already, yet, just, ever, since, for</li><li>Perfect Continuous: have/has been + V-ing — for 2 hours, since morning</li></ul>"],
    ["eng", "Past шақтары", "<ul><li>Simple: V2 — yesterday, ago, last year, in 2020</li><li>Continuous: was/were + V-ing — at 5 pm yesterday, while</li><li>Perfect: had + V3 — before, by the time, after</li><li>Perfect Continuous: had been + V-ing — for 3 hours before …</li></ul>"],
    ["eng", "Future шақтары", "<ul><li>Simple: will + V1 — tomorrow, next week, I think</li><li>Continuous: will be + V-ing — at this time tomorrow</li><li>Perfect: will have + V3 — by next Monday</li><li>be going to + V1 — жоспар немесе дәлелі бар болжам</li></ul>"],
    ["eng", "Шартты сөйлемдер", "<ul><li>0: If + Present, Present — табиғат заңы.</li><li>1: If + Present, will + V1 — нақты мүмкіндік.</li><li>2: If + Past, would + V1 — қазіргі қиял (If I were…).</li><li>3: If + Past Perfect, would have + V3 — өткендегі өкініш.</li><li>If-тен кейін will қойылмайды.</li></ul>"],
    ["eng", "Ырықсыз етіс (Passive)", "<p>be (керекті шақта) + V3.</p>" + pre("is written · is being written · has been written\nwas written · will be written · can be written")],

    ["mnem", "SELECT орындалу реті", "<p>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.</p><p>Бас әріптері бойынша есте сақта: <b>F</b>resh <b>W</b>ater <b>G</b>ives <b>H</b>appy <b>S</b>wimmers <b>O</b>ptions — From, Where, Group by, Having, Select, Order by.</p>"],
    ["mnem", "ACID", "<p><b>A</b>tomicity — бәрі не ештеңе. <b>C</b>onsistency — ережелер бұзылмайды. <b>I</b>solation — бір-біріне кедергі жоқ. <b>D</b>urability — COMMIT мәңгі.</p><p>Банк аударымын елесте: ақша бір шоттан шығып, екіншісіне міндетті түрде түседі.</p>"],
    ["mnem", "Стек пен кезек", "<p>Стек — асхана табақтары: соңғы қойылған табақ бірінші алынады (LIFO). Кезек — дүкен кассасы: бірінші келген бірінші кетеді (FIFO).</p>"],
    ["mnem", "Қалыпты формалар", "<p>«Кілт, бүкіл кілт және кілттен басқа ештеңе»: 1ҚФ — мән атомар; 2ҚФ — бүкіл кілтке тәуелді; 3ҚФ — тек кілтке тәуелді (транзитивтісіз).</p>"],
    ["mnem", "Күрделілік баспалдағы", "<p>Жылдамнан баяуға: 1 < log n < √n < n < n log n < n² < n³ < 2ⁿ < n!</p>"]
  ];

  var ST = { cat: "", q: "" };
  Shyn.route("cheats", function () {
    var total = C.length, got = C.filter(function (x) { return known[x[1]]; }).length;
    view.innerHTML = '<header class="page-head"><h1>Шпаргалкалар</h1><p class="muted">Емтихан алдында 10 минутта қарап шығатын ең маңызды фактілер. Меңгергеніңді белгіле — қалғаны бірінші тұрады.</p></header>' +
      '<div class="cheatbar"><input class="field" id="chQ" type="search" placeholder="Іздеу: NULL, үйінді, Perfect…" value="' + esc(ST.q) + '">' +
        '<div class="chprog"><span class="gbar"><i style="width:' + Math.round(got / total * 100) + '%"></i></span><small>Меңгерілді: <b>' + got + '</b> / ' + total + '</small></div></div>' +
      '<div class="seg seg--wrap" role="group"><button data-cc="" class="' + (!ST.cat ? "is-on" : "") + '">Барлығы</button>' + CATS.map(function (k) { return '<button data-cc="' + k[0] + '" class="' + (ST.cat === k[0] ? "is-on" : "") + '">' + k[1] + '</button>'; }).join("") + '</div>' +
      '<p class="chlinks">Толығырақ: <a href="#/lab/cheat">күрделілік және ДҚ кестелері</a> · <a href="#/eng/table">12 шақ кестесі</a> · <a href="#/sorting">сұрыптау күрделілігі</a></p>' +
      '<div class="chgrid" id="chGrid"></div>';
    U.$("#chQ").addEventListener("input", function () { ST.q = this.value; draw(); });
    U.on("[data-cc]", "click", function (e, el) { ST.cat = el.getAttribute("data-cc"); Shyn.go("#/cheats"); }, view);
    draw();
  });
  function draw() {
    var q = ST.q.trim().toLowerCase();
    var list = C.filter(function (x) { return (!ST.cat || x[0] === ST.cat) && (!q || (x[1] + " " + x[2]).toLowerCase().indexOf(q) >= 0); });
    list.sort(function (a, b) { return (known[a[1]] ? 1 : 0) - (known[b[1]] ? 1 : 0); });
    var g = U.$("#chGrid"); if (!g) return;
    g.innerHTML = list.length ? list.map(function (x) {
      var cat = CATS.filter(function (k) { return k[0] === x[0]; })[0][1];
      return '<article class="chcard chcard--' + x[0] + (known[x[1]] ? " is-known" : "") + '"><span class="chcard__k">' + cat + '</span><h3>' + esc(x[1]) + '</h3><div class="chcard__b">' + x[2] + '</div>' +
        '<label class="check"><input type="checkbox" data-kn="' + esc(x[1]) + '"' + (known[x[1]] ? " checked" : "") + '> Меңгердім</label></article>';
    }).join("") : '<p class="empty">Сәйкес шпаргалка табылмады. Басқа сөзбен іздеп көр.</p>';
    U.on("[data-kn]", "change", function (e, el) {
      var k = el.getAttribute("data-kn");
      if (el.checked) { known[k] = Date.now(); if (Shyn.Game) Shyn.Game.addXP(3, true); } else delete known[k];
      save(); Shyn.go("#/cheats");
    }, g);
  }
  Shyn.cheatsCount = function () { return C.length; };
})(window);
