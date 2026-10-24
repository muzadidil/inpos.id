/* INPOS v735: notifikasi Mitra lintas perangkat melalui server lokal. */
(()=>{'use strict';if(!window.INPOS_LOCAL_SERVER)return;
 let showing=false,busy=false,items=[],dismissed=new Set(),lastLoaded=0;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const root=()=>document.getElementById('inposDemoBridge');
 async function markRead(id){const r=await fetch('/api/tenant/broadcasts/read',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({id})});if(!r.ok)throw Error('Gagal menyimpan status notifikasi.');}
 async function open(item){if(showing||!root()||!root().hidden)return;showing=true;const el=root();el.hidden=false;
  const image=/^data:image\/(?:jpeg|png|webp);base64,/.test(item.image||'')&&item.image.length<280000?`<img class="bridge-news-img" src="${item.image}" alt="Gambar pengumuman">`:'';
  el.innerHTML=`<div class="bridge-backdrop" data-close="1"></div><section class="bridge-panel bridge-news" role="dialog" aria-modal="true" aria-labelledby="bridgeNewsTitle"><header><h2 id="bridgeNewsTitle">Informasi</h2><button id="bridgeClose" type="button" aria-label="Tutup">×</button></header>${image}<h3>${esc(item.title)}</h3><p>${esc(item.body).replace(/\n/g,'<br>')}</p><button type="button" class="bridge-primary" id="bridgeAck">OK</button></section>`;
  const close=async()=>{dismissed.add(item.id);el.hidden=true;el.innerHTML='';showing=false;try{await markRead(item.id)}catch(e){console.warn('[INPOS] Notifikasi belum tercatat dibaca:',e.message)}fetchNew();};
  for(const selector of ['#bridgeAck','#bridgeClose','[data-close="1"]'])el.querySelector(selector)?.addEventListener('click',close,{once:true});
 }
 async function fetchNew(){if(busy||document.hidden||showing)return;busy=true;try{const r=await fetch('/api/tenant/broadcasts',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;const d=await r.json();items=d.items||[];const item=items.find(x=>!x.read&&!dismissed.has(x.id));if(item)await open(item);lastLoaded=Date.now();}catch(e){console.warn('[INPOS] Notifikasi sementara tidak dapat dimuat:',e.message)}finally{busy=false}}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)fetchNew()});window.addEventListener('focus',fetchNew);setInterval(fetchNew,20000);setTimeout(fetchNew,1300);
 window.INPOS_MITRA_NOTIFICATIONS={refresh:fetchNew};
})();
