import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { TransactionsModule } from './transactions/transactions.module';
import { StoreModule } from './store/store.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
@Module({controllers:[HealthController],imports:[PrismaModule,ThrottlerModule.forRoot([{ttl:60000,limit:120}]),AuthModule,CatalogModule,TransactionsModule,StoreModule,AdminModule],providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}]})
export class AppModule{}
