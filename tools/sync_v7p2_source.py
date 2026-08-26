from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

held = []
def hold(m):
    held.append(m.group(0))
    return f'__HELD_DATA_URI_{len(held)-1}__'

work = re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', hold, s)
if 'V7P1' not in work:
    raise SystemExit('Expected V7P1 source markers not found')
work = work.replace('V7P1', 'V7P2')

start = work.find('<section class="view" id="view-budget">')
end = work.find('</section>', start)
if start < 0 or end < 0:
    raise SystemExit('Budget section not found')
seg = work[start:end]
pattern = re.compile(r'<div class="budget-summary">[\s\S]*?</div>\s*<p class="budget-note">[\s\S]*?</p>')
replacement = '''<div class="budget-summary">
<div class="money-card"><span>已付款｜原幣</span><b>NT$123,538.73<br>＋¥139,715</b></div>
<div class="money-card"><span>已付款換算｜TWD</span><b>約 NT$151,287.53</b></div>
<div class="money-card"><span>已知待付款｜JPY</span><b>¥28,760</b></div>
<div class="money-card"><span>已退款｜不計入支出</span><b>NT$22,403<br>＋¥32,400</b></div>
<div class="money-card"><span>目前可計算合計｜TWD</span><b>約 NT$156,999.55</b></div>
<div class="money-card alert"><span>預估旅行總預算</span><b>待確認</b></div>
</div>
<p class="budget-note">載入最新 JPY→TWD 參考匯率中；所有日幣保留原幣並同步顯示新台幣參考值。實際信用卡／換匯入帳可能因銀行匯差與手續費不同。</p>'''
seg2, count = pattern.subn(replacement, seg, count=1)
if count != 1:
    raise SystemExit(f'Budget summary replacement count={count}')
seg2 = seg2.replace('¥100,005／約NT$21,412.08', '¥100,005')
seg2 = seg2.replace('¥100,005，約NT$21,412.08', '¥100,005')
seg2 = seg2.replace('退款¥32,400，約NT$6,937.17', '退款¥32,400')
work = work[:start] + seg2 + work[end:]
work = work.replace('退款¥32,400，約NT$6,937.17；無取消費，信用卡退款已完成。', '退款¥32,400；台幣換算以預算頁當下匯率為準；無取消費，信用卡退款已完成。')

for i, data in enumerate(held):
    work = work.replace(f'__HELD_DATA_URI_{i}__', data)

p.write_text(work, encoding='utf-8')
print('index.html synchronized to V7P2')
