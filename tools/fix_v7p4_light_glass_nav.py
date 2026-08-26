from pathlib import Path
import re

INDEX = Path('index.html')
SW = Path('service-worker.js')

s = INDEX.read_text(encoding='utf-8')
start = '/* V7P4_FLOATING_GLASS_NAV_START */'
end = '/* V7P4_FLOATING_GLASS_NAV_END */'
pattern = re.compile(re.escape(start) + r'[\s\S]*?' + re.escape(end))

light = r'''/* V7P4_FLOATING_GLASS_NAV_START */
body{padding-bottom:calc(118px + env(safe-area-inset-bottom))}
.bottom-nav{position:fixed;left:50%;right:auto;bottom:calc(10px + env(safe-area-inset-bottom));z-index:50;width:min(calc(100% - 28px),892px);transform:translateX(-50%);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:7px;border:1px solid rgba(255,255,255,.62);border-radius:31px;background-color:rgba(238,220,204,.70)!important;background-image:linear-gradient(135deg,rgba(255,250,244,.50),rgba(214,184,160,.26))!important;box-shadow:0 12px 30px rgba(73,54,45,.16),inset 0 1px 0 rgba(255,255,255,.72);backdrop-filter:blur(30px) saturate(1.16);-webkit-backdrop-filter:blur(30px) saturate(1.16);overflow:hidden;isolation:isolate}
.bottom-nav:before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,0) 54%);z-index:0}
.bottom-nav label{position:relative;z-index:1;min-width:0;padding:8px 2px 7px;border-radius:24px;color:rgba(80,58,47,.82)!important;background:transparent!important;font-size:10.5px;transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease}
.bottom-nav label svg{display:block;width:22px;height:22px;margin:0 auto 3px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.bottom-nav .tab-text{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"],#tab-transport:checked~.bottom-nav label[for="tab-transport"],#tab-trip:checked~.bottom-nav label[for="tab-trip"],#tab-budget:checked~.bottom-nav label[for="tab-budget"],#tab-todos:checked~.bottom-nav label[for="tab-todos"]{background:linear-gradient(135deg,rgba(255,249,240,.56),rgba(181,126,86,.14))!important;color:#6f3a2e!important;box-shadow:0 5px 14px rgba(73,54,45,.10),inset 0 1px 0 rgba(255,255,255,.65);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transform:translateY(-1px)}
#tab-trip:checked~.bottom-nav label[for="tab-trip"]{color:#875735!important;background:linear-gradient(135deg,rgba(255,244,223,.68),rgba(211,166,105,.20))!important}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"]:after,#tab-transport:checked~.bottom-nav label[for="tab-transport"]:after,#tab-trip:checked~.bottom-nav label[for="tab-trip"]:after,#tab-budget:checked~.bottom-nav label[for="tab-budget"]:after,#tab-todos:checked~.bottom-nav label[for="tab-todos"]:after{display:none!important}
@media(max-width:420px){.bottom-nav{width:calc(100% - 20px);border-radius:29px;padding:6px}.bottom-nav label{padding:8px 1px 7px;font-size:10px;border-radius:22px}.bottom-nav label svg{width:21px;height:21px}}
/* V7P4_FLOATING_GLASS_NAV_END */'''

s2, n = pattern.subn(light, s, count=1)
if n != 1:
    raise SystemExit(f'Expected one floating nav block, got {n}')
INDEX.write_text(s2, encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
sw2, n2 = re.subn(r'tohoku-v7p4-public-\d+', 'tohoku-v7p4-public-2', sw, count=1)
if n2 != 1:
    raise SystemExit('Could not update cache key')
SW.write_text(sw2, encoding='utf-8')

final = INDEX.read_text(encoding='utf-8')
block = pattern.search(final).group(0)
if 'rgba(43,36,33,.90)' in block or 'rgba(50,41,37,.94)' in block:
    raise SystemExit('Dark nav colors still present in final block')
if 'rgba(238,220,204,.70)' not in block:
    raise SystemExit('Light glass color missing')
print('V7P4 light glass nav hotfix applied')
