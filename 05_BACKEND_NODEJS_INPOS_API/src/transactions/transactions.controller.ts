import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionGuard, AuthRequest } from '../auth/auth.guard';
import { TransactionDto } from './transactions.dto';
import { checkOperational } from '../common/helpers';
import { Prisma } from '@prisma/client';
@Controller('transactions')@UseGuards(SessionGuard)
export class TransactionsController {
 constructor(private db:PrismaService){}
 private async check(req:AuthRequest){if(!req.identity?.tid)throw new ForbiddenException();const t=await this.db.tenant.findUnique({where:{id:req.identity.tid}});if(!t)throw new ForbiddenException();checkOperational(t);return t.id;}
 private normalize(lines:TransactionDto['lines']){
   const map=new Map<string,number>();for(const l of lines){map.set(l.productId,(map.get(l.productId)||0)+l.qty)}
   if(map.size>100)throw new BadRequestException('Maksimal 100 produk per transaksi');
   if([...map.values()].some(q=>q>100000))throw new BadRequestException('Qty terlalu besar');
   return [...map].map(([productId,qty])=>({productId,qty}));
 }
 @Post('sales')async sale(@Req()req:AuthRequest,@Body()body:TransactionDto){const tenantId=await this.check(req),items=this.normalize(body.lines);
   const prior=await this.db.sale.findUnique({where:{tenantId_requestId:{tenantId,requestId:body.requestId}},include:{lines:true}});if(prior)return prior;
   try{return await this.db.$transaction(async tx=>{
     let total=0;const lines=[];
     for(const l of items){const p=await tx.product.findFirst({where:{tenantId,id:l.productId,active:true}});
       if(!p)throw new BadRequestException('Produk tidak ditemukan / nonaktif');
       const result=await tx.product.updateMany({where:{id:p.id,tenantId,active:true,stock:{gte:l.qty}},data:{stock:{decrement:l.qty}}});
       if(result.count!==1)throw new ConflictException('Stok '+p.name+' tidak mencukupi');
       const subtotal=p.price*l.qty;if(!Number.isSafeInteger(subtotal)||total+subtotal>2147483647)throw new BadRequestException('Total terlalu besar');
       total+=subtotal;lines.push({productId:p.id,qty:l.qty,unitPrice:p.price,subtotal});
     }
     return tx.sale.create({data:{tenantId,requestId:body.requestId,total,lines:{create:lines}},include:{lines:true}});
   },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
   }catch(e:any){if(e?.code==='P2002'||e?.code==='P2034'){const existing=await this.db.sale.findUnique({where:{tenantId_requestId:{tenantId,requestId:body.requestId}},include:{lines:true}});if(existing)return existing;throw new ConflictException('Terjadi transaksi bersamaan. Coba lagi dengan ID yang sama.')}throw e;}
 }
 @Post('purchases')async purchase(@Req()req:AuthRequest,@Body()body:TransactionDto){const tenantId=await this.check(req),items=this.normalize(body.lines);
   const prior=await this.db.purchase.findUnique({where:{tenantId_requestId:{tenantId,requestId:body.requestId}},include:{lines:true}});if(prior)return prior;
   try{return await this.db.$transaction(async tx=>{
     let total=0;const lines=[];
     for(const l of items){const p=await tx.product.findFirst({where:{tenantId,id:l.productId}});if(!p)throw new BadRequestException('Produk tidak ditemukan');
       const subtotal=p.cost*l.qty;if(!Number.isSafeInteger(subtotal)||total+subtotal>2147483647)throw new BadRequestException('Total terlalu besar');
       total+=subtotal;const updated=await tx.product.updateMany({where:{id:p.id,tenantId,stock:{lte:2147483647-l.qty}},data:{stock:{increment:l.qty}}});
       if(updated.count!==1)throw new ConflictException('Stok '+p.name+' melebihi batas database');
       lines.push({productId:p.id,qty:l.qty,unitCost:p.cost,subtotal});
     }
     return tx.purchase.create({data:{tenantId,requestId:body.requestId,total,lines:{create:lines}},include:{lines:true}});
   },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
   }catch(e:any){if(e?.code==='P2002'||e?.code==='P2034'){const existing=await this.db.purchase.findUnique({where:{tenantId_requestId:{tenantId,requestId:body.requestId}},include:{lines:true}});if(existing)return existing;throw new ConflictException('Transaksi sedang diproses. Silakan coba lagi.')}throw e;}
 }
 @Get('summary')async summary(@Req()req:AuthRequest){
   const tenantId=await this.check(req);
   const [sale,purchase]=await Promise.all([this.db.sale.aggregate({where:{tenantId},_count:{_all:true},_sum:{total:true}}),this.db.purchase.aggregate({where:{tenantId},_count:{_all:true},_sum:{total:true}})]);
   return {sales:{count:sale._count._all,total:sale._sum.total??0},purchases:{count:purchase._count._all,total:purchase._sum.total??0}};
 }
 @Get('sales')async sales(@Req()req:AuthRequest){const tenantId=await this.check(req);return this.db.sale.findMany({where:{tenantId},include:{lines:{include:{product:{select:{name:true,baseUnit:true}}}}},orderBy:{createdAt:'desc'},take:50});}
 @Get('purchases')async purchases(@Req()req:AuthRequest){const tenantId=await this.check(req);return this.db.purchase.findMany({where:{tenantId},include:{lines:true},orderBy:{createdAt:'desc'},take:50});}
}
