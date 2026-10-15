import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, Session } from './auth.service';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
export type AuthRequest=Request & {identity?:Session};
export const Roles=(...roles:UserRole[])=>SetMetadata('roles',roles);
@Injectable()
export class SessionGuard implements CanActivate {
 constructor(private readonly auth:AuthService,private readonly prisma:PrismaService,private readonly reflector:Reflector){}
 async canActivate(ctx:ExecutionContext){const req=ctx.switchToHttp().getRequest<AuthRequest>();
   const token=req.cookies?.inpos_session as string|undefined;
   if(!token)throw new UnauthorizedException('Silakan login');
   const claims=await this.auth.verify(token);
   const u=await this.prisma.user.findUnique({where:{id:claims.uid}});
   if(!u||!u.active||u.tenantId!==claims.tid||u.role!==claims.role)throw new UnauthorizedException('Sesi tidak valid');
   this.auth.verifyPasswordVersion(u.passwordHash,claims.pv);
   if(u.mustChangePin && !['/auth/change-pin','/auth/logout','/auth/me'].some(path=>req.path.endsWith(path))) throw new ForbiddenException('Wajib ubah PIN awal sebelum menggunakan aplikasi');
   const allowed=this.reflector.getAllAndOverride<UserRole[]>('roles',[ctx.getHandler(),ctx.getClass()]);
   if(allowed?.length&&!allowed.includes(u.role))throw new ForbiddenException('Anda tidak memiliki akses');
   if(!['GET','HEAD','OPTIONS'].includes(req.method.toUpperCase()))this.auth.verifyCsrf(token,req.headers['x-inpos-csrf']);
   req.identity=claims;return true;
 }
}
