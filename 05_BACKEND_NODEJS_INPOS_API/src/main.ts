import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
async function bootstrap(){
 if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32||/^(CHANGE_|REPLACE_)/.test(process.env.JWT_SECRET)||!process.env.CSRF_SECRET||process.env.CSRF_SECRET.length<32||/^(CHANGE_|REPLACE_)/.test(process.env.CSRF_SECRET)||!process.env.REGISTRATION_REFERRAL_CODE||/^(CHANGE_|REPLACE_)/.test(process.env.REGISTRATION_REFERRAL_CODE))throw new Error('Ganti semua secret JWT/CSRF/Referral di .env sebelum server dijalankan');
 const app=await NestFactory.create(AppModule,{bodyParser:true});
 app.use(helmet());app.use(cookieParser());
 app.setGlobalPrefix('v1');
 const origins=['https://inpos.id','https://www.inpos.id','https://app.inpos.id','https://adms.inpos.id'];
 const allowed=(origin:string)=>origins.includes(origin)||/^https:\/\/(?!api\.|app\.|adms\.|www\.|shop\.)[a-z0-9-]+\.inpos\.id$/.test(origin)||(process.env.NODE_ENV!=='production'&&/^http:\/\/localhost:\d+$/.test(origin));
 app.enableCors({origin:(origin,cb)=>cb(null,!origin||allowed(origin)),credentials:true,methods:['GET','POST','PATCH','DELETE','OPTIONS'],allowedHeaders:['Content-Type','X-INPOS-CSRF']});
 app.use((req:any,res:any,next:any)=>{const origin=req.headers.origin;
   if(origin&&!allowed(origin))return res.status(403).json({message:'Origin tidak diizinkan'});
   next();
 });
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true,transformOptions:{enableImplicitConversion:false}}));
 await app.listen(Number(process.env.PORT)||3000,'0.0.0.0');
 console.log('INPOS API ready on port '+(process.env.PORT||3000));
}
bootstrap().catch(err=>{console.error(err);process.exit(1)});
