/* Шың — Зертхана: деректер қоры бөлімі (SQL құмсалғыш, JOIN түрлері, нормализация калькуляторы, шпаргалка). */
(function (global) {
  "use strict";
  var Shyn = global.Shyn, U = Shyn.U, esc = U.esc, LAB = Shyn.LAB;
  var view = document.getElementById("view");

  /* ================= SQL құмсалғыш ================= */
  var SCHEMA = {
    uni: {
      name: "Университет",
      sql: [
        "CREATE TABLE groups (id INTEGER PRIMARY KEY, name TEXT NOT NULL, faculty TEXT);",
        "CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, group_id INTEGER REFERENCES groups(id), city TEXT, birth_year INTEGER, gpa REAL);",
        "CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT NOT NULL, credits INTEGER);",
        "CREATE TABLE grades (student_id INTEGER REFERENCES students(id), course_id INTEGER REFERENCES courses(id), score INTEGER, PRIMARY KEY (student_id, course_id));",
        "INSERT INTO groups VALUES (1,'ИС-21','АТ'),(2,'ВТ-22','АТ'),(3,'ЭК-21','Экономика'),(4,'МТ-23','Математика');",
        "INSERT INTO students VALUES (1,'Айгерім',1,'Алматы',2003,3.6),(2,'Нұрлан',1,'Астана',2002,2.9),(3,'Дана',2,'Алматы',2004,3.9),(4,'Ержан',2,'Шымкент',2003,3.1),(5,'Мадина',3,'Астана',2002,3.4),(6,'Арман',3,'Қарағанды',2001,2.5),(7,'Әсел',NULL,'Алматы',2004,3.8),(8,'Бауыржан',1,'Шымкент',2003,NULL);",
        "INSERT INTO courses VALUES (1,'Деректер қоры',5),(2,'Алгоритмдер',5),(3,'Ағылшын тілі',3),(4,'Экономика',4);",
        "INSERT INTO grades VALUES (1,1,92),(1,2,85),(1,3,78),(2,1,61),(2,2,55),(3,1,98),(3,2,94),(3,3,88),(4,2,70),(4,3,65),(5,3,90),(5,4,81),(6,4,49),(7,1,87);"
      ].join("\n")
    },
    company: {
      name: "Компания (Элмасри)",
      sql: [
        "CREATE TABLE department (dnumber INTEGER PRIMARY KEY, dname TEXT, mgr_ssn TEXT);",
        "CREATE TABLE employee (ssn TEXT PRIMARY KEY, fname TEXT, lname TEXT, sex TEXT, salary INTEGER, super_ssn TEXT REFERENCES employee(ssn), dno INTEGER REFERENCES department(dnumber));",
        "CREATE TABLE project (pnumber INTEGER PRIMARY KEY, pname TEXT, plocation TEXT, dnum INTEGER REFERENCES department(dnumber));",
        "CREATE TABLE works_on (essn TEXT REFERENCES employee(ssn), pno INTEGER REFERENCES project(pnumber), hours REAL, PRIMARY KEY (essn, pno));",
        "INSERT INTO department VALUES (1,'Headquarters','888665555'),(4,'Administration','987654321'),(5,'Research','333445555');",
        "INSERT INTO employee VALUES ('123456789','John','Smith','M',30000,'333445555',5),('333445555','Franklin','Wong','M',40000,'888665555',5),('999887777','Alicia','Zelaya','F',25000,'987654321',4),('987654321','Jennifer','Wallace','F',43000,'888665555',4),('666884444','Ramesh','Narayan','M',38000,'333445555',5),('453453453','Joyce','English','F',25000,'333445555',5),('987987987','Ahmad','Jabbar','M',25000,'987654321',4),('888665555','James','Borg','M',55000,NULL,1);",
        "INSERT INTO project VALUES (1,'ProductX','Bellaire',5),(2,'ProductY','Sugarland',5),(3,'ProductZ','Houston',5),(10,'Computerization','Stafford',4),(20,'Reorganization','Houston',1),(30,'Newbenefits','Stafford',4);",
        "INSERT INTO works_on VALUES ('123456789',1,32.5),('123456789',2,7.5),('666884444',3,40),('453453453',1,20),('453453453',2,20),('333445555',2,10),('333445555',3,10),('333445555',10,10),('333445555',20,10),('999887777',30,30),('999887777',10,10),('987987987',10,35),('987987987',30,5),('987654321',30,20),('987654321',20,15),('888665555',20,NULL);"
      ].join("\n")
    }
  };
  var TASKS = [
    ["uni", "Барлық студенттердің аты мен қаласын шығарыңыз.", "SELECT name, city FROM students;", "SELECT … FROM …"],
    ["uni", "Алматыдан келген студенттер.", "SELECT * FROM students WHERE city = 'Алматы';", "WHERE шарты, мәтін тырнақшада"],
    ["uni", "GPA мәні 3.5-тен жоғары студенттерді GPA бойынша кему ретімен.", "SELECT name, gpa FROM students WHERE gpa > 3.5 ORDER BY gpa DESC;", "ORDER BY … DESC"],
    ["uni", "GPA мәні белгісіз (NULL) студенттер.", "SELECT name FROM students WHERE gpa IS NULL;", "NULL-ды = арқылы емес, IS NULL арқылы тексереді"],
    ["uni", "Тобы жоқ студенттер.", "SELECT name FROM students WHERE group_id IS NULL;", "IS NULL"],
    ["uni", "Әр қаладағы студенттер саны.", "SELECT city, COUNT(*) AS cnt FROM students GROUP BY city;", "GROUP BY + COUNT(*)"],
    ["uni", "Студенттер саны 1-ден көп қалалар.", "SELECT city, COUNT(*) FROM students GROUP BY city HAVING COUNT(*) > 1;", "Топтарды сүзу — HAVING, жолдарды сүзу — WHERE"],
    ["uni", "Студенттің аты және оның тобының атауы (тобы бар студенттер ғана).", "SELECT s.name, g.name FROM students s JOIN groups g ON s.group_id = g.id;", "INNER JOIN … ON"],
    ["uni", "Барлық студенттер және топ атауы (тобы жоқтар да шығуы керек).", "SELECT s.name, g.name FROM students s LEFT JOIN groups g ON s.group_id = g.id;", "LEFT JOIN сол кестенің барлық жолын сақтайды"],
    ["uni", "Бірде-бір студенті жоқ топтар.", "SELECT g.name FROM groups g LEFT JOIN students s ON s.group_id = g.id WHERE s.id IS NULL;", "LEFT JOIN + IS NULL немесе NOT EXISTS"],
    ["uni", "Әр пән бойынша орташа балл (пән атауымен).", "SELECT c.title, AVG(gr.score) FROM courses c JOIN grades gr ON gr.course_id = c.id GROUP BY c.id, c.title;", "JOIN + GROUP BY + AVG"],
    ["uni", "«Деректер қоры» пәнінен 80-нен жоғары алған студенттер.", "SELECT s.name FROM students s JOIN grades g ON g.student_id = s.id JOIN courses c ON c.id = g.course_id WHERE c.title = 'Деректер қоры' AND g.score > 80;", "Үш кестені біріктіру"],
    ["uni", "Орташа GPA-дан жоғары GPA-сы бар студенттер.", "SELECT name FROM students WHERE gpa > (SELECT AVG(gpa) FROM students);", "Ішкі сұраныс (subquery). AVG NULL-ды елемейді"],
    ["uni", "Бірде-бір баға алмаған студенттер.", "SELECT name FROM students WHERE id NOT IN (SELECT student_id FROM grades);", "NOT IN немесе NOT EXISTS"],
    ["uni", "Ең жоғары бір балл және оны алған студент аты.", "SELECT s.name, g.score FROM grades g JOIN students s ON s.id = g.student_id WHERE g.score = (SELECT MAX(score) FROM grades);", "MAX ішкі сұраныста"],
    ["company", "Research бөлімінде жұмыс істейтін қызметкерлердің аты-жөні.", "SELECT fname, lname FROM employee e JOIN department d ON e.dno = d.dnumber WHERE d.dname = 'Research';", "JOIN арқылы бөлім атауын табу"],
    ["company", "Әр бөлімдегі қызметкерлер саны мен орташа жалақы.", "SELECT dno, COUNT(*), AVG(salary) FROM employee GROUP BY dno;", "GROUP BY dno"],
    ["company", "Әр қызметкер және оның басшысының тегі (өзімен-өзі біріктіру).", "SELECT e.lname, s.lname FROM employee e LEFT JOIN employee s ON e.super_ssn = s.ssn;", "Self-join: бір кестеге екі бүркеншік ат"],
    ["company", "Houston-дағы жобаларда жұмыс істейтін қызметкерлер (қайталанбай).", "SELECT DISTINCT e.fname, e.lname FROM employee e JOIN works_on w ON w.essn = e.ssn JOIN project p ON p.pnumber = w.pno WHERE p.plocation = 'Houston';", "DISTINCT қайталануды алып тастайды"],
    ["company", "ProductX жобасында жұмыс істемейтін қызметкерлер.", "SELECT fname, lname FROM employee e WHERE NOT EXISTS (SELECT 1 FROM works_on w JOIN project p ON p.pnumber = w.pno WHERE w.essn = e.ssn AND p.pname = 'ProductX');", "NOT EXISTS (… қызметкердің ProductX-тегі жұмысы …)"],
    ["company", "Жалақысы өз бөлімінің орташасынан жоғары қызметкерлер.", "SELECT fname, salary FROM employee e WHERE salary > (SELECT AVG(salary) FROM employee x WHERE x.dno = e.dno);", "Корреляцияланған ішкі сұраныс"]
  ];
  var SQ = { db: "uni", task: -1, code: "SELECT * FROM students;", SQL: null, dbs: {}, loading: null };
  function loadSql(cb) {
    if (SQ.SQL) return cb();
    if (!SQ.loading) SQ.loading = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "vendor/sqljs/sql-wasm.js";
      s.onload = function () { global.initSqlJs({ locateFile: function (f) { return "vendor/sqljs/" + f; } }).then(function (SQL) { SQ.SQL = SQL; res(); }, rej); };
      s.onerror = rej; document.head.appendChild(s);
    });
    SQ.loading.then(cb, function () { var o = U.$("#qOut"); if (o) o.innerHTML = '<p class="warn">SQL қозғалтқышы жүктелмеді. Интернетті тексеріп, бетті жаңартыңыз.</p>'; });
  }
  function db(k, fresh) {
    if (fresh || !SQ.dbs[k]) { if (SQ.dbs[k]) SQ.dbs[k].close(); SQ.dbs[k] = new SQ.SQL.Database(); SQ.dbs[k].run(SCHEMA[k].sql); }
    return SQ.dbs[k];
  }
  function refDb(k) { var d = new SQ.SQL.Database(); d.run(SCHEMA[k].sql); return d; }
  function resTable(r) {
    if (!r) return '<p class="muted">Сұраныс орындалды: 0 жол (нәтиже бос немесе бұл SELECT емес).</p>';
    return '<div class="tablewrap"><table class="ltab"><thead><tr>' + r.columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join("") + '</tr></thead><tbody>' +
      r.values.map(function (row) { return '<tr>' + row.map(function (v) { return '<td' + (v === null ? ' class="is-null"' : "") + '>' + (v === null ? "NULL" : esc(typeof v === "number" && !Number.isInteger(v) ? +v.toFixed(3) : v)) + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div><p class="muted small">' + r.values.length + ' жол</p>';
  }
  function norm(r, ordered) {
    if (!r) return [];
    var rows = r.values.map(function (row) { return JSON.stringify(row.map(function (v) { return typeof v === "number" ? +v.toFixed(3) : v; })); });
    return ordered ? rows : rows.sort();
  }
  LAB.sql = { SCHEMA: SCHEMA, TASKS: TASKS, norm: norm };
  LAB.pages.sql = function () {
    view.innerHTML = LAB.head("SQL құмсалғыш", "SQLite браузердің ішінде жұмыс істейді: кез келген SELECT, INSERT, UPDATE, CREATE сұранысын жазып орындаңыз. Деректерді бұзсаңыз — «Қалпына келтіру». Тапсырманы таңдасаңыз, нәтижеңіз эталонмен салыстырылады.", "sql") +
      '<div class="sqlgrid"><div class="sqlmain">' +
        '<div class="sqlbar"><div class="seg" role="group">' + Object.keys(SCHEMA).map(function (k) { return '<button data-db="' + k + '" class="' + (SQ.db === k ? "is-on" : "") + '">' + SCHEMA[k].name + '</button>'; }).join("") + '</div>' +
        '<select class="field" id="qTask"><option value="-1">Еркін режим</option>' + TASKS.map(function (t, i) { return t[0] === SQ.db ? '<option value="' + i + '"' + (SQ.task === i ? " selected" : "") + '>' + (i + 1) + '. ' + esc(t[1]) + '</option>' : ""; }).join("") + '</select></div>' +
        '<div id="qTaskBox"></div>' +
        '<textarea class="field sqlcode" id="qCode" rows="6" spellcheck="false" autocapitalize="off" autocorrect="off">' + esc(SQ.code) + '</textarea>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="qRun">Орындау <kbd>Ctrl+Enter</kbd></button><button class="btn btn--line" id="qCheck"' + (SQ.task < 0 ? " hidden" : "") + '>Тексеру</button><button class="btn btn--ghost" id="qShow"' + (SQ.task < 0 ? " hidden" : "") + '>Жауапты көрсету</button><button class="btn btn--ghost" id="qReset">Қалпына келтіру</button></div>' +
        '<div id="qOut"><p class="muted">SQL қозғалтқышы жүктелуде…</p></div></div>' +
        '<aside class="sqlside"><h2>Кестелер</h2><div id="qSchema"></div></aside></div>';
    U.on("[data-db]", "click", function (e, el) { SQ.db = el.getAttribute("data-db"); SQ.task = -1; SQ.code = SQ.db === "uni" ? "SELECT * FROM students;" : "SELECT * FROM employee;"; LAB.pages.sql(); }, view);
    U.$("#qTask").addEventListener("change", function () { SQ.task = +this.value; LAB.pages.sql(); });
    U.$("#qRun").addEventListener("click", runQ);
    U.$("#qCheck").addEventListener("click", checkQ);
    U.$("#qShow").addEventListener("click", function () { var t = TASKS[SQ.task]; U.$("#qCode").value = t[2]; runQ(); });
    U.$("#qReset").addEventListener("click", function () { db(SQ.db, true); drawSchema(); U.toast("Дерекқор бастапқы күйге келтірілді"); });
    U.$("#qCode").addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); SQ.task >= 0 ? checkQ() : runQ(); } });
    U.$("#qCode").addEventListener("input", function () { SQ.code = this.value; });
    if (SQ.task >= 0) U.$("#qTaskBox").innerHTML = '<div class="sqltask"><b>Тапсырма ' + (SQ.task + 1) + '.</b> ' + esc(TASKS[SQ.task][1]) + '<details><summary>Кеңес</summary>' + esc(TASKS[SQ.task][3]) + '</details></div>';
    loadSql(function () { db(SQ.db); drawSchema(); if (U.$("#qOut")) U.$("#qOut").innerHTML = '<p class="muted">Дайын. Сұранысты жазып, «Орындау» басыңыз.</p>'; });
  };
  function drawSchema() {
    var d = db(SQ.db), box = U.$("#qSchema"); if (!box) return;
    var t = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid");
    box.innerHTML = (t[0] ? t[0].values : []).map(function (r) {
      var cols = d.exec("PRAGMA table_info(" + r[0] + ")")[0].values, n = d.exec("SELECT COUNT(*) FROM \"" + r[0] + "\"")[0].values[0][0];
      return '<details class="sqltbl" open><summary><b>' + esc(r[0]) + '</b> <span class="muted">' + n + ' жол</span></summary><ul>' + cols.map(function (c) { return '<li' + (c[5] ? ' class="is-pk"' : "") + '><span>' + esc(c[1]) + '</span><small>' + esc(c[2] || "") + (c[5] ? " PK" : "") + '</small></li>'; }).join("") +
        '</ul><button class="linkbtn" data-peek="' + esc(r[0]) + '">Деректерді көру</button></details>';
    }).join("");
    U.on("[data-peek]", "click", function (e, el) { U.$("#qCode").value = SQ.code = "SELECT * FROM " + el.getAttribute("data-peek") + ";"; runQ(); }, box);
  }
  function exec(sql) {
    var d = db(SQ.db), res = d.exec(sql);
    return res.length ? res[res.length - 1] : null;
  }
  function runQ() {
    if (!SQ.SQL) return;
    var sql = U.$("#qCode").value.trim(); SQ.code = sql; if (!sql) return;
    try { var r = exec(sql); U.$("#qOut").innerHTML = resTable(r); if (!/^\s*select/i.test(sql)) drawSchema(); }
    catch (e) { U.$("#qOut").innerHTML = '<p class="warn">Қате: ' + esc(e.message) + '</p>' + hint(e.message); }
    return r;
  }
  function hint(m) {
    var h = [[/no such column/i, "Баған атауын тексеріңіз (оң жақтағы кестелер тізімінде). Мәтін мәні тырнақшада болуы керек: 'Алматы'."], [/no such table/i, "Кесте атауын тексеріңіз."], [/syntax error/i, "Синтаксис: SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … — осы ретпен. Үтірлер мен жақшаларды тексеріңіз."], [/ambiguous/i, "Бірнеше кестеде бірдей баған бар — бүркеншік атпен көрсетіңіз: s.name."], [/misuse of aggregate/i, "Агрегатты функцияны WHERE ішінде қолдануға болмайды — HAVING пайдаланыңыз."]];
    for (var i = 0; i < h.length; i++) if (h[i][0].test(m)) return '<p class="labnote">' + h[i][1] + '</p>';
    return "";
  }
  function checkQ() {
    if (!SQ.SQL || SQ.task < 0) return;
    var t = TASKS[SQ.task], sql = U.$("#qCode").value.trim(), mine, ref, rd = refDb(t[0]);
    try { mine = (function () { var d = refDb(t[0]); var r = d.exec(sql); d.close(); return r.length ? r[r.length - 1] : null; })(); }
    catch (e) { rd.close(); U.$("#qOut").innerHTML = '<p class="warn">Қате: ' + esc(e.message) + '</p>' + hint(e.message); return; }
    ref = rd.exec(t[2]); ref = ref[ref.length - 1]; rd.close();
    var ordered = /order\s+by/i.test(t[2]);
    var a = norm(mine, ordered), b = norm(ref, ordered), ok = JSON.stringify(a) === JSON.stringify(b);
    var why = "";
    if (!ok) {
      if (!mine) why = "Сұраныс жол қайтармады.";
      else if (mine.columns.length !== ref.columns.length) why = "Бағандар саны сәйкес емес: сізде " + mine.columns.length + ", күтілгені " + ref.columns.length + ".";
      else if (a.length !== b.length) why = "Жолдар саны сәйкес емес: сізде " + a.length + ", күтілгені " + b.length + ".";
      else if (ordered && JSON.stringify(a.slice().sort()) === JSON.stringify(b.slice().sort())) why = "Жолдар дұрыс, бірақ реті басқа — ORDER BY тексеріңіз.";
      else why = "Мәндер сәйкес емес.";
    }
    try { var done = JSON.parse(localStorage.getItem("shyn_sql_done") || "{}"); if (ok) { var fresh = !done[SQ.task]; done[SQ.task] = 1; localStorage.setItem("shyn_sql_done", JSON.stringify(done)); if (fresh && Shyn.Game) Shyn.Game.event("sql", 1, 30); } } catch (e) {}
    U.$("#qOut").innerHTML = '<p class="labres ' + (ok ? "is-ok" : "is-no") + '">' + (ok ? "Дұрыс! Нәтиже эталонмен сәйкес келеді." : "Әзірге дұрыс емес. " + why) + '</p>' +
      '<div class="sqlcmp"><div><h3>Сіздің нәтижеңіз</h3>' + resTable(mine) + '</div><div><h3>Күтілетін нәтиже</h3>' + resTable(ref) + '</div></div>';
  }

  /* ================= JOIN түрлері ================= */
  var JN = { type: "inner" };
  var JL = [[1, "Айгерім", 10], [2, "Нұрлан", 20], [3, "Дана", 10], [4, "Әсел", null]];
  var JR = [[10, "ИС-21"], [20, "ВТ-22"], [30, "ЭК-21"]];
  var JT = {
    inner: ["INNER JOIN", "Тек екі кестеде де сәйкесі бар жолдар.", "SELECT s.name, g.name FROM students s INNER JOIN groups g ON s.group_id = g.id;"],
    left: ["LEFT JOIN", "Сол кестенің барлық жолы; оң жақта сәйкесі болмаса — NULL.", "SELECT s.name, g.name FROM students s LEFT JOIN groups g ON s.group_id = g.id;"],
    right: ["RIGHT JOIN", "Оң кестенің барлық жолы; сол жақта сәйкесі болмаса — NULL.", "SELECT s.name, g.name FROM students s RIGHT JOIN groups g ON s.group_id = g.id;"],
    full: ["FULL OUTER JOIN", "Екі кестенің де барлық жолы: LEFT ∪ RIGHT.", "SELECT s.name, g.name FROM students s FULL OUTER JOIN groups g ON s.group_id = g.id;"],
    cross: ["CROSS JOIN", "Декарттық көбейтінді: әр жол әр жолмен, шартсыз. 4 × 3 = 12 жол.", "SELECT s.name, g.name FROM students s CROSS JOIN groups g;"],
    anti: ["LEFT JOIN … WHERE R.id IS NULL", "Сол кестеде бар, оң кестеде сәйкесі жоқ жолдар (anti-join).", "SELECT s.name FROM students s LEFT JOIN groups g ON s.group_id = g.id WHERE g.id IS NULL;"]
  };
  function joinRows(t) {
    var out = [], usedR = {}, usedL = {};
    if (t === "cross") { JL.forEach(function (l, i) { JR.forEach(function (r, j) { out.push({ l: l, r: r, li: i, rj: j }); }); }); return out; }
    JL.forEach(function (l, i) { JR.forEach(function (r, j) { if (l[2] !== null && l[2] === r[0]) { out.push({ l: l, r: r, li: i, rj: j }); usedR[j] = 1; usedL[i] = 1; } }); });
    if (t === "anti") return JL.map(function (l, i) { return usedL[i] ? null : { l: l, r: null, li: i }; }).filter(Boolean);
    if (t === "left" || t === "full") JL.forEach(function (l, i) { if (!usedL[i]) out.push({ l: l, r: null, li: i }); });
    if (t === "right" || t === "full") JR.forEach(function (r, j) { if (!usedR[j]) out.push({ l: null, r: r, rj: j }); });
    return out;
  }
  LAB.joinRows = joinRows;
  LAB.pages.join = function () {
    var t = JN.type, rows = joinRows(t), inL = {}, inR = {};
    rows.forEach(function (x) { if (x.l) inL[x.li] = 1; if (x.r) inR[x.rj] = 1; });
    var venn = '<svg viewBox="0 0 220 120" class="venn venn--' + t + '" aria-hidden="true"><defs><clipPath id="vcl"><circle cx="85" cy="60" r="48"/></clipPath></defs>' +
      '<circle class="v-l" cx="85" cy="60" r="48"/><circle class="v-r" cx="135" cy="60" r="48"/><circle class="v-i" cx="135" cy="60" r="48" clip-path="url(#vcl)"/>' +
      '<circle class="v-o" cx="85" cy="60" r="48"/><circle class="v-o" cx="135" cy="60" r="48"/><text x="55" y="64">S</text><text x="160" y="64">G</text></svg>';
    var tbl = function (head, data, used, side) {
      return '<table class="ltab jtab"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' +
        data.map(function (r, i) { return '<tr class="' + (used[i] ? "is-in" : "is-outrow") + '">' + r.map(function (v) { return '<td>' + (v === null ? '<span class="is-null">NULL</span>' : esc(v)) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table>';
    };
    view.innerHTML = LAB.head("JOIN түрлері", "students (S) және groups (G) кестелері. JOIN түрін таңдаңыз: нәтижеге кіретін жолдар жарқырайды, сыртта қалғандары бозарады.", "join") +
      '<div class="seg seg--wrap" role="group">' + Object.keys(JT).map(function (k) { return '<button data-jt="' + k + '" class="' + (t === k ? "is-on" : "") + '">' + JT[k][0].replace(" … WHERE R.id IS NULL", " + IS NULL") + '</button>'; }).join("") + '</div>' +
      '<div class="jhead">' + venn + '<div><p><b>' + JT[t][0] + '</b> — ' + JT[t][1] + '</p><pre class="code"><code>' + esc(JT[t][2]) + '</code></pre></div></div>' +
      '<div class="jgrid"><div><h3>students (S)</h3>' + tbl(["id", "name", "group_id"], JL, inL) + '</div><div><h3>groups (G)</h3>' + tbl(["id", "name"], JR, inR) + '</div></div>' +
      '<section class="block"><h2>Нәтиже: ' + rows.length + ' жол</h2><div class="tablewrap"><table class="ltab"><thead><tr><th>S.name</th><th>S.group_id</th>' + (t === "anti" ? "" : '<th>G.id</th><th>G.name</th>') + '</tr></thead><tbody>' +
      rows.map(function (x) { var n = function (v) { return v === null || v === undefined ? '<span class="is-null">NULL</span>' : esc(v); };
        return '<tr><td>' + n(x.l && x.l[1]) + '</td><td>' + n(x.l ? x.l[2] : null) + '</td>' + (t === "anti" ? "" : '<td>' + n(x.r && x.r[0]) + '</td><td>' + n(x.r && x.r[1]) + '</td>') + '</tr>'; }).join("") +
      '</tbody></table></div><p class="labnote">Есте сақтаңыз: NULL = NULL шарты ақиқат емес, сондықтан group_id = NULL болатын Әсел INNER JOIN нәтижесіне ешқашан кірмейді. Жолдар саны: INNER ≤ LEFT, RIGHT ≤ FULL ≤ CROSS.</p></section>';
    U.on("[data-jt]", "click", function (e, el) { JN.type = el.getAttribute("data-jt"); LAB.pages.join(); }, view);
  };

  /* ================= Нормализация калькуляторы ================= */
  var NF = { attrs: "A, B, C, D, E", fds: "A -> B\nB -> C\nA, D -> E", closure: "A" };
  var NFX = [
    ["R(A,B,C,D,E) — оқулық мысалы", "A, B, C, D, E", "A -> B\nB -> C\nA, D -> E"],
    ["Студент–пән–оқытушы", "StudentID, Name, CourseID, Title, Teacher, Grade", "StudentID -> Name\nCourseID -> Title, Teacher\nStudentID, CourseID -> Grade"],
    ["BCNF бұзылуы (3ҚФ-та)", "Student, Course, Teacher", "Student, Course -> Teacher\nTeacher -> Course"],
    ["Транзитивті тәуелділік", "EmpID, Name, DeptID, DeptName", "EmpID -> Name, DeptID\nDeptID -> DeptName"]
  ];
  function splitA(s) { return s.split(/[\s,;]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function parseFD(txt) {
    var out = [];
    txt.split(/\n/).forEach(function (l) {
      var m = l.split(/->|→|=>/); if (m.length !== 2) return;
      var L = splitA(m[0]), R = splitA(m[1]);
      if (L.length && R.length) out.push({ L: L, R: R });
    });
    return out;
  }
  function closure(X, F) {
    var c = X.slice(), changed = true, steps = [];
    while (changed) {
      changed = false;
      F.forEach(function (f) {
        if (f.L.every(function (a) { return c.indexOf(a) >= 0; })) {
          var add = f.R.filter(function (a) { return c.indexOf(a) < 0; });
          if (add.length) { c = c.concat(add); changed = true; steps.push(f.L.join("") + " → " + f.R.join("") + " қолданылды: +" + add.join(", ")); }
        }
      });
    }
    return { set: c, steps: steps };
  }
  function eq(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }
  function keys(R, F) {
    var onlyL = R.filter(function (a) { return !F.some(function (f) { return f.R.indexOf(a) >= 0; }); });
    var rest = R.filter(function (a) { return onlyL.indexOf(a) < 0; }), found = [];
    if (eq(closure(onlyL, F).set.filter(function (a) { return R.indexOf(a) >= 0; }), R)) return { keys: [onlyL], core: onlyL };
    for (var size = 1; size <= rest.length; size++) {
      (function comb(start, pick) {
        if (pick.length === size) {
          var X = onlyL.concat(pick);
          if (found.some(function (k) { return k.every(function (a) { return X.indexOf(a) >= 0; }); })) return;
          if (R.every(function (a) { return closure(X, F).set.indexOf(a) >= 0; })) found.push(X);
          return;
        }
        for (var i = start; i < rest.length; i++) comb(i + 1, pick.concat([rest[i]]));
      })(0, []);
    }
    return { keys: found, core: onlyL };
  }
  function minCover(F) {
    var G = [];
    F.forEach(function (f) { f.R.forEach(function (a) { if (f.L.indexOf(a) < 0) G.push({ L: f.L.slice(), R: [a] }); }); });
    G.forEach(function (f) {
      for (var i = 0; i < f.L.length && f.L.length > 1; i++) {
        var L2 = f.L.filter(function (_, j) { return j !== i; });
        if (closure(L2, G).set.indexOf(f.R[0]) >= 0) { f.L = L2; i = -1; }
      }
    });
    for (var i = 0; i < G.length; i++) {
      var rest = G.filter(function (_, j) { return j !== i; });
      if (closure(G[i].L, rest).set.indexOf(G[i].R[0]) >= 0) { G.splice(i, 1); i--; }
    }
    var seen = {}; return G.filter(function (f) { var k = f.L.slice().sort().join(",") + ">" + f.R[0]; if (seen[k]) return false; seen[k] = 1; return true; });
  }
  function analyze(R, F) {
    var K = keys(R, F), prime = {}; K.keys.forEach(function (k) { k.forEach(function (a) { prime[a] = 1; }); });
    var isKeySuper = function (X) { return K.keys.some(function (k) { return k.every(function (a) { return X.indexOf(a) >= 0; }); }); };
    var v2 = [], v3 = [], vb = [];
    F.forEach(function (f) {
      var nonTriv = f.R.filter(function (a) { return f.L.indexOf(a) < 0; }); if (!nonTriv.length) return;
      var sk = isKeySuper(f.L), fd = f.L.join(", ") + " → " + nonTriv.join(", ");
      if (!sk) vb.push(fd + ": сол жағы суперкілт емес");
      var np = nonTriv.filter(function (a) { return !prime[a]; });
      if (!sk && np.length) v3.push(fd + ": сол жағы суперкілт емес, ал " + np.join(", ") + " — кілттік емес атрибут");
      var partial = K.keys.some(function (k) { return k.length > 1 && f.L.length < k.length && f.L.every(function (a) { return k.indexOf(a) >= 0; }); });
      if (partial && np.length) v2.push(fd + ": " + np.join(", ") + " кілттің бір бөлігіне ғана тәуелді (жартылай тәуелділік)");
    });
    var level = v2.length ? "1ҚФ" : v3.length ? "2ҚФ" : vb.length ? "3ҚФ" : "BCNF";
    var mc = minCover(F), groups = {};
    mc.forEach(function (f) { var k = f.L.slice().sort().join(","); (groups[k] = groups[k] || { L: f.L, R: [] }).R.push(f.R[0]); });
    var rels = Object.keys(groups).map(function (k) { return groups[k].L.concat(groups[k].R); });
    if (!rels.some(function (r) { return isKeySuper(r); }) && K.keys[0]) rels.push(K.keys[0].slice());
    rels = rels.filter(function (r, i) { return !rels.some(function (q, j) { return j !== i && r.every(function (a) { return q.indexOf(a) >= 0; }) && (q.length > r.length || j < i); }); });
    return { keys: K.keys, prime: Object.keys(prime), v2: v2, v3: v3, vb: vb, level: level, mc: mc, rels: rels };
  }
  LAB.nf = { closure: closure, keys: keys, analyze: analyze, parseFD: parseFD, minCover: minCover };
  LAB.pages.nf = function () {
    view.innerHTML = LAB.head("Нормализация калькуляторы", "Атрибуттар мен функционалдық тәуелділіктерді енгізіңіз (әр жолға біреу, «A, B -> C» түрінде). Калькулятор тұйықталуды, кандидат кілттерді, қалыпты форманы және 3ҚФ-қа ыдыратуды есептейді.", "nf") +
      '<div class="seg seg--wrap" role="group">' + NFX.map(function (x, i) { return '<button data-nx="' + i + '">' + esc(x[0]) + '</button>'; }).join("") + '</div>' +
      '<section class="labform labform--graph"><div class="labform__col"><label class="lbl">Қатынас атрибуттары R<input class="field" id="nA" value="' + esc(NF.attrs) + '"></label>' +
        '<label class="lbl">Тұйықталуын есептеу: X⁺, X =<input class="field" id="nX" value="' + esc(NF.closure) + '"></label></div>' +
        '<label class="lbl">Функционалдық тәуелділіктер F<textarea class="field" id="nF" rows="5" spellcheck="false">' + esc(NF.fds) + '</textarea></label>' +
        '<div class="labform__btns"><button class="btn btn--primary" id="nGo">Талдау</button></div></section><div id="nOut"></div>';
    U.on("[data-nx]", "click", function (e, el) { var x = NFX[+el.getAttribute("data-nx")]; NF.attrs = x[1]; NF.fds = x[2]; NF.closure = splitA(x[2].split("\n")[0].split("->")[0]).join(", "); LAB.pages.nf(); }, view);
    U.$("#nGo").addEventListener("click", runNF);
    runNF();
  };
  function runNF() {
    NF.attrs = U.$("#nA").value; NF.fds = U.$("#nF").value; NF.closure = U.$("#nX").value;
    var R = splitA(NF.attrs), F = parseFD(NF.fds), out = U.$("#nOut");
    var bad = []; F.forEach(function (f) { f.L.concat(f.R).forEach(function (a) { if (R.indexOf(a) < 0 && bad.indexOf(a) < 0) bad.push(a); }); });
    if (!R.length || !F.length) { out.innerHTML = '<p class="warn">Атрибуттар мен кемінде бір тәуелділік енгізіңіз.</p>'; return; }
    if (bad.length) { out.innerHTML = '<p class="warn">R ішінде жоқ атрибуттар: ' + esc(bad.join(", ")) + '. Атрибуттар атауы бірдей жазылуы керек.</p>'; return; }
    if (R.length > 14) { out.innerHTML = '<p class="warn">14 атрибутқа дейін.</p>'; return; }
    var X = splitA(NF.closure).filter(function (a) { return R.indexOf(a) >= 0; }), cl = closure(X, F), A = analyze(R, F);
    var lv = ["1ҚФ", "2ҚФ", "3ҚФ", "BCNF"], li = lv.indexOf(A.level);
    var set = function (s) { return "{" + s.join(", ") + "}"; };
    out.innerHTML =
      '<section class="block"><h2>Тұйықталу ' + esc(set(X)) + '⁺</h2><p class="labres is-ok">' + esc(set(X)) + '⁺ = ' + esc(set(cl.set)) + (eq(cl.set.filter(function (a) { return R.indexOf(a) >= 0; }), R) ? " — барлық атрибуттар, яғни " + esc(set(X)) + " суперкілт" : "") + '</p>' +
        '<ol class="dslog"><li>Бастау: ' + esc(set(X)) + '</li>' + cl.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("") + '</ol></section>' +
      '<section class="block"><h2>Кандидат кілттер</h2><p>' + A.keys.map(function (k) { return '<span class="chip chip--key">' + esc(set(k)) + '</span>'; }).join(" ") + '</p>' +
        '<p class="labnote">Кілттік (prime) атрибуттар: ' + esc(A.prime.join(", ")) + '. Кілттік емес: ' + esc(R.filter(function (a) { return A.prime.indexOf(a) < 0; }).join(", ") || "жоқ") + '.</p></section>' +
      '<section class="block"><h2>Қалыпты форма</h2><div class="nfsteps">' + lv.map(function (l, i) { return '<span class="nfstep' + (i <= li ? " is-ok" : " is-no") + '">' + l + '</span>'; }).join("") + '</div>' +
        '<p class="labres ' + (A.level === "BCNF" ? "is-ok" : "is-no") + '">Қатынас ' + A.level + ' деңгейінде' + (A.level === "1ҚФ" ? " (атрибуттар атомар деп есептейміз)" : "") + '.</p>' +
        (A.v2.length ? '<h3>2ҚФ бұзылуы</h3><ul>' + A.v2.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join("") + '</ul>' : "") +
        (A.v3.length ? '<h3>3ҚФ бұзылуы</h3><ul>' + A.v3.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join("") + '</ul>' : "") +
        (A.vb.length ? '<h3>BCNF бұзылуы</h3><ul>' + A.vb.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join("") + '</ul>' : "") + '</section>' +
      '<section class="block"><h2>Минималды жабын</h2><p>' + A.mc.map(function (f) { return '<code>' + esc(f.L.join(", ") + " → " + f.R[0]) + '</code>'; }).join(" ") + '</p>' +
        '<h3>3ҚФ-қа ыдырату (синтез)</h3><ul class="nfrels">' + A.rels.map(function (r, i) { return '<li><b>R' + (i + 1) + '</b>(' + esc(r.join(", ")) + ')</li>'; }).join("") + '</ul>' +
        '<p class="labnote">Синтез алгоритмі: минималды жабынның әр сол жағы бойынша бір қатынас; егер ешбірі кандидат кілтті қамтымаса, кілттен тұратын қатынас қосылады. Нәтиже шығынсыз және тәуелділіктерді сақтайды.</p></section>';
  }

  /* ================= Шпаргалка ================= */
  LAB.pages.cheat = function () {
    var T = function (head, rows) { return '<div class="tablewrap"><table class="ltab"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>'; };
    view.innerHTML = LAB.head("Шпаргалка", "Емтихан алдында қарап шығатын ең жиі сұралатын анықтамалар.", "cheat") +
      '<div class="cheat">' +
      '<section class="block"><h2>Сұрыптау күрделілігі</h2>' + T(["Алгоритм", "Ең жақсы", "Орташа", "Ең нашар", "Жад", "Тұрақты"], [
        ["Bubble", "O(n)", "O(n²)", "O(n²)", "O(1)", "иә"], ["Selection", "O(n²)", "O(n²)", "O(n²)", "O(1)", "жоқ"], ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "иә"],
        ["Shell", "O(n log n)", "≈O(n^1.3)", "O(n²)", "O(1)", "жоқ"], ["Merge", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "иә"], ["Quick", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "жоқ"],
        ["Heap", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "жоқ"], ["Counting", "O(n+k)", "O(n+k)", "O(n+k)", "O(k)", "иә"], ["Radix", "O(d(n+k))", "O(d(n+k))", "O(d(n+k))", "O(n+k)", "иә"]]) + '</section>' +
      '<section class="block"><h2>Деректер құрылымдары</h2>' + T(["Құрылым", "Қол жеткізу", "Іздеу", "Қосу", "Өшіру"], [
        ["Массив", "O(1)", "O(n)", "O(n)", "O(n)"], ["Байланысқан тізім", "O(n)", "O(n)", "O(1)*", "O(1)*"], ["Стек / кезек", "—", "O(n)", "O(1)", "O(1)"],
        ["Хеш-кесте", "—", "O(1) орташа / O(n)", "O(1) / O(n)", "O(1) / O(n)"], ["BST", "—", "O(log n) / O(n)", "O(log n) / O(n)", "O(log n) / O(n)"], ["AVL, қызыл-қара", "—", "O(log n)", "O(log n)", "O(log n)"],
        ["Екілік үйінді", "max/min O(1)", "O(n)", "O(log n)", "O(log n)"]]) + '<p class="muted small">* позиция белгілі болса.</p></section>' +
      '<section class="block"><h2>Графтар</h2>' + T(["Алгоритм", "Мақсаты", "Күрделілігі"], [
        ["BFS", "Салмақсыз графта ең қысқа жол; кезек", "O(V + E)"], ["DFS", "Топологиялық сұрыптау, циклдер, байланыстылық; стек / рекурсия", "O(V + E)"],
        ["Дейкстра", "Теріс емес салмақтармен бір көзден ең қысқа жол", "O((V + E) log V)"], ["Беллман–Форд", "Теріс салмақтар, теріс циклді табу", "O(V·E)"],
        ["Флойд–Уоршелл", "Барлық жұп арасындағы ең қысқа жол", "O(V³)"], ["Прим / Крускал", "Ең аз каркас ағашы", "O(E log V) / O(E log E)"]]) + '</section>' +
      '<section class="block"><h2>SELECT орындалу реті</h2><ol class="ordlist"><li><code>FROM</code>, <code>JOIN</code></li><li><code>WHERE</code> — жолдарды сүзу</li><li><code>GROUP BY</code></li><li><code>HAVING</code> — топтарды сүзу</li><li><code>SELECT</code> — бағандар, бүркеншік аттар</li><li><code>DISTINCT</code></li><li><code>ORDER BY</code></li><li><code>LIMIT</code> / <code>OFFSET</code></li></ol>' +
        '<p class="labnote">Сондықтан SELECT-тегі бүркеншік атты WHERE ішінде қолдануға болмайды, ал агрегатты функциялар WHERE-де емес, HAVING-те тұрады.</p></section>' +
      '<section class="block"><h2>SQL командаларының топтары</h2>' + T(["Топ", "Командалар"], [["DDL — анықтау", "CREATE, ALTER, DROP, TRUNCATE"], ["DML — өңдеу", "SELECT, INSERT, UPDATE, DELETE"], ["DCL — қолжетімділік", "GRANT, REVOKE"], ["TCL — транзакция", "COMMIT, ROLLBACK, SAVEPOINT"]]) +
        '<p class="labnote">DELETE жолдарды бір-бірлеп өшіреді, WHERE қолдайды және ROLLBACK болады; TRUNCATE кестені толық тазартады; DROP кестені құрылымымен жояды.</p></section>' +
      '<section class="block"><h2>ACID</h2><ul class="deflist"><li><b>Atomicity (атомарлық)</b> — транзакция толық орындалады немесе мүлдем орындалмайды.</li><li><b>Consistency (келісімділік)</b> — дерекқор бір дұрыс күйден екіншісіне өтеді, шектеулер сақталады.</li><li><b>Isolation (оқшаулау)</b> — қатар жүрген транзакциялар бір-біріне әсер етпейді.</li><li><b>Durability (тұрақтылық)</b> — COMMIT-тен кейін өзгерістер іркілістен кейін де сақталады.</li></ul></section>' +
      '<section class="block"><h2>Оқшаулау деңгейлері</h2>' + T(["Деңгей", "Dirty read", "Non-repeatable read", "Phantom read"], [["Read Uncommitted", "бар", "бар", "бар"], ["Read Committed", "жоқ", "бар", "бар"], ["Repeatable Read", "жоқ", "жоқ", "бар"], ["Serializable", "жоқ", "жоқ", "жоқ"]]) + '</section>' +
      '<section class="block"><h2>Қалыпты формалар</h2><ul class="deflist"><li><b>1ҚФ</b> — барлық мәндер атомар, қайталанатын топтар жоқ.</li><li><b>2ҚФ</b> — 1ҚФ + кілттік емес атрибуттың құрама кілттің бөлігіне тәуелділігі (жартылай тәуелділік) жоқ.</li><li><b>3ҚФ</b> — 2ҚФ + транзитивті тәуелділік жоқ: әр X → A үшін X суперкілт немесе A кілттік атрибут.</li><li><b>BCNF</b> — әр нетривиал X → A үшін X суперкілт.</li><li><b>4ҚФ</b> — нетривиал көпмәнді тәуелділіктер жоқ. <b>5ҚФ</b> — join-тәуелділіктер жоқ.</li></ul></section>' +
      '<section class="block"><h2>Кілттер мен шектеулер</h2><ul class="deflist"><li><b>Суперкілт</b> — жолды бірегей анықтайтын атрибуттар жиыны.</li><li><b>Кандидат кілт</b> — минималды суперкілт.</li><li><b>Бастапқы кілт (PK)</b> — таңдалған кандидат кілт; NULL болмайды.</li><li><b>Сыртқы кілт (FK)</b> — басқа кестенің PK-не сілтеме; сілтемелік тұтастықты қамтамасыз етеді.</li><li><b>ON DELETE CASCADE</b> — ата жол өшсе, тәуелді жолдар да өшеді; <b>SET NULL</b> — FK NULL-ға ауысады.</li></ul></section>' +
      '<section class="block"><h2>Реляциялық алгебра</h2>' + T(["Амал", "Белгі", "SQL баламасы"], [["Таңдау (selection)", "σ<sub>шарт</sub>(R)", "WHERE"], ["Проекция", "π<sub>бағандар</sub>(R)", "SELECT DISTINCT бағандар"], ["Біріктіру", "R ∪ S", "UNION"], ["Айырма", "R − S", "EXCEPT"], ["Қиылысу", "R ∩ S", "INTERSECT"], ["Декарттық көбейтінді", "R × S", "CROSS JOIN"], ["Табиғи біріктіру", "R ⋈ S", "NATURAL JOIN"], ["Бөлу", "R ÷ S", "NOT EXISTS … NOT EXISTS"]]) + '</section>' +
      '<section class="block"><h2>Индекстер</h2><ul class="deflist"><li><b>B+ ағашы</b> — ауқымды сұраныстар мен ORDER BY үшін; барлық деректер жапырақтарда, жапырақтар тізіммен байланысқан.</li><li><b>Хеш-индекс</b> — тек теңдік бойынша іздеу (=) үшін.</li><li><b>Кластерлі индекс</b> — кестедегі жолдардың физикалық реті; кестеде біреу ғана.</li><li>Индекс SELECT-ті жылдамдатады, бірақ INSERT / UPDATE / DELETE-ті баяулатады.</li></ul></section>' +
      '</div>';
  };
})(window);
