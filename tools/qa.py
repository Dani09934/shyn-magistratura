"""Барлық сұрақтардың сапасын тексеру. python3 tools/qa.py"""
import json, os, re, glob, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = collections.defaultdict(list); seen = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'data/sets/*.js'))):
    s = open(f, encoding='utf-8').read(); d = json.loads(s[s.index('(') + 1:s.rindex(')')])
    for q in d['questions']:
        if q.get('missing'): continue
        i = q['id']; L = [o['l'] for o in q['opts']]; T = [(o['t'] or o.get('code') or '').strip() for o in q['opts']]
        if not q['q'].strip(): P['empty_q'].append(i)
        if len(L) < 3: P['few_opts'].append(i)
        if len(set(L)) != len(L): P['dup_letters'].append(i)
        if len(set(t.lower() for t in T)) != len(T): P['dup_opts'].append(i)
        if any(not t for t in T): P['empty_opt'].append(i)
        if not q['correct'] or any(c not in L for c in q['correct']): P['bad_key'].append(i)
        if not q.get('multi') and len(q['correct']) != 1: P['single_multi'].append(i)
        if not q.get('ex'): P['no_ex'].append(i)
        if re.search(r'[�\U0001D400-\U0001D7FF]|\s[ЕE]Ш\s|ЕЕ сис', q['q'] + ' '.join(T)): P['garbage'].append(i)
        if re.search(r'(?<![A-Za-z])(\$\$|\$)(?=\S)', q['q'] + ' '.join(T)): P['dollar'].append(i)
        ex = q.get('ex', '')
        m = re.findall(r'(?:—|:|\()\s*([A-H])\)', ex[:60])
        if m and m[0] not in q['correct'] and not q.get('multi'): P['ex_key_mismatch'].append(i)
        k = re.sub(r'\W', '', q['q'].lower()) + '|' + '|'.join(sorted(re.sub(r'\W', '', t.lower()) for t in T))
        ct = sorted(re.sub(r'\W', '', T[L.index(c)].lower()) for c in q['correct'] if c in L)
        if k in seen and seen[k][1] != ct: P['dup_conflict'].append(i + ' vs ' + seen[k][0])
        seen.setdefault(k, (i, ct))
for k, v in P.items(): print(k, len(v), v[:8])
json.dump(P, open('/tmp/qa.json', 'w'), ensure_ascii=False)
