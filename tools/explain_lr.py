"""Тыңдалым және оқылым сұрақтарына түсіндірме: дұрыс жауаптың мәтіндегі дәлелін (сөйлемін) тауып жазады.
Тек түсіндірмесі жоқ сұрақтарға қолданылады. python3 tools/explain_lr.py"""
import json, os, re, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STOP = set('the a an of to in on at for and or is are was were be been it its this that with by from as he she they we you i his her their our my your not do does did has have had will would can could than then there what which who how why when'.split())
def words(s): return [w for w in re.findall(r"[a-z0-9']+", s.lower()) if w not in STOP and len(w) > 1]
def stem(w): return re.sub(r"(ing|ed|es|s|'s)$", '', w) if len(w) > 4 else w
def sents(p):
    p = re.sub(r'\s+', ' ', p)
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z"“‘\-])', p) if len(x.strip()) > 3]
done = 0; total = 0
for f in sorted(glob.glob(os.path.join(ROOT, 'data/sets/*english*.js'))):
    s = open(f, encoding='utf-8').read(); d = json.loads(s[s.index('(') + 1:s.rindex(')')]); ch = False
    for q in d['questions']:
        if q.get('ex') or not q.get('passage') or q.get('missing'): continue
        total += 1
        corr = [o for o in q['opts'] if o['l'] in q['correct']]
        if not corr: continue
        ans = corr[0]['t']; aw = set(stem(w) for w in words(ans)); qw = set(stem(w) for w in words(q['q']))
        best, bs = None, 0
        for sn in sents(q['passage']):
            sw = set(stem(w) for w in words(sn))
            if not sw: continue
            sc = (len(aw & sw) / max(1, len(aw))) * 2 + len(qw & sw) / max(1, len(qw))
            if sc > bs: bs, best = sc, sn
        lis = q['topic'].startswith('Тыңдалым')
        if best and bs >= 1.2:
            q['ex'] = 'Дұрыс жауап — %s) %s. %s: «%s»' % (q['correct'][0], ans, 'Тыңдалым мәтінінде' if lis else 'Мәтінде', best if len(best) < 320 else best[:317] + '…')
            q['ex'] += ' Қалған нұсқалар мәтінде айтылмайды немесе басқа деректі сипаттайды.'
        else:
            q['ex'] = 'Дұрыс жауап — %s) %s. Бұл сұрақ мәтіннің жалпы мазмұнын түсінуді тексереді: жауап бір сөйлемде тікелей жазылмаған, оны абзацтың негізгі ойынан шығару керек. Мәтінді қайта оқып, «%s» деген тұжырымды растайтын жерін табыңыз.' % (q['correct'][0], ans, ans)
        done += 1; ch = True
    if ch: open(f, 'w', encoding='utf-8').write('Shyn.addSet(' + json.dumps(d, ensure_ascii=False) + ');\n')
print('explained', done, 'of', total)
