"""Ағылшын сұрақтарының аударылатын мәтіндерін жинау: сұрақ (бос орынға дұрыс жауап қойылған) және оқылым мәтіндері.
Нәтиже: scratch/en_items.json  {key: text}. Кілт — мәтіннің md5-і (8 таңба)."""
import json, os, re, hashlib, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BL = re.compile(r'_{2,}|\.{4,}|…{2,}|\(\s*\)')

def key(t): return hashlib.md5(t.encode()).hexdigest()[:10]

def filled(q):
    t = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', q['q'])).strip()
    if q.get('multi') or len(q['correct']) != 1: return t
    a = next((o.get('t') or '') for o in q['opts'] if o['l'] == q['correct'][0]).strip()
    gaps = BL.findall(t)
    if len(gaps) == 1 and a and len(a) < 60 and '/' not in a and not re.search(r'[,;] ', a):
        return BL.sub('[' + a + ']', t, count=1)
    return t

def plain(p): return re.sub(r'[ \t]+', ' ', re.sub(r'<br\s*/?>', '\n', re.sub(r'<(?!br)[^>]+>', ' ', p))).strip()

def iter_q():
    idx = open(os.path.join(ROOT, 'data/index.js')).read()
    for n in json.loads(idx[idx.index('['):idx.rindex(']') + 1]):
        s = open(os.path.join(ROOT, 'data/sets', n + '.js')).read(); d = json.loads(s[12:s.rindex(')')])
        if d['subject'] == 'english':
            for q in d['questions']: yield n, q

if __name__ == '__main__':
    stems, pas = {}, {}
    for n, q in iter_q():
        t = filled(q); stems[key(t)] = t
        if q.get('passage'): p = plain(q['passage']); pas[key(p)] = p
    out = sys.argv[1]
    json.dump({'stems': stems, 'passages': pas}, open(out, 'w'), ensure_ascii=False, indent=0)
    print(len(stems), len(pas), sum(map(len, stems.values())), sum(map(len, pas.values())))
