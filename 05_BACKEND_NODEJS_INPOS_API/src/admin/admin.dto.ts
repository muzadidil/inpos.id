import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, Min, IsUrl } from 'class-validator';
import { InvoiceType } from '@prisma/client';
export class InvoiceDto { @IsEnum(InvoiceType) type!:InvoiceType;@IsInt() @Min(1) @Max(24) months!:number; }
export class SettingsDto {
  @IsInt() @Min(0) @Max(2000000000) subscriptionPrice!:number;
  @IsInt() @Min(0) @Max(2000000000) taxLicensePrice!:number;
  @IsInt() @Min(1) @Max(365) trialDays!:number;
  @IsOptional() @IsString() @Length(0,500) qrisImageUrl?:string;
}
export class SuspendedDto { @IsBoolean() suspended!:boolean; }
export class EmployeeDto {
  @IsString() @Matches(/^[a-zA-Z0-9_.-]{3,80}$/) username!:string;
  @IsString() @Length(3,130) displayName!:string;
  @IsString() @Matches(/^\d{6}$/, { message: 'PIN wajib 6 digit' }) password!:string;
}
