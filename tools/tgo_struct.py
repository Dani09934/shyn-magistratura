"""tr/tgo30/v{N}.raw.json → сұрақтар (v{N}.q.json)."""
import json, re, os, glob, sys
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tr', 'tgo30')
SKIP = re.compile(r'^(Аналитикалық ойлау|Пройдите онлайн|.*ЗАВЕРШЕНИЯ|.*ВОПРОС|\W*)$', re.I)
def fix(t): return re.sub(r'\s+', ' ', t).strip()
def build(v):
    P = json.load(open(D + '/v%d.raw.json' % v))
    qs = []; passage = None; cur = None; pend = []; inpass = False
    for p in P:
        for kind, val in p:
            if kind == 'o':
                if cur is None or len(cur['opts']) >= 4:
                    if not pend and cur is not None and len(cur['opts']) >= 4: continue  # артық карточка
                    m = re.match(r'^\s*(\d{1,2})\s*[.,]\s*', ' '.join(pend))
                    cur = {'n': len(qs) + 1, 'q': fix(re.sub(r'^\s*\d{1,2}\s*[.,]\s*', '', re.sub(r'^.*?ТЕСТА\s*', '', ' '.join(pend)))), 'opts': [], 'passage': passage}
                    qs.append(cur); pend = []
                cur['opts'].append(fix(re.sub(r'^\s*(?:[A-Za-zА-Яа-яӘәҢңҰұ]{1,2}\s*\)|\))\s*', '', val))); continue
            real = [t for t in val if not (SKIP.match(t) and len(t) < 90)]
            if real and cur is not None: cur = None  # мәтін келсе, алдыңғы сұрақ жабылады
            for t in val:
                if SKIP.match(t) and len(t) < 90: continue
                if re.match(r'Келесі тапсырма', t): passage = ''; inpass = True; pend = []; continue
                m = re.match(r'^(\d{1,2})\s*[.,]\s*(.*)$', t)
                if m and inpass and len(t) < 260: inpass = False
                if inpass: passage = fix(passage + ' ' + t); 
                else: pend.append(t)
            if cur is not None and len(cur['opts']) >= 4: cur = None
    qs = [q for q in qs if len(q['opts']) == 4 and q['q']]
    for q in qs:
        m = re.search(r'^(?:Тапсырмаға қосымша\W*|Тапсырмаға қосымша материалдар\W*)(.*)\s(\d{1,2})\s*\.\s+(\S.*)$', q['q'])
        if m and len(m.group(1)) > 80: q['passage'] = fix(m.group(1)); q['q'] = fix(m.group(3))
        elif not q['passage'] or 'Тапсырмаға' in q['q']:
            m = re.search(r'^(.{120,}?)\s(\d{1,2})\s*\.\s+([А-ЯӘҒҚҢӨҰҮҺІ«].{5,})$', q['q'])
            if m and ('Тапсырмаға' in q['q'] or 'тапсырмалар' in q['q']): q['passage'] = fix(re.sub(r'^.*?(Тапсырмаға қосымша\W*|төмендегі мәтін бойынша\s*)', '', m.group(1))); q['q'] = fix(m.group(3))
    for i, q in enumerate(qs, 1): q['n'] = i
    json.dump(qs, open(D + '/v%d.q.json' % v, 'w'), ensure_ascii=False, indent=1)
    return len(qs)
if __name__ == '__main__':
    vs = [int(a) for a in sys.argv[1:]] or range(1, 31)
    print(' '.join('%d:%d' % (v, build(v)) for v in vs))
