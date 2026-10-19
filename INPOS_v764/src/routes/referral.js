'use strict';
const {UNHANDLED}=require('../http/contract');
const {http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState}=require('../domain/shared');
async function handle({req,res,p,s,url}){
 // Penanda ringan untuk aplikasi Owner: ambil riwayat lengkap hanya bila ada perubahan.
 if(p==='/api/referral/revision'&&req.method==='GET'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner dapat melihat Program Referral.');
  const rev=db.prepare('SELECT revision FROM admin_state WHERE id=1').get();
  const wd=db.prepare("SELECT COALESCE(MAX(id),0) latest,COUNT(*) total,COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END),0) pending,COALESCE(MAX(handled_at),'') handled FROM referral_withdrawals WHERE tenant_id=?").get(s.tenant_id);
  return response(res,200,{ok:true,version:[Number(rev.revision),Number(wd.latest),Number(wd.total),Number(wd.pending),String(wd.handled||'')].join(':')});
 }
 if(p==='/api/referral/me'&&req.method==='GET'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner dapat melihat Program Referral.');
  const tenant=db.prepare('SELECT * FROM tenants WHERE id=?').get(s.tenant_id),state=adminState().state;
  return response(res,200,{ok:true,code:refsys.current(tenant),active:!!tenant.referral_active,editUsed:!!tenant.referral_code_edited,link:'https://inpos.id/'+refsys.current(tenant).toLowerCase(),commission:refsys.config(state.config),summary:refsys.summary(tenant.id,state),members:refsys.memberList(tenant.id,state),withdrawals:refsys.history(tenant.id)});
 }
 if(p==='/api/referral/profile'&&req.method==='PATCH'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner dapat mengubah kode referral.');
  const body=await readBody(req),t=db.prepare('SELECT * FROM tenants WHERE id=?').get(s.tenant_id);
  if(!t)return fail(res,404,'Toko tidak ditemukan.');
  if(body.active!==undefined){if(typeof body.active!=='boolean')return fail(res,400,'Status harus boolean.');db.prepare('UPDATE tenants SET referral_active=? WHERE id=?').run(body.active?1:0,t.id);return response(res,200,{ok:true})}
  const code=String(body.code||'').trim().toUpperCase();
  if(!refsys.validCode(code))return fail(res,400,'Kode referral harus 7–11 karakter, hanya huruf atau angka atau kombinasi keduanya.');
  if(t.referral_code_edited)return fail(res,409,'Kode referral sudah pernah diganti.');
  if(code===refsys.current(t))return response(res,200,{ok:true,unchanged:true});
  const existing=refsys.resolve(code,{active:false});if(existing&&existing.id!==t.id)return fail(res,409,'Kode referral telah digunakan toko lain.');
  db.prepare('UPDATE tenants SET referral_code=?,referral_code_edited=1 WHERE id=? AND referral_code_edited=0').run(code,t.id);
  return response(res,200,{ok:true,code});
 }
 if(p==='/api/referral/withdrawals'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner dapat mengajukan pencairan.');
  const b=await readBody(req),amount=Number(b.amount),bank=String(b.bank||'').trim(),accountNumber=String(b.accountNumber||'').replace(/\D/g,''),accountName=String(b.accountName||'').trim();
  if(!Number.isSafeInteger(amount)||amount<=0||amount>1e9||bank.length<2||bank.length>80||!/^[0-9]{6,24}$/.test(accountNumber)||accountName.length<3||accountName.length>90)return fail(res,400,'Nominal atau rekening tidak valid.');
  try{db.exec('BEGIN IMMEDIATE');const a=adminState().state,sum=refsys.summary(s.tenant_id,a),min=refsys.config(a.config).minimumPayout;
   if(amount<min||amount>sum.available)throw Object.assign(new Error(amount<min?'Belum memenuhi minimal pencairan.':'Saldo komisi tidak cukup.'),{status:409});
   const id=db.prepare('INSERT INTO referral_withdrawals(tenant_id,amount,bank,account_number,account_name,created_at) VALUES(?,?,?,?,?,?)').run(s.tenant_id,amount,bank,accountNumber,accountName,iso()).lastInsertRowid;
   a.notifications.push({id:'REF-N-'+id,title:'Pengajuan Penarikan Referral',body:'Mitra '+s.tenant_id+' mengajukan pencairan komisi Rp'+amount.toLocaleString('id-ID')+'.',read:false,created:iso()});
   db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(a),iso());db.exec('COMMIT');return response(res,201,{ok:true,id});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||500,e.message)}
 }
 if(p==='/api/public/referrals'&&req.method==='GET')return response(res,200,{ok:true,config:adminState().state.config,tenants:refsys.publicCodes(),codes:refsys.publicCodes()});

return UNHANDLED;
}
module.exports={handle};
