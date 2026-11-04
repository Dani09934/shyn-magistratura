"""tr/col/gex*.py ішіндегі түсіндірмелер мен түзетулерді сұрақ файлдарына енгізеді. python3 tools/apply_gex.py"""
import json, os, glob, runpy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX, FIX, DROP = {}, {}, set()
for f in sorted(glob.glob(os.path.join(ROOT, 'tr/col/gex*.py'))):
    m = runpy.run_path(f); EX.update(m['EX']); FIX.update(m.get('FIX', {})); DROP |= set(m.get('DROP', []))
n = d_ = 0
for f in glob.glob(os.path.join(ROOT, 'data/sets/*english*.js')):
    s = open(f, encoding='utf-8').read(); d = json.loads(s[s.index('(') + 1:s.rindex(')')]); ch = False
    qs = []
    for q in d['questions']:
        if q['id'] in DROP: ch = True; d_ += 1; continue
        if q['id'] in FIX:
            fx = FIX[q['id']]
            if 'q' in fx: q['q'] = fx['q']
            if 'opts' in fx: q['opts'] = [{'l': a, 't': b} for a, b in fx['opts']]
            if 'correct' in fx: q['correct'] = [fx['correct']]
            ch = True
        if q['id'] in EX and not q.get('ex'): q['ex'] = EX[q['id']]; n += 1; ch = True
        qs.append(q)
    for i, q in enumerate(qs): q['n'] = i + 1
    d['questions'] = qs
    if ch: open(f, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
print('explained', n, 'dropped', d_, 'fixes', len(FIX))
