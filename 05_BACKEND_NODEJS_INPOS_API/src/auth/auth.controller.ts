import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto, LoginDto, RegisterDto, ChangePinDto } from './auth.dto';
import { SessionGuard, AuthRequest } from './auth.guard';
@Controller('auth')
export class AuthController {
 constructor(private auth:AuthService,private db:PrismaService){}
 private setCookie(res:Response,jwt:string){res.cookie('inpos_session',jwt,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:12*3600*1000});}
 private publicUser(u:any){return {id:u.id,displayName:u.displayName,username:u.username,role:u.role,tenantId:u.tenantId,mustChangePin:u.mustChangePin};}
 @Throttle({default:{limit:5,ttl:60000}})@Post('register')async register(@Body() dto:RegisterDto,@Res({passthrough:true})res:Response){const {user,tenant}=await this.auth.register(dto);const session=await this.auth.issueSession(user);this.setCookie(res,session.jwt);return {user:this.publicUser(user),tenant:{id:tenant.id,name:tenant.name,slug:tenant.slug,status:tenant.status},csrf:session.csrf};}
 @Throttle({default:{limit:5,ttl:60000}})@Post('login')async login(@Body()dto:LoginDto,@Res({passthrough:true})res:Response){const {user,tenant}=await this.auth.login(dto.username,dto.password,dto.tenantSlug);const s=await this.auth.issueSession(user);this.setCookie(res,s.jwt);return {user:this.publicUser(user),tenant,csrf:s.csrf};}
 @Throttle({default:{limit:5,ttl:60000}})@Post('admin/login')async adminLogin(@Body()dto:AdminLoginDto,@Res({passthrough:true})res:Response){const {user}=await this.auth.login(dto.username,dto.password,'',true);const s=await this.auth.issueSession(user);this.setCookie(res,s.jwt);return {user:this.publicUser(user),csrf:s.csrf};}
 @UseGuards(SessionGuard)@Get('me')async me(@Req()req:AuthRequest){const u=await this.db.user.findUniqueOrThrow({where:{id:req.identity!.uid},select:{id:true,displayName:true,username:true,role:true,tenantId:true,mustChangePin:true}});const tenant=u.tenantId?await this.db.tenant.findUnique({where:{id:u.tenantId},select:{id:true,name:true,slug:true,status:true,trialEndsAt:true,subscriptionEndsAt:true,taxActiveUntil:true}}):null;return {user:u,tenant,csrf:this.auth.csrf(req.cookies.inpos_session)};}
 @UseGuards(SessionGuard)@Post('change-pin')async changePin(@Req()req:AuthRequest,@Body()dto:ChangePinDto,@Res({passthrough:true})res:Response){
   const {user}=await this.auth.changePin(req.identity!.uid,dto.currentPin,dto.newPin);
   const session=await this.auth.issueSession(user);this.setCookie(res,session.jwt);
   return {ok:true,mustChangePin:false,csrf:session.csrf};
 }
 @UseGuards(SessionGuard)@Post('logout')logout(@Res({passthrough:true})res:Response){res.clearCookie('inpos_session',{path:'/',sameSite:'lax',secure:process.env.NODE_ENV==='production'});return {ok:true};}
}
