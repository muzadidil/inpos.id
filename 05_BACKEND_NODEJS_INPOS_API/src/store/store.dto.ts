import { IsArray, IsInt, IsOptional, IsString, Length, Max, Min, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
class OrderItemDto { @IsString() productId!:string;@IsInt() @Min(1) @Max(1000) qty!:number; }
export class StoreOrderDto {
 @IsOptional() @IsString() @Length(8,90) requestId?:string;
 @IsString() @Length(2,130) customer!:string;
 @IsString() @Length(8,25) phone!:string;
 @IsOptional() @IsString() @Length(0,400) note?:string;
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @ValidateNested({each:true}) @Type(()=>OrderItemDto) items!:OrderItemDto[];
}
