#!/usr/bin/env node
'use strict';
const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
let fails=0;
const reqVars=['NODE_ENV','INPOS_DB_ENGINE','DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'];
const status=(ok,label)=>{console.log((ok?'OK   ':'FAIL ')+label);if(!ok)fails++};
console.log('INPOS v764 — preflight Hostinger Cloud (tanpa membeberkan password)');
status(Number(process.versions.node.split('.')[0])>=22,'Node.js v22+');
status(process.env.NODE_ENV==='production','NODE_ENV=production');
status(process.env.INPOS_DB_ENGINE==='mariadb','INPOS_DB_ENGINE=mariadb (adapter mysql2)');
for(const key of reqVars.slice(2))status(!!String(process.env[key]||'').trim(),key+' terisi');
for(const file of ['package.json','server/server.js','server/mariadb-config.js','frontend/pages/login.html','frontend/pages/app.html','frontend/pages/super-admin.html','frontend/pages/web-toko.html']){
 status(fs.existsSync(path.join(root,file)),'Ada file '+file);
}
if(reqVars.slice(2).every(k=>!!String(process.env[k]||'').trim())){
 try{const c=require('../server/mariadb-config').config();status(!!c.host&&!!c.user&&!!c.database,'Format DB_* valid');}catch(e){status(false,'Kredensial DB_* / host / TLS: '+e.message)}
}
try{require.resolve('mysql2/promise',{paths:[root]});status(true,'Dependensi mysql2 ditemukan');}catch{status(false,'Dependensi mysql2 tidak ditemukan (harus diinstal saat deploy)')}
const {HOSTS}=require('../src/http/sites');
for(const h of Object.values(HOSTS))console.log('DOMAIN '+h);
console.log('PERLU UJI: koneksi MySQL asli, HTTPS, pemetaan 5 host, sesi lintas subdomain, backup/restore dan transaksi.');
if(fails){console.error('Preflight gagal:',fails,'pemeriksaan.');process.exitCode=1}else console.log('Preflight konfigurasi lokal lulus. Ini BUKAN sertifikat siap produksi.');
