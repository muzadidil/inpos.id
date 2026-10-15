import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequest, Roles, SessionGuard } from '../auth/auth.guard';
import { EmployeeDto, InvoiceDto, SettingsDto, SuspendedDto } from './admin.dto';
import { addMonthsUTC } from '../common/helpers';
import { InvoiceType, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';

@Controller()@UseGuards(SessionGuard)
export class AdminController {
 constructor(private db:PrismaService){}
 private config(){return this.db.systemConfig.upsert({where:{id:1},create:{id:1,subscriptionPrice:Number(process.env.SUBSCRIPTION_PRICE)||75000,taxLicensePrice:Number(process.env.TAX_LICENSE_PRICE)||50000,trialDays:Number(process.env.TRIAL_DAYS)||60,qrisImageUrl:process.env.QRIS_IMAGE_URL||null},update:{}});}
 private async t(req:AuthRequest){if(!req.identity?.tid)throw new ForbiddenException();const t=await this.db.tenant.findUnique({where:{id:req.identity.tid}});if(!t)throw new ForbiddenException();return t;}
 @Get('billing/config')async billingConfig(){const c=await this.config();return {subscriptionPrice:c.subscriptionPrice,taxLicensePrice:c.taxLicensePrice,trialDays:c.trialDays,qrisImageUrl:c.qrisImageUrl};}
 @Get('billing/my-invoices')async invoices(@Req()req:AuthRequest){const t=await this.t(req);return this.db.invoice.findMany({where:{tenantId:t.id},orderBy:{createdAt:'desc'},take:50});}
 @Post('billing/request')@Roles('OWNER')async requestInvoice(@Req()req:AuthRequest,@Body()dto:InvoiceDto){const t=await this.t(req),c=await this.config();if(!c.qrisImageUrl)throw new BadRequestException('QRIS belum ditetapkan Super Admin');const price=dto.type===InvoiceType.SUBSCRIPTION?c.subscriptionPrice:c.taxLicensePrice;
   if(price<=0)throw new BadRequestException('Tarif belum ditetapkan Super Admin');const amount=price*dto.months;if(amount>2147482647)throw new BadRequestException('Nominal terlalu besar');
   const existing=await this.db.invoice.findFirst({where:{tenantId:t.id,type:dto.type,months:dto.months,status:'PENDING'},orderBy:{createdAt:'desc'}});if(existing)return {...existing,qrisImageUrl:c.qrisImageUrl};
   // Unique locking uses a UNIQUE database constraint on PaymentCodeLock.code.
   for(let attempt=0;attempt<12;attempt++){
     const code=randomInt(1,1000);
     try{const inv=await this.db.$transaction(async tx=>{
       const p=await tx.invoice.create({data:{tenantId:t.id,type:dto.type,months:dto.months,amount,uniqueCode:code,total:amount+code}});
       await tx.paymentCodeLock.create({data:{invoiceId:p.id,code}});return p;
     });return {...inv,qrisImageUrl:c.qrisImageUrl};}
     catch(e:any){if(e?.code==='P2002')continue;throw e;}
   }
   throw new ConflictException('Kode unik sementara penuh. Coba lagi.');
 }
 @Get('admin/overview')@Roles('SUPER_ADMIN')async overview(){const [tenants,pending,products,config]=await Promise.all([this.db.tenant.count(),this.db.invoice.count({where:{status:'PENDING'}}),this.db.product.count(),this.config()]);return {tenants,pending,products,config};}
 @Get('admin/tenants')@Roles('SUPER_ADMIN')async tenants(@Query('cursor')cursor?:string,@Query('q')q?:string,@Query('limit')rawLimit?:string){
   if(q===undefined&&cursor===undefined&&rawLimit===undefined)return this.db.tenant.findMany({orderBy:[{createdAt:'desc'},{id:'desc'}],take:250,select:{id:true,slug:true,name:true,status:true,trialEndsAt:true,subscriptionEndsAt:true,taxActiveUntil:true,createdAt:true}});
   if(q!==undefined&&(typeof q!=='string'||q.length>100))throw new BadRequestException('Pencarian maksimal 100 karakter');
   if(cursor!==undefined&&(typeof cursor!=='string'||cursor.length>90))throw new BadRequestException('Cursor tidak valid');
   const limit=this.pageSize(rawLimit);const search=q?.trim();
   const rows=await this.db.tenant.findMany({where:search?{OR:[{name:{contains:search}},{slug:{contains:search}}]}:{},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit+1,...(cursor?{cursor:{id:cursor},skip:1}:{}),select:{id:true,slug:true,name:true,status:true,trialEndsAt:true,subscriptionEndsAt:true,taxActiveUntil:true,createdAt:true}});
   return {items:rows.slice(0,limit),nextCursor:rows.length>limit?rows[limit-1].id:null};
 }
 private pageSize(rawLimit?:string){const n=rawLimit===undefined?80:Number(rawLimit);if(!Number.isInteger(n)||n<1||n>100)throw new BadRequestException('Limit harus 1–100');return n;}

 @Get('admin/invoices')@Roles('SUPER_ADMIN')async allInvoices(@Query('cursor')cursor?:string,@Query('limit')rawLimit?:string){
   if(cursor===undefined&&rawLimit===undefined)return this.db.invoice.findMany({include:{tenant:{select:{name:true,slug:true}}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:250});
   if(cursor!==undefined&&(typeof cursor!=='string'||cursor.length>90))throw new BadRequestException('Cursor tidak valid');
   const limit=this.pageSize(rawLimit);const rows=await this.db.invoice.findMany({include:{tenant:{select:{name:true,slug:true}}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit+1,...(cursor?{cursor:{id:cursor},skip:1}:{})});
   return {items:rows.slice(0,limit),nextCursor:rows.length>limit?rows[limit-1].id:null};
 }

 @Patch('admin/settings')@Roles('SUPER_ADMIN')async saveSettings(@Body()dto:SettingsDto){const url=dto.qrisImageUrl?.trim()||null;if(url&&!/^https:\/\//i.test(url))throw new BadRequestException('QRIS harus URL HTTPS publik');return this.db.systemConfig.upsert({where:{id:1},create:{id:1,subscriptionPrice:dto.subscriptionPrice,taxLicensePrice:dto.taxLicensePrice,trialDays:dto.trialDays,qrisImageUrl:url},update:{subscriptionPrice:dto.subscriptionPrice,taxLicensePrice:dto.taxLicensePrice,trialDays:dto.trialDays,qrisImageUrl:url}});}
 @Patch('admin/tenants/:id/suspend')@Roles('SUPER_ADMIN')async suspend(@Param('id')id:string,@Body()dto:SuspendedDto){const t=await this.db.tenant.findUnique({where:{id}});if(!t)throw new BadRequestException('Toko tidak ditemukan');return this.db.tenant.update({where:{id},data:{status:dto.suspended?'SUSPENDED':t.subscriptionEndsAt&&t.subscriptionEndsAt>new Date()?'ACTIVE':t.trialEndsAt>new Date()?'TRIAL':'EXPIRED'}});}
 @Post('admin/invoices/:id/approve')@Roles('SUPER_ADMIN')async approve(@Param('id')id:string){return this.processInvoice(id,true);}
 @Post('admin/invoices/:id/reject')@Roles('SUPER_ADMIN')async reject(@Param('id')id:string){return this.processInvoice(id,false);}
 private processInvoice(id:string,approve:boolean){return this.db.$transaction(async tx=>{
   const inv=await tx.invoice.findUnique({where:{id}});if(!inv)throw new BadRequestException('Tagihan tidak ditemukan');if(inv.status!=='PENDING')throw new ConflictException('Tagihan sudah diproses');
   const result=await tx.invoice.updateMany({where:{id,status:'PENDING'},data:{status:approve?'APPROVED':'REJECTED',handledAt:new Date()}});if(result.count!==1)throw new ConflictException('Tagihan sudah diproses');
   if(approve){const tenant=await tx.tenant.findUniqueOrThrow({where:{id:inv.tenantId}});const now=new Date();
     if(inv.type==='SUBSCRIPTION'){
       const from=tenant.subscriptionEndsAt&&tenant.subscriptionEndsAt>now?tenant.subscriptionEndsAt:now;
       await tx.tenant.update({where:{id:tenant.id},data:{subscriptionEndsAt:addMonthsUTC(from,inv.months),status:tenant.status==='SUSPENDED'?'SUSPENDED':'ACTIVE'}});
     }else{const from=tenant.taxActiveUntil&&tenant.taxActiveUntil>now?tenant.taxActiveUntil:now;await tx.tenant.update({where:{id:tenant.id},data:{taxActiveUntil:addMonthsUTC(from,inv.months)}});}
   }
   await tx.paymentCodeLock.deleteMany({where:{invoiceId:id}});return {id,status:approve?'APPROVED':'REJECTED'};
 },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});}
 @Get('employees')@Roles('OWNER')async employees(@Req()req:AuthRequest){const t=await this.t(req);return this.db.user.findMany({where:{tenantId:t.id,role:'EMPLOYEE'},select:{id:true,username:true,displayName:true,active:true,createdAt:true}});}
 @Post('employees')@Roles('OWNER')async addEmployee(@Req()req:AuthRequest,@Body()dto:EmployeeDto){const t=await this.t(req);try{return await this.db.user.create({data:{tenantId:t.id,username:dto.username.toLowerCase().trim(),displayName:dto.displayName.trim(),passwordHash:await bcrypt.hash(dto.password,12),role:'EMPLOYEE',mustChangePin:true},select:{id:true,username:true,displayName:true,role:true}})}catch(e:any){if(e?.code==='P2002')throw new ConflictException('Username sudah terdaftar pada toko ini');throw e;}}
}
