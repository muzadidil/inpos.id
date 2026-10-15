import { IsArray, IsInt, IsString, Length, Min, Max, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class TxLineDto {
 @IsString() productId!:string;
 @IsInt() @Min(1) @Max(100000) qty!:number;
}
export class TransactionDto {
 @IsString() @Length(8,90) requestId!:string;
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>TxLineDto) lines!:TxLineDto[];
}
