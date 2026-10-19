
(function(){'use strict';
function rgb(h){h=String(h||'').trim();if(!/^#[a-fA-F0-9]{6}$/.test(h))return null;return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function lum(a){const f=x=>{x=x/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(a[0])+.7152*f(a[1])+.0722*f(a[2])}
function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function hex(a){return '#'+a.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('')}
function setPair(el,accent){const c=rgb(accent);if(!c||!el)return;let ink=c.slice();for(let i=0;i<32&&ratio(ink,[255,255,255])<4.5;i++)ink=ink.map(x=>x*.90);el.style.setProperty('--wt754-accent-text',hex(ink));el.style.setProperty('--wt754-on-accent',ratio(c,[255,255,255])>=4.5?'#fff':'#111827')}
function apply(){const preview=document.getElementById('marketStorefrontPreview');if(preview){const fromPreview=getComputedStyle(preview).getPropertyValue('--market-accent').trim();let accent=fromPreview;if(!rgb(accent)){try{accent=window.marketOnlineConfig?.()?.themeColor}catch(_){}}setPair(preview,accent)}const globalAccent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();if(rgb(globalAccent))setPair(document.documentElement,globalAccent)}
window.inposWebTokoContrastV754=apply;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
const p=document.getElementById('marketStorefrontPreview');if(p){new MutationObserver(()=>apply()).observe(p,{childList:true})}
const b=document.body;if(b)new MutationObserver(()=>apply()).observe(b,{attributes:true,attributeFilter:['data-inpos-template']});
})();
