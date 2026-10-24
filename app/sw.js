/* INPOS v802 offline shell: public static assets only. Never cache /api, PHP bootstrap or sessions. */
'use strict';
const VERSION='inpos-static-offline-v802';
const SHELL=["/offline-shell.html", "/offline-unavailable.html", "/pwa-icon-192.png", "/pwa-icon-512.png", "/assets/css/app-body-900a3eccfeac.css", "/assets/css/inpos-stock-data-scroll-v802.css", "/assets/css/app-head-d9d98534014f.css", "/assets/css/inpos-capacitor-topbar-v781.css", "/assets/css/inpos-sync-indicator-v800.css", "/assets/css/inpos-fullscreen-ticker-v789.css", "/assets/css/inpos-product-form-bottom-fix-v784.css", "/assets/css/inpos-products-steps-v736.css", "/assets/css/inpos-receipts-v114.css", "/assets/css/inpos-referral-rates-v791.css", "/assets/css/inpos-shift-actions-icon-v788.css", "/assets/css/inpos-supplier-v749.css", "/assets/css/inpos-topbar-logo-unified-v790.css", "/assets/css/inpos-v774-mobile.css", "/assets/css/inpos-webtoko-audit-v761.css", "/assets/css/inpos-webtoko-contrast-v754.css", "/assets/css/inpos-webtoko-gradient-v760.css", "/assets/css/inpos-webtoko-header-join-v762.css", "/assets/css/inpos-webtoko-template-v753.css", "/assets/css/inpos-webtoko-template-v759.css", "/assets/js/app-190-25fb1a6c8a0e.js", "/assets/js/app-193-7304d1345593.js", "/assets/js/app-229-a12f56e5c6b1.js", "/assets/js/app-381-0dd609bc3504.js", "/assets/js/app-481-febe9c37cf00.js", "/assets/js/app-802-313c465ceb4d.js", "/assets/js/inpos-notifications-server.js", "/assets/js/inpos-products-steps-v736.js", "/assets/js/inpos-receipts-v114.js", "/assets/js/inpos-referral-owner-v801.js", "/assets/js/inpos-server-sync-v800.js", "/assets/js/inpos-v774-mobile.js", "/assets/js/inpos-webtoko-contrast-v754.js", "/assets/js/inpos-webtoko-header-join-v762.js", "/assets/media/image-9195ed35b4119934.png", "/assets/media/image-f8b32fb00bb519d3.png"];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 // Install remains usable when a nonessential asset is temporarily unavailable.
 await Promise.allSettled(SHELL.map(async url=>{const r=await fetch(url,{cache:'reload'});if(r.ok&&r.type!=='opaque')await cache.put(url,r)}));
 await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('inpos-static-offline-')&&k!==VERSION).map(k=>caches.delete(k)));
 await self.clients.claim();
})());});
function isAppNavigation(req,url){
 return req.mode==='navigate'&&url.origin===self.location.origin&&['/','/index.php'].includes(url.pathname);
}
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.startsWith('/api/')||url.pathname==='/proxy.php'||url.pathname==='/login')return;
 if(isAppNavigation(req,url)){
   event.respondWith((async()=>{
     try{const r=await fetch(req);if(r.status!==502&&r.status!==503&&r.status!==504)return r;}
     catch(_e){}
     return await caches.match('/offline-shell.html')||new Response('Offline shell belum siap',{status:503});
   })());return;
 }
 if(!SHELL.includes(url.pathname))return;
 event.respondWith((async()=>{
   const cached=await caches.match(url.pathname);
   if(cached)return cached;
   try{const r=await fetch(req);if(r.ok&&r.type!=='opaque'){const c=await caches.open(VERSION);await c.put(url.pathname,r.clone())}return r;}
   catch(_e){return Response.error()}
 })());
});
