"""ТГО 30-нұсқа (аналитикалық ойлау) → data/sets/v61..v90-fundamentals.js
python3 tools/tgo30_build.py  (алдымен tools/tgo_struct.py)"""
import json, os, re, glob, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from tgo30_keys import K, FX, EX, PFX
D = os.path.join(ROOT, 'tr/tgo30')
BASE = 60
L = 'ABCD'

def clean(t):
    t = re.sub(r'\s+', ' ', t or '').strip()
    t = re.sub(r'^(?:[0OО]\)|\)|[A-ZА-Я]\)|Бу|Су|Гу|Ву)\s*(?=[А-ЯӘҒҚҢӨҰҮІа-яәғқңөұүі«])', '', t) if len(t) > 3 else t
    t = t.replace('�', '').replace(' ,', ',').replace(' .', '.')
    return t.strip(' ;')

QW = r'(табыңыз|анықтаңыз|анықтаныз|көрсетіңіз|таңдаңыз|танданыз|таңданыз|толтырыңыз|толықтырыңыз|толықтырыныз|жалғастырыңыз|жалғастырыныз|беріңіз|орналастырыңыз)'
def split_inline(q):
    """«Келесі тапсырмалар төмендегі мәтін бойынша <мәтін> <сұрақ>» → (мәтін, сұрақ)"""
    m = re.match(r'^\s*Ке[лд]есі\s*тапсы\w*\s*төмендегі мәтін бойынша\s*(.+)$', q)
    if not m: return None, q
    body = m.group(1)
    sents = re.split(r'(?<=[.!?»])\s+', body)
    for i in range(len(sents) - 1, 0, -1):
        if re.search(QW, sents[i], re.I) or sents[i].endswith('?'):
            return ' '.join(sents[:i]), ' '.join(sents[i:])
    return None, None

def topic(q):
    s = q.lower()
    if re.search(r'\[\.\.\.\]|бос орын|толы?[қт]ыр|толтыр|көп нүкте', s): return 'Аналитикалық ойлау: бос орын'
    if re.search(r'та[қк]ырып', s): return 'Аналитикалық ойлау: тақырып'
    if re.search(r'мақсат', s): return 'Аналитикалық ойлау: мақсат'
    if re.search(r'стил|ақпарат көз|жанр|түрін анықта', s): return 'Аналитикалық ойлау: стиль'
    if re.search(r'мағына|синоним|антоним|сөздің мәтіндегі', s): return 'Аналитикалық ойлау: сөз мағынасы'
    if re.search(r'бос орын|толы?[қт]ыр|толтыр|көп нүкте|\.\.\.|…', s): return 'Аналитикалық ойлау: бос орын'
    if re.search(r'жалғастыр|ретіне|негізгі ой', s): return 'Аналитикалық ойлау: ой желісі'
    return 'Аналитикалық ойлау: мәтіндегі факт'

def stem(w): return w[:5]
def words(s): return set(stem(w) for w in re.findall(r'[а-яәғқңөұүһіa-z0-9]{3,}', s.lower()))
def evidence(passage, ans):
    aw = words(ans); best, bs = None, 0
    if len(aw) < 2 or not passage: return None
    for sn in re.split(r'(?<=[.!?])\s+', passage):
        sc = len(aw & words(sn)) / len(aw)
        if sc > bs: bs, best = sc, sn
    return best if bs >= 0.6 and best and len(best) > 15 else None

GEN = {
    'Аналитикалық ойлау: тақырып': 'Тақырып бүкіл мәтінді қамтуы керек: тым тар (бір деталь) немесе тым кең нұсқа сәйкес келмейді.',
    'Аналитикалық ойлау: мақсат': 'Мақсат — автор мәтінді не үшін жазғаны: түсіндіру, баяндау, сипаттау немесе дәлелдеу. Қалған нұсқалар мәтіннің бір бөлігін ғана қамтиды.',
    'Аналитикалық ойлау: стиль': 'Стильді лексикасы мен мақсатына қарап анықтаймыз: термин мен анықтама — ғылыми, оқиға тізбегі — баяндау, көркем бейне — көркем стиль.',
    'Аналитикалық ойлау: сөз мағынасы': 'Сөзді мәтіндегі сөйлемге қойып тексеріңіз: дұрыс нұсқа қойғанда сөйлемнің мағынасы өзгермейді.',
    'Аналитикалық ойлау: бос орын': 'Нұсқаны бос орынға қойып, сөйлемді түгел оқыңыз: мағынасы мен грамматикасы тек осы нұсқада үйлеседі.',
    'Аналитикалық ойлау: ой желісі': 'Мәтіннің негізгі ойы мен соңғы сөйлемдерінің логикасын жалғастыратын нұсқаны таңдаймыз.',
    'Аналитикалық ойлау: мәтіндегі факт': 'Жауап мәтіндегі деректерге тікелей сүйенеді: қалған нұсқалар мәтінде айтылмаған немесе бұрмаланған.',
}

def norm(s): return re.sub(r'[^а-яәғқңөұүһіa-z0-9]', '', s.lower())

def existing_keys():
    out = set()
    for f in glob.glob(os.path.join(ROOT, 'data/sets/*fundamentals*.js')):
        if re.search(r'/v(6\d|7\d|8\d|90)-', f): continue
        s = open(f, encoding='utf-8').read(); d = json.loads(s[s.index('(') + 1:s.rindex(')')])
        for q in d['questions']: out.add(norm(q['q'])[:60])
    return out

def main():
    seen = existing_keys(); total = 0; dropped = 0; names = []
    for v in range(1, 31):
        if v not in K: continue
        qs = json.load(open(os.path.join(D, 'v%d.q.json' % v))); key = K[v]; out = []
        for q in qs:
            n = q['n']
            if n > len(key) or key[n - 1] == '-': dropped += 1; continue
            fx = FX.get((v, n), {}); qt = fx.get('q') or q['q']; passage = q.get('passage') or ''
            if not fx.get('q') and not passage:
                p2, q2 = split_inline(qt)
                if q2 is None: dropped += 1; continue
                if p2: passage, qt = p2, q2
            for a, b in PFX.get(v, []): passage = passage.replace(a, b); qt = qt.replace(a, b)
            opts = [clean(o) for o in q['opts']]
            for i, t in fx.get('o', {}).items(): opts[i] = t
            qt = clean(re.sub(r'^\s*\d{1,2}\s*[.,]\s*', '', qt)); passage = clean(passage)
            if len(opts) != 4 or any(not o for o in opts) or len(set(map(str.lower, opts))) != 4 or len(qt) < 8:
                dropped += 1; continue
            k = norm(qt)[:60] + '|' + norm(''.join(sorted(opts)))[:40]
            if k in seen: dropped += 1; continue
            seen.add(k)
            c = key[n - 1]; ans = opts[L.index(c)]; tp = topic(qt)
            ex = EX.get((v, n))
            if not ex:
                ev = evidence(passage, ans)
                ex = ('Дұрыс жауап — %s) %s. Мәтінде: «%s»' % (c, ans, ev if len(ev) < 300 else ev[:297] + '…')) if ev else ('Дұрыс жауап — %s) %s. %s' % (c, ans, GEN[tp]))
            elif not ex.startswith('Дұрыс жауап'):
                ex = 'Дұрыс жауап — %s) %s. %s' % (c, ans, ex)
            item = {'id': 'v%d-fundamentals-%d' % (BASE + v, len(out) + 1), 'n': len(out) + 1, 'topic': tp, 'multi': False,
                    'correct': [c], 'q': qt, 'opts': [{'l': L[i], 't': o} for i, o in enumerate(opts)], 'ex': ex}
            if passage and len(passage) > 60: item['passage'] = passage
            out.append(item)
        if not out: continue
        total += len(out); name = 'v%d-fundamentals' % (BASE + v); names.append(name)
        d = {'key': name, 'variant': BASE + v, 'subject': 'fundamentals', 'lang': 'kz', 'origLang': 'kz', 'source': 'col',
             'title': 'Нұсқа %d · ТГО 30-нұсқа №%d: аналитикалық ойлау' % (BASE + v, v), 'questions': out}
        open(os.path.join(ROOT, 'data/sets/%s.js' % name), 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
    idx = os.path.join(ROOT, 'data/index.js'); s = open(idx, encoding='utf-8').read()
    arr = json.loads(s[s.index('['):s.rindex(']') + 1]); arr = [a for a in arr if not re.match(r'v(6[1-9]|7\d|8\d|90)-fundamentals$', a)] + names
    open(idx, 'w', encoding='utf-8').write('Shyn.setFiles(' + json.dumps(arr, ensure_ascii=False) + ');\n')
    print('sets', len(names), 'questions', total, 'dropped', dropped)

main()
