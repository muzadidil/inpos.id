'use strict';
const API=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://localhost:3000/v1':'https://api.inpos.id/v1';
let csrf='';
const $=id=>document.getElementById(id);
const fmt=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function errText(error){return Array.isArray(error?.message)?error.message.join('; '):(error?.message||'Gagal memproses permintaan');}
async function api(path,method='GET',body){const headers={};if(body!==undefined)headers['Content-Type']='application/json';if(method!=='GET'&&csrf)headers['X-INPOS-CSRF']=csrf;
 const r=await fetch(API+path,{method,headers,credentials:'include',body:body===undefined?undefined:JSON.stringify(body)});
 const j=await r.json().catch(()=>({message:'Server tidak mengembalikan JSON'}));if(!r.ok)throw Error(errText(j));if(j.csrf)csrf=j.csrf;return j;
}
function notify(el,text,error=false){el.textContent=text;el.classList.toggle('error',error);}
function formData(form){return Object.fromEntries(new FormData(form).entries());}
function newRequestId(){return 'POS-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));}
