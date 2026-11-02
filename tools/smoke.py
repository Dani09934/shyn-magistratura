import sys
from playwright.sync_api import sync_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else '.'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp in [('desk',{'width':1360,'height':900}),('mob',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp)
        pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8766/'); pg.wait_for_selector('.hero',timeout=15000)
        pg.screenshot(path=f'{OUT}/{name}-home.png',full_page=True)
        for r in ['variants','cards','sorting','synonyms','bank','stats','settings']:
            pg.goto(f'http://localhost:8766/#/{r}'); pg.wait_for_timeout(300)
            if name=='desk' or r in('variants',): pg.screenshot(path=f'{OUT}/{name}-{r}.png',full_page=False)
        # тест: жаттығу
        pg.goto('http://localhost:8766/#/variants'); pg.wait_for_timeout(200)
        pg.click('[data-set="v1-algo"]'); pg.wait_for_selector('.q')
        pg.click('.opt >> nth=0'); pg.click('#checkBtn'); pg.wait_for_selector('.explain')
        pg.screenshot(path=f'{OUT}/{name}-quiz.png',full_page=False)
        pg.keyboard.press('ArrowRight'); pg.keyboard.press('b'); pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
        pg.on('dialog',lambda d: d.accept())
        if name=='desk': pg.click('#finishBtn')
        else: pg.evaluate("document.getElementById('finishBtn').click()")
        if pg.locator('#askYes').count(): pg.click('#askYes')
        pg.wait_for_selector('.result'); pg.screenshot(path=f'{OUT}/{name}-result.png',full_page=False)
        # db множественный
        pg.goto('http://localhost:8766/#/variants'); pg.wait_for_timeout(200)
        pg.click('[data-set="v1-db"]'); pg.wait_for_selector('.q')
        pg.click('.opt >> nth=0'); pg.click('.opt >> nth=1'); pg.click('#checkBtn'); pg.wait_for_selector('.explain')
        pg.screenshot(path=f'{OUT}/{name}-quizdb.png',full_page=False)
        pg.goto('http://localhost:8766/#/'); pg.wait_for_selector('.hero'); pg.screenshot(path=f'{OUT}/{name}-home2.png',full_page=True)
    # тёмная
    pg=b.new_page(viewport={'width':1360,'height':900},color_scheme='dark')
    pg.goto('http://localhost:8766/#/variants'); pg.wait_for_selector('.variant'); pg.screenshot(path=f'{OUT}/dark-variants.png')
    b.close()
print('ERRORS:',errs)
