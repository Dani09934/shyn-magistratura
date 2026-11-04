"""«АҒЫЛШЫН ТІЛІ – 20 НҰСҚА (2023 ЖЫЛ)» жинағынан КТ форматындағы 20 нұсқа жасайды.
Кіріс: pdftotext -layout нәтижесі (tr/col/eng2023.txt). python3 tools/eng2023.py"""
import json, os, re, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = open(os.path.join(ROOT, 'tr/col/eng2023.txt'), encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(T) if l.strip() == 'ТЫҢДАЛЫМ' and i > 40)
tx0 = next(i for i, l in enumerate(T) if re.match(r'^\s*1 – НҰСҚА\s*$', l))
an0 = next(i for i, l in enumerate(T) if re.match(r'^\s*1 - НҰСҚА\s*$', l) and i > tx0)
BODY, TRANS, ANS = T[start:tx0], T[tx0:an0], T[an0:]

def clean(s):
    s = s.replace(' ', ' ')
    s = re.sub(r'(?:_+\s*){1,}_*', ' ___ ', s)         # бос орындар
    s = re.sub(r'\s{2,}', ' ', s).strip()
    s = re.sub(r'(___ )+___', '___', s)
    return s.replace(' ___ .', ' ___.').replace(' ___ ?', ' ___?').strip()
PAGE = re.compile(r'^\s*\d{1,3}\s*$')
def blank(s):
    s = re.sub(r'(?<=\S)\s{4,}(?=\S)', ' ___ ', s)
    s = re.sub(r'(?<=[a-z,])\s+([.?!])\s*$', r' ___\1', s)
    return s

# ---- жауаптар ----
keys = {}
cur = 0
for l in ANS:
    m = re.match(r'^\s*(\d+) - НҰСҚА\s*$', l)
    if m: cur = int(m.group(1)); keys[cur] = {}; continue
    for n, a in re.findall(r'(\d+)\.\s*([ABCD])', l):
        if cur: keys[cur][int(n)] = a
# ---- тыңдалым мәтіндері ----
trans = {}; cur = 0; tname = None; buf = []
def flush():
    if cur and tname: trans.setdefault(cur, {})[tname] = '\n'.join(x for x in buf).strip()
for l in TRANS:
    m = re.match(r'^\s*(\d+) – НҰСҚА\s*$', l)
    if m: flush(); cur = int(m.group(1)); tname = None; buf = []; continue
    m = re.match(r'^\s*(Text \d+)\s*$', l)
    if m: flush(); tname = m.group(1); buf = []; continue
    if PAGE.match(l): continue
    buf.append(l.strip())
flush()
for v in trans:
    for k in trans[v]:
        trans[v][k] = re.sub(r'\n{2,}', '\n\n', re.sub(r'(?<=\S)\n(?=[a-zа-я])', ' ', trans[v][k])).strip()

# ---- сұрақтар ----
variants = []; cur = None; section = None; text = None; passage = []; collecting = False
q = None
def push_q():
    global q
    if q and cur is not None:
        q['q'] = clean(' '.join(q['qparts'])); del q['qparts']
        cur['qs'].append(q)
    q = None
for l in BODY + ['ТЫҢДАЛЫМ']:
    s = l.strip()
    if PAGE.match(l): continue
    if s == 'ТЫҢДАЛЫМ':
        push_q(); cur = {'qs': [], 'texts': {}}; variants.append(cur); section = 'L'; text = None; continue
    if s.startswith('ЛЕКСИКА - ГРАММАТИКАЛЫҚ'): push_q(); section = 'G'; text = None; continue
    if s == 'ОҚЫЛЫМ': push_q(); section = 'R'; text = None; continue
    m = re.match(r'^(Text \d+)$', s)
    if m:
        push_q(); text = m.group(1); passage = []; collecting = section == 'R'; cur['texts'][(section, text)] = ''; continue
    mq = re.match(r'^(\d{1,2})\.\s*(.*)$', s)
    if mq and 1 <= int(mq.group(1)) <= 50 and (q is None or q['opts'] or int(mq.group(1)) == (cur['qs'][-1]['n'] + 1 if cur['qs'] else 1)):
        if collecting: cur['texts'][(section, text)] = re.sub(r'(?<!\n)\n(?!\n)', ' ', '\n'.join(passage)).strip(); collecting = False
        raw = re.sub(r'^\s*\d{1,2}\.\s*', '', l.rstrip())
        push_q(); q = {'n': int(mq.group(1)), 'sec': section, 'text': text, 'qparts': [blank(raw)], 'opts': []}; continue
    mo = re.match(r'^([ABCD])\)\s*(.*)$', s)
    if mo and q is not None:
        q['opts'].append([mo.group(1), mo.group(2)]); continue
    if collecting:
        if not s:
            if passage and passage[-1] != '': passage.append('')
        elif re.match(r'^\s{4,}', l) and passage and passage[-1] != '': passage.extend(['', s])
        else: passage.append(s)
        continue
    if q is not None and s:
        if q['opts'] and not re.match(r'^[A-D]\)', s):
            # не жалғас, не опциядан кейінгі сөйлем бөлігі (layout-та бос орыннан кейінгі сөздер)
            if len(q['opts']) < 4: q['opts'][-1][1] += ' ' + s
            else: q['qparts'].append(blank(l.strip()))
        else: q['qparts'].append(blank(l.strip()))
push_q()
variants = [v for v in variants if len(v['qs']) >= 40]
print('variants', len(variants), [len(v['qs']) for v in variants])

def norm(s): return re.sub(r'\W', '', s.lower())[:60]
exist = set()
for f in os.listdir(os.path.join(ROOT, 'data/sets')):
    if re.match(r'v(4\d|5\d)-english', f): continue
    s = open(os.path.join(ROOT, 'data/sets', f), encoding='utf-8').read()
    d = json.loads(s[s.index('(') + 1:s.rindex(')')])
    for qq in d['questions']: exist.add(norm(qq['q']) + '|' + norm(' '.join(o['t'] for o in qq['opts'])))

GT = [(r'adverb', 'Үстеу'), (r'\bmood\b', 'Рай'), (r'\b(was|were|is|are|be|been)\b.*\b(built|written|made|done|given|taken|sent|told|found|held|known|called|invented|discovered|painted|cancelled)\b|passive', 'Ырықсыз етіс'),
      (r'\bmood\b', 'Рай'), (r'\bif\b|\bwish\b', 'Шартты сөйлем, wish'),
      (r'synonym|antonym|meaning|closest|opposite', 'Лексика: синоним, антоним'),
      (r'adverb', 'Үстеу'), (r'\b(in|on|at)\b\s*$|preposition', 'Предлогтар'),
      (r'\b(a|an|the)\b ___|___ (hotel|sun|moon)|article', 'Артикльдер'),
      (r'allowed|enjoy|decided|stop|remember|avoid|afford|let|make|want|would like|infinitive|gerund', 'Инфинитив және герундий'),
      (r'can|could|must|should|may|might|able|have to', 'Модаль етістіктер')]
def gtopic(q):
    t = (q['q'] + ' ' + ' '.join(o[1] for o in q['opts'])).lower()
    for rx, name in GT:
        if re.search(rx, t): return name
    return 'Шақтар және етістік формалары'
files = []; total = 0; skipped = 0; R = {'nokey': 0, 'opts': 0, 'dup': 0}
for vi, v in enumerate(variants, 1):
    K = keys.get(vi, {}); out = []
    for x in v['qs']:
        if x['n'] not in K: R['nokey'] += 1; continue
        if len(x['opts']) != 4: R['opts'] += 1; continue
        opts = [{'l': o[0], 't': clean(o[1])} for o in x['opts']]
        if any(not o['t'] for o in opts): skipped += 1; continue
        item = {'topic': '', 'multi': False, 'correct': [K[x['n']]], 'q': x['q'], 'opts': opts, 'ex': ''}
        if x['sec'] == 'L':
            tr = trans.get(vi, {}).get(x['text'], '')
            item['topic'] = 'Тыңдалым · ' + (x['text'] or '')
            if tr: item['passage'] = tr
        elif x['sec'] == 'R':
            item['topic'] = 'Оқылым · ' + (x['text'] or '')
            p = v['texts'].get(('R', x['text']), '')
            if p: item['passage'] = p
        else:
            item['topic'] = gtopic(x)
        k = norm(item['q']) + '|' + norm(' '.join(o['t'] for o in opts))
        if k in exist: R['dup'] += 1; continue
        out.append(item)
    vn = 39 + vi; key = 'v%d-english' % vn
    st = {'key': key, 'variant': vn, 'subject': 'english', 'lang': 'kz', 'origLang': 'en', 'source': 'col',
          'title': 'Нұсқа %d · Ағылшын тілі (2023 жинағы, %d-нұсқа)' % (vn, vi),
          'questions': [dict({'id': key + '-' + str(i + 1), 'n': i + 1}, **q) for i, q in enumerate(out)]}
    open(os.path.join(ROOT, 'data/sets', key + '.js'), 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(st, ensure_ascii=False) + ');\n')
    files.append(key); total += len(out)
print('questions', total, R)
idx = os.path.join(ROOT, 'data/index.js')
cur = json.loads(open(idx, encoding='utf-8').read().split('(', 1)[1].rsplit(')', 1)[0])
cur = [c for c in cur if not re.match(r'v(4\d|5\d)-english$', c)] + files
open(idx, 'w', encoding='utf-8').write('Shyn.setFiles(' + json.dumps(cur, ensure_ascii=False) + ');\n')
