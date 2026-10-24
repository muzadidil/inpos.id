/* INPOS frontend bridge v796: offline-first priority for sales/products/stock/shifts; resilient sync, bounded retries, no HTML-as-JSON errors.
 * The API is authoritative. Uncertain writes are never silently replayed over another revision.
 */
(()=>{'use strict';
 if(!window.INPOS_LOCAL_SERVER)return;
 const admin=document.documentElement.dataset.saAuth==='ready';
 const key=admin?'inpos_super_admin_subscriptions_demo_v3':'myposid_demo_v3';
 const route=admin?'/api/admin/state':'/api/tenant/state';
 const pollRoute=admin?'/api/admin/revision':'/api/tenant/revision';
 const tenantId=window.INPOS_BOOT_TENANT,userId=window.INPOS_BOOT_USER;
 let revision=admin?window.INPOS_ADMIN_REVISION:window.INPOS_BOOT_REVISION;
 if(!Number.isSafeInteger(revision))return;
 const native=Storage.prototype.setItem;
 const draftKey=(admin?'admin':'tenant')+':'+String(tenantId)+':'+String(userId);
 let recoveryPending=localStorage.getItem('inpos_sync_dirty')==='1' && window.INPOS_BOOT_LOCAL_DIRTY!==true;
 let pending=(window.INPOS_BOOT_LOCAL_DIRTY===true?localStorage.getItem(key):null),working=false,conflict=recoveryPending,signingOut=false,noticeTimer=null,retryTimer=null,writeTimer=null;
 let failureCount=0,firstFailureAt=0;
 let draftQueue=Promise.resolve();
 let dbPromise=null;
 const offlineBoot=window.INPOS_OFFLINE_BOOT===true;
 const metaKey='inpos_offline_meta_v1';
 let syncLabel=null;
 const label=()=>{
  if(admin)return;
  if(!syncLabel){syncLabel=document.createElement('div');syncLabel.id='inpos-offline-indicator';
   syncLabel.style.cssText='position:fixed;z-index:2147483645;bottom:max(76px,calc(env(safe-area-inset-bottom,0px) + 65px));left:50%;transform:translateX(-50%);padding:7px 12px;border-radius:999px;background:#1e293b;color:#fff;font:600 12px/1.35 system-ui,sans-serif;box-shadow:0 4px 16px #0003;pointer-events:none;text-align:center;max-width:calc(100vw - 30px)';document.body.appendChild(syncLabel)}
  const offline=!navigator.onLine,dirty=pending!==null||working||localStorage.getItem('inpos_sync_dirty')==='1';
  syncLabel.textContent=conflict?'Konflik sinkronisasi • Periksa cadangan':offline?'OFFLINE • Data disimpan di HP':dirty?'Menunggu sinkronisasi ke server':'ONLINE • Data tersinkron';
  syncLabel.style.background=conflict?'#991b1b':offline?'#a16207':dirty?'#1d4ed8':'#166534';
  syncLabel.hidden=!offline&&!dirty&&!conflict;
 };
 const refreshMeta=()=>{
  if(admin)return;try{const old=JSON.parse(localStorage.getItem(metaKey)||'null');
   if(!old||String(old.tenantId)!==String(tenantId)||String(old.userId)!==String(userId))return;
   old.revision=revision;old.lastOnlineAt=Date.now();safeStorage(metaKey,JSON.stringify(old));
  }catch{}
 };
 document.addEventListener('DOMContentLoaded',label,{once:true});
 const safeStorage=(name,value)=>{try{native.call(localStorage,name,value);return true}catch{return false}};
 const removeStorage=name=>{try{localStorage.removeItem(name)}catch{}};
 const openDraftDB=()=>{
  if(!('indexedDB' in window))return Promise.reject(Error('Penyimpanan offline tidak tersedia'));
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open('INPOS_Pending_Sync_v1',1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('drafts'))req.result.createObjectStore('drafts')};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Gagal membuka penyimpanan cadangan'));
  });
  return dbPromise;
 };
 const draftAction=(type,value)=>{
  draftQueue=draftQueue.catch(()=>{}).then(async()=>{
   const db=await openDraftDB();
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('drafts','readwrite');
    tx.objectStore('drafts')[type](...(type==='put'?[value,draftKey]:[draftKey]));
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error||Error('Cadangan gagal'));
    tx.onabort=()=>reject(tx.error||Error('Cadangan dibatalkan'));
   });
  }).catch(()=>{
   // Session storage survives a page refresh and is a best-effort fallback if IndexedDB is blocked.
   try{if(type==='put')sessionStorage.setItem('inpos_sync_draft_'+draftKey,JSON.stringify(value));
       else sessionStorage.removeItem('inpos_sync_draft_'+draftKey)}catch{}
  });
  return draftQueue;
 };
 const saveDraft=json=>draftAction('put',{json,tenantId:String(tenantId),userId:String(userId),revision,updatedAt:new Date().toISOString()});
 const clearDraft=()=>draftAction('delete');
 const loadDraft=async()=>{
  try{await draftQueue;const db=await openDraftDB();return await new Promise((resolve,reject)=>{
   const tx=db.transaction('drafts','readonly'),req=tx.objectStore('drafts').get(draftKey);
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  })}catch{
   try{return JSON.parse(sessionStorage.getItem('inpos_sync_draft_'+draftKey)||'null')}catch{return null}
  }
 };
 const inform=(message,clearAfter=0)=>{
  let el=document.getElementById('inpos-server-sync-status');
  if(!el){el=document.createElement('div');el.id='inpos-server-sync-status';el.setAttribute('role','status');
   el.style.cssText='position:fixed;bottom:max(80px,calc(env(safe-area-inset-bottom,0px) + 70px));right:12px;left:auto;max-width:min(320px,calc(100vw - 24px));background:#242424;color:#fff;padding:10px 14px;font:12px/1.5 system-ui,Arial,sans-serif;border-radius:10px;z-index:2147483646;box-shadow:0 5px 24px #0003';document.body.appendChild(el)}
  el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);
  if(clearAfter)noticeTimer=setTimeout(()=>{el.hidden=true},clearAfter);
 };
 if(admin){
  window.INPOS_ADMIN_SYNC_PENDING=false;
  window.INPOS_ADMIN_SERVER_REVISION=()=>revision;
  window.INPOS_ADMIN_SYNC_READY=()=>pending===null&&!working&&!conflict;
  window.INPOS_ADMIN_ACCEPT_REMOTE=(data,rev)=>{
   if(pending!==null||working||conflict||!Number.isSafeInteger(rev))return false;
   revision=rev;native.call(localStorage,key,JSON.stringify(data));
   safeStorage('inpos_sync_meta',JSON.stringify({tenantId,revision}));label();
   window.INPOS_ADMIN_SYNC_PENDING=false;return true;
  };
 }
 const downloadDraft=draft=>{
  if(!draft?.json)return;
  const blob=new Blob([draft.json],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='INPOS-CADANGAN-BELUM-SINKRON-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
 };
 async function showRecovery(){
  const draft=await loadDraft();
  // Do not silently submit a draft from a previous page load; remote revision may differ.
  conflict=true;
  const overlay=document.createElement('div');overlay.id='inpos-sync-recovery';overlay.setAttribute('role','alertdialog');
  overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Perubahan belum tersinkron');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#121212d9;display:grid;place-items:center;padding:18px;font:14px/1.5 system-ui,sans-serif';
  const panel=document.createElement('div');panel.style.cssText='max-width:440px;width:100%;background:white;color:#262126;border-radius:16px;padding:20px;box-shadow:0 14px 40px #0004';
  const title=document.createElement('h2');title.textContent='Ada perubahan yang belum tersinkron';title.style.cssText='font-size:18px;margin:0 0 10px';panel.appendChild(title);
  const p=document.createElement('p');p.textContent=draft?.json?'Cadangan perubahan masih tersimpan di perangkat ini. Demi keamanan, data lama tidak dikirim otomatis. Unduh cadangan sebelum memilih memakai data server.':'Sinkronisasi sebelumnya belum dikonfirmasi oleh server. Jangan mengulangi transaksi sebelum memeriksa datanya. Cadangan terpisah tidak ditemukan pada perangkat ini.';panel.appendChild(p);
  if(draft?.json){const download=document.createElement('button');download.textContent='Unduh cadangan perubahan';download.type='button';download.style.cssText='width:100%;padding:11px;margin-bottom:10px;border:1px solid #aaa;background:#fff;border-radius:9px';download.onclick=()=>downloadDraft(draft);panel.appendChild(download)}
  const proceed=document.createElement('button');proceed.type='button';proceed.textContent='Gunakan data terbaru dari server';proceed.style.cssText='width:100%;padding:12px;background:#b00828;color:#fff;border:0;border-radius:9px';
  proceed.onclick=()=>{if(!window.confirm('Pastikan perubahan yang belum sinkron sudah diperiksa atau dicadangkan. Gunakan data server dan abaikan antrean lama?'))return;
   removeStorage('inpos_sync_dirty');clearDraft();recoveryPending=false;conflict=false;overlay.remove();};panel.appendChild(proceed);
  const note=document.createElement('small');note.textContent='Jika ada transaksi yang belum masuk, periksa riwayat transaksi atau hubungi pengelola sebelum melanjutkan.';note.style.cssText='display:block;color:#666;margin-top:10px';panel.appendChild(note);
  overlay.appendChild(panel);document.body.appendChild(overlay);
 }
 if(recoveryPending){setTimeout(showRecovery,0)}
 function forceTenantLogout(){
  if(admin||signingOut)return;
  signingOut=true;conflict=true;pending=null;clearTimeout(writeTimer);clearTimeout(retryTimer);
  // Preserve unsynchronized data in IndexedDB; do not silently move it to another account.
  try{localStorage.removeItem('inpos_device_login_v633');if(localStorage.getItem('inpos_sync_dirty')!=='1')localStorage.removeItem('myposid_demo_v3')}catch{}
  const overlay=document.createElement('div');overlay.setAttribute('role','alert');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:#fff;color:#262126;font:600 17px/1.55 system-ui,sans-serif;text-align:center';
  overlay.textContent='Sesi INPOS berakhir. Silakan masuk kembali.';document.body.appendChild(overlay);
  setTimeout(()=>location.replace('https://login.inpos.id/'),900);
 }
 const httpError=(message,transient=true)=>Object.assign(new Error(message),{transient});
 async function readJSON(r){
  const body=await r.text();
  if(/^\s*</.test(body))throw httpError('Server mengirim halaman HTML, bukan JSON (HTTP '+r.status+').');
  let data;
  try{data=JSON.parse(body)}catch{throw httpError('Respons API tidak valid (HTTP '+r.status+').')}
  if(!data||typeof data!=='object')throw httpError('Respons API tidak lengkap (HTTP '+r.status+').');
  return data;
 }
 function scheduleRetry(ms){clearTimeout(retryTimer);retryTimer=setTimeout(()=>{retryTimer=null;void flush()},ms)}
 Storage.prototype.setItem=function(k,v){
  const result=native.call(this,k,v);
  if(this===localStorage&&k===key&&!conflict){
   pending=String(v);saveDraft(pending);if(admin)window.INPOS_ADMIN_SYNC_PENDING=true;label();
   safeStorage('inpos_sync_dirty','1');clearTimeout(writeTimer);
   // Keep retries bounded even while the user continues editing.
   if(!retryTimer)writeTimer=setTimeout(()=>void flush(),550);
  }
  return result;
 };
 async function flush(){
  if(working||pending===null||conflict||recoveryPending)return;
  if(!navigator.onLine){label();scheduleRetry(5000);return}
  working=true;const json=pending;pending=null;let responseStatus=0;
  const sentRevision=revision;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),22000);
  try{
   const state=JSON.parse(json);
   const r=await fetch(route,{method:'PUT',credentials:'same-origin',cache:'no-store',signal:controller.signal,
    headers:{'Accept':'application/json','Content-Type':'application/json','X-INPOS-Request':'1',
     ...(admin?{}:{'X-INPOS-Tenant':String(tenantId),'X-INPOS-User':String(userId)})},body:JSON.stringify({revision:sentRevision,state})});
   responseStatus=r.status;
   if(r.status===401&&!admin){forceTenantLogout();return}
   const result=await readJSON(r);
   if([400,401,403,409].includes(r.status)){
    conflict=true;saveDraft(json);
    if(pending!==null)saveDraft(pending);
    // Extra backup for a conflict, if the browser has free quota; no server data is overwritten.
    safeStorage('inpos_sync_conflict_backup_'+Date.now(),pending!==null?pending:json);
    if(admin)window.INPOS_ADMIN_SYNC_PENDING=false;
    inform((result.error||'Konflik perubahan server.')+' Perubahan lokal dicadangkan. Jangan mengulangi transaksi sebelum memeriksa datanya.');return;
   }
   if(!r.ok)throw httpError(result.error||'Server belum dapat memproses data (HTTP '+r.status+').');
   if(result.ok!==true||!Number.isSafeInteger(result.revision)||result.revision<=sentRevision){
    throw httpError('Konfirmasi penyimpanan dari server tidak lengkap.');
   }
   revision=result.revision;failureCount=0;firstFailureAt=0;refreshMeta();
   if(pending===null){removeStorage('inpos_sync_dirty');clearDraft();if(admin)window.INPOS_ADMIN_SYNC_PENDING=false;}
   safeStorage('inpos_sync_meta',JSON.stringify({tenantId,revision}));label();
   const status=document.getElementById('inpos-server-sync-status');
   if(status&&!status.hidden)inform('Sinkronisasi kembali normal. Data tersimpan di server.',2800);
  }catch(error){
   if(!conflict){
    if(pending===null)pending=json;
    else saveDraft(pending);
    failureCount++;label();
    if(!firstFailureAt)firstFailureAt=Date.now();
    const delay=Math.min(60000,5000*Math.pow(2,Math.min(4,failureCount-1)));
    scheduleRetry(responseStatus===429?Math.max(30000,delay):delay);
    // Transient disruptions should not flood the cashier UI with technical HTML/JSON errors.
    if(failureCount>=3||Date.now()-firstFailureAt>25000){
     inform('Sinkronisasi menunggu koneksi server. Perubahan masih di perangkat ini; jangan tutup atau hapus data aplikasi. Akan dicoba otomatis.');
    }
    if(failureCount===1)console.warn('[INPOS sync] Permintaan tertunda:',String(error?.message||error));
   }
  }finally{
   clearTimeout(timeout);working=false;
   if(pending!==null&&!conflict&&!retryTimer){clearTimeout(writeTimer);writeTimer=setTimeout(()=>void flush(),550)}
  }
 }
 async function inposCheckSessionAndRevision(){
  if(document.visibilityState!=='visible'||signingOut||conflict||working||pending!==null)return;
  try{
   const r=await fetch(pollRoute,{credentials:'same-origin',cache:'no-store',headers:{'Accept':'application/json'}});
   if(r.status===401){if(!admin){forceTenantLogout();return}conflict=true;inform('Sesi Super Admin berakhir. Masuk kembali untuk melanjutkan.');return}
   if(!r.ok)return;
   const d=await readJSON(r);
   if(!admin){
    if(d.tenant_id==null||d.user_id==null){inform('Identitas sesi tidak tersedia. Periksa koneksi API.',3500);return}
    if(String(d.tenant_id)!==String(tenantId)||String(d.user_id)!==String(userId)){forceTenantLogout();return}
    refreshMeta();
   }
   if(d.revision>revision){
    if(admin&&typeof window.INPOS_ADMIN_CAN_RECEIVE_STATE==='function'&&window.INPOS_ADMIN_CAN_RECEIVE_STATE()&&typeof window.INPOS_ADMIN_APPLY_REMOTE_STATE==='function'){
     try{const response=await fetch('/api/admin/state',{credentials:'same-origin',cache:'no-store',headers:{'Accept':'application/json'}});
      if(response.ok){const fresh=await readJSON(response);
       if(fresh?.ok&&fresh.state&&Number.isSafeInteger(fresh.revision)&&pending===null&&!working&&!conflict){
        if(window.INPOS_ADMIN_ACCEPT_REMOTE(fresh.state,fresh.revision)){
         if(window.INPOS_ADMIN_APPLY_REMOTE_STATE(fresh.state))return;
         conflict=true;inform('Perubahan panel perlu dimuat ulang.');return;
        }
       }
      }
     }catch{}
    }
    if(admin&&typeof window.INPOS_ADMIN_CAN_RECEIVE_STATE==='function'&&!window.INPOS_ADMIN_CAN_RECEIVE_STATE())return;
    conflict=true;label();inform('Data telah berubah dari perangkat lain. Periksa data terbaru sebelum melanjutkan.');
   }
  }catch{}
 }
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'&&pending!==null&&!conflict)void flush();
  if(document.visibilityState==='visible'){label();if(pending!==null&&!retryTimer&&!conflict)void flush();inposCheckSessionAndRevision()}
 });
 window.addEventListener('beforeunload',e=>{
  if((pending!==null||working)&&!conflict){e.preventDefault();e.returnValue=''}
 });
 window.addEventListener('offline',()=>label());
 window.addEventListener('online',()=>{label();
  if(pending!==null&&!conflict){clearTimeout(retryTimer);retryTimer=null;void flush()}
  inposCheckSessionAndRevision();
 });
 setInterval(inposCheckSessionAndRevision,15000);
 if(pending!==null&&!conflict){setTimeout(()=>{label();void flush()},1500)}
 setTimeout(inposCheckSessionAndRevision,1800);
})();
