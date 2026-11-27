"""v96 — 12 шақ бойынша жеке тест (36 сұрақ); v97 — тренажердегі 12 грамматика тақырыбы бойынша сұрақтар (source: ai, өзіміздікі).
python3 tools/english_v96.py → data/sets/v96-english.js, v97-english.js, data/index.js"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = 'ABCD'
# (тақырып, сұрақ, нұсқалар, дұрыс, түсіндірме, аударма)
V96 = [
 ('Шақтар: Present Simple', 'She ___ to work by bus every day.', ['go', 'goes', 'is going', 'has gone'], 'B', 'every day — Present Simple; he/she/it + V1-s: goes.', 'Ол күн сайын жұмысқа автобуспен барады.'),
 ('Шақтар: Present Simple', '___ your brother play football?', ['Do', 'Does', 'Is', 'Has'], 'B', 'Present Simple сұрағы: Does + he/she/it + V1.', 'Ағаң футбол ойнай ма?'),
 ('Шақтар: Present Simple', 'They ___ meat. They are vegetarians.', ["don't eat", "doesn't eat", "aren't eat", "not eat"], 'A', 'Present Simple болымсызы: I/you/we/they + don\'t + V1.', 'Олар ет жемейді. Олар — вегетариандар.'),
 ('Шақтар: Present Continuous', 'Look! The children ___ in the garden.', ['play', 'plays', 'are playing', 'have played'], 'C', 'Look! — дәл қазір болып жатқан әрекет: am/is/are + V-ing.', 'Қара! Балалар бақта ойнап жүр.'),
 ('Шақтар: Present Continuous', 'Be quiet, please. I ___ to the news.', ['listen', 'am listening', 'listened', 'have listened'], 'B', 'Дәл қазір (сөйлеу сәтінде) — Present Continuous: am listening.', 'Тыныш болыңызшы. Мен жаңалықтарды тыңдап отырмын.'),
 ('Шақтар: Present Continuous', 'What ___ you doing at the moment?', ['do', 'are', 'have', 'did'], 'B', 'at the moment — Present Continuous; сұрақ: are + you + V-ing.', 'Қазір не істеп жатырсың?'),
 ('Шақтар: Present Perfect', 'I ___ already ___ my homework.', ['have / done', 'has / done', 'did / do', 'had / did'], 'A', 'already — Present Perfect: I have + V3 (done).', 'Мен үй тапсырмамды орындап қойдым.'),
 ('Шақтар: Present Perfect', 'She ___ in Astana since 2019.', ['lives', 'lived', 'has lived', 'is living'], 'C', 'since 2019 — өткенде басталып, әлі жалғасуда: has + V3.', 'Ол 2019 жылдан бері Астанада тұрады.'),
 ('Шақтар: Present Perfect', '___ you ever ___ to London?', ['Did / go', 'Have / been', 'Are / going', 'Do / go'], 'B', 'ever — Present Perfect: Have you ever been …?', 'Сен Лондонда болып көрдің бе?'),
 ('Шақтар: Present Perfect Continuous', 'He is tired because he ___ all day.', ['works', 'has been working', 'worked', 'is work'], 'B', 'all day + нәтиже қазір көрінеді (tired) — have/has been + V-ing.', 'Ол шаршады, себебі күні бойы жұмыс істеп жүр.'),
 ('Шақтар: Present Perfect Continuous', 'How long ___ you been learning English?', ['do', 'are', 'have', 'did'], 'C', 'How long … been + V-ing — Present Perfect Continuous: have you been learning.', 'Ағылшын тілін қанша уақыттан бері үйреніп жүрсің?'),
 ('Шақтар: Present Perfect Continuous', 'It ___ for three hours. The streets are wet.', ['has been raining', 'rains', 'was raining', 'is rained'], 'A', 'for three hours + қазір де жалғасуда — has been raining.', 'Үш сағаттан бері жаңбыр жауып тұр. Көшелер су.'),
 ('Шақтар: Past Simple', 'We ___ to the museum last Sunday.', ['go', 'went', 'have gone', 'were going'], 'B', 'last Sunday — Past Simple: V2 (went).', 'Біз өткен жексенбіде мұражайға бардық.'),
 ('Шақтар: Past Simple', '___ you see the film yesterday?', ['Do', 'Did', 'Have', 'Were'], 'B', 'yesterday — Past Simple сұрағы: Did + S + V1.', 'Кеше фильмді көрдің бе?'),
 ('Шақтар: Past Simple', 'Mozart ___ in 1756.', ['is born', 'was born', 'has born', 'born'], 'B', 'Нақты өткен жыл — Past Simple, ырықсыз етіс: was born.', 'Моцарт 1756 жылы дүниеге келген.'),
 ('Шақтар: Past Continuous', 'I ___ a shower when the phone rang.', ['had', 'was having', 'have had', 'am having'], 'B', 'Ұзаққа созылған әрекетті қысқа әрекет бөлді (when the phone rang) — was + V-ing.', 'Телефон шырылдағанда мен душқа түсіп жатқанмын.'),
 ('Шақтар: Past Continuous', 'At 8 o\'clock yesterday evening we ___ dinner.', ['had', 'were having', 'have', 'are having'], 'B', 'Өткендегі нақты сәт (at 8 yesterday) — was/were + V-ing.', 'Кеше кешкі сағат сегізде біз кешкі ас ішіп отырғанбыз.'),
 ('Шақтар: Past Continuous', 'While she ___ , her brother was watching TV.', ['cooked', 'was cooking', 'has cooked', 'cooks'], 'B', 'while — қатар жүрген екі ұзақ әрекет: екеуі де Past Continuous.', 'Ол тамақ пісіріп жатқанда ағасы теледидар көріп отырды.'),
 ('Шақтар: Past Perfect', 'When we arrived, the film ___ .', ['already started', 'had already started', 'has already started', 'already starts'], 'B', 'Өткендегі басқа әрекеттен (arrived) бұрын болған — had + V3.', 'Біз келгенде фильм басталып кеткен еді.'),
 ('Шақтар: Past Perfect', 'She said she ___ the book before.', ['reads', 'has read', 'had read', 'was reading'], 'C', 'Төлеу сөзде Present Perfect → Past Perfect: had read.', 'Ол кітапты бұрын оқығанын айтты.'),
 ('Шақтар: Past Perfect', 'By the time the police came, the thief ___ .', ['escaped', 'had escaped', 'has escaped', 'escapes'], 'B', 'by the time + Past Simple — алдыңғы әрекет Past Perfect.', 'Полиция келгенше ұры қашып үлгерген еді.'),
 ('Шақтар: Past Perfect Continuous', 'They ___ for an hour before the bus came.', ['waited', 'had been waiting', 'have been waiting', 'were waited'], 'B', 'for an hour + before (өткендегі сәтке дейін созылған) — had been + V-ing.', 'Автобус келгенге дейін олар бір сағат күтті.'),
 ('Шақтар: Past Perfect Continuous', 'Her eyes were red because she ___ .', ['cried', 'had been crying', 'has cried', 'cries'], 'B', 'Өткендегі нәтиженің себебі — созылған әрекет: had been crying.', 'Көздері қызарып кеткен еді, себебі ол жылап отырған еді.'),
 ('Шақтар: Past Perfect Continuous', 'He ___ there for ten years when he got promoted.', ['has been working', 'had been working', 'works', 'is working'], 'B', 'for ten years + өткендегі сәт (when he got promoted) — had been working.', 'Ол лауазымы көтерілгенге дейін ол жерде он жыл жұмыс істеген еді.'),
 ('Шақтар: Future Simple', 'I think it ___ tomorrow.', ['rains', 'will rain', 'rained', 'is raining'], 'B', 'I think + болашақ болжам — will + V1.', 'Меніңше, ертең жаңбыр жауады.'),
 ('Шақтар: Future Simple', '"The phone is ringing." — "I ___ it."', ['answer', 'will answer', 'am answering', 'answered'], 'B', 'Дәл қазір қабылданған шешім — will.', '«Телефон шырылдап тұр». — «Мен көтерейін».'),
 ('Шақтар: Future Simple', 'Look at those clouds! It ___ rain.', ['will', 'is going to', 'rains', 'has'], 'B', 'Белгісі көрініп тұрған болжам — be going to.', 'Анау бұлттарға қара! Жаңбыр жауғалы тұр.'),
 ('Шақтар: Future Continuous', 'This time tomorrow I ___ on the beach.', ['lie', 'will lie', 'will be lying', 'am lying'], 'C', 'this time tomorrow — болашақтағы сәтте жүріп жатқан әрекет: will be + V-ing.', 'Ертең дәл осы уақытта мен жағажайда жатқан боламын.'),
 ('Шақтар: Future Continuous', 'At 10 a.m. on Monday she ___ the exam.', ['will be taking', 'takes', 'has taken', 'took'], 'A', 'Болашақтағы нақты сәт — will be + V-ing.', 'Дүйсенбі күні таңғы сағат онда ол емтихан тапсырып отырған болады.'),
 ('Шақтар: Future Continuous', '___ you be using the car tonight?', ['Do', 'Will', 'Are', 'Have'], 'B', 'Future Continuous сұрағы: Will + S + be + V-ing.', 'Бүгін кешке көлікті пайдаланатын боласың ба?'),
 ('Шақтар: Future Perfect', 'By 6 p.m. I ___ the report.', ['will finish', 'will have finished', 'finish', 'have finished'], 'B', 'by 6 p.m. — сол сәтке дейін аяқталады: will have + V3.', 'Кешкі сағат алтыға дейін мен баяндаманы бітіріп қойған боламын.'),
 ('Шақтар: Future Perfect', 'By next year they ___ the bridge.', ['will build', 'will have built', 'are building', 'built'], 'B', 'by next year — will have + V3.', 'Келесі жылға қарай олар көпірді салып бітірген болады.'),
 ('Шақтар: Future Perfect', 'Will you ___ dinner by the time I come?', ['cook', 'have cooked', 'be cook', 'cooked'], 'B', 'by the time I come — Future Perfect: will you have cooked.', 'Мен келгенше кешкі асты әзірлеп қоясың ба?'),
 ('Шақтар: Future Perfect Continuous', 'By June I ___ here for five years.', ['will work', 'will be working', 'will have been working', 'work'], 'C', 'by June + for five years — will have been + V-ing.', 'Маусымға қарай мен мұнда бес жыл жұмыс істеген боламын.'),
 ('Шақтар: Future Perfect Continuous', 'By the time you arrive, I ___ for two hours.', ['will have been waiting', 'will wait', 'waited', 'have waited'], 'A', 'by the time + ұзақтық (for two hours) — will have been waiting.', 'Сен келгенше мен екі сағат күтіп отырған боламын.'),
 ('Шақтар: Future Perfect Continuous', 'Choose the Future Perfect Continuous form.', ['She will be studying.', 'She will have studied.', 'She will have been studying.', 'She has been studying.'], 'C', 'Future Perfect Continuous формуласы: will have been + V-ing.', 'Future Perfect Continuous формасын таңдаңыз.'),
]
V97 = [
 ('Ырықсыз етіс (Passive voice)', 'The letter ___ yesterday.', ['sent', 'was sent', 'is sent', 'has sent'], 'B', 'yesterday + ырықсыз: was + V3.', 'Хат кеше жіберілді.'),
 ('Ырықсыз етіс (Passive voice)', 'English ___ all over the world.', ['speaks', 'is spoken', 'is speaking', 'spoke'], 'B', 'Жалпы факт, ырықсыз — Present Simple Passive: is + V3.', 'Ағылшын тілінде бүкіл әлемде сөйлейді.'),
 ('Ырықсыз етіс (Passive voice)', 'The room ___ at the moment.', ['is cleaned', 'is being cleaned', 'has cleaned', 'cleans'], 'B', 'at the moment + ырықсыз: is being + V3.', 'Бөлме қазір жиналып жатыр.'),
 ('Ырықсыз етіс (Passive voice)', 'This work must ___ today.', ['do', 'be done', 'been done', 'doing'], 'B', 'Модальмен ырықсыз етіс: must + be + V3.', 'Бұл жұмыс бүгін орындалуы керек.'),
 ('Инфинитив (Infinitive)', 'I came here ___ English.', ['study', 'to study', 'studying', 'studied'], 'B', 'Мақсат инфинитиві: to + V1 (= in order to).', 'Мен мұнда ағылшын тілін оқу үшін келдім.'),
 ('Инфинитив (Infinitive)', 'My parents made me ___ my room.', ['to clean', 'clean', 'cleaning', 'cleaned'], 'B', 'make + адам + V1 (to-сыз).', 'Ата-анам маған бөлмемді жинатты.'),
 ('Инфинитив (Infinitive)', 'He is too young ___ a car.', ['drive', 'to drive', 'driving', 'drives'], 'B', 'too + сын есім + to V1.', 'Ол көлік жүргізуге тым жас.'),
 ('Инфинитив (Infinitive)', 'She seems ___ the answer.', ['know', 'to know', 'knowing', 'knows'], 'B', 'seem + to V1.', 'Ол жауабын білетін сияқты.'),
 ('Герундий (Gerund)', 'I enjoy ___ books in the evening.', ['read', 'to read', 'reading', 'reads'], 'C', 'enjoy + V-ing.', 'Мен кешке кітап оқығанды ұнатамын.'),
 ('Герундий (Gerund)', '___ is good for your health.', ['Swim', 'Swimming', 'To swimming', 'Swims'], 'B', 'Сөйлем басында бастауыш қызметінде — герундий.', 'Жүзу денсаулыққа пайдалы.'),
 ('Герундий (Gerund)', 'She is interested in ___ languages.', ['learn', 'to learn', 'learning', 'learned'], 'C', 'Предлогтан (in) кейін — V-ing.', 'Ол тіл үйренуге қызығады.'),
 ('Герундий (Gerund)', 'I remember ___ him at the party last year.', ['to meet', 'meeting', 'meet', 'met'], 'B', 'remember + V-ing — бұрын болғанды есте сақтау.', 'Оны былтыр кеште кездестіргенім есімде.'),
 ('Есімше (Participle)', 'The film was very ___ . I almost fell asleep.', ['bored', 'boring', 'bore', 'bores'], 'B', '-ing сын есім — заттың сипаты (жалықтыратын).', 'Фильм өте іш пыстырарлық болды. Ұйықтап кете жаздадым.'),
 ('Есімше (Participle)', 'I was ___ by the news.', ['surprising', 'surprised', 'surprise', 'surprises'], 'B', '-ed сын есім — адамның сезімі (таң қалған).', 'Мен бұл жаңалыққа таң қалдым.'),
 ('Есімше (Participle)', 'Who is the woman ___ to your father?', ['talked', 'talking', 'talks', 'to talking'], 'B', 'Present Participle анықтауыш: the woman (who is) talking.', 'Әкеңмен сөйлесіп тұрған әйел кім?'),
 ('Үстеу: функциялары (Adverb)', 'She sings ___ .', ['beautiful', 'beautifully', 'beauty', 'beautify'], 'B', 'Етістікті анықтайды — үстеу (-ly).', 'Ол әдемі ән айтады.'),
 ('Үстеу: функциялары (Adverb)', 'He speaks English very ___ .', ['good', 'well', 'better', 'goodly'], 'B', 'good сын есімінің үстеуі — well.', 'Ол ағылшынша өте жақсы сөйлейді.'),
 ('Үстеу: функциялары (Adverb)', 'I can ___ hear you. Please speak louder.', ['hard', 'hardly', 'harder', 'hardy'], 'B', 'hardly — «әрең». hard — «қатты, ауыр».', 'Сені әрең естіп тұрмын. Қаттырақ сөйлеші.'),
 ('Үстеудің орны (Place of adverb)', 'Choose the correct sentence.', ['He is always late.', 'He always is late.', 'Always he late is.', 'He is late always always.'], 'A', 'Жиілік үстеуі be-ден кейін тұрады.', 'Ол әрқашан кешігеді.'),
 ('Үстеудің орны (Place of adverb)', 'Choose the correct sentence.', ['She usually gets up at 7.', 'She gets usually up at 7.', 'Usually she get up at 7.', 'She gets up usually at 7 always.'], 'A', 'Жиілік үстеуі негізгі етістіктің алдында тұрады.', 'Ол әдетте сағат жетіде тұрады.'),
 ('Үстеудің орны (Place of adverb)', 'Choose the correct word order.', ['She sang at the concert beautifully last night.', 'She sang beautifully at the concert last night.', 'She last night sang beautifully at the concert.', 'Beautifully she sang last night at the concert.'], 'B', 'Реті: қимыл-сын → мекен → уақыт (Manner–Place–Time).', 'Ол кеше кешке концертте әдемі ән айтты.'),
 ('Предлогтар (Prepositions)', 'It depends ___ the weather.', ['of', 'on', 'from', 'at'], 'B', 'depend on — тұрақты тіркес.', 'Бұл ауа райына байланысты.'),
 ('Предлогтар (Prepositions)', 'She is good ___ mathematics.', ['in', 'at', 'on', 'for'], 'B', 'be good at — тұрақты тіркес.', 'Ол математиканы жақсы біледі.'),
 ('Предлогтар (Prepositions)', 'I am looking forward ___ you.', ['to see', 'to seeing', 'for seeing', 'seeing'], 'B', 'look forward to + V-ing (to — предлог).', 'Сені көруді асыға күтемін.'),
 ('Предлогтар: уақыт пен мекен', 'My birthday is ___ May.', ['on', 'in', 'at', 'by'], 'B', 'Ай атауы алдында — in.', 'Менің туған күнім мамыр айында.'),
 ('Предлогтар: уақыт пен мекен', 'The lesson starts ___ 9 o\'clock ___ Monday.', ['at / on', 'in / on', 'on / at', 'at / in'], 'A', 'Сағат — at, апта күні — on.', 'Сабақ дүйсенбі күні сағат тоғызда басталады.'),
 ('Предлогтар: уақыт пен мекен', 'The keys are ___ the table.', ['in', 'on', 'at', 'by'], 'B', 'Бетінде — on.', 'Кілттер үстелдің үстінде.'),
 ('Предлогтар: уақыт пен мекен', 'I will wait for you ___ the bus stop.', ['in', 'on', 'at', 'into'], 'C', 'Нақты нүкте — at: at the bus stop.', 'Мен сені аялдамада күтемін.'),
 ('Рай (Mood)', 'Which sentence is in the Imperative Mood?', ['She closes the door.', 'Close the door, please.', 'If I closed the door …', 'I wish the door were closed.'], 'B', 'Бұйрық рай — етістіктің бастапқы түрімен басталатын бұйрық/өтініш.', 'Қай сөйлем бұйрық райда тұр?'),
 ('Рай (Mood)', 'It is essential that he ___ on time.', ['is', 'be', 'was', 'will be'], 'B', 'Present Subjunctive: essential/important that + S + V1 (be).', 'Оның уақытында келуі өте маңызды.'),
 ('Рай (Mood)', 'I suggest that she ___ for the exam.', ['studies', 'study', 'studied', 'will study'], 'B', 'suggest that + S + V1 (-s жоқ) — Subjunctive.', 'Мен оған емтиханға дайындалуды ұсынамын.'),
 ('Рай (Mood)', 'I wish I ___ more free time.', ['have', 'had', 'will have', 'am having'], 'B', 'wish + Past — қазіргіге өкіну.', 'Бос уақытым көбірек болса ғой.'),
 ('Шартты сөйлемдер (Conditionals)', 'If you heat water to 100°C, it ___ .', ['boils', 'will boil', 'would boil', 'boiled'], 'A', 'Zero conditional — жалпы шындық: If + Present, Present.', 'Суды 100°C-қа дейін қыздырсаң, ол қайнайды.'),
 ('Шартты сөйлемдер (Conditionals)', 'If it rains tomorrow, we ___ at home.', ['stay', 'will stay', 'would stay', 'stayed'], 'B', 'First conditional: If + Present, will + V1.', 'Ертең жаңбыр жауса, үйде қаламыз.'),
 ('Шартты сөйлемдер (Conditionals)', 'If I ___ you, I would accept the offer.', ['am', 'was', 'were', 'be'], 'C', 'Second conditional: If I were you …', 'Сенің орныңда болсам, ұсынысты қабылдар едім.'),
 ('Шартты сөйлемдер (Conditionals)', 'If she had studied harder, she ___ the exam.', ['would pass', 'will pass', 'would have passed', 'passed'], 'C', 'Third conditional: If + had V3, would have V3.', 'Егер ол көбірек оқығанда, емтиханнан өтер еді.'),
 ('Лексика: синоним, антоним', 'Choose the synonym of "to purchase".', ['to sell', 'to buy', 'to borrow', 'to lend'], 'B', 'purchase = buy (сатып алу).', '«To purchase» сөзінің синонимін таңдаңыз.'),
 ('Лексика: синоним, антоним', 'Choose the antonym of "ancient".', ['old', 'modern', 'historical', 'aged'], 'B', 'ancient (ежелгі) ↔ modern (заманауи).', '«Ancient» сөзінің антонимін таңдаңыз.'),
 ('Лексика: синоним, антоним', 'Choose the synonym of "crucial".', ['minor', 'essential', 'optional', 'useless'], 'B', 'crucial = essential = important (маңызды, шешуші).', '«Crucial» сөзінің синонимін таңдаңыз.'),
 ('Лексика: синоним, антоним', 'Choose the antonym of "rare".', ['scarce', 'frequent', 'uncommon', 'unusual'], 'B', 'rare (сирек) ↔ frequent (жиі).', '«Rare» сөзінің антонимін таңдаңыз.'),
 ('Модаль етістіктер (Modal verbs)', 'You ___ smoke here. It is forbidden.', ["don't have to", "mustn't", "needn't", "shouldn't have"], 'B', 'Тыйым — mustn\'t.', 'Мұнда темекі шегуге болмайды. Бұл тыйым салынған.'),
 ('Модаль етістіктер (Modal verbs)', 'You ___ come tomorrow. It is a holiday.', ["mustn't", "don't have to", "can't", "couldn't"], 'B', 'Міндетті емес — don\'t have to / needn\'t.', 'Ертең келудің қажеті жоқ. Ертең демалыс.'),
 ('Модаль етістіктер (Modal verbs)', 'He ___ be at home — the lights are on.', ['must', "can't", 'needn\'t', 'should not'], 'A', 'Логикалық сенімді болжам — must be.', 'Ол үйде болуы керек — шамдары жанып тұр.'),
 ('Модаль етістіктер (Modal verbs)', 'You look tired. You ___ go to bed early.', ['must not', 'should', 'can\'t', 'needn\'t'], 'B', 'Кеңес — should.', 'Шаршаған көрінесің. Ерте жатқаның жөн.'),
]

def build(key, title, variant, rows):
    qs = []
    for i, (tp, q, opts, c, ex, tr) in enumerate(rows):
        assert c in L[:len(opts)] and len(set(o.lower() for o in opts)) == len(opts), (key, i)
        qs.append({'id': '%s-%d' % (key, i + 1), 'n': i + 1, 'topic': tp, 'multi': False, 'correct': [c], 'q': q,
                   'opts': [{'l': L[j], 't': t} for j, t in enumerate(opts)], 'ex': 'Дұрыс жауап — %s) %s. %s' % (c, opts[L.index(c)], ex), 'tr': tr})
    d = {'key': key, 'variant': variant, 'subject': 'english', 'lang': 'kz', 'origLang': 'en', 'source': 'ai', 'title': title, 'questions': qs}
    open(os.path.join(ROOT, 'data/sets/%s.js' % key), 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
    return key

keys = [build('v96-english', 'Нұсқа 96 · Ағылшын: 12 шақ тесті', 96, V96),
        build('v97-english', 'Нұсқа 97 · Ағылшын: 12 грамматика тақырыбы', 97, V97)]
idx = os.path.join(ROOT, 'data/index.js'); s = open(idx, encoding='utf-8').read()
arr = json.loads(s[s.index('['):s.rindex(']') + 1]); arr = [a for a in arr if a not in keys] + keys
open(idx, 'w', encoding='utf-8').write('Shyn.setFiles(' + json.dumps(arr, ensure_ascii=False) + ');\n')
print(len(V96), len(V97))
