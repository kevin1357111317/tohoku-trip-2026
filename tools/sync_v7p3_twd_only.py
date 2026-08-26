from pathlib import Path
import re

RATE = 0.19861
INDEX = Path("index.html")
SW = Path("service-worker.js")

s = INDEX.read_text(encoding="utf-8")

held = []
def hold(m):
    held.append(m.group(0))
    return f"__HELD_DATA_URI_{len(held)-1}__"

work = re.sub(r'data:[^"\']+;base64,[A-Za-z0-9+/=]+', hold, s)
work = re.sub(r'<script id="V7P3_LIVE_FX">[\s\S]*?</script>', '', work)
work = work.replace("V7P2", "V7P3")
for i, data in enumerate(held):
    work = work.replace(f"__HELD_DATA_URI_{i}__", data)

yen_pat = re.compile(r'¥\s*([0-9][0-9,]*(?:\.\d+)?)')
def yen_to_twd(m):
    raw = m.group(1)
    jpy = float(raw.replace(",", ""))
    data = str(int(jpy)) if jpy.is_integer() else str(jpy)
    return f'<span class="fx-twd-only" data-jpy="{data}">NT${jpy*RATE:,.2f}</span>'
work = yen_pat.sub(yen_to_twd, work)

work = work.replace("JPY ¥／TWD NT$", "全部以 NT$ 顯示")

budget_start = work.find('<section class="view" id="view-budget">')
budget_end = work.find('</section>', budget_start)
if budget_start < 0 or budget_end < 0:
    raise SystemExit("Budget section not found")
seg = work[budget_start:budget_end]

summary_re = re.compile(r'<div class="budget-summary(?:\s+[^"]*)?">[\s\S]*?</div>\s*<p class="budget-note(?:\s+[^"]*)?">[\s\S]*?</p>')
summary_html = '''<div class="budget-summary" id="budget-summary-live">
<div class="money-card"><span>已付款</span><b id="fx-paid-twd">NT$151,287.53</b></div>
<div class="money-card"><span>已知待付款</span><b id="fx-pending-twd">NT$5,712.02</b></div>
<div class="money-card"><span>已退款｜不計入支出</span><b id="fx-refund-twd">NT$28,837.96</b></div>
<div class="money-card"><span>目前可計算合計</span><b id="fx-total-twd">NT$156,999.55</b></div>
<div class="money-card alert"><span>預估旅行總預算</span><b>待確認</b></div>
</div>
<p class="budget-note" id="fx-budget-note">載入最新日圓→台幣參考匯率中；App 金額一律只顯示新台幣，原始日幣與換算紀錄保留在 Excel。</p>'''
seg2, n = summary_re.subn(summary_html, seg, count=1)
if n != 1:
    raise SystemExit(f"Budget summary replacement count={n}")
work = work[:budget_start] + seg2 + work[budget_end:]

work = work.replace("日幣保留原幣並同步顯示新台幣參考值", "App 金額一律只顯示新台幣")
work = work.replace("所有日幣保留原幣並同步換算新台幣", "App 金額一律只顯示新台幣")
work = work.replace("原幣金額優先顯示，並同步換算新台幣", "App 金額一律只顯示新台幣")

fx_script = r'''<script id="V7P3_LIVE_FX">
(()=>{
  const FALLBACK={rate:0.19861,date:'2026-08-26',source:'V7P3 快照'};
  const STORAGE_KEY='tohoku-jpy-twd-v7p3';
  const PAID_TWD=123538.73, PAID_JPY=139715, PENDING_JPY=28760, REFUND_TWD=22403, REFUND_JPY=32400;
  const fmt=n=>new Intl.NumberFormat('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  function render(fx,status){
    const rate=Number(fx.rate); if(!Number.isFinite(rate)||rate<=0) return;
    document.querySelectorAll('.fx-twd-only[data-jpy]').forEach(el=>{
      const jpy=Number(el.dataset.jpy);
      if(Number.isFinite(jpy)) el.textContent=`NT$${fmt(jpy*rate)}`;
    });
    const paid=PAID_TWD+PAID_JPY*rate;
    const pending=PENDING_JPY*rate;
    const refund=REFUND_TWD+REFUND_JPY*rate;
    const total=paid+pending;
    const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=`NT$${fmt(v)}`};
    set('fx-paid-twd',paid); set('fx-pending-twd',pending); set('fx-refund-twd',refund); set('fx-total-twd',total);
    const note=document.getElementById('fx-budget-note');
    if(note){
      note.innerHTML=`日圓換算：<b>1 日圓 ≈ NT$${rate.toFixed(5)}</b>（${fx.date||'日期未提供'}） <span class="fx-status">${status}</span><br>App 所有金額只顯示新台幣；原始日幣、換算匯率與查帳紀錄保留在 Excel。實際信用卡／換匯入帳可能因銀行匯差與手續費不同。`;
    }
  }
  async function loadFx(){
    let cached=null; try{cached=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){}
    if(cached?.rate) render(cached,'上次成功匯率'); else render(FALLBACK,'離線備援快照');
    try{
      const res=await fetch('https://api.frankfurter.dev/v2/rate/JPY/TWD',{cache:'no-store'});
      if(!res.ok) throw new Error('FX HTTP '+res.status);
      const data=await res.json();
      const rate=Number(data.rate ?? data.rates?.TWD);
      if(!Number.isFinite(rate)||rate<=0) throw new Error('invalid FX');
      const fx={rate,date:data.date||new Date().toISOString().slice(0,10),source:'Frankfurter'};
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(fx))}catch(e){}
      render(fx,'最新參考匯率');
    }catch(e){
      if(cached?.rate) render(cached,'離線／上次成功匯率'); else render(FALLBACK,'離線備援快照');
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadFx,{once:true}); else loadFx();
})();
</script>'''

work = work.replace("</body>", fx_script + "\n</body>")
INDEX.write_text(work, encoding="utf-8")

SW.write_text(r'''const CACHE = "tohoku-v7p3-public-1";
const ASSETS = ["./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./favicon-32.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({type:"window", includeUncontrolled:true});
    await Promise.all(windows.map(client => client.navigate(client.url).catch(() => null)));
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname === "api.frankfurter.dev") {
    event.respondWith(fetch(event.request, {cache:"no-store"}));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request, {cache:"no-store"});
        if (network.ok) {
          const cache = await caches.open(CACHE);
          cache.put("./index.html", network.clone());
        }
        return network;
      } catch (e) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
''', encoding="utf-8")

final = INDEX.read_text(encoding="utf-8")
visible = re.sub(r'data:[^"\']+;base64,[A-Za-z0-9+/=]+', '', final)
if 'V7P2' in visible:
    raise SystemExit("Stale V7P2 marker remains")
if re.search(r'¥\s*[0-9]', final):
    raise SystemExit("Visible yen amount remains")
if 'V7P3_LIVE_FX' not in final or 'tohoku-v7p3-public-1' not in SW.read_text(encoding="utf-8"):
    raise SystemExit("V7P3 markers missing")
print("V7P3 App source synchronized")
