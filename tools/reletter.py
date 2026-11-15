"""Авторлық жинақтардағы (v91–v94) дұрыс жауап әрпінің бір жаққа ауып кетуін жою.
Нұсқалар реті id + мәтін хэшімен анықталады (идемпотентті: қайта іске қосу ретті өзгертпейді),
әріптер қайта A, B, C… беріледі, `correct` және түсіндірмедегі «X) <нұсқа мәтіні>» сілтемелері жаңартылады.
python3 tools/reletter.py   (gen_sw.py өзі шақырады)"""
import glob, hashlib, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = 'data/sets/v9[1-5]-*.js'


def opt_text(o):
    return (o.get('t') or o.get('code') or '').strip()


def process(q):
    opts = q['opts']
    if len(opts) < 2 or q.get('missing'):
        return False
    order = sorted(opts, key=lambda o: hashlib.md5((q['id'] + '|' + opt_text(o)).encode()).hexdigest())
    letters = [chr(65 + i) for i in range(len(order))]
    mp = {o['l']: letters[i] for i, o in enumerate(order)}
    if all(k == v for k, v in mp.items()):
        return False
    ex = q.get('ex', '')
    texts = {o['l']: opt_text(o) for o in opts}

    def rep(m):
        L = m.group(1)
        t = texts.get(L, '')
        rest = ex[m.end():m.end() + 40].strip()
        if L in mp and t and rest.startswith(t[:6]):
            return '\x00' + mp[L] + ')' + m.group(2)
        return m.group(0)
    ex = re.sub(r'(?:(?<=^)|(?<=[\s—,;:.]))([A-F])\)(\s*)', rep, ex).replace('\x00', '')
    q['ex'] = ex
    for i, o in enumerate(order):
        o['l'] = letters[i]
    q['opts'] = order
    q['correct'] = sorted(mp[c] for c in q['correct'])
    return True


def main():
    for f in sorted(glob.glob(os.path.join(ROOT, PATTERN))):
        src = open(f, encoding='utf-8').read()
        d = json.loads(src[len('Shyn.addSet('):src.rindex(')')])
        n = sum(process(q) for q in d['questions'])
        if n:
            open(f, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
        from collections import Counter
        c = Counter(''.join(q['correct']) for q in d['questions'])
        print(os.path.basename(f), 'өзгерді:', n, dict(sorted(c.items())))


if __name__ == '__main__':
    main()
