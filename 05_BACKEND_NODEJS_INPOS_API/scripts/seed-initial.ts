import '../src/load-env';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/* Hanya membuat akun awal, tidak menghapus transaksi atau tenant yang sudah ada. */
async function main() {
  const prisma = new PrismaClient();
  try {
    const admin = (process.env.INITIAL_SUPERADMIN_USERNAME || '').trim().toLowerCase();
    const adminPin = process.env.INITIAL_SUPERADMIN_PIN || '';
    const slug = (process.env.INITIAL_STORE_SLUG || '').trim().toLowerCase();
    const storeName = (process.env.INITIAL_STORE_NAME || '').trim();
    const owner = (process.env.INITIAL_OWNER_USERNAME || '').trim().toLowerCase();
    const ownerPin = process.env.INITIAL_OWNER_PIN || '';
    if (admin !== 'superinpos' || owner !== 'inpos' || slug !== 'inpos') throw new Error('Konfigurasi seed harus superinpos / inpos / inpos.');
    if (!storeName || !/^\d{6}$/.test(adminPin) || !/^\d{6}$/.test(ownerPin)) throw new Error('Konfigurasi nama toko dan PIN 6 digit wajib diisi.');

    const existingAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN', tenantId: null }, select: { id:true, username:true } });
    if (existingAdmins.some(u => u.username !== admin)) throw new Error('Database berisi akun Super Admin lain. Hentikan seed dan audit terlebih dahulu; tidak menghapus akun otomatis.');
    if (!existingAdmins.length) {
      await prisma.user.create({data:{tenantId:null, username:admin, displayName:'Super Admin Utama INPOS', passwordHash:await bcrypt.hash(adminPin,12), role:'SUPER_ADMIN', mustChangePin:true}});
      console.log('Akun utama Super Admin dibuat: superinpos (wajib ganti PIN).');
    } else console.log('Akun Super Admin sudah ada; PIN tidak ditimpa.');

    let tenant = await prisma.tenant.findUnique({ where:{slug} });
    if (!tenant) {
      const config = await prisma.systemConfig.findUnique({where:{id:1}});
      const days = Math.max(1,Math.min(365,config?.trialDays || Number(process.env.TRIAL_DAYS) || 60));
      tenant = await prisma.tenant.create({data:{slug,name:storeName,trialEndsAt:new Date(Date.now()+days*86400000)}});
      console.log('Toko dibuat: https://inpos.inpos.id');
    } else console.log('Toko inpos sudah ada; data tidak dihapus.');
    const existingOwner = await prisma.user.findFirst({ where:{tenantId:tenant.id,username:owner} });
    if (!existingOwner) {
      await prisma.user.create({data:{tenantId:tenant.id,username:owner,displayName:'Owner INPOS',passwordHash:await bcrypt.hash(ownerPin,12),role:'OWNER',mustChangePin:true}});
      console.log('Owner inpos dibuat (wajib ganti PIN).');
    } else if (existingOwner.role !== 'OWNER') throw new Error('Username inpos sudah digunakan peran lain dalam tenant ini.');
    else console.log('Owner inpos sudah ada; PIN tidak ditimpa.');
    console.log('Seed selesai. Tidak ada produk/akun demo yang dibuat.');
  } finally { await prisma.$disconnect(); }
}
main().catch(e=>{console.error('Seed gagal:',e.message);process.exit(1)});
