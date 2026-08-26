from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
start=s.index('/* V7P4_FLOATING_GLASS_NAV_START */')
end=s.index('/* V7P4_FLOATING_GLASS_NAV_END */', start)+len('/* V7P4_FLOATING_GLASS_NAV_END */')
new='''/* V7P4_FLOATING_GLASS_NAV_START */
body{padding-bottom:calc(118px + env(safe-area-inset-bottom))}
.bottom-nav{position:fixed;left:50%;right:auto;bottom:calc(10px + env(safe-area-inset-bottom));z-index:50;width:min(calc(100% - 28px),892px);transform:translateX(-50%);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:7px;border:1px solid rgba(255,255,255,.72);border-radius:31px;background-color:rgba(247,243,241,.42)!important;background-image:linear-gradient(135deg,rgba(255,255,255,.34),rgba(245,233,225,.12))!important;box-shadow:0 9px 24px rgba(73,54,45,.09),inset 0 1px 0 rgba(255,255,255,.78);backdrop-filter:blur(32px) saturate(1.22);-webkit-backdrop-filter:blur(32px) saturate(1.22);overflow:hidden;isolation:isolate}
.bottom-nav:before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0) 58%);z-index:0}
.bottom-nav label{position:relative;z-index:1;min-width:0;padding:8px 2px 7px;border-radius:24px;color:rgba(66,53,47,.90)!important;background:transparent!important;font-size:10.5px;transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease}
.bottom-nav label svg{display:block;width:22px;height:22px;margin:0 auto 3px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.bottom-nav .tab-text{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"],#tab-transport:checked~.bottom-nav label[for="tab-transport"],#tab-trip:checked~.bottom-nav label[for="tab-trip"],#tab-budget:checked~.bottom-nav label[for="tab-budget"],#tab-todos:checked~.bottom-nav label[for="tab-todos"]{background:linear-gradient(135deg,rgba(255,255,255,.34),rgba(255,248,241,.18))!important;color:#4f3b32!important;box-shadow:0 4px 12px rgba(73,54,45,.07),inset 0 1px 0 rgba(255,255,255,.68);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transform:translateY(-1px)}
#tab-trip:checked~.bottom-nav label[for="tab-trip"]{color:#875735!important;background:linear-gradient(135deg,rgba(255,249,235,.38),rgba(214,171,112,.10))!important}
#tab-lodging:checked~.bottom-nav label[for="tab-lodging"]:after,#tab-transport:checked~.bottom-nav label[for="tab-transport"]:after,#tab-trip:checked~.bottom-nav label[for="tab-trip"]:after,#tab-budget:checked~.bottom-nav label[for="tab-budget"]:after,#tab-todos:checked~.bottom-nav label[for="tab-todos"]:after{display:none!important}
@media(max-width:420px){.bottom-nav{width:calc(100% - 20px);border-radius:29px;padding:6px}.bottom-nav label{padding:8px 1px 7px;font-size:10px;border-radius:22px}.bottom-nav label svg{width:21px;height:21px}}
/* V7P4_FLOATING_GLASS_NAV_END */'''
s=s[:start]+new+s[end:]
p.write_text(s,encoding='utf-8')
print('IG-like glass nav applied')
