import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
// Wajib di-import paling awal. .env dibaca dari folder aplikasi, bukan folder kerja proses (hosting bisa start dari folder lain).
config({ path: join(__dirname, '..', '.env') });
// Hostinger (CloudLinux/CageFS) menyembunyikan /etc/os-release sehingga Prisma memilih engine debian-openssl-1.1.x
// dan panik ("timer has gone away"). Pakai engine rhel-openssl-3.0.x yang ikut di-generate (binaryTargets).
const engine=join(__dirname,'..','node_modules','.prisma','client','libquery_engine-rhel-openssl-3.0.x.so.node');
if(process.platform==='linux'&&!process.env.PRISMA_QUERY_ENGINE_LIBRARY&&!existsSync('/etc/os-release')&&existsSync(engine))process.env.PRISMA_QUERY_ENGINE_LIBRARY=engine;
