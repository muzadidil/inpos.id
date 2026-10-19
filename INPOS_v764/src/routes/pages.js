'use strict';
const {UNHANDLED}=require('../http/contract');
const {site,production,target}=require('../http/sites');
const {redirect,http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState}=require('../domain/shared');
const legacyPages=new Map([
 ['/index.html','/'],['/index','/'],
 ['/login.html','/login'],['/app.html','/app'],
 ['/super-admin.html','/super-admin'],['/web-toko.html','/web-toko']
]);
// Halaman tetap menggunakan aset HTML/CSS/JS v749; yang berubah hanya router berdasarkan hostname.
function loginPage(res,s){
 if(s&&s.role!=='superadmin')return null;
 const pub={tenants:refsys.publicCodes(),config:adminState().state.config};
 return sendHtml(res,'login.html',`window.INPOS_LOCAL_SERVER=true;try{if(localStorage.getItem('inpos_sync_dirty')==='1'){const old=localStorage.getItem('myposid_demo_v3');if(old)localStorage.setItem('inpos_unsynced_backup_'+Date.now(),old);localStorage.removeItem('inpos_sync_dirty')}localStorage.removeItem('myposid_demo_v3');localStorage.removeItem('inpos_device_login_v633')}catch(e){}localStorage.setItem('inpos_demo_public_state_v1',${safeScript(JSON.stringify(pub))});`);
}
function appPage(res,s){
 const row=stateRow(s.tenant_id),data=clampTaxLicense(s.tenant_id,hidePins(JSON.parse(row.json))),user=userFor(s);
 data.settings.activeEmployeeId=user.id;data.settings.cashier=user.display_name;data.settings.employeeLoggedOut=false;
 const boot=`window.INPOS_LOCAL_SERVER=true;window.INPOS_BOOT_REVISION=${row.revision};window.INPOS_BOOT_TENANT=${s.tenant_id};window.INPOS_BOOT_USER=${safeScript(user.id)};try{if(localStorage.getItem('inpos_sync_dirty')==='1'){const old=localStorage.getItem('myposid_demo_v3');if(old)localStorage.setItem('inpos_unsynced_backup_'+Date.now(),old);localStorage.removeItem('inpos_sync_dirty')}localStorage.setItem('myposid_demo_v3',${safeScript(JSON.stringify(data))});localStorage.setItem('inpos_device_login_v633',JSON.stringify({v:1,mode:'remember',employeeId:${safeScript(user.id)}}));}catch(e){console.error('Tidak dapat memuat data toko:',e)}`;
 return sendHtml(res,'app.html',boot);
}
function adminPage(res,s){
 const boot=s?.role==='superadmin'?`document.documentElement.dataset.saAuth='ready';window.INPOS_LOCAL_SERVER=true;window.INPOS_DB_ENGINE=${safeScript(db.engine||'sqlite')};window.INPOS_ADMIN_REVISION=${adminState().revision};localStorage.setItem('inpos_super_admin_subscriptions_demo_v3',${safeScript(JSON.stringify(adminState().state))});`:`window.INPOS_LOCAL_SERVER=true;`;
 return sendHtml(res,'super-admin.html',boot);
}
const oldPages=new Map([
 ['/index.html','landing'],['/index','landing'],['/login.html','login'],['/login','login'],
 ['/app.html','app'],['/app','app'],['/super-admin.html','admin'],['/super-admin','admin'],
 ['/web-toko.html','shop'],['/web-toko','shop']
]);
async function handle({req,res,p,s,url}){
 const hostSite=site(req),live=production(req),search=url.search;
 if(/^\/katalog\/[a-z0-9-]+\.json$/.test(p)){
  const c=catalog(p.slice(9,-5));return c?response(res,200,c):fail(res,404,'Toko tidak ditemukan.');
 }
 if(!['GET','HEAD'].includes(req.method))return UNHANDLED;
 // Semua .html lama diarahkan ke URL baru; tidak menambah halaman "Toko Mitra".
 if(oldPages.has(p)){
  const name=oldPages.get(p);
  if(live){if(name==='shop')return fail(res,404,'Gunakan alamat toko.inpos.id/namatoko.');return redirect(res,target(req,name,'/',search));}
  const legacy={landing:'/',login:'/login',app:'/app',admin:'/super-admin',shop:'/web-toko'};
  if(p!==legacy[name])return redirect(res,legacy[name]+search);
 }
 if(live){
  if(hostSite==='landing'){
   if(p==='/')return sendHtml(res,'index.html');
   if(/^\/[A-Za-z0-9]{6,11}$/.test(p)){
    const code=p.slice(1).toUpperCase(),owner=refsys.resolve(code);
    if(owner){const q=new URLSearchParams(search);q.set('ref',code);return redirect(res,target(req,'login','/','?'+q));}
   }
   if(/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)&&catalog(p.slice(1)))return redirect(res,target(req,'shop',p,search));
   return UNHANDLED;
  }
  if(hostSite==='login'){
   if(p!=='/')return UNHANDLED;
   if(s&&s.role!=='superadmin')return redirect(res,target(req,'app','/',search));
   return loginPage(res,s);
  }
  if(hostSite==='app'){
   if(p!=='/')return UNHANDLED;
   if(!s||s.role==='superadmin')return redirect(res,target(req,'login','/'));
   return appPage(res,s);
  }
  if(hostSite==='admin'){
   if(p!=='/')return UNHANDLED;
   return adminPage(res,s);
  }
  if(hostSite==='shop'){
   if(/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)&&catalog(p.slice(1)))return sendHtml(res,'web-toko.html');
   return UNHANDLED;
  }
 }
 // Termux / localhost tetap memakai semua route pendek tanpa ketergantungan DNS.
 if(/^\/[A-Za-z0-9]{6,11}$/.test(p)){
  const code=p.slice(1).toUpperCase(),owner=refsys.resolve(code);
  if(owner)return redirect(res,'/login?ref='+encodeURIComponent(code));
 }
 if(p==='/app')return (!s||s.role==='superadmin')?redirect(res,'/login'):appPage(res,s);
 if(p==='/login')return s&&s.role!=='superadmin'?redirect(res,'/app'):loginPage(res,s);
 if(p==='/super-admin')return adminPage(res,s);
 if(p==='/')return sendHtml(res,'index.html');
 if(p==='/web-toko')return sendHtml(res,'web-toko.html');
 if(/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)&&catalog(p.slice(1)))return sendHtml(res,'web-toko.html');
 return UNHANDLED;
}
module.exports={handle};
