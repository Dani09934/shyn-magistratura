"""tgo30_ex2.EX нақты түсіндірмелерін data/sets/v6x–v9x-fundamentals.js-ке жазады (tgo30_build.py және tgo30_math.py-дан кейін)."""
import json, os, glob, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from tgo30_ex2 import EX
FIXOPT = {('v80-fundamentals-15', '2) Ашық'): 'Ашық', ('v79-fundamentals-8', '. 22.'): 'өсімдік тәрізді'}
n = 0
for f in glob.glob(os.path.join(ROOT, 'data/sets/v*-fundamentals.js')):
    s = open(f, encoding='utf-8').read(); d = json.loads(s[s.index('(') + 1:s.rindex(')')]); ch = False
    for q in d['questions']:
        for o in q['opts']:
            if (q['id'], o['t']) in FIXOPT: o['t'] = FIXOPT[(q['id'], o['t'])]; ch = True
        if q['id'] in EX:
            c = q['correct'][0]; a = [o['t'] for o in q['opts'] if o['l'] == c][0]
            q['ex'] = 'Дұрыс жауап — %s) %s. %s' % (c, a, EX[q['id']]); n += 1; ch = True
    if ch: open(f, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
print('ex applied', n, 'of', len(EX))
