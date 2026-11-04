from PIL import Image
def cards(path):
    im = Image.open(path).convert('RGB'); W, H = im.size
    xs = [int(W * f) for f in (0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95)]
    def kind(y):
        ps = [im.getpixel((x, y)) for x in xs]
        if all(236 <= p[0] <= 249 and abs(p[0] - p[2]) < 6 for p in ps): return 'g'
        if sum(1 for p in ps if 225 <= p[0] <= 249 and p[2] - p[0] >= 8) >= 4: return 'l'
        return None
    runs = []
    for y in range(H):
        k = kind(y)
        if k and runs and runs[-1][0] == k and y - runs[-1][2] <= (4 if k == 'l' else 1): runs[-1][2] = y
        elif k: runs.append([k, y, y])
    out = []; gl = []
    for k, a, b in runs:
        if k == 'l' and 25 <= b - a <= 300: out.append((a, b, True))
        elif k == 'g' and b - a <= 3: gl.append(a)
    i = 0
    while i < len(gl) - 1:
        a, b = gl[i], gl[i + 1]
        inside = any(x[0] > a and x[1] < b for x in out)
        if 25 <= b - a <= 300 and not inside:
            dark = sum(1 for y in range(a + 3, b - 2) for x in range(15, 95, 2) if sum(im.getpixel((x, y))) < 650)
            if dark >= 4: out.append((a, b, False)); i += 2; continue
        i += 1
    # соңғы карточка суреттің шетінде қиылып қалса
    used = set(); [used.update((c[0], c[1])) for c in out]
    if gl and gl[-1] not in used and H - gl[-1] >= 25 and not any(c[0] > gl[-1] for c in out):
        a = gl[-1]; dark = sum(1 for y in range(a + 3, min(H, a + 45)) for x in range(15, 95, 2) if sum(im.getpixel((x, y))) < 650)
        if dark >= 4: out.append((a, H - 1, False))
    return sorted(out)
if __name__ == '__main__':
    import sys
    for p in sys.argv[1:]: print(p.split('/')[-1], [c[:2] for c in cards(p)], sum(c[2] for c in cards(p)))
