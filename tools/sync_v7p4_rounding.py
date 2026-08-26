from pathlib import Path
import re
from decimal import Decimal, ROUND_HALF_UP

INDEX=Path('index.html')
SW=Path('service-worker.js')
s=INDEX.read_text(encoding='utf-8')
held=[]
def hold(m):
    held.append(m.group(0)); return f'__HELD_DATA_URI_{len(held)-1}__'
work=re.sub(r'data:[^"\']+;base64,[A-Za-z0-9+/=]+',hold,s)
if 'V7P3' not in work:
    raise SystemExit('Expected V7P3 markers not found')
work=work.replace('V7P3','V7P4')

def repl(m):
    raw=m.group(1).replace(',','')
    val=Decimal(raw)
    if abs(val)<1:
        return m.group(0)
    q=val.quantize(Decimal('1'),rounding=ROUND_HALF_UP)
    return 'NT$'+f'{int(q):,}'
work=re.sub(r'NT\$([0-9][0-9,]*(?:\.[0-9]+)?)',repl,work)
work=work.replace('minimumFractionDigits:2,maximumFractionDigits:2','minimumFractionDigits:0,maximumFractionDigits:0')
work=work.replace('minimumFractionDigits: 2,maximumFractionDigits: 2','minimumFractionDigits: 0,maximumFractionDigits: 0')
work=work.replace('minimumFractionDigits:2, maximumFractionDigits:2','minimumFractionDigits:0, maximumFractionDigits:0')
work=work.replace('minimumFractionDigits: 2, maximumFractionDigits: 2','minimumFractionDigits: 0, maximumFractionDigits: 0')
work=work.replace('App 所有金額只顯示新台幣；原始日幣、換算匯率與查帳紀錄保留在 Excel。','App 所有金額只顯示新台幣整數；原始日幣、精確換算值、換算匯率與查帳紀錄保留在 Excel。')
work=work.replace('App 金額一律只顯示新台幣','App 金額一律只顯示四捨五入到個位數的新台幣')
for i,data in enumerate(held):
    work=work.replace(f'__HELD_DATA_URI_{i}__',data)
INDEX.write_text(work,encoding='utf-8')

sw=SW.read_text(encoding='utf-8')
sw=re.sub(r'const CACHE = "tohoku-v7p3-public-[0-9]+";', 'const CACHE = "tohoku-v7p4-public-1";', sw)
if 'tohoku-v7p4-public-1' not in sw:
    raise SystemExit('cache key update failed')
SW.write_text(sw,encoding='utf-8')

check=re.sub(r'data:[^"\']+;base64,[A-Za-z0-9+/=]+','',work)
if 'V7P3' in check: raise SystemExit('stale V7P3 marker remains')
for m in re.finditer(r'NT\$([0-9][0-9,]*)\.([0-9]+)',check):
    val=Decimal(m.group(1).replace(',','')+'.'+m.group(2))
    if abs(val)>=1: raise SystemExit('visible decimal amount remains: '+m.group(0))
print('V7P4 whole-dollar display synchronized')
