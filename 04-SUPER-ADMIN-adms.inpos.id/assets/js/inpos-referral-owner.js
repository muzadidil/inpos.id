/* INPOS v735: server referral ledger & owner UI adapter. No CSS/layout replacement. */
(()=>{'use strict';if(!window.INPOS_LOCAL_SERVER)return;
 const baseOpen=window.openReferralProgramV339;
 const baseWithdraw=window.openReferralWithdrawV341;
 let data=null,busy=false,serverVersion=null;
 const money=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function api(url,method='GET',body){const r=await fetch(url,{method,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(method==='GET'?{}:{'Content-Type':'application/json','X-INPOS-Request':'1'})},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw Error(j.error||'Permintaan ditolak server.');return j;}
 const warn=e=>{if(typeof window.toast==='function')window.toast(String(e?.message||e),'error');else alert(e?.message||String(e));};
 function hydrate(d){data=d;window.INPOS_REFERRAL_DATA=d;}
 async function reload(){const d=await api('/api/referral/me');d.link='https://inpos.id/'+encodeURIComponent(d.code);hydrate(d);return d;}
 const onReferralPage=()=>typeof accountSystemState!=='undefined'&&accountSystemState?.type==='referral';
 let refreshBusy=false;
 async function refreshServerSettings(force=false){
  if(refreshBusy||!data||!onReferralPage()||(!force&&document.visibilityState!=='visible'))return;
  refreshBusy=true;
  try{
   const meta=await api('/api/referral/revision');
   if(!force&&serverVersion!==null&&meta.version===serverVersion)return;
   const old=JSON.stringify([data.commission,data.summary,data.members,data.withdrawals,data.editUsed,data.code,data.active]);
   await reload();serverVersion=meta.version;
   const newer=JSON.stringify([data.commission,data.summary,data.members,data.withdrawals,data.editUsed,data.code,data.active]);
   if(old!==newer)refresh();
  }catch(e){if(force)warn(e);}
  finally{refreshBusy=false;}
 }

 function refresh(){if(typeof window.renderReferralProgramV341==='function'&&typeof accountSystemState!=='undefined'&&accountSystemState?.type==='referral')window.renderReferralProgramV341();}
 window.referralProgramConfigV339=()=>{const p=data||{};const last=p.withdrawals?.[0]||{};return {code:p.code||'-',active:p.active===true,codeEditUsed:!!p.editUsed,withdrawals:(p.withdrawals||[]).map(w=>({id:w.id,amount:w.amount,bank:w.bank,accountNumber:w.accountNumber,accountName:w.accountName,status:w.status,createdAt:w.createdAt,handledAt:w.handledAt,note:w.note})),payoutAccount:{bank:last.bank||'',accountNumber:last.accountNumber||'',accountName:last.accountName||''}};};
 window.referralProgramMembersV339=()=>data?.members||[];
 window.referralProgramLinkV339=()=>data?.link||'';
 window.openReferralProgramV339=async function(){if(busy)return;busy=true;try{await reload();if(typeof baseOpen==='function')baseOpen();else refresh()}catch(e){warn(e)}finally{busy=false}};
 window.toggleReferralProgramV339=async()=>{if(!data)return;try{await api('/api/referral/profile','PATCH',{active:!data.active});await reload();refresh();window.toast?.(data.active?'Program Referral aktif.':'Program Referral nonaktif.')}catch(e){warn(e)}};
 window.copyReferralLinkV339=async()=>{try{await navigator.clipboard.writeText(data.link);window.toast?.('Link referral disalin.')}catch{window.prompt('Salin link referral',data?.link||'')}};
 window.shareReferralV339=async()=>{if(!data?.active)return warn('Aktifkan Program Referral terlebih dahulu.');const txt='Gabung INPOS melalui referral '+data.code+'\n'+data.link;try{if(navigator.share)await navigator.share({title:'Program Referral INPOS',text:txt});else{await navigator.clipboard.writeText(txt);window.toast?.('Teks referral disalin.')}}catch(e){if(e.name!=='AbortError')warn(e)}};
 window.openReferralCodeEditorV339=()=>{if(data?.editUsed)return warn('Kode referral sudah pernah diganti.');if(!data)return warn('Data referral belum siap.');
  showModal('Edit Kode Referral','Kesempatan edit hanya 1 kali',`<div class="ref339-editor"><div class="field"><label>Kode Referral Baru</label><div class="ref339-code-input-wrap"><span>inpos.id/</span><input id="referralCodeInputV339" maxlength="11" value="${esc(data.code)}" type="text" autocomplete="off" autocapitalize="characters"></div></div><div class="ref339-note">Kode referral dapat diubah 1x. Minimal 7 - 11 karakter, hanya huruf atau angka atau kombinasi. Kode harus unik. Setelah diganti, tidak dapat diubah kembali.</div></div>`,[{label:'Batal',close:true},{label:'Simpan & Kunci',primary:true,fn:()=>window.confirmReferralCodeV339(document.getElementById('referralCodeInputV339')?.value)}],true);
 };
 window.confirmReferralCodeV339=async raw=>{const code=String(raw||'').trim().toUpperCase();if(!/^[A-Z0-9]{7,11}$/.test(code))return warn('Kode harus 7–11 karakter, hanya huruf atau angka atau kombinasi.');if(code===data?.code){closeModal();return}if(data?.editUsed)return warn('Kesempatan edit sudah digunakan.');try{await api('/api/referral/profile','PATCH',{code});closeModal();await reload();refresh();window.toast?.('Kode referral berhasil disimpan dan terkunci.')}catch(e){warn(e)}};
 window.openReferralWithdrawV341=async function(){
  if(!data)return warn('Data referral belum tersedia.');
  try{await reload();refresh();}catch(e){return warn(e);}
  if((data.summary?.available||0)<Number(data.commission?.minimumPayout||0)||data.summary?.available<=0)return warn('Saldo belum memenuhi minimum pencairan '+money(data.commission?.minimumPayout));
  return baseWithdraw?.();
 };
 window.submitReferralWithdrawV341=async function(){if(busy)return;
  const bank=String(document.getElementById('referralWithdrawBankV341')?.value||'').trim(),accountNumber=String(document.getElementById('referralWithdrawAccountV341')?.value||'').replace(/\D/g,''),accountName=String(document.getElementById('referralWithdrawNameV341')?.value||'').trim();const amount=Number(String(document.getElementById('referralWithdrawAmountV341')?.value||'').replace(/\./g,''));
  if(bank.length<2||accountNumber.length<6||accountName.length<3||!Number.isSafeInteger(amount)||amount<=0)return warn('Periksa rekening dan nominal penarikan.');busy=true;try{await api('/api/referral/withdrawals','POST',{bank,accountNumber,accountName,amount});closeModal();await reload();refresh();window.toast?.('Pengajuan diteruskan ke Super Admin.')}catch(e){warn(e);await refreshServerSettings(true)}finally{busy=false}
 };
 // Aktualisasi saldo bila pengguna kembali dari menu lain tanpa reload halaman.
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void refreshServerSettings()});
 window.addEventListener('focus',()=>{void refreshServerSettings()});
 // Sinkron otomatis nilai referral ketika Super Admin mengubah pengaturan di tab lain.
 window.setInterval(()=>{void refreshServerSettings()},8000);
})();
