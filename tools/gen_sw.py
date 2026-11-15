"""sw.js-ті қайта жасайды: офлайн жұмыс үшін алдын ала кэштелетін файлдар тізімі және мазмұн хешіне негізделген нұсқа.
Әр өзгерістен кейін іске қосыңыз: python3 tools/gen_sw.py"""
import hashlib, os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Барлық сұрақ жинақтарын бір файлға біріктіреміз: телефонда 132 сұраныстың орнына 1 сұраныс (GitHub Pages оны gzip-пен ~4 есе қысады)
idx = open(os.path.join(ROOT, 'data', 'index.js'), encoding='utf-8').read()
names = json.loads(idx[idx.index('['):idx.rindex(']') + 1])
with open(os.path.join(ROOT, 'data', 'bundle.js'), 'w', encoding='utf-8') as out:
    out.write('/* Автоматты түрде жасалады: tools/gen_sw.py — қолмен өзгертпеңіз */\n')
    for n in names:
        out.write(open(os.path.join(ROOT, 'data', 'sets', n + '.js'), encoding='utf-8').read().strip() + '\n')
files = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg']
for d in ['css', 'js', 'data', 'icons', 'vendor']:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in sorted(fs):
            rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, '/')
            if rel.startswith('data/sets/'): continue  # олар bundle.js ішінде
            files.append(rel)
h = hashlib.sha1()
for f in files:
    if f in ('./', 'index.html'): continue
    p = os.path.join(ROOT, f)
    h.update(f.encode()); h.update(open(p, 'rb').read())
h.update(open(os.path.join(ROOT, 'tools', 'sw.template.js'), 'rb').read())
ver = h.hexdigest()[:10]
# index.html: барлық жергілікті скрипт/стильге бір нұсқа белгісі (браузер кэшінен ескі файл келмеуі үшін)
ip = os.path.join(ROOT, 'index.html'); html = open(ip, encoding='utf-8').read()
def stamp(m):
    attr, path = m.group(1), m.group(2)
    if path.startswith('http') or path.startswith('//'): return m.group(0)
    return '%s="%s?v=%s"' % (attr, path.split('?')[0], ver)
html = re.sub(r'(src|href)="((?:js|data|css)/[^"]+)"', stamp, html)
html = re.sub(r'window\.SHYN_BUILD="[^"]*"', 'window.SHYN_BUILD="%s"' % ver, html)
open(ip, 'w', encoding='utf-8').write(html)
tpl = open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8').read()
out = tpl.replace('__VERSION__', ver).replace('__FILES__', json.dumps(files, ensure_ascii=False, indent=0))
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(out)
print('sw.js', ver, len(files), 'files')
