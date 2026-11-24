"""Ағылшын сұрақтарына қазақша аударма тіркеу (идемпотентті, gen_sw.py шақырады).
q.tr  — сұрақ мәтінінің аудармасы (бос орынға дұрыс жауап қойылған күйде);
q.ptr — оқылым/тыңдалым мәтінінің аудармасының нөмірі → data/en_ptr.js ішіндегі Shyn.EN_PTR[нөмір]."""
import glob, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from en_tr_extract import key, filled, plain

D = os.path.join(ROOT, 'tools', 'en_tr')
stems = {}
for f in sorted(glob.glob(os.path.join(D, 's*.json'))): stems.update(json.load(open(f, encoding='utf-8')))
ptr = {}
for f in sorted(glob.glob(os.path.join(D, 'p[0-9]*.json'))): ptr.update({int(k): v for k, v in json.load(open(f, encoding='utf-8')).items()})
groups = json.load(open(os.path.join(D, 'pgroups_keys.json')))
pkey = {k: i for i, ks in enumerate(groups) for k in ks}

idx = open(os.path.join(ROOT, 'data/index.js')).read()
names = json.loads(idx[idx.index('['):idx.rindex(']') + 1])
nq = ns = np_ = 0
for n in names:
    p = os.path.join(ROOT, 'data/sets', n + '.js'); s = open(p, encoding='utf-8').read()
    d = json.loads(s[12:s.rindex(')')])
    if d['subject'] != 'english': continue
    ch = False
    for q in d['questions']:
        nq += 1
        t = stems.get(key(filled(q)))
        if t and q.get('tr') != t: q['tr'] = t; ch = True
        if t: ns += 1
        if q.get('passage'):
            g = pkey.get(key(plain(q['passage'])))
            if g is not None and g in ptr:
                np_ += 1
                if q.get('ptr') != g: q['ptr'] = g; ch = True
    if ch: open(p, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
out = 'Shyn.EN_PTR = ' + json.dumps({str(k): v for k, v in sorted(ptr.items())}, ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'data/en_ptr.js'), 'w', encoding='utf-8').write(out)
print('english', nq, 'stem tr', ns, 'passage tr', np_)
