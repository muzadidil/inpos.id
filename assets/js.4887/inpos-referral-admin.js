/* INPOS v748 — Pencairan Referral sinkron langsung dengan INPOS Mitra. */
(()=>{'use strict';if(!window.INPOS_LOCAL_SERVER||document.documentElement.dataset.saAuth!=='ready')return;
 let loading=false,applying=false,rows=[],withdrawStatus='pending',withdrawSearch='',withdrawVisible=50,serverVersion=null,formOpenId=null,formOpenStatus=null;
 const money=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isActive=()=>document.visibilityState==='visible'&&!!document.getElementById('inpos-referral-withdrawals-slot');
 async function request(url,method='GET',body){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{const r=await fetch(url,{method,credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{Accept:'application/json',...(method==='GET'?{}:{'Content-Type':'application/json','X-INPOS-Request':'1'})},body:body===undefined?undefined:JSON.stringify(body)});
   const j=await r.json();if(!r.ok)throw Error(j.error||'Server belum dapat memproses permintaan.');return j;
  }catch(e){if(e.name==='AbortError')throw Error('Koneksi membutuhkan waktu terlalu lama. Coba lagi.');throw e;}finally{clearTimeout(timer)}
 }
 const api=(method='GET',body)=>request('/api/admin/referral/withdrawals',method,body);
 const notice=(card,msg,error=false)=>{const el=card.querySelector('#inpos-referral-feedback');if(!el)return;el.textContent=msg;el.hidden=!msg;el.setAttribute('role',error?'alert':'status')};
 function panel(){
  const slot=document.getElementById('inpos-referral-withdrawals-slot');if(!slot)return null;
  const container=slot.querySelector('.settings-cards');if(!container)return null;
  let card=document.getElementById('inpos-referral-server-withdrawals');
  if(!card){card=document.createElement('section');card.className='card settings-panel settings-wide';card.id='inpos-referral-server-withdrawals';
   card.innerHTML='<div class="sa-referral-toolbar"><div class="sa-withdraw-tabs" role="group" aria-label="Status pencairan"><button type="button" data-refwithdraw-filter="pending" class="active" aria-pressed="true">Menunggu</button><button type="button" data-refwithdraw-filter="paid" aria-pressed="false">Sudah Transfer</button><button type="button" data-refwithdraw-filter="rejected" aria-pressed="false">Ditolak</button><button type="button" data-refwithdraw-filter="all" aria-pressed="false">Semua</button></div><div class="sa-referral-search-row"><div class="search"><input id="inpos-referral-withdraw-search" type="search" placeholder="Cari mitra / kode" aria-label="Cari mitra atau kode referral" autocomplete="off"></div><button class="btn smol" type="button" id="inpos-referral-refresh" aria-label="Perbarui pengajuan">Perbarui</button></div></div><div id="inpos-referral-feedback" hidden role="status" aria-live="polite"></div><div id="inpos-referral-request-count" class="sa-referral-result-count" aria-live="polite"></div><div id="inpos-referral-request-list" class="sa-referral-list">Memuat...</div><button class="btn smol full" type="button" id="inpos-referral-more" hidden>Tampilkan lainnya</button>';
   container.append(card);card.querySelector('#inpos-referral-refresh').addEventListener('click',()=>load(true));
   card.querySelector('#inpos-referral-more').addEventListener('click',()=>{withdrawVisible+=50;renderRows(card)});
  }
  return card;
 }
 function actionArea(row){if(row.status!=='pending')return row.note?`<small class="sa-referral-note">${esc(row.status==='paid'?'Referensi: ':'Keterangan: ')}${esc(row.note)}</small>`:'';
  const open=formOpenId===row.id,kind=formOpenStatus;
  if(open){return `<form class="sa-referral-confirm-form" data-refwithdraw-form="${row.id}" data-status="${kind}"><label for="sa-refnote-${row.id}">${kind==='paid'?'Referensi bukti transfer':'Alasan penolakan'}</label><input id="sa-refnote-${row.id}" name="note" type="text" minlength="3" maxlength="140" required autocomplete="off" placeholder="${kind==='paid'?'Contoh: BCA 123456, 18 Okt 2026':'Tulis alasan singkat'}"><div class="btnwrap sa-referral-actions"><button class="btn primary" type="submit">${kind==='paid'?'Simpan Sudah Transfer':'Simpan Penolakan'}</button><button class="btn" type="button" data-refwithdraw-cancel="1">Batal</button></div></form>`;}
  return `<div class="btnwrap sa-referral-actions"><button class="btn primary" type="button" data-refwithdraw-open="${row.id}" data-status="paid">Sudah Transfer</button><button class="btn" type="button" data-refwithdraw-open="${row.id}" data-status="rejected">Tolak</button></div>`;
 }
 function renderRows(card){if(!card||applying)return;const list=card.querySelector('#inpos-referral-request-list');if(!list)return;
  const term=withdrawSearch.trim().toLowerCase();const filtered=rows.filter(r=>(withdrawStatus==='all'||r.status===withdrawStatus)&&[r.shop,r.code,r.account_name,r.bank,r.account_number].join(' ').toLowerCase().includes(term));
  card.querySelectorAll('[data-refwithdraw-filter]').forEach(b=>{const on=b.dataset.refwithdrawFilter===withdrawStatus;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  card.querySelector('#inpos-referral-request-count').textContent=filtered.length+' pengajuan';
  list.innerHTML=filtered.length?filtered.slice(0,withdrawVisible).map(r=>`<article class="sa-referral-item"><div class="sa-referral-item-top"><b>${esc(r.shop)} <span class="sa-referral-code">#${esc(r.code)}</span></b><strong>${money(r.amount)}</strong></div><div class="sa-referral-bank">${esc(r.bank)} · ${esc(r.account_number)} · ${esc(r.account_name)}</div><div class="sa-referral-item-bottom"><small>${esc(r.created_at)}</small><span class="sa-referral-state">${r.status==='paid'?'Sudah Transfer':r.status==='rejected'?'Ditolak':'Menunggu'}</span></div>${actionArea(r)}</article>`).join(''):'<div class="sa-referral-empty">Tidak ada pengajuan sesuai filter.</div>';
  const more=card.querySelector('#inpos-referral-more');more.hidden=filtered.length<=withdrawVisible;
  if(!more.hidden)more.textContent='Tampilkan 50 lagi ('+(filtered.length-withdrawVisible)+' tersisa)';
 }
 async function load(force=false){const card=panel();if(!card||loading||applying)return;loading=true;
  try{const data=await api();rows=Array.isArray(data.requests)?data.requests:[];renderRows(card);if(force)notice(card,'Daftar terbaru sudah dimuat.');}
  catch(e){notice(card,e.message,true);if(!rows.length)card.querySelector('#inpos-referral-request-list').textContent='Gagal memuat. Tekan Perbarui.';}finally{loading=false}
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-refwithdraw-filter]');if(!b||applying)return;withdrawStatus=b.dataset.refwithdrawFilter;withdrawVisible=50;formOpenId=null;renderRows(panel())});
 document.addEventListener('input',e=>{if(e.target.id==='inpos-referral-withdraw-search'){withdrawSearch=e.target.value;withdrawVisible=50;formOpenId=null;renderRows(panel())}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-refwithdraw-open],[data-refwithdraw-cancel]');if(!b||applying)return;const card=panel();if(!card)return;
  if(b.hasAttribute('data-refwithdraw-cancel')){formOpenId=null;formOpenStatus=null;}else{formOpenId=Number(b.dataset.refwithdrawOpen);formOpenStatus=b.dataset.status;}
  renderRows(card);if(formOpenId!==null)card.querySelector('#sa-refnote-'+formOpenId)?.focus();
 });
 document.addEventListener('submit',async e=>{const f=e.target.closest('[data-refwithdraw-form]');if(!f)return;e.preventDefault();e.stopImmediatePropagation();if(applying)return;
  const id=Number(f.dataset.refwithdrawForm),status=f.dataset.status,note=String(f.elements.note.value||'').trim(),card=panel();if(!card)return;
  if(!Number.isSafeInteger(id)||!['paid','rejected'].includes(status)||note.length<3||note.length>140){notice(card,'Isi keterangan minimal 3 karakter.',true);return;}
  applying=true;f.querySelectorAll('button,input').forEach(x=>x.disabled=true);notice(card,'Menyimpan status ke server...');
  try{await api('PATCH',{id,status,note});formOpenId=null;formOpenStatus=null;applying=false;await load();notice(panel(),'Status tersimpan dan tersinkron ke aplikasi INPOS Mitra.');serverVersion=null;}
  catch(err){applying=false;f.querySelectorAll('button,input').forEach(x=>x.disabled=false);notice(card,err.message,true)}
 },true);
 const observer=new MutationObserver(()=>{const c=panel();if(c&&!c.dataset.started){c.dataset.started='1';serverVersion=null;load()}});
 const page=document.getElementById('page');if(page)observer.observe(page,{childList:true,subtree:false});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{const c=panel();if(c&&!c.dataset.started){c.dataset.started='1';load()}},{once:true});else{const c=panel();if(c){c.dataset.started='1';load()}}
 let checking=false;
 async function poll(){if(!isActive()||checking||applying||loading||formOpenId!==null)return;checking=true;
  try{const meta=await request('/api/admin/referral/withdrawals/revision');if(serverVersion===null||serverVersion!==meta.version)await load();serverVersion=meta.version;}
  catch{}finally{checking=false}
 }
 setInterval(()=>{void poll()},8000);
 document.addEventListener('visibilitychange',()=>{if(isActive())void poll()});window.addEventListener('focus',()=>{if(isActive())void poll()});
 // Simpan dua pengaturan referral langsung ke server. Tangkap submit sebelum
 // handler demo lama supaya tidak memberi toast 'berhasil' sebelum DB merespons.
 let savingSettings=false;
 document.addEventListener('submit',async event=>{
  if(!window.INPOS_LOCAL_SERVER||document.documentElement.dataset.saAuth!=='ready')return;
  const form=event.target;
  if(form?.id!=='referralForm'&&form?.id!=='payoutSettingsForm')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(savingSettings)return;
  if(window.INPOS_ADMIN_SYNC_PENDING){alert('Masih ada perubahan sebelumnya yang sedang dikirim ke server. Tunggu sebentar, lalu simpan ulang.');return;}
  let patch;
  if(form.id==='referralForm'){
   const mode=document.getElementById('referralMode')?.value;
   const enabled=document.getElementById('referralEnabled')?.checked===true;
   const text=mode==='fixed'?String(document.getElementById('referralFixed')?.value||'').replace(/\./g,''):String(document.getElementById('referralPercent')?.value||'');
   const value=Number(text);
   if(!['fixed','percent'].includes(mode)||!Number.isFinite(value)||value<0||(mode==='percent'&&value>100)||(mode==='fixed'&&(!Number.isSafeInteger(value)||value>1000000000))){alert('Nilai komisi tidak valid. Periksa kembali pengaturan.');return;}
   patch={referralCommission:{enabled,mode,value}};
  }else{
   const text=String(document.getElementById('setMinimumPayout')?.value||'').replace(/\./g,'');
   const value=Number(text);
   if(!/^\d+$/.test(text)||!Number.isSafeInteger(value)||value<0||value>1000000000){alert('Minimal pencairan harus Rp 0–1.000.000.000.');return;}
   patch={minimumPayout:value};
  }
  const button=form.querySelector('button[type="submit"]');
  savingSettings=true;
  if(button){button.disabled=true;button.dataset.originalLabel=button.innerHTML;button.textContent='Menyimpan ke server...';}
  try{
   const r=await fetch('/api/admin/referral/config',{method:'PATCH',credentials:'same-origin',cache:'no-store',headers:{'X-INPOS-Request':'1','Content-Type':'application/json'},body:JSON.stringify(patch)});
   const d=await r.json();if(!r.ok)throw Error(d.error||'Gagal menyimpan pengaturan referral.');
   // Muat ulang nilai resmi agar state lama panel Admin tidak menimpa perubahan.
   location.reload();
  }catch(e){alert('Pengaturan belum tersimpan: '+e.message);savingSettings=false;if(button){button.disabled=false;button.innerHTML=button.dataset.originalLabel;}}
 },true);
})();
