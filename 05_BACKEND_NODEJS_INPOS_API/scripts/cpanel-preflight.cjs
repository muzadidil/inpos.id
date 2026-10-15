/* Pre-flight checker; never prints secrets or modifies database. */
'use strict';
require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
let failed = 0;
const check = (ok,msg) => { console.log(`${ok?'[OK]':'[PERIKSA]'} ${msg}`); if(!ok)failed++; };
const major = Number(process.versions.node.split('.')[0]);
check(major>=22,`Node.js >=22 (saat ini ${process.version})`);
check(!!process.env.DATABASE_URL,'DATABASE_URL tersedia');
let databaseUrl;
try { databaseUrl = new URL(process.env.DATABASE_URL); } catch {}
check(databaseUrl?.protocol === 'mysql:', 'DATABASE_URL menggunakan mysql://');
check(!!databaseUrl?.hostname, 'DB host tersedia');
check(!!databaseUrl?.pathname && databaseUrl.pathname!=='/', 'Nama database tersedia');
for(const name of ['JWT_SECRET','CSRF_SECRET']){
 const val=process.env[name]||'';
 check(val.length>=32&&!/^(CHANGE_|REPLACE_)/.test(val),`${name} acak minimal 32 karakter`);
}
check(!!process.env.REGISTRATION_REFERRAL_CODE && !/^(CHANGE_|REPLACE_)/.test(process.env.REGISTRATION_REFERRAL_CODE),'Kode registrasi bukan placeholder');
check(fs.existsSync(path.join(__dirname,'..','prisma','schema.prisma')),'Prisma schema tersedia');
check(fs.existsSync(path.join(__dirname,'..','dist','main.js')),'NestJS dist/main.js sudah dibuild');
check(fs.existsSync(path.join(__dirname,'..','node_modules','@prisma','client')),'@prisma/client terpasang');
console.log(failed?'Perlu perbaikan sebelum restart aplikasi.':'Preflight berhasil. Lanjut tes API dan database.');
process.exitCode=failed?1:0;
