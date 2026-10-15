import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionGuard } from './auth.guard';
@Module({imports:[JwtModule.register({secret:process.env.JWT_SECRET||'MISSING_SECRET'})],controllers:[AuthController],providers:[AuthService,SessionGuard],exports:[AuthService,SessionGuard]})
export class AuthModule{}
