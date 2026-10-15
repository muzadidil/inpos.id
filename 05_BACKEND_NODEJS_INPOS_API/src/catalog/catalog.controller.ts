import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionGuard, AuthRequest, Roles } from '../auth/auth.guard';
import { ProductDto } from './catalog.dto';
import { checkOperational } from '../common/helpers';
@Controller('products') @UseGuards(SessionGuard)
export class CatalogController {
 constructor(private db:PrismaService){}
 private async tenant(req:AuthRequest){if(!req.identity?.tid)throw new ForbiddenException();const t=await this.db.tenant.findUnique({where:{id:req.identity.tid}});if(!t)throw new ForbiddenException();return t;}
 // Legacy list remains an array for older frontend deployments. Search mode is paginated.
 @Get()async list(@Req()req:AuthRequest,@Query('q')q?:string,@Query('cursor')cursor?:string,@Query('limit')rawLimit?:string){
   const t=await this.tenant(req);
   if(q===undefined && cursor===undefined && rawLimit===undefined)
     return this.db.product.findMany({where:{tenantId:t.id},orderBy:[{name:'asc'},{id:'asc'}],take:500});
   if(q!==undefined && (typeof q!=='string'||q.length>100))throw new BadRequestException('Pencarian maksimal 100 karakter');
   if(cursor!==undefined&&(typeof cursor!=='string'||cursor.length>90))throw new BadRequestException('Cursor tidak valid');
   const limit=rawLimit===undefined?60:Number(rawLimit);
   if(!Number.isInteger(limit)||limit<1||limit>100)throw new BadRequestException('Limit harus 1–100');
   const search=q?.trim();
   const where={tenantId:t.id,...(search?{OR:[{name:{contains:search}},{sku:{contains:search}},{category:{contains:search}}]}:{})};
   const rows=await this.db.product.findMany({where,orderBy:[{name:'asc'},{id:'asc'}],take:limit+1,...(cursor?{cursor:{id:cursor},skip:1}:{})});
   const hasMore=rows.length>limit;const items=rows.slice(0,limit);
   return {items,nextCursor:hasMore?items[items.length-1].id:null};
 }

 @Post()@Roles('OWNER','EMPLOYEE')async create(@Req()req:AuthRequest,@Body()p:ProductDto){const t=await this.tenant(req);checkOperational(t);
   if((p.packUnit&&!p.packFactor)||(p.packFactor&&p.packFactor>1&&!p.packUnit))throw new BadRequestException('Satuan kemasan dan isi harus lengkap');
   try{return await this.db.product.create({data:{tenantId:t.id,name:p.name.trim(),sku:p.sku.trim(),category:p.category?.trim()||'Umum',baseUnit:p.baseUnit?.trim()||'pcs',packUnit:p.packUnit?.trim()||null,packFactor:p.packFactor||1,price:p.price,cost:p.cost||0,stock:p.stock||0,minStock:p.minStock||0,active:p.active!==false}})}catch(e:any){if(e?.code==='P2002')throw new ConflictException('SKU sudah dipakai toko ini');throw e;}
 }
 @Patch(':id')@Roles('OWNER')async edit(@Req()req:AuthRequest,@Param('id')id:string,@Body()p:ProductDto){const t=await this.tenant(req);checkOperational(t);
   const exists=await this.db.product.findFirst({where:{id,tenantId:t.id}});if(!exists)throw new BadRequestException('Produk tidak ditemukan');
   if((p.packUnit&&!p.packFactor)||(p.packFactor&&p.packFactor>1&&!p.packUnit))throw new BadRequestException('Satuan kemasan dan isi harus lengkap');
   if(exists.baseUnit!==(p.baseUnit?.trim()||'pcs')&&exists.stock!==0)throw new ConflictException('Satuan dasar produk dengan stok tidak boleh diubah; sesuaikan stok secara terkontrol terlebih dahulu');
   // Stok harus diubah melalui transaksi / opname, bukan melalui edit produk.
   try{return await this.db.product.update({where:{id},data:{name:p.name.trim(),sku:p.sku.trim(),category:p.category?.trim()||'Umum',baseUnit:p.baseUnit?.trim()||'pcs',packUnit:p.packUnit?.trim()||null,packFactor:p.packFactor||1,price:p.price,cost:p.cost||0,minStock:p.minStock||0,active:p.active!==false}})}catch(e:any){if(e?.code==='P2002')throw new ConflictException('SKU sudah dipakai');throw e;}
 }
}
