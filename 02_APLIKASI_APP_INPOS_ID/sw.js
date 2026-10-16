// INPOS PWA shell: static files only, never API responses or personal data.
const CACHE='inpos-shell-v7-v721c';
const SHELL=["/index.html", "/icon.png", "/manifest.webmanifest"];
const ASSETS=new Set(["/icon.png", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"]);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('inpos-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).then(response=>{
     if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('/index.html',copy)));}
     return response;
   }).catch(()=>caches.match('/index.html').then(cached=>cached||Response.error())));
   return;
 }
 if(!ASSETS.has(url.pathname))return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
   if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}
   return response;
 })));
});
