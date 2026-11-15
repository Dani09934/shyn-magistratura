"""Тәуелсіз тексерушінің (2026-11) тапқан мазмұн қателерін түзету. Идемпотентті — gen_sw.py әр жолы шақырады.
python3 tools/review_fix.py"""
import glob, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETS = os.path.join(ROOT, 'data', 'sets')

# ---- нақты сұрақтарға түзетулер: id -> {өріс: мән}; 'opt:X' — нұсқа мәтіні ----
FIX = {
    'v53-english-24': {'q': 'The room looks nice. Somebody ___ it.'},
    'v22-db-5': {
        'correct': ['B', 'D', 'E'], 'disputed': True,
        'ex': 'Классикалық тізім бойынша (С.Д. Кузнецов) ДҚБЖ-ның негізгі функциялары: сыртқы жадтағы деректерді тікелей басқару (B), '
              'жедел жад буферлерін басқару (D), транзакцияларды басқару, журналдау және ақаулардан кейін ДҚ-ны қалпына келтіру (E), '
              'деректер тілдерін қолдау. «Қалпына келтіру диспетчері» (C) және «бұғаттаулар диспетчері» (F) — функция емес, ДҚБЖ-ның '
              'ішкі компоненттері (модульдері); түйіршіктілік (A) — бұғаттау деңгейінің сипаттамасы. Ескерту: кілт ресми емес, оқулық бойынша анықталды.'},
    'v31-fundamentals-22': {
        'ex': 'Дұрыс жауап — A) Жорамалдап. «Тұспалдап» — тура айтпай, болжап, шамалап деген мағынада: халықтық этимология сөз мағынасын '
              'ғылыми дәлелсіз, өзінше болжап түсіндіреді. Мағынасы ең жақын — «жорамалдап». Суреттеп — бейнелеп, нақтылап — дәлдеп, '
              'тұжырымдап — қорытып айту, мөлшерлеп — көлемін шамалау; бұлар «тұспалдап» сөзінің орнына келмейді.'},
    'v34-fundamentals-30': {
        'ex': 'Дұрыс жауап — A) Үлкен. «Зор» — көлемі не күші жағынан үлкен, ұлы деген сөз; мағынасы ең жақын — «үлкен». '
              'Негізгі, басты — маңыздылықты білдіреді, нағыз — шынайы, кіші — «зор» сөзіне қарама-қарсы мағыналы.'},
    'v80-fundamentals-6': {
        'passage': 'Қоғамда болған әрбір өзгеріс тілдің сөздік қорынан көрінеді. Жаңа техника, жаңа кәсіп, жаңа ұғымдар пайда болған сайын '
                   'тілге жаңа сөздер енеді: бір кезде «ғаламтор», «смартфон», «қашықтан оқыту» деген сөздер болмаған. Керісінше, '
                   'қолданыстан шыққан заттар мен кәсіптердің атаулары біртіндеп көнеріп, архаизмге айналады. Сондықтан тілді '
                   'қоғам өмірінің айнасы деп атайды: тіл қоғамға қызмет етеді, қоғам тілді өзгертеді.'},
    'v42-english-2': {'q': 'Where is Thanksgiving celebrated?',
                      'opt:D': 'Throughout North America and some other parts of the world, albeit in different forms and on different dates'},
    'v59-english-39': {'q': 'Where is Thanksgiving celebrated?',
                       'opt:D': 'Throughout North America and some other parts of the world, albeit in different forms and on different dates'},
    'v32-fundamentals-22': {
        'q': 'a мен b бүтін сандар, a > b > 0 және a² − b² = 24 болса, a − b өрнегінің мәні мына сандардың қайсысын қабылдай алатынын анықтаңыз: 1; 2; 4.',
        'opt:B': 'тек 1',
        'ex': 'Дұрыс жауап — A) 2 мен 4. a² − b² = (a − b)(a + b) = 24, ал a − b мен a + b бірдей жұптылықта (екеуінің қосындысы 2a — жұп). '
              '24 = 2·12 → a − b = 2 (a = 7, b = 5); 24 = 4·6 → a − b = 4 (a = 5, b = 1). a − b = 1 болса, a + b = 24 — жұптылығы әртүрлі, бүтін шешім жоқ.'},
    'v78-fundamentals-1': {'q': 'Мәтіндегі бос орынды толтырыңыз. Бүгінде Жайық жағасы демалыс орнына […].'},
    'v32-fundamentals-23': {
        'q': 'Мәтіндегі бос орынды толықтырыңыз. Әкем көктемде аулаға үйдің қасына терек отырғызды. Оны күтуді маған тапсырды. Жаз бойы […] су құйып, қамқорлық жасадым. Шелектен су ішкен ол күзге дейін біраз өсіп қалды.',
        'ex': 'Дұрыс жауап — E) терекке. Күтуді тапсырған нәрсе — отырғызылған терек, ал келесі сөйлемде «ол күзге дейін біраз өсіп қалды» делінген. '
              'Демек су құйылған — терек: «Жаз бойы терекке су құйып, қамқорлық жасадым». Аула, үй алды, есік алды өспейді, шелекке су құймайды — шелекпен құяды.'},
    'v46-english-12': {'opt:B': 'a', 'opt:C': 'an'},
}
# Сұрағы (тапсырмасы) жоқ не түсініксіз шарттар — нақты нұсқау қосылды
BLANK = 'Мағынасы бойынша көп нүктенің (…) орнына лайық сөзді таңдаңыз. '
FIX.update({
    'v19-english-21': {'q': 'How do you read «2.27%»?'},
    'v24-english-17': {'q': 'How do you read the year 2025?'},
    'v27-english-30': {'q': 'Write the ordinal number in words: the 80th floor → the ___ floor.'},
    'v6-english-17': {'q': 'Write «thirtieth» in figures: Today is the thirtieth of May.'},
    'v6-english-23': {'q': 'Write «12» in words: There are 12 months in a year.'},
    'v24-english-33': {'q': 'Choose the possessive form with the same meaning: «the book of a friend».'},
    'v1-english-26': {'q': 'Choose the sentence in the Indicative Mood.'},
    'v3-english-34': {'q': 'Choose the sentence in the Imperative Mood.'},
    'v38-db-10': {'q': '1НФ (бірінші қалыпты форма) дегеніміз —'},
    'v38-db-23': {'q': '3НФ (үшінші қалыпты форма) дегеніміз —'},
    'v33-fundamentals-17': {'q': '«Мазасыздық» сөзіне мағынасы жақын сөзді табыңыз.'},
})


def _prefix(qid, text):
    FIX.setdefault(qid, {})['_prefix'] = text


for _id in ('v9-fundamentals-16', 'v9-fundamentals-17', 'v9-fundamentals-18'):
    _prefix(_id, BLANK)
FIX['v30-fundamentals-23'] = {'_replace': ('Фактіге сәйкес келетін жауап', 'Мәтіндегі фактіге сәйкес келетін тұжырымды таңдаңыз.')}

for _id in ('v34-fundamentals-13', 'v35-fundamentals-5', 'v35-fundamentals-30', 'v35-fundamentals-31', 'v35-fundamentals-32'):
    FIX[_id] = {'topic': 'Аналитикалық ойлау: бос орын'}

# ---- оқылым: жалпы үлгідегі түсіндірмені мәтіннен дәйексөзбен ауыстыру: id -> (дәйексөз, түсініктеме) ----
TRUNC = ('Бұл жинақта мәтіннің осы сұраққа қатысты бөлігі сақталмаған (мәтін қысқартылған), сондықтан жауапты мәтіннен тексеру мүмкін емес; '
         'кілт ресми жауаптар кестесінен алынған.')
R = {
    'v40-english-1': ('The director of the school is British, but my teacher is American.', 'American — АҚШ-тан, яғни the USA.'),
    'v40-english-5': ('We always speak English together because that’s the best way to learn.', 'Кармен ағылшын тілі курсындағы оқу, мұғалімі мен сыныптастары туралы айтады — her English course.'),
    'v40-english-43': (None, TRUNC), 'v40-english-45': (None, TRUNC), 'v40-english-47': (None, TRUNC),
    'v40-english-48': ('Tony is a waiter on the ship and he is very unhappy when his girlfriend leaves him to marry the captain!', '«Second half» — өмірлік серік (жұбай). Сүйгені тастап кеткен — Тони.'),
    'v40-english-50': ('A group of college students decide to rent a house in the mountains … one by one they start to disappear.', 'Таудағы үйде жоқ болып жатқан студенттер туралы шытырман оқиғалы сюжет; нұсқалардың ішінде бұған сәйкесі — adventure.'),
    'v41-english-8': ("If I don't keep in touch, I know my parents will worry.", 'worry = be anxious (уайымдау).'),
    'v47-english-2': ("If I don't keep in touch, I know my parents will worry.", 'worry = be anxious (уайымдау).'),
    'v41-english-9': ('He is fourteen.', ''),
    'v41-english-29': ('The research was based on an analysis of results from a 10-minute online grammar quiz.', 'Тест грамматика бойынша болған — бағаланғаны grammar skills.'),
    'v41-english-33': ('The researchers say this is past the "critical period" when language learning ability starts to decline.', '«Critical period» — тіл үйренуге ең қолайлы (advantageous) кезең; одан кейін қабілет төмендейді.'),
    'v41-english-34': ('The researchers added that children up to the age of 17 or 18 remain adept at learning grammar.', '17–18 жастан кейін үйрену қабілеті төмендейді (starts to decline) — less likely.'),
    'v42-english-2': ('Thanksgiving is a holiday celebrated predominantly in North America, and it possesses a different meaning in each of the countries where it\'s acknowledged.', ''),
    'v59-english-39': ('Thanksgiving is a holiday celebrated predominantly in North America, and it possesses a different meaning in each of the countries where it\'s acknowledged.', ''),
    'v43-english-2': ('Cars pollute the air, and the number of cars is growing.', 'is growing = increasing.'),
    'v43-english-29': ('Walt Disney was born in Chicago on December 5, 1901.', '5 = fifth.'),
    'v43-english-32': ('Celebrity chefs Gordon Ramsay and Raymond Blanc created special recipes…', 'celebrity = superstar.'),
    'v43-english-34': ('In 2013 in the UK, the pop group McFly gave a live acoustic performance…', 'the UK = Great Britain.'),
    'v44-english-11': ('He travelled to the United States and Cuba.', ''),
    'v45-english-1': ("…we had a little time with the leader of the tourist group discussing tomorrow's itinerary.", 'itinerary = route (бағыт).'),
    'v45-english-2': ('We got back at five…', 'Сағат бесте — түстен кейін (in the afternoon).'),
    'v45-english-5': ("I love driving those tourists around. It's one of the best jobs I've ever had.", 'Диана туристерді аралатып, каньонға, мұражайға апарады — гид.'),
    'v45-english-9': ('They’re every hour from eleven-fifteen until five-fifteen.', '11:15, 12:15, 1:15, 2:15, 3:15, 4:15, 5:15 — күніне 7 тур.'),
    'v45-english-11': ('Some of the things in the museum are over three thousand years old.', 'Үш мың жылдық заттар — antique (көне).'),
    'v47-english-12': ('…football, the thing I have been doing since I was 4 with my Dad…', ''),
    'v58-english-7': ('…football, the thing I have been doing since I was 4 with my Dad…', ''),
    'v47-english-19': ('Another time, a teenaged boy stole money from Anna on the bus.', ''),
    'v47-english-22': ('She started when she was 23 years old.', ''),
    'v48-english-1': ('You should buy some beautiful flowers, some incense sticks and the latest book of love stories.', 'Қарындасының туған күніне не сыйлау керегі талқыланады — presents.'),
    'v48-english-4': ("I'm going to sing together with my sister.", 'Бобби туған күн иесі — қарындасымен (Suzy) бірге ән айтпақ.'),
    'v55-english-3': ("I'm going to sing together with my sister.", 'Бобби туған күн иесі — қарындасымен (Suzy) бірге ән айтпақ.'),
    'v48-english-7': ('How old will your sister be? — Nineteen.', ''),
    'v55-english-6': ('How old will your sister be? — Nineteen.', ''),
    'v48-english-8': (None, TRUNC), 'v55-english-7': (None, TRUNC),
    'v48-english-13': (None, TRUNC), 'v58-english-12': (None, TRUNC),
    'v49-english-2': ('You live in perpetual fear of what those in authority think of you…', 'perpetual fear = permanent terror.'),
    'v49-english-13': (None, TRUNC), 'v56-english-13': (None, TRUNC),
    'v49-english-26': ('He was 19 and his performance earned him an Academy Award nomination.', ''),
    'v49-english-27': ('He began looking for an agent when he was twelve but was unsuccessful.', 'unsuccessful — нәтиже бермеді (didn’t bring successful results).'),
    'v49-english-30': ("That same year he starred alongside Johnny Depp in ‘What's Eating Gilbert Grape’.", 'starred — басты рөлде ойнады (the main characters).'),
    'v50-english-5': ('We sometimes go for a meal to a cafe or restaurant near the office.', 'Әріптестерімен кафеге барады — goes out.'),
    'v59-english-4': ('We sometimes go for a meal to a cafe or restaurant near the office.', 'Әріптестерімен кафеге барады — goes out.'),
    'v50-english-6': ('What do you do in your job? … What do you do in your free time?', 'Әңгіме жұмыс пен бос уақыт туралы — jobs and leisure.'),
    'v59-english-5': ('What do you do in your job? … What do you do in your free time?', 'Әңгіме жұмыс пен бос уақыт туралы — jobs and leisure.'),
    'v50-english-41': ('But Nick wanted to go outdoors and play with his father.', 'outdoors = outside.'),
    'v51-english-3': ('The tree was so big and beautiful it would fill them with awe.', 'awe — таңданыс, тамсану: to be amazed.'),
    'v56-english-4': ('The tree was so big and beautiful it would fill them with awe.', 'awe — таңданыс, тамсану: to be amazed.'),
    'v51-english-12': ("It's your lunch, Scarlett. … Hey, pizza margherita! Cool!", 'Басқа тағамның бәрінен бас тартқан Скарлетт пиццаға «Cool!» дейді — ұнады.'),
    'v51-english-28': ("Her parents didn't like it, but Chloe got an excellent school report and they decided to give Chloe that present.", 'Алғашында ата-анасы егеуқұйрық алу идеясын ұнатпаған.'),
    'v51-english-31': ("I'm going to my aerobics class. … When she arrived at the gym and opened her bag, she found Roxy…", ''),
    'v51-english-32': ("'I'm going to my aerobics class. I'll return at seven.'", 'Мұны анасы айтады.'),
    'v52-english-2': ('…he hopes that his journey, a total of 45 000 miles, will take five years.', ''),
    'v52-english-3': ('He carries a Walkman…, a letter from Nelson Mandela and a camera.', 'Сапарда камера алып жүреді — суретке түсіруді ұнатады деп болжауға болады.'),
    'v52-english-6': ('When he called his girlfriend to tell her, she ended their relationship!', 'ended their relationship = broke up.'),
    'v52-english-7': ('When he called his girlfriend to tell her, she ended their relationship!', 'Тонаудан кейін болған оқиға.'),
    'v52-english-10': ('Then, on 19th May, she was taken from here and executed. Her head was cut off.', 'head was cut off = beheaded.'),
    'v59-english-9': ('Then, on 19th May, she was taken from here and executed. Her head was cut off.', 'head was cut off = beheaded.'),
    'v53-english-5': ('I want to partake in the growth and success of the company.', 'company = organization.'),
    'v57-english-5': ('I want to partake in the growth and success of the company.', 'company = organization.'),
    'v53-english-12': ('…a cat had been deliberately buried with a human…', 'Адаммен бірге жерленген — бейіттен (grave) табылған.'),
    'v57-english-12': ('…a cat had been deliberately buried with a human…', 'Адаммен бірге жерленген — бейіттен (grave) табылған.'),
    'v53-english-30': ('It has a population of 36 million people. This is small compared to other countries.', 'small = not so large.'),
    'v53-english-31': ('It also has six time zones!', ''),
    'v53-english-34': ('Canada has ten provinces and three territories.', ''),
    'v53-english-38': ("When Dad came, they looked all over the house but couldn't find Roxy anywhere.", ''),
    'v54-english-15': ('"Spain never was a nation of layabouts or lazy people, as it is made out to be."', 'Испандықтар туралы қалыптасқан пікірлер (жалқау, сиеста) — stereotypes.'),
    'v55-english-13': ('"Spain never was a nation of layabouts or lazy people, as it is made out to be."', 'Испандықтар туралы қалыптасқан пікірлер (жалқау, сиеста) — stereotypes.'),
    'v54-english-36': ('Most of her customers are Asians, two or three are Europeans.', 'customers = clients.'),
    'v54-english-38': ("Amina stands behind the counter in her little grocer's shop in the corner.", "grocer's = grocery."),
    'v54-english-41': ('The shop closes at 10.30 in the evening.', 'closes = shuts down.'),
    'v54-english-49': ('…the softer disciplines like aikido can help people who are anxious…', 'anxious → anxiety.'),
    'v56-english-34': ('She was very pretty.', 'Нұсқалардың ішінде pretty-ге ең жақыны — nice.'),
    'v56-english-35': ('I lived in a city, but the city was hot in summer. I wanted to see the country.', 'wanted = had a desire.'),
}

GRADING_CLAUSE = re.compile(r',?\s*(?:сондықтан|сол себепті)\s+(?:2-ден\s+)?(?:тек\s+)?1 балл есептелді')
GRADING = re.compile(r'\s*[^.]*(?:балл есептелді|1 балл)[^.]*\.')


def opt_t(q, L):
    for o in q['opts']:
        if o['l'] == L:
            return (o.get('t') or o.get('code') or '').strip()
    return ''


def main():
    # 1) v36 = v35 көшірмесі — тізімнен алып тастаймыз
    ip = os.path.join(ROOT, 'data', 'index.js')
    idx = open(ip, encoding='utf-8').read()
    names = json.loads(idx[idx.index('['):idx.rindex(']') + 1])
    if 'v36-fundamentals' in names:
        names.remove('v36-fundamentals')
        open(ip, 'w', encoding='utf-8').write('Shyn.setFiles(' + json.dumps(names, ensure_ascii=False) + ');\n')
    total = 0
    for f in sorted(glob.glob(os.path.join(SETS, '*.js'))):
        src = open(f, encoding='utf-8').read()
        d = json.loads(src[len('Shyn.addSet('):src.rindex(')')])
        ch = False
        for q in d['questions']:
            fx = FIX.get(q['id'], {})
            for k, v in fx.items():
                if k == '_prefix':
                    if not q['q'].startswith(v):
                        q['q'] = v + q['q']; ch = True
                elif k == '_replace':
                    if q['q'].rstrip().endswith(v[0]):
                        q['q'] = q['q'].rstrip()[:-len(v[0])] + v[1]; ch = True
                elif k.startswith('opt:'):
                    for o in q['opts']:
                        if o['l'] == k[4:] and o.get('t') != v:
                            o['t'] = v; ch = True
                elif q.get(k) != v:
                    q[k] = v; ch = True
            if q['id'] in R:
                quote, note = R[q['id']]
                L = q['correct'][0]
                ex = 'Дұрыс жауап — ' + L + ') ' + opt_t(q, L) + '. '
                ex += ('Мәтінде: «' + quote + '» ' if quote else '') + note
                ex = ex.strip()
                if q.get('ex') != ex:
                    q['ex'] = ex; ch = True
            if q.get('ex') and ('балл есептелді' in q['ex'] or '1 балл' in q['ex']):
                e = GRADING_CLAUSE.sub('', q['ex'])
                q['ex'] = re.sub(r'\s{2,}', ' ', GRADING.sub('', e)).strip(); ch = True
        if os.path.basename(f)[:-3] in names:
            total += sum(1 for q in d['questions'] if not q.get('missing'))
        if ch:
            open(f, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
    # 2) index.html мета-сипаттамасындағы сұрақ саны
    hp = os.path.join(ROOT, 'index.html')
    html = open(hp, encoding='utf-8').read()
    new = re.sub(r'\d[\d\s]* түсіндірмелі сұрақ', str(total) + ' түсіндірмелі сұрақ', html)
    new = new.replace('20 нұсқа,', '100+ нұсқа,')
    if new != html:
        open(hp, 'w', encoding='utf-8').write(new)
    print('сұрақ:', total)


if __name__ == '__main__':
    main()
