import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
export class ProductDto {
 @IsString() @Length(2,150) name!:string;
 @IsString() @Length(1,80) sku!:string;
 @IsOptional() @IsString() @Length(1,80) category?:string;
 @IsOptional() @IsString() @Length(1,32) baseUnit?:string;
 @IsOptional() @IsString() @Length(1,32) packUnit?:string;
 @IsOptional() @IsInt() @Min(1) @Max(100000) packFactor?:number;
 @IsInt() @Min(0) @Max(2147483647) price!:number;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) cost?:number;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) stock?:number;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) minStock?:number;
 @IsOptional() @IsBoolean() active?:boolean;
}
