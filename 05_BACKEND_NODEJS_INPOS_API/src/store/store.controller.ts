import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequest, SessionGuard } from '../auth/auth.guard';
import { StoreOrderDto } from './store.dto';
import { checkOperational } from '../common/helpers';
import { Prisma } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
@Controller()
export class StoreController {
 constructor(private db:PrismaService){}
 @Get('stores/:slug')async catalog(@Param('slug')slug:string,@Query('catalog')includeCatalog?:string){const t=await this.db.tenant.findUnique({where:{slug}});if(!t)throw new BadRequestException('Toko tidak tersedia');checkOperational(t);return {store:{name:t.name,slug:t.slug,whatsapp:t.whatsapp},products:includeCatalog==='0'?[]:await this.db.product.findMany({where:{tenantId:t.id,active:true,stock:{gt:0}},select:{id:true,name:true,category:true,baseUnit:true,packUnit:true,packFactor:true,stock:true,price:true},take:200,orderBy:{name:'asc'}})};}
 @Get('stores/:slug/products')async page(@Param('slug')slug:string,@Query('q')q='',@Query('cursor')cursor?:string,@Query('limit')rawLimit?:string){
   const t=await this.db.tenant.findUnique({where:{slug}});if(!t)throw new BadRequestException('Toko tidak tersedia');checkOperational(t);
   if(typeof q!=='string'||q.length>100)throw new BadRequestException('Pencarian maksimal 100 karakter');
   if(cursor!==undefined&&(typeof cursor!=='string'||cursor.length>90))throw new BadRequestException('Cursor tidak valid');
   const limit=rawLimit===undefined?48:Number(rawLimit);if(!Number.isInteger(limit)||limit<1||limit>100)throw new BadRequestException('Limit harus 1–100');
   const search=q.trim();const where={tenantId:t.id,active:true,stock:{gt:0},...(search?{OR:[{name:{contains:search}},{category:{contains:search}}]}:{})};
   const items=await this.db.product.findMany({where,select:{id:true,name:true,category:true,baseUnit:true,packUnit:true,packFactor:true,stock:true,price:true},orderBy:[{name:'asc'},{id:'asc'}],take:limit+1,...(cursor?{cursor:{id:cursor},skip:1}:{})});
   const hasMore=items.length>limit;const result=items.slice(0,limit);return {items:result,nextCursor:hasMore?result[result.length-1].id:null};
 }
 @Throttle({default:{limit:10,ttl:60000}})@Post('stores/:slug/orders')async place(@Param('slug')slug:string,@Body()dto:StoreOrderDto){const t=await this.db.tenant.findUnique({where:{slug}});if(!t)throw new BadRequestException('Toko tidak tersedia');checkOperational(t);const map=new Map<string,number>();for(const item of dto.items)map.set(item.productId,(map.get(item.productId)||0)+item.qty);
   if(map.size>30)throw new BadRequestException('Terlalu banyak jenis produk');
   if([...map.values()].some(qty=>!Number.isSafeInteger(qty)||qty>1000))throw new BadRequestException('Qty total per produk maksimal 1000');
   const existing=dto.requestId?await this.db.storeOrder.findUnique({where:{tenantId_requestId:{tenantId:t.id,requestId:dto.requestId}},select:{id:true,total:true,status:true}}):null;
   if(existing)return existing;
   try{return await this.db.$transaction(async tx=>{let total=0;const lines=[];
      for(const [productId,qty] of map){const p=await tx.product.findFirst({where:{id:productId,tenantId:t.id,active:true}});if(!p||qty>p.stock)throw new ConflictException('Ada produk yang stoknya tidak mencukupi');
        const subtotal=p.price*qty;if(!Number.isSafeInteger(subtotal)||total+subtotal>2147483647)throw new BadRequestException('Total tidak valid');total+=subtotal;lines.push({productId,qty,unitPrice:p.price,subtotal});}
      const order=await tx.storeOrder.create({data:{tenantId:t.id,requestId:dto.requestId||null,customer:dto.customer.trim(),phone:dto.phone.trim(),note:dto.note?.trim(),total,items:{create:lines}},select:{id:true,total:true,status:true}});
      return order;
   });}catch(e:any){
     if(dto.requestId&&(e?.code==='P2002'||e?.code==='P2034')){
       const prior=await this.db.storeOrder.findUnique({where:{tenantId_requestId:{tenantId:t.id,requestId:dto.requestId}},select:{id:true,total:true,status:true}});
       if(prior)return prior;
       if(e?.code==='P2034')throw new ConflictException('Pesanan sedang diproses. Ulangi menggunakan ID yang sama.');
     }
     throw e;
   }
 }
 @UseGuards(SessionGuard)@Get('orders')async list(@Req()req:AuthRequest){if(!req.identity?.tid)throw new ForbiddenException();return this.db.storeOrder.findMany({where:{tenantId:req.identity.tid},include:{items:{include:{product:{select:{name:true}}}}},take:100,orderBy:{createdAt:'desc'}});}
 @UseGuards(SessionGuard)@Post('orders/:id/confirm')async confirm(@Req()req:AuthRequest,@Param('id')id:string){const tenantId=req.identity?.tid;if(!tenantId)throw new ForbiddenException();const tenant=await this.db.tenant.findUniqueOrThrow({where:{id:tenantId}});checkOperational(tenant);
   return this.db.$transaction(async tx=>{
     const o=await tx.storeOrder.findFirst({where:{id,tenantId},include:{items:true}});if(!o)throw new BadRequestException('Pesanan tidak ditemukan');if(o.status!=='PENDING')throw new ConflictException('Pesanan sudah diproses');
     const locked=await tx.storeOrder.updateMany({where:{id,tenantId,status:'PENDING'},data:{status:'CONFIRMED'}});if(!locked.count)throw new ConflictException('Pesanan sudah diproses');
     for(const l of o.items){const p=await tx.product.updateMany({where:{id:l.productId,tenantId,stock:{gte:l.qty}},data:{stock:{decrement:l.qty}}});if(p.count!==1)throw new ConflictException('Stok tidak cukup untuk konfirmasi pesanan');}
     // Pesanan Web Toko sudah diproses; buku penjualan perlu rekonsiliasi pembayaran tersendiri.
     return {id,status:'CONFIRMED'};
   },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
 }
 @UseGuards(SessionGuard)@Post('orders/:id/reject')async reject(@Req()req:AuthRequest,@Param('id')id:string){const tenantId=req.identity?.tid;if(!tenantId)throw new ForbiddenException();const result=await this.db.storeOrder.updateMany({where:{id,tenantId,status:'PENDING'},data:{status:'REJECTED'}});if(!result.count)throw new ConflictException('Pesanan tidak ditemukan atau sudah diproses');return {id,status:'REJECTED'};}
}
