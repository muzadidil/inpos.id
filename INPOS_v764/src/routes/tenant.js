'use strict';
const {UNHANDLED}=require('../http/contract');
const {http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState}=require('../domain/shared');
async function handle({req,res,p,s,url}){
 if(p==='/api/tenant/revision'&&req.method==='GET'){if(!apiAuth(req,res,s))return;const r=stateRow(s.tenant_id);return response(res,200,{ok:true,tenant_id:s.tenant_id,user_id:s.user_id,revision:r.revision})}
 if(p==='/api/tenant/state'&&req.method==='GET'){if(!apiAuth(req,res,s))return;const r=stateRow(s.tenant_id);return response(res,200,{ok:true,tenant_id:s.tenant_id,user_id:s.user_id,revision:r.revision,state:clampTaxLicense(s.tenant_id,hidePins(JSON.parse(r.json)))})}
 if(p==='/api/tenant/state'&&req.method==='PUT'){if(!apiAuth(req,res,s))return;if(String(req.headers['x-inpos-tenant']||'')!==String(s.tenant_id)||String(req.headers['x-inpos-user']||'')!==String(s.user_id))return fail(res,403,'Sesi toko berbeda. Buka ulang halaman untuk memuat akun aktif.');const body=await readBody(req);if(!Number.isSafeInteger(body.revision)||!body.state)return fail(res,400,'Revision dan data diperlukan.');const row=stateRow(s.tenant_id);if(row.revision!==body.revision)return fail(res,409,'Data toko diperbarui dari perangkat lain.',{revision:row.revision});const who=userFor(s);let data;try{db.exec('BEGIN IMMEDIATE');data=cleanState(s.tenant_id,who,body.state,JSON.parse(row.json));const result=db.prepare('UPDATE states SET json=?,revision=revision+1,updated_at=? WHERE tenant_id=? AND revision=?').run(JSON.stringify(data),iso(),s.tenant_id,row.revision);if(result.changes!==1)throw Object.assign(new Error('Konflik revisi.'),{status:409});db.exec('COMMIT')}catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||400,e.message)}return response(res,200,{ok:true,revision:row.revision+1});}
 if(p==='/api/tenant/broadcasts'&&req.method==='GET'){
  if(!apiAuth(req,res,s))return;
  const active=db.prepare('SELECT suspended FROM tenants WHERE id=?').get(s.tenant_id);
  if(!active||active.suspended)return response(res,200,{ok:true,items:[],unread:0});
  const rows=db.prepare('SELECT broadcast_id FROM broadcast_reads WHERE tenant_id=? AND user_id=?').all(s.tenant_id,s.user_id);
  const seen=new Set(rows.map(r=>r.broadcast_id));
  const items=(adminState().state.broadcasts||[]).filter(b=>b&&b.status==='server-published'&&b.target==='all').slice(0,50).map(b=>({id:b.id,title:b.title,body:b.body,image:b.image||'',createdAt:b.createdAt,read:seen.has(b.id)}));
  return response(res,200,{ok:true,items,unread:items.filter(b=>!b.read).length});
 }
 if(p==='/api/tenant/broadcasts/read'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;const body=await readBody(req),id=String(body.id||'');
  if(!/^B[0-9A-F]{24}$/.test(id))return fail(res,400,'ID pengumuman tidak valid.');
  const found=(adminState().state.broadcasts||[]).some(b=>b.id===id&&b.status==='server-published');
  if(!found)return fail(res,404,'Pengumuman tidak ditemukan.');
  // UPDATE dahulu untuk idempoten, lalu INSERT bila belum ada (kompatibel SQLite & MariaDB).
  const old=db.prepare('SELECT 1 FROM broadcast_reads WHERE tenant_id=? AND user_id=? AND broadcast_id=?').get(s.tenant_id,s.user_id,id);
  if(!old)try{db.prepare('INSERT INTO broadcast_reads(tenant_id,user_id,broadcast_id,read_at) VALUES(?,?,?,?)').run(s.tenant_id,s.user_id,id,iso())}catch(e){if(!/UNIQUE|Duplicate/i.test(String(e.message)))throw e}
  return response(res,200,{ok:true,read:true});
 }
 if(p==='/api/pin-reset-requests'&&req.method==='POST'){if(!throttle(req,'pinreset'))return fail(res,429,'Terlalu banyak percobaan.');const x=await readBody(req),u=db.prepare('SELECT id,tenant_id,username FROM users WHERE username=?').get(String(x.username||'').toLowerCase().trim());if(u){const pending=db.prepare("SELECT id FROM pin_requests WHERE tenant_id=? AND user_id=? AND status='pending'").get(u.tenant_id,u.id);if(!pending)db.prepare('INSERT INTO pin_requests(tenant_id,user_id,username,created_at) VALUES(?,?,?,?)').run(u.tenant_id,u.id,u.username,iso())}return response(res,202,{ok:true,message:'Jika akun terdaftar, permintaan diteruskan ke Super Admin.'})}

return UNHANDLED;
}
module.exports={handle};
