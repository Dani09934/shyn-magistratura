"""Карточкалар 3: 12 шақ (формула, белгі → шақ), бұрыс етістіктер, gerund/infinitive, синонимдер (етістік/сын есім + сөздік),
subjunctive, ағылшын грамматика тақырыптары, алгоритм / ДҚ / ТГО кілттік терминдері.
python3 tools/cards3.py → data/flashcards3.js"""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cards = []


# ---------- мысалдардың аудармасы (12 шақтан басқа карточкалар) ----------
TR = {
 'The room is cleaned every day.': 'Бөлме күн сайын жиналады.', 'The room is being cleaned now.': 'Бөлме қазір жиналып жатыр.',
 'The room has been cleaned.': 'Бөлме жиналып қойылды.', 'The house was built in 1990.': 'Үй 1990 жылы салынған.',
 'The car was being repaired.': 'Көлік жөнделіп жатқан еді.', 'The work had been done before noon.': 'Жұмыс түске дейін орындалып қойған еді.',
 'The letter will be sent tomorrow.': 'Хат ертең жіберіледі.', 'It will have been finished by Monday.': 'Ол дүйсенбіге дейін аяқталып қойған болады.',
 'It must be done today.': 'Ол бүгін орындалуы керек.', 'The book was written by Abai.': 'Кітапты Абай жазған.',
 'Mozart was born in 1756.': 'Моцарт 1756 жылы туған.', "Do it! Don't be late! Let's go.": 'Істе! Кешікпе! Кеттік.',
 'If I were you …': 'Мен сенің орныңда болсам …', 'I wish she were here.': 'Ол осында болса ғой.', "It's essential that he be on time.": 'Оның уақытында келуі өте маңызды.',
 'I suggest that she study.': 'Мен оған оқуды ұсынамын.', "It's essential that he be here.": 'Оның осында болуы өте маңызды.',
 'If I were you, I would apologize.': 'Сенің орныңда болсам, кешірім сұрар едім.', 'I wish she were more understanding.': 'Ол түсіністігірек болса ғой.',
 'He speaks as if he knew everything.': 'Ол бәрін білетіндей сөйлейді.', 'I wish I knew.': 'Білсем ғой.', 'I wish I had studied.': 'Оқып алғанымда ғой.',
 'I wish you would stop.': 'Тоқтасаңшы.', 'If you heat ice, it melts.': 'Мұзды қыздырсаң, ол ериді.',
 'If it rains, we will stay home.': 'Жаңбыр жауса, үйде қаламыз.', 'If I were rich, I would travel.': 'Бай болсам, саяхаттар едім.',
 'If I had studied, I would have passed.': 'Оқығанымда, тапсырар едім.', "If I had slept, I wouldn't be tired now.": 'Ұйықтағанымда, қазір шаршамас едім.',
 'Unless you hurry, you will be late.': 'Асықпасаң, кешігесің.', 'He must be at home.': 'Ол үйде болуы керек.',
 'You should see a doctor.': 'Дәрігерге қаралуың керек.', "You needn't come.": 'Келудің қажеті жоқ.', "It can't be true.": 'Бұл шын болуы мүмкін емес.',
 'He must have left.': 'Ол кетіп қалған болуы керек.', 'You should have told me.': 'Маған айтуың керек еді.', 'I will be able to come.': 'Мен келе аламын.',
 'I came here to study.': 'Мен мұнда оқу үшін келдім.', 'Swimming is good.': 'Жүзу пайдалы.', 'I like reading.': 'Мен кітап оқығанды ұнатамын.',
 'Smoking is harmful.': 'Темекі шегу зиянды.', 'a crying baby': 'жылап жатқан бала', 'the man standing there.': 'анда тұрған адам.',
 'a broken window': 'сынған терезе', 'a letter written in English.': 'ағылшынша жазылған хат.',
 'Having finished the work, he went home.': 'Жұмысты бітіріп, ол үйге кетті.', 'She always gets up early.': 'Ол әрқашан ерте тұрады.',
 'He is never late.': 'Ол ешқашан кешікпейді.', 'I have never seen it.': 'Мен оны ешқашан көрген емеспін.',
 'She sang beautifully at the concert last night.': 'Ол кеше кешке концертте әдемі ән салды.', 'It started to rain = It started raining.': 'Жаңбыр жауа бастады.',
 'They made me wait.': 'Олар мені күттірді.', 'Let me go.': 'Мені жібер.', 'Help me (to) carry it.': 'Оны көтеруге көмектес.',
 'speaks quickly, very good, too fast.': 'тез сөйлейді, өте жақсы, тым жылдам.', 'big = large, huge.': 'үлкен.', 'begin ↔ end, generous ↔ mean.': 'бастау ↔ аяқтау, жомарт ↔ сараң.',
}
TR = {k: v for k, v in TR.items() if v}

def trx(text):
    for en in sorted(TR, key=len, reverse=True):
        i = text.find(en)
        if i >= 0 and not text[i + len(en):].startswith(' — '):
            text = text[:i + len(en)] + ' — ' + TR[en] + text[i + len(en):]
    return text

def add(subject, topic, front, back, en=None):
    if subject == 'english' and not topic.startswith('12 шақ'):
        back = trx(back)
    c = {'id': 'fc3-%d' % (len(cards) + 1), 'subject': subject, 'topic': topic, 'front': front, 'back': back}
    if en: c['say'] = en
    cards.append(c)

# ---------- 12 шақ: формула ----------
T = [
 ('Present Simple', 'I / You / We / They + V1\nHe / She / It + V1-s (es)\n\nТеріс: don\'t / doesn\'t + V1\nСұрақ: Do / Does + S + V1?\n\nБелгі: always, usually, often, every day, sometimes, never\nМысал: She works every day. — Ол күн сайын жұмыс істейді.'),
 ('Present Continuous', 'I am + V-ing\nHe / She / It is + V-ing\nYou / We / They are + V-ing\n\nТеріс: am not / isn\'t / aren\'t + V-ing\nСұрақ: Am / Is / Are + S + V-ing?\n\nБелгі: now, right now, at the moment, Look!, Listen!\nМысал: They are reading now. — Олар қазір оқып отыр.'),
 ('Present Perfect', 'I / You / We / They + have + V3\nHe / She / It + has + V3\n\nТеріс: haven\'t / hasn\'t + V3\nСұрақ: Have / Has + S + V3?\n\nБелгі: already, yet, just, ever, never, since, for, so far, recently\nМысал: I have already finished. — Мен бітіріп қойдым.'),
 ('Present Perfect Continuous', 'I / You / We / They + have been + V-ing\nHe / She / It + has been + V-ing\n\nБелгі: for 2 hours, since morning, all day, how long\nӘрекет өткенде басталып, әлі жалғасып жатыр.\nМысал: She has been waiting for two hours. — Ол екі сағаттан бері күтіп отыр.'),
 ('Past Simple', 'S + V2 (V-ed)\n\nТеріс: didn\'t + V1\nСұрақ: Did + S + V1?\n\nБелгі: yesterday, ago, last week, in 2010, when I was a child\nМысал: We went to the zoo yesterday. — Біз кеше хайуанаттар бағына бардық.'),
 ('Past Continuous', 'I / He / She / It + was + V-ing\nYou / We / They + were + V-ing\n\nБелгі: at 5 o\'clock yesterday, while, when + Past Simple, all evening\nМысал: I was sleeping when he called. — Ол қоңырау шалғанда мен ұйықтап жатқанмын.'),
 ('Past Perfect', 'S + had + V3 (барлық жақта)\n\nӨткендегі басқа әрекеттен БҰРЫН болған әрекет.\nБелгі: before, after, by the time, already, when (екінші әрекет Past Simple)\nМысал: The film had started when we arrived. — Біз келгенде фильм басталып кеткен еді.'),
 ('Past Perfect Continuous', 'S + had been + V-ing\n\nӨткендегі бір сәтке дейін біраз уақыт жалғасқан әрекет.\nБелгі: for, since, before, how long\nМысал: He had been working for 3 hours before she came. — Ол келгенге дейін ол 3 сағат жұмыс істеген еді.'),
 ('Future Simple', 'S + will + V1\n\nТеріс: won\'t + V1\nСұрақ: Will + S + V1?\n\nБелгі: tomorrow, next week, soon, I think, probably, in 2030\nШешім дәл қазір қабылданады, болжам.\nМысал: You will pass the exam. — Сен емтиханды тапсырасың.'),
 ('Future Continuous', 'S + will be + V-ing\n\nБолашақтағы нақты сәтте жүріп жатқан әрекет.\nБелгі: at this time tomorrow, at 5 o\'clock tomorrow, all day tomorrow\nМысал: They will be visiting the zoo at noon. — Түсте олар хайуанаттар бағын аралап жүрген болады.'),
 ('Future Perfect', 'S + will have + V3\n\nБолашақтағы бір сәтке дейін аяқталатын әрекет.\nБелгі: by tomorrow, by Friday, by 2030, by the time\nМысал: I will have finished my homework by 6. — Сағат алтыға дейін үй жұмысын бітіріп қойған боламын.'),
 ('Future Perfect Continuous', 'S + will have been + V-ing\n\nБолашақтағы бір сәтке дейін біраз уақыт жалғасатын әрекет.\nБелгі: for … by …, since\nМысал: By June, I will have been working here for 10 years. — Маусымға қарай мен мұнда 10 жыл жұмыс істеген боламын.'),
]
for name, back in T:
    add('english', '12 шақ: формулалар', name, back, en=name)

# ---------- белгі → шақ ----------
M = [
 ('always, usually, often, every day', 'Present Simple'), ('now, at the moment, Look!, Listen!', 'Present Continuous'),
 ('already, yet, just, ever, never, so far', 'Present Perfect'), ('for 2 hours, since morning, all day (әлі жалғасуда)', 'Present Perfect Continuous'),
 ('yesterday, ago, last year, in 2010', 'Past Simple'), ('at 5 o\'clock yesterday, while, when he came', 'Past Continuous'),
 ('before, after, by the time (өткенде, бұрынырақ)', 'Past Perfect'), ('had been … for 3 hours before …', 'Past Perfect Continuous'),
 ('tomorrow, next week, I think, probably', 'Future Simple'), ('at this time tomorrow', 'Future Continuous'),
 ('by tomorrow, by Friday, by 2030', 'Future Perfect'), ('By June I … for 10 years', 'Future Perfect Continuous'),
 ('Look at the clouds! It … rain. (белгісі көрініп тұр, жоспар)', 'be going to: It is going to rain.'),
]
for f, b in M:
    add('english', '12 шақ: белгі → шақ', 'Қай шақ?\n' + f, b)

# ---------- Passive барлық шақта ----------
P = [('Present Simple', 'am / is / are + V3', 'The room is cleaned every day.'), ('Present Continuous', 'am / is / are being + V3', 'The room is being cleaned now.'),
     ('Present Perfect', 'have / has been + V3', 'The room has been cleaned.'), ('Past Simple', 'was / were + V3', 'The house was built in 1990.'),
     ('Past Continuous', 'was / were being + V3', 'The car was being repaired.'), ('Past Perfect', 'had been + V3', 'The work had been done before noon.'),
     ('Future Simple', 'will be + V3', 'The letter will be sent tomorrow.'), ('Future Perfect', 'will have been + V3', 'It will have been finished by Monday.'),
     ('Модаль етістікпен', 'can / must / should + be + V3', 'It must be done today.')]
for t, f, ex in P:
    add('english', 'Passive voice', 'Passive: ' + t, f + '\nМысал: ' + ex)
add('english', 'Passive voice', 'Passive қашан қолданылады?', 'Іс-әрекетті кім жасағаны маңызды емес не белгісіз болғанда.\nФормула: be (шаққа сай) + V3.\nОрындаушы by арқылы: The book was written by Abai.')

# ---------- бұрыс етістіктер (PDF) ----------
IRR = """be was/were been болу|become became become болып шығу|begin began begun бастау|break broke broken сындыру|bring brought brought әкелу|build built built салу|buy bought bought сатып алу|catch caught caught ұстау|choose chose chosen таңдау|come came come келу|cost cost cost құны болу|cut cut cut кесу|do did done жасау|draw drew drawn сурет салу|drink drank drunk ішу|drive drove driven айдау|eat ate eaten жеу|fall fell fallen құлау|feel felt felt сезіну|find found found табу|fly flew flown ұшу|forget forgot forgotten ұмыту|get got got/gotten алу|give gave given беру|go went gone бару|grow grew grown өсу|have had had иелену|hear heard heard есту|hide hid hidden жасыру|hit hit hit соғу|hold held held ұстау|keep kept kept сақтау|know knew known білу|leave left left тастау, кету|lose lost lost жоғалту|make made made жасау|meet met met кездесу|pay paid paid төлеу|put put put қою|read read read оқу|ride rode ridden міну|run ran run жүгіру|say said said айту|see saw seen көру|sell sold sold сату|send sent sent жіберу|sing sang sung ән айту|sit sat sat отыру|sleep slept slept ұйықтау|speak spoke spoken сөйлеу|spend spent spent жұмсау|stand stood stood тұру|take took taken алу|teach taught taught үйрету|tell told told айту|think thought thought ойлау|understand understood understood түсіну|wear wore worn кию|write wrote written жазу|lead led led бастау, жетектеу|lend lent lent қарызға беру|let let let рұқсат ету|light lit lit жағу|mean meant meant білдіру|ring rang rung шылдырлау|rise rose risen көтерілу|set set set орнату|shake shook shaken сілку|shine shone shone жарқырау|shoot shot shot ату|show showed shown көрсету|shut shut shut жабу|sink sank sunk бату|swim swam swum жүзу|throw threw thrown лақтыру|wake woke woken ояну|win won won жеңу|bite bit bitten тістеу|blow blew blown үрлеу|burn burnt burnt жану|deal dealt dealt айналысу|dig dug dug қазу|feed fed fed тамақтандыру|fight fought fought төбелесу|forgive forgave forgiven кешіру|freeze froze frozen қату|hang hung hung ілу|hurt hurt hurt ауырту|lay laid laid қою, салу|lie lay lain жату|seek sought sought іздеу|steal stole stolen ұрлау|strike struck struck соғу|tear tore torn жырту"""
for row in IRR.split('|'):
    w = row.split(' ')
    v1, v2, v3, kz = w[0], w[1], w[2], ' '.join(w[3:])
    add('english', 'Бұрыс етістіктер (V1–V2–V3)', v1 + '\n(' + kz + ')', v1 + ' — ' + v2 + ' — ' + v3, en=v1 + ', ' + v2.replace('/', ', ') + ', ' + v3.replace('/', ', '))

# ---------- Gerund / Infinitive (PDF) ----------
GER = "abhor, acknowledge, admit, advise, allow, anticipate, appreciate, avoid, be worth, can't help, celebrate, confess, consider, defend, delay, detest, discontinue, discuss, dislike, dispute, dread, endure, enjoy, escape, evade, explain, fancy, fear, feel like, feign, finish, forgive, give up, keep, keep on, mention, mind, miss, necessitate, omit, permit, picture, postpone, practice, prevent, put off, recall, recollect, recommend, report, resent, resist, resume, risk, shirk, shun, suggest, support, tolerate, understand, urge, warrant"
INF = "agree, appear, arrange, ask, attempt, beg, can't afford, can't wait, care, chance, choose, claim, come, consent, dare, decide, demand, deserve, determine, elect, endeavor, expect, fail, get, grow up, guarantee, hesitate, hope, hurry, incline, learn, manage, mean, need, neglect, offer, pay, plan, prepare, pretend, profess, promise, prove, refuse, remain, request, resolve, say, seek, seem, shudder, strive, struggle, swear, tend, threaten, turn out, venture, volunteer, wait, want, wish, would like, yearn"
KZ = {'admit': 'мойындау', 'avoid': 'аулақ болу', 'consider': 'қарастыру', 'delay': 'кешіктіру', 'deny': 'теріске шығару', 'dislike': 'ұнатпау', 'enjoy': 'ләззат алу', 'finish': 'аяқтау',
      'give up': 'тастау', 'keep': 'жалғастыру', 'mind': 'қарсы болу', 'miss': 'сағыну, жіберіп алу', 'postpone': 'кейінге қалдыру', 'practice': 'жаттығу', 'risk': 'тәуекел ету', 'suggest': 'ұсыну',
      'can\'t help': 'өзін тоқтата алмау', 'feel like': 'бір нәрсе істегісі келу', 'be worth': 'тұрарлық', 'put off': 'кейінге қалдыру', 'resist': 'қарсы тұру', 'imagine': 'елестету',
      'agree': 'келісу', 'decide': 'шешу', 'hope': 'үміттену', 'plan': 'жоспарлау', 'promise': 'уәде беру', 'refuse': 'бас тарту', 'want': 'қалау', 'learn': 'үйрену', 'manage': 'үлгеру, қолынан келу',
      'offer': 'ұсыну', 'pretend': 'кейіп таныту', 'afford': 'шамасы жету', 'expect': 'күту', 'fail': 'істей алмау', 'seem': 'сияқты көріну', 'threaten': 'қорқыту', 'wish': 'тілеу', 'need': 'қажет ету',
      'can\'t afford': 'шамасы жетпеу', 'can\'t wait': 'асыға күту', 'attempt': 'әрекеттену', 'hesitate': 'тартыну', 'prepare': 'дайындалу', 'would like': 'қалар еді', 'ask': 'сұрау', 'choose': 'таңдау'}
KZ.update({'abhor': 'жек көру', 'acknowledge': 'мойындау', 'advise': 'кеңес беру', 'allow': 'рұқсат ету', 'anticipate': 'алдын ала күту', 'appreciate': 'бағалау, риза болу',
 'celebrate': 'тойлау', 'confess': 'мойындау', 'defend': 'қорғау', 'detest': 'жек көру', 'discontinue': 'тоқтату', 'discuss': 'талқылау', 'dispute': 'дауласу',
 'dread': 'қатты қорқу', 'endure': 'төзу', 'escape': 'құтылу', 'evade': 'жалтару', 'explain': 'түсіндіру', 'fancy': 'қалау, елестету', 'fear': 'қорқу',
 'feign': 'кейіп таныту', 'forgive': 'кешіру', 'keep on': 'жалғастыра беру', 'mention': 'атап өту', 'necessitate': 'қажет ету', 'omit': 'өткізіп жіберу',
 'permit': 'рұқсат ету', 'picture': 'елестету', 'prevent': 'алдын алу, кедергі болу', 'recall': 'еске түсіру', 'recollect': 'еске алу', 'recommend': 'ұсыну, кеңес беру',
 'report': 'хабарлау', 'resent': 'ренжу', 'resume': 'қайта жалғастыру', 'shirk': 'міндеттен жалтару', 'shun': 'аулақ жүру', 'support': 'қолдау', 'tolerate': 'төзу',
 'understand': 'түсіну', 'urge': 'шақыру, асықтыру', 'warrant': 'негіздеу, ақтау',
 'appear': 'болып көріну', 'arrange': 'ұйымдастыру, келісу', 'beg': 'жалыну', 'care': 'қалау, мән беру', 'chance': 'кездейсоқ болу', 'claim': 'мәлімдеу',
 'come': 'келу', 'consent': 'келісім беру', 'dare': 'батылы бару', 'demand': 'талап ету', 'deserve': 'лайық болу', 'determine': 'бел байлау', 'elect': 'шешу, таңдау',
 'endeavor': 'тырысу', 'get': 'мүмкіндік алу', 'grow up': 'өсіп-жетілу', 'guarantee': 'кепілдік беру', 'hurry': 'асығу', 'incline': 'бейім болу', 'mean': 'ниет ету',
 'neglect': 'елемеу', 'pay': 'төлеу', 'profess': 'мәлімдеу', 'prove': 'болып шығу', 'remain': 'қалу', 'request': 'өтіну', 'resolve': 'шешім қабылдау', 'say': 'айту',
 'seek': 'ұмтылу', 'shudder': 'шошу', 'strive': 'ұмтылу', 'struggle': 'тырмысу', 'swear': 'ант беру', 'tend': 'бейім болу', 'turn out': 'болып шығу',
 'venture': 'тәуекелге бару', 'volunteer': 'өз еркімен ұсыну', 'wait': 'күту', 'yearn': 'аңсау'})
for v in [x.strip() for x in GER.split(',')]:
    add('english', 'Gerund / Infinitive', v + (' (' + KZ[v] + ')' if v in KZ else '') + '\n+ ?', v + ' + V-ing (gerund)\nМысал: He ' + ('avoids' if v == 'avoid' else v) + ' doing it.' if False else v + ' + V-ing (gerund)\nМысалы: I ' + v + ' doing …')
for v in [x.strip() for x in INF.split(',')]:
    add('english', 'Gerund / Infinitive', v + (' (' + KZ[v] + ')' if v in KZ else '') + '\n+ ?', v + ' + to V1 (infinitive)\nМысалы: I ' + v + ' to do …')
add('english', 'Gerund / Infinitive', 'begin, start, continue, like, love, hate, prefer, can\'t stand, can\'t bear\n+ ?', 'Екеуі де болады, мағына өзгермейді:\nIt started to rain = It started raining.')
CH = [('stop', 'I stopped to call you. — қоңырау шалу үшін тоқтадым.\nI stopped calling you. — қоңырау шалуды қойдым.'),
      ('remember', 'She remembered to visit … — ұмытпай барды.\nShe remembered visiting … — барғаны есінде.'),
      ('forget', 'I forgot to meet him. — кездесуді ұмытып кеттім (кездеспедім).\nI forgot meeting him. — кездескенім есімде жоқ.'),
      ('try', 'I tried to open the window. — ашуға тырыстым (аша алмадым).\nI tried opening the window. — сынап көрдім (бір тәсіл ретінде).'),
      ('regret', 'I regret to tell you … — өкінішпен хабарлаймын.\nI regret promising … — уәде бергеніме өкінемін.'),
      ('go on', 'He went on to learn French. — кейін француз тілін үйренуге көшті.\nHe went on learning. — үйренуді жалғастырды.'),
      ('quit', 'She quit to work here. — мұнда жұмыс істеу үшін (бұрынғы жұмысын) тастады.\nShe quit working here. — мұндағы жұмысын тастады.')]
for v, b in CH:
    add('english', 'Gerund / Infinitive', v + ' + to V / + V-ing\nМағынасы қалай өзгереді?', b)
add('english', 'Gerund / Infinitive', 'Предлогтан кейін қандай форма?', 'Предлогтан кейін әрқашан V-ing:\ninterested in learning, good at swimming, look forward to seeing, without saying, before leaving.')
add('english', 'Gerund / Infinitive', 'make / let / help + ?', 'make / let + адам + V1 (to-сыз): They made me wait. Let me go.\nhelp + (to) V1: Help me (to) carry it.')

# ---------- синонимдер (docx) ----------
DOCX = """to reduce;to lower / to decrease;азайту, төмендету|to increase;to rise / to grow;арттыру, өсіру|to start;to launch / to initiate;бастау, іске қосу|to finish;to complete / to conclude;аяқтау|to help;to assist / to aid;көмектесу|to require;to need / to demand;талап ету|to allow;to permit / to enable;рұқсат ету|to protect;to preserve / to guard;қорғау, сақтау|to change;to modify / to alter;өзгерту|to show;to demonstrate / to display;көрсету|to choose;to select / to pick;таңдау|to build;to construct / to create;салу, тұрғызу|to destroy;to damage / to ruin;бүлдіру, қирату|to improve;to enhance / to develop;жақсарту, дамыту|to solve;to resolve / to settle;шешу|to discover;to find / to uncover;табу, ашу|to happen;to occur / to take place;болу, орын алу|to provide;to supply / to offer;қамтамасыз ету|to forbid;to prohibit / to ban;тыйым салу|to suggest;to propose / to recommend;ұсыныс жасау|to achieve;to attain / to accomplish;жетістікке жету|to avoid;to prevent / to escape;жол бермеу|to gather;to collect / to assemble;жинау|to explain;to clarify / to describe;түсіндіру|to buy;to purchase;сатып алу|to include;to contain / to involve;қамту|to stop;to cease / to quit;тоқтату|to impact;to influence / to affect;әсер ету|to decide;to determine / to choose;шешім қабылдау|to transform;to convert / to revolutionize;өзгерту, түрлендіру|famous;well-known / prominent;белгілі, танымал|important;essential / crucial;маңызды|difficult;hard / challenging;қиын|easy;simple / effortless;оңай|clear;obvious / understandable;түсінікті, айқын|dangerous;hazardous / risky;қауіпті|safe;secure / protected;қауіпсіз|big;large / huge / vast;үлкен|small;tiny / limited;кішкентай|cheap;affordable / low-cost;арзан|expensive;costly / high-priced;қымбат|fast;quick / rapid;жылдам|slow;gradual / delayed;баяу|ancient;old / historical;ежелгі|modern;recent / contemporary;заманауи|correct;accurate / right;дұрыс, дәл|wrong;incorrect / mistaken;қате|main;primary / principal;негізгі|different;various / diverse;әртүрлі|similar;alike / identical;ұқсас|anxious;nervous / worried;уайымдаған|happy;delighted / pleased;қуанышты|useful;beneficial / helpful;пайдалы|useless;ineffective / hopeless;пайдасыз|frequent;regular / common;жиі|rare;scarce / uncommon;сирек|obligatory;mandatory / compulsory;міндетті|optional;voluntary / elective;міндетті емес|necessary;required / vital;қажетті|flexible;adaptable / adjustable;икемді"""
for row in DOCX.split('|'):
    w, s, kz = row.split(';')
    add('english', 'Синонимдер: етістік, сын есім', w + '\n(' + kz + ')', s, en=w + '. ' + s.replace(' / ', ', '))

# ---------- синонимдер сөздігі (data/synonyms.js) ----------
src = open(os.path.join(ROOT, 'data/synonyms.js'), encoding='utf-8').read()
syn = json.loads(src[src.index('['):src.rindex(']') + 1])
for w in syn:
    add('english', 'Синонимдер сөздігі', w['en'] + '\n(' + w['kz'] + ')', ', '.join(w['syn'][:8]), en=w['en'] + '. ' + ', '.join(w['syn'][:5]))

# ---------- Subjunctive / Mood ----------
SUB = [('Mood: Indicative', 'Ашық рай — факт, нақты әрекет.\nMozart was born in 1756.'), ('Mood: Imperative', 'Бұйрық рай — бұйрық, өтініш.\nDo it! Don\'t be late! Let\'s go.'),
       ('Mood: Subjunctive', 'Шартты/қалау рай — болжам, тілек, күмән, қажеттілік.\nIf I were you … · I wish she were here. · It\'s essential that he be on time.'),
       ('Present Subjunctive', 'that + S + V1 (барлық жақта, -s жоқ; be → be)\nI suggest that she study. It\'s essential that he be here.\nСөздер: suggest, demand, insist, recommend, essential, important, necessary'),
       ('Past Subjunctive', 'were (барлық жақта) / V2\nIf I were you, I would apologize.\nI wish she were more understanding. He speaks as if he knew everything.'),
       ('I wish / If only', 'wish + V2 / were — қазіргіге өкіну: I wish I knew.\nwish + had V3 — өткенге өкіну: I wish I had studied.\nwish + would — басқаның әрекетіне наразылық: I wish you would stop.')]
for f, b in SUB:
    add('english', 'Mood: Indicative, Imperative, Subjunctive', f, b)

# ---------- Conditionals ----------
for f, b in [('Zero conditional', 'If + Present Simple, Present Simple\nЖалпы шындық: If you heat ice, it melts.'),
             ('First conditional', 'If + Present Simple, will + V1\nНақты мүмкін болашақ: If it rains, we will stay home.'),
             ('Second conditional', 'If + Past Simple (were), would + V1\nҚазіргі шындыққа қайшы: If I were rich, I would travel.'),
             ('Third conditional', 'If + had V3, would have V3\nӨткенге қайшы: If I had studied, I would have passed.'),
             ('Mixed conditional', 'If + had V3, would + V1\nIf I had slept, I wouldn\'t be tired now.'),
             ('unless, as long as, provided that', 'unless = if … not: Unless you hurry, you will be late.\nas long as / provided that = егер … болса ғана')]:
    add('english', 'Conditionals', f, b)

# ---------- Modal verbs ----------
for f, b in [('must', 'міндет, қатты кеңес; логикалық сенім: He must be at home.\nmustn\'t — тыйым салынған'),
             ('have to / don\'t have to', 'сыртқы міндет / міндетті емес (қажет емес)'), ('can / could', 'қабілет, рұқсат; could — өткенде қабілет, сыпайы өтініш'),
             ('may / might', 'рұқсат (ресми); мүмкіндік (might — азырақ сенім)'), ('should / ought to', 'кеңес: You should see a doctor.'),
             ('needn\'t', 'қажет емес: You needn\'t come.'), ('can\'t (+ be)', 'мүмкін емес (сенімді теріс болжам): It can\'t be true.'),
             ('must have / can\'t have / should have + V3', 'өткенге болжам: He must have left. · Өкініш: You should have told me.'),
             ('had better / would rather', 'had better + V1 — дұрысы (ескерту)\nwould rather + V1 — артық көремін'), ('be able to', 'can-нің барлық шақтағы орнын басады: I will be able to come.')]:
    add('english', 'Modal verbs', f, b)

# ---------- Infinitive, Participle, Adverb, Prepositions, Lexicology ----------
for f, b in [('Infinitive формалары', 'to do (жай) · to be doing (созылыңқы) · to have done (перфект) · to be done (ырықсыз)'),
             ('to-сыз инфинитив (bare infinitive)', 'модальдан кейін: can go · make/let + адам + V1 · had better, would rather · see/hear + адам + V1'),
             ('Мақсат инфинитиві', 'Мақсатты білдіреді: I came here to study. = in order to study'),
             ('too / enough + infinitive', 'too young to drive — жүргізуге тым жас\nold enough to drive — жүргізуге жасы жетеді')]:
    add('english', 'Infinitive', f, b)
for f, b in [('Gerund дегеніміз не?', 'Етістік + ing, зат есім қызметінде: Swimming is good. I like reading.'),
             ('Gerund қай жерде?', 'сөйлем басында бастауыш: Smoking is harmful.\nпредлогтан кейін: interested in reading\nбелгілі етістіктерден кейін: enjoy, avoid, mind, finish')]:
    add('english', 'Gerund', f, b)
for f, b in [('Participle I (V-ing)', 'Белсенді, жүріп жатқан: a crying baby, the man standing there.\nСезім: boring — жалықтыратын (заттың сипаты)'),
             ('Participle II (V3)', 'Ырықсыз, аяқталған: a broken window, a letter written in English.\nСезім: bored — жалыққан (адамның күйі)'),
             ('-ing / -ed сын есімдер', 'interesting / interested · boring / bored · exciting / excited · tiring / tired\n-ing — себеп (зат), -ed — сезім (адам)'),
             ('Perfect participle', 'Having + V3 — бұрын аяқталған әрекет:\nHaving finished the work, he went home.')]:
    add('english', 'Participle', f, b)
for f, b in [('Adverb: функциялары', 'Етістікті, сын есімді, басқа үстеуді анықтайды: speaks quickly, very good, too fast.\nТүрлері: қимыл-сын (how), уақыт (when), мекен (where), жиілік (how often), дәреже (how much)'),
             ('Сын есімнен үстеу жасау', 'adj + ly: quick → quickly, careful → carefully, happy → happily\nБұрыс: good → well, fast → fast, hard → hard (hardly = әрең), late → late (lately = жақында)'),
             ('Үстеудің орны: жиілік', 'always, usually, often, sometimes, never:\nнегізгі етістіктің АЛДЫНДА: She always gets up early.\nbe-ден КЕЙІН: He is never late.\nкөмекші етістіктен кейін: I have never seen it.'),
             ('Үстеудің орны: реті', 'Қимыл-сын → мекен → уақыт (Manner–Place–Time):\nShe sang beautifully at the concert last night.'),
             ('enough / too / very', 'enough сын есімнен КЕЙІН: tall enough\ntoo, very сын есімнің АЛДЫНДА: too tall, very tall')]:
    add('english', 'Adverb', f, b)
for f, b in [('in / on / at: уақыт', 'in — ай, жыл, маусым, ғасыр: in May, in 2020, in summer, in the morning\non — күн, дата: on Monday, on 5 May, on my birthday\nat — сағат, мерекелер: at 5 o\'clock, at night, at the weekend, at Christmas'),
             ('in / on / at: мекен', 'in — ішінде: in the room, in Almaty, in a car\non — бетінде: on the table, on the wall, on the bus, on the 2nd floor\nat — нүкте, мекеме: at home, at school, at the bus stop, at the door'),
             ('for / since / during / ago', 'for — уақыт аралығы: for 3 years\nsince — басталған сәт: since 2020\nduring — бір кезең ішінде: during the lesson\nago — бұрын (Past Simple): 2 years ago'),
             ('by / until / till', 'by — кешіктірмей (сол уақытқа дейін): by Friday\nuntil — дейін (сол уақытқа дейін жалғасады): wait until 5'),
             ('Етістік + предлог', 'depend on — тәуелді болу · consist of — тұру (құралу) · belong to — тиесілі болу · listen to — тыңдау · look for — іздеу · look after — қарау, күту · wait for — күту · agree with — келісу · be afraid of — қорқу · be good at — жақсы білу · be interested in — қызығу · be proud of — мақтану'),
             ('between / among', 'between — екеуінің арасы; among — көптің арасы')]:
    add('english', 'Prepositions', f, b)
for f, b in [('Синоним / антоним', 'Синоним — мағынасы жақын: big = large, huge.\nАнтоним — қарама-қарсы: begin ↔ end, generous ↔ mean.'),
             ('Жиі антонимдер', 'increase ↔ decrease (арттыру ↔ азайту)\naccept ↔ refuse (қабылдау ↔ бас тарту)\nancient ↔ modern (ежелгі ↔ заманауи)\ncheap ↔ expensive (арзан ↔ қымбат)\nrare ↔ frequent (сирек ↔ жиі)\ntemporary ↔ permanent (уақытша ↔ тұрақты)\npolite ↔ rude (сыпайы ↔ дөрекі)\ngenerous ↔ mean/stingy (жомарт ↔ сараң)'),
             ('Антоним жасайтын префикстер', 'un- (unhappy), in- (incorrect), im- (impossible), il- (illegal), ir- (irregular), dis- (dislike), mis- (misunderstand), non- (non-stop)'),
             ('Сөз жасайтын жұрнақтар', 'Зат есім: -tion, -ment, -ness, -ity, -er/-or\nСын есім: -ful, -less, -able, -ous, -ive, -al\nҮстеу: -ly · Етістік: -ize, -en, -fy')]:
    add('english', 'Lexicology: synonyms, antonyms', f, b)

# ---------- Алгоритм ----------
ALG = [('Стек', 'LIFO — соңғы кірген бірінші шығады. DFS, рекурсия, жақша тексеру.'), ('Кезек', 'FIFO — бірінші кірген бірінші шығады. BFS.'),
 ('Приоритеттік кезек', 'Үйме (heap) арқылы. Дейкстра, Прим.'), ('Екілік іздеу', 'Тек сұрыпталған массивте. O(log n).'), ('Сызықтық іздеу', 'O(n)'),
 ('Хеш-кесте', 'Орташа O(1). Коллизия: тізбек немесе ашық адрестеу.'), ('Екілік іздеу ағашы (BST)', 'Іздеу орташа O(log n), ең нашар O(n). Inorder → сұрыпталған.'),
 ('AVL / қызыл-қара ағаш', 'Теңгерімді, әрқашан O(log n).'), ('Үйме (heap)', 'Ең үлкен/кіші түбірде. Қосу/алу O(log n), құру O(n).'),
 ('BFS', 'Кезек. Салмақсыз графта ең қысқа жол. O(V+E).'), ('DFS', 'Стек. Цикл табу, топологиялық сұрыптау. O(V+E).'),
 ('Дейкстра', 'Теріс салмақ ЖОҚ. O(E log V).'), ('Беллман–Форд', 'Теріс салмақ бар. V−1 өту. O(V·E). Теріс циклді табады.'),
 ('Флойд–Уоршелл', 'Барлық жұп арасындағы жол. O(V³).\nd[i][j] = min(d[i][j], d[i][k] + d[k][j])'), ('Прим / Крускал', 'Ең кіші қаңқалық ағаш (MST). Крускал — DSU.'),
 ('Топологиялық сұрыптау', 'Тек DAG (циклсіз бағытталған граф).'), ('Ашкөз (greedy)', 'Бөлшекті қоржын, Хаффман, Прим, Крускал.'),
 ('Динамикалық бағдарламалау', '0/1 қоржын O(n·W), Фибоначчи, LCS.'), ('Бөліп ал да билей бер', 'Merge sort, quick sort, екілік іздеу.'),
 ('Рекурсия', 'Базалық жағдай міндетті, әйтпесе стек толып кетеді.'),
 ('Bubble / Insertion / Selection', 'O(n²). Insertion дерлік сұрыпталғанда O(n). Selection тұрақсыз.'), ('Merge sort', 'O(n log n) әрқашан, тұрақты, O(n) жад.'),
 ('Quick sort', 'Орташа O(n log n), ең нашар O(n²), тұрақсыз.'), ('Heap sort', 'O(n log n) әрқашан, тұрақсыз.'), ('Counting / Radix', 'O(n+k), тұрақты.'),
 ('Тұрақты сұрыптаулар', 'bubble, insertion, merge, counting, radix'), ('Күрделілік реті', 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)'),
 ('Ақырлы автомат', 'DFA — бір символға бір ауысу. NFA → DFA (2ⁿ күйге дейін). Регуляр тілдер.'),
 ('Массив / байланысқан тізім', 'Массив: индекс O(1), ортасына қосу O(n).\nТізім: қосу O(1), іздеу O(n).')]
for f, b in ALG: add('algo', 'Кілттік терминдер', f, b)

DB = [('Қатынас / кортеж / атрибут', 'кесте / жол / баған'), ('Домен', 'Атрибуттың мүмкін мәндер жиыны'), ('Дәреже / қуат', 'бағандар саны / жолдар саны'),
 ('PRIMARY KEY', 'Бірегей + NOT NULL, кестеде біреу'), ('FOREIGN KEY', 'Басқа кестенің PK-сына сілтеме, сілтемелік тұтастық'), ('UNIQUE', 'Бірегей, NULL болуы мүмкін'),
 ('Суррогат / құрама кілт', 'жасанды ID / бірнеше баған'), ('1НФ', 'Атомарлы мәндер, қайталанатын топ жоқ'), ('2НФ', '1НФ + кілттің БӨЛІГІНЕ тәуелділік жоқ'),
 ('3НФ', '2НФ + ТРАНЗИТИВТІ тәуелділік жоқ'), ('БКНФ', 'Әр детерминант — кілт'), ('Денормализация', 'Жылдамдық үшін артықтық қосу'),
 ('ER-диаграмма', 'Нысан — тіктөртбұрыш, атрибут — сопақша, байланыс — ромб. M:N → аралық кесте.'),
 ('Жобалау кезеңдері', 'Концептуалды (ER) → логикалық (схема, нормализация) → физикалық (индекс, файл)'),
 ('DDL', 'CREATE, ALTER, DROP, TRUNCATE'), ('DML', 'SELECT, INSERT, UPDATE, DELETE'), ('DCL / TCL', 'GRANT, REVOKE / COMMIT, ROLLBACK, SAVEPOINT'),
 ('DELETE / TRUNCATE / DROP', 'шартпен жолдар / барлық жол, WHERE жоқ / кестенің өзі'), ('WHERE / HAVING', 'топтауға дейін / кейін, агрегатпен'),
 ('COUNT(*) / COUNT(баған)', 'NULL-ды санайды / санамайды'), ('SQL орындалу реті', 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY'),
 ('INNER / LEFT / RIGHT / FULL / CROSS JOIN', 'екеуінде бар / солдың бәрі / оңның бәрі / екеуінің бәрі / декарттық көбейтінді'),
 ('UNION / UNION ALL', 'қайталанбайды / қайталанады'), ('LIKE', '% — кез келген тізбек, _ — бір таңба'), ('NULL тексеру', 'IS NULL (= NULL емес)'),
 ('Байланысқан ішкі сұраныс', 'Сыртқы бағанға сілтейді, әр жолға орындалады. EXISTS.'),
 ('Реляциялық алгебра', 'σ таңдау (жол), π проекция (баған), ⋈ біріктіру, ×, ∪, −, ÷'), ('Реляциялық есептеу', 'Декларативті. Кортеждік / доменді (QBE). Алгебраға эквивалент (Кодд).'),
 ('ACID', 'Атомарлық, келісімділік, оқшаулау, ұзақ сақталу'), ('Индекс', 'Іздеуді жылдамдатады, жазуды баяулатады. Кластерлік — біреу. B-ағаш.'),
 ('VIEW', 'Виртуалды кесте (сақталған SELECT)'), ('Триггер / сақталған процедура', 'оқиғада өзі орындалады / EXEC арқылы шақырылады'),
 ('MS SQL Server файлдары', '.mdf — деректер, .ndf — қосымша, .ldf — журнал. Бет 8 КБ, экстент 8 бет.'), ('MS SQL жүйелік ДҚ', 'master, model, tempdb, msdb'),
 ('ДҚБЖ модельдері', 'иерархиялық (ағаш), желілік (граф), реляциялық (кесте)'), ('Көп жауапты сұрақ балы', 'Қатесіз — 2, бір қате — 1, екі қате — 0. Тек сенімдісін белгіле.')]
for f, b in DB: add('db', 'Кілттік терминдер', f, b)

TGO = [('Пайызға арттыру / кеміту', '·(1 + x/100) / ·(1 − x/100)'), ('+20%, сосын −20%', '·1,2·0,8 = 0,96 → 4%-ға аз'), ('Пропорция', 'a:b = c:d → ad = bc'),
 ('Қозғалыс', 'S = v·t. Қарсы: v₁+v₂. Қуу: v₁−v₂. Ағыспен: v+u, қарсы: v−u.'), ('Орташа жылдамдық', 'Барлық жол / барлық уақыт'),
 ('Бірлескен жұмыс', '1/t = 1/t₁ + 1/t₂'), ('Орташа, медиана, мода', 'қосынды/саны · ортасы · ең жиі'),
 ('Арифметикалық прогрессия', 'aₙ = a₁ + (n−1)d, S = (a₁+aₙ)·n/2'), ('Геометриялық прогрессия', 'bₙ = b₁·qⁿ⁻¹'),
 ('Орналастыру / теру', 'реті маңызды: n!/(n−k)! · маңызсыз: n!/(k!(n−k)!)'), ('Ықтималдық', 'қолайлы / барлық. «және» → көбейт, «немесе» → қос.'),
 ('Бөлінгіштік', '2 — соңы жұп · 3, 9 — цифрлар қосындысы · 4 — соңғы екі цифр · 5 — 0/5'),
 ('Қысқаша көбейту', '(a±b)² = a² ± 2ab + b² · a² − b² = (a−b)(a+b)'), ('Дәреже', 'aᵐ·aⁿ = aᵐ⁺ⁿ · (aᵐ)ⁿ = aᵐⁿ · a⁰ = 1 · a⁻ⁿ = 1/aⁿ'),
 ('Аудандар', 'тіктөртбұрыш ab · үшбұрыш ½ah · дөңгелек πr², шеңбер 2πr'), ('Пифагор', 'c² = a² + b². Үшбұрыш бұрыштары 180°.'),
 ('Сағат тілдерінің бұрышы', '|30·сағ − 5,5·мин|, 180°-тан асса 360°-тан шегер'), ('Сандық тізбек', 'айырма → айырманың айырмасы → еселеу → аралас екі тізбек'),
 ('Логика', '«барлығы» емес = «кейбірі емес». A→B болса, B емес → A емес.'), ('Өзгеріс %', '(жаңа − ескі)/ескі · 100'),
 ('Аналитикалық оқылым', 'Негізгі ой — бірінші/соңғы абзац. «Әрқашан», «ешқашан» — көбіне қате.')]
for f, b in TGO: add('fundamentals', 'Кілттік формулалар', f, b)

out = 'Shyn.cards=(Shyn.cards||[]).concat(' + json.dumps(cards, ensure_ascii=False) + ');\n'
open(os.path.join(ROOT, 'data/flashcards3.js'), 'w', encoding='utf-8').write(out)
from collections import Counter
print(len(cards)); print(Counter(c['topic'] for c in cards))
