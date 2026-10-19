'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {ROOT,mime,fail}=require('../domain/shared');
const PUBLIC_ROOTS=['assets/'];
const PUBLIC_FILES=new Set(['manifest.webmanifest','sw.js','pwa-icon-192.png','pwa-icon-512.png','katalog.json']);
function serve(req,res,p){
 if(!['GET','HEAD'].includes(req.method))return fail(res,404,'Tidak ditemukan.');
 const relative=p.replace(/^\//,'');
 if(!relative||relative.includes('..')||relative.split('/').some(part=>part.startsWith('.'))||!(PUBLIC_FILES.has(relative)||PUBLIC_ROOTS.some(prefix=>relative.startsWith(prefix))))return fail(res,404,'Tidak ditemukan.');
 const abs=path.resolve(ROOT,relative);
 if(!abs.startsWith(ROOT+path.sep))return fail(res,403,'Akses ditolak.');
 let stat;try{stat=fs.statSync(abs)}catch{return fail(res,404,'Tidak ditemukan.');}
 const ext=path.extname(abs);
 if(!stat.isFile()||!mime[ext])return fail(res,404,'Tidak ditemukan.');
 res.writeHead(200,{'Content-Type':mime[ext],'X-Content-Type-Options':'nosniff','Cache-Control':['.js','.css','.png','.webp'].includes(ext)?'public,max-age=3600':'no-store'});
 if(req.method==='HEAD'){res.end();return;}
 fs.createReadStream(abs).pipe(res);
}
module.exports={serve};
