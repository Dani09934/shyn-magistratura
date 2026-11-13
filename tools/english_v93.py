"""Нұсқа 93 — Ағылшын: magistronline тренажерінде кездесетін, бірақ қорда аз грамматика түрлері (source: ai, сұрақтар өзіміздікі).
python3 tools/english_v93.py → data/sets/v93-english.js, data/index.js"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = 'ABCD'
Q = [
 ('Үстеудің орны', 'Choose the correct sentence.', ['She never is late for work.', 'She is never late for work.', 'Never she is late for work.', 'She is late never for work.'], 'B', 'Жиілік үстеуі (never, always, often, usually) to be етістігінен КЕЙІН тұрады: She is never late.'),
 ('Үстеудің орны', 'Choose the correct sentence.', ['He drinks often coffee in the morning.', 'He often drinks coffee in the morning.', 'He drinks coffee often in the morning always.', 'Often he drink coffee in the morning.'], 'B', 'Жиілік үстеуі негізгі етістіктен БҰРЫН тұрады: He often drinks.'),
 ('Үстеудің орны', 'Choose the correct sentence.', ['I can always rely on my parents.', 'I always can rely on my parents.', 'I can rely always on my parents.', 'Always I can rely on my parents.'], 'A', 'Модаль немесе көмекші етістік болса, үстеу оның КЕЙІН, негізгі етістіктің алдында тұрады: can always rely, have never seen.'),
 ('Үстеудің орны', 'Choose the correct sentence.', ['They have already finished the project.', 'They already have finished the project.', 'They have finished already the project.', 'Already they have the project finished.'], 'A', 'already Present Perfect-те have мен V3 арасында тұрады: have already finished. Сөйлем соңында тұруы да мүмкін, бірақ толықтауыш пен етістіктің арасында емес.'),
 ('Үстеудің орны', 'Choose the correct sentence.', ['She speaks very well English.', 'She speaks English very well.', 'She very well speaks English.', 'Very well she speaks English.'], 'B', 'Қимыл-сын үстеуі (well, carefully) толықтауыштан кейін келеді: speaks English well. Етістік пен толықтауышты ажыратпаймыз.'),
 ('Would rather / had better', 'It is going to rain. You ___ take an umbrella.', ['had better', 'would rather', 'had rather', 'would better'], 'A', 'had better + V (to-сыз) — «...ғаның жөн», кеңес немесе ескерту.'),
 ('Would rather / had better', 'I ___ stay at home than go to the party.', ['had better', 'would rather', 'prefer', 'would prefer'], 'B', 'would rather + V + than + V — «...ғанды артық көремін». prefer-ден кейін to/-ing керек (prefer staying to going).'),
 ('Would rather / had better', 'You ___ not tell anyone about it.', ['would better', 'had better', 'had better to', 'better had'], 'B', 'Болымсыз түрі: had better NOT + V. to қойылмайды.'),
 ('The first time', 'This is the first time I ___ sushi.', ['eat', 'ate', 'have eaten', 'am eating'], 'C', '«This is the first time ...» құрылымынан кейін Present Perfect: This is the first time I have eaten. Өткенде болса: It was the first time I had eaten.'),
 ('The first time', 'It was the first time she ___ abroad.', ['has been', 'had been', 'was', 'is'], 'B', 'Өткен шақтағы «It was the first time ...» — Past Perfect: had been.'),
 ('Either / neither', '"I don\'t like coffee." — "___ do I."', ['So', 'Neither', 'Either', 'Too'], 'B', 'Болымсыз сөйлемге келісу: Neither/Nor do I. Болымдыға: So do I.'),
 ('Either / neither', '"I can\'t swim." — "I can\'t ___."', ['too', 'neither', 'either', 'also'], 'C', 'Болымсыз сөйлемнің соңында either: I can\'t either. Болымдыда too: I can too.'),
 ('Either / neither', '___ of my two brothers lives in Almaty. They both live in Astana.', ['Either', 'Neither', 'Both', 'None'], 'B', 'Екі адамның ешқайсысы — neither. Үш және одан көп болса — none.'),
 ('So / such', 'It was ___ a beautiful day that we went to the lake.', ['so', 'such', 'too', 'very'], 'B', 'such + a + сын есім + зат есім: such a beautiful day. so + сын есім (жалғыз): so beautiful.'),
 ('So / such', 'The film was ___ boring that I fell asleep.', ['such', 'so', 'such a', 'too'], 'B', 'so + сын есім + that: so boring that.'),
 ('So / such', 'They have ___ much money that they don\'t know what to do with it.', ['such', 'so', 'such a', 'too'], 'B', 'much/many/little/few алдында тек so: so much money, so many people.'),
 ('Question tags', 'She is a doctor, ___?', ['is she', 'isn\'t she', 'doesn\'t she', 'wasn\'t she'], 'B', 'Болымды сөйлемге болымсыз «құйрық»: is → isn\'t she?'),
 ('Question tags', 'You don\'t like fish, ___?', ['don\'t you', 'do you', 'are you', 'aren\'t you'], 'B', 'Болымсыз сөйлемге болымды «құйрық»: don\'t → do you?'),
 ('Question tags', 'I am late, ___?', ['amn\'t I', 'aren\'t I', 'isn\'t I', 'don\'t I'], 'B', 'I am үшін ерекше түр: aren\'t I?'),
 ('Question tags', 'Let\'s go to the cinema, ___?', ['shall we', 'will we', 'don\'t we', 'let we'], 'A', 'Let\'s ... сөйлеміне — shall we?'),
 ('Шақтар: Future Continuous', 'This time tomorrow I ___ on the beach.', ['lie', 'will lie', 'will be lying', 'am lying'], 'C', 'Келешекте белгілі бір сәтте жүріп жатқан әрекет — Future Continuous: will be + V-ing. Белгісі: this time tomorrow, at 6 tomorrow.'),
 ('Шақтар: Future Continuous', '___ you ___ the car tonight? I want to borrow it.', ['Will / be using', 'Do / use', 'Are / used', 'Will / used'], 'A', 'Біреудің жоспары туралы сыпайы сұрау — Future Continuous: Will you be using…?'),
 ('Төл сөз / төлеу сөз', 'He said, "I am tired." → He said that he ___ tired.', ['is', 'was', 'has been', 'will be'], 'B', 'Төлеу сөзде шақ бір саты артқа: am → was.'),
 ('Төл сөз / төлеу сөз', 'She said, "I will call you tomorrow." → She said that she ___ me the next day.', ['will call', 'would call', 'called', 'calls'], 'B', 'will → would, tomorrow → the next day.'),
 ('Төл сөз / төлеу сөз', '"Where do you live?" he asked. → He asked me where ___.', ['do I live', 'I lived', 'did I live', 'I live'], 'B', 'Жанама сұрақта сөз тәртібі хабарлы сөйлемдегідей (бастауыш + баяндауыш), шақ артқа жылжиды: where I lived.'),
 ('Төл сөз / төлеу сөз', '"Don\'t open the window," she told me. → She told me ___ the window.', ['not open', 'not to open', 'don\'t open', 'to not opening'], 'B', 'Бұйрықты төлеу сөзде: told somebody (not) to + V.'),
 ('Шақтар: used to', 'When I was a child, I ___ play football every day.', ['use to', 'used to', 'was used to', 'am used to'], 'B', 'used to + V — бұрынғы әдет (қазір жоқ).'),
 ('Шақтар: used to', 'I have lived in the city for years, so I ___ the noise.', ['used to', 'am used to', 'use to', 'used'], 'B', 'be used to + зат есім/V-ing — «үйреніп кеткенмін». used to + V — бұрынғы әдет.'),
 ('Шақтар: used to', 'Did you ___ live in Shymkent?', ['used to', 'use to', 'using to', 'be used to'], 'B', 'Сұраулы және болымсызда did бар болғандықтан: Did you use to…? / I didn\'t use to…'),
 ('Предлогтан кейін -ing', 'I\'m looking forward to ___ you.', ['see', 'seeing', 'saw', 'be seen'], 'B', 'look forward TO — мұндағы to — предлог, сондықтан -ing: looking forward to seeing.'),
 ('Предлогтан кейін -ing', 'She left without ___ goodbye.', ['say', 'to say', 'saying', 'said'], 'C', 'Предлогтан (without, before, after, instead of, by) кейін етістік -ing түрінде.'),
 ('Предлогтан кейін -ing', 'He is interested ___ computer games.', ['in to play', 'in playing', 'on playing', 'for play'], 'B', 'be interested IN + -ing.'),
 ('Етістік + to / -ing', 'I remember ___ the door, I\'m sure it\'s locked.', ['to lock', 'locking', 'lock', 'locked'], 'B', 'remember + -ing — бұрын істегенін есіне алу. remember + to — істеуді ұмытпау (болашақ).'),
 ('Етістік + to / -ing', 'Please remember ___ the lights when you leave.', ['turning off', 'to turn off', 'turn off', 'turned off'], 'B', 'Болашақта істеу керек әрекет — remember to + V.'),
 ('Етістік + to / -ing', 'He stopped ___ because it was bad for his health.', ['to smoke', 'smoking', 'smoke', 'smoked'], 'B', 'stop + -ing — әрекетті тоқтату. stop + to — бір нәрсе істеу үшін тоқтау.'),
 ('Етістік + to / -ing', 'I tried ___ the window, but it was stuck.', ['open', 'to open', 'opened', 'opens'], 'B', 'try + to — тырысу (қиын әрекет). try + -ing — байқап көру (тәжірибе ретінде).'),
 ('Тәуелдік септік', '___ room is on the second floor. (two boys share it)', ["The boy's", "The boys'", "The boys's", "The boy'"], 'B', 'Көпше -s-пен аяқталса, тек апостроф: the boys\' room. Жекеше: the boy\'s room. Ерекше көпше: the children\'s toys.'),
 ('Тәуелдік септік', 'This is ___ car.', ["my parent's", "my parents'", "my parents's", "my parent'"], 'B', 'Екі ата-ана — көпше parents, сондықтан parents\'.'),
 ('Шақтар: Past Perfect Continuous', 'She was tired because she ___ all day.', ['worked', 'has been working', 'had been working', 'was worked'], 'C', 'Өткендегі бір сәтке дейін ұзақ жалғасқан әрекет (нәтижесі — шаршау) — Past Perfect Continuous: had been + V-ing.'),
 ('Шақтар: Past Perfect Continuous', 'When I arrived, they ___ for two hours.', ['waited', 'had been waiting', 'have been waiting', 'were waited'], 'B', 'for two hours + өткендегі сәтке дейін (when I arrived) — had been waiting.'),
 ('Шақтар: Future Perfect', 'By the end of this year, I ___ my degree.', ['will finish', 'will have finished', 'finish', 'am finishing'], 'B', 'by + келешектегі уақыт — сол сәтке дейін аяқталатын әрекет: will have + V3.'),
 ('Шақтар: Future Perfect Continuous', 'By June, she ___ here for ten years.', ['will work', 'will be working', 'will have been working', 'works'], 'C', 'by + келешек уақыт + ұзақтық (for ten years) — will have been + V-ing.'),
 ('Сұрау есімдіктері', '___ did you give the book to? (ресми стиль: To ___ did you give the book?)', ['Who / whom', 'Whose / who', 'Which / whose', 'What / which'], 'A', 'Ауызекі сұрақта who, ал предлогтан кейін ресми түрде whom: To whom did you give it?'),
 ('Сұрау есімдіктері', '___ bag is this? — It\'s Aida\'s.', ['Who', 'Whom', 'Whose', 'Which'], 'C', 'Тәуелділікті сұрау — whose: Whose bag is this?'),
 ('Сұрау есімдіктері', '___ do you prefer, tea or coffee?', ['What', 'Which', 'Who', 'Whose'], 'B', 'Шектеулі таңдаудан (tea or coffee) — which. Шексіз таңдау — what.'),
 ('Есімше (Participle)', '___ the letter, she went to the post office.', ['Wrote', 'Having written', 'Have written', 'Written'], 'B', 'Бір әрекет екіншісінен бұрын аяқталса — Perfect Participle: Having + V3.'),
 ('Есімше (Participle)', 'The boy ___ near the window is my brother.', ['stood', 'standing', 'stands', 'is standing'], 'B', 'Present Participle (V-ing) анықтауыш қызметінде: the boy standing near the window = the boy who is standing.'),
 ('Есімше (Participle)', 'The window ___ by the storm was repaired.', ['breaking', 'broke', 'broken', 'having broke'], 'C', 'Ырықсыз мағынадағы анықтауыш — Past Participle (V3): the window broken by the storm = which was broken.'),
 ('Лексика: синоним, антоним', 'Choose the synonym of "huge".', ['tiny', 'enormous', 'narrow', 'weak'], 'B', 'huge — өте үлкен; синонимі enormous (immense, vast). tiny — антоним.'),
 ('Лексика: синоним, антоним', 'Choose the antonym of "generous".', ['kind', 'mean', 'rich', 'polite'], 'B', 'generous — жомарт; антонимі mean (stingy) — сараң.'),
 ('Лексика: синоним, антоним', 'Choose the synonym of "to begin".', ['to finish', 'to commence', 'to delay', 'to stop'], 'B', 'begin = start = commence (ресми).'),
]
qs = []
for i, (tp, q, opts, c, ex) in enumerate(Q):
    assert c in L[:len(opts)] and len(set(o.lower() for o in opts)) == len(opts), i
    qs.append({'id': 'v93-english-%d' % (i + 1), 'n': i + 1, 'topic': tp, 'multi': False, 'correct': [c], 'q': q,
               'opts': [{'l': L[j], 't': t} for j, t in enumerate(opts)], 'ex': 'Дұрыс жауап — %s) %s. %s' % (c, opts[L.index(c)], ex)})
d = {'key': 'v93-english', 'variant': 93, 'subject': 'english', 'lang': 'kz', 'origLang': 'en', 'source': 'ai',
     'title': 'Нұсқа 93 · Ағылшын: тренажерде жиі, қорда сирек грамматика', 'questions': qs}
open(os.path.join(ROOT, 'data/sets/v93-english.js'), 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
idx = os.path.join(ROOT, 'data/index.js'); s = open(idx, encoding='utf-8').read()
arr = json.loads(s[s.index('['):s.rindex(']') + 1]); arr = [a for a in arr if a != 'v93-english'] + ['v93-english']
open(idx, 'w', encoding='utf-8').write('Shyn.setFiles(' + json.dumps(arr, ensure_ascii=False) + ');\n')
print('v93', len(qs))
