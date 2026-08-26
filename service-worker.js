const CACHE = "tohoku-v7p2-public-1";
const ASSETS = ["./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png"];

const FINAL_STYLE = `
<style id="V7P2_WARM_GLASS_AND_FX_FINAL_1">
/* Light milk-tea floating glass retained from V7P1. */
.bottom-nav{
  position:fixed!important;
  left:50%!important;
  right:auto!important;
  bottom:calc(10px + env(safe-area-inset-bottom))!important;
  width:min(calc(100% - 20px),892px)!important;
  transform:translateX(-50%)!important;
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  gap:4px!important;
  padding:6px!important;
  border:1px solid rgba(255,255,255,.36)!important;
  border-radius:29px!important;
  background:linear-gradient(135deg,rgba(132,107,94,.48),rgba(164,128,106,.42))!important;
  box-shadow:0 12px 30px rgba(55,39,31,.14),inset 0 1px 0 rgba(255,255,255,.28)!important;
  -webkit-backdrop-filter:blur(30px) saturate(1.30)!important;
  backdrop-filter:blur(30px) saturate(1.30)!important;
  overflow:hidden!important;
}
.bottom-nav:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  pointer-events:none!important;
  border-radius:inherit!important;
  background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 54%)!important;
}
.bottom-nav label{
  position:relative!important;
  z-index:1!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  min-height:52px!important;
  padding:6px 2px!important;
  border-radius:22px!important;
  background:transparent!important;
  color:rgba(255,252,248,.94)!important;
  font-size:10px!important;
  line-height:1.1!important;
  text-shadow:0 1px 2px rgba(60,40,31,.18)!important;
}
.bottom-nav label svg,.bottom-nav svg{
  width:22px!important;
  height:22px!important;
  margin:0 auto 2px!important;
  stroke:currentColor!important;
  fill:none!important;
}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"],
#tab-transport:checked~.bottom-nav label[for="tab-transport"],
#tab-trip:checked~.bottom-nav label[for="tab-trip"],
#tab-budget:checked~.bottom-nav label[for="tab-budget"],
#tab-todos:checked~.bottom-nav label[for="tab-todos"]{
  background:linear-gradient(135deg,rgba(255,247,235,.20),rgba(255,255,255,.08))!important;
  color:#fffaf4!important;
  box-shadow:0 5px 14px rgba(55,37,29,.10),inset 0 1px 0 rgba(255,255,255,.22)!important;
  -webkit-backdrop-filter:blur(15px)!important;
  backdrop-filter:blur(15px)!important;
  transform:translateY(-1px)!important;
}
#tab-trip:checked~.bottom-nav label[for="tab-trip"]{
  color:#ffe4ad!important;
  background:linear-gradient(135deg,rgba(203,151,99,.24),rgba(255,235,205,.14))!important;
}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"]:after,
#tab-transport:checked~.bottom-nav label[for="tab-transport"]:after,
#tab-trip:checked~.bottom-nav label[for="tab-trip"]:after,
#tab-budget:checked~.bottom-nav label[for="tab-budget"]:after,
#tab-todos:checked~.bottom-nav label[for="tab-todos"]:after{display:none!important;}
.fx-twd{display:block!important;margin-top:3px!important;color:var(--muted)!important;font-size:9.5px!important;font-weight:700!important;line-height:1.35!important;white-space:normal!important}
.money-card .fx-twd{font-size:10px!important;color:var(--muted)!important}
.fx-status{display:inline-flex;margin-left:4px;padding:2px 6px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.45);font-size:9px;font-weight:800}
</style>`;

const FX_SCRIPT = `
<script id="V7P2_LIVE_FX">
(()=>{
  const FALLBACK={rate:0.19861,date:'2026-08-26',source:'V7P2 快照'};
  const STORAGE_KEY='tohoku-jpy-twd-v7p2';
  const PAID_TWD=123538.73, PAID_JPY=139715, PENDING_JPY=28760;
  const fmt=n=>new Intl.NumberFormat('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const yenFrom=text=>{const m=String(text||'').match(/¥\\s*([0-9,]+)/);return m?Number(m[1].replace(/,/g,'')):null};
  function cleanOldApprox(root){
    root.querySelectorAll('b,p,small').forEach(el=>{
      if(el.children.length) return;
      if(!/¥\\s*[0-9,]+/.test(el.textContent)) return;
      el.textContent=el.textContent.replace(/[／，,]?\\s*約?\\s*NT\\$[0-9,.]+/g,'');
    });
  }
  function addConversions(rate){
    const root=document.getElementById('view-budget'); if(!root) return;
    root.querySelectorAll('.fx-twd').forEach(n=>n.remove());
    cleanOldApprox(root);
    const targets=[...root.querySelectorAll('.budget-money > b,.kv > b,.budget-summary .money-card > b,.budget-group-title > small')];
    targets.forEach(el=>{
      const y=yenFrom(el.textContent); if(y===null) return;
      const line=document.createElement('small'); line.className='fx-twd';
      line.textContent=\`≈ NT$\${fmt(y*rate)}\`; el.appendChild(line);
    });
  }
  function render(fx,status){
    const root=document.getElementById('view-budget'); if(!root) return;
    const rate=Number(fx.rate); if(!Number.isFinite(rate)||rate<=0) return;
    const cards=root.querySelectorAll('.budget-summary .money-card');
    if(cards.length>=5){
      cards[0].querySelector('span').textContent='已付款｜原幣';
      cards[0].querySelector('b').innerHTML='NT$123,538.73<br>＋¥139,715';
      cards[1].querySelector('span').textContent='已付款換算｜TWD';
      cards[1].querySelector('b').textContent=\`約 NT$\${fmt(PAID_TWD+PAID_JPY*rate)}\`;
      cards[2].querySelector('span').textContent='已知待付款｜JPY';
      cards[2].querySelector('b').textContent='¥28,760';
      cards[3].querySelector('span').textContent='已退款｜不計入支出';
      cards[3].querySelector('b').innerHTML='NT$22,403<br>＋¥32,400';
      cards[4].querySelector('span').textContent='目前可計算合計｜TWD';
      cards[4].querySelector('b').textContent=\`約 NT$\${fmt(PAID_TWD+(PAID_JPY+PENDING_JPY)*rate)}\`;
    }
    addConversions(rate);
    let note=root.querySelector('#fx-budget-note');
    if(!note){note=root.querySelector('.budget-note'); if(note) note.id='fx-budget-note';}
    if(note){
      note.innerHTML=\`目前參考匯率：<b>1 JPY = NT$\${rate.toFixed(5)}</b>（\${fx.date||'日期未提供'}） <span class="fx-status">\${status}</span><br>所有日幣保留原幣並同步換算新台幣；退款只顯示參考換算、不計入旅行支出。實際信用卡／換匯入帳可能因銀行匯差與手續費不同。\`;
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
</script>`;

function patchVersionLabels(html) {
  return html
    .replace('2026 日本東北深秋之旅 V7P1｜夫妻共用公開去敏版','2026 日本東北深秋之旅 V7P2｜夫妻共用公開去敏版')
    .replace('<meta name="version" content="V7P1">','<meta name="version" content="V7P2">')
    .replace('<title>東北楓葉之旅｜V7P1</title>','<title>東北楓葉之旅｜V7P2</title>')
    .replace('<b>V7P1</b>\\n<span>唯一正式版本</span>','<b>V7P2</b>\\n<span>唯一正式版本</span>')
    .replace('<div class="section-title" style="margin-top:22px"><h2>重要狀態</h2><span>V7P1</span></div>','<div class="section-title" style="margin-top:22px"><h2>重要狀態</h2><span>V7P2</span></div>')
    .replace('<div class="source">V7P1｜夫妻共用公開去敏版<br>V7P1模板｜','<div class="source">V7P2｜夫妻共用公開去敏版<br>V7P2模板｜')
    .replace('參考換算1 JPY = NT$0.205；原幣金額優先顯示，參考合計才換算。退款不計入旅行支出；新幹線、餐飲與購物尚未定價，不亂填。','載入最新 JPY→TWD 參考匯率中；原幣金額優先顯示，並同步換算新台幣。退款不計入旅行支出；新幹線、餐飲與購物尚未定價，不亂填。');
}

function patchHtml(html) {
  let out=html
    .replace(/<style id="V7P1_(?:SMOKED|WARM)_GLASS_FINAL_\d+">[\s\S]*?<\/style>/g,'')
    .replace(/<style id="V7P2_WARM_GLASS_AND_FX_FINAL_\d+">[\s\S]*?<\/style>/g,'')
    .replace(/<script id="V7P2_LIVE_FX">[\s\S]*?<\/script>/g,'');
  out=patchVersionLabels(out);
  out=out.replace('</head>', `${FINAL_STYLE}\\n</head>`);
  out=out.replace('</body>', `${FX_SCRIPT}\\n</body>`);
  return out;
}

async function patchedNavigation(request) {
  try {
    const network=await fetch(request,{cache:'no-store'});
    const type=network.headers.get('content-type')||'';
    if(!network.ok||!type.includes('text/html')) return network;
    const html=await network.text();
    const patched=patchHtml(html);
    const headers=new Headers(network.headers); headers.delete('content-length');
    const response=new Response(patched,{status:network.status,statusText:network.statusText,headers});
    const cache=await caches.open(CACHE); await cache.put('./index.html',response.clone());
    return response;
  } catch(error) {
    const cached=await caches.match('./index.html');
    if(cached) return cached;
    throw error;
  }
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(windows.map(client=>client.navigate(client.url).catch(()=>null)));
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.hostname==='api.frankfurter.dev'){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }
  if(event.request.mode==='navigate'){
    event.respondWith(patchedNavigation(event.request));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response;
  })));
});
