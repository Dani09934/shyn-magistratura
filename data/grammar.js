/* Ағылшын грамматикасы курсы: 12 шақ және емтиханда жиі кездесетін құрылымдар.
   imp — маңыздылығы: r = өте маңызды (емтиханда ең жиі), y = маңызды, g = білген жөн.
   items: {s, o, a, e} — бос орынға дұрыс нұсқаны таңдау; {w, e} — сөздерден сөйлем құрау (w — дұрыс реті). */
Shyn.grammar = {
units: [
  { id: "present", title: "Осы шақтар", sub: "Present", topics: ["present-simple", "present-continuous", "present-perfect", "present-perfect-continuous"] },
  { id: "past", title: "Өткен шақтар", sub: "Past", topics: ["past-simple", "past-continuous", "past-perfect", "past-perfect-continuous"] },
  { id: "future", title: "Келер шақтар", sub: "Future", topics: ["future-simple", "future-continuous", "future-perfect", "future-perfect-continuous"] },
  { id: "struct", title: "Құрылымдар", sub: "Structures", topics: ["passive", "conditionals", "wish", "modals", "reported-speech"] },
  { id: "words", title: "Сөз таптары", sub: "Word grammar", topics: ["gerund-infinitive", "articles", "comparatives", "prepositions-time"] }
],
topics: {
"present-simple": {
  name: "Present Simple", kz: "Жай осы шақ", imp: "r", tense: ["present", "simple"],
  why: "Емтиханда ең жиі: әдет, кесте, жалпы шындық және 3-жақтағы -s жалғауы.",
  use: ["Әдет, қайталанатын әрекет: I go to the gym every day.", "Жалпы шындық, табиғат заңы: Water boils at 100°C.", "Кесте, бағдарлама: The train leaves at 7."],
  form: { "+": "I/you/we/they + V1 · he/she/it + V1-s", "−": "do / does + not + V1", "?": "Do / Does + S + V1?" },
  markers: ["always", "usually", "often", "sometimes", "never", "every day", "on Mondays"],
  ex: [["She works in a bank.", "Ол банкте жұмыс істейді."], ["Does he speak English?", "Ол ағылшынша сөйлей ме?"]],
  trap: "does/doesn't-тен кейін етістік -s алмайды: He doesn't like (likes емес).",
  items: [
    { s: "She ___ to school every day.", o: ["goes", "go", "is going", "went"], a: 0, e: "every day — әдет, she — 3-жақ: goes." },
    { s: "Water ___ at 100 degrees Celsius.", o: ["boil", "boils", "is boiling", "boiled"], a: 1, e: "Жалпы шындық → Present Simple, water — 3-жақ: boils." },
    { s: "He ___ coffee in the morning.", o: ["don't drink", "doesn't drinks", "doesn't drink", "not drink"], a: 2, e: "Болымсыз: doesn't + V1 (s жалғауынсыз)." },
    { s: "___ your brother live in Almaty?", o: ["Do", "Does", "Is", "Has"], a: 1, e: "your brother — he, сұрақ Does арқылы жасалады." },
    { s: "The train ___ at 7:30 tomorrow morning.", o: ["leave", "leaves", "will leaving", "is leave"], a: 1, e: "Кесте бойынша болашақ → Present Simple: leaves." },
    { s: "My parents never ___ meat.", o: ["eats", "eat", "are eating", "eating"], a: 1, e: "My parents — they, never — әдет: eat." },
    { s: "How often ___ you visit your grandmother?", o: ["are", "does", "do", "have"], a: 2, e: "How often — жиілік, you → do." },
    { w: ["He", "usually", "gets", "up", "at", "seven"], e: "Жиілік үстеуі негізгі етістіктің алдында тұрады: usually gets." }
  ]
},
"present-continuous": {
  name: "Present Continuous", kz: "Осы шақтың созылыңқы түрі", imp: "r", tense: ["present", "continuous"],
  why: "«Дәл қазір» және жоспарланған келісім — Present Simple-мен салыстыру жиі сұралады.",
  use: ["Дәл қазір болып жатқан әрекет: Look! It is raining.", "Уақытша жағдай: I'm living with my aunt this month.", "Алдын ала келісілген болашақ: I'm meeting Ali tomorrow."],
  form: { "+": "am / is / are + V-ing", "−": "am / is / are + not + V-ing", "?": "Am / Is / Are + S + V-ing?" },
  markers: ["now", "right now", "at the moment", "Look!", "Listen!", "this week", "tonight (жоспар)"],
  ex: [["They are watching TV now.", "Олар қазір теледидар көріп отыр."], ["I'm taking my exam tomorrow.", "Ертең емтихан тапсырамын (келісілген)."]],
  trap: "know, like, want, believe, understand сияқты күй етістіктері әдетте -ing алмайды: I know (I am knowing емес).",
  items: [
    { s: "Look! The children ___ in the garden.", o: ["play", "plays", "are playing", "played"], a: 2, e: "Look! — дәл қазір → are playing." },
    { s: "Listen! Somebody ___ the piano.", o: ["plays", "is playing", "play", "has played"], a: 1, e: "Listen! — сөйлеу сәтіндегі әрекет: is playing." },
    { s: "I ___ my driving test tomorrow — it's all arranged.", o: ["take", "am taking", "took", "have taken"], a: 1, e: "Алдын ала келісілген жоспар → Present Continuous." },
    { s: "I ___ what you mean.", o: ["am understanding", "understand", "understanding", "am understand"], a: 1, e: "understand — күй етістігі, Continuous түрі қолданылмайды." },
    { s: "She ___ at the moment, she's in the shower.", o: ["doesn't work", "isn't working", "not working", "don't work"], a: 1, e: "at the moment → isn't working." },
    { s: "___ they studying for the exam now?", o: ["Do", "Is", "Are", "Does"], a: 2, e: "they → Are + V-ing." },
    { s: "This week I ___ with my cousin because my flat is being repaired.", o: ["stay", "am staying", "stays", "stayed"], a: 1, e: "Уақытша жағдай (this week) → am staying." },
    { w: ["We", "are", "having", "dinner", "right", "now"], e: "am/is/are + V-ing, right now — сөйлем соңында." }
  ]
},
"present-perfect": {
  name: "Present Perfect", kz: "Осы шақтың аяқталған түрі", imp: "r", tense: ["present", "perfect"],
  why: "Past Simple-мен шатастыру — ең көп қате; since/for, already/yet, ever/never сұрақтары жиі.",
  use: ["Нәтижесі қазір маңызды өткен әрекет: I have lost my keys.", "Өмір тәжірибесі: Have you ever been to London?", "Қазірге дейін созылған күй (since/for): She has lived here since 2010."],
  form: { "+": "have / has + V3", "−": "have / has + not + V3", "?": "Have / Has + S + V3?" },
  markers: ["already", "yet", "just", "ever", "never", "since", "for", "so far", "recently"],
  ex: [["I have just finished my homework.", "Үй тапсырмасын жаңа ғана бітірдім."], ["Has she ever visited Paris?", "Ол Парижде болып па еді?"]],
  trap: "Нақты өткен уақытпен (yesterday, in 2010, ago) Present Perfect қолданылмайды — Past Simple керек.",
  items: [
    { s: "She ___ an account at this bank since 2010.", o: ["has", "has had", "had", "is having"], a: 1, e: "since 2010 — қазірге дейін созылып келеді → has had." },
    { s: "I ___ my keys. I can't open the door.", o: ["lost", "have lost", "lose", "am losing"], a: 1, e: "Нәтижесі қазір маңызды → have lost." },
    { s: "___ you ever ___ sushi?", o: ["Did / eat", "Have / eaten", "Do / eat", "Has / ate"], a: 1, e: "ever — өмір тәжірибесі → Have you ever eaten." },
    { s: "They haven't arrived ___.", o: ["already", "yet", "just", "ago"], a: 1, e: "Болымсыз және сұраулы сөйлемде соңында yet." },
    { s: "We ___ to Turkey last summer.", o: ["have been", "went", "have gone", "go"], a: 1, e: "last summer — нақты өткен уақыт → Past Simple: went." },
    { s: "He has worked here ___ ten years.", o: ["since", "for", "ago", "during"], a: 1, e: "Уақыт ұзақтығы → for; басталған сәт → since." },
    { s: "I ___ seen this film three times.", o: ["have", "has", "am", "did"], a: 0, e: "I → have + V3." },
    { w: ["She", "has", "already", "left", "the", "office"], e: "already — have/has пен V3 арасында." }
  ]
},
"present-perfect-continuous": {
  name: "Present Perfect Continuous", kz: "Осы шақтың аяқталған-созылыңқы түрі", imp: "y", tense: ["present", "perfectContinuous"],
  why: "«Қанша уақыттан бері» және көрінетін нәтиже: since/for + -ing.",
  use: ["Өткенде басталып, әлі жалғасып жатқан әрекет: I have been waiting for an hour.", "Жаңа ғана тоқтаған, ізі көрінетін әрекет: It has been raining — the road is wet."],
  form: { "+": "have / has been + V-ing", "−": "have / has not been + V-ing", "?": "Have / Has + S + been + V-ing?" },
  markers: ["for", "since", "all day", "how long", "lately"],
  ex: [["It has been raining all day.", "Күні бойы жаңбыр жауып тұр."], ["How long have you been learning English?", "Ағылшынды қашаннан бері оқып жүрсің?"]],
  trap: "Әрекеттің ұзақтығына мән берілсе — been + V-ing; нәтиже/сан маңызды болса — Present Perfect (I've written 3 letters).",
  items: [
    { s: "It ___ all day and the weather is awful.", o: ["rains", "is raining", "has been raining", "rained"], a: 2, e: "all day + қазір де жалғасуда → has been raining." },
    { s: "How long ___ you ___ for the bus?", o: ["are / waiting", "have / been waiting", "did / wait", "do / wait"], a: 1, e: "How long + қазірге дейін → have been waiting." },
    { s: "She is tired because she ___ all morning.", o: ["has been working", "works", "worked", "is work"], a: 0, e: "Көрінетін нәтиже (tired) + ұзақтық → has been working." },
    { s: "I ___ three letters today.", o: ["have been writing", "have written", "write", "am writing"], a: 1, e: "Нәтиже/сан маңызды (three letters) → Present Perfect." },
    { s: "They ___ English since September.", o: ["have been learning", "learn", "are learning", "learnt"], a: 0, e: "since September + жалғасып жатыр → have been learning." },
    { s: "Your eyes are red. ___ you been crying?", o: ["Did", "Are", "Have", "Has"], a: 2, e: "you → Have you been crying?" },
    { s: "He ___ been playing football for two hours.", o: ["have", "has", "is", "was"], a: 1, e: "He → has been + V-ing." },
    { w: ["I", "have", "been", "studying", "since", "morning"], e: "have been + V-ing + since." }
  ]
},
"past-simple": {
  name: "Past Simple", kz: "Жай өткен шақ", imp: "r", tense: ["past", "simple"],
  why: "Нақты өткен уақыт, бұрыс етістіктер, did/didn't — кез келген нұсқада бар.",
  use: ["Өткенде аяқталған әрекет: I visited my aunt yesterday.", "Өткендегі әрекеттер тізбегі: He came home, had dinner and went to bed."],
  form: { "+": "V2 (V-ed немесе бұрыс етістік)", "−": "did not + V1", "?": "Did + S + V1?" },
  markers: ["yesterday", "last week", "ago", "in 2010", "when I was a child"],
  ex: [["We saw a great film last night.", "Кеше кешке керемет фильм көрдік."], ["Did you call him?", "Оған қоңырау шалдың ба?"]],
  trap: "did/didn't-тен кейін етістік бастапқы түрде: Did you go (went емес).",
  items: [
    { s: "We ___ a great film last night.", o: ["see", "saw", "have seen", "seen"], a: 1, e: "last night → Past Simple, see — бұрыс етістік: saw." },
    { s: "___ you call your mother yesterday?", o: ["Do", "Have", "Did", "Were"], a: 2, e: "yesterday → Did + S + V1." },
    { s: "I'm sorry, I ___ understand the question.", o: ["didn't", "don't", "wasn't", "haven't"], a: 0, e: "Өткендегі нақты сәт → didn't understand." },
    { s: "Mozart ___ more than 600 pieces of music.", o: ["has written", "wrote", "writes", "was writing"], a: 1, e: "Өмірі аяқталған адамның ісі → Past Simple: wrote." },
    { s: "She ___ in Paris two years ago.", o: ["lived", "has lived", "lives", "is living"], a: 0, e: "ago → Past Simple: lived." },
    { s: "He worked there before, but now he ___ in a school.", o: ["worked", "works", "has worked", "work"], a: 1, e: "now — қазіргі жағдай → works; before — өткен: worked." },
    { s: "When I was a child, I ___ afraid of dogs.", o: ["am", "was", "have been", "were"], a: 1, e: "I → was (be етістігінің өткен шағы)." },
    { w: ["They", "didn't", "go", "to", "school", "yesterday"], e: "didn't + V1 (go, went емес)." }
  ]
},
"past-continuous": {
  name: "Past Continuous", kz: "Өткен шақтың созылыңқы түрі", imp: "y", tense: ["past", "continuous"],
  why: "«while … when …» құрылымы — Past Simple-мен бірге жиі беріледі.",
  use: ["Өткенде белгілі бір сәтте болып жатқан әрекет: At 8 pm I was reading.", "Ұзақ әрекетті қысқа әрекет бөледі: I was walking when it started to rain.", "Қатар жүрген екі ұзақ әрекет: She was cooking while he was cleaning."],
  form: { "+": "was / were + V-ing", "−": "was / were + not + V-ing", "?": "Was / Were + S + V-ing?" },
  markers: ["while", "when", "at 5 o'clock yesterday", "all evening", "at that moment"],
  ex: [["I was sleeping when you called.", "Сен қоңырау шалғанда ұйықтап жатқанмын."], ["What were you doing at 9?", "Сағат 9-да не істеп жатыр едің?"]],
  trap: "Қысқа, бөлуші әрекет — Past Simple (called), фондағы ұзақ әрекет — Past Continuous (was sleeping).",
  items: [
    { s: "While I ___, I hurt my back.", o: ["worked", "was working", "have worked", "am working"], a: 1, e: "While + ұзақ фон → was working, бөлуші әрекет hurt — Past Simple." },
    { s: "We ___ TV while they were having dinner.", o: ["watched", "were watching", "are watching", "watch"], a: 1, e: "Қатар жүрген екі ұзақ әрекет → were watching." },
    { s: "Dan was watching TV when his parents ___.", o: ["were arriving", "arrived", "arrive", "have arrived"], a: 1, e: "Ұзақ әрекетті бөлген қысқа оқиға → arrived." },
    { s: "At 8 o'clock yesterday evening I ___ a book.", o: ["read", "was reading", "have read", "am reading"], a: 1, e: "Өткендегі нақты сәт (at 8 yesterday) → was reading." },
    { s: "What ___ you doing when the lights went out?", o: ["did", "was", "were", "are"], a: 2, e: "you → were + V-ing." },
    { s: "It ___ when we left the house.", o: ["was raining", "rains", "has rained", "is raining"], a: 0, e: "Өткендегі фон → was raining." },
    { s: "She ___ sleeping when the phone rang.", o: ["wasn't", "weren't", "didn't", "isn't"], a: 0, e: "She → was / wasn't + V-ing." },
    { w: ["I", "was", "walking", "when", "it", "started", "to", "rain"], e: "Фон — was walking, бөлуші оқиға — started." }
  ]
},
"past-perfect": {
  name: "Past Perfect", kz: "Өткен шақтың аяқталған түрі", imp: "y", tense: ["past", "perfect"],
  why: "«by the time», «after», «before» — өткендегі екі әрекеттің ретін көрсету.",
  use: ["Өткендегі басқа әрекеттен бұрын аяқталған әрекет: When I arrived, the film had started.", "by the time + Past Simple: By the time we got there, they had left."],
  form: { "+": "had + V3", "−": "had not + V3", "?": "Had + S + V3?" },
  markers: ["by the time", "before", "after", "already (өткенге қатысты)", "by 5 o'clock yesterday"],
  ex: [["The train had left before we reached the station.", "Біз вокзалға жеткенше пойыз кетіп қалған еді."], ["Had you met her before?", "Онымен бұрын кездескен бе едің?"]],
  trap: "Бірінші болған әрекет — had + V3, кейінгісі — Past Simple.",
  items: [
    { s: "By the time the ambulance arrived, the man ___.", o: ["died", "had died", "has died", "was dying"], a: 1, e: "by the time + Past Simple → ертерек әрекет had + V3." },
    { s: "When we got to the cinema, the film ___ already ___.", o: ["has / started", "had / started", "was / starting", "did / start"], a: 1, e: "Біз келгенге дейін басталған → had started." },
    { s: "She was nervous because she ___ never ___ before.", o: ["has / flown", "had / flown", "did / fly", "was / flying"], a: 1, e: "Өткендегі сәтке дейінгі тәжірибе → had never flown." },
    { s: "After he ___ his homework, he went out.", o: ["had finished", "has finished", "finishes", "was finishing"], a: 0, e: "after — бірінші аяқталған әрекет → had finished." },
    { s: "I didn't recognise him because he ___ a lot.", o: ["changed", "had changed", "has changed", "changes"], a: 1, e: "Танымай қалғанға дейін өзгерген → had changed." },
    { s: "___ you ever seen snow before you came to Astana?", o: ["Have", "Did", "Had", "Were"], a: 2, e: "before you came (өткен) → Had you ever seen." },
    { s: "They ___ eaten anything since morning, so they were hungry.", o: ["haven't", "hadn't", "didn't", "weren't"], a: 1, e: "Өткендегі күйге дейін → hadn't eaten." },
    { w: ["The", "train", "had", "left", "before", "we", "arrived"], e: "Ертерек әрекет had left, кейінгісі arrived." }
  ]
},
"past-perfect-continuous": {
  name: "Past Perfect Continuous", kz: "Өткен шақтың аяқталған-созылыңқы түрі", imp: "g", tense: ["past", "perfectContinuous"],
  why: "Сирек кездеседі: өткендегі сәтке дейін қанша уақыт созылғанын айтады.",
  use: ["Өткендегі сәтке дейін созылған әрекет: He had been working there for 30 years when he retired."],
  form: { "+": "had been + V-ing", "−": "had not been + V-ing", "?": "Had + S + been + V-ing?" },
  markers: ["for … when", "since … before", "how long … before"],
  ex: [["She had been waiting for an hour when he finally came.", "Ол келгенше әйел бір сағат күткен еді."]],
  trap: "Ұзақтық (for 30 years) + өткендегі соңғы сәт (when he retired) — дәл осы шақтың белгісі.",
  items: [
    { s: "He ___ there for 30 years when he retired last year.", o: ["has worked", "had been working", "was working", "works"], a: 1, e: "for 30 years + өткендегі сәт (retired) → had been working." },
    { s: "We ___ for two hours when the bus finally came.", o: ["had been waiting", "have been waiting", "waited", "are waiting"], a: 0, e: "Өткендегі оқиғаға дейінгі ұзақтық → had been waiting." },
    { s: "Her eyes were red because she ___.", o: ["has been crying", "had been crying", "cries", "is crying"], a: 1, e: "Өткендегі көрінетін нәтиже → had been crying." },
    { s: "How long ___ they been living there before they moved?", o: ["have", "had", "did", "were"], a: 1, e: "before they moved (өткен) → had been living." },
    { s: "The ground was wet. It ___ all night.", o: ["had been raining", "has rained", "rains", "is raining"], a: 0, e: "Өткендегі нәтиже + ұзақтық → had been raining." },
    { s: "I was tired because I ___ been sleeping well.", o: ["haven't", "hadn't", "didn't", "wasn't"], a: 1, e: "Болымсыз: hadn't been + V-ing." },
    { s: "She had been ___ the piano for years before she gave a concert.", o: ["play", "played", "playing", "plays"], a: 2, e: "had been + V-ing → playing." },
    { w: ["They", "had", "been", "talking", "for", "an", "hour"], e: "had been + V-ing + for." }
  ]
},
"future-simple": {
  name: "Future Simple · be going to", kz: "Жай келер шақ", imp: "r", tense: ["future", "simple"],
  why: "will мен be going to айырмашылығы және шартты сөйлемдегі will.",
  use: ["Сөйлеп тұрған сәттегі шешім, уәде, болжам: I'll help you. I think it will rain.", "be going to — алдын ала ойластырылған жоспар немесе көрінетін белгі: Look at the clouds! It's going to rain."],
  form: { "+": "will + V1 · am/is/are going to + V1", "−": "will not (won't) + V1", "?": "Will + S + V1?" },
  markers: ["tomorrow", "next week", "soon", "I think", "probably", "in 2030"],
  ex: [["I think she will pass the exam.", "Менің ойымша, ол емтиханнан өтеді."], ["We are going to buy a new car.", "Жаңа көлік сатып алмақпыз."]],
  trap: "if/when-нен кейін келер шақ мағынасында Present Simple: If it rains, we will stay (will rain емес).",
  items: [
    { s: "The phone is ringing. — I ___ it.", o: ["answer", "will answer", "am going to answer", "answered"], a: 1, e: "Сол сәтте қабылданған шешім → will." },
    { s: "Look at those black clouds! It ___ rain.", o: ["will", "is going to", "rains", "is raining"], a: 1, e: "Көрінетін белгіге негізделген болжам → is going to." },
    { s: "If it ___ tomorrow, we will stay at home.", o: ["will rain", "rains", "rained", "is raining"], a: 1, e: "if-тен кейін Present Simple: rains." },
    { s: "I think people ___ on Mars one day.", o: ["live", "will live", "lived", "are living"], a: 1, e: "I think — болжам → will live." },
    { s: "We've decided: we ___ buy a new flat next year.", o: ["will", "are going to", "go", "would"], a: 1, e: "Алдын ала шешілген жоспар → are going to." },
    { s: "Don't worry, I ___ tell anyone your secret.", o: ["won't", "don't", "am not", "didn't"], a: 0, e: "Уәде → won't (will not)." },
    { s: "___ you help me with this box, please?", o: ["Do", "Will", "Are", "Did"], a: 1, e: "Сыпайы өтініш → Will you …?" },
    { w: ["I", "will", "call", "you", "tomorrow"], e: "will + V1." }
  ]
},
"future-continuous": {
  name: "Future Continuous", kz: "Келер шақтың созылыңқы түрі", imp: "g", tense: ["future", "continuous"],
  why: "Болашақтағы белгілі бір сәтте болып жатқан әрекет: «ертең сағат 5-те».",
  use: ["Болашақтағы нақты сәтте жүріп жатқан әрекет: This time tomorrow I will be flying to London."],
  form: { "+": "will be + V-ing", "−": "will not be + V-ing", "?": "Will + S + be + V-ing?" },
  markers: ["this time tomorrow", "at 5 o'clock tomorrow", "from 5 to 6", "all day tomorrow"],
  ex: [["At 10 tomorrow I'll be sitting my exam.", "Ертең сағат 10-да емтихан тапсырып отырамын."]],
  trap: "Болашақтағы уақыт аралығы (from 5 to 6) → will be + V-ing.",
  items: [
    { s: "Don't call her between 5 and 6 — she ___ a class.", o: ["will have", "will be having", "has", "is have"], a: 1, e: "Болашақтағы уақыт аралығында жүретін әрекет → will be having." },
    { s: "This time tomorrow we ___ on the beach.", o: ["will lie", "will be lying", "lie", "are lain"], a: 1, e: "this time tomorrow → will be lying." },
    { s: "At 9 am tomorrow I ___ my exam.", o: ["will be taking", "take", "took", "have taken"], a: 0, e: "Болашақтағы нақты сәт → will be taking." },
    { s: "___ you be using your car this evening?", o: ["Do", "Are", "Will", "Have"], a: 2, e: "Will + S + be + V-ing?" },
    { s: "Don't come at 8, we ___ dinner then.", o: ["will be having", "have", "had", "are have"], a: 0, e: "Болашақ сәттегі процесс → will be having." },
    { s: "He won't ___ working tomorrow, it's Sunday.", o: ["is", "be", "been", "being"], a: 1, e: "won't be + V-ing." },
    { s: "In an hour, they ___ over the Alps.", o: ["will be flying", "fly", "flew", "have flown"], a: 0, e: "In an hour — болашақтағы сәтте жүріп жатқан әрекет." },
    { w: ["I", "will", "be", "working", "all", "day", "tomorrow"], e: "will be + V-ing." }
  ]
},
"future-perfect": {
  name: "Future Perfect", kz: "Келер шақтың аяқталған түрі", imp: "g", tense: ["future", "perfect"],
  why: "«by + болашақ уақыт» белгісі; емтиханда Passive түрімен де келеді (will have been done).",
  use: ["Болашақтағы белгілі бір сәтке дейін аяқталатын әрекет: By 2030 I will have graduated."],
  form: { "+": "will have + V3", "−": "will not have + V3", "?": "Will + S + have + V3?" },
  markers: ["by tomorrow", "by 6 o'clock", "by the time (+ Present Simple)", "by next year"],
  ex: [["By Friday I will have finished the project.", "Жұмаға дейін жобаны бітіріп қоямын."]],
  trap: "Passive түрі: will have been + V3 — By 6 o'clock the work will have been done.",
  items: [
    { s: "By 6 o'clock the work ___.", o: ["will be done", "will have been done", "has done", "is doing"], a: 1, e: "by 6 o'clock + ырықсыз етіс → will have been done." },
    { s: "By the time you arrive, I ___ dinner.", o: ["will cook", "will have cooked", "cook", "cooked"], a: 1, e: "by the time + болашақ → will have cooked." },
    { s: "By next year she ___ English for five years.", o: ["will have studied", "studies", "studied", "is studying"], a: 0, e: "by next year — болашақ сәтке дейін аяқталады." },
    { s: "___ you have finished the report by Monday?", o: ["Do", "Will", "Are", "Did"], a: 1, e: "Will + S + have + V3?" },
    { s: "By the time she gets home, the children ___ to bed.", o: ["will have gone", "go", "went", "are going"], a: 0, e: "by the time + Present Simple → will have gone." },
    { s: "They won't ___ the bridge by the end of the year.", o: ["build", "have built", "built", "building"], a: 1, e: "won't have + V3." },
    { s: "By 2030, scientists ___ a cure for this disease.", o: ["will have found", "find", "found", "are finding"], a: 0, e: "By 2030 → will have found." },
    { w: ["I", "will", "have", "finished", "by", "Friday"], e: "will have + V3 + by." }
  ]
},
"future-perfect-continuous": {
  name: "Future Perfect Continuous", kz: "Келер шақтың аяқталған-созылыңқы түрі", imp: "g", tense: ["future", "perfectContinuous"],
  why: "Ең сирек шақ: болашақтағы сәтке дейін қанша уақыт созылатынын көрсетеді.",
  use: ["Болашақтағы сәтке дейін созылатын әрекет: By June I will have been working here for ten years."],
  form: { "+": "will have been + V-ing", "−": "will not have been + V-ing", "?": "Will + S + have been + V-ing?" },
  markers: ["by … for", "for … by the time"],
  ex: [["By May she will have been teaching for 20 years.", "Мамырда ол 20 жыл сабақ беріп жүрген болады."]],
  trap: "by (болашақ сәт) + for (ұзақтық) бірге тұрса — will have been + V-ing.",
  items: [
    { s: "By June, I ___ here for ten years.", o: ["will work", "will have been working", "work", "have worked"], a: 1, e: "by June + for ten years → will have been working." },
    { s: "Next month they ___ married for 25 years.", o: ["will have been", "are", "were", "have been"], a: 0, e: "be етістігімен: will have been married." },
    { s: "By the time he retires, he ___ for 40 years.", o: ["will have been teaching", "teaches", "taught", "is teaching"], a: 0, e: "by the time + for 40 years → will have been teaching." },
    { s: "At 5 pm we ___ for three hours.", o: ["will have been driving", "drive", "drove", "are driving"], a: 0, e: "Болашақ сәтке дейінгі ұзақтық." },
    { s: "How long ___ you have been studying by the end of the course?", o: ["will", "do", "did", "are"], a: 0, e: "How long will you have been studying …?" },
    { s: "She will have been ___ for an hour when we arrive.", o: ["wait", "waited", "waiting", "waits"], a: 2, e: "will have been + V-ing." },
    { s: "By December, I ___ English for two years.", o: ["will have been learning", "learnt", "am learning", "learn"], a: 0, e: "by December + for two years." },
    { w: ["She", "will", "have", "been", "working", "for", "a", "year"], e: "will have been + V-ing + for." }
  ]
},
"passive": {
  name: "Passive Voice", kz: "Ырықсыз етіс", imp: "r", tense: null,
  why: "Барлық шақта be + V3 — емтиханда сөйлемнің иесі әрекетті орындай ма, жоқ па, соны тексереді.",
  use: ["Әрекетті кім жасағаны маңызды емес немесе белгісіз: The bridge was built in 1990.", "Иесі (by …) соңында: The book was written by Abai."],
  form: { "Present": "am/is/are + V3", "Past": "was/were + V3", "Perfect": "have/has been + V3", "Future": "will be + V3" },
  markers: ["by …", "was born", "is made of", "has been done"],
  ex: [["English is spoken all over the world.", "Ағылшын тілінде бүкіл әлемде сөйлейді."], ["The letter has been sent.", "Хат жіберілді."]],
  trap: "Сөйлемде әрекетті орындаушы (somebody, someone) бастауыш болса — Active: Someone has damaged the car.",
  items: [
    { s: "Wangari Maathai ___ the Nobel Peace Prize in 2004.", o: ["awarded", "has awarded", "was awarded", "is awarding"], a: 2, e: "Ол марапатты алды (әрекет нысаны) + 2004 → was awarded." },
    { s: "His books ___ in many languages.", o: ["publish", "were published", "published", "are publishing"], a: 1, e: "Кітаптарды басқа біреулер шығарады → were published." },
    { s: "This house ___ in 1950.", o: ["built", "was built", "has built", "is building"], a: 1, e: "1950 → Past Passive: was built." },
    { s: "English ___ all over the world.", o: ["speaks", "is spoken", "spoke", "is speaking"], a: 1, e: "Жалпы шындық, Present Passive → is spoken." },
    { s: "Somebody ___ the room. It looks lovely now.", o: ["has cleaned", "has been cleaned", "was cleaned", "is cleaned"], a: 0, e: "Somebody — орындаушы бастауыш → Active: has cleaned." },
    { s: "The results ___ tomorrow.", o: ["will announce", "will be announced", "announce", "are announcing"], a: 1, e: "Future Passive → will be announced." },
    { s: "My car is broken. I need to have it ___.", o: ["repair", "repairing", "repaired", "to repair"], a: 2, e: "have something done → have it repaired." },
    { w: ["The", "letter", "has", "been", "sent"], e: "Present Perfect Passive: has been + V3." }
  ]
},
"conditionals": {
  name: "Conditionals", kz: "Шартты сөйлемдер (0–3 тип)", imp: "r", tense: null,
  why: "if-бөлімі мен басыңқы бөлімнің шақтарын сәйкестендіру — әр нұсқада дерлік бар.",
  use: ["0: жалпы шындық — If you heat ice, it melts.", "1: нақты болашақ — If it rains, we will stay home.", "2: шындыққа жанаспайтын қазір — If I had money, I would buy a car.", "3: өткендегі өкініш — If I had studied, I would have passed."],
  form: { "0": "If + Present, Present", "1": "If + Present, will + V1", "2": "If + Past, would + V1", "3": "If + had V3, would have V3" },
  markers: ["if", "unless", "provided", "in case"],
  ex: [["If I were you, I would apologise.", "Сенің орныңда болсам, кешірім сұрар едім."]],
  trap: "2-типте be етістігі барлық жақта were: If I were rich (was емес — ресми стильде).",
  items: [
    { s: "If you ___ ice, it melts.", o: ["heat", "will heat", "heated", "would heat"], a: 0, e: "0-тип, жалпы шындық: If + Present, Present." },
    { s: "If it ___ tomorrow, we'll stay at home.", o: ["will rain", "rains", "rained", "would rain"], a: 1, e: "1-тип: if-тен кейін Present Simple." },
    { s: "What would you do if you ___ a million dollars?", o: ["get", "will get", "got", "have got"], a: 2, e: "2-тип: would + V1 ↔ if + Past: got." },
    { s: "If I ___ you, I would accept the offer.", o: ["am", "was being", "were", "will be"], a: 2, e: "2-тип, кеңес: If I were you." },
    { s: "If she had studied harder, she ___ the exam.", o: ["would pass", "will pass", "would have passed", "passed"], a: 2, e: "3-тип: If + had V3, would have V3." },
    { s: "We won't go out unless the weather ___.", o: ["improves", "will improve", "improved", "would improve"], a: 0, e: "unless = if not, 1-тип: Present Simple." },
    { s: "If he ___ the bus, he wouldn't have been late.", o: ["didn't miss", "hadn't missed", "doesn't miss", "won't miss"], a: 1, e: "3-тип: If + hadn't + V3." },
    { w: ["If", "I", "had", "time", "I", "would", "help", "you"], e: "2-тип: If + Past, would + V1." }
  ]
},
"wish": {
  name: "I wish · If only", kz: "Тілек және өкініш", imp: "y", tense: null,
  why: "wish-тен кейін «бір шақ артқа» ережесі және шартты рай (subjunctive) сұрақтары.",
  use: ["Қазіргі шындыққа жанаспайтын тілек: I wish I knew the answer.", "Өткендегі өкініш: I wish I had studied more.", "Басқа адамның әрекетіне наразылық: I wish you would stop talking."],
  form: { "қазір": "wish + Past Simple", "өткен": "wish + had + V3", "наразылық": "wish + would + V1" },
  markers: ["I wish", "If only"],
  ex: [["If only I could go home.", "Үйге бара алсам ғой."], ["I wish I hadn't said that.", "Ол сөзді айтпағанымда ғой."]],
  trap: "wish-тен кейін will қолданылмайды: I wish I knew (I wish I know емес).",
  items: [
    { s: "I wish I ___ the answer to this question.", o: ["know", "knew", "will know", "known"], a: 1, e: "Қазіргі тілек → wish + Past: knew." },
    { s: "If only I ___ go home now!", o: ["can", "could", "will", "would to"], a: 1, e: "If only + Past (can → could)." },
    { s: "I wish I ___ more for the exam last week.", o: ["studied", "had studied", "study", "would study"], a: 1, e: "Өткендегі өкініш → had studied." },
    { s: "She wishes she ___ taller.", o: ["is", "were", "will be", "has been"], a: 1, e: "wish + were (барлық жақта)." },
    { s: "I wish you ___ making that noise!", o: ["stop", "stopped", "would stop", "had stopped"], a: 2, e: "Басқа адамның әрекетіне наразылық → would stop." },
    { s: "\"If only I could go home\" — this sentence is in the ___ mood.", o: ["imperative", "indicative", "subjunctive", "interrogative"], a: 2, e: "Шындыққа жанаспайтын тілек → subjunctive (шартты рай)." },
    { s: "He wishes he ___ to the party yesterday.", o: ["went", "had gone", "goes", "would go"], a: 1, e: "yesterday — өткен өкініш → had gone." },
    { w: ["I", "wish", "I", "had", "more", "free", "time"], e: "Қазіргі тілек: wish + Past (had)." }
  ]
},
"modals": {
  name: "Modal verbs", kz: "Модаль етістіктер", imp: "y", tense: null,
  why: "can/could, must/have to, should, may/might — кеңес, міндет, мүмкіндік.",
  use: ["can / could — қабілет, рұқсат: I can swim. Could you help me?", "must / have to — міндет; mustn't — тыйым; don't have to — міндет емес.", "should — кеңес: You should see a doctor.", "may / might — ықтималдық: It might rain."],
  form: { "+": "modal + V1 (to жоқ)", "−": "modal + not + V1", "?": "Modal + S + V1?" },
  markers: ["advice → should", "obligation → must", "possibility → may/might"],
  ex: [["You shouldn't lie in the sun all day.", "Күні бойы күнге қыздырынбау керек."]],
  trap: "Модаль етістіктен кейін to қойылмайды: couldn't understand (couldn't to емес). Ерекшелік: have to, ought to.",
  items: [
    { s: "You ___ lie in the sun all day. It's bad for your skin.", o: ["shouldn't", "mustn't to", "don't", "can"], a: 0, e: "Кеңес → shouldn't." },
    { s: "I ___ understand him because he spoke too fast.", o: ["can't", "couldn't", "couldn't to", "mustn't"], a: 1, e: "Өткендегі мүмкін еместік → couldn't + V1." },
    { s: "You ___ smoke here. It's forbidden.", o: ["don't have to", "mustn't", "needn't", "shouldn't to"], a: 1, e: "Тыйым → mustn't." },
    { s: "It's Sunday, so I ___ get up early.", o: ["mustn't", "don't have to", "can't", "shouldn't"], a: 1, e: "Міндет жоқ → don't have to." },
    { s: "Take an umbrella. It ___ rain later.", o: ["might", "must", "should to", "can't"], a: 0, e: "Ықтималдық → might." },
    { s: "___ you open the window, please?", o: ["Must", "Could", "Should", "Might"], a: 1, e: "Сыпайы өтініш → Could you …?" },
    { s: "My parents want me ___ to university.", o: ["go", "going", "to go", "went"], a: 2, e: "want + object + to-infinitive (бұл модаль емес)." },
    { w: ["You", "should", "see", "a", "doctor"], e: "should + V1 (to жоқ)." }
  ]
},
"reported-speech": {
  name: "Reported speech", kz: "Төлеу сөз (жанама сөз)", imp: "y", tense: null,
  why: "Шақтардың «артқа жылжуы» және өтініштің жанама түрі (ask/tell + to).",
  use: ["Present → Past: \"I am tired\" → She said she was tired.", "Past / Present Perfect → Past Perfect.", "will → would; can → could.", "Бұйрық: \"Don't sit up late\" → She told me not to sit up late."],
  form: { "say": "said (that) + шақ бір саты артқа", "tell": "told + адам + to V1", "сұрақ": "asked if / whether + тура сөз тәртібі" },
  markers: ["said", "told", "asked", "now → then", "today → that day"],
  ex: [["He said he would call me.", "Ол маған қоңырау шаламын деді."]],
  trap: "Жанама сұрақта сөз тәртібі тура: She asked where I lived (where did I live емес).",
  items: [
    { s: "\"I am tired,\" she said. → She said she ___ tired.", o: ["is", "was", "has been", "will be"], a: 1, e: "Present → Past: was." },
    { s: "\"I will call you,\" he said. → He said he ___ call me.", o: ["will", "would", "can", "shall"], a: 1, e: "will → would." },
    { s: "\"Don't sit up late,\" Mum said. → Mum told me ___ up late.", o: ["don't sit", "not to sit", "to not sitting", "not sit"], a: 1, e: "Болымсыз бұйрық → told + not to + V1." },
    { s: "She asked me where I ___.", o: ["live", "lived", "did I live", "do I live"], a: 1, e: "Жанама сұрақ: тура сөз тәртібі + шақ артқа: lived." },
    { s: "\"I have finished,\" he said. → He said he ___.", o: ["has finished", "had finished", "finished", "finishes"], a: 1, e: "Present Perfect → Past Perfect." },
    { s: "He asked me ___ I could swim.", o: ["that", "if", "what", "do"], a: 1, e: "Иә/жоқ сұрағы → asked if / whether." },
    { s: "\"I can help you,\" she said. → She said she ___ help me.", o: ["can", "could", "will", "may"], a: 1, e: "can → could." },
    { w: ["She", "told", "me", "to", "close", "the", "door"], e: "tell + адам + to V1." }
  ]
},
"gerund-infinitive": {
  name: "Gerund / Infinitive", kz: "-ing түрі және to-инфинитив", imp: "y", tense: null,
  why: "Қай етістіктен кейін -ing, қайсысынан кейін to V1 — тест сұрақтарының тұрақты түрі.",
  use: ["-ing: enjoy, finish, avoid, mind, suggest, stop (тоқтату), prefer … to …", "to V1: want, decide, hope, plan, agree, would like", "want / ask / tell + адам + to V1: I want you to go.", "Предлогтан кейін әрқашан -ing: interested in learning."],
  form: { "-ing": "enjoy / finish / avoid + V-ing", "to": "want / decide / hope + to V1" },
  markers: ["stop doing ≠ stop to do", "prefer doing to doing"],
  ex: [["I prefer watching films to going to the theatre.", "Театрға барғаннан гөрі фильм көргенді жақсы көремін."]],
  trap: "stop reading — оқуды доғару; stop to read — оқу үшін аялдау.",
  items: [
    { s: "I want you ___ with me.", o: ["go", "going", "to go", "went"], a: 2, e: "want + адам + to V1." },
    { s: "I prefer ___ films to ___ to the theatre.", o: ["watch / go", "watching / going", "to watch / go", "watched / went"], a: 1, e: "prefer doing … to doing." },
    { s: "He stopped ___ and went to bed.", o: ["read", "to read", "reading", "reads"], a: 2, e: "stop + V-ing — істі доғару." },
    { s: "She enjoys ___ in the mountains.", o: ["to walk", "walking", "walk", "walked"], a: 1, e: "enjoy + V-ing." },
    { s: "We decided ___ a taxi.", o: ["taking", "to take", "take", "took"], a: 1, e: "decide + to V1." },
    { s: "She is interested in ___ Chinese.", o: ["learn", "to learn", "learning", "learned"], a: 2, e: "Предлогтан (in) кейін V-ing." },
    { s: "Would you mind ___ the window?", o: ["to open", "opening", "open", "opened"], a: 1, e: "mind + V-ing." },
    { w: ["They", "agreed", "to", "help", "us"], e: "agree + to V1." }
  ]
},
"articles": {
  name: "Articles a / an / the", kz: "Артикльдер", imp: "y", tense: null,
  why: "a/an дыбысқа байланысты, the — бірегей нысандар мен бұрын аталған зат.",
  use: ["a — дауыссыз дыбыс алдында (a teacher, a university), an — дауысты дыбыс алдында (an apple, an hour).", "the — жалғыз бірегей нысан (the sun, the sky), бұрын аталған зат, күшейтпелі шырай (the best).", "Артикльсіз: көпше түрдегі жалпы ұғым, саналмайтын зат есім, тілдер, тамақ."],
  form: { "a": "+ дауыссыз дыбыс", "an": "+ дауысты дыбыс", "the": "белгілі / бірегей" },
  markers: ["мамандық → a", "бірегей → the", "a million", "the + -est"],
  ex: [["The sky is blue and the sun is shining.", "Аспан көк, күн жарқырап тұр."]],
  trap: "Әріпке емес, дыбысқа қарау керек: a university (/ju/), an hour (h оқылмайды).",
  items: [
    { s: "My sister is ___ teacher.", o: ["an", "a", "the", "—"], a: 1, e: "Мамандық + дауыссыз дыбыс → a teacher." },
    { s: "___ sky is blue and ___ sun is shining.", o: ["A / a", "The / the", "— / —", "A / the"], a: 1, e: "Бірегей нысандар → the sky, the sun." },
    { s: "I'll be back in ___ hour.", o: ["a", "an", "the", "—"], a: 1, e: "h оқылмайды, дауысты дыбыс → an hour." },
    { s: "He studies at ___ university in Almaty.", o: ["an", "a", "—", "the a"], a: 1, e: "university /ju/ — дауыссыз дыбыс → a." },
    { s: "I got ___ letter yesterday. ___ letter was from Ali.", o: ["a / The", "the / A", "a / A", "the / The"], a: 0, e: "Алғаш — a, қайта аталса — the." },
    { s: "Over ___ million people visited the city.", o: ["a", "the", "—", "an"], a: 0, e: "Нақты сан ретінде → a million." },
    { s: "This is ___ best museum that I have ever visited.", o: ["a", "the", "an", "—"], a: 1, e: "Күшейтпелі шырайдың алдында → the best." },
    { w: ["She", "bought", "an", "umbrella"], e: "umbrella дауысты дыбыстан басталады → an." }
  ]
},
"comparatives": {
  name: "Comparatives · Superlatives", kz: "Сын есімнің шырайлары", imp: "y", tense: null,
  why: "-er/-est және more/most таңдау, than және the сөздері.",
  use: ["Қысқа сын есім: nice → nicer → the nicest; big → bigger.", "Ұзын сын есім: interesting → more interesting → the most interesting.", "Бұрыс: good → better → the best; bad → worse → the worst; much/many → more.", "Үстеулер: quietly → more quietly."],
  form: { "салыстырмалы": "-er / more + than", "күшейтпелі": "the + -est / the most" },
  markers: ["than", "the … in / of", "much / far + -er"],
  ex: [["This room is the smallest in our house.", "Бұл бөлме — үйдегі ең кішісі."]],
  trap: "Екі түрді қоспаңыз: nicer (more nicer емес), the best (the most good емес).",
  items: [
    { s: "This room is ___ in our house.", o: ["smaller", "the smallest", "the most small", "smallest"], a: 1, e: "Бірнешенің ішінде → the smallest." },
    { s: "Your car is ___ than mine.", o: ["nicer", "more nice", "nicerer", "the nicest"], a: 0, e: "nice — қысқа: nicer than." },
    { s: "This book is ___ than the film.", o: ["interestinger", "more interesting", "most interesting", "the more interesting"], a: 1, e: "Ұзын сын есім → more interesting." },
    { s: "He works ___ now than last year.", o: ["more quietly", "quietlier", "most quietly", "quieter more"], a: 0, e: "-ly үстеу → more quietly than." },
    { s: "Today is ___ day of my life!", o: ["the best", "the goodest", "better", "the most good"], a: 0, e: "good → better → the best." },
    { s: "The weather is ___ today than yesterday.", o: ["bad", "worse", "worst", "more bad"], a: 1, e: "bad → worse → the worst." },
    { s: "We have ___ time now than before.", o: ["much", "more", "most", "the most"], a: 1, e: "than → салыстырмалы шырай: more." },
    { w: ["Astana", "is", "colder", "than", "Almaty"], e: "-er + than." }
  ]
},
"prepositions-time": {
  name: "Prepositions of time", kz: "Уақыт предлогтары in / on / at", imp: "g", tense: null,
  why: "in / on / at және from … to — қысқа, бірақ қателік жиі.",
  use: ["at — нақты уақыт: at 3 o'clock, at night, at the weekend.", "on — күн, апта күні: on Monday, on Tuesday morning, on 5 May.", "in — ай, жыл, маусым, тәулік бөлігі: in May, in 2020, in the afternoon.", "from … to … — аралық: from Monday to Saturday."],
  form: { "at": "сағат", "on": "күн", "in": "ай · жыл · тәулік бөлігі" },
  markers: ["Tuesday morning → on", "in the morning → in"],
  ex: [["See you on Monday at 9 in the morning.", "Дүйсенбі күні таңғы 9-да кездесейік."]],
  trap: "Апта күні + тәулік бөлігі → on: on Tuesday morning (in емес).",
  items: [
    { s: "The meeting is ___ three o'clock.", o: ["in", "on", "at", "by"], a: 2, e: "Сағат → at." },
    { s: "I have English ___ Tuesday morning.", o: ["in", "on", "at", "—"], a: 1, e: "Апта күні (+ тәулік бөлігі) → on." },
    { s: "We usually go skiing ___ winter.", o: ["in", "on", "at", "during the"], a: 0, e: "Маусым → in." },
    { s: "The shop is open ___ Monday ___ Saturday.", o: ["from / to", "in / on", "at / at", "since / for"], a: 0, e: "Аралық → from … to." },
    { s: "She was born ___ 1999.", o: ["on", "at", "in", "by"], a: 2, e: "Жыл → in." },
    { s: "I'll call you ___ the afternoon.", o: ["on", "in", "at", "by"], a: 1, e: "Тәулік бөлігі → in the afternoon." },
    { s: "My birthday is ___ 5 May.", o: ["in", "at", "on", "by"], a: 2, e: "Нақты күн → on 5 May." },
    { w: ["The", "film", "starts", "at", "eight", "o'clock"], e: "Сағат → at." }
  ]
}
}
};
