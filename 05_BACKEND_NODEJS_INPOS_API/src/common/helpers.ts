import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
export const safeInt=(x:unknown,min=0,max=2147483647)=>{
  const n=Number(x);
  if(!Number.isSafeInteger(n)||n<min||n>max)throw new BadRequestException('Nominal / jumlah tidak valid');
  return n;
};
export const slugify=(v:string)=>v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,60);
export const checkOperational=(t:Pick<Tenant,'status'|'trialEndsAt'|'subscriptionEndsAt'>)=>{
  const now=Date.now();
  if(t.status==='SUSPENDED')throw new ForbiddenException('Toko ditangguhkan oleh Super Admin');
  if(t.status==='TRIAL'&&new Date(t.trialEndsAt).getTime()>now)return;
  if(t.status==='ACTIVE'&&t.subscriptionEndsAt&&new Date(t.subscriptionEndsAt).getTime()>now)return;
  throw new ForbiddenException('Langganan tidak aktif. Hubungi Owner untuk memperpanjang.');
};
export function addMonthsUTC(date:Date,months:number){
  const d=new Date(date), day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);
  const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate(); d.setUTCDate(Math.min(day,last)); return d;
}
