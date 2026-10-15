import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { AuthModule } from '../auth/auth.module';
@Module({imports:[AuthModule],controllers:[StoreController],})export class StoreModule{}
