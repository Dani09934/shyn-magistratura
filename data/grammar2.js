/* Ағылшын курсы — қосымша: негіздер бөлімі, бұрыс етістіктер, құрастырғышқа арналған етістіктер. */
(function (G) {
  G.units.unshift({ id: "basics", title: "Негіздер", sub: "Basics", topics: ["pronouns", "to-be", "there-is", "quantifiers", "questions", "relative", "irregular"] });
  var T = G.topics;
  T["pronouns"] = {
    name: "Pronouns: subject · object", kz: "Есімдіктер: бастауыш және толықтауыш", imp: "r", tense: null,
    why: "I/me, he/him, they/them — қайсысы етістіктің алдына, қайсысы кейін қойылатынын тексеретін сұрақ әр тестте бар.",
    use: ["Subject (бастауыш) есімдік — етістіктің АЛДЫНДА, әрекетті кім жасайды: I, you, he, she, it, we, they.", "Object (толықтауыш) есімдік — етістіктен немесе предлогтан (for, with, to, about) КЕЙІН: me, you, him, her, it, us, them.", "Possessive adjective — зат есімнің алдында: my book, their car. Possessive pronoun — зат есімсіз, жеке тұрады: The book is mine.", "Reflexive — әрекет өзіне бағытталғанда: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves."],
    form: { "Subject": "I · you · he · she · it · we · they", "Object": "me · you · him · her · it · us · them", "Possessive adj.": "my · your · his · her · its · our · their", "Possessive pron.": "mine · yours · his · hers · — · ours · theirs", "Reflexive": "myself · yourself · himself · herself · itself · ourselves · themselves" },
    markers: ["етістіктің алдында → subject", "етістіктен кейін → object", "предлогтан кейін → object", "зат есімнің алдында → my/your", "зат есімсіз → mine/yours"],
    ex: [["She called me yesterday.", "Ол маған кеше қоңырау шалды."], ["This is for you and me.", "Бұл сен екеуміз үшін."], ["Is this pen yours? — No, it's hers.", "Бұл қалам сенікі ме? — Жоқ, оныкі."]],
    trap: "Предлогтан кейін әрқашан object: between you and me (I емес), for him (he емес). its — тәуелдік (its tail), it's = it is.",
    items: [
      { s: "Can you help ___ with my homework?", o: ["I", "me", "my", "mine"], a: 1, e: "help-тен кейін толықтауыш → me." },
      { s: "___ are my best friends.", o: ["Them", "They", "Their", "Theirs"], a: 1, e: "Етістіктің алдында бастауыш → They." },
      { s: "I bought this present for ___.", o: ["she", "her", "hers", "herself"], a: 1, e: "for предлогынан кейін object → her." },
      { s: "This isn't my bag. Mine is black, ___ is red.", o: ["your", "yours", "you", "yourself"], a: 1, e: "Зат есімсіз тұрады → yours." },
      { s: "The dog is wagging ___ tail.", o: ["it's", "its", "it", "his"], a: 1, e: "Тәуелдік → its (it's = it is)." },
      { s: "He hurt ___ while he was cooking.", o: ["him", "his", "himself", "he"], a: 2, e: "Әрекет өзіне бағытталған → himself." },
      { s: "Between you and ___, I don't like this idea.", o: ["I", "me", "my", "mine"], a: 1, e: "between предлогынан кейін object → me." },
      { s: "Ali and ___ went to the cinema.", o: ["me", "I", "my", "myself"], a: 1, e: "Бастауыштың бөлігі (кім барды?) → I." },
      { s: "We enjoyed ___ at the party.", o: ["us", "ours", "ourselves", "our"], a: 2, e: "enjoy oneself → ourselves." },
      { w: ["She", "gave", "him", "her", "phone", "number"], e: "She — бастауыш, him — толықтауыш, her — тәуелдік (her number)." }
    ]
  };
  T["to-be"] = {
    name: "Verb to be", kz: "be етістігі: am · is · are · was · were", imp: "r", tense: null,
    why: "Ең негізгі етістік: шақтарда көмекші, ырықсыз етісте, there is құрылымында.",
    use: ["Present: I am · he/she/it is · you/we/they are.", "Past: I/he/she/it was · you/we/they were.", "Сұрақ — be бастауыштың алдына шығады: Are you ready? Was she at home?", "Болымсыз — not қосылады: I'm not, he isn't, they weren't."],
    form: { "Present": "am / is / are", "Past": "was / were", "Future": "will be", "Perfect": "have / has been" },
    markers: ["I → am / was", "he, she, it → is / was", "you, we, they → are / were"],
    ex: [["We were at school yesterday.", "Кеше мектепте болдық."], ["Is your brother a doctor?", "Ағаң дәрігер ме?"]],
    trap: "be бар сөйлемде do/does/did қолданылмайды: Are you tired? (Do you tired емес).",
    items: [
      { s: "My parents ___ at work now.", o: ["is", "are", "am", "be"], a: 1, e: "My parents — they → are." },
      { s: "I ___ very tired yesterday.", o: ["were", "was", "am", "be"], a: 1, e: "I + өткен шақ → was." },
      { s: "___ you ready for the exam?", o: ["Do", "Is", "Are", "Does"], a: 2, e: "be бар сұрақ: Are you …? (do емес)." },
      { s: "She ___ at home last night.", o: ["wasn't", "weren't", "didn't", "isn't"], a: 0, e: "She + өткен шақ, болымсыз → wasn't." },
      { s: "The weather ___ terrible today.", o: ["are", "is", "were", "be"], a: 1, e: "the weather — it → is." },
      { s: "Where ___ you born?", o: ["was", "were", "are", "did"], a: 1, e: "you → were; be born — өткен шақта." },
      { s: "There ___ a lot of people at the concert last night.", o: ["was", "were", "is", "are"], a: 1, e: "people — көпше, өткен шақ → were." },
      { s: "I ___ a student. I'm a teacher.", o: ["am not", "isn't", "aren't", "don't"], a: 0, e: "I → am not." },
      { w: ["Were", "you", "at", "home", "yesterday"], e: "Сұрақта be бастауыштың алдында: Were you …?" }
    ]
  };
  T["there-is"] = {
    name: "There is · There are", kz: "Бар/жоқ құрылымы", imp: "y", tense: null,
    why: "Бір нәрсенің бар екенін айту: етістік келесі зат есімнің санына қарай таңдалады.",
    use: ["Жекеше / саналмайтын → there is / there was: There is a book on the table. There is some milk.", "Көпше → there are / there were: There are two cats.", "Сұрақ: Is there …? Are there …? Болымсыз: There isn't any …, There aren't any …"],
    form: { "Present": "there is / there are", "Past": "there was / there were", "Future": "there will be", "Perfect": "there has been / have been" },
    markers: ["a / an / some (саналмайтын) → is", "two / many / a lot of + көпше → are"],
    ex: [["There are thirty students in our group.", "Тобымызда отыз студент бар."], ["Is there a bank near here?", "Мұнда жақын банк бар ма?"]],
    trap: "There is a pen and two books — етістік бірінші тұрған зат есімге қарай: There is a pen …",
    items: [
      { s: "There ___ two bedrooms in our flat.", o: ["is", "are", "be", "has"], a: 1, e: "two bedrooms — көпше → are." },
      { s: "There ___ some milk in the fridge.", o: ["are", "is", "were", "have"], a: 1, e: "milk — саналмайтын → is." },
      { s: "___ there any shops near your house?", o: ["Is", "Are", "Do", "Have"], a: 1, e: "any shops — көпше → Are there …?" },
      { s: "There ___ a storm last night.", o: ["is", "were", "was", "are"], a: 2, e: "a storm + өткен шақ → was." },
      { s: "There ___ a lot of tourists in Almaty in summer.", o: ["is", "are", "has", "have"], a: 1, e: "tourists — көпше → are." },
      { s: "There isn't ___ sugar left.", o: ["some", "any", "many", "a"], a: 1, e: "Болымсыз сөйлемде → any." },
      { s: "I think there ___ a test tomorrow.", o: ["will be", "will", "is be", "are"], a: 0, e: "Болашақ → there will be." },
      { w: ["There", "are", "many", "parks", "in", "Astana"], e: "Көпше зат есім → there are." }
    ]
  };
  T["quantifiers"] = {
    name: "some · any · much · many", kz: "Мөлшер сөздері, саналатын/саналмайтын", imp: "y", tense: null,
    why: "Саналатын (apples) және саналмайтын (water, money, advice, information) зат есімдермен қай сөз тұратыны жиі сұралады.",
    use: ["many, a few, few — саналатын көпше: many books, a few friends.", "much, a little, little — саналмайтын: much time, a little money.", "a lot of / lots of — екеуімен де: a lot of people, a lot of water.", "some — болымды сөйлемде және ұсыныста; any — болымсыз және сұрауда."],
    form: { "Саналатын": "many · a few · few · how many", "Саналмайтын": "much · a little · little · how much", "Екеуі де": "some · any · a lot of · no" },
    markers: ["How many …? → саналатын", "How much …? → саналмайтын / баға"],
    ex: [["How much money do you have?", "Сенде қанша ақша бар?"], ["I have a few friends in London.", "Лондонда бірнеше досым бар."]],
    trap: "information, advice, news, furniture, homework — ағылшынша саналмайтын: much information (many informations емес).",
    items: [
      { s: "How ___ apples did you buy?", o: ["much", "many", "little", "any"], a: 1, e: "apples — саналатын → many." },
      { s: "We don't have ___ time left.", o: ["many", "much", "few", "a few"], a: 1, e: "time — саналмайтын → much." },
      { s: "Would you like ___ tea?", o: ["any", "some", "many", "a few"], a: 1, e: "Ұсыныс → some." },
      { s: "Is there ___ bread in the kitchen?", o: ["some", "any", "many", "a few"], a: 1, e: "Сұрақ → any." },
      { s: "He gave me some good ___.", o: ["advices", "advice", "an advice", "many advice"], a: 1, e: "advice — саналмайтын, -s алмайды." },
      { s: "I have ___ friends here, so I'm not lonely.", o: ["a few", "a little", "much", "little"], a: 0, e: "friends — саналатын, оң мағына → a few." },
      { s: "There is ___ water in the bottle — only a few drops.", o: ["few", "little", "many", "a few"], a: 1, e: "water — саналмайтын, «өте аз» → little." },
      { s: "This recipe needs ___ eggs, ___ flour and ___ milk.", o: ["a lot of / a lot of / a lot of", "much / many / many", "many / many / much", "much / much / many"], a: 0, e: "a lot of екі түрмен де тұрады." },
      { w: ["How", "much", "does", "it", "cost"], e: "Баға → How much." }
    ]
  };
  T["questions"] = {
    name: "Questions", kz: "Сұрақ қою: сұрақ сөздер және көмекші етістік", imp: "y", tense: null,
    why: "Сұраулы сөйлемнің сөз тәртібі және who/what/where/when/why/how — жиі қате жіберілетін тақырып.",
    use: ["Тәртіп: Сұрақ сөз + көмекші етістік + бастауыш + негізгі етістік: Where do you live?", "Көмекші етістік шаққа қарай: do/does (Present Simple), did (Past Simple), am/is/are, have/has, will.", "Бастауышқа қойылған сұрақта көмекші керек емес: Who called you? (Who did call емес).", "Tag questions: You're a student, aren't you? He didn't come, did he?"],
    form: { "Wh-": "Wh + aux + S + V?", "Иә/жоқ": "Aux + S + V?", "Бастауышқа": "Who/What + V?", "Tag": "болымды → болымсыз tag, болымсыз → болымды tag" },
    markers: ["Who — кім", "What — не", "Where — қайда", "When — қашан", "Why — неге", "How — қалай", "Whose — кімнің", "Which — қайсысы"],
    ex: [["What time does the lesson start?", "Сабақ нешеде басталады?"], ["Who broke the window?", "Терезені кім сындырды?"]],
    trap: "Жанама сұрақта тура тәртіп: Can you tell me where the station is? (where is the station емес).",
    items: [
      { s: "Where ___ your sister work?", o: ["do", "does", "is", "did"], a: 1, e: "your sister — she, Present Simple → does." },
      { s: "___ did you go last summer? — To Turkey.", o: ["When", "Where", "Who", "Why"], a: 1, e: "Жауап — орын → Where." },
      { s: "Who ___ this cake? It's delicious!", o: ["did make", "made", "does make", "make"], a: 1, e: "Бастауышқа сұрақ: Who made (көмекшісіз)." },
      { s: "___ book is this? — It's Aigerim's.", o: ["Who", "Whose", "Which", "Whom"], a: 1, e: "Кімнің? → Whose." },
      { s: "You are a student, ___?", o: ["are you", "aren't you", "don't you", "isn't it"], a: 1, e: "Болымды сөйлем → болымсыз tag: aren't you." },
      { s: "He didn't call you, ___?", o: ["didn't he", "did he", "does he", "has he"], a: 1, e: "Болымсыз сөйлем → болымды tag: did he." },
      { s: "Can you tell me where ___?", o: ["is the station", "the station is", "does the station", "the station"], a: 1, e: "Жанама сұрақ — тура тәртіп: the station is." },
      { s: "How ___ have you lived here? — For five years.", o: ["much", "long", "often", "many"], a: 1, e: "Ұзақтық → How long." },
      { w: ["What", "time", "does", "the", "film", "start"], e: "Wh + does + бастауыш + V1." }
    ]
  };
  T["relative"] = {
    name: "Relative pronouns", kz: "Қатыстық есімдіктер: who · which · that · whose", imp: "y", tense: null,
    why: "Анықтауыш бағыныңқы сөйлемде адамға who, затқа which қойылатынын тексереді.",
    use: ["who — адамдар: The man who lives next door.", "which — заттар, жануарлар: The book which I read.", "that — адам да, зат та (күшейтпелі шырайдан кейін жиі): the best film that I've seen.", "whose — тиесілік: the girl whose father is a doctor. where — орын: the town where I was born."],
    form: { "адам": "who / that", "зат": "which / that", "тиесілік": "whose", "орын": "where", "уақыт": "when" },
    markers: ["the best / the first / all + that"],
    ex: [["This is the house where I grew up.", "Бұл — мен өскен үй."], ["The girl whose bag was stolen called the police.", "Сөмкесі ұрланған қыз полиция шақырды."]],
    trap: "Үтірмен бөлінген сөйлемде that қолданылмайды: Astana, which is the capital, … (that емес).",
    items: [
      { s: "The woman ___ lives next door is a doctor.", o: ["which", "who", "whose", "where"], a: 1, e: "Адам → who." },
      { s: "I lost the book ___ you gave me.", o: ["who", "which", "whose", "where"], a: 1, e: "Зат → which." },
      { s: "This is the town ___ I was born.", o: ["which", "where", "who", "when"], a: 1, e: "Орын → where." },
      { s: "He's the boy ___ father is a pilot.", o: ["who", "whose", "which", "that"], a: 1, e: "Тиесілік → whose." },
      { s: "It's the best film ___ I have ever seen.", o: ["what", "that", "who", "where"], a: 1, e: "Күшейтпелі шырайдан кейін → that." },
      { s: "Astana, ___ is the capital of Kazakhstan, is very modern.", o: ["that", "which", "who", "where"], a: 1, e: "Үтірмен бөлінген сөйлем → which (that емес)." },
      { s: "Do you remember the day ___ we met?", o: ["where", "when", "which", "who"], a: 1, e: "Уақыт → when." },
      { s: "The students ___ passed the exam got a prize.", o: ["which", "who", "whose", "where"], a: 1, e: "Адамдар → who." },
      { w: ["The", "man", "who", "called", "you", "is", "here"], e: "Адам → who." }
    ]
  };
  T["irregular"] = {
    name: "Irregular verbs", kz: "Бұрыс етістіктер: V1 · V2 · V3", imp: "r", tense: null,
    why: "Past Simple (V2) және Perfect/Passive (V3) барлық шақтардың негізі. Ең жиі 80 етістікті «Етістіктер» бөлімінде жаттаңыз.",
    use: ["V2 — Past Simple: I went, she saw.", "V3 — Present/Past/Future Perfect және Passive: I have gone, it was written.", "did / didn't-тен кейін V1: Did you go? He didn't see."],
    form: { "V1": "go · see · write", "V2": "went · saw · wrote", "V3": "gone · seen · written" },
    markers: ["yesterday, ago → V2", "have/has/had, was/were + V3"],
    ex: [["I have never seen the sea.", "Мен ешқашан теңізді көрген емеспін."], ["She wrote a letter yesterday.", "Ол кеше хат жазды."]],
    trap: "Did/didn't-тен кейін V2 қолданылмайды: Did you see (saw емес).",
    items: [
      { s: "Yesterday we ___ to the mountains.", o: ["go", "went", "gone", "goes"], a: 1, e: "go — went — gone, Past Simple → went." },
      { s: "Have you ever ___ a horse?", o: ["rode", "ridden", "ride", "rided"], a: 1, e: "ride — rode — ridden, have + V3 → ridden." },
      { s: "She ___ her keys at home this morning.", o: ["leaved", "left", "leaves", "leaving"], a: 1, e: "leave — left — left." },
      { s: "The letter was ___ in English.", o: ["wrote", "written", "write", "writed"], a: 1, e: "Passive: was + V3 → written." },
      { s: "I ___ him at the party last week.", o: ["see", "saw", "seen", "seed"], a: 1, e: "see — saw — seen, Past Simple → saw." },
      { s: "Did you ___ the news?", o: ["heard", "hear", "hears", "hearing"], a: 1, e: "Did-тен кейін V1 → hear." },
      { s: "They have already ___ dinner.", o: ["ate", "eaten", "eat", "eated"], a: 1, e: "eat — ate — eaten, have + V3." },
      { s: "He ___ a new car last month.", o: ["buyed", "bought", "brought", "buys"], a: 1, e: "buy — bought — bought (bring — brought-пен шатастырмаңыз)." },
      { w: ["We", "have", "known", "each", "other", "for", "years"], e: "know — knew — known, have + V3." }
    ]
  };

  /* Бұрыс етістіктер: V1, V2, V3, қазақша */
  G.irregular = [
    ["be", "was / were", "been", "болу"], ["become", "became", "become", "болып шығу"], ["begin", "began", "begun", "бастау"],
    ["break", "broke", "broken", "сындыру"], ["bring", "brought", "brought", "әкелу"], ["build", "built", "built", "салу, құру"],
    ["buy", "bought", "bought", "сатып алу"], ["catch", "caught", "caught", "ұстау"], ["choose", "chose", "chosen", "таңдау"],
    ["come", "came", "come", "келу"], ["cost", "cost", "cost", "тұру (бағасы)"], ["cut", "cut", "cut", "кесу"],
    ["do", "did", "done", "істеу"], ["draw", "drew", "drawn", "сурет салу"], ["drink", "drank", "drunk", "ішу"],
    ["drive", "drove", "driven", "көлік жүргізу"], ["eat", "ate", "eaten", "жеу"], ["fall", "fell", "fallen", "құлау"],
    ["feel", "felt", "felt", "сезіну"], ["fight", "fought", "fought", "төбелесу, күресу"], ["find", "found", "found", "табу"],
    ["fly", "flew", "flown", "ұшу"], ["forget", "forgot", "forgotten", "ұмыту"], ["forgive", "forgave", "forgiven", "кешіру"],
    ["get", "got", "got / gotten", "алу, жету"], ["give", "gave", "given", "беру"], ["go", "went", "gone", "бару"],
    ["grow", "grew", "grown", "өсу"], ["have", "had", "had", "ие болу"], ["hear", "heard", "heard", "есту"],
    ["hide", "hid", "hidden", "жасыру"], ["hit", "hit", "hit", "соғу"], ["hold", "held", "held", "ұстап тұру"],
    ["hurt", "hurt", "hurt", "ауырту"], ["keep", "kept", "kept", "сақтау"], ["know", "knew", "known", "білу"],
    ["lead", "led", "led", "бастап бару"], ["learn", "learnt / learned", "learnt / learned", "үйрену"], ["leave", "left", "left", "кету, қалдыру"],
    ["lend", "lent", "lent", "қарызға беру"], ["let", "let", "let", "рұқсат беру"], ["lie", "lay", "lain", "жату"],
    ["lose", "lost", "lost", "жоғалту"], ["make", "made", "made", "жасау"], ["mean", "meant", "meant", "білдіру"],
    ["meet", "met", "met", "кездесу"], ["pay", "paid", "paid", "төлеу"], ["put", "put", "put", "қою"],
    ["read", "read", "read", "оқу"], ["ride", "rode", "ridden", "міну (атқа, велосипедке)"], ["ring", "rang", "rung", "қоңырау соғу"],
    ["rise", "rose", "risen", "көтерілу"], ["run", "ran", "run", "жүгіру"], ["say", "said", "said", "айту"],
    ["see", "saw", "seen", "көру"], ["sell", "sold", "sold", "сату"], ["send", "sent", "sent", "жіберу"],
    ["set", "set", "set", "орнату"], ["shine", "shone", "shone", "жарқырау"], ["shoot", "shot", "shot", "ату"],
    ["show", "showed", "shown", "көрсету"], ["shut", "shut", "shut", "жабу"], ["sing", "sang", "sung", "ән айту"],
    ["sit", "sat", "sat", "отыру"], ["sleep", "slept", "slept", "ұйықтау"], ["speak", "spoke", "spoken", "сөйлеу"],
    ["spend", "spent", "spent", "жұмсау, өткізу"], ["stand", "stood", "stood", "тұру"], ["steal", "stole", "stolen", "ұрлау"],
    ["swim", "swam", "swum", "жүзу"], ["take", "took", "taken", "алу"], ["teach", "taught", "taught", "оқыту"],
    ["tell", "told", "told", "айтып беру"], ["think", "thought", "thought", "ойлау"], ["throw", "threw", "thrown", "лақтыру"],
    ["understand", "understood", "understood", "түсіну"], ["wake", "woke", "woken", "ояну"], ["wear", "wore", "worn", "кию"],
    ["win", "won", "won", "жеңу"], ["write", "wrote", "written", "жазу"]
  ];
  /* Құрастырғыштағы дұрыс етістіктер */
  G.regular = [
    ["work", "жұмыс істеу"], ["play", "ойнау"], ["study", "оқу (сабақ)"], ["live", "тұру, өмір сүру"], ["watch", "көру (теледидар)"],
    ["help", "көмектесу"], ["visit", "барып қайту"], ["travel", "саяхаттау"], ["cook", "тамақ пісіру"], ["clean", "тазалау"],
    ["open", "ашу"], ["close", "жабу"], ["stop", "тоқтату"], ["plan", "жоспарлау"], ["try", "тырысу"],
    ["finish", "бітіру"], ["start", "бастау"], ["wait", "күту"], ["listen", "тыңдау"], ["call", "қоңырау шалу"],
    ["dance", "билеу"], ["arrive", "келу (жету)"], ["use", "қолдану"], ["want", "қалау"], ["love", "жақсы көру"]
  ];
})(Shyn.grammar);
