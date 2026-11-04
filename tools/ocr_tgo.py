"""ТГО 30-нұсқа (аналитикалық ойлау) скриншоттарын OCR.
Нұсқалар — суреттегі карточкалар (tools/tgo_cards.py табады), әр карточка бөлек танылады; қалғаны — сұрақ/мәтін.
Нәтиже: tr/tgo30/v{N}.raw.json = беттер тізімі, әр бетте [('t', мәтін жолдары) | ('o', нұсқа мәтіні)] y ретімен."""
import os, re, json, glob, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tgo_cards import cards
SP = '/tmp/claude-0/-home-claude/0d0c92f0-67af-5a8a-9912-d60791473c66/scratchpad/tessdata'
BASE = '/mnt/user-data/uploads/МАГИСТРАТУРА/МАГИСТРАТУРАҒА ДАЙЫНДЫҚ/6.ТГО  30-нұсқа тесті'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tr', 'tgo30'); os.makedirs(OUT, exist_ok=True)
def ocr(img, psm):
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f: img.save(f.name)
    r = subprocess.run(['tesseract', f.name, '-', '--tessdata-dir', SP, '-l', 'kaz+rus', '--psm', str(psm)], capture_output=True, text=True)
    os.unlink(f.name); return r.stdout
def page(path):
    im = Image.open(path).convert('RGB'); W, H = im.size; cs = cards(path)
    els = []
    for a, b, _ in cs:
        crop = im.crop((0, a, W, b)).resize((W * 2, (b - a) * 2))
        t = re.sub(r'\s+', ' ', ocr(crop, 6)).strip()
        t = re.sub(r'^[^A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі0-9«"]*', '', t)
        t = re.sub(r'^(?:[A-EАВСДЕГЛРТ]\s*[)\]}|]|[A-EАВСДЕ]\)?\s(?=\S))\s*', '', t)
        els.append((a, 'o', t))
    masked = im.copy(); d = ImageDraw.Draw(masked)
    for a, b, _ in cs: d.rectangle((0, a, W, b), fill=(255, 255, 255))
    # мәтін бөліктері: карточкалар арасындағы аймақтар
    edges = [0] + [x for c in cs for x in (c[0], c[1])] + [H]
    for i in range(0, len(edges), 2):
        a, b = edges[i], edges[i + 1] if i + 1 < len(edges) else H
        if b - a < 12: continue
        t = ocr(masked.crop((0, a, W, b)), 4)
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        if lines: els.append((a, 't', lines))
    els.sort(key=lambda e: e[0])
    return [[e[1], e[2]] for e in els]
def run(v):
    d = os.path.join(BASE, '%d-вариант' % v, '1.АНАЛИТИКАЛЫҚ ОЙЛАУ')
    pages = [page(f) for f in sorted(glob.glob(d + '/*.png'))]
    json.dump(pages, open(os.path.join(OUT, 'v%d.raw.json' % v), 'w'), ensure_ascii=False, indent=0)
    return v, len(pages)
if __name__ == '__main__':
    vs = [int(a) for a in sys.argv[1:]] or range(1, 31)
    with ThreadPoolExecutor(3) as ex:
        for v, n in ex.map(run, vs): print(v, n, flush=True)
