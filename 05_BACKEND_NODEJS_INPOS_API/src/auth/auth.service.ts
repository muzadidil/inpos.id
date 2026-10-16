import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { UserRole } from '@prisma/client';

export type Session={uid:string,tid:string|null,role:UserRole,jti:string,pv:string};
@Injectable()
export class AuthService {
 constructor(private readonly prisma:PrismaService,private readonly jwt:JwtService){}
 async register(dto:RegisterDto){
   if(!process.env.REGISTRATION_REFERRAL_CODE||dto.referralCode!==process.env.REGISTRATION_REFERRAL_CODE)throw new ForbiddenException('Kode referral belum terdaftar');
   const slug=dto.slug.toLowerCase();if(['admin','api','app','www','shop','adms','support'].includes(slug))throw new BadRequestException('Nama subdomain disediakan untuk sistem');
   const settings=await this.prisma.systemConfig.findUnique({where:{id:1}});
   const days=settings?.trialDays||Number(process.env.TRIAL_DAYS)||60;
   const trialEndsAt=new Date(Date.now()+Math.max(1,Math.min(365,days))*86400000);
   try{
     const tenant=await this.prisma.tenant.create({data:{slug,name:dto.storeName.trim(),address:dto.address?.trim(),whatsapp:dto.whatsapp?.trim(),trialEndsAt,
       users:{create:{username:dto.username.toLowerCase().trim(),displayName:dto.ownerName.trim(),passwordHash:await bcrypt.hash(dto.password,12),role:'OWNER'}}},include:{users:true}});
     return {tenant,user:tenant.users[0]};
   }catch(e:any){if(e?.code==='P2002')throw new ConflictException('Subdomain atau username telah digunakan');throw e;}
 }
 async login(username:string,password:string,tenantSlug:string,admin=false){
   const tenant=admin?null:await this.prisma.tenant.findUnique({where:{slug:tenantSlug.toLowerCase().trim()}});
   if(!admin&&!tenant)throw new UnauthorizedException('Username, toko, atau password salah');
   const user=await this.prisma.user.findFirst({where:{tenantId:tenant?.id??null,username:username.toLowerCase().trim(),role:admin?'SUPER_ADMIN':undefined}});
   if(!user||!user.active||admin!== (user.role==='SUPER_ADMIN')||!await bcrypt.compare(password,user.passwordHash))throw new UnauthorizedException('Username, toko, atau password salah');
   return {user,tenant};
 }
 async changePin(userId:string,currentPin:string,newPin:string){
   if(currentPin===newPin)throw new BadRequestException('PIN baru harus berbeda dari PIN awal');
   const user=await this.prisma.user.findUnique({where:{id:userId}});
   if(!user||!user.active||!await bcrypt.compare(currentPin,user.passwordHash))throw new UnauthorizedException('PIN lama salah');
   const updated=await this.prisma.user.update({where:{id:userId},data:{passwordHash:await bcrypt.hash(newPin,12),mustChangePin:false}});
   return {user:updated};
 }
 private passwordVersion(hash:string){return createHmac('sha256',process.env.CSRF_SECRET||'').update(hash).digest('hex');}
 async issueSession(user:{id:string;tenantId:string|null;role:UserRole;passwordHash:string}){
   const jwt=await this.jwt.signAsync({uid:user.id,tid:user.tenantId,role:user.role,jti:randomUUID(),pv:this.passwordVersion(user.passwordHash)},{expiresIn:'12h'});
   return {jwt,csrf:this.csrf(jwt)};
 }
 csrf(token:string){return createHmac('sha256',process.env.CSRF_SECRET||'').update(token).digest('hex');}
 verifyPasswordVersion(hash:string,version:unknown){if(typeof version!=='string'||!/^([a-f0-9]{64})$/.test(version))throw new UnauthorizedException('Sesi sudah tidak berlaku');
   const a=Buffer.from(this.passwordVersion(hash),'hex'),b=Buffer.from(version,'hex');
   if(!timingSafeEqual(a,b))throw new UnauthorizedException('PIN telah berubah. Silakan masuk kembali');}
 verifyCsrf(token:string,value:unknown){if(typeof value!=='string'||! /^[a-f0-9]{64}$/.test(value))throw new ForbiddenException('Token CSRF wajib valid');
   const a=Buffer.from(this.csrf(token),'hex'),b=Buffer.from(value,'hex');if(a.length!==b.length||!timingSafeEqual(a,b))throw new ForbiddenException('Token CSRF salah');}
 async verify(token:string):Promise<Session>{try{return await this.jwt.verifyAsync<Session>(token)}catch{throw new UnauthorizedException('Sesi berakhir, masuk kembali');}}
}
