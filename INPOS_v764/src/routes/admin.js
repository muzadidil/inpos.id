'use strict';
const {UNHANDLED}=require('../http/contract');
const {http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState}=require('../domain/shared');
async function handle({req,res,p,s,url}){
 if(p==='/api/admin/tax-discount'&&req.method==='PATCH'){
  if(!apiAuth(req,res,s,'admin'))return;
  const b=await readBody(req);let rules;try{rules=validateTaxDiscount(b,adminState().state.config)}catch(e){return fail(res,e.status||400,e.message)}
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT revision,json FROM admin_state WHERE id=1').get();const state=JSON.parse(row.json);
   state.config.taxDiscount=rules;db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());db.exec('COMMIT');
   return response(res,200,{ok:true,revision:row.revision+1,config:rules});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Gagal menyimpan Diskon Paket Pajak.')}
 }
 if(p==='/api/admin/qris'&&req.method==='PUT'){
  if(!apiAuth(req,res,s,'admin'))return;
  const b=await readBody(req),raw=String(b.image||'');
  if(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw)||raw.length>1500000)return fail(res,400,'Gambar QRIS harus PNG/JPG/WebP dan maksimal sekitar 1 MB.');
  const mimePart=raw.slice(11,raw.indexOf(';')),buf=Buffer.from(raw.split(',')[1],'base64');
  const png=buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=buf.length>=4&&buf[0]===255&&buf[1]===216&&buf[buf.length-2]===255&&buf[buf.length-1]===217;
  const webp=buf.length>=12&&buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP';
  if(!(mimePart==='png'&&png||mimePart==='jpeg'&&jpg||mimePart==='webp'&&webp))return fail(res,400,'File QRIS tidak cocok dengan jenis gambar.');
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT revision,json FROM admin_state WHERE id=1').get();if(b.revision!==row.revision){db.exec('ROLLBACK');return fail(res,409,'Pengaturan sudah berubah. Muat ulang Super Admin.',{revision:row.revision});}
   const state=JSON.parse(row.json);state.config.qris=raw;
   db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());db.exec('COMMIT');
   return response(res,200,{ok:true,revision:row.revision+1,qris_available:true});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Gagal menyimpan QRIS pada database.');}
 }
 // Broadcast Mitra disimpan dan disebarkan melalui server; bukan feed demo browser.
 if(p==='/api/admin/broadcasts'&&req.method==='POST'){
  if(!apiAuth(req,res,s,'admin'))return;
  const b=await readBody(req),title=String(b.title||'').trim(),body=String(b.body||'').trim(),image=String(b.image||'');
  if(title.length<3||title.length>80||body.length<5||body.length>600)return fail(res,400,'Judul atau isi pengumuman tidak valid.');
  if(image&&(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>=280000))return fail(res,400,'Gambar pengumuman tidak valid.');
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT revision,json FROM admin_state WHERE id=1').get();
   if(b.revision!==row.revision){db.exec('ROLLBACK');return fail(res,409,'Data Super Admin berubah. Muat ulang halaman.',{revision:row.revision});}
   const data=JSON.parse(row.json),count=db.prepare('SELECT COUNT(*) AS n FROM tenants WHERE suspended=0').get().n;
   if(!count){db.exec('ROLLBACK');return fail(res,409,'Belum ada Mitra aktif.');}
   const entry={id:'B'+crypto.randomBytes(12).toString('hex').toUpperCase(),title,body,image,createdAt:iso(),audienceCount:count,target:'all',popup:true,status:'server-published'};
   data.broadcasts=[entry,...(data.broadcasts||[])].slice(0,100);
   db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(data),iso());db.exec('COMMIT');
   return response(res,201,{ok:true,broadcast:entry,revision:row.revision+1});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Gagal mengirim pengumuman ke database.');}
 }
 if(/^\/api\/admin\/broadcasts\/B[0-9A-F]{24}\/resend$/.test(p)&&req.method==='POST'){
  if(!apiAuth(req,res,s,'admin'))return;
  const id=p.split('/')[4],body=await readBody(req),nonce=String(body.request_id||'');
  if(!/^[a-f0-9]{32}$/.test(nonce))return fail(res,400,'Kode pengiriman tidak valid.');
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT json,revision FROM admin_state WHERE id=1').get(),state=JSON.parse(row.json);
   const old=(state.broadcasts||[]).find(x=>x.id===id&&x.status==='server-published');if(!old){db.exec('ROLLBACK');return fail(res,404,'Broadcast tidak ditemukan.');}
   const prior=(state.broadcasts||[]).find(x=>x.resendRequestId===nonce);
   if(prior){db.exec('COMMIT');return response(res,200,{ok:true,broadcast:prior,duplicate:true,revision:row.revision});}
   const count=db.prepare('SELECT COUNT(*) n FROM tenants WHERE suspended=0').get().n;
   if(!count){db.exec('ROLLBACK');return fail(res,409,'Belum ada Mitra aktif.');}
   const entry={...old,id:'B'+crypto.randomBytes(12).toString('hex').toUpperCase(),createdAt:iso(),audienceCount:count,resendOf:old.id,resendRequestId:nonce};
   state.broadcasts=[entry,...state.broadcasts].slice(0,100);
   db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());db.exec('COMMIT');
   return response(res,201,{ok:true,broadcast:entry,revision:row.revision+1});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Gagal mengirim ulang Broadcast.');}
 }
 if(p==='/api/admin/payments/summary'&&req.method==='GET'){if(!apiAuth(req,res,s,'admin'))return;const state=adminState().state;const pending=state.payments.filter(x=>x.status==='pending');return response(res,200,{ok:true,pending:pending.length,confirmed:pending.filter(x=>!!x.confirmedAt).length,notifications:state.notifications.filter(n=>!n.read).length,revision:adminState().revision});}
 if(p==='/api/admin/revision'&&req.method==='GET'){if(!apiAuth(req,res,s,'admin'))return;const r=db.prepare('SELECT revision FROM admin_state WHERE id=1').get();return response(res,200,{ok:true,revision:Number(r.revision)});}
 if(p==='/api/admin/state'&&req.method==='GET'){if(!apiAuth(req,res,s,'admin'))return;return response(res,200,{ok:true,...adminState()})}
 if(p==='/api/admin/state'&&req.method==='PUT'){if(!apiAuth(req,res,s,'admin'))return;const body=await readBody(req),current=adminState();if(body.revision!==current.revision)return fail(res,409,'Panel diperbarui dari sesi lain.',{revision:current.revision});const candidate=body.state;if(!candidate||candidate.version!==1||!Array.isArray(candidate.tenants)||!Array.isArray(candidate.payments)||!candidate.config)return fail(res,400,'Format Super Admin tidak valid.');try{db.exec('BEGIN IMMEDIATE');
 const bankProfiles={...(current.state.tenantBankProfiles||{})};
 const originalTenants=new Map(current.state.tenants.map(t=>[t.id,t]));
 const changedPayments=new Set(candidate.payments.filter(p=>current.state.payments.find(q=>q.id===p.id)?.status!==p.status).map(p=>p.tenantId));
 for(const t of candidate.tenants){
  // Tarif/konfigurasi sering disimpan tanpa mengedit ribuan profil mitra.
  if(originalTenants.has(t?.id)&&!changedPayments.has(t.id)&&JSON.stringify(t)===JSON.stringify(originalTenants.get(t.id)))continue;
  if(!t||!/^T\d{3,16}$/.test(String(t.id||''))||!/^\d{3,16}$/.test(String(t.code||''))||t.id!=='T'+t.code)continue;
  const found=db.prepare('SELECT * FROM tenants WHERE code=?').get(t.code);if(!found)continue;
  const newSlug=String(t.subdomain??found.slug).trim().toLowerCase();
  const newPhone=phone(t.wa);
  const newReferral=String(t.referral??found.referral??'').trim().toUpperCase();
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)||newSlug.length>40)throw Object.assign(new Error('Nama URL toko tidak valid.'),{status:400});
  if(!/^628[0-9]{7,12}$/.test(newPhone))throw Object.assign(new Error('WhatsApp mitra tidak valid.'),{status:400});
  if(newReferral.length>64)throw Object.assign(new Error('Kode referral terlalu panjang.'),{status:400});
  if(newReferral!==String(found.referral||'').toUpperCase()&&newReferral&&!refsys.resolve(newReferral,{active:false}))throw Object.assign(new Error('Kode referral belum terdaftar.'),{status:400});
  const another=db.prepare('SELECT id FROM tenants WHERE slug=?').get(newSlug);
  if(another&&another.id!==found.id)throw Object.assign(new Error('Nama URL toko sudah digunakan.'),{status:409});
  const newName=String(t.name||'').trim().slice(0,100),newOwner=String(t.owner||'').trim().slice(0,100);
  if(newName.length<2||newOwner.length<2)throw Object.assign(new Error('Nama usaha dan pemilik tidak valid.'),{status:400});
  const bank=t.payoutBank;
  if(bank&&typeof bank==='object'&&!Array.isArray(bank)){
   const name=String(bank.name||'').trim(),number=String(bank.number||'').trim(),holder=String(bank.holder||'').trim();
   if(name||number||holder){
    if(name.length<2||name.length>50||!/^[0-9]{6,24}$/.test(number)||holder.length<3||holder.length>80)throw Object.assign(new Error('Rekening pencairan tidak valid.'),{status:400});
    bankProfiles[found.code]={name,number,holder};
   }else delete bankProfiles[found.code];
  }
  const approvedNow=(candidate.payments||[]).some(p=>p.source==='server-sub'&&p.tenantId===t.id&&p.status==='approved'&&current.state.payments.find(q=>q.id===p.id)?.status==='pending');
  const subscriptionEnd=approvedNow?found.subscription_end:String(t.end||'');
  const taxEnd=String(t.taxEnd||'');
  const infoChanged=found.slug!==newSlug||found.referral!==newReferral||found.name!==newName||found.owner!==newOwner||found.phone!==newPhone||found.address!==String(t.address||'').slice(0,280)||found.email!==String(t.email||'').slice(0,160);
  db.prepare('UPDATE tenants SET slug=?,referral=?,name=?,owner=?,address=?,phone=?,email=?,subscription_end=?,tax_end=?,suspended=? WHERE id=?')
   .run(newSlug,newReferral,newName,newOwner,String(t.address||'').slice(0,280),newPhone,String(t.email||'').slice(0,160),subscriptionEnd,taxEnd,t.suspended?1:0,found.id);
  if(infoChanged){
   const ownerUser=db.prepare("SELECT id FROM users WHERE tenant_id=? AND role='owner' LIMIT 1").get(found.id);
   if(ownerUser)db.prepare('UPDATE users SET phone=?,display_name=? WHERE tenant_id=? AND id=?').run(newPhone,newOwner,found.id,ownerUser.id);
   const state=db.prepare('SELECT json FROM states WHERE tenant_id=?').get(found.id);
   if(state){
    const oldState=JSON.parse(state.json);oldState.settings=oldState.settings||{};
    Object.assign(oldState.settings,{store:newName,ownerName:newOwner,address:String(t.address||''),storeAddress:String(t.address||''),phone:newPhone,email:String(t.email||'')});
    oldState.settings.marketOnline={...(oldState.settings.marketOnline||{}),subdomain:newSlug};
    if(oldState.settings.inposRegistrationV632)oldState.settings.inposRegistrationV632.referralCode=newReferral;
    for(const emp of oldState.employees||[])if(emp.id===ownerUser?.id){emp.name=newOwner;emp.phone=newPhone;}
    db.prepare('UPDATE states SET json=?,revision=revision+1,updated_at=? WHERE tenant_id=?').run(JSON.stringify(oldState),iso(),found.id);
   }
  }
 }
 // Hindari tagihan duplikat dan status pembayaran server yang tidak dikenali.
 const paymentIds=new Set();
 for(const pay of candidate.payments){
  if(!pay||typeof pay.id!=='string'||paymentIds.has(pay.id))throw Object.assign(new Error('ID tagihan kosong atau duplikat.'),{status:400});
  paymentIds.add(pay.id);
 }
 for(const original of current.state.payments.filter(v=>['server-tax','server-sub'].includes(v.source))){
  const candidatePayment=candidate.payments.find(v=>v.id===original.id);
  if(!candidatePayment)throw Object.assign(new Error('Tagihan server tidak boleh dihapus.'),{status:403});
  for(const field of ['id','tenantId','type','months','amount','uniqueCode','requestId','created','confirmedAt','source','gross','discountAmount'])if(candidatePayment[field]!==original[field])throw Object.assign(new Error('Rincian tagihan server tidak boleh diubah.'),{status:403});
  if(!['pending','approved','rejected'].includes(candidatePayment.status))throw Object.assign(new Error('Status pembayaran tidak valid.'),{status:400});
  if(original.status!=='pending'&&candidatePayment.status!==original.status)throw Object.assign(new Error('Status tagihan final tidak boleh diubah.'),{status:403});
  if(original.status==='pending'&&candidatePayment.status==='approved'&&!original.confirmedAt)throw Object.assign(new Error('Owner belum mengonfirmasi pembayaran.'),{status:409});
  if(original.status==='pending'&&candidatePayment.status==='approved'){
   candidatePayment.handledAt=iso();
   if(original.source==='server-sub'){
    const tenant=db.prepare('SELECT * FROM tenants WHERE code=?').get(original.tenantId.slice(1));
    const awarded=tenant?refsys.commissionFor(original,tenant,current.state.config):null;
    if(awarded)candidatePayment.referralCommission=awarded;
    else delete candidatePayment.referralCommission;
    // Perpanjangan dihitung oleh server, bukan nilai tanggal kiriman browser.
    if(tenant){const today=todayWIB(),start=tenant.subscription_end>=today?tenant.subscription_end:today;db.prepare('UPDATE tenants SET subscription_end=? WHERE id=?').run(addMonthsClamped(start,Number(original.months)),tenant.id);}
   }
  }else {if(original.referralCommission)candidatePayment.referralCommission=original.referralCommission;else delete candidatePayment.referralCommission;}

 }
 if(JSON.stringify(candidate.commissionPayouts||[])!==JSON.stringify(current.state.commissionPayouts||[]))throw Object.assign(new Error('Pencairan komisi hanya melalui verifikasi server.'),{status:403});
 // Nota pembayaran server tidak boleh ditambahkan, dihapus, atau diganti klien.
 for(const p of candidate.payments){if(p.source==='server-tax'||p.source==='server-sub'){if(!current.state.payments.some(q=>q.id===p.id&&q.source===p.source))throw Object.assign(new Error('Tagihan server tidak dapat dibuat melalui browser.'),{status:403});}}
 const safe={...candidate,tenants:[],tenantBankProfiles:bankProfiles,config:{...current.state.config,...candidate.config}};db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(safe),iso());db.exec('COMMIT')}catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||400,e.status?e.message:'Data Super Admin gagal disimpan. Periksa isian dan coba kembali.')}return response(res,200,{ok:true,revision:current.revision+1});}
 if(p==='/api/admin/tenants'&&req.method==='GET'){if(!apiAuth(req,res,s,'admin'))return;return response(res,200,{ok:true,tenants:adminRows()});}
 if(p==='/api/admin/pin-requests'&&req.method==='GET'){if(!apiAuth(req,res,s,'admin'))return;return response(res,200,{ok:true,requests:db.prepare('SELECT id,username,tenant_id,user_id,status,created_at FROM pin_requests ORDER BY id DESC LIMIT 100').all()})}
 if(p==='/api/admin/pin-requests'&&req.method==='PATCH'){if(!apiAuth(req,res,s,'admin'))return;const x=await readBody(req);const old=db.prepare('SELECT * FROM pin_requests WHERE id=?').get(x.id);if(!old)return fail(res,404,'Permintaan tidak ditemukan.');if(!['pending','read','archived','resolved','rejected'].includes(x.status))return fail(res,400,'Status tidak valid.');db.prepare('UPDATE pin_requests SET status=?,updated_at=? WHERE id=?').run(x.status,iso(),old.id);return response(res,200,{ok:true});}
 if(p==='/api/admin/reset-pin'&&req.method==='POST'){if(!apiAuth(req,res,s,'admin'))return;const x=await readBody(req),r=db.prepare('SELECT * FROM pin_requests WHERE id=?').get(x.requestId);if(!r||!validPin(x.newPin))return fail(res,400,'Nomor permintaan atau PIN baru tidak valid.');db.prepare('UPDATE users SET pin_hash=? WHERE tenant_id=? AND id=?').run(hashPin(x.newPin),r.tenant_id,r.user_id);db.prepare("UPDATE pin_requests SET status='resolved',updated_at=? WHERE id=?").run(iso(),r.id);db.prepare('DELETE FROM sessions WHERE tenant_id=? AND user_id=?').run(r.tenant_id,r.user_id);return response(res,200,{ok:true});}
 // Perubahan konfigurasi referral disimpan atomik di database; panel Admin tidak lagi
 // menyatakan berhasil sebelum server menerima dan memverifikasinya.
 if(p==='/api/admin/referral/config'&&req.method==='PATCH'){
  if(!apiAuth(req,res,s,'admin'))return;
  const b=await readBody(req);
  const keys=Object.keys(b);
  if(!keys.length||keys.some(k=>!['referralCommission','minimumPayout'].includes(k)))return fail(res,400,'Pengaturan referral tidak valid.');
  const next={};
  if(Object.hasOwn(b,'referralCommission')){
   const c=b.referralCommission;
   if(!c||typeof c!=='object'||Array.isArray(c)||typeof c.enabled!=='boolean'||!['percent','fixed'].includes(c.mode)||typeof c.value!=='number'||!Number.isFinite(c.value)||c.value<0||(c.mode==='percent'&&c.value>100)||(c.mode==='fixed'&&(!Number.isSafeInteger(c.value)||c.value>1000000000)))return fail(res,400,'Komisi harus 0–100% atau nominal valid.');
   next.referralCommission={enabled:c.enabled,mode:c.mode,value:c.value};
  }
  if(Object.hasOwn(b,'minimumPayout')){
   if(!Number.isSafeInteger(b.minimumPayout)||b.minimumPayout<0||b.minimumPayout>1000000000)return fail(res,400,'Minimal pencairan harus Rp 0–1.000.000.000.');
   next.minimumPayout=b.minimumPayout;
  }
  try{
   db.exec('BEGIN IMMEDIATE');
   const state=adminState().state;
   state.config={...state.config,...next};
   db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());
   db.exec('COMMIT');
   return response(res,200,{ok:true,commission:refsys.config(state.config),revision:adminState().revision});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Pengaturan referral gagal disimpan di database.');}
 }
 // Periksa hanya penanda perubahan. Panel pencairan tidak perlu mengambil 1.000 baris terus-menerus.
 if(p==='/api/admin/referral/withdrawals/revision'&&req.method==='GET'){
  if(!apiAuth(req,res,s,'admin'))return;
  const x=db.prepare("SELECT COALESCE(MAX(id),0) latest,COUNT(*) total,COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END),0) pending,COALESCE(MAX(handled_at),'') handled FROM referral_withdrawals").get();
  return response(res,200,{ok:true,version:[Number(x.latest),Number(x.total),Number(x.pending),String(x.handled||'')].join(':'),pending:Number(x.pending)});
 }
 if(p==='/api/admin/referral/withdrawals'&&req.method==='GET'){
  if(!apiAuth(req,res,s,'admin'))return;
  const rows=db.prepare("SELECT w.*,t.name shop,t.code code FROM referral_withdrawals w JOIN tenants t ON w.tenant_id=t.id ORDER BY CASE WHEN w.status='pending' THEN 0 ELSE 1 END, w.id DESC LIMIT 1000").all();
  return response(res,200,{ok:true,requests:rows});
 }
 if(p==='/api/admin/referral/withdrawals'&&req.method==='PATCH'){
  if(!apiAuth(req,res,s,'admin'))return;const b=await readBody(req),id=Number(b.id),status=String(b.status||''),note=String(b.note||'').trim();
  if(!Number.isSafeInteger(id)||!['paid','rejected'].includes(status)||note.length<3||note.length>140)return fail(res,400,'Status atau catatan verifikasi tidak valid.');
  try{db.exec('BEGIN IMMEDIATE');const w=db.prepare('SELECT * FROM referral_withdrawals WHERE id=?').get(id);
   if(!w)throw Object.assign(new Error('Pengajuan tidak ditemukan.'),{status:404});if(w.status!=='pending')throw Object.assign(new Error('Pengajuan telah diproses.'),{status:409});
   if(status==='paid'){
    const state=adminState().state,sum=refsys.summary(w.tenant_id,state);
    if(sum.earned-sum.paid<w.amount)throw Object.assign(new Error('Saldo komisi tidak cukup.'),{status:409});
    state.commissionPayouts.push({id:'C'+String(w.id).padStart(4,'0'),tenantId:'T'+db.prepare('SELECT code FROM tenants WHERE id=?').get(w.tenant_id).code,amount:w.amount,created:iso(),note,bank:{name:w.bank,number:w.account_number,holder:w.account_name},requestId:w.id});
    db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());
   }
   const handledAt=iso();db.prepare('UPDATE referral_withdrawals SET status=?,note=?,handled_at=? WHERE id=? AND status=?').run(status,note,handledAt,id,'pending');db.exec('COMMIT');return response(res,200,{ok:true,id,status,note,handled_at:handledAt});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||500,e.message)}
 }

return UNHANDLED;
}
module.exports={handle};
