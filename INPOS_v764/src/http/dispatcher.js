'use strict';
const {fail,sourceAllowed,sessionFrom,renewAdminSession}=require('../domain/shared');
const {UNHANDLED}=require('./contract');
const {serve}=require('./static');
const {recognizedHost}=require('./sites');
const {site}=require('./sites');
const routes=[
 require('../routes/auth'),
 require('../routes/tenant'),
 require('../routes/admin'),
 require('../routes/referral'),
 require('../routes/billing'),
 require('../routes/pages')
];
async function dispatch(req,res){
 try{
  // Public hosts must match the five configured INPOS virtual hosts, or explicit loopback for health checks.
  if(process.env.NODE_ENV==='production'&&!recognizedHost(req))return fail(res,421,'Hostname tidak dikenal.');
  const url=new URL(req.url,'http://local.inpos');
  const p=decodeURIComponent(url.pathname);
  if(!sourceAllowed(req))return fail(res,403,'Permintaan lintas situs ditolak.');
  const adminPath=p==='/super-admin'||p==='/super-admin.html'||p.startsWith('/api/admin/')||(site(req)==='admin'&&p==='/');
  const s=sessionFrom(req,adminPath);
  if(adminPath&&s?.role==='superadmin')renewAdminSession(req,res,s);
  for(const route of routes){
   const handled=await route.handle({req,res,p,s,url});
   if(handled!==UNHANDLED)return;
  }
  return serve(req,res,p);
 }catch(e){
  if(!res.headersSent)fail(res,e.status||500,e.status?e.message:'Terjadi kesalahan server.');
  else if(!res.writableEnded)res.end();
  console.error('[INPOS]',e.message);
 }
}
module.exports={dispatch};
