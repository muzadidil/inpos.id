'use strict';
// Routing deterministik: Host diteruskan utuh oleh reverse proxy (jangan percayai X-Forwarded-Host).
const BASE_DOMAIN=String(process.env.INPOS_BASE_DOMAIN||'inpos.id').toLowerCase().replace(/^\.+|\.+$/g,'');
const HOSTS=Object.freeze({landing:BASE_DOMAIN,login:'login.'+BASE_DOMAIN,app:'app.'+BASE_DOMAIN,admin:'adms.'+BASE_DOMAIN,shop:'toko.'+BASE_DOMAIN});
const LOCAL=new Set(['localhost','127.0.0.1','[::1]']);
// Host sementara hPanel hanya untuk staging. Tidak digunakan sebagai cookie domain bersama.
const STAGING_HOST=String(process.env.INPOS_STAGING_HOST||'').trim().toLowerCase().replace(/:\d+$/,'');
if(STAGING_HOST&&(!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(STAGING_HOST)||Object.values(HOSTS).includes(STAGING_HOST))){
 throw Error('INPOS_STAGING_HOST harus hostname DNS sementara yang valid dan bukan domain produksi.');
}
function isStagingHost(req){return !!STAGING_HOST&&hostname(req)===STAGING_HOST} 
function hostname(req){
 const raw=String(req.headers.host||'').toLowerCase().trim();
 if(!raw||/[^a-z0-9.:[\]-]/.test(raw))return '';
 return raw.startsWith('[')?raw.split(']')[0]+']':raw.split(':')[0];
}
function site(req){const h=hostname(req);if(LOCAL.has(h))return 'local';for(const [name,host] of Object.entries(HOSTS))if(h===host)return name;return 'local';}
function recognizedHost(req){const h=hostname(req);if(isStagingHost(req))return true;if(LOCAL.has(h))return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(String(req.socket?.remoteAddress||''));return Object.values(HOSTS).includes(h);}
function production(req){return site(req)!=='local';}
function target(req,name,p='/',search=''){
 if(production(req))return 'https://'+HOSTS[name]+p+search;
 const local={landing:'/',login:'/login',app:'/app',admin:'/super-admin',shop:'/web-toko'};
 return name==='shop'&&p!=='/'?p+search:(local[name]||'/')+search;
}
module.exports={BASE_DOMAIN,HOSTS,hostname,site,recognizedHost,production,target,isStagingHost};
