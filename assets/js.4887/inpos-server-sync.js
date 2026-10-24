/* INPOS local multi-tenant bridge. UI lama tetap utuh; server adalah sumber kebenaran. */
(()=>{'use strict';
 if(!window.INPOS_LOCAL_SERVER)return;
 const admin=document.documentElement.dataset.saAuth==='ready';
 const key=admin?'inpos_super_admin_subscriptions_demo_v3':'myposid_demo_v3';
 const route=admin?'/api/admin/state':'/api/tenant/state';
 // Jangan unduh seluruh snapshot tiap 15 detik; metadata revisi cukup untuk mendeteksi sesi lain.
 const pollRoute=admin?'/api/admin/revision':'/api/tenant/revision';
 const tenantId=window.INPOS_BOOT_TENANT,userId=window.INPOS_BOOT_USER;
 let revision=admin?window.INPOS_ADMIN_REVISION:window.INPOS_BOOT_REVISION;
 if(!Number.isSafeInteger(revision))return;
 let pending=null,working=false,conflict=false,timer=null,lastError=false,noticeTimer=null;
 if(admin)window.INPOS_ADMIN_SYNC_PENDING=false;
 const native=Storage.prototype.setItem;
 if(admin){window.INPOS_ADMIN_SERVER_REVISION=()=>revision;window.INPOS_ADMIN_SYNC_READY=()=>pending===null&&!working&&!conflict;window.INPOS_ADMIN_ACCEPT_REMOTE=(data,rev)=>{if(pending!==null||working||conflict||!Number.isSafeInteger(rev))return false;revision=rev;native.call(localStorage,key,JSON.stringify(data));native.call(localStorage,'inpos_sync_meta',JSON.stringify({tenantId,revision}));window.INPOS_ADMIN_SYNC_PENDING=false;return true;};}
 const inform=(message,clearAfter=0)=>{let e=document.getElementById('inpos-server-sync-status');if(!e){e=document.createElement('div');e.id='inpos-server-sync-status';e.setAttribute('role','status');e.style.cssText='position:fixed;bottom:72px;right:12px;max-width:290px;background:#222;color:white;padding:10px 14px;font:12px Arial,sans-serif;border-radius:9px;z-index:2147483646;box-shadow:0 5px 24px #0003';document.body.appendChild(e)}e.textContent=message;e.hidden=false;clearTimeout(noticeTimer);if(clearAfter)noticeTimer=setTimeout(()=>{e.hidden=true},clearAfter);};
 Storage.prototype.setItem=function(k,v){const result=native.call(this,k,v);if(this===localStorage&&k===key&&!conflict){pending=String(v);if(admin)window.INPOS_ADMIN_SYNC_PENDING=true;native.call(localStorage,'inpos_sync_dirty','1');clearTimeout(timer);timer=setTimeout(flush,550)}return result};
 async function flush(){if(working||pending===null||conflict)return;working=true;const json=pending;pending=null;try{const state=JSON.parse(json);const r=await fetch(route,{method:'PUT',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-INPOS-Request':'1',...(admin?{}:{'X-INPOS-Tenant':String(tenantId),'X-INPOS-User':String(userId)})},body:JSON.stringify({revision,state})});const result=await r.json();if(r.status===409||r.status===400||r.status===401||r.status===403){conflict=true;native.call(localStorage,'inpos_sync_conflict_backup_'+Date.now(),json);if(admin)window.INPOS_ADMIN_SYNC_PENDING=false;inform((result.error||'Perubahan ditolak server.')+' Perubahan disimpan sebagai cadangan di browser. Muat ulang untuk mengambil data resmi.');return}if(!r.ok)throw Error(result.error||'HTTP '+r.status);revision=result.revision;lastError=false;if(pending===null){localStorage.removeItem('inpos_sync_dirty');if(admin){window.INPOS_ADMIN_SYNC_PENDING=false;inform('Perubahan tersimpan di database server.',3000)}}native.call(localStorage,'inpos_sync_meta',JSON.stringify({tenantId,revision}));}
 catch(e){if(!lastError){inform('Sinkronisasi tertunda: '+e.message+'. Data perubahan masih tersimpan di browser.');lastError=true;}if(pending===null)pending=json;setTimeout(flush,5000)}finally{working=false;if(pending!==null&&!conflict)setTimeout(flush,150)}}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&pending!==null)void flush()});
 if(admin)window.addEventListener('beforeunload',event=>{if((pending!==null||working)&&!conflict){event.preventDefault();event.returnValue=''}});
 // Pemeriksaan revisi lintas browser; tidak memaksa reload saat transaksi sedang berlangsung.
 setInterval(async()=>{if(conflict||working||pending!==null||document.visibilityState!=='visible')return;try{
  const r=await fetch(pollRoute,{credentials:'same-origin',cache:'no-store'});
  if(r.status===401){conflict=true;inform(admin?'Sesi Super Admin sudah kedaluwarsa. Simpan pekerjaan lalu masuk kembali.':'Sesi login berakhir. Silakan masuk kembali.');return}
  if(!r.ok)return;
  const d=await r.json();
  if(!admin){
   // Periksa identitas yang benar-benar dikirim server. Jangan menganggap field kosong sebagai akun berganti.
   if(d.tenant_id==null||d.user_id==null){conflict=true;inform('Identitas sesi tidak tersedia. Muat ulang aplikasi untuk menyinkronkan.');return}
   if(String(d.tenant_id)!==String(tenantId)||String(d.user_id)!==String(userId)){
    conflict=true;inform('Sesi akun telah berganti di browser. Tutup tab lama dan buka kembali INPOS untuk akun yang sedang login.');return;
   }
  }
  if(d.revision>revision){
   // Auto-merge hanya jika tidak ada perubahan lokal ataupun form yang aktif.
   // Jangan menjadikan aksi referral server sebagai konflik permanen.
   if(admin&&typeof window.INPOS_ADMIN_CAN_RECEIVE_STATE==='function'&&window.INPOS_ADMIN_CAN_RECEIVE_STATE()&&typeof window.INPOS_ADMIN_APPLY_REMOTE_STATE==='function'){
    try{
     const next=await fetch('/api/admin/state',{credentials:'same-origin',cache:'no-store'});
     if(next.ok){const fresh=await next.json();if(fresh?.ok&&fresh.state&&Number.isSafeInteger(fresh.revision)&&pending===null&&!working&&!conflict){
      if(window.INPOS_ADMIN_ACCEPT_REMOTE(fresh.state,fresh.revision)){
       if(window.INPOS_ADMIN_APPLY_REMOTE_STATE(fresh.state))return;
       conflict=true;inform('Data Super Admin perlu dimuat ulang.');return;
      }
     }}
    }catch{}
   }
   // Bila sedang mengetik, tunggu pengecekan berikutnya; jangan membuang isian.
   if(admin&&typeof window.INPOS_ADMIN_CAN_RECEIVE_STATE==='function'&&!window.INPOS_ADMIN_CAN_RECEIVE_STATE())return;
   conflict=true;inform('Data diperbarui dari perangkat lain. Muat ulang halaman untuk menyinkronkan.');
  }
 }catch{}},15000);
})();
