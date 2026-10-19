'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),net=require('node:net');
const {db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin}=require('../../server/database');
const refsys=require('../../server/referral');
const {site,BASE_DOMAIN,hostname}=require('../http/sites');
const {todayWIB,addMonthsClamped}=require('../../server/calendar');
const ROOT=path.resolve(__dirname,'../..'),PORT=Number(process.env.PORT||3000),HOST=process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1');
if(!Number.isInteger(PORT)||PORT<1||PORT>65535)throw Error('PORT harus antara 1–65535.');
const MAX_BODY=15*1024*1024,COOKIE='inpos_session',ADMIN_COOKIE='inpos_admin_session';
const ADMIN_IDLE_SECONDS=12*3600,ADMIN_RENEW_THRESHOLD_MS=2*3600*1000;
const attempts=new Map();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
function response(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
function fail(res,status,message,extra={}){response(res,status,{ok:false,error:message,...extra})}
function readBody(req){return new Promise((resolve,reject)=>{let chunks=[],size=0,tooLarge=false;req.on('data',b=>{if(tooLarge)return;size+=b.length;if(size>MAX_BODY){tooLarge=true;chunks=[];reject(Object.assign(new Error('Payload terlalu besar.'),{status:413}));req.resume();return}chunks.push(b)});req.on('end',()=>{if(tooLarge)return;try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}catch{reject(Object.assign(new Error('JSON tidak valid.'),{status:400}))}});req.on('error',reject)})}
function sourceAllowed(req){if(['GET','HEAD','OPTIONS'].includes(req.method))return true;if(req.headers['x-inpos-request']!=='1')return false;const origin=req.headers.origin;if(origin){try{return new URL(origin).host===req.headers.host}catch{return false}}return true}
// Pisahkan cookie Super Admin dan Mitra: login Mitra tidak boleh mengganti sesi admin.
function cookieToken(req,name){
 const entry=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
 const token=entry?.slice(name.length+1)||'';
 return /^[0-9a-f]{64}$/.test(token)?token:null;
}
function sessionFrom(req,adminPath=false){
 // Baca cookie admin sendiri terlebih dahulu. Cookie lama didukung untuk migrasi sesi aktif.
 for(const name of adminPath?[ADMIN_COOKIE,COOKIE]:[COOKIE]){
  const token=cookieToken(req,name);if(!token)continue;
  const row=db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').get(crypto.createHash('sha256').update(token).digest('hex'),Date.now());
  if(!row)continue;
  if(adminPath&&row.role!=='superadmin')continue;
  if(!adminPath&&row.role==='superadmin')return row; // API tenant tetap menolaknya dengan 401.
  if(row.role==='superadmin')return {...row,_session_cookie:name,_session_token:token};
  const u=db.prepare('SELECT active FROM users WHERE tenant_id=? AND id=?').get(row.tenant_id,row.user_id),t=db.prepare('SELECT suspended FROM tenants WHERE id=?').get(row.tenant_id);
  return u?.active&&t&&!t.suspended?row:null;
 }
 return null;
}
function cookieHeader(name,token,maxAge,req){const share=req&&site(req)!=='local'&&name===COOKIE;const secure=req&&!['localhost','127.0.0.1','[::1]'].includes(hostname(req));return `${name}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${share?'; Domain='+BASE_DOMAIN:''}${secure?'; Secure':''}`;}
function createSession(req,res,uid,tid,role,remember){
 const token=crypto.randomBytes(32).toString('hex');const max=remember?30*86400:ADMIN_IDLE_SECONDS;
 db.prepare('INSERT INTO sessions(token_hash,user_id,tenant_id,role,expires_at,created_at) VALUES(?,?,?,?,?,?)').run(crypto.createHash('sha256').update(token).digest('hex'),uid,tid,role,Date.now()+max*1000,Date.now());
 res.setHeader('Set-Cookie',cookieHeader(role==='superadmin'?ADMIN_COOKIE:COOKIE,token,max,req));return token;
}
function renewAdminSession(req,res,s){
 if(!s||s.role!=='superadmin'||!s._session_token)return;
 const now=Date.now();let remaining=Number(s.expires_at)-now;
 if(remaining<=0)return;
 const renewed=remaining<ADMIN_RENEW_THRESHOLD_MS;
 if(renewed){
  const next=now+ADMIN_IDLE_SECONDS*1000;
  const changed=db.prepare('UPDATE sessions SET expires_at=? WHERE token_hash=? AND expires_at>?').run(next,crypto.createHash('sha256').update(s._session_token).digest('hex'),now);
  if(changed.changes!==1)return;
  remaining=next-now;
 }
 // Migrasi sesi lama dan perpanjangan sesi aktif dilakukan tanpa menurunkan keamanan cookie.
 if(s._session_cookie===COOKIE||renewed)res.setHeader('Set-Cookie',cookieHeader(ADMIN_COOKIE,s._session_token,Math.max(1,Math.ceil(remaining/1000)),req));
}
function logout(req,res,admin=false){
 const active=sessionFrom(req,admin),name=admin?ADMIN_COOKIE:COOKIE;
 const legacyAdmin=admin&&active?.role==='superadmin'&&active._session_cookie===COOKIE;
 const token=cookieToken(req,legacyAdmin?COOKIE:name);
 if(token&&(admin?active?.role==='superadmin':active?.role!=='superadmin')){
  db.prepare('DELETE FROM sessions WHERE token_hash=?').run(crypto.createHash('sha256').update(token).digest('hex'));
 }
 const clear=n=>`${n}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${site(req)!=='local'&&n===COOKIE?'; Domain='+BASE_DOMAIN:''}${!['localhost','127.0.0.1','[::1]'].includes(hostname(req))?'; Secure':''}`;
 res.setHeader('Set-Cookie',legacyAdmin?[clear(ADMIN_COOKIE),clear(COOKIE)]:clear(name));
}
function clientIp(req){
 const peer=String(req.socket.remoteAddress||'?');
 const loopback=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(peer);
 // Only trust the dedicated header inserted (overwritten) by our own loopback Caddy proxy.
 // Never trust arbitrary X-Forwarded-For supplied by a browser.
 if(loopback){const remote=String(req.headers['x-inpos-client-ip']||'').trim();if(net.isIP(remote))return remote;}
 return peer;
}
function throttle(req,kind){const ip=clientIp(req),key=kind+':'+ip,now=Date.now(),x=attempts.get(key)||{at:now,count:0};if(now-x.at>60000){x.at=now;x.count=0}x.count++;attempts.set(key,x);if(attempts.size>15000){for(const [k,v]of attempts)if(now-v.at>120000)attempts.delete(k)}return x.count<=15}
function userFor(session){return db.prepare('SELECT id,tenant_id,username,phone,display_name,role,active,permissions FROM users WHERE tenant_id=? AND id=?').get(session.tenant_id,session.user_id)}
function hidePins(state){const data=structuredClone(state);if(Array.isArray(data.employees))for(const emp of data.employees)if(emp&&typeof emp==='object')emp.pin='';return data}
function stateRow(tid){return db.prepare('SELECT revision,json FROM states WHERE tenant_id=?').get(tid)}
function taxQuote(cfg,months){
 const gross=Math.floor(Number(cfg.tax)||0)*months,d=cfg.taxDiscount||{},rule=d.enabled===true&&Array.isArray(d.rules)?d.rules.find(r=>Number(r.months)===months):null;
 const value=Number(rule?.value),discount=rule&&['fixed','percent'].includes(rule.mode)&&Number.isFinite(value)&&value>=0?Math.min(gross,Math.round(rule.mode==='percent'?gross*Math.min(100,value)/100:value)):0;
 return {gross,discount,amount:gross-discount};
}
function choosePaymentCode(payments,subtotal){
 const pending=payments.filter(p=>p.status==='pending'),used=new Set(pending.map(p=>Number(p.uniqueCode))),totals=new Set(pending.map(p=>Number(p.amount)+Number(p.uniqueCode||0)));
 for(let code=1;code<=999;code++)if(!used.has(code)&&!totals.has(subtotal+code))return code;
 throw Object.assign(new Error('Kode unik 001–999 sedang penuh. Hubungi Super Admin.'),{status:409});
}
function confirmNotification(state,invoice,title){
 const id=(invoice.type==='tax'?'TAX-N-':'SUB-N-')+invoice.id;
 if(!state.notifications.some(n=>n.id===id))state.notifications.unshift({id,paymentId:invoice.id,title,body:'Mitra '+invoice.tenantId+' mengonfirmasi pembayaran '+invoice.id+' sebesar Rp'+(Number(invoice.amount)+Number(invoice.uniqueCode||0)).toLocaleString('id-ID')+'. Verifikasi dana sebelum persetujuan.',read:false,created:iso()});
}
function validateTaxDiscount(d,cfg){
 if(!d||typeof d!=='object'||Array.isArray(d)||typeof d.enabled!=='boolean'||!Array.isArray(d.rules)||d.rules.length>20)throw Object.assign(new Error('Aturan Diskon Pajak tidak valid.'),{status:400});
 const seen=new Set();const rules=d.rules.map(r=>{const months=Number(r.months),value=Number(r.value),gross=Number(cfg.tax)*months;
 if(!Number.isInteger(months)||months<1||months>36||seen.has(months)||!['percent','fixed'].includes(r.mode)||!Number.isFinite(value)||value<0||(r.mode==='percent'&&value>100)||(r.mode==='fixed'&&(!Number.isSafeInteger(value)||value>gross)))throw Object.assign(new Error('Durasi atau potongan Pajak tidak valid.'),{status:400});
 seen.add(months);return {months,mode:r.mode,value};});
 return {enabled:d.enabled,rules:rules.sort((a,b)=>a.months-b.months)};
}
function taxLicensed(tid){const t=db.prepare('SELECT tax_end,suspended FROM tenants WHERE id=?').get(tid);return !!t&&!t.suspended&&!!t.tax_end&&Date.parse(t.tax_end+'T23:59:59+07:00')>Date.now()}
function clampTaxLicense(tid,state){if(state?.settings?.taxV597&&!taxLicensed(tid))state.settings.taxV597.enabled=false;return state}
function adminRows(){
 const bankProfiles=JSON.parse(db.prepare('SELECT json FROM admin_state WHERE id=1').get().json).tenantBankProfiles||{};
 // Hindari >10.000 kueri ketika mitra mencapai 5.000 akun.
 const rows=db.prepare("SELECT t.*,u.username owner_username FROM tenants t LEFT JOIN users u ON u.tenant_id=t.id AND u.role='owner' ORDER BY t.id").all();
 const recentBanks=new Map();
 for(const r of db.prepare('SELECT tenant_id,bank,account_number,account_name FROM referral_withdrawals ORDER BY id DESC').all())if(!recentBanks.has(r.tenant_id))recentBanks.set(r.tenant_id,{name:r.bank,number:r.account_number,holder:r.account_name});
 return rows.map(t=>({id:'T'+t.code,code:t.code,name:t.name,owner:t.owner,wa:t.phone,email:t.email,referral:t.referral,address:t.address,registeredAt:t.created_at,created:t.created_at,subdomain:t.slug,username:t.owner_username||'',end:t.subscription_end,taxEnd:t.tax_end,suspended:!!t.suspended,source:'inpos-server',referralCode:refsys.current(t),referralActive:!!t.referral_active,referralEdited:!!t.referral_code_edited,payoutBank:bankProfiles[t.code]||recentBanks.get(t.id)||{}}));
}
function adminState(){const row=db.prepare('SELECT revision,json FROM admin_state WHERE id=1').get();const data=JSON.parse(row.json);data.tenants=adminRows();data.nextTenant=data.tenants.reduce((max,t)=>Math.max(max,Number(t.code)+1||1),1);return {revision:row.revision,state:data}}
function catalog(sl){const t=db.prepare('SELECT id,name,address,phone FROM tenants WHERE slug=? AND suspended=0').get(sl);if(!t)return null;let s;try{s=JSON.parse(stateRow(t.id).json)}catch{return null}const cfg=s.settings?.marketOnline||{};const products=(Array.isArray(s.products)?s.products:[]).filter(x=>x&&x.active!==false&&x.marketOnline!==false).slice(0,250).map(p=>({id:String(p.id??'').slice(0,80),name:String(p.name||'Produk').slice(0,150),category:String(p.category||'Umum').slice(0,90),unit:String(p.unit||'pcs').slice(0,30),price:p.manualPrice?null:Math.max(0,Number(p.price)||0),stock:p.noStock?null:Math.max(0,Number(p.stock)||0),available:p.noStock||Number(p.stock)>0,image:typeof p.image==='string'&&(/^(?:https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/.test(p.image))?p.image:'',emoji:String(p.emoji||'📦').slice(0,4)}));return{slug:sl,store:{name:t.name,description:String(cfg.description||cfg.tickerText||'').slice(0,600),address:t.address,whatsapp:cfg.whatsapp||t.phone,themeColor:cfg.themeColor||'#d91d36',storeType:cfg.storeType==='food'?'food':'retail',templates:{retail:['minimal','modern','showcase','catalog'].includes(cfg.templates?.retail)?cfg.templates.retail:'minimal',food:['classic','premium','cafe','quick'].includes(cfg.templates?.food)?cfg.templates.food:'classic'},headerGradient:['auto','red','blue','green','purple','dark'].includes(cfg.headerGradient)?cfg.headerGradient:'auto',showOrderButton:cfg.showOrderButton!==false,shippingFee:Math.max(0,Number(cfg.shippingFee)||0)},products}}
function safeScript(obj){return JSON.stringify(obj).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}
function sendHtml(res,filename,bootstrap=''){const html=fs.readFileSync(path.join(ROOT,'frontend','pages',filename),'utf8');const page=bootstrap?html.replace(/<head[^>]*>/i,match=>match+`<script>${bootstrap}</script>`):html;res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY'});res.end(page)}
function apiAuth(req,res,s,role='tenant'){if(!s||role==='admin'&&s.role!=='superadmin'||role==='tenant'&&s.role==='superadmin'){fail(res,401,'Sesi tidak valid. Silakan login kembali.');return false}return true}
function validPin(v){return /^\d{5,6}$/.test(String(v||''))}
function reconcileEmployees(tid,actor,arr){if(actor.role!=='owner')return;const existing=db.prepare('SELECT * FROM users WHERE tenant_id=?').all(tid);const byId=new Map(existing.map(u=>[u.id,u]));const got=new Set();for(const e of arr){if(!e||typeof e!=='object'||typeof e.id!=='string'||e.id.length>90)continue;got.add(e.id);const prev=byId.get(e.id),username=String(e.username||'').toLowerCase().trim(),p=phone(e.phone),role=e.role==='owner'?'owner':e.role==='supervisor'?'supervisor':'cashier';if(!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(username))continue;const pin=String(e.pin||'');if(prev){let hash=prev.pin_hash;if(pin&&validPin(pin))hash=hashPin(pin);db.prepare('UPDATE users SET username=?,phone=?,display_name=?,role=?,pin_hash=?,active=?,permissions=? WHERE tenant_id=? AND id=?').run(username,p||null,String(e.name||username).slice(0,90),prev.role==='owner'?'owner':role,hash,prev.role==='owner'?1:e.active===false?0:1,JSON.stringify(e.permissions||{}),tid,e.id)}else if(validPin(pin)){db.prepare('INSERT INTO users(id,tenant_id,username,phone,display_name,role,pin_hash,active,permissions) VALUES(?,?,?,?,?,?,?,?,?)').run(e.id,tid,username,p||null,String(e.name||username).slice(0,90),role,hashPin(pin),e.active===false?0:1,JSON.stringify(e.permissions||{}))}}
 for(const u of existing)if(!got.has(u.id)&&u.role!=='owner')db.prepare('UPDATE users SET active=0 WHERE tenant_id=? AND id=?').run(tid,u.id)
}
function cleanState(tid,actor,input,old){if(!input||typeof input!=='object'||Array.isArray(input)||!Array.isArray(input.employees)||!input.settings||typeof input.settings!=='object'||!Array.isArray(input.products)||!Array.isArray(input.sales))throw Object.assign(new Error('Struktur data INPOS tidak valid.'),{status:400});const productIds=new Set(),barcodes=new Set();for(const item of input.products){
 if(!item||typeof item!=='object'||!['string','number'].includes(typeof item.id)||String(item.id).length===0||productIds.has(String(item.id)))throw Object.assign(new Error('Produk memiliki ID duplikat/tidak valid.'),{status:400});productIds.add(String(item.id));
 for(const field of ['stock','price'])if(item[field]!==undefined&&item[field]!==null&&(!Number.isFinite(Number(item[field]))||Number(item[field])<0))throw Object.assign(new Error('Nilai '+field+' produk tidak valid.'),{status:400});
 const barcode=String(item.barcode||'').trim();if(barcode){if(barcodes.has(barcode))throw Object.assign(new Error('Barcode produk sudah digunakan: '+barcode.slice(0,30)),{status:409});barcodes.add(barcode);}
 }const data=structuredClone(input),actual=db.prepare('SELECT * FROM tenants WHERE id=?').get(tid);if(String(data.settings?.marketOnline?.subdomain||'')!==String(actual.slug))throw Object.assign(new Error('Data berasal dari toko lain. Sinkronisasi ditolak.'),{status:403});if(actor.role!=='owner'){
 const perm=JSON.parse(actor.permissions||'{}');
 const controls={products:'stock',sales:'sales',purchases:'purchases',customers:'customers',suppliers:'purchases',expenses:'expenses',cashEntries:'expenses',debtEntries:'customers',debtPayments:'customers'};
 for(const [field,right] of Object.entries(controls))if(perm[right]!==true&&JSON.stringify(data[field]||[])!==JSON.stringify(old[field]||[]))throw Object.assign(new Error('Akses perubahan '+field+' ditolak.'),{status:403});
 data.employees=old.employees;const protect=['store','ownerName','email','phone','address','storeAddress','inposRegistrationV632'];for(const k of protect)data.settings[k]=old.settings[k];if(perm.settings!==true){const before=old.settings||{};for(const k of Object.keys(data.settings))if(!['cashier','activeEmployeeId','employeeLoggedOut'].includes(k))data.settings[k]=before[k];}}else reconcileEmployees(tid,actor,data.employees);
 // Tenant ownership, slug and registration marker are immutable from the browser.
 data.settings.marketOnline=data.settings.marketOnline||{};data.settings.marketOnline.subdomain=actual.slug;data.settings.inposRegistrationV632=old.settings.inposRegistrationV632;
 if(actor.role==='owner')db.prepare('UPDATE tenants SET name=?,owner=?,address=? WHERE id=?').run(String(data.settings.store||actual.name).slice(0,100),String(data.settings.ownerName||actual.owner).slice(0,100),String(data.settings.address||actual.address).slice(0,280),tid);
 const saved=db.prepare('SELECT id,username,phone,display_name,role,active,permissions FROM users WHERE tenant_id=? ORDER BY rowid').all(tid);data.employees=saved.map(u=>({id:u.id,name:u.display_name,username:u.username,phone:u.phone||'',role:u.role,active:!!u.active,permissions:JSON.parse(u.permissions||'{}'),pin:''}));return clampTaxLicense(tid,data)}

function redirect(res,target){res.writeHead(302,{Location:target,'Cache-Control':'no-store'});res.end()}
module.exports={redirect,http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,clientIp,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState};
