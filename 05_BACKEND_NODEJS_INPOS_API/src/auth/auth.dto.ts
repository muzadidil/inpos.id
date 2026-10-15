import { IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';
export class RegisterDto {
  @IsString() @Length(4,80) referralCode!: string;
  @IsString() @Length(3,130) storeName!: string;
  @IsString() @Length(3,130) ownerName!: string;
  @IsString() @Matches(/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/,{message:'Subdomain harus 3–60 karakter, dimulai dan diakhiri huruf/angka'}) slug!: string;
  @IsString() @Matches(/^[a-zA-Z0-9_.-]{3,80}$/,{message:'Username hanya huruf, angka, titik, garis bawah, atau strip'}) username!: string;
  @IsString() @Matches(/^\d{6}$/, { message: 'PIN wajib 6 digit' }) password!: string;
  @IsOptional() @IsString() @Length(0,255) address?:string;
  @IsOptional() @IsString() @Length(0,25) whatsapp?:string;
}
export class LoginDto {
  @IsString() @Length(2,80) username!: string;
  @IsString() @Length(1,60) tenantSlug!: string;
  @IsString() @Matches(/^\d{6}$/,{message:'PIN harus 6 digit'}) password!: string;
}
export class AdminLoginDto {
  @IsString() username!: string;
  @IsString() @Matches(/^\d{6}$/,{message:'PIN harus 6 digit'}) password!: string;
}

export class ChangePinDto {
  @IsString() @Matches(/^\d{6}$/, { message: 'PIN lama harus 6 digit' }) currentPin!:string;
  @IsString() @Matches(/^\d{6}$/, { message: 'PIN baru harus 6 digit' }) newPin!:string;
}
