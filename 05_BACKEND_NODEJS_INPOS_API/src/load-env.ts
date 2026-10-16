import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, userInfo } from 'node:os';
// Wajib di-import paling awal. Urutan prioritas: variabel panel hosting, .env di folder aplikasi
// (bukan folder kerja proses), lalu ~/.inpos.env di server (rahasia di luar ZIP/GitHub). dotenv tidak menimpa nilai yang sudah ada.
config({ path: join(__dirname, '..', '.env') });
// Passenger Hostinger menyetel HOME ke folder domain, jadi home akun diambil dari passwd (userInfo).
let home=homedir();try{home=userInfo().homedir}catch{}
config({ path: join(home, '.inpos.env') });
// Hostinger (CloudLinux/CageFS) menyembunyikan /etc/os-release sehingga Prisma memilih engine debian-openssl-1.1.x
// dan panik ("timer has gone away"). Pakai engine rhel-openssl-3.0.x yang ikut di-generate (binaryTargets).
const engine=join(__dirname,'..','node_modules','.prisma','client','libquery_engine-rhel-openssl-3.0.x.so.node');
if(process.platform==='linux'&&!process.env.PRISMA_QUERY_ENGINE_LIBRARY&&!existsSync('/etc/os-release')&&existsSync(engine))process.env.PRISMA_QUERY_ENGINE_LIBRARY=engine;
