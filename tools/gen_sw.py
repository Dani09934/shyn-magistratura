"""sw.js-ті қайта жасайды: офлайн жұмыс үшін алдын ала кэштелетін файлдар тізімі және мазмұн хешіне негізделген нұсқа.
Әр өзгерістен кейін іске қосыңыз: python3 tools/gen_sw.py"""
import hashlib, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg']
for d in ['css', 'js', 'data', 'icons']:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in sorted(fs):
            files.append(os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, '/'))
h = hashlib.sha1()
for f in files:
    p = os.path.join(ROOT, 'index.html' if f == './' else f)
    h.update(f.encode()); h.update(open(p, 'rb').read())
ver = h.hexdigest()[:10]
tpl = open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8').read()
out = tpl.replace('__VERSION__', ver).replace('__FILES__', json.dumps(files, ensure_ascii=False, indent=0))
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(out)
print('sw.js', ver, len(files), 'files')
